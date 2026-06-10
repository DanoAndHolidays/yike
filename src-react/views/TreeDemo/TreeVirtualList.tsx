import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import type { TreeData, TreeNode } from './mockData'

// ── Types ──────────────────────────────────────────────

export interface FlatItem {
    id: string
    level: number
}

interface Props {
    treeData: TreeData
    expandedIds: Set<string>
    onToggleExpand: (id: string) => void
    loadingIds: Set<string>
    dataVersion: number
}

// ── Constants ──────────────────────────────────────────

const ITEM_HEIGHT = 36
const OVERSCAN = 15

// ── Helpers ────────────────────────────────────────────

export function flattenTree(
    nodeMap: Map<string, TreeNode>,
    ids: string[],
    level: number,
    expandedIds: Set<string>,
    out: FlatItem[],
): void {
    for (const id of ids) {
        const node = nodeMap.get(id)
        if (!node) continue
        out.push({ id, level })
        if (expandedIds.has(id) && node.childrenIds.length > 0) {
            flattenTree(nodeMap, node.childrenIds, level + 1, expandedIds, out)
        }
    }
}

// ── Zone constants for row coloring ────────────────────

const ZONE = {
    ABOVE: 'overscan-above', // 上方 overscan 缓冲区
    VIEWPORT: 'viewport', // 实际可见视口
    BELOW: 'overscan-below', // 下方 overscan 缓冲区
} as const

const ZONE_COLORS: Record<string, { bg: string; border: string }> = {
    [ZONE.ABOVE]: { bg: '#fff7e6', border: '#ffd591' }, // 暖橙
    [ZONE.VIEWPORT]: { bg: '#ffffff', border: '#d9d9d9' }, // 白色
    [ZONE.BELOW]: { bg: '#e6f7ff', border: '#91d5ff' }, // 浅蓝
}

// ── Component ──────────────────────────────────────────

