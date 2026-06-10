import type { DiffResult } from './types'

interface Props {
  diff: DiffResult
  idToLabel: Map<string, string>
  onApply: () => void
  onReset: () => void
  disabled: boolean
}

export default function DiffPanel({
  diff,
  idToLabel,
  onApply,
  onReset,
  disabled,
}: Props) {
  const hasChanges = diff.added.length > 0 || diff.removed.length > 0

  return (
    <div
      style={{
        width: 280,
        background: '#fff',
        border: '1px solid #e5e6eb',
        borderRadius: 8,
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        height: 'fit-content',
        position: 'sticky',
        top: 20,
      }}
    >
      <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 600 }}>
        变更预览
      </h3>

      {!hasChanges && (
        <p style={{ color: '#86909c', fontSize: 13, margin: '8px 0' }}>
          暂无变更
        </p>
      )}

      {/* 新增 */}
      {diff.added.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: '#00b42a',
              marginBottom: 8,
            }}
          >
            + 新增 ({diff.added.length})
          </div>
          <ul
            style={{
              margin: 0,
              paddingLeft: 18,
              fontSize: 13,
              color: '#4e5969',
              lineHeight: '24px',
            }}
          >
            {diff.added.map((id) => (
              <li key={id}>{idToLabel.get(id) || id}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 移除 */}
      {diff.removed.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: '#f53f3f',
              marginBottom: 8,
            }}
          >
            - 移除 ({diff.removed.length})
          </div>
          <ul
            style={{
              margin: 0,
              paddingLeft: 18,
              fontSize: 13,
              color: '#4e5969',
              lineHeight: '24px',
            }}
          >
            {diff.removed.map((id) => (
              <li key={id}>{idToLabel.get(id) || id}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 提示：只发送增量 */}
      {hasChanges && (
        <div
          style={{
            background: '#f2f3f5',
            borderRadius: 4,
            padding: '8px 12px',
            fontSize: 12,
            color: '#86909c',
            marginBottom: 16,
            lineHeight: '18px',
          }}
        >
          应用时将只发送增量数据：
          <br />
          <code style={{ fontSize: 11 }}>
            {JSON.stringify({
              added: diff.added,
              removed: diff.removed,
            })}
          </code>
        </div>
      )}

      {/* 操作按钮 */}
      <div style={{ display: 'flex', gap: 10, marginTop: 'auto' }}>
        <button
          onClick={onReset}
          disabled={disabled || !hasChanges}
          style={btnStyle(false)}
        >
          重置
        </button>
        <button
          onClick={onApply}
          disabled={disabled || !hasChanges}
          style={btnStyle(true)}
        >
          应用
        </button>
      </div>
    </div>
  )
}

function btnStyle(primary: boolean): React.CSSProperties {
  return {
    flex: 1,
    padding: '8px 0',
    borderRadius: 6,
    border: primary ? 'none' : '1px solid #c9cdd4',
    background: primary ? '#165dff' : '#fff',
    color: primary ? '#fff' : '#4e5969',
    fontSize: 14,
    cursor: 'pointer',
    fontWeight: 500,
  }
}
