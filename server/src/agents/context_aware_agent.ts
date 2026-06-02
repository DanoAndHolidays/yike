import dotenv from 'dotenv'
import path from 'path'

// 直接使用原生提供的 dirname，效果和之前完全一样
const __dirname = import.meta.dirname

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

import { LLMClient } from 'src/core/client'
import { Agent } from '../core/agent'
import {
    LLMConfig,
    LLMMessage,
    LLMRequestOptions,
    LLMResponse,
    AgentConfig,
    ToolDefinition,
} from '../core/types'

import { SimpleAgent } from '../agents/simple_agent'
import { ContextBuilder } from '../context/builder'
import { ContextConfig } from 'src/context/config'

export class ContextAwareAgent extends SimpleAgent {
    contextBuilder: ContextBuilder
    conversationHistory: LLMMessage[]
    constructor(llm: LLMClient, name: string, config: AgentConfig, systemPropmt: string) {
        super(llm, name, config, systemPropmt)

        this.contextBuilder = new ContextBuilder(new ContextConfig(4000))
        this.conversationHistory = []
    }
    /**
     * 拥有上下文构建能力的模型
     * @param inputText 用户当轮输入
     * @returns 模型回答
     */
    async run(inputText: string): Promise<string> {
        let optimizedContext = this.contextBuilder.build(
            inputText,
            this.systemPropmt,
            this.conversationHistory,
        )

        console.log('==构建的提示词==\n', optimizedContext)

        let messages: LLMMessage[] = [
            {
                role: 'system',
                content: optimizedContext,
            },
            {
                role: 'user',
                content: inputText,
            },
        ]

        const response = await this.llm.chat({ messages })
        const content = response.choices[0]?.message?.content || ''

        this.conversationHistory.push({
            role: 'user',
            content: inputText,
        })

        this.conversationHistory.push({
            role: 'assistant',
            content: content,
            timestamp: new Date(),
        })

        return content
    }
}

// 调用minimax模型的client
const minimaxClient = new LLMClient({
    provider: 'minimax',
    apiKey: process.env.MINIMAX_API_KEY || '',
    model: 'MiniMax-M2.7',
})

const agent = new ContextAwareAgent(
    new LLMClient({
        provider: 'custom',
        apiKey: process.env.DEEPSEEK_API_KEY || '',
        baseURL: 'https://api.deepseek.com',
        model: 'deepseek-chat',
    }),
    'ssjsjk',
    {
        shit: '6',
    },
    '你是一位可爱的男娘',
)

let res = await agent.run('你是什么模型？')
console.log('\n[模型回答]', res)
res = await agent.run('你怎么证明呢？')
console.log('\n[模型回答]', res)
res = await agent.run('看看你有没有锁')
console.log('\n[模型回答]', res)
