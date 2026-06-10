import { useState, useMemo, useCallback } from 'react'
import PermissionTree from './PermissionTree'
import DiffPanel from './DiffPanel'
import { permissionTree, mutexRules, initialChecked } from './mockData'
import { computeDiff, buildLabelMap, toggleSet } from './utils'
import type { DiffResult } from './types'

export default function PermissionDemo() {
  const [originCheckedIds, setOriginCheckedIds] = useState<Set<string>>(
    () => new Set(initialChecked),
  )
  const [tempCheckedIds, setTempCheckedIds] = useState<Set<string>>(
    () => new Set(initialChecked),
  )
  const [applying, setApplying] = useState(false)

  const idToLabel = useMemo(() => buildLabelMap(permissionTree), [])

  // 计算 diff
  const diff = useMemo<DiffResult>(() => computeDiff(originCheckedIds, tempCheckedIds), [originCheckedIds, tempCheckedIds])

  const handleToggle = useCallback(
    (id: string, checked: boolean) => {
      setTempCheckedIds((prev) => toggleSet(prev, id, checked))
    },
    [],
  )

  const handleApply = useCallback(() => {
    if (diff.added.length === 0 && diff.removed.length === 0) return
    setApplying(true)
    // 模拟 API 调用：只发送增量
    setTimeout(() => {
      console.log('[PermissionDemo] 发送增量数据:', {
        added: diff.added,
        removed: diff.removed,
      })
      setOriginCheckedIds(new Set(tempCheckedIds))
      setApplying(false)
    }, 400)
  }, [diff, tempCheckedIds])

  const handleReset = useCallback(() => {
    setTempCheckedIds(new Set(originCheckedIds))
  }, [originCheckedIds])

  return (
    <div
      style={{
        maxWidth: 900,
        margin: '0 auto',
        padding: '32px 24px',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 8px' }}>
        权限预览面板
      </h1>
      <p style={{ color: '#86909c', fontSize: 14, margin: '0 0 28px' }}>
        基于 Set 差集运算的增量权限变更预览，支持互斥规则自动冲突解决
      </p>

      {/* 主内容区：左右分栏 */}
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
        {/* 左侧：权限树 */}
        <div
          style={{
            flex: 1,
            background: '#fff',
            border: '1px solid #e5e6eb',
            borderRadius: 8,
            padding: 20,
          }}
        >
          <h3 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 600 }}>
            权限列表
          </h3>
          <PermissionTree
            nodes={permissionTree}
            checkedIds={tempCheckedIds}
            onToggle={handleToggle}
            mutexRules={mutexRules}
            idToLabel={idToLabel}
          />
        </div>

        {/* 右侧：Diff 面板 */}
        <DiffPanel
          diff={diff}
          idToLabel={idToLabel}
          onApply={handleApply}
          onReset={handleReset}
          disabled={applying}
        />
      </div>

      {/* 底部：互斥规则说明 + 当前状态 */}
      <div
        style={{
          marginTop: 24,
          background: '#fff',
          border: '1px solid #e5e6eb',
          borderRadius: 8,
          padding: 20,
        }}
      >
        <h3
          style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 600 }}
        >
          互斥规则
        </h3>
        <ul
          style={{
            margin: 0,
            paddingLeft: 18,
            fontSize: 13,
            color: '#4e5969',
            lineHeight: '26px',
          }}
        >
          {mutexRules.map((rule, i) => (
            <li key={i}>
              {rule.ids.map((id) => idToLabel.get(id) || id).join(' ⇔ ')}
            </li>
          ))}
        </ul>

        <h3
          style={{
            margin: '20px 0 8px',
            fontSize: 15,
            fontWeight: 600,
          }}
        >
          当前状态
        </h3>
        <div
          style={{
            fontSize: 12,
            color: '#86909c',
            fontFamily: 'monospace',
            background: '#f7f8fa',
            borderRadius: 4,
            padding: '10px 14px',
            lineHeight: '20px',
          }}
        >
          <div>originCheckedIds ({originCheckedIds.size}): [{[...originCheckedIds].join(', ')}]</div>
          <div style={{ marginTop: 4 }}>
            tempCheckedIds ({tempCheckedIds.size}): [{[...tempCheckedIds].join(', ')}]
          </div>
        </div>
      </div>
    </div>
  )
}
