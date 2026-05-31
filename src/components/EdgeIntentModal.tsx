import { useState } from 'react'
import type { Connection } from '@xyflow/react'
import type { KPNode } from '../types'

interface Props {
  connection: Connection
  nodes: KPNode[]
  onConfirm: (intent: string) => void
  onCancel: () => void
}

export function EdgeIntentModal({ connection, nodes, onConfirm, onCancel }: Props) {
  const [intent, setIntent] = useState('')
  const from = nodes.find(n => n.id === connection.source)?.name ?? connection.source
  const to = nodes.find(n => n.id === connection.target)?.name ?? connection.target

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl border border-gray-200 p-6 w-full max-w-sm shadow-lg">
        <p className="text-sm text-gray-500 mb-1">Why are you going here?</p>
        <p className="text-sm font-medium text-gray-800 mb-4">
          <span className="text-blue-600">{from}</span> → <span className="text-green-600">{to}</span>
        </p>
        <input
          autoFocus
          type="text"
          placeholder="e.g. needed to understand pod networking"
          value={intent}
          onChange={e => setIntent(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && intent && onConfirm(intent)}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-4 outline-none focus:border-blue-400"
        />
        <div className="flex gap-2">
          <button
            onClick={() => intent && onConfirm(intent)}
            disabled={!intent}
            className="flex-1 bg-blue-600 text-white text-sm rounded-lg py-2 hover:bg-blue-700 disabled:opacity-40"
          >
            Confirm
          </button>
          <button
            onClick={onCancel}
            className="flex-1 border border-gray-200 text-sm rounded-lg py-2 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
