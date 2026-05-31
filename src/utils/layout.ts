import type { KPNode, KPEdge } from '../types'

export function autoLayout(
  nodes: KPNode[],
  edges: KPEdge[],
  rootId: string
): KPNode[] {
  const levelMap = new Map<string, number>()
  const siblingMap = new Map<number, string[]>()

  const visited = new Set<string>()
  let frontier = [rootId]
  levelMap.set(rootId, 0)

  while (frontier.length) {
    const next: string[] = []
    for (const nid of frontier) {
      if (visited.has(nid)) continue
      visited.add(nid)
      const depth = levelMap.get(nid) ?? 0
      if (!siblingMap.has(depth)) siblingMap.set(depth, [])
      siblingMap.get(depth)!.push(nid)
      for (const e of edges) {
        if (e.from === nid && !visited.has(e.to)) {
          levelMap.set(e.to, depth + 1)
          next.push(e.to)
        }
      }
    }
    frontier = next
  }

  return nodes.map(node => {
    const depth = levelMap.get(node.id) ?? 0
    const siblings = siblingMap.get(depth) ?? [node.id]
    const index = siblings.indexOf(node.id)
    const totalWidth = siblings.length * 220
    const startX = (800 - totalWidth) / 2
    return {
      ...node,
      position: {
        x: startX + index * 220 + 100,
        y: depth * 160 + 80,
      },
    }
  })
}
