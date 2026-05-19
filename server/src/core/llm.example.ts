/**
 * LLM 客户端使用示例
 *
 * 本文件演示如何使用 llm.ts 中的客户端与各种大语言模型进行交互
 * 包括：基础对话、流式输出、工具调用、多轮对话等场景
 *
 * 使用方式：
 * 1. 在项目中导入对应的创建函数
 * 2. 配置 API Key 和模型参数
 * 3. 调用 chat 或 streamChat 方法
 */

import {
    // 核心类和类型
    LLMClient,
    LLMMessage,
    LLMRequestOptions,
    ToolDefinition,
    StreamCallbacks,

    // 便捷创建函数
    createLLMClient,
    createOpenAIClient,
    createAnthropicClient,
    createGeminiClient,
    createAzureClient,
    createCustomClient,
    quickChat,
} from './llm.js'

// ==================== 示例 1: 最简用法 ====================

/**
 * 示例：快速发送单条消息（最简单的方式）
 *
 * 适用场景：
 * - 只需一次简单的问答，不需要维护会话状态
 * - 后台任务、简单的文本生成
 *
 * @param userQuestion 用户的问题
 * @returns AI 的回答
 */
export async function simpleChatExample(userQuestion: string): Promise<string> {
    const answer = await quickChat(
        {
            provider: 'openai',
            apiKey: process.env.OPENAI_API_KEY || 'your-api-key',
            model: 'gpt-4o-mini',
        },
        userQuestion,
        '你是一个有帮助的AI助手' // system prompt
    )
    return answer
}

// ==================== 示例 2: 基础对话 ====================

/**
 * 示例：创建客户端并进行多轮对话
 *
 * 适用场景：
 * - 需要维护对话上下文（多轮对话）
 * - 需要更精细地控制参数（temperature、max_tokens 等）
 * - 需要获取 usage 信息（token 消耗）
 */
export async function basicChatExample() {
    /**
     * 步骤 1: 创建客户端实例
     *
     * 参数说明：
     * - provider: 服务提供商，可选 'openai' | 'anthropic' | 'google' | 'azure' | 'custom'
     * - apiKey: 你的 API 密钥
     * - model: 模型名称，不同提供商的模型名称不同
     * - timeout: 请求超时时间（毫秒），默认 60000
     * - defaultOptions: 每次请求的默认参数
     */
    const client = createOpenAIClient(
        process.env.OPENAI_API_KEY || 'sk-xxx',
        'gpt-4o-mini', // 模型名称
        undefined // 使用默认的 OpenAI 官方 endpoint
    )

    /**
     * 步骤 2: 构建消息列表
     *
     * role 说明：
     * - 'system': 系统提示，设定 AI 的角色和行为
     * - 'user': 用户输入
     * - 'assistant': AI 的回复（在多轮对话中需要包含历史回复）
     * - 'tool': 工具调用的结果（function calling）
     */
    const messages: LLMMessage[] = [
        {
            role: 'system',
            content: '你是一位专业的前端开发专家，擅长 Vue3、TypeScript 和 Node.js',
        },
        {
            role: 'user',
            content: '请解释一下 Vue3 的 Composition API 的优势',
        },
    ]

    /**
     * 步骤 3: 发送请求
     *
     * 参数说明（LLMRequestOptions）：
     * - messages: 消息数组（必需）
     * - model: 模型名称（可选，覆盖 client 配置）
     * - temperature: 随机性，0-2，默认 1，越低越确定
     * - max_tokens: 最大生成 token 数
     * - top_p: 核采样，0-1
     * - stream: 是否流式输出（这里是非流式）
     * - tools: 工具定义列表（用于 function calling）
     */
    const response = await client.chat({
        messages,
        temperature: 0.7, // 适中的创造性
        max_tokens: 2000, // 限制回答长度
    })

    /**
     * 步骤 4: 处理响应
     *
     * response 结构：
     * - id: 请求唯一标识
     * - choices: 生成结果数组（通常只有一个）
     *   - message: 生成的消息
     *   - finish_reason: 结束原因（stop/length/tool_calls/content_filter）
     * - usage: token 使用情况
     *   - prompt_tokens: 输入 token 数
     *   - completion_tokens: 生成 token 数
     *   - total_tokens: 总 token 数
     */
    const assistantMessage = response.choices[0]?.message
    console.log('AI 回答：', assistantMessage?.content)
    console.log('Token 消耗：', response.usage)

    // 返回结果用于后续对话
    return {
        content: assistantMessage?.content || '',
        usage: response.usage,
    }
}

// ==================== 示例 3: 流式输出 ====================

