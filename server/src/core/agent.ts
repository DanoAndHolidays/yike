import { LLMClient } from './client.js'
import { LLMConfig, LLMMessage, LLMRequestOptions, LLMResponse, AgentConfig } from './types.js'

// 实现agent基类，用于继承扩展
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

    run(inputText: string) {
        // TODO
        // 由于js原生没有 abstract 关键字来直接声明抽象类和抽象方法，这里就先这样了
        console.log(inputText)
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
