export interface ResourceLink {
  id: string
  title: string
  url: string
}

export interface KPNode {
  id: string
  name: string
  notes: string
  status: 'active' | 'parked' | 'done'
  links: ResourceLink[]
  position: { x: number; y: number }
}

export interface KPEdge {
  id: string
  from: string
  to: string
  intent: string
}

export interface GraphState {
  nodes: KPNode[]
  edges: KPEdge[]
  rootId: string | null
  focusId: string | null
  focusHistory: string[]
  selectedNodeId: string | null
}

export type SyncStatus = 'idle' | 'saving' | 'saved' | 'offline'
