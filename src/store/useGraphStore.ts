import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuid } from 'uuid'
import type { KPNode, KPEdge, GraphState, SyncStatus } from '../types'
import { getDriftStart } from '../utils/graph'
import { autoLayout } from '../utils/layout'
import { supabase } from '../lib/supabase'

interface StoreActions {
  addNode: (node: Omit<KPNode, 'id'>) => void
  updateNode: (id: string, partial: Partial<KPNode>) => void
  removeNode: (id: string) => void
  addEdge: (edge: Omit<KPEdge, 'id'>) => void
  removeEdge: (id: string) => void
  setFocus: (id: string) => void
  setSelected: (id: string | null) => void
  crawlBack: () => void
  importGraph: (json: string, mode: 'merge' | 'replace') => void
  exportGraph: () => string
  saveToCloud: (userId: string) => Promise<void>
  loadFromCloud: (userId: string) => Promise<void>
  syncStatus: SyncStatus
  setSyncStatus: (s: SyncStatus) => void
}

export const useGraphStore = create<GraphState & StoreActions>()(
  persist(
    (set, get) => ({
      nodes: [],
      edges: [],
      rootId: null,
      focusId: null,
      focusHistory: [],
      selectedNodeId: null,
      syncStatus: 'idle',

      setSyncStatus: (s) => set({ syncStatus: s }),

      addNode: (node) => {
        const id = uuid()
        const newNode: KPNode = { ...node, id }
        set(state => ({
          nodes: [...state.nodes, newNode],
          rootId: state.rootId ?? id,
          focusId: state.focusId ?? id,
          focusHistory: state.focusHistory.length === 0 ? [id] : state.focusHistory,
        }))
      },

      updateNode: (id, partial) =>
        set(state => ({
          nodes: state.nodes.map(n => n.id === id ? { ...n, ...partial } : n),
        })),

      removeNode: (id) =>
        set(state => ({
          nodes: state.nodes.filter(n => n.id !== id),
          edges: state.edges.filter(e => e.from !== id && e.to !== id),
          selectedNodeId: state.selectedNodeId === id ? null : state.selectedNodeId,
          focusId: state.focusId === id ? state.rootId : state.focusId,
        })),

      addEdge: (edge) => {
        const id = `edge-${edge.from}-${edge.to}`
        set(state => ({
          edges: [...state.edges, { ...edge, id }],
        }))
      },

      removeEdge: (id) =>
        set(state => ({ edges: state.edges.filter(e => e.id !== id) })),

      setFocus: (id) =>
        set(state => ({
          focusId: id,
          focusHistory: [...state.focusHistory, id],
          selectedNodeId: id,
        })),

      setSelected: (id) => set({ selectedNodeId: id }),

      crawlBack: () => {
        const { focusHistory, edges, setFocus } = get()
        if (focusHistory.length <= 1) return
        const driftStart = getDriftStart(focusHistory, edges)
        set({ focusHistory: focusHistory.slice(0, focusHistory.indexOf(driftStart) + 1) })
        setFocus(driftStart)
      },

      importGraph: (json, mode) => {
        try {
          const parsed = JSON.parse(json) as { root: string; nodes: KPNode[]; edges: KPEdge[] }
          const { root, nodes, edges } = parsed
          const laidOut = autoLayout(
            nodes.map((n) => ({ ...n, position: n.position ?? { x: 0, y: 0 } })),
            edges,
            root
          )
          if (mode === 'replace') {
            set({
              nodes: laidOut,
              edges,
              rootId: root,
              focusId: root,
              focusHistory: [root],
              selectedNodeId: null,
            })
          } else {
            set(state => ({
              nodes: [...state.nodes, ...laidOut],
              edges: [...state.edges, ...edges],
              rootId: state.rootId ?? root,
            }))
          }
        } catch {
          throw new Error('Invalid JSON — check the format and try again')
        }
      },

      exportGraph: () => {
        const { nodes, edges, rootId } = get()
        return JSON.stringify({ root: rootId, nodes, edges }, null, 2)
      },

      saveToCloud: async (userId) => {
        const { nodes, edges, rootId, focusId, focusHistory } = get()
        set({ syncStatus: 'saving' })
        const { error } = await supabase.from('graphs').upsert({
          user_id: userId,
          data: { nodes, edges, rootId, focusId, focusHistory },
        }, { onConflict: 'user_id' })
        set({ syncStatus: error ? 'offline' : 'saved' })
        setTimeout(() => set({ syncStatus: 'idle' }), 2000)
      },

      loadFromCloud: async (userId) => {
        const { data, error } = await supabase
          .from('graphs')
          .select('data')
          .eq('user_id', userId)
          .single()
        if (!error && data?.data) {
          const g = data.data as { nodes: KPNode[]; edges: KPEdge[]; rootId: string; focusId: string; focusHistory: string[] }
          set({
            nodes: g.nodes ?? [],
            edges: g.edges ?? [],
            rootId: g.rootId ?? null,
            focusId: g.focusId ?? null,
            focusHistory: g.focusHistory ?? [],
          })
        }
      },
    }),
    { name: 'knowledge-paradigm-graph' }
  )
)
