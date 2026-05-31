// GSSC流水线是AI智能体领域中，用于自动化构建和管理模型上下文的一套标准化核心框架（通常由 ContextBuilder 上下文构建器来实现）。
// 它的核心设计目标是将复杂的上下文编排工作工程化，把原本需要反复编写的模板代码，转变为一个可复用、可度量、可调试且可演进的自动化信息流管理系统。
// GSSC 是四个核心阶段的英文首字母缩写，具体流程如下：
// 汇集 (Gather)：这是信息收集的起点。系统会从多个来源汇集所有可能进入上下文的候选信息，例如高优先级的系统指令、用户的最新提问、相关的历史对话、外部知识库（RAG）以及各类工具的输出等。
// 选择 (Select)：这是流水线的核心决策环节。系统会在有限的 Token 预算内，基于“相关性”与“新近性”的加权评分机制，运行贪心算法，优先挑选出价值最高、最契合当前任务的信息片段，同时过滤掉低质量的噪声信息。
// 结构化 (Structure)：被选中的信息不会被随意堆砌，而是会被组织进一个清晰、固定的模板中（例如划分为角色与策略、任务、当前状态、证据、上下文、输出要求等分区）。这种结构化的呈现方式极大地提升了大模型对信息的可读性，也方便了开发者的后续调试。
// 压缩 (Compress)：作为最后一道防线，当精挑细选后的信息总量依然超出模型的 Token 预算时，系统会启动智能摘要策略。它的目标是在缩减 Token 占用的同时，生成一份高保真摘要，尽可能保持原始信息的结构完整性，为长程对话的连贯性兜底

import { LLMConfig, LLMMessage, LLMRequestOptions, LLMResponse, AgentConfig } from '../core/types'
import { ContextConfig } from './config'
import { ContextPacket } from './packet'
export class ContextBuilder {
    config: ContextConfig

    constructor(config: ContextConfig) {
        // TODO
        // 这里似乎是不用写什么东西了，以后再慢慢拓展吧
        this.config = config
    }

    // TODO
    // 简单的中文按 1 token、其他字符按 0.25 估算。用了 OpenAI 的 tiktoken JS 绑定会更精确。
    private countTokens(str: string): number {
        let count = 0
        for (const ch of str) {
            count += /[\u4e00-\u9fff]/.test(ch) ? 1 : 0.25
        }
        return Math.ceil(count)
    }

    //"""汇集所有候选信息
    // Args:
    //     user_query: 用户查询
    //     conversation_history: 对话历史
    //     system_instructions: 系统指令
    //     custom_packets: 自定义信息包
    // Returns:
    //     List[ContextPacket]: 候选信息列表
    // """
    private gather(
        userQuery: string,
        conversationHistory?: LLMMessage[],
        systemInstructions?: string,
        customPacket?: ContextPacket[],
    ): ContextPacket[] {
        let packets: ContextPacket[] = []
        if (systemInstructions) {
            packets.push(
                new ContextPacket(
                    systemInstructions,
                    new Date(),
                    this.countTokens(systemInstructions),
                    1.0,
                    {
                        type: 'systemInstructions',
                        priority: 'high',
                    },
                ),
            )
        }
        // TODO
        // 这里的处理就是在记忆与RAG系统中进行获取信息了

        // TODO
        // 这里主要是添加对话历史的
        if (conversationHistory) {
            for (const his of conversationHistory) {
                packets.push(
                    new ContextPacket(
                        `${his.role}: ${his.content}`,
                        // TODO
                        // 这里可以给LLM message一个时间戳
                        new Date(),
                        this.countTokens(his.content),
                        0.6,
                        {
                            type: 'conversationHistory',
                            role: his.role,
                        },
                    ),
                )
            }
        }
        if (customPacket) {
            packets = packets.concat(customPacket)
        }
        console.log(`ContextBuilder: 汇集${packets.length}个包`)
        return packets
    }

