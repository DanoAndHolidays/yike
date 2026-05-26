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

function buildPlanerPrompt(question: string): string {
    return `
你是一个顶级的AI规划专家。你的任务是将用户提出的复杂问题分解成一个由多个简单步骤组成的行动计划。
请确保计划中的每个步骤都是一个独立的、可执行的子任务，并且严格按照逻辑顺序排列。
你的输出必须是一个Python列表，其中每个元素都是一个描述子任务的字符串。

问题: ${question}

请严格按照以下格式输出你的计划:
\`\`\`js
["步骤1", "步骤2", "步骤3", ...]
\`\`\`
`
}

function buildExecutorPrompt(
    question: string,
    plan: string[],
    history: string,
    currentStep: number,
): string {
    return `
你是一位顶级的AI执行专家。你的任务是严格按照给定的计划，一步步地解决问题。
你将收到原始问题、完整的计划、以及到目前为止已经完成的步骤和结果。
请你专注于解决"当前步骤"，并仅输出该步骤的最终答案，不要输出任何额外的解释或对话。

# 原始问题:
${question}

# 完整计划:
${plan}

# 历史步骤与结果:
${history.length > 0 ? history : '(无)'}

# 当前步骤:
${currentStep}

请仅输出针对"当前步骤"的回答:
`
}

// a simple plan and solve agent
export class PlanAndSolveAgent extends Agent {
    toolRegistry: any
    enableToolCalling: boolean
    maxStep: number
    currentHistory: string[]
    customPrompt: string
    constructor(
        llm: LLMClient,
        name: string,
        config: AgentConfig,
        systemPropmt: string,
        toolRegistry: any,
        enableToolCalling: boolean = true,
        maxStep: number,
        customPrompt: string,
    ) {
        super(llm, name, config, systemPropmt)
        this.toolRegistry = toolRegistry
        this.enableToolCalling = enableToolCalling && toolRegistry
        this.maxStep = maxStep
        this.currentHistory = []
        this.customPrompt = customPrompt

        console.log('基础信息: ', this.getInfo())

        console.log(`ReactAgent ${name} 构建成功，最大步数${maxStep}`)
    }

    buildPlanerPrompt(question: string) {
        return buildPlanerPrompt(question)
    }

    buildExecutorPrompt(question: string, plan: string[], history: string, currentStep: number) {
        return buildExecutorPrompt(question, plan, history, currentStep)
    }

    parsePlanerOutput(planerPrompt: string): string[] {
        const match = planerPrompt.match(/\[[\s\S]*\]/)

        if (match) {
            const jsonString = match[0] // 拿到纯净的 JSON 字符串
            const taskList = JSON.parse(jsonString)
            // console.log(taskList)
            return taskList
        } else {
            console.log('没有找到数组内容')
            return []
        }
    }

    async run(inputText: string): Promise<string> {
        console.log(`${this.name} 正在处理: ${inputText}`)

        let currentStep = 0
        let history = ''

        let planerPrompt = this.buildPlanerPrompt(inputText)

        const messages: LLMMessage[] = [{ role: 'user', content: planerPrompt }]

        let res = await this.llm.chat({ messages })
        let content = res.choices[0]?.message?.content || ''

        let plan = this.parsePlanerOutput(content)
        plan = plan.map((item, index) => {
            return `\n第${index + 1}步：${item}`
        })
        console.log(`生成的计划：${plan}`)

        while (currentStep < Math.min(this.maxStep, plan.length)) {
            let executorPrompt = buildExecutorPrompt(inputText, plan, history, currentStep + 1)
            // console.log(executorPrompt)

            const messages: LLMMessage[] = [{ role: 'user', content: executorPrompt }]

            let res = await this.llm.chat({ messages })
            let content = res.choices[0]?.message?.content || ''

            history = history.concat(`第${currentStep + 1}步的结果：${content}\n`)

            console.log(`当前执行步骤：${currentStep + 1}，结果：${content}`)

            currentStep++
        }
        // let executorPrompt = buildExecutorPrompt(inputText, plan, history, currentStep+1)
        // console.log(executorPrompt)
        // console.log('历史记录: ', history)

        return history
    }
}

const llm = new LLMClient({
    provider: 'deepseek',
    apiKey: process.env.DEEPSEEK_API_KEY || '',
    baseURL: 'https://api.deepseek.com',
    model: 'deepseek-chat',
})

// // console.log(process.env);

const planAndSolveAgent = new PlanAndSolveAgent(
    llm,
    'planAndSolveAgent',
    { shit: 'test' },
    '你是一个友好的AI助手，用中文回答。',
    undefined,
    false,
    5,
    '',
)

planAndSolveAgent
    .run(
        '一个水果店周一卖出了15个苹果。周二卖出的苹果数量是周一的两倍。周三卖出的数量比周二少了56个。请问这三天总共卖出了多少个苹果？',
    )
    .then(console.log)
