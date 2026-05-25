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

const MOCK_TOOLS: Record<string, { description: string; fn: (args: string) => string }> = {
    get_weather: {
        description: '获取指定城市的天气信息，输入城市名，返回天气状况和温度',
        fn: (city: string) => {
            const weatherMap: Record<string, string> = {
                北京: '晴，15-28°C',
                上海: '多云，20-26°C',
                广州: '雨，24-30°C',
                深圳: '晴，25-31°C',
            }
            return weatherMap[city] || '暂无该城市天气数据'
        },
    },
    search_attractions: {
        description: '搜索旅游景点，输入城市名，返回热门景点列表',
        fn: (city: string) => {
            const attractionsMap: Record<string, string> = {
                北京: '故宫、天安门、长城、颐和园、天坛',
                上海: '外滩、东方明珠、豫园、田子坊',
                广州: '广州塔、珠江新城、北京路、沙面',
            }
            return attractionsMap[city] || '暂无该城市景点数据'
        },
    },
    calculate: {
        description: '数学计算器，输入数学表达式，返回计算结果',
        fn: (expr: string) => {
            try {
                const result = eval(expr)
                return String(result)
            } catch {
                return '计算表达式有误'
            }
        },
    },
}

function formatTools(toolRegistry: Record<string, any>): string {
    const toolList = Object.entries(toolRegistry)
        .map(([name, tool]) => `- ${name}: ${tool.description}`)
        .join('\n')
    return toolList || '没有可用的工具'
}

function buildPrompt(tools: string, question: string, history: string[]): string {
    return `你是一个具备推理和行动能力的AI助手。你可以通过思考分析问题，然后调用合适的工具来获取信息，最终给出准确的答案。

## 可用工具
${tools}

## 工作流程
请严格按照以下格式进行回应，每次只能执行一个步骤:

Thought: 分析当前问题，思考需要什么信息或采取什么行动。
Action: 选择一个行动，格式必须是以下之一:
- 'tool_name[tool_input]' - 调用指定工具
- 'Finish[最终答案]' - 当你有足够信息给出最终答案时

## 重要提醒
1. 每次回应必须包含Thought和Action两部分
2. 工具调用的格式必须严格遵循:工具名[参数]
3. 只有当你确信有足够信息回答问题时，才使用Finish
4. 如果工具返回的信息不够，继续使用其他工具或相同工具的不同参数

## 当前任务
**Question:** ${question}

## 执行历史
${history.length > 0 ? history.join('\n') : '(无)'}

现在开始你的推理和行动:
`
}

// a simple react agent
export class ReactAgent extends Agent {
    toolRegistry: any
    enableToolCalling: boolean
    maxStep: number
    currentHistory: string[]
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

        console.log('基础信息: ',this.getInfo())

        console.log(`ReactAgent ${name} 构建成功，最大步数${maxStep}`)
    }

    buildPrompt(toolsDesc: string, question: string, history: string[]): string {
        return buildPrompt(toolsDesc, question, history)
    }

    parseOutput(responseWithThoughtAndAction: string) {
        let thought = ''
        let action = ''

        const thoughtMatch = responseWithThoughtAndAction.match(
            /Thought:\s*([\s\S]*?)(?=\s*Action:)/,
        )
        if (thoughtMatch && thoughtMatch[1]) {
            thought = thoughtMatch[1].trim()
        }

        const actionMatch = responseWithThoughtAndAction.match(/Action:\s*([\s\S]*)/)
        if (actionMatch && actionMatch[1]) {
            action = actionMatch[1].trim()
        }

        return { thought, action }
    }

    executeTool(action: string, toolRegistry: Record<string, any>): string {
        // 匹配格式: tool_name[args]
        const match = action.match(/^(\w+)\[(.+)\]$/)
        if (!match) {
            return `无法解析工具调用: ${action}`
        }

        const toolName = match[1]
        const toolArgs = match[2]
        const tool = toolRegistry[toolName]

        if (!tool) {
            return `工具不存在: ${toolName}`
        }

        try {
            return tool.fn(toolArgs)
        } catch (e) {
            return `工具执行错误: ${e}`
        }
    }

    async run(inputText: string): Promise<string> {
        console.log(`${this.name} 正在处理: ${inputText}`)

        let currentStep = 0
        while (currentStep < this.maxStep) {
            console.log(`\n当前第${currentStep + 1}步`)

            const toolsDesc = formatTools(MOCK_TOOLS)
            const stepHistory = [...this.currentHistory]
            // console.log(stepHistory)

            const prompt = buildPrompt(toolsDesc, inputText, stepHistory)
            // console.log(prompt)

            const messages: LLMMessage[] = [{ role: 'user', content: prompt }]

            if (!this.enableToolCalling) {
                const response = await this.llm.chat({ messages })
                // console.log(response);

                const content = response.choices[0]?.message?.content || ''
                const { thought, action } = this.parseOutput(content)

                console.log(`\nThought: ${thought}`)
                console.log(`\nAction: ${action}`)

                // 处理 Action
                if (action.startsWith('Finish[')) {
                    console.log(`\n最终答案: ${action.slice(7, -1)}`)
                    return action.slice(7, -1)
                    // TODO
                    // 这里要将对话的历史添加到this._history中去，而详细的React的步骤就不用去添加了
                }

                // 执行工具
                const toolResult = this.executeTool(action, MOCK_TOOLS)
                console.log(`工具执行结果: ${toolResult}`)

                // 添加到历史
                this.currentHistory.push(
                    `步骤${currentStep + 1}:\nAction: ${action} Observation: ${toolResult}`,
                )
            }

            currentStep++
        }

        return '达到最大步数限制'
    }
}

const llm = new LLMClient({
    provider: 'deepseek',
    apiKey: process.env.DEEPSEEK_API_KEY || '',
    baseURL: 'https://api.deepseek.com',
    model: 'deepseek-chat',
})

// // console.log(process.env);

const reactAgent = new ReactAgent(
    llm,
    'ReactAgent',
    { shit: 'test' },
    '你是一个友好的AI助手，用中文回答。',
    undefined,
    false,
    5,
    '',
)

reactAgent.run('给我安排去北京上海的旅行').then(console.log)
