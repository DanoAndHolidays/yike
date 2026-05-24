/**
 * Mock Tree Data Generator — 支持全量生成与懒加载两种模式
 *
 * 层级分布:
 *   Level 0:    100 个根节点
 *   Level 1:    300 个节点 (每父约 3 子)
 *   Level 2:    900 个节点
 *   Level 3:  2,700 个节点
 *   Level 4:  8,100 个节点
 *   Level 5: 24,300 个节点
 *   Level 6: 63,600 个节点 (叶子节点)
 *   ─────────────────────
 *   总计:   100,000 个节点
 */

export interface TreeNode {
  id: string
  parentId: string | null
  childrenIds: string[]
  label: string
  hasChildren: boolean
  /** 子节点是否已从"后端"加载 */
  childrenLoaded: boolean
  /** 节点所在层级 */
  level: number
  /** 直接子节点总数（用于 badge 展示，加载前即可知） */
  totalChildrenCount: number
}

export interface TreeData {
  nodeMap: Map<string, TreeNode>
  rootIds: string[]
  totalCount: number
}

export interface LazyTreeAPI {
  treeData: TreeData
  loadChildren: (parentId: string) => Promise<TreeNode[]>
}

/** 每层的目标节点数 */
const LEVEL_CONFIG = [100, 300, 900, 2700, 8100, 24300, 63600]

/** 每层对应的显示名称前缀 */
const LEVEL_PREFIX = ['集团', '事业部', '部门', '中心', '团队', '小组', '成员']

/** 每层起始全局索引（累积和） */
const CUM_START: number[] = (() => {
  const arr = [0]
  for (let i = 0; i < LEVEL_CONFIG.length; i++) {
    arr.push(arr[i] + LEVEL_CONFIG[i])
  }
  return arr
})()

const TOTAL_NODES = CUM_START[CUM_START.length - 1]

function generateLabel(level: number, indexInLevel: number): string {
  const prefix = LEVEL_PREFIX[level] ?? `L${level}`
  return `${prefix}-${String(indexInLevel + 1).padStart(4, '0')}`
}

// ══════════════════════════════════════════════════════
//  全量生成模式（原有逻辑，保留兼容）
// ══════════════════════════════════════════════════════

export function generateMockTreeData(): TreeData {
  const nodeMap = new Map<string, TreeNode>()
  const rootIds: string[] = []

  const levelNodeIds: string[][] = []
  let globalIndex = 0

  for (let level = 0; level < LEVEL_CONFIG.length; level++) {
    const count = LEVEL_CONFIG[level]
    const ids: string[] = []
    const isLeaf = level === LEVEL_CONFIG.length - 1

    for (let i = 0; i < count; i++) {
      const id = `node_${globalIndex}`
      globalIndex++

      const node: TreeNode = {
        id,
        parentId: null,
        childrenIds: [],
        label: generateLabel(level, i),
        hasChildren: !isLeaf,
        childrenLoaded: false,
        level,
        totalChildrenCount: 0,
      }

      nodeMap.set(id, node)
      ids.push(id)
    }

    levelNodeIds.push(ids)
  }

  for (const id of levelNodeIds[0]) {
    rootIds.push(id)
  }

  for (let level = 0; level < LEVEL_CONFIG.length - 1; level++) {
    const parents = levelNodeIds[level]
    const children = levelNodeIds[level + 1]
    const childrenPerParent = Math.ceil(children.length / parents.length)

    for (let p = 0; p < parents.length; p++) {
      const parentNode = nodeMap.get(parents[p])!
      const startIdx = p * childrenPerParent
      const endIdx = Math.min(startIdx + childrenPerParent, children.length)

      parentNode.childrenLoaded = true
      parentNode.totalChildrenCount = endIdx - startIdx

      for (let c = startIdx; c < endIdx; c++) {
        const childId = children[c]
        parentNode.childrenIds.push(childId)
        nodeMap.get(childId)!.parentId = parents[p]
      }
    }
  }

  return {
    nodeMap,
    rootIds,
    totalCount: globalIndex,
  }
}

