import React, { useState, useMemo, useCallback } from 'react'
import { Button, Space, Tag, Tooltip } from '@arco-design/web-react'
import { generateMockTreeData } from './mockData'
import type { TreeNode } from './mockData'
import TreeVirtualList from './TreeVirtualList'
import './tree.css'

// ── 预计算：收集所有有子节点的节点 ID ────────────────

function collectParentIds(
  nodeMap: Map<string, TreeNode>,
  rootIds: string[],
): Set<string> {
  const ids = new Set<string>()
  const stack = [...rootIds]
  while (stack.length > 0) {
    const id = stack.pop()!
    const node = nodeMap.get(id)
    if (!node) continue
    if (node.childrenIds.length > 0) {
      ids.add(id)
      stack.push(...node.childrenIds)
    }
  }
  return ids
}

// ── 组件 ────────────────────────────────────────────

const TreeDemo: React.FC = () => {
  // 数据只生成一次
  const treeData = useMemo(() => generateMockTreeData(), [])

  // 所有可展开的节点 ID（预计算缓存）
  const allParentIds = useMemo(
    () => collectParentIds(treeData.nodeMap, treeData.rootIds),
    [treeData],
  )

  // 当前已展开的节点 ID（默认全部收起，仅根节点可见）
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set<string>(),
  )

  // 展开 / 收起单个节点
  const handleToggle = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  // 全部展开
  const handleExpandAll = useCallback(() => {
    setExpandedIds(new Set(allParentIds))
  }, [allParentIds])

  // 全部收起
  const handleCollapseAll = useCallback(() => {
    setExpandedIds(new Set())
  }, [])

  // 按层级展开：展开前 N 层
  const handleExpandToLevel = useCallback(
    (maxLevel: number) => {
      const ids = new Set<string>()
      const queue: Array<{ id: string; level: number }> = treeData.rootIds.map(
        (id) => ({ id, level: 0 }),
      )
      while (queue.length > 0) {
        const { id, level } = queue.shift()!
        const node = treeData.nodeMap.get(id)
        if (!node) continue
        if (node.childrenIds.length > 0 && level < maxLevel) {
          ids.add(id)
          for (const childId of node.childrenIds) {
            queue.push({ id: childId, level: level + 1 })
          }
        }
      }
      setExpandedIds(ids)
    },
    [treeData],
  )

  // 计算当前可见行数（展平后的列表长度）
  const visibleCount = useMemo(() => {
    let count = 0
    function walk(ids: string[]) {
      for (const id of ids) {
        count++
        const node = treeData.nodeMap.get(id)
        if (node && expandedIds.has(id) && node.childrenIds.length > 0) {
          walk(node.childrenIds)
        }
      }
    }
    walk(treeData.rootIds)
    return count
  }, [treeData, expandedIds])

  return (
    <div className="tree-demo-page">
      {/* ── 控制栏 ─────────────────────────────── */}
      <div className="tree-controls">
        <span className="title">树形虚拟滚动</span>

        <Space size="mini" wrap>
          <Button type="primary" size="small" onClick={handleExpandAll}>
            展开全部
          </Button>
          <Button size="small" onClick={handleCollapseAll}>
            全部收起
          </Button>
          <Button size="small" onClick={() => handleExpandToLevel(1)}>
            展开第 1 层
          </Button>
          <Button size="small" onClick={() => handleExpandToLevel(2)}>
            展开第 2 层
          </Button>
          <Button size="small" onClick={() => handleExpandToLevel(3)}>
            展开第 3 层
          </Button>
        </Space>

        <span className="tree-stat">
          总计 <em>{treeData.totalCount.toLocaleString()}</em> 个节点
        </span>
        <span className="tree-stat">
          可见 <em>{visibleCount.toLocaleString()}</em> 行
        </span>
        <span className="tree-stat">
          已展开 <em>{expandedIds.size.toLocaleString()}</em> 个
        </span>

        <Tooltip content="纯前端 mock 100k 节点树。展开全部后滚动，浏览器仅渲染约 30-50 个 DOM 节点。">
          <Tag color="arcoblue" style={{ cursor: 'help' }}>
            如何工作?
          </Tag>
        </Tooltip>
      </div>

      {/* ── 虚拟滚动树 ─────────────────────────── */}
      <TreeVirtualList
        treeData={treeData}
        expandedIds={expandedIds}
        onToggleExpand={handleToggle}
      />
    </div>
  )
}

export default TreeDemo
