/**
 * Mock Tree Data Generator
 *
 * 生成约 100,000 个节点的树形数据，每个节点记录父节点 ID 和子节点 ID 列表，
 * 形成完整的树结构。数据存储在 Map 中以供 O(1) 查找。
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
}

export interface TreeData {
  /** 所有节点的 Map，key 为节点 id */
  nodeMap: Map<string, TreeNode>
  /** 根节点 ID 列表（无父节点的节点） */
  rootIds: string[]
  /** 节点总数 */
  totalCount: number
}

/** 每层的目标节点数 */
const LEVEL_CONFIG = [100, 300, 900, 2700, 8100, 24300, 63600]

/** 每层对应的显示名称前缀 */
const LEVEL_PREFIX = ['集团', '事业部', '部门', '中心', '团队', '小组', '成员']

/**
 * 为节点生成可读标签
 */
function generateLabel(level: number, indexInLevel: number): string {
  const prefix = LEVEL_PREFIX[level] ?? `L${level}`
  return `${prefix}-${String(indexInLevel + 1).padStart(4, '0')}`
}

/**
 * 生成约 100,000 个节点的模拟树数据。
 *
 * 算法:
 * 1. 按层级依次创建所有节点，存入临时 Map
 * 2. 将 level N 的节点平均分配给 level N-1 的节点作为子节点
 * 3. 所有节点汇总到 TreeData 中返回
 */
export function generateMockTreeData(): TreeData {
  const nodeMap = new Map<string, TreeNode>()
  const rootIds: string[] = []

  // 存储每层生成的节点 ID 列表
  const levelNodeIds: string[][] = []
  let globalIndex = 0

  // ── 第一遍: 创建所有节点 ──
  for (let level = 0; level < LEVEL_CONFIG.length; level++) {
    const count = LEVEL_CONFIG[level]
    const ids: string[] = []
    const isLeaf = level === LEVEL_CONFIG.length - 1

    for (let i = 0; i < count; i++) {
      const id = `node_${globalIndex}`
      globalIndex++

      const node: TreeNode = {
        id,
        parentId: null, // 第二遍填充
        childrenIds: [], // 第二遍填充
        label: generateLabel(level, i),
        hasChildren: !isLeaf,
      }

      nodeMap.set(id, node)
      ids.push(id)
    }

    levelNodeIds.push(ids)
  }

  // ── 第二遍: 建立父子关系 ──
  // Level 0 节点无父节点
  for (const id of levelNodeIds[0]) {
    rootIds.push(id)
  }

  // 将 level+1 的节点平均分配给 level 的节点
  for (let level = 0; level < LEVEL_CONFIG.length - 1; level++) {
    const parents = levelNodeIds[level]
    const children = levelNodeIds[level + 1]
    const childrenPerParent = Math.ceil(children.length / parents.length)

    for (let p = 0; p < parents.length; p++) {
      const parentNode = nodeMap.get(parents[p])!
      const startIdx = p * childrenPerParent
      const endIdx = Math.min(startIdx + childrenPerParent, children.length)

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