    /**
     *
     * @param packets 候选信息包列表
     * @param userQuery 用户查询(用于计算相关性)
     * @param availableTokens 可用的 token 数量
     * @returns 选中的信息包列表
     */
    private select(
        packets: ContextPacket[],
        userQuery: string,
        availableTokens: number,
    ): ContextPacket[] {
        let selected: ContextPacket[] = []

        let systemPackets = packets.filter((packet) => {
            packet.metadata.type === 'systemInstructions'
        })
        let otherPackets = packets.filter((packet) => {
            packet.metadata.type !== 'systemInstructions'
        })

        const systemTokens = systemPackets.reduce((acc: number, cur) => {
            return acc + cur.tokenCount
        }, 0)

        if (systemTokens > availableTokens) {
            console.warn('select: 系统指令已经将所有的token')
            return systemPackets
        }

        let scoredPackets = []

        for (let packet of otherPackets) {
            // 是默认值0.5，重新计算
            if (packet.relevanceScore === 0.5) {
                packet.relevanceScore = this.calculateRelevance(packet.content, userQuery)
            }
            // 综合分数 = 相关性权重 × 相关性 + 新近性权重 × 新近性
            const combinedScore =
                this.config.recencyWeight * packet.relevanceScore +
                this.config.recencyWeight * this.calculateRecency(packet.timestamp)

            if (packet.relevanceScore >= this.config.minRelevance) {
                scoredPackets.push({ combinedScore, packet })
            }
        }

        scoredPackets.sort((a, b) => a.combinedScore - b.combinedScore)

        selected = systemPackets.slice()
        let currentTokens = systemTokens

        for (const { combinedScore, packet } of scoredPackets) {
            if (currentTokens + packet.tokenCount <= availableTokens) {
                selected.push(packet)
                currentTokens += packet.tokenCount
            } else {
                break
            }
        }

        return selected
    }

    /**
     * @description 使用简单的关键词重叠算法。在生产环境中,可以替换为向量相似度计算。
     * @param content 内容文本
     * @param query 查询文本
     */
    private calculateRelevance(content: string, query: string) {
        const contentWords = new Set(content.toLowerCase().split(/\s+/))
        const queryWords = new Set(query.toLowerCase().split(/\s+/))

        if (queryWords.size === 0) {
            return 0.0
        }

        const intersection = new Set([...contentWords].filter((w) => queryWords.has(w)))
        const union = new Set([...contentWords, ...queryWords])

        return union.size === 0 ? 0.0 : intersection.size / union.size
    }

    private calculateRecency(timestamp: Date): number {
        const now = new Date()

        const ageHours = (now.getTime() - timestamp.getTime()) / 1000 / 3600

        const decayFactor = 0.1
        const recencyScore = Math.exp((-decayFactor * ageHours) / 24)

        return Math.max(0.1, Math.min(1.0, recencyScore))
    }

    /**
     * @description 用来继续对select处理过的数据包继续处理的函数
     * @param selectedPackets 选中的信息包列表
     * @param userQuery 用户查询
     * @returns 结构化的上下文字符串
     */
    private structure(selectedPackets: ContextPacket[], userQuery: string): string {
        let systemInstructions = []
        let evidence = []
        let context = []

        for (let packet of selectedPackets) {
            let packetType = packet.metadata?.type

            if (packetType === 'systemInstructions') {
                systemInstructions.push(packet.content)
            } else if (packetType === 'ragResult' || packetType === 'knowlegde') {
                evidence.push(packet.content)
            } else {
                context.push(packet.content)
            }
        }

        let sections: string[] = []

        if (systemInstructions.length > 0) {
            sections.push(`[Role & Policies]\n${systemInstructions.join('\n')}`)
        }

        sections.push(`[Task]\n${userQuery}`)

        if (evidence.length > 0) {
            sections.push(`[Evidence]\n${evidence.join('\n---\n')}`)
        }

        if (context.length > 0) {
            sections.push(`[Context]\n${context.join('\n')}`)
        }

        sections.push('[Output]\n请基于以上信息，提供准确、有据的回答。')

        return sections.join('\n\n')
    }
    /**
     * @description 对超限上下文进行压缩处理
     * @param context 从structure得到的原始上下文
     * @param maxTokens 最大的词元数量
     * @returns 经过压缩的上下文
     */
    private compress(context: string, maxTokens: number) {
        const currentTokens = this.countTokens(context)

        if (currentTokens <= maxTokens) return context

        console.log(`上下文超限currentTokens: ${currentTokens} > maxTokens: ${maxTokens}，进行压缩`)
        // TODO
        // 这里我就先不写了，懒，以后再实现吧
        return context
    }

    build(
        userQuery: string,
        systemInstructions: string,
        conversationHistory: LLMMessage[],
    ): string {
        let gatherPackets = this.gather(userQuery, conversationHistory, systemInstructions)
        // TODO
        // 这里的1000是我随便填的
        let selectedPackets = this.select(gatherPackets, userQuery, 1000)

        let context = this.structure(selectedPackets, userQuery)

        // TODO
        // 这里的3000是我随便填的
        let compressedContext = this.compress(context, 3000)
        return compressedContext
    }
}
