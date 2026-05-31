// import { randomUUID } from 'crypto'
// id = randomUUID() ——Python dataclass 里没这个字段，但作为信息包，在后续 Select→Structure→Compress 流水线里需要唯一标识来去重和追踪来源，加在这里最自然，构造即获取。
// 我先没加，以后再说吧
export class ContextPacket {
    // id: string
    content: string
    timestamp: Date
    tokenCount: number
    relevanceScore: number
    metadata: Record<string, unknown>

    constructor(
        content: string,
        timestamp: Date,
        tokenCount: number,
        relevanceScore: number = 0.5,
        metadata: Record<string, unknown> | null = null,
    ) {
        // this.id = randomUUID()
        this.content = content
        this.timestamp = timestamp
        this.tokenCount = tokenCount
        // 这里的relevanceScore实际就是在 0.0 - 1.0 之间的一个数，如果不是，就会强制的转换为这个范围中
        this.relevanceScore = Math.max(0.0, Math.min(1.0, relevanceScore))
        this.metadata = metadata ?? {}
    }
}
