import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './lib/supabase'
import { Auth } from './components/Auth'
import { Canvas } from './components/Canvas'
import { Sidebar } from './components/Sidebar'
import { BreadcrumbTrail } from './components/BreadcrumbTrail'
import { DriftAlert } from './components/DriftAlert'
import { NodeDetailPanel } from './components/NodeDetailPanel'
import { SyncIndicator } from './components/SyncIndicator'
import { useGraphStore } from './store/useGraphStore'

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const { loadFromCloud, saveToCloud, nodes, edges, focusId } = useGraphStore()

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
      if (data.session) loadFromCloud(data.session.user.id)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) loadFromCloud(session.user.id)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) return
    const timer = setTimeout(() => saveToCloud(session.user.id), 2000)
    return () => clearTimeout(timer)
  }, [nodes, edges, focusId, session])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-gray-400">
        Loading...
      </div>
    )
  }

  if (!session) return <Auth />

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white">
        <span className="text-sm font-medium text-gray-800">KnowledgeParadigm</span>
        <div className="flex items-center gap-4">
          <SyncIndicator />
          <span className="text-xs text-gray-400">{session.user.email}</span>
          <button
            onClick={() => supabase.auth.signOut()}
            className="text-xs text-gray-400 hover:text-gray-700"
          >
            Sign out
          </button>
        </div>
      </div>

      <BreadcrumbTrail />
      <DriftAlert />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 relative">
          <Canvas />
        </div>
        <NodeDetailPanel />
      </div>
    </div>
  )
}
