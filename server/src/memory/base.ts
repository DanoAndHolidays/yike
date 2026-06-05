// 记忆项
export interface MemoryItem {
    id: string
    content: string
    importance: number // 0-1
    timestamp: number // 时间戳
    memoryType?: string
    metadata?: Record<string, any>
}

// 记忆配置
export interface MemoryConfig {
    maxCapicity: number
    maxAgeMinutes: number
}

export class MemoryStore {}
