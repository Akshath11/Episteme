import { useState } from 'react'
import { useGraphStore } from '../store/useGraphStore'

export function LLMImportModal({ onClose }: { onClose: () => void }) {
  const [json, setJson] = useState('')
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'replace' | 'merge'>('replace')
  const { importGraph } = useGraphStore()

  const handleImport = () => {
    try {
      importGraph(json, mode)
      onClose()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Unknown error')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl border border-gray-200 p-6 w-full max-w-lg shadow-lg">
        <h2 className="text-sm font-medium text-gray-900 mb-1">Import from LLM</h2>
        <p className="text-xs text-gray-400 mb-3">Paste the raw JSON output from any LLM below.</p>
        <textarea
          value={json}
          onChange={e => { setJson(e.target.value); setError('') }}
          rows={12}
          placeholder='{ "root": "...", "nodes": [...], "edges": [...] }'
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono mb-2 outline-none focus:border-blue-400 resize-none"
        />
        {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
        <div className="flex gap-2 mb-3">
          <label className="flex items-center gap-1 text-xs text-gray-600 cursor-pointer">
            <input type="radio" name="mode" value="replace" checked={mode === 'replace'} onChange={() => setMode('replace')} />
            Replace current graph
          </label>
          <label className="flex items-center gap-1 text-xs text-gray-600 cursor-pointer">
            <input type="radio" name="mode" value="merge" checked={mode === 'merge'} onChange={() => setMode('merge')} />
            Merge with current graph
          </label>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleImport}
            disabled={!json}
            className="flex-1 bg-blue-600 text-white text-sm rounded-lg py-2 hover:bg-blue-700 disabled:opacity-40"
          >
            Import
          </button>
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 text-sm rounded-lg py-2 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
