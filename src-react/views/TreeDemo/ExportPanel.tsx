import React, { useState, useRef, useCallback } from 'react'
import { Button, Space, Slider, Select, Tag, Tooltip } from '@arco-design/web-react'
import {
  PaginatedExporter,
  generateErrorReport,
  formatFailedPageRanges,
} from './exportService'
import type { ExportConfig, ExportProgress } from './exportService'
import type { FlatItem } from './TreeVirtualList'
import type { TreeData } from './mockData'

// ── Props ─────────────────────────────────────────────────

interface Props {
  flatList: FlatItem[]
  treeData: TreeData
}

// ── Constants ─────────────────────────────────────────────

const PAGE_SIZE_OPTIONS = [
  { label: '100 条/页', value: 100 },
  { label: '500 条/页', value: 500 },
  { label: '1000 条/页', value: 1000 },
  { label: '2000 条/页', value: 2000 },
]

// ── Page Status Colors ───────────────────────────────────

const PAGE_COLORS: Record<string, { bg: string; border: string }> = {
  pending: { bg: '#f0f0f0', border: '#d9d9d9' },
  running: { bg: '#e6f7ff', border: '#1890ff' },
  success: { bg: '#f6ffed', border: '#52c41a' },
  failed: { bg: '#fff2f0', border: '#ff4d4f' },
}

// ── Component ─────────────────────────────────────────────