/**
 * 示例：流式输出（打字机效果）
 *
 * 适用场景：
 * - 聊天界面，实时显示生成内容
 * - 长文本生成，让用户不必等待全部完成
 * - 提升用户体验
 */
export async function streamingChatExample() {
    const client = createOpenAIClient(
        process.env.OPENAI_API_KEY || 'sk-xxx',
        'gpt-4o'
    )

    // 定义流式回调函数
    const callbacks: StreamCallbacks = {
        /**
         * 收到每个内容块时触发
         * @param chunk 本次收到的文本片段（通常是一个字或几个字）
         * @param response 完整的响应对象（包含 delta 信息）
         */
        onChunk: (chunk: string, response) => {
            // 在控制台实时输出（打字机效果）
            process.stdout.write(chunk)
        },

        /**
         * 流式输出完成时触发
         * @param fullResponse 完整的回答文本
         * @param usage Token 使用情况（部分提供商在流式模式下不提供）
         */
        onFinish: (fullResponse, usage) => {
            console.log('\n\n--- 生成完成 ---')
            console.log('总 Token：', usage?.total_tokens)
        },

        /**
         * 发生错误时触发
         */
        onError: (error) => {
            console.error('流式输出错误：', error.message)
        },
    }

    // 发送流式请求
    await client.streamChat(
        {
            messages: [
                { role: 'system', content: '你是一位小说家' },
                { role: 'user', content: '写一个关于AI的短篇科幻故事，100字左右' },
            ],
            temperature: 0.9, // 更高的创造性
        },
        callbacks
    )
}

// ==================== 示例 4: 多轮对话 ====================

/**
 * 示例：维护对话历史的多轮对话
 *
 * 核心概念：
 * - 每次请求都需要包含完整的对话历史
 * - LLM 本身是无状态的，状态由客户端维护
 */
export async function multiTurnChatExample() {
    const client = createLLMClient({
        provider: 'openai',
        apiKey: process.env.OPENAI_API_KEY || 'sk-xxx',
        model: 'gpt-4o-mini',
    })

    // 维护对话历史
    const conversationHistory: LLMMessage[] = [
        {
            role: 'system',
            content: '你是一位乐于助人的助手，回答简洁明了',
        },
    ]

    // 第一轮对话
    conversationHistory.push({
        role: 'user',
        content: '你好，我叫张三',
    })

    let response1 = await client.chat({ messages: conversationHistory })
    let reply1 = response1.choices[0].message!
    console.log('AI:', reply1.content)

    // 将 AI 的回复加入历史
    conversationHistory.push({
        role: 'assistant',
        content: reply1.content || '',
    })

    // 第二轮对话（AI 应该记得用户的名字）
    conversationHistory.push({
        role: 'user',
        content: '我叫什么名字？',
    })

    let response2 = await client.chat({ messages: conversationHistory })
    console.log('AI:', response2.choices[0].message?.content)
    // 预期输出：你叫张三
}

// ==================== 示例 5: 工具调用 (Function Calling) ====================

/**
 * 示例：使用工具调用让 AI 能够执行外部功能
 *
 * 工作原理：
 * 1. 定义工具（函数）的 schema
 * 2. AI 判断是否需要调用工具
 * 3. 如果调用，返回 tool_calls 而不是直接回答
 * 4. 客户端执行工具，将结果发回给 AI
 * 5. AI 基于工具结果给出最终回答
 */
