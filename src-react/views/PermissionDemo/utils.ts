import type { MutexRule, DiffResult, PermissionNode } from './types'

/** 互斥解析结果 */
export interface MutexResolution {
  conflicts: string[]
  message: string
}

/**
 * 解析互斥冲突
 *
 * 给定一个即将被选中的权限 ID，在所有互斥规则中查找是否有已选中
 * 的其他 ID 与该 ID 冲突。如果有，返回所有冲突 ID 和提示信息。
 *
 * @param toggledId   - 用户正在切换的权限 ID
 * @param rules       - 所有互斥规则
 * @param checkedIds  - 当前已选中的权限 ID 集合
 * @param idToLabel   - ID → 中文名映射（用于生成提示文案）
 * @returns 冲突 ID 列表和提示信息；无冲突时两个字段均为空
 */
export function resolveMutex(
  toggledId: string,
  rules: MutexRule[],
  checkedIds: Set<string>,
  idToLabel: Map<string, string>,
): MutexResolution {
  for (const rule of rules) {
    const idx = rule.ids.indexOf(toggledId)
    if (idx === -1) continue

    const conflicts = rule.ids.filter(
      (id, i) => i !== idx && checkedIds.has(id),
    )
    if (conflicts.length > 0) {
      return {
        conflicts,
        message: rule.message.replace(
          /"([^"]+)"/g,
          (_, idLike) => idToLabel.get(idLike) || idLike,
        ),
      }
    }
  }
  return { conflicts: [], message: '' }
}

/**
 * 计算两个 Set 之间的差集
 *
 * @returns { added, removed }
 *   - added: 存在于 temp 但不存在于 origin 的 ID（新增）
 *   - removed: 存在于 origin 但不存在于 temp 的 ID（移除）
 *
 * 复杂度: O(n+m)，n = temp 大小，m = origin 大小
 */
export function computeDiff(
  origin: Set<string>,
  temp: Set<string>,
): DiffResult {
  const added: string[] = []
  const removed: string[] = []

  for (const id of temp) {
    if (!origin.has(id)) added.push(id)
  }
  for (const id of origin) {
    if (!temp.has(id)) removed.push(id)
  }

  return { added, removed }
}

/**
 * 递归遍历权限树，构建 id → label 的映射表
 *
 * 只收集叶节点（没有 children 的节点），因为中间分类节点不是权限点。
 */
export function buildLabelMap(
  nodes: PermissionNode[],
): Map<string, string> {
  const map = new Map<string, string>()
  const walk = (list: PermissionNode[]) => {
    for (const n of list) {
      if (n.children && n.children.length > 0) {
        walk(n.children)
      } else {
        map.set(n.id, n.label)
      }
    }
  }
  walk(nodes)
  return map
}

/**
 * Toggle 权限 ID 在 Set 中的存在状态（不可变更新）
 *
 * 返回新 Set，不修改原 Set。
 */
export function toggleSet(
  set: Set<string>,
  id: string,
  checked: boolean,
): Set<string> {
  const next = new Set(set)
  if (checked) {
    next.add(id)
  } else {
    next.delete(id)
  }
  return next
}
