import { useGraphStore } from '../store/useGraphStore'
import { getDepth, DRIFT_THRESHOLD, getPathToRoot } from '../utils/graph'

export function DriftAlert() {
  const { nodes, edges, rootId, focusId, crawlBack, updateNode } = useGraphStore()

  if (!focusId || !rootId) return null
  const depth = getDepth(focusId, rootId, edges)
  if (depth < DRIFT_THRESHOLD) return null

  const path = getPathToRoot(focusId, nodes, edges)

  const parkAndCrawl = () => {
    updateNode(focusId, { status: 'parked' })
    crawlBack()
  }

  return (
    <div className="px-4 py-2 bg-amber-50 border-b border-amber-200 text-xs text-amber-800 flex items-center justify-between gap-4 flex-wrap">
      <div>
        <span className="font-medium">⚠ You've drifted {depth} steps from root.</span>
        <span className="ml-2 text-amber-600">
          {path.map((s, i) => (
            <span key={s.node.id}>
              {i > 0 && <span className="mx-1 italic opacity-70">[{s.intent}]→</span>}
              {s.node.name}
            </span>
          ))}
        </span>
      </div>
      <div className="flex gap-2">
        <button
          onClick={parkAndCrawl}
          className="px-3 py-1 bg-amber-100 border border-amber-300 rounded-lg hover:bg-amber-200"
        >
          Park it &amp; crawl back
        </button>
        <button
          onClick={crawlBack}
          className="px-3 py-1 bg-white border border-amber-300 rounded-lg hover:bg-amber-50"
        >
          Crawl back
        </button>
      </div>
    </div>
  )
}
