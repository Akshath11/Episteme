import type { KPNode, KPEdge } from '../types'

export const DRIFT_THRESHOLD = 3

export function getAncestors(nodeId: string, edges: KPEdge[]): string[] {
  const visited = new Set<string>()
  let frontier = [nodeId]
  const result: string[] = [nodeId]
  while (frontier.length) {
    const next: string[] = []
    for (const nid of frontier) {
      if (visited.has(nid)) continue
      visited.add(nid)
      for (const e of edges) {
        if (e.to === nid && !visited.has(e.from)) {
          next.push(e.from)
          result.push(e.from)
        }
      }
    }
    frontier = next
  }
  return result
}

export function getDepth(nodeId: string, rootId: string, edges: KPEdge[]): number {
  if (nodeId === rootId) return 0
  const visited = new Set<string>()
  let frontier = [[rootId]]
  while (frontier.length) {
    const next: string[][] = []
    for (const path of frontier) {
      const cur = path[path.length - 1]
      if (visited.has(cur)) continue
      visited.add(cur)
      for (const e of edges) {
        if (e.from === cur) {
          const newPath = [...path, e.to]
          if (e.to === nodeId) return newPath.length - 1
          next.push(newPath)
        }
      }
    }
    frontier = next
  }
  return -1
}

export function getPathToRoot(
  nodeId: string,
  nodes: KPNode[],
  edges: KPEdge[]
): { node: KPNode; intent: string }[] {
  const result: { node: KPNode; intent: string }[] = []
  let cur = nodeId
  const visited = new Set<string>()
  while (cur && !visited.has(cur)) {
    visited.add(cur)
    const node = nodes.find(n => n.id === cur)
    if (!node) break
    const parentEdge = edges.find(e => e.to === cur)
    result.unshift({ node, intent: parentEdge?.intent ?? '' })
    cur = parentEdge?.from ?? ''
  }
  return result
}

export function getDriftStart(focusHistory: string[], edges: KPEdge[]): string {
  const current = focusHistory[focusHistory.length - 1]
  for (let i = focusHistory.length - 2; i >= 0; i--) {
    const candidate = focusHistory[i]
    const ancestors = getAncestors(current, edges)
    if (ancestors.includes(candidate) || candidate === current) {
      return candidate
    }
  }
  return focusHistory[0]
}
