import { useState } from 'react'
import { Plus, Download, Upload } from 'lucide-react'
import { useGraphStore } from '../store/useGraphStore'
import { ParkedShelf } from './ParkedShelf'
import { LLMImportModal } from './LLMImportModal'
import type { ResourceLink } from '../types'
import { v4 as uuid } from 'uuid'

export function Sidebar() {
  const { addNode, exportGraph } = useGraphStore()
  const [name, setName] = useState('')
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState<'active' | 'parked' | 'done'>('active')
  const [links, setLinks] = useState<ResourceLink[]>([])
  const [showImport, setShowImport] = useState(false)

  const addLink = () => setLinks(l => [...l, { id: uuid(), title: '', url: '' }])
  const updateLink = (id: string, field: 'title' | 'url', value: string) =>
    setLinks(l => l.map(lk => lk.id === id ? { ...lk, [field]: value } : lk))
  const removeLink = (id: string) => setLinks(l => l.filter(lk => lk.id !== id))

  const handleAdd = () => {
    if (!name.trim()) return
    addNode({
      name: name.trim(),
      notes,
      status,
      links,
      position: { x: 100 + Math.random() * 400, y: 100 + Math.random() * 200 },
    })
    setName('')
    setNotes('')
    setLinks([])
    setStatus('active')
  }

  const handleExport = () => {
    const json = exportGraph()
    const blob = new Blob([json], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'graph.json'
    a.click()
  }

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        useGraphStore.getState().importGraph(reader.result as string, 'replace')
      } catch {
        alert('Invalid graph file')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="w-72 border-r border-gray-200 bg-white flex flex-col overflow-y-auto">
      <div className="p-4 border-b border-gray-100">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Add concept</p>
        <input
          placeholder="Concept name"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-2 outline-none focus:border-blue-400"
        />
        <textarea
          placeholder="Notes (optional)"
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={2}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-2 outline-none focus:border-blue-400 resize-none"
        />
        <select
          value={status}
          onChange={e => setStatus(e.target.value as 'active' | 'parked' | 'done')}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-2 outline-none"
        >
          <option value="active">Active</option>
          <option value="parked">Parked</option>
          <option value="done">Done</option>
        </select>

        <p className="text-xs text-gray-400 mb-1 mt-2">Resource links</p>
        {links.map(lk => (
          <div key={lk.id} className="flex gap-1 mb-1">
            <input
              placeholder="Title"
              value={lk.title}
              onChange={e => updateLink(lk.id, 'title', e.target.value)}
              className="flex-1 border border-gray-200 rounded px-2 py-1 text-xs outline-none"
            />
            <input
              placeholder="URL"
              value={lk.url}
              onChange={e => updateLink(lk.id, 'url', e.target.value)}
              className="flex-1 border border-gray-200 rounded px-2 py-1 text-xs outline-none"
            />
            <button onClick={() => removeLink(lk.id)} className="text-gray-400 hover:text-red-500 text-xs px-1">✕</button>
          </div>
        ))}
        <button onClick={addLink} className="text-xs text-blue-500 hover:underline mb-3">+ Add link</button>

        <button
          onClick={handleAdd}
          className="w-full bg-blue-600 text-white text-sm rounded-lg py-2 hover:bg-blue-700 flex items-center justify-center gap-1"
        >
          <Plus size={14} /> Add concept
        </button>
      </div>

      <div className="p-4 border-b border-gray-100 flex gap-2">
        <button
          onClick={() => setShowImport(true)}
          className="flex-1 text-xs border border-gray-200 rounded-lg py-2 hover:bg-gray-50"
        >
          Import from LLM
        </button>
        <button onClick={handleExport} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50" title="Export JSON">
          <Download size={14} />
        </button>
        <label className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer" title="Import JSON file">
          <Upload size={14} />
          <input type="file" accept=".json" onChange={handleFileImport} className="hidden" />
        </label>
      </div>

      <ParkedShelf />

      {showImport && <LLMImportModal onClose={() => setShowImport(false)} />}
    </div>
  )
}
