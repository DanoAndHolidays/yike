import { useState } from 'react'
import type { PermissionNode, MutexRule } from './types'
import { resolveMutex } from './utils'

interface Props {
  nodes: PermissionNode[]
  checkedIds: Set<string>
  onToggle: (id: string, checked: boolean) => void
  mutexRules: MutexRule[]
  /** 按 label 查找 id，用于冲突提示 */
  idToLabel: Map<string, string>
}

export default function PermissionTree({
  nodes,
  checkedIds,
  onToggle,
  mutexRules,
  idToLabel,
}: Props) {
  return (
    <div style={{ fontSize: 14, lineHeight: '32px', userSelect: 'none' }}>
      {nodes.map((node) => (
        <TreeNode
          key={node.id}
          node={node}
          checkedIds={checkedIds}
          onToggle={onToggle}
          mutexRules={mutexRules}
          idToLabel={idToLabel}
          depth={0}
        />
      ))}
    </div>
  )
}

function TreeNode({
  node,
  checkedIds,
  onToggle,
  mutexRules,
  idToLabel,
  depth,
}: {
  node: PermissionNode
  checkedIds: Set<string>
  onToggle: (id: string, checked: boolean) => void
  mutexRules: MutexRule[]
  idToLabel: Map<string, string>
  depth: number
}) {
  const [expanded, setExpanded] = useState(true)
  const hasChildren = node.children && node.children.length > 0
  const isChecked = checkedIds.has(node.id)
  const isFolder = !!hasChildren
  const padLeft = 16 + depth * 24

  const handleToggle = () => {
    // 如果是文件夹节点，不参与选中逻辑
    if (isFolder) {
      setExpanded(!expanded)
      return
    }

    if (!isChecked) {
      // 即将选中，检查互斥规则
      const resolved = resolveMutex(node.id, mutexRules, checkedIds, idToLabel)
      if (resolved.conflicts.length > 0) {
        // 先移除冲突项
        for (const conflictId of resolved.conflicts) {
          onToggle(conflictId, false)
        }
        // 通过 message 组件通知用户
        showMutexWarning(resolved.message)
      }
    }
    onToggle(node.id, !isChecked)
  }

  return (
    <div>
      <div
        onClick={handleToggle}
        style={{
          paddingLeft: padLeft,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          borderRadius: 4,
          paddingRight: 8,
          transition: 'background 0.15s',
          background: 'transparent',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background = '#f0f5ff'
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = 'transparent'
        }}
      >
        {/* 展开/折叠箭头（仅文件夹） */}
        {isFolder && (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 16,
              fontSize: 10,
              color: '#86909c',
              transition: 'transform 0.2s',
              transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
            }}
          >
            ▶
          </span>
        )}
        {!isFolder && <span style={{ width: 16 }} />}

        {/* Checkbox */}
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 16,
            height: 16,
            borderRadius: 2,
            border: isChecked ? 'none' : '2px solid #c9cdd4',
            background: isChecked ? '#165dff' : '#fff',
            flexShrink: 0,
          }}
        >
          {isChecked && (
            <span style={{ color: '#fff', fontSize: 12, lineHeight: 1 }}>✓</span>
          )}
        </span>

        {/* 标签 */}
        <span style={{ color: isFolder ? '#1d2129' : '#4e5969' }}>
          {isFolder ? '📁' : ''} {node.label}
        </span>
      </div>

      {/* 子节点 */}
      {isFolder && expanded && (
        <div>
          {node.children!.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              checkedIds={checkedIds}
              onToggle={onToggle}
              mutexRules={mutexRules}
              idToLabel={idToLabel}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function showMutexWarning(msg: string) {
  // 创建一个简单的浮层提示
  const el = document.createElement('div')
  el.textContent = msg
  Object.assign(el.style, {
    position: 'fixed',
    top: '80px',
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#fff7e6',
    border: '1px solid #ff7d00',
    color: '#ff7d00',
    padding: '10px 20px',
    borderRadius: '6px',
    fontSize: '14px',
    zIndex: '9999',
    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
    animation: 'slideDown 0.3s ease',
  })
  document.body.appendChild(el)
  setTimeout(() => {
    el.style.opacity = '0'
    el.style.transition = 'opacity 0.3s'
    setTimeout(() => el.remove(), 300)
  }, 2500)
}
