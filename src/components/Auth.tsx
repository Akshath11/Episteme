import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function Auth() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    if (!email) return
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOtp({ email })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white border border-gray-200 rounded-xl p-8 w-full max-w-sm shadow-sm">
        <h1 className="text-lg font-medium text-gray-900 mb-1">KnowledgeParadigm</h1>
        <p className="text-sm text-gray-500 mb-6">Sign in with your email — no password needed.</p>
        {sent ? (
          <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
            Check your email for the magic link.
          </p>
        ) : (
          <>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3 outline-none focus:border-blue-400"
            />
            {error && (
              <p className="text-xs text-red-500 bg-red-50 border border-red-200 rounded-lg p-2 mb-3">
                {error}
              </p>
            )}
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-blue-600 text-white text-sm rounded-lg py-2 hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send magic link'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
