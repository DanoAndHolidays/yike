import { describe, it, expect } from 'vitest'
import {
  resolveMutex,
  computeDiff,
  buildLabelMap,
  toggleSet,
} from '../utils'
import type { MutexRule, PermissionNode } from '../types'

// ============================================================
// resolveMutex
// ============================================================
describe('resolveMutex', () => {
  const idToLabel = new Map([
    ['full_access', '完全访问'],
    ['read_only', '只读访问'],
    ['delete_user', '删除用户'],
    ['edit_user', '编辑用户'],
    ['publish_article', '发布文章'],
    ['delete_article', '删除文章'],
    ['view_user', '查看用户'],
  ])

  const rules: MutexRule[] = [
    {
      ids: ['full_access', 'read_only'],
      message: '"完全访问" 与 "只读访问" 互斥',
    },
    {
      ids: ['delete_user', 'edit_user'],
      message: '"删除用户" 与 "编辑用户" 互斥',
    },
    {
      ids: ['publish_article', 'delete_article'],
      message: '"发布文章" 与 "删除文章" 互斥',
    },
  ]

  it('无冲突: 选中一个规则组之外的权限', () => {
    const checked = new Set(['read_only'])
    const result = resolveMutex('view_user', rules, checked, idToLabel)
    expect(result.conflicts).toEqual([])
    expect(result.message).toBe('')
  })

  it('无冲突: 选中的权限在规则组中，但没有其他成员被选中', () => {
    const checked = new Set(['view_user', 'edit_user'])
    const result = resolveMutex('full_access', rules, checked, idToLabel)
    expect(result.conflicts).toEqual([])
    expect(result.message).toBe('')
  })

  it('无冲突: checkedIds 为空', () => {
    const checked = new Set<string>()
    const result = resolveMutex('full_access', rules, checked, idToLabel)
    expect(result.conflicts).toEqual([])
  })

  it('有冲突: 选中 full_access 时 read_only 已被选中', () => {
    const checked = new Set(['read_only'])
    const result = resolveMutex('full_access', rules, checked, idToLabel)
    expect(result.conflicts).toEqual(['read_only'])
    expect(result.message).toContain('完全访问')
    expect(result.message).toContain('只读访问')
  })

  it('有冲突: 选中 read_only 时 full_access 已被选中（反向验证）', () => {
    const checked = new Set(['full_access'])
    const result = resolveMutex('read_only', rules, checked, idToLabel)
    expect(result.conflicts).toEqual(['full_access'])
  })

  it('有冲突: delete_user 和 edit_user 互斥', () => {
    const checked = new Set(['edit_user'])
    const result = resolveMutex('delete_user', rules, checked, idToLabel)
    expect(result.conflicts).toEqual(['edit_user'])
  })

  it('有冲突: publish_article 和 delete_article 互斥', () => {
    const checked = new Set(['delete_article'])
    const result = resolveMutex('publish_article', rules, checked, idToLabel)
    expect(result.conflicts).toEqual(['delete_article'])
  })

  it('空的互斥规则列表不会产生冲突', () => {
    const checked = new Set(['full_access', 'read_only'])
    const result = resolveMutex('read_only', [], checked, idToLabel)
    expect(result.conflicts).toEqual([])
  })

  it('多规则组: 不同规则组之间不互相影响', () => {
    // full_access/read_only 属于规则组1，delete_user/edit_user 属于规则组2
    // 选中 full_access 不应该影响 delete_user
    const checked = new Set(['delete_user'])
    const result = resolveMutex('full_access', rules, checked, idToLabel)
    expect(result.conflicts).toEqual([])
  })

  it('ID 不在任何规则中: 返回无冲突', () => {
    const checked = new Set(['full_access', 'delete_user', 'publish_article'])
    const result = resolveMutex('view_user', rules, checked, idToLabel)
    expect(result.conflicts).toEqual([])
  })

  it('idToLabel 缺少映射时，message 中引号被移除但保留原始文本', () => {
    const emptyMap = new Map<string, string>()
    const checked = new Set(['read_only'])
    const result = resolveMutex('full_access', rules, checked, emptyMap)
    // 冲突仍然被检测到
    expect(result.conflicts).toEqual(['read_only'])
    // regex 替换了 "完全访问" → 完全访问 (idLike 作为 fallback，去掉引号)
    expect(result.message).not.toContain('"')
    expect(result.message).toContain('完全访问')
  })
})