const ExportPanel: React.FC<Props> = ({ flatList, treeData }) => {
  // ── Config state ─────────────────────────────────────
  const [pageSize, setPageSize] = useState(500)
  const [failureRate, setFailureRate] = useState(0.05)

  // ── UI display state ─────────────────────────────────
  const [status, setStatus] = useState<ExportProgress['status']>('idle')
  const [totalPages, setTotalPages] = useState(0)
  const [completedPages, setCompletedPages] = useState(0)
  const [successfulPages, setSuccessfulPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [failedPages, setFailedPages] = useState<Map<number, string>>(new Map())
  const [exportRowCount, setExportRowCount] = useState(0)

  // ── Mutable refs (stable, no stale-closure issues) ───
  const exporterRef = useRef<PaginatedExporter | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const processedRef = useRef<Set<number>>(new Set())
  const snapshotRef = useRef<FlatItem[]>([])
  const collectedRef = useRef<FlatItem[]>([])
  const failedRef = useRef<Map<number, string>>(new Map())
  const isRunningRef = useRef(false)
  const successCountRef = useRef(0)
  const completedCountRef = useRef(0)

  // ── Progress callback (stable reference) ─────────────
  const handleProgress = useCallback((p: ExportProgress) => {
    setTotalPages(p.totalPages)
    setCompletedPages(p.completedPages)
    setSuccessfulPages(p.successfulPages)
    setCurrentPage(p.currentPage)
    setFailedPages(p.failedPages)
    setStatus(p.status)
    // Sync to refs for resume
    failedRef.current = p.failedPages
    successCountRef.current = p.successfulPages
    completedCountRef.current = p.completedPages
    // Track processed pages for resume: all pages up to current are "processed"
    for (let i = 0; i < p.totalPages; i++) {
      if (i < p.currentPage || (i === p.currentPage && p.status !== 'running')) {
        processedRef.current.add(i)
      }
    }
  }, [])

  // ── Core export logic ────────────────────────────────
  const runExport = useCallback(
    async (isResume: boolean) => {
      if (isRunningRef.current) return
      isRunningRef.current = true

      const config: ExportConfig = { pageSize, failureRate }
      exporterRef.current = new PaginatedExporter(config)
      abortRef.current = new AbortController()

      const data = isResume ? snapshotRef.current : [...flatList]

      if (!isResume) {
        snapshotRef.current = data
        processedRef.current = new Set()
        collectedRef.current = []
        failedRef.current = new Map()
        successCountRef.current = 0
        completedCountRef.current = 0
        setExportRowCount(0)
      }

      const options = isResume
        ? {
            skipPages: new Set(processedRef.current),
            existingData: [...collectedRef.current],
            existingFailures: new Map(failedRef.current),
            existingSuccessCount: successCountRef.current,
            existingCompletedCount: completedCountRef.current,
          }
        : undefined

      try {
        const result = await exporterRef.current.startExport(
          data,
          abortRef.current.signal,
          handleProgress,
          options,
        )

        collectedRef.current = result.collectedData
        failedRef.current = result.failedPages
        setExportRowCount(result.collectedData.length)
        setFailedPages(result.failedPages)
        setStatus(result.status)
      } finally {
        isRunningRef.current = false
        abortRef.current = null
      }
    },
    [flatList, pageSize, failureRate, handleProgress],
  )

  // ── Public actions ───────────────────────────────────
  const startExport = useCallback(() => {
    setStatus('running')
    runExport(false)
  }, [runExport])

  const pauseExport = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  const resumeExport = useCallback(() => {
    setStatus('running')
    runExport(true)
  }, [runExport])

  const cancelExport = useCallback(() => {
    abortRef.current?.abort()
    processedRef.current = new Set()
    collectedRef.current = []
    failedRef.current = new Map()
    successCountRef.current = 0
    completedCountRef.current = 0
    setStatus('idle')
    setExportRowCount(0)
    setFailedPages(new Map())
    setCompletedPages(0)
    setSuccessfulPages(0)
    setCurrentPage(0)
    setTotalPages(0)
  }, [])

  const retryFailed = useCallback(() => {
    if (failedRef.current.size === 0) return

    // Build skip set: skip all pages except failed ones
    const totalP = Math.ceil(snapshotRef.current.length / pageSize)
    const skipPages = new Set<number>()
    const failedSet = new Set(failedRef.current.keys())
    for (let i = 0; i < totalP; i++) {
      if (!failedSet.has(i)) skipPages.add(i)
    }

    processedRef.current = skipPages
    isRunningRef.current = true
    setStatus('running')

    const config: ExportConfig = { pageSize, failureRate }
    exporterRef.current = new PaginatedExporter(config)
    abortRef.current = new AbortController()

    exporterRef.current
      .startExport(
        snapshotRef.current,
        abortRef.current.signal,
        handleProgress,
        {
          skipPages: new Set(skipPages),
          existingData: [...collectedRef.current],
          existingFailures: new Map(), // reset — re-attempting
          existingSuccessCount: successCountRef.current,
          existingCompletedCount: completedCountRef.current,
          isRetry: true,
        },
      )
      .then((result) => {
        collectedRef.current = result.collectedData
        failedRef.current = result.failedPages
        setExportRowCount(result.collectedData.length)
        setFailedPages(result.failedPages)
        setStatus(result.status)
        isRunningRef.current = false
        abortRef.current = null
      })
  }, [pageSize, failureRate, handleProgress])

  const downloadExcel = useCallback(() => {
    const exporter = new PaginatedExporter({ pageSize, failureRate })
    const blob = exporter.generateExcelBlob(collectedRef.current, treeData)
    exporter.downloadExcel(blob)
  }, [treeData, pageSize, failureRate])

  // ── Derived ──────────────────────────────────────────
  const isRunning = status === 'running'
  const isPaused = status === 'paused'
  const isDone = status === 'completed'
  const isIdle = status === 'idle'
  const hasData = exportRowCount > 0
  const hasFailures = failedPages.size > 0
  const estimatedTotalPages = Math.ceil(flatList.length / pageSize)
  const displayTotalPages = totalPages || estimatedTotalPages

  // ── Page status grid ─────────────────────────────────
  const pageStatuses: Array<{ index: number; state: string }> = []
  for (let i = 0; i < estimatedTotalPages; i++) {
    let state: string
    if (failedPages.has(i)) {
      state = 'failed'
    } else if (i < currentPage) {
      state = 'success'
    } else if (i === currentPage && isRunning) {
      state = 'running'
    } else {
      state = 'pending'
    }
    pageStatuses.push({ index: i, state })
  }

  // ── Error report text ────────────────────────────────
  const errorReportText = isDone && hasFailures
    ? generateErrorReport(failedPages, displayTotalPages)
    : ''

  // ── Render ───────────────────────────────────────────
  return (
    <div className="export-panel">
      {/* ── Header ──────────────────────────────────── */}
      <div className="export-header">
        <span className="export-title">分页导出 Excel</span>
        <Tag
          color={
            isIdle ? 'gray' : isRunning ? 'blue' : isPaused ? 'orange' : 'green'
          }
        >
          {isIdle
            ? '就绪'
            : isRunning
              ? '导出中…'
              : isPaused
                ? '已暂停'
                : '已完成'}
        </Tag>
      </div>

      {/* ── Config (idle only) ──────────────────────── */}
      {isIdle && (
        <div className="export-config">
          <div className="export-config-row">
            <span className="export-config-label">每页行数</span>
            <Select
              size="small"
              value={pageSize}
              onChange={(v) => setPageSize(v as number)}
              options={PAGE_SIZE_OPTIONS}
              style={{ width: 140 }}
            />
          </div>
          <div className="export-config-row">
            <span className="export-config-label">
              模拟失败率 {(failureRate * 100).toFixed(0)}%
            </span>
            <Slider
              value={failureRate}
              onChange={(v) => setFailureRate(v as number)}
              min={0}
              max={0.3}
              step={0.01}
              style={{ width: 160 }}
            />
          </div>
          <div className="export-config-row">
            <span className="export-config-label">
              总数据 <em>{flatList.length.toLocaleString()}</em> 行，预计{' '}
              <em>{estimatedTotalPages}</em> 页
            </span>
          </div>
        </div>
      )}

      {/* ── Buttons ─────────────────────────────────── */}
      <div className="export-actions">
        <Space size="mini">
          {isIdle && (
            <Button
              type="primary"
              size="small"
              onClick={startExport}
              disabled={flatList.length === 0}
            >
              开始导出
            </Button>
          )}
          {isRunning && (
            <Button size="small" status="warning" onClick={pauseExport}>
              暂停
            </Button>
          )}
          {isPaused && (
            <Button type="primary" size="small" onClick={resumeExport}>
              继续导出
            </Button>
          )}
          {(isRunning || isPaused) && (
            <Button size="small" status="danger" onClick={cancelExport}>
              取消
            </Button>
          )}
          {isDone && hasFailures && (
            <Button size="small" status="warning" onClick={retryFailed}>
              重试失败页 ({failedPages.size})
            </Button>
          )}
          {(isDone || (isPaused && hasData)) && (
            <Button type="primary" size="small" onClick={downloadExcel}>
              下载 Excel ({exportRowCount.toLocaleString()} 行)
            </Button>
          )}
        </Space>
      </div>

      {/* ── Progress ────────────────────────────────── */}
      {!isIdle && (
        <div className="export-progress">
          <div className="export-progress-stats">
            <span>
              总页数 <em>{displayTotalPages}</em>
            </span>
            <span>
              已完成 <em>{completedPages}</em>
            </span>
            <span>
              成功{' '}
              <em style={{ color: '#52c41a' }}>{successfulPages}</em>
            </span>
            {hasFailures && (
              <span>
                失败{' '}
                <em style={{ color: '#ff4d4f' }}>{failedPages.size}</em>
              </span>
            )}
          </div>

          {/* Progress bar */}
          <div className="export-progress-bar-track">
            <div
              className="export-progress-bar-fill"
              style={{
                width: `${displayTotalPages > 0 ? (completedPages / displayTotalPages) * 100 : 0}%`,
              }}
            />
          </div>

          {/* Page status grid */}
          <div className="export-page-grid">
            {pageStatuses.map(({ index, state }) => (
              <Tooltip
                key={index}
                content={
                  state === 'failed'
                    ? `第 ${index + 1} 页 - 失败: ${failedPages.get(index) || '未知错误'}`
                    : `第 ${index + 1} 页 - ${
                        state === 'success'
                          ? '成功'
                          : state === 'running'
                            ? '进行中'
                            : '待处理'
                      }`
                }
                position="top"
              >
                <span
                  className={`export-page-dot export-page-${state}`}
                  style={{
                    background: PAGE_COLORS[state].bg,
                    border: `1px solid ${PAGE_COLORS[state].border}`,
                  }}
                />
              </Tooltip>
            ))}
          </div>
        </div>
      )}

      {/* ── Error Report ────────────────────────────── */}
      {isDone && hasFailures && (
        <div className="export-error-report">
          <div className="export-error-title">导出报告</div>
          <p className="export-error-text">{errorReportText}</p>
          <p className="export-error-detail">
            失败页: {formatFailedPageRanges(Array.from(failedPages.keys()))}
          </p>
          <details className="export-error-details">
            <summary>错误详情</summary>
            <ul>
              {Array.from(failedPages.entries())
                .sort(([a], [b]) => a - b)
                .map(([idx, err]) => (
                  <li key={idx}>
                    第 {idx + 1} 页: {err}
                  </li>
                ))}
            </ul>
          </details>
        </div>
      )}

      {/* ── Success Report ──────────────────────────── */}
      {isDone && !hasFailures && (
        <div className="export-success-report">
          全部 <em>{displayTotalPages}</em> 页导出成功，共{' '}
          <em>{exportRowCount.toLocaleString()}</em> 行数据。
        </div>
      )}
    </div>
  )
}

export default React.memo(ExportPanel)