export async function toolCallingExample() {
    const client = createOpenAIClient(
        process.env.OPENAI_API_KEY || 'sk-xxx',
        'gpt-4o' // 工具调用需要较强的模型
    )

    /**
     * 定义可用工具
     *
     * 参数说明（ToolDefinition）：
     * - type: 工具类型，目前只有 'function'
     * - function.name: 函数名称（AI 会使用这个名字调用）
     * - function.description: 函数描述（AI 根据描述判断何时调用）
     * - function.parameters: JSON Schema 格式的参数定义
     */
    const tools: ToolDefinition[] = [
        {
            type: 'function',
            function: {
                name: 'get_weather',
                description: '获取指定城市的当前天气信息',
                parameters: {
                    type: 'object',
                    properties: {
                        city: {
                            type: 'string',
                            description: '城市名称，如"北京"、"上海"',
                        },
                        unit: {
                            type: 'string',
                            enum: ['celsius', 'fahrenheit'],
                            description: '温度单位，摄氏或华氏',
                        },
                    },
                    required: ['city'], // 必需参数
                },
            },
        },
        {
            type: 'function',
            function: {
                name: 'calculate',
                description: '执行数学计算',
                parameters: {
                    type: 'object',
                    properties: {
                        expression: {
                            type: 'string',
                            description: '数学表达式，如"2 + 2"、"sqrt(16)"',
                        },
                    },
                    required: ['expression'],
                },
            },
        },
    ]

    // 第一步：发送用户问题
    const messages: LLMMessage[] = [
        {
            role: 'user',
            content: '北京今天天气怎么样？顺便帮我计算一下 25 * 4',
        },
    ]

    const response = await client.chat({
        messages,
        tools,
        tool_choice: 'auto', // 'auto' 表示让 AI 决定是否调用工具
    })

    const choice = response.choices[0]

    // 检查 AI 是否调用了工具
    if (choice.finish_reason === 'tool_calls' && choice.message?.tool_calls) {
        console.log('AI 调用了工具：')

        // 将 AI 的工具调用请求加入对话历史
        messages.push(choice.message)

        // 执行每个工具调用
        for (const toolCall of choice.message.tool_calls) {
            console.log(`- 工具：${toolCall.function.name}`)
            console.log(`  参数：${toolCall.function.arguments}`)

            // 解析参数
            const args = JSON.parse(toolCall.function.arguments)

            // 执行工具（这里是模拟，实际应该调用真实 API）
            let toolResult: string
            if (toolCall.function.name === 'get_weather') {
                // 模拟天气查询
                toolResult = JSON.stringify({
                    city: args.city,
                    temperature: 25,
                    condition: '晴朗',
                    humidity: '45%',
                })
            } else if (toolCall.function.name === 'calculate') {
                // 模拟计算（注意：实际项目中要安全地执行计算）
                toolResult = JSON.stringify({
                    expression: args.expression,
                    result: 100, // 25 * 4 = 100
                })
            } else {
                toolResult = JSON.stringify({ error: '未知工具' })
            }

            // 将工具执行结果加入对话历史
            messages.push({
                role: 'tool',
                content: toolResult,
                tool_call_id: toolCall.id,
            })
        }

        // 第二步：将工具结果发回给 AI，获取最终回答
        const finalResponse = await client.chat({ messages, tools })
        console.log('\nAI 最终回答：', finalResponse.choices[0].message?.content)
    } else {
        // AI 直接回答了，没有调用工具
        console.log('AI 回答：', choice.message?.content)
    }
}

// ==================== 示例 6: 不同提供商的使用 ====================

/**
 * 示例：使用 Anthropic Claude
 */
export function createClaudeExample() {
    return createAnthropicClient(
        process.env.ANTHROPIC_API_KEY || 'sk-ant-xxx',
        'claude-3-5-sonnet-20241022'
    )
}

/**
 * 示例：使用 Google Gemini
 */
export function createGeminiExample() {
    return createGeminiClient(
        process.env.GOOGLE_API_KEY || 'xxx',
        'gemini-1.5-flash' // 或 'gemini-1.5-pro'
    )
}

/**
 * 示例：使用 Azure OpenAI
 *
 * 注意：Azure 需要完整的 baseURL，包含 deployment 名称
 */
export function createAzureExample() {
    return createAzureClient(
        process.env.AZURE_API_KEY || 'xxx',
        'https://your-resource.openai.azure.com/openai/deployments/your-deployment',
        'gpt-4' // Azure 部署时的模型名称
    )
}

/**
 * 示例：使用国内模型（以 DeepSeek 为例）
 *
 * 也适用于：通义千问、文心一言、智谱 GLM、Moonshot 等
 * 只要它们兼容 OpenAI 的 API 格式
 */
export function createDeepSeekExample() {
    const apiKey = process.env.DEEPSEEK_API_KEY
    if (!apiKey) {
        throw new Error('请设置 DEEPSEEK_API_KEY 环境变量')
    }
    return createCustomClient(
        apiKey,
        'https://api.deepseek.com', // DeepSeek 的 API 地址
        'deepseek-chat', // 或 'deepseek-reasoner'
    )
}

/**
 * 示例：使用通义千问
 */
export function createQwenExample() {
    return createCustomClient(
        process.env.QWEN_API_KEY || 'sk-xxx',
        'https://dashscope.aliyuncs.com/compatible-mode/v1',
        'qwen-turbo' // 或 'qwen-plus', 'qwen-max'
    )
}

/**
 * 示例：使用 Minimax
 *
 * Minimax API 文档: https://www.minimaxi.com/document/guides/chat-model/V2
 * 注意：Minimax 支持 Anthropic API 格式，走 anthropic 兼容端点
 */
export function createMinimaxExample() {
    const apiKey = process.env.MINIMAX_API_KEY
    if (!apiKey) {
        throw new Error('请设置 MINIMAX_API_KEY 环境变量')
    }
    return createLLMClient({
        provider: 'minimax',
        apiKey,
        model: 'abab6.5s-chat', // 或 'abab6-chat', 'MiniMax-M2.7'
    })
}