const TreeVirtualList: React.FC<Props> = ({
    treeData,
    expandedIds,
    onToggleExpand,
    loadingIds,
    dataVersion,
}) => {
    const { nodeMap, rootIds } = treeData

    // 滚动与容器尺寸
    const [scrollTop, setScrollTop] = useState(0)
    const [containerHeight, setContainerHeight] = useState(600)
    const containerRef = useRef<HTMLDivElement>(null)

    // ── ResizeObserver ──────────────────────────────────

    useEffect(() => {
        const el = containerRef.current
        if (!el) return
        const ro = new ResizeObserver((entries) => {
            const h = entries[0]?.contentRect.height
            if (h && h > 0) setContainerHeight(h)
        })
        ro.observe(el)
        return () => ro.disconnect()
    }, [])

    // ── 展平树 ─────────────────────────────────────────

    const flatList: FlatItem[] = useMemo(() => {
        const out: FlatItem[] = []
        flattenTree(nodeMap, rootIds, 0, expandedIds, out)
        return out
    }, [nodeMap, rootIds, expandedIds, dataVersion])

    const totalHeight = flatList.length * ITEM_HEIGHT

    // ── scrollTop 越界修正 ─────────────────────────────

    useEffect(() => {
        const container = containerRef.current
        if (!container) return
        const maxScroll = Math.max(0, totalHeight - containerHeight)
        if (container.scrollTop > maxScroll) {
            container.scrollTop = maxScroll
        }
    }, [flatList.length, containerHeight, totalHeight])

    // ── 可见区间计算 ───────────────────────────────────

    // 无 overscan 的精确视口起止行
    const viewportStart = Math.floor(scrollTop / ITEM_HEIGHT)
    const viewportEnd = Math.min(
        flatList.length,
        Math.ceil((scrollTop + containerHeight) / ITEM_HEIGHT),
    )

    // 含 overscan 的实际渲染起止行
    const renderStart = Math.max(0, viewportStart - OVERSCAN)
    const renderEnd = Math.min(flatList.length, viewportEnd + OVERSCAN)

    const visibleItems = useMemo(() => {
        const items: Array<{ flatItem: FlatItem; index: number; zone: string }> = []
        for (let i = renderStart; i < renderEnd; i++) {
            let zone: string
            if (i < viewportStart) {
                zone = ZONE.ABOVE
            } else if (i >= viewportEnd) {
                zone = ZONE.BELOW
            } else {
                zone = ZONE.VIEWPORT
            }
            items.push({ flatItem: flatList[i], index: i, zone })
        }
        return items
    }, [flatList, renderStart, renderEnd, viewportStart, viewportEnd])

    // ── 滚动事件 ───────────────────────────────────────

    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        setScrollTop(e.currentTarget.scrollTop)
    }, [])

    // ── 调试信息 ───────────────────────────────────────

    const renderedCount = renderEnd - renderStart
    const viewportCount = viewportEnd - viewportStart

    // 视口边界线在 inner 容器中的 Y 坐标
    const viewportTopY = viewportStart * ITEM_HEIGHT
    const viewportBottomY = viewportEnd * ITEM_HEIGHT

    // ── Render ──────────────────────────────────────────

    return (
        <>
            {/* 滚动容器 */}
            <div
                ref={containerRef}
                className="tree-virtual-container"
                onScroll={handleScroll}
                id="tree-scroll-container"
            >
                {/* 撑开总高度的内层容器 */}
                <div
                    style={{
                        height: totalHeight > 0 ? totalHeight : '100%',
                        position: 'relative',
                    }}
                >
                    {/* ── 空提示 ─────────────────────────────── */}
                    {flatList.length === 0 && (
                        <div className="tree-empty-hint">
                            <p>暂无可见节点</p>
                            <p style={{ fontSize: 13 }}>请点击上方「展开全部」查看完整树结构</p>
                        </div>
                    )}

                    {/* ═══════════════════════════════════════════ */}
                    {/*  视口边界线 (红色虚线)                       */}
                    {/* ═══════════════════════════════════════════ */}

                    {/* 视口上边界 */}
                    <div
                        className="debug-line debug-line-viewport-top"
                        style={{
                            position: 'absolute',
                            top: viewportTopY,
                            left: 0,
                            right: 0,
                            height: 0,
                            zIndex: 20,
                            pointerEvents: 'none',
                        }}
                    >
                        <div className="debug-line-inner debug-line-viewport" />
                        <span className="debug-line-label debug-line-label-top">
                            视口上边界 (第 {viewportStart.toLocaleString()} 行)
                        </span>
                    </div>

                    {/* 视口下边界 */}
                    <div
                        className="debug-line debug-line-viewport-bottom"
                        style={{
                            position: 'absolute',
                            top: viewportBottomY,
                            left: 0,
                            right: 0,
                            height: 0,
                            zIndex: 20,
                            pointerEvents: 'none',
                        }}
                    >
                        <div className="debug-line-inner debug-line-viewport" />
                        <span className="debug-line-label debug-line-label-bottom">
                            视口下边界 (第 {Math.min(viewportEnd, flatList.length).toLocaleString()}{' '}
                            行)
                        </span>
                    </div>

                    {/* ═══════════════════════════════════════════ */}
                    {/*  Overscan 上边界 (橙色虚线)                  */}
                    {/* ═══════════════════════════════════════════ */}
                    <div
                        className="debug-line debug-line-overscan-top"
                        style={{
                            position: 'absolute',
                            top: renderStart * ITEM_HEIGHT,
                            left: 0,
                            right: 0,
                            height: 0,
                            zIndex: 19,
                            pointerEvents: 'none',
                        }}
                    >
                        <div className="debug-line-inner debug-line-overscan" />
                        <span className="debug-line-label debug-line-label-top debug-line-label-overscan">
                            overscan 上沿 (第 {renderStart.toLocaleString()} 行)
                        </span>
                    </div>

                    {/* Overscan 下边界 */}
                    <div
                        className="debug-line debug-line-overscan-bottom"
                        style={{
                            position: 'absolute',
                            top: renderEnd * ITEM_HEIGHT,
                            left: 0,
                            right: 0,
                            height: 0,
                            zIndex: 19,
                            pointerEvents: 'none',
                        }}
                    >
                        <div className="debug-line-inner debug-line-overscan" />
                        <span className="debug-line-label debug-line-label-bottom debug-line-label-overscan">
                            overscan 下沿 (第 {renderEnd.toLocaleString()} 行)
                        </span>
                    </div>

                    {/* ═══════════════════════════════════════════ */}
                    {/*  可见行                                      */}
                    {/* ═══════════════════════════════════════════ */}
                    {visibleItems.map(({ flatItem, index, zone }) => {
                        const node = nodeMap.get(flatItem.id)!
                        const isExpanded = expandedIds.has(flatItem.id)
                        const indent = flatItem.level * 24 + 8
                        const colors = ZONE_COLORS[zone]
                        const isViewport = zone === ZONE.VIEWPORT

                        return (
                            <div
                                key={flatItem.id}
                                className={`tree-row tree-row-${zone}`}
                                style={{
                                    position: 'absolute',
                                    top: index * ITEM_HEIGHT,
                                    height: ITEM_HEIGHT,
                                    left: 0,
                                    right: 0,
                                    display: 'flex',
                                    alignItems: 'center',
                                    paddingLeft: indent,
                                    background: colors.bg,
                                    borderBottom: `1px solid ${isViewport ? '#f0f0f0' : colors.border}`,
                                }}
                            >
                                {/* 行号标记 */}
                                <span
                                    className="debug-row-num"
                                    style={{
                                        fontSize: 9,
                                        color: '#bbb',
                                        fontFamily: 'monospace',
                                        width: 50,
                                        flexShrink: 0,
                                        textAlign: 'right',
                                        marginRight: 4,
                                    }}
                                >
                                    #{index}
                                </span>

                                {/* 展开/收起箭头 */}
                                {node.hasChildren && loadingIds.has(flatItem.id) ? (
                                    <span className="tree-toggle tree-toggle-loading">
                                        <span className="tree-spinner" />
                                    </span>
                                ) : (
                                    <span
                                        className="tree-toggle"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            if (node.hasChildren) onToggleExpand(flatItem.id)
                                        }}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && node.hasChildren) {
                                                onToggleExpand(flatItem.id)
                                            }
                                        }}
                                    >
                                        {node.hasChildren ? (isExpanded ? '▼' : '▶') : '·'}
                                    </span>
                                )}

                                {/* 标签 */}
                                <span
                                    className="tree-label"
                                    style={{
                                        fontWeight: flatItem.level === 0 ? 600 : 400,
                                        color: flatItem.level <= 1 ? '#1a1a1a' : '#333',
                                    }}
                                    title={`${node.label} — 层级 ${flatItem.level} — 区域: ${zone}`}
                                >
                                    {node.label}
                                </span>

                                {/* 子节点数量徽章 */}
                                {node.hasChildren && (
                                    <span className="tree-badge">
                                        {node.childrenLoaded
                                            ? node.childrenIds.length
                                            : node.totalChildrenCount}
                                    </span>
                                )}

                                {/* zone 标记 */}
                                <span
                                    style={{
                                        fontSize: 9,
                                        color: isViewport ? '#52c41a' : '#fa8c16',
                                        marginRight: 8,
                                        flexShrink: 0,
                                        fontFamily: 'monospace',
                                        fontWeight: 600,
                                    }}
                                >
                                    {isViewport ? 'VISIBLE' : 'BUFFER'}
                                </span>

                                {/* 节点 ID */}
                                <span className="tree-id">{flatItem.id}</span>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* ═══════════════════════════════════════════ */}
            {/*  调试面板 (固定定位)                        */}
            {/* ═══════════════════════════════════════════ */}
            <div className="debug-panel">
                <div className="debug-panel-title">虚拟滚动调试面板</div>

                <div className="debug-panel-grid">
                    <span className="debug-panel-label">scrollTop</span>
                    <span className="debug-panel-value">{scrollTop.toLocaleString()} px</span>

                    <span className="debug-panel-label">容器高度</span>
                    <span className="debug-panel-value">{containerHeight} px</span>

                    <span className="debug-panel-label">总行数 (flatList)</span>
                    <span className="debug-panel-value">{flatList.length.toLocaleString()}</span>

                    <span className="debug-panel-label">总高度</span>
                    <span className="debug-panel-value">{totalHeight.toLocaleString()} px</span>
                </div>

                <div className="debug-panel-divider" />

                <div className="debug-panel-grid">
                    <span className="debug-panel-label">渲染范围</span>
                    <span className="debug-panel-value">
                        [{renderStart.toLocaleString()}, {renderEnd.toLocaleString()})
                    </span>

                    <span className="debug-panel-label">视口范围</span>
                    <span className="debug-panel-value">
                        [{viewportStart.toLocaleString()},{' '}
                        {Math.min(viewportEnd, flatList.length).toLocaleString()})
                    </span>

                    <span className="debug-panel-label">渲染行数</span>
                    <span className="debug-panel-value">{renderedCount} 行</span>

                    <span className="debug-panel-label">视口行数</span>
                    <span className="debug-panel-value">{viewportCount} 行</span>

                    <span className="debug-panel-label">overscan 缓冲区</span>
                    <span className="debug-panel-value">{OVERSCAN} 行</span>

                    <span className="debug-panel-label">DOM 节省</span>
                    <span className="debug-panel-value debug-panel-value-highlight">
                        {flatList.length > 0
                            ? `${((1 - renderedCount / flatList.length) * 100).toFixed(1)}%`
                            : '—'}
                    </span>
                </div>

                <div className="debug-panel-divider" />

                <div className="debug-panel-legend">
                    <div className="debug-legend-item">
                        <span
                            className="debug-legend-swatch"
                            style={{ background: '#fff', border: '1px solid #d9d9d9' }}
                        />
                        视口内 (VISIBLE)
                    </div>
                    <div className="debug-legend-item">
                        <span
                            className="debug-legend-swatch"
                            style={{ background: '#fff7e6', border: '1px solid #ffd591' }}
                        />
                        上缓冲区 (BUFFER)
                    </div>
                    <div className="debug-legend-item">
                        <span
                            className="debug-legend-swatch"
                            style={{ background: '#e6f7ff', border: '1px solid #91d5ff' }}
                        />
                        下缓冲区 (BUFFER)
                    </div>
                    <div className="debug-legend-item">
                        <span className="debug-legend-line-swatch debug-legend-line-viewport" />
                        视口边界
                    </div>
                    <div className="debug-legend-item">
                        <span className="debug-legend-line-swatch debug-legend-line-overscan" />
                        overscan 边界
                    </div>
                </div>
            </div>
        </>
    )
}

export default React.memo(TreeVirtualList)
