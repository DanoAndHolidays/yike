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

import { PlanAndSolveAgent } from './plan_and_solve_agent'

// function buildPlanerPrompt(question: string): string {

// }

// a simple plan and solve agent
export class ReflectionAgent extends Agent {
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

    buildReflectPrompt(task: string, content: string) {
        return `
请仔细审查以下回答，并找出可能的问题或改进空间:

# 原始任务:
${task}

# 当前回答:
${content}

请分析这个回答的质量，指出不足之处，并提出具体的改进建议。
如果回答已经很好，请回答"无需改进"。
`
    }

    buildRefinePrompt(task: string, last_attempt: string, feedback: string) {
        return `
请根据反馈意见改进你的回答:

# 原始任务:
${task}

# 上一轮回答:
${last_attempt}

# 反馈意见:
${feedback}

请提供一个改进后的回答。
`
    }

    // parseReflectOutput(planerPrompt: string): string[] {
    //     const match = planerPrompt.match(/\[[\s\S]*\]/)

    //     if (match) {
    //         const jsonString = match[0] // 拿到纯净的 JSON 字符串
    //         const taskList = JSON.parse(jsonString)
    //         // console.log(taskList)
    //         return taskList
    //     } else {
    //         console.log('没有找到数组内容')
    //         return []
    //     }
    // }

    async run(inputText: string, options?: Record<string, any>): Promise<string> {
        console.log(
            `${this.name} 正在反思: 
            ${inputText}\n`,
            options?.result,
        )

        // 当前的结果
        let res = options?.result
        let currentStep = 0
        let lastAttempt = ''
        // let currentContent = ''

        while (currentStep < this.maxStep) {
            console.log(`
                ============第${currentStep + 1}轮反思==========\n
                `)

            // 进行反思，获取反思结果，或者返回结果无需改进
            let reflectPrompt = this.buildReflectPrompt(inputText, res)
            console.log('\n当前反思提示词: \n', reflectPrompt)

            const messages: LLMMessage[] = [{ role: 'user', content: reflectPrompt }]
            let reflect = await llm.chat({ messages })
            let feedback = reflect.choices[0]?.message?.content || ''
            console.log(feedback)

            if (feedback.includes('无需改进')) {
                return `\n\n\n ==最=终=答=案==\n\n\n` + res 
                // break
            }

            lastAttempt = res

            let refinePrompt = this.buildRefinePrompt(inputText, res, feedback)
            console.log('\n当前优化提示词: \n', refinePrompt)

            const messages2: LLMMessage[] = [{ role: 'user', content: refinePrompt }]
            let refine = await llm.chat({ messages: messages2 })
            let shit = refine.choices[0]?.message?.content || ''
            console.log(shit)

            res = shit

            currentStep++
        }

        return '失败'
    }
}

const llm = new LLMClient({
    provider: 'deepseek',
    apiKey: process.env.DEEPSEEK_API_KEY || '',
    baseURL: 'https://api.deepseek.com',
    model: 'deepseek-chat',
})

// // console.log(process.env);

const reflectionAgent = new ReflectionAgent(
    llm,
    'reflectionAgent',
    { shit: 'test' },
    '你是一个友好的AI助手，用中文回答。',
    undefined,
    false,
    5,
    '',
)

reflectionAgent
    .run(
        '一个水果店周一卖出了15个苹果。周二卖出的苹果数量是周一的两倍。周三卖出的数量比周二少了5个。请问这三天总共卖出了多少个苹果？',
        {
            result: `
第1步的结果：15乘以2等于30
第2步的结果：第2步的结果：30减去56等于-26
第3步的结果：第3步的结果：15加30加(-26)等于19`,
        },
    )
    .then(console.log)
