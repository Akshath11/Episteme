import { useCallback, useState } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
} from '@xyflow/react'
import type { Connection, Node, Edge } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useGraphStore } from '../store/useGraphStore'
import { EdgeIntentModal } from './EdgeIntentModal'
import { getAncestors } from '../utils/graph'

export function Canvas() {
  const {
    nodes,
    edges,
    rootId,
    focusId,
    selectedNodeId,
    addEdge: storeAddEdge,
    setFocus,
    setSelected,
    updateNode,
  } = useGraphStore()

  const [pendingConnection, setPendingConnection] = useState<Connection | null>(null)

  const getNodeColor = (id: string) => {
    const ancestors = focusId ? getAncestors(focusId, edges) : []
    if (id === rootId) return '#DBEAFE'
    if (id === focusId) return '#DCFCE7'
    if (ancestors.includes(id)) return '#FEF3C7'
    const node = nodes.find(n => n.id === id)
    if (node?.status === 'parked') return '#FFEDD5'
    if (node?.status === 'done') return '#F0FDF4'
    return '#F9FAFB'
  }

  const rfNodes: Node[] = nodes.map(n => ({
    id: n.id,
    position: n.position,
    data: { label: n.name },
    style: {
      background: getNodeColor(n.id),
      border: selectedNodeId === n.id ? '2px solid #6366F1' : '1px solid #E5E7EB',
      borderRadius: 8,
      fontSize: 13,
      padding: '8px 14px',
    },
  }))

  const rfEdges: Edge[] = edges.map(e => ({
    id: e.id,
    source: e.from,
    target: e.to,
    label: e.intent,
    labelStyle: { fontSize: 11, fill: '#6B7280' },
    style: { stroke: '#D1D5DB' },
    markerEnd: { type: 'arrowclosed' as Edge['markerEnd'] extends { type: infer T } ? T : never },
  }))

  const onConnect = useCallback((connection: Connection) => {
    setPendingConnection(connection)
  }, [])

  const onNodeClick = (_: React.MouseEvent, node: Node) => setSelected(node.id)
  const onNodeDoubleClick = (_: React.MouseEvent, node: Node) => setFocus(node.id)
  const onNodeDragStop = (_: React.MouseEvent, node: Node) => {
    updateNode(node.id, { position: node.position })
  }

  return (
    <>
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onNodeDoubleClick={onNodeDoubleClick}
        onNodeDragStop={onNodeDragStop}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>

      {pendingConnection && (
        <EdgeIntentModal
          connection={pendingConnection}
          nodes={nodes}
          onConfirm={(intent) => {
            storeAddEdge({ from: pendingConnection.source!, to: pendingConnection.target!, intent })
            setPendingConnection(null)
          }}
          onCancel={() => setPendingConnection(null)}
        />
      )}
    </>
  )
}