// ══════════════════════════════════════════════════════
//  懒加载模式
// ══════════════════════════════════════════════════════

/**
 * 创建懒加载树数据。
 * 初始仅包含根节点，子节点通过 loadChildren() 按需生成。
 */
export function createLazyTreeData(): LazyTreeAPI {
  const nodeMap = new Map<string, TreeNode>()
  const rootIds: string[] = []

  const rootCount = LEVEL_CONFIG[0]
  const childrenPerRoot = Math.ceil(LEVEL_CONFIG[1] / rootCount)

  for (let i = 0; i < rootCount; i++) {
    const id = `node_${i}`
    const startIdx = i * childrenPerRoot
    const endIdx = Math.min(startIdx + childrenPerRoot, LEVEL_CONFIG[1])
    const node: TreeNode = {
      id,
      parentId: null,
      childrenIds: [],
      label: generateLabel(0, i),
      hasChildren: true,
      childrenLoaded: false,
      level: 0,
      totalChildrenCount: Math.max(0, endIdx - startIdx),
    }
    nodeMap.set(id, node)
    rootIds.push(id)
  }

  const loadChildren = (parentId: string): Promise<TreeNode[]> => {
    return new Promise((resolve) => {
      const delay = 150 + Math.random() * 250
      setTimeout(() => {
        const parent = nodeMap.get(parentId)
        if (!parent || parent.childrenLoaded) {
          resolve([])
          return
        }

        const childLevel = parent.level + 1
        if (childLevel >= LEVEL_CONFIG.length) {
          parent.childrenLoaded = true
          resolve([])
          return
        }

        const childrenPerParent = Math.ceil(
          LEVEL_CONFIG[childLevel] / LEVEL_CONFIG[parent.level],
        )
        const startIdx = parent.level === 0
          ? (() => {
              // 根节点的 indexInLevel 即其数组位置
              const rootIdx = rootIds.indexOf(parentId)
              return rootIdx * childrenPerParent
            })()
          : (() => {
              // 非根节点：从 ID 反推 indexInLevel
              const globalIdx = parseInt(parentId.replace('node_', ''), 10)
              return (globalIdx - CUM_START[parent.level]) * childrenPerParent
            })()

        const endIdx = Math.min(
          startIdx + childrenPerParent,
          LEVEL_CONFIG[childLevel],
        )

        const children: TreeNode[] = []
        const isLeaf = childLevel === LEVEL_CONFIG.length - 1

        for (let c = startIdx; c < endIdx; c++) {
          const globalIdx = CUM_START[childLevel] + c
          const childId = `node_${globalIdx}`

          let grandChildCount = 0
          if (!isLeaf) {
            const gcp = Math.ceil(
              LEVEL_CONFIG[childLevel + 1] / LEVEL_CONFIG[childLevel],
            )
            const gcStart = c * gcp
            const gcEnd = Math.min(
              gcStart + gcp,
              LEVEL_CONFIG[childLevel + 1],
            )
            grandChildCount = Math.max(0, gcEnd - gcStart)
          }

          const child: TreeNode = {
            id: childId,
            parentId,
            childrenIds: [],
            label: generateLabel(childLevel, c),
            hasChildren: !isLeaf,
            childrenLoaded: false,
            level: childLevel,
            totalChildrenCount: grandChildCount,
          }

          children.push(child)
        }

        parent.childrenIds = children.map((ch) => ch.id)
        parent.childrenLoaded = true

        for (const ch of children) {
          nodeMap.set(ch.id, ch)
        }

        resolve(children)
      }, delay)
    })
  }

  return {
    treeData: {
      nodeMap,
      rootIds,
      totalCount: TOTAL_NODES,
    },
    loadChildren,
  }
}
