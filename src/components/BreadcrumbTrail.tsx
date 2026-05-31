import { useGraphStore } from '../store/useGraphStore'
import { getPathToRoot } from '../utils/graph'

export function BreadcrumbTrail() {
  const { nodes, edges, focusId, setFocus } = useGraphStore()

  if (!focusId) return (
    <div className="px-4 py-2 text-xs text-gray-400 border-b border-gray-100 bg-white">
      No focus set — double-click a node to focus
    </div>
  )

  const path = getPathToRoot(focusId, nodes, edges)

  return (
    <div className="px-4 py-2 border-b border-gray-100 bg-white flex items-center gap-1 flex-wrap text-xs">
      {path.map((step, i) => (
        <span key={step.node.id} className="flex items-center gap-1">
          {i > 0 && step.intent && (
            <span className="text-gray-400 italic mx-1">[{step.intent}]→</span>
          )}
          <button
            onClick={() => setFocus(step.node.id)}
            className={`font-medium hover:underline ${
              step.node.id === focusId ? 'text-green-700' : 'text-blue-600'
            }`}
          >
            {step.node.name}
          </button>
        </span>
      ))}
    </div>
  )
}
