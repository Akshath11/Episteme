import { useGraphStore } from '../store/useGraphStore'

export function SyncIndicator() {
  const { syncStatus } = useGraphStore()
  const colorMap: Record<string, string> = {
    saving: 'text-amber-500',
    saved: 'text-green-600',
    offline: 'text-red-500',
    idle: 'text-gray-300',
  }
  const labelMap: Record<string, string> = {
    saving: 'Saving...',
    saved: 'Saved ✓',
    offline: 'Offline',
    idle: '',
  }
  if (syncStatus === 'idle') return null
  return <span className={`text-xs ${colorMap[syncStatus]}`}>{labelMap[syncStatus]}</span>
}
