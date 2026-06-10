import React, { useState, useMemo, useCallback, useRef } from 'react'
import { Button, Space, Tag, Tooltip } from '@arco-design/web-react'
import { createLazyTreeData } from './mockData'
import type { LazyTreeAPI } from './mockData'
import TreeVirtualList, { flattenTree } from './TreeVirtualList'
import ExportPanel from './ExportPanel'
import './tree.css'

const TreeDemo: React.FC = () => {
  const apiRef = useRef<LazyTreeAPI | null>(null)
  if (!apiRef.current) {
    apiRef.current = createLazyTreeData()
  }
  const { treeData, loadChildren } = apiRef.current

  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set<string>(),
  )

  const [loadingIds, setLoadingIds] = useState<Set<string>>(
    () => new Set<string>(),
  )

  const [dataVersion, setDataVersion] = useState(0)

  const handleToggle = useCallback(
    (id: string) => {
      const node = treeData.nodeMap.get(id)
      if (!node) return

      if (node.hasChildren && !node.childrenLoaded) {
        setLoadingIds((prev) => new Set(prev).add(id))
        loadChildren(id).then(() => {
          setLoadingIds((prev) => {
            const next = new Set(prev)
            next.delete(id)
            return next
          })
          setDataVersion((v) => v + 1)
          setExpandedIds((prev) => new Set(prev).add(id))
        })
      } else {
        setExpandedIds((prev) => {
          const next = new Set(prev)
          if (next.has(id)) {
            next.delete(id)
          } else {
            next.add(id)
          }
          return next
        })
      }
    },
    [treeData, loadChildren],
  )

  const handleExpandAll = useCallback(() => {
    const ids = new Set<string>()
    const stack = [...treeData.rootIds]
    while (stack.length > 0) {
      const id = stack.pop()!
      const node = treeData.nodeMap.get(id)
      if (!node) continue
      if (node.childrenLoaded && node.childrenIds.length > 0) {
        ids.add(id)
        stack.push(...node.childrenIds)
      }
    }
    setExpandedIds(ids)
  }, [treeData])

  const handleCollapseAll = useCallback(() => {
    setExpandedIds(new Set())
  }, [])

  const handleExpandToLevel = useCallback(
    async (maxLevel: number) => {
      const idsToExpand = new Set<string>()

      async function loadAndCollect(
        ids: string[],
        level: number,
      ): Promise<void> {
        if (level >= maxLevel) return

        const loadPromises: Array<Promise<void>> = []

        for (const id of ids) {
          const node = treeData.nodeMap.get(id)
          if (!node || !node.hasChildren) continue

          idsToExpand.add(id)

          if (!node.childrenLoaded) {
            loadPromises.push(
              loadChildren(id).then(() => {
                setDataVersion((v) => v + 1)
              }),
            )
          }
        }

        if (loadPromises.length > 0) {
          setLoadingIds((prev) => {
            const next = new Set(prev)
            for (const id of ids) {
              const node = treeData.nodeMap.get(id)
              if (node && node.hasChildren && !node.childrenLoaded) {
                next.add(id)
              }
            }
            return next
          })

          await Promise.all(loadPromises)

          setLoadingIds((prev) => {
            const next = new Set(prev)
            for (const id of ids) next.delete(id)
            return next
          })
        }

        const childPromises: Array<Promise<void>> = []
        for (const id of ids) {
          const node = treeData.nodeMap.get(id)
          if (node && node.childrenLoaded) {
            childPromises.push(
              loadAndCollect(node.childrenIds, level + 1),
            )
          }
        }
        await Promise.all(childPromises)
      }

      await loadAndCollect(treeData.rootIds, 0)
      setExpandedIds((prev) => {
        const next = new Set(prev)
        for (const id of idsToExpand) next.add(id)
        return next
      })
    },
    [treeData, loadChildren],
  )

  const visibleCount = useMemo(() => {
    let count = 0
    function walk(ids: string[]) {
      for (const id of ids) {
        count++
        const node = treeData.nodeMap.get(id)
        if (node && expandedIds.has(id) && node.childrenLoaded && node.childrenIds.length > 0) {
          walk(node.childrenIds)
        }
      }
    }
    walk(treeData.rootIds)
    return count
  }, [treeData, expandedIds, dataVersion])

  const loadedCount = useMemo(() => {
    let count = 0
    for (const node of treeData.nodeMap.values()) {
      if (node.childrenLoaded) count++
    }
    return count
  }, [treeData, dataVersion])

  const flatList = useMemo(() => {
    const out: Array<{ id: string; level: number }> = []
    flattenTree(treeData.nodeMap, treeData.rootIds, 0, expandedIds, out)
    return out
  }, [treeData, expandedIds, dataVersion])

  return (
    <div className="tree-demo-page">
      <div className="tree-controls">
        <span className="title">树形虚拟滚动 · 懒加载</span>

        <Space size="mini" wrap>
          <Tooltip content="展开所有已加载的可展开节点">
            <Button type="primary" size="small" onClick={handleExpandAll}>
              展开全部
            </Button>
          </Tooltip>
          <Button size="small" onClick={handleCollapseAll}>
            全部收起
          </Button>
          <Tooltip content="递归加载并展开前 1/2/3 层">
            <>
              <Button size="small" onClick={() => handleExpandToLevel(1)}>
                展开第 1 层
              </Button>
              <Button size="small" onClick={() => handleExpandToLevel(2)}>
                展开第 2 层
              </Button>
              <Button size="small" onClick={() => handleExpandToLevel(3)}>
                展开第 3 层
              </Button>
            </>
          </Tooltip>
        </Space>

        <span className="tree-stat">
          总计 <em>{treeData.totalCount.toLocaleString()}</em> 个节点
        </span>
        <span className="tree-stat">
          已加载 <em>{loadedCount.toLocaleString()}</em> 个
        </span>
        <span className="tree-stat">
          可见 <em>{visibleCount.toLocaleString()}</em> 行
        </span>
        <span className="tree-stat">
          展开 <em>{expandedIds.size.toLocaleString()}</em> 个
        </span>

        <Tooltip content="纯前端 mock 100k 节点树。数据按需懒加载，滚动仅渲染约 30-50 个 DOM。">
          <Tag color="arcoblue" style={{ cursor: 'help' }}>
            如何工作?
          </Tag>
        </Tooltip>
      </div>

      <ExportPanel flatList={flatList} treeData={treeData} />

      <TreeVirtualList
        treeData={treeData}
        expandedIds={expandedIds}
        onToggleExpand={handleToggle}
        loadingIds={loadingIds}
        dataVersion={dataVersion}
      />
    </div>
  )
}

export default TreeDemo
