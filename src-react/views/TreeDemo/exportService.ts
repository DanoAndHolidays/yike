import * as XLSX from 'xlsx'
import type { FlatItem } from './TreeVirtualList'
import type { TreeData } from './mockData'

// ── Types ────────────────────────────────────────────────

export interface ExportConfig {
  pageSize: number
  failureRate: number
}

export interface ExportProgress {
  totalPages: number
  completedPages: number
  successfulPages: number
  failedPages: Map<number, string>
  currentPage: number
  status: 'idle' | 'running' | 'paused' | 'completed' | 'cancelled'
}

export interface ExportOptions {
  /** Skip already-processed pages (page indices to skip) */
  skipPages?: Set<number>
  /** Continue from previously collected data */
  existingData?: FlatItem[]
  /** Previously failed pages to merge with */
  existingFailures?: Map<number, string>
  /** Existing count of successful pages (for resume progress) */
  existingSuccessCount?: number
  /** Existing count of completed pages (for resume progress) */
  existingCompletedCount?: number
  /** If true, don't increment completedPages (retry mode) */
  isRetry?: boolean
}

export interface ExportResult {
  collectedData: FlatItem[]
  failedPages: Map<number, string>
  status: 'completed' | 'cancelled'
}

// ── Helpers ──────────────────────────────────────────────

function delay(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms)
    signal.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    })
  })
}

// ── Exporter Class ───────────────────────────────────────

export class PaginatedExporter {
  private config: ExportConfig

  constructor(config: ExportConfig) {
    this.config = config
  }

  /** Simulate a single page fetch from "API" */
  private async simulateFetchPage(
    pageData: FlatItem[],
    pageIndex: number,
    signal: AbortSignal,
  ): Promise<FlatItem[]> {
    // Simulate network delay 200-400ms
    await delay(200 + Math.random() * 200, signal)

    // Simulate random failure
    if (Math.random() < this.config.failureRate) {
      throw new Error(`第 ${pageIndex + 1} 页加载失败：模拟网络错误`)
    }

    return pageData
  }

  /** Main export loop, supports resume via options.skipPages */
  async startExport(
    allData: FlatItem[],
    signal: AbortSignal,
    onProgress: (progress: ExportProgress) => void,
    options: ExportOptions = {},
  ): Promise<ExportResult> {
    const { pageSize } = this.config
    const totalPages = Math.ceil(allData.length / pageSize)
    const skipPages = options.skipPages ?? new Set<number>()
    const failedPages = new Map(options.existingFailures ?? [])
    const collectedData: FlatItem[] = options.existingData ?? []

    let successfulPages = options.existingSuccessCount ?? 0
    let completedPages = options.existingCompletedCount ?? skipPages.size

    const progress: ExportProgress = {
      totalPages,
      completedPages,
      successfulPages,
      failedPages,
      currentPage: 0,
      status: 'running',
    }

    for (let i = 0; i < totalPages; i++) {
      // Skip already-processed pages on resume
      if (skipPages.has(i)) continue

      if (signal.aborted) {
        progress.status = 'paused'
        onProgress({ ...progress, failedPages: new Map(failedPages) })
        return { collectedData, failedPages, status: 'cancelled' }
      }

      progress.currentPage = i
      onProgress({ ...progress, failedPages: new Map(failedPages) })

      const start = i * pageSize
      const end = Math.min(start + pageSize, allData.length)
      const pageData = allData.slice(start, end)

      try {
        const result = await this.simulateFetchPage(pageData, i, signal)
        collectedData.push(...result)
        successfulPages++
        // Remove from failed if this is a retry
        failedPages.delete(i)
      } catch (err: any) {
        if (err.name === 'AbortError') {
          progress.status = 'paused'
          onProgress({ ...progress, failedPages: new Map(failedPages) })
          return { collectedData, failedPages, status: 'cancelled' }
        }
        failedPages.set(i, err.message || '未知错误')
      }

      if (!options.isRetry) {
        completedPages++
      }
      progress.completedPages = completedPages
      progress.successfulPages = successfulPages
    }

    progress.status = 'completed'
    progress.currentPage = totalPages
    onProgress({ ...progress, failedPages: new Map(failedPages) })

    return { collectedData, failedPages, status: 'completed' }
  }

  /** Generate Excel workbook from collected data */
  generateExcelBlob(data: FlatItem[], treeData: TreeData): Blob {
    const { nodeMap } = treeData

    const rows = data.map((item, idx) => {
      const node = nodeMap.get(item.id)
      return {
        '序号': idx + 1,
        '节点ID': item.id,
        '标签': node?.label ?? '',
        '层级': item.level,
        '父节点ID': node?.parentId ?? '',
        '子节点数': node?.totalChildrenCount ?? 0,
        '是否叶子': node?.hasChildren ? '否' : '是',
      }
    })

    const ws = XLSX.utils.json_to_sheet(rows)
    // Set column widths
    ws['!cols'] = [
      { wch: 8 },
      { wch: 14 },
      { wch: 24 },
      { wch: 8 },
      { wch: 14 },
      { wch: 12 },
      { wch: 10 },
    ]

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'TreeData')

    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    return new Blob([buf], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
  }

  /** Download Excel file */
  downloadExcel(blob: Blob, filename?: string): void {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename ?? `tree-export-${Date.now()}.xlsx`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
}

// ── Error Report ─────────────────────────────────────────

export function generateErrorReport(
  failedPages: Map<number, string>,
  totalPages: number,
): string {
  if (failedPages.size === 0) return ''

  const indices = Array.from(failedPages.keys()).sort((a, b) => a - b)
  const pageNums = indices.map((i) => `第 ${i + 1}`).join('、')
  const succeededCount = totalPages - failedPages.size

  return `${pageNums} 页导出失败，已导出其余 ${succeededCount} 页。您可点击「重试失败页」按钮重新导出失败部分。`
}

/** Format page ranges for compact display (e.g., "3-5, 7, 10-12") */
export function formatFailedPageRanges(indices: number[]): string {
  if (indices.length === 0) return ''
  const sorted = [...indices].sort((a, b) => a - b)
  const ranges: string[] = []
  let start = sorted[0]
  let end = sorted[0]

  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === end + 1) {
      end = sorted[i]
    } else {
      ranges.push(start === end ? `第 ${start + 1} 页` : `第 ${start + 1}-${end + 1} 页`)
      start = sorted[i]
      end = sorted[i]
    }
  }
  ranges.push(start === end ? `第 ${start + 1} 页` : `第 ${start + 1}-${end + 1} 页`)

  return ranges.join('、')
}
