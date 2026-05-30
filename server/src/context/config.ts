import assert from 'node:assert'
// Attributes:
//     max_tokens: 最大 token 数量
//     reserve_ratio: 为系统指令预留的比例(0.0-1.0)
//     min_relevance: 最低相关性阈值(0.0-1.0)
//     enable_compression: 是否启用压缩
//     recency_weight: 新近性权重(0.0-1.0)
//     relevance_weight: 相关性权重(0.0-1.0)
// """
export class ContextConfig {
    maxToken: number
    reserveRatio: number
    minRelevance: number
    enableCompression: boolean
    recencyWeight: number
    relevanceWeight: number

    constructor(
        maxToken: number = 3000,
        reserveRatio: number = 0.2,
        minRelevance: number = 0.1,
        enableCompression: boolean = true,
        recencyWeight: number = 0.3,
        relevanceWeight: number = 0.7,
    ) {
        assert(reserveRatio >= 0.0 && reserveRatio <= 1.0, 'reserveRatio 必须在 [0, 1] 范围内')
        assert(minRelevance >= 0.0 && minRelevance <= 1.0, 'minRelevance 必须在 [0, 1] 范围内')
        assert(
            Math.abs(recencyWeight + relevanceWeight - 1.0) < 1e-6,
            'recencyWeight + relevanceWeight 必须等于 1.0',
        )
        this.maxToken = maxToken
        this.reserveRatio = reserveRatio
        this.minRelevance = minRelevance
        this.enableCompression = enableCompression
        this.recencyWeight = recencyWeight
        this.relevanceWeight = relevanceWeight
    }
}
