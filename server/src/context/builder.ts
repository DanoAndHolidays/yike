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
                    new Date().getTime(),
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
                        new Date().getTime(),
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

    //     """选择最相关的信息包

    // Args:
    //     packets: 候选信息包列表
    //     user_query: 用户查询(用于计算相关性)
    //     available_tokens: 可用的 token 数量

    // Returns:
    //     List[ContextPacket]: 选中的信息包列表
    // """
    private select(
        packets: ContextPacket[],
        userQuery: string,
        availableTokens: number,
    ): ContextPacket[] {
        let selected: ContextPacket[] = []

        return selected
    }

    private structure() {}

    private compress() {}

    build() {}
}
