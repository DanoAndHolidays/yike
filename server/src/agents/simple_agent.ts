import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

import { LLMClient } from 'src/core/client'
import { Agent } from '../core/agent'
import { LLMConfig, LLMMessage, LLMRequestOptions, LLMResponse, AgentConfig } from '../core/types'

// a simple agent
export class SimpleAgent extends Agent {
    toolRegistry: any
    enableToolCalling: boolean
    constructor(
        llm: LLMClient,
        name: string,
        config: AgentConfig,
        systemPropmt: string,
        toolRegistry?: any,
        enableToolCalling: boolean = true,
    ) {
        super(llm, name, config, systemPropmt)
        this.toolRegistry = toolRegistry
        this.enableToolCalling = enableToolCalling && toolRegistry

        console.log(`Agent ${name} 构建成功`)
    }

    async run(inputText: string): Promise<string> {
        console.log(`${this.name} 正在处理: ${inputText}`)

        const messages: LLMMessage[] = []

        if (this.systemPropmt) {
            messages.push({
                role: 'system',
                content: this.systemPropmt,
            })
        }

        for (const msg of this._history) {
            messages.push({
                role: msg.role,
                content: msg.content,
            })
        }

        messages.push({
            role: 'user',
            content: inputText,
        })

        if (!this.enableToolCalling) {
            const response = await this.llm.chat({ messages })
            const content = response.choices[0]?.message?.content || ''
            this.addMessage({ role: 'assistant', content })
            console.log(`响应完成: ${content}`)
            console.log(messages, this._history)
            return content
        }

        return '含有工具的调用没有实现'
    }
}

const llm = new LLMClient({
    provider: 'custom',
    apiKey: process.env.DEEPSEEK_API_KEY || '',
    baseURL: 'https://api.deepseek.com',
    model: 'deepseek-chat',
})

const simpleAgent = new SimpleAgent(
    llm,
    '测试助手',
    { shit: 'test' },
    '你是一个友好的AI助手，用中文回答。',
    undefined,
    false,
)

simpleAgent.run('你好，请用一句话介绍自己').then(console.log)
