import { useState } from 'react'
import { ExternalLink, X } from 'lucide-react'
import { useGraphStore } from '../store/useGraphStore'
import { getPathToRoot } from '../utils/graph'
import { v4 as uuid } from 'uuid'

export function NodeDetailPanel() {
  const { nodes, edges, selectedNodeId, setSelected, updateNode, setFocus } = useGraphStore()
  const [newLinkTitle, setNewLinkTitle] = useState('')
  const [newLinkUrl, setNewLinkUrl] = useState('')

  if (!selectedNodeId) return null
  const node = nodes.find(n => n.id === selectedNodeId)
  if (!node) return null

  const path = getPathToRoot(node.id, nodes, edges)
  const children = edges
    .filter(e => e.from === node.id)
    .map(e => ({ edge: e, node: nodes.find(n => n.id === e.to) }))
    .filter(c => c.node)

  const addLink = () => {
    if (!newLinkUrl) return
    updateNode(node.id, {
      links: [...node.links, { id: uuid(), title: newLinkTitle || newLinkUrl, url: newLinkUrl }],
    })
    setNewLinkTitle('')
    setNewLinkUrl('')
  }

  const statusColors: Record<string, string> = {
    active: 'bg-blue-100 text-blue-700',
    parked: 'bg-orange-100 text-orange-700',
    done: 'bg-green-100 text-green-700',
  }

  return (
    <div className="w-80 border-l border-gray-200 bg-white overflow-y-auto flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div>
          <h2 className="text-sm font-medium text-gray-900">{node.name}</h2>
          <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[node.status]}`}>
            {node.status}
          </span>
        </div>
        <button onClick={() => setSelected(null)}>
          <X size={16} className="text-gray-400" />
        </button>
      </div>

      <div className="p-4 border-b border-gray-100">
        <p className="text-xs text-gray-400 mb-1">How you got here</p>
        <div className="text-xs text-gray-600 flex flex-wrap gap-1 items-center">
          {path.map((step, i) => (
            <span key={step.node.id} className="flex items-center gap-1">
              {i > 0 && <span className="text-gray-400 italic">[{step.intent}]→</span>}
              <span className={step.node.id === node.id ? 'font-medium text-gray-900' : 'text-blue-600'}>
                {step.node.name}
              </span>
            </span>
          ))}
        </div>
      </div>

      <div className="p-4 border-b border-gray-100">
        <p className="text-xs text-gray-400 mb-1">Notes</p>
        <textarea
          value={node.notes}
          onChange={e => updateNode(node.id, { notes: e.target.value })}
          rows={3}
          placeholder="Add notes..."
          className="w-full text-sm text-gray-700 border border-gray-200 rounded-lg px-2 py-1.5 outline-none focus:border-blue-400 resize-none"
        />
      </div>

      <div className="p-4 border-b border-gray-100">
        <p className="text-xs text-gray-400 mb-2">Resources</p>
        {node.links.map(lk => (
          <a
            key={lk.id}
            href={lk.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-blue-600 hover:underline mb-1"
          >
            <ExternalLink size={11} /> {lk.title || lk.url}
          </a>
        ))}
        <div className="flex gap-1 mt-2">
          <input
            placeholder="Title"
            value={newLinkTitle}
            onChange={e => setNewLinkTitle(e.target.value)}
            className="flex-1 border border-gray-200 rounded px-2 py-1 text-xs outline-none"
          />
          <input
            placeholder="URL"
            value={newLinkUrl}
            onChange={e => setNewLinkUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addLink()}
            className="flex-1 border border-gray-200 rounded px-2 py-1 text-xs outline-none"
          />
          <button onClick={addLink} className="text-xs bg-blue-600 text-white rounded px-2 py-1">Add</button>
        </div>
      </div>

      {children.length > 0 && (
        <div className="p-4 border-b border-gray-100">
          <p className="text-xs text-gray-400 mb-2">Children</p>
          {children.map(({ edge, node: child }) => (
            <button
              key={edge.id}
              onClick={() => setFocus(child!.id)}
              className="block text-left w-full text-xs text-gray-700 hover:text-blue-600 mb-1"
            >
              → <span className="italic text-gray-400">[{edge.intent}]</span> {child!.name}
            </button>
          ))}
        </div>
      )}

      <div className="p-4 flex gap-2 flex-wrap items-center">
        <button
          onClick={() => setFocus(node.id)}
          className="text-xs bg-green-600 text-white rounded-lg px-3 py-1.5 hover:bg-green-700"
        >
          Set focus
        </button>
        <select
          value={node.status}
          onChange={e => updateNode(node.id, { status: e.target.value as 'active' | 'parked' | 'done' })}
          className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 outline-none"
        >
          <option value="active">Active</option>
          <option value="parked">Parked</option>
          <option value="done">Done</option>
        </select>
      </div>
    </div>
  )
}
