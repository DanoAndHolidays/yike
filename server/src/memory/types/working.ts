/**
 * 工作记忆是记忆系统中最活跃的部分，它负责存储当前对话会话中的临时信息。
 * 工作记忆的设计重点在于快速访问和自动清理，这种设计确保了系统的响应速度和资源效率。
 *
 * 工作记忆采用了纯内存存储方案，配合TTL（Time To Live）机制进行自动清理。
 * 这种设计的优势在于访问速度极快，但也意味着工作记忆的内容在系统重启后会丢失。
 */

import { MemoryItem, MemoryConfig } from '../base'

export class WorkingMemory {
    maxCapicity: number = 50
    maxAgeMinutes: number = 60
    memories: MemoryItem[] = []
    constructor(config: MemoryConfig) {
        this.maxAgeMinutes = config.maxAgeMinutes
        this.maxCapicity = config.maxCapicity
    }

    /**
     * add memory
     * @param memoryItem 添加的记忆
     * @returns 返回添加记忆的id
     */
    add(memoryItem: MemoryItem) {
        // 清理过期记忆
        this.expireOldMemories()

        if (this.memories.length >= this.maxCapicity) {
            // TODO
            // 管理容量，再次清理
            // 暂时暴力清除多余的
            this.memories = this.memories.slice(0, this.maxCapicity)
        }

        this.memories.push(memoryItem)
        return memoryItem.id
    }

    /**
     * 检索记忆
     * @param query 查询文本
     * @param limit 返回数量限制
     * @param options 可选参数
     * @returns 匹配的记忆列表
     */
    retrieve(query: string, limit: number, options?: Record<string, any>): MemoryItem[] {
        // 清理过期记忆
        this.expireOldMemories()

        // 计算每个记忆的相关性分数
        const scoredMemories: Array<{ score: number; memory: MemoryItem }> = []

        for (const memory of this.memories) {
            const keywordScore = this.calculateKeywordScore(query, memory.content)

            // 混合评分：向量 * 0.7 + 关键词 * 0.3
            // 向量检索暂未实现，先用关键词
            const baseRelevance = keywordScore

            // 时间衰减
            const timeDecay = this.calculateTimeDecay(memory.timestamp)

            // 重要性权重
            const importanceWeight = 0.8 + memory.importance * 0.4

            // 最终分数
            const finalScore = baseRelevance * timeDecay * importanceWeight

            if (finalScore > 0) {
                scoredMemories.push({ score: finalScore, memory })
            }
        }

        // 按分数降序排序
        scoredMemories.sort((a, b) => b.score - a.score)

        // 返回前 limit 个
        return scoredMemories.slice(0, limit).map((item) => item.memory)
    }

    /**
     * 计算关键词匹配分数
     */
    private calculateKeywordScore(query: string, content: string): number {
        if (!query || !content) return 0

        const queryWords = query.toLowerCase().split(/\s+/)
        const contentLower = content.toLowerCase()

        let matchCount = 0
        for (const word of queryWords) {
            if (contentLower.includes(word)) {
                matchCount++
            }
        }

        return queryWords.length > 0 ? matchCount / queryWords.length : 0
    }

    /**
     * 计算时间衰减
     */
    private calculateTimeDecay(timestamp: number): number {
        const now = Date.now()
        const ageMinutes = (now - timestamp) / (1000 * 60)
        const decayFactor = 0.95 // 每分钟衰减5%

        return Math.pow(decayFactor, ageMinutes)
    }

    /**
     * 清理过期记忆
     */
    private expireOldMemories(): void {
        const now = Date.now()
        const maxAgeMs = this.maxAgeMinutes * 60 * 1000

        this.memories = this.memories.filter((memory) => now - memory.timestamp < maxAgeMs)
    }
}