// ============================================================
// computeDiff
// ============================================================
describe('computeDiff', () => {
  it('空集合: 无变更', () => {
    expect(computeDiff(new Set(), new Set())).toEqual({
      added: [],
      removed: [],
    })
  })

  it('origin 和 temp 完全相同: 无变更', () => {
    const origin = new Set(['a', 'b', 'c'])
    const temp = new Set(['a', 'b', 'c'])
    expect(computeDiff(origin, temp)).toEqual({
      added: [],
      removed: [],
    })
  })

  it('纯新增: 在已有基础上追加', () => {
    const origin = new Set(['a', 'b'])
    const temp = new Set(['a', 'b', 'c', 'd'])
    expect(computeDiff(origin, temp)).toEqual({
      added: ['c', 'd'],
      removed: [],
    })
  })

  it('纯移除: 取消部分权限', () => {
    const origin = new Set(['a', 'b', 'c', 'd'])
    const temp = new Set(['a', 'b'])
    expect(computeDiff(origin, temp)).toEqual({
      added: [],
      removed: ['c', 'd'],
    })
  })

  it('混合: 同时有新增和移除', () => {
    const origin = new Set(['a', 'b', 'c'])
    const temp = new Set(['b', 'c', 'd', 'e'])
    expect(computeDiff(origin, temp)).toEqual({
      added: ['d', 'e'],
      removed: ['a'],
    })
  })

  it('完全替换: 所有权限都变了', () => {
    const origin = new Set(['a', 'b'])
    const temp = new Set(['c', 'd'])
    expect(computeDiff(origin, temp)).toEqual({
      added: ['c', 'd'],
      removed: ['a', 'b'],
    })
  })

  it('从空到有: origin 为空', () => {
    const origin = new Set<string>()
    const temp = new Set(['x', 'y'])
    expect(computeDiff(origin, temp)).toEqual({
      added: ['x', 'y'],
      removed: [],
    })
  })

  it('从有到空: temp 为空（全部取消）', () => {
    const origin = new Set(['x', 'y'])
    const temp = new Set<string>()
    expect(computeDiff(origin, temp)).toEqual({
      added: [],
      removed: ['x', 'y'],
    })
  })

  it('大量权限的 diff 仍然正确', () => {
    const origin = new Set(Array.from({ length: 1000 }, (_, i) => `perm_${i}`))
    const temp = new Set(origin)
    // 移除 500 个，新增 500 个不同的
    for (let i = 0; i < 500; i++) {
      temp.delete(`perm_${i}`)
      temp.add(`new_perm_${i}`)
    }
    const result = computeDiff(origin, temp)
    expect(result.added.length).toBe(500)
    expect(result.removed.length).toBe(500)
    expect(result.added.every((id) => id.startsWith('new_perm_'))).toBe(true)
    expect(result.removed.every((id) => id.startsWith('perm_'))).toBe(true)
  })
})

// ============================================================
// buildLabelMap
// ============================================================
describe('buildLabelMap', () => {
  const tree: PermissionNode[] = [
    {
      id: 'cat_1',
      label: '分类一',
      children: [
        { id: 'perm_a', label: '权限A' },
        { id: 'perm_b', label: '权限B' },
      ],
    },
    {
      id: 'cat_2',
      label: '分类二',
      children: [
        { id: 'perm_c', label: '权限C' },
      ],
    },
  ]

  it('只收集叶节点，不包含分类节点', () => {
    const map = buildLabelMap(tree)
    expect(map.size).toBe(3)
    expect(map.get('perm_a')).toBe('权限A')
    expect(map.get('perm_b')).toBe('权限B')
    expect(map.get('perm_c')).toBe('权限C')
    // 分类节点不应出现
    expect(map.has('cat_1')).toBe(false)
    expect(map.has('cat_2')).toBe(false)
  })

  it('空树返回空 Map', () => {
    const map = buildLabelMap([])
    expect(map.size).toBe(0)
  })

  it('单层树（无 children）', () => {
    const flat: PermissionNode[] = [
      { id: 'a', label: 'A' },
      { id: 'b', label: 'B' },
    ]
    const map = buildLabelMap(flat)
    expect(map.size).toBe(2)
  })

  it('深层嵌套树也被正确展平', () => {
    const deep: PermissionNode[] = [
      {
        id: 'l1',
        label: 'L1',
        children: [
          {
            id: 'l2',
            label: 'L2',
            children: [
              { id: 'leaf', label: '叶子' },
            ],
          },
        ],
      },
    ]
    const map = buildLabelMap(deep)
    expect(map.size).toBe(1)
    expect(map.get('leaf')).toBe('叶子')
    expect(map.has('l1')).toBe(false)
    expect(map.has('l2')).toBe(false)
  })
})

// ============================================================
// toggleSet
// ============================================================
describe('toggleSet', () => {
  it('选中: 向 Set 中添加 ID', () => {
    const before = new Set(['a', 'b'])
    const after = toggleSet(before, 'c', true)
    expect(after.has('c')).toBe(true)
    expect(after.size).toBe(3)
  })

  it('取消: 从 Set 中移除 ID', () => {
    const before = new Set(['a', 'b', 'c'])
    const after = toggleSet(before, 'b', false)
    expect(after.has('b')).toBe(false)
    expect(after.size).toBe(2)
  })

  it('不修改原 Set（不可变性）', () => {
    const before = new Set(['a'])
    toggleSet(before, 'b', true)
    // 原 Set 不受影响
    expect(before.has('b')).toBe(false)
    expect(before.size).toBe(1)
  })

  it('重复选中: 不会产生重复项', () => {
    const before = new Set(['a'])
    const after = toggleSet(before, 'a', true)
    expect(after.size).toBe(1)
    expect(after.has('a')).toBe(true)
  })

  it('取消不存在的 ID: 不报错', () => {
    const before = new Set(['a'])
    const after = toggleSet(before, 'z', false)
    expect(after.size).toBe(1)
    expect(after.has('a')).toBe(true)
  })
})