// ==================== 示例 7: 高级用法 ====================

/**
 * 示例：动态更新配置
 *
 * 适用场景：
 * - 需要根据用户权限切换模型
 * - 需要动态调整超时时间
 */
export function dynamicConfigExample() {
    const client = createOpenAIClient('initial-key', 'gpt-3.5-turbo')

    // 之后可以更新配置
    client.updateConfig({
        apiKey: 'new-api-key',
        model: 'gpt-4o',
        timeout: 120000, // 增加到 2 分钟
        defaultOptions: {
            temperature: 0.5,
            max_tokens: 4000,
        },
    })

    return client
}

/**
 * 示例：取消长时间运行的请求
 */
export async function cancelRequestExample() {
    const client = createOpenAIClient(
        process.env.OPENAI_API_KEY || 'sk-xxx',
        'gpt-4o'
    )

    // 启动一个长时间请求
    const chatPromise = client.chat({
        messages: [{ role: 'user', content: '写一个很长的小说' }],
        max_tokens: 4000,
    })

    // 3 秒后取消请求
    setTimeout(() => {
        console.log('取消请求...')
        client.abort()
    }, 3000)

    try {
        const response = await chatPromise
        console.log('完成：', response.choices[0].message?.content)
    } catch (error) {
        console.error('请求被取消或出错：', error)
    }
}

/**
 * 示例：带重试的请求
 *
 * 实际项目中可以使用 p-retry 等库
 */
export async function retryableChat(
    client: LLMClient,
    options: LLMRequestOptions,
    maxRetries = 3
): Promise<string> {
    let lastError: Error | undefined

    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await client.chat(options)
            return response.choices[0]?.message?.content || ''
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error))
            console.log(`第 ${i + 1} 次尝试失败，${maxRetries - i - 1} 次重试剩余`)

            // 指数退避等待
            if (i < maxRetries - 1) {
                await new Promise((resolve) => setTimeout(resolve, Math.pow(2, i) * 1000))
            }
        }
    }

    throw lastError || new Error('All retries failed')
}

// ==================== 示例 8: 实际应用场景 ====================

/**
 * 示例：代码审查助手
 *
 * 一个实际的业务场景示例
 */
export async function codeReviewExample(code: string): Promise<string> {
    const client = createOpenAIClient(
        process.env.OPENAI_API_KEY || 'sk-xxx',
        'gpt-4o'
    )

    const response = await client.chat({
        messages: [
            {
                role: 'system',
                content: `你是一位资深的代码审查专家。请审查提供的代码，并从以下几个方面给出建议：
1. 潜在的错误或 bug
2. 性能优化建议
3. 代码可读性和最佳实践
4. 安全性问题

请以结构化的方式输出审查结果。`,
            },
            {
                role: 'user',
                content: `请审查以下代码：\n\n\`\`\`typescript\n${code}\n\`\`\``,
            },
        ],
        temperature: 0.3, // 较低的创造性，更严谨
        max_tokens: 3000,
    })

    return response.choices[0]?.message?.content || '审查失败'
}

/**
 * 示例：智能客服机器人
 *
 * 展示如何结合系统提示词和业务上下文
 */
export async function customerServiceExample(
    userQuery: string,
    orderInfo?: Record<string, unknown>
): Promise<string> {
    const client = createOpenAIClient(
        process.env.OPENAI_API_KEY || 'sk-xxx',
        'gpt-4o-mini'
    )

    // 构建包含上下文的系统提示
    let systemPrompt = `你是某电商平台的智能客服助手。

服务准则：
- 态度友好、耐心
- 回答准确、简洁
- 无法解答时建议转人工

公司政策：
- 7天无理由退换货
- 满99元包邮
- 客服时间：9:00-22:00`

    // 如果有订单信息，添加到上下文
    if (orderInfo) {
        systemPrompt += `\n\n当前用户订单信息：\n${JSON.stringify(orderInfo, null, 2)}`
    }

    const response = await client.chat({
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userQuery },
        ],
        temperature: 0.7,
    })

    return response.choices[0]?.message?.content || '服务暂时不可用'
}

// ==================== 运行示例 ====================

// 如果直接运行此文件，执行示例
if (import.meta.url === `file://${process.argv[1]}`) {
    console.log('LLM Client 使用示例')
    console.log('====================')
    console.log('请设置对应的环境变量后，取消注释下面的示例代码来运行')

    // 取消注释以下行来运行示例：
    // simpleChatExample("什么是 TypeScript？").then(console.log)
    // basicChatExample().then(console.log)
    // streamingChatExample().then(() => console.log("流式输出完成"))
}
