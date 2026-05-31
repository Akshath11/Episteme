import { useGraphStore } from '../store/useGraphStore'

export function ParkedShelf() {
  const { nodes, edges, setFocus, updateNode, removeNode } = useGraphStore()
  const parked = nodes.filter(n => n.status === 'parked')

  if (!parked.length) return null

  return (
    <div className="p-4">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Parked 🅿</p>
      {parked.map(n => {
        const incomingEdge = edges.find(e => e.to === n.id)
        return (
          <div key={n.id} className="border border-orange-200 bg-orange-50 rounded-lg p-2 mb-2">
            <p className="text-sm font-medium text-orange-800">{n.name}</p>
            {incomingEdge && (
              <p className="text-xs text-orange-500 italic mb-1">{incomingEdge.intent}</p>
            )}
            <div className="flex gap-1 mt-1">
              <button
                onClick={() => { updateNode(n.id, { status: 'active' }); setFocus(n.id) }}
                className="text-xs bg-white border border-orange-300 rounded px-2 py-0.5 hover:bg-orange-100"
              >
                Resume
              </button>
              <button
                onClick={() => removeNode(n.id)}
                className="text-xs text-red-400 hover:text-red-600 px-1"
              >
                Remove
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
