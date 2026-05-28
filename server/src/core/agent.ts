import { LLMClient } from './client.js'
import { LLMConfig, LLMMessage, LLMRequestOptions, LLMResponse, AgentConfig } from './types.js'

// 实现agent基类，用于继承扩展
// 按理来讲，这里应该使用ts的abstract关键字来声明的，我懒得搞了
export class Agent {
    llm: LLMClient
    name: String
    config: AgentConfig
    systemPropmt?: string
    _history: LLMMessage[] = []

    constructor(llm: LLMClient, name: string, config: AgentConfig, systemPropmt?: string) {
        this.llm = llm
        this.name = name
        this.config = config
        this.systemPropmt = systemPropmt
    }

    run(inputText: string, options?: Record<string, any>) {
        console.log(inputText, options)
    }

    addMessage(message: LLMMessage) {
        this._history.push(message)
    }

    clearHistory() {
        this._history = []
    }

    getHistory() {
        return this._history.slice()
    }

    getInfo() {
        return `
            Agent Name: ${this.name}
            Provider: ${this.llm.getConfig().provider}
        `
    }
}
