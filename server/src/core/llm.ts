/**
 * LLM 客户端 - 适配主流 OpenAI 标准 API
 *
 * 本模块提供统一的接口与多种大语言模型进行交互，包括：
 * - OpenAI (GPT-4, GPT-3.5, GPT-4o 等)
 * - Anthropic (Claude 3.5 Sonnet, Claude 3 Opus 等)
 * - Google (Gemini 1.5 Pro/Flash)
 * - Azure OpenAI
 * - 兼容 OpenAI 格式的国内模型（DeepSeek、通义千问、智谱 GLM、Moonshot 等）
 *
 * 核心功能：
 * 1. 统一的消息格式和响应格式
 * 2. 支持流式（实时）和非流式输出
 * 3. 支持工具调用（Function Calling）
 * 4. 自动处理不同提供商的 API 差异
 * 5. 内置超时和取消请求机制
 *
 * @example
 * // 最简单用法 - 快速聊天
 * const answer = await quickChat(
 *   { provider: 'openai', apiKey: 'sk-xxx', model: 'gpt-4o-mini' },
 *   '你好，请介绍一下自己'
 * )
 *
 * @example
 * // 创建客户端进行多轮对话
 * const client = createOpenAIClient('sk-xxx', 'gpt-4o-mini')
 * const response = await client.chat({
 *   messages: [
 *     { role: 'system', content: '你是助手' },
 *     { role: 'user', content: '你好' }
 *   ]
 * })
 */

// ==================== 类型定义 ====================

/**
 * 消息角色类型
 * - system: 系统提示词，设定 AI 的行为和角色
 * - user: 用户输入
 * - assistant: AI 助手的回复
 * - tool: 工具调用的结果（Function Calling）
 */
type MessageRole = 'system' | 'user' | 'assistant' | 'tool'

/**
 * 单条消息结构
 *
 * @property role - 消息角色
 * @property content - 消息内容（纯文本）
 * @property name - 可选，用于区分不同用户或工具名称
 * @property tool_calls - AI 请求调用的工具列表（仅在 assistant 角色的消息中出现）
 * @property tool_call_id - 对应 tool_calls 的 ID（仅在 tool 角色的消息中需要）
 */
export interface LLMMessage {
    role: MessageRole
    content: string
    name?: string
    tool_calls?: ToolCall[]
    tool_call_id?: string
}

/**
 * 工具调用（Function Calling）结构
 *
 * @property id - 工具调用的唯一标识
 * @property type - 工具类型，目前只支持 'function'
 * @property function - 函数调用详情
 * @property function.name - 要调用的函数名称
 * @property function.arguments - JSON 字符串格式的函数参数
 */
export interface ToolCall {
    id: string
    type: 'function'
    function: {
        name: string
        arguments: string
    }
}

/**
 * LLM 请求选项
 *
 * @property model - 模型名称（可选，默认使用客户端配置）
 * @property messages - 消息列表，必须包含至少一条消息
 * @property temperature - 采样温度，0-2 之间。越高输出越随机，越低越确定
 * @property max_tokens - 最大生成的 token 数量
 * @property top_p - 核采样参数，0-1 之间。与 temperature 二选一使用
 * @property stream - 是否使用流式输出（SSE）
 * @property tools - 工具定义列表，用于 Function Calling
 * @property tool_choice - 工具选择策略：'auto' 自动决定，'none' 不调用，或指定调用某个工具
 */
export interface LLMRequestOptions {
    model?: string
    messages: LLMMessage[]
    /** 采样温度，0-2，默认 1。0 最确定，2 最随机 */
    temperature?: number
    /** 最大生成 token 数 */
    max_tokens?: number
    /** 核采样，与 temperature 二选一 */
    top_p?: number
    /** 是否流式输出 */
    stream?: boolean
    /** 可用工具列表 */
    tools?: ToolDefinition[]
    /** 工具选择策略 */
    tool_choice?: 'auto' | 'none' | { type: 'function'; function: { name: string } }
}

/**
 * 工具定义（用于 Function Calling）
 *
 * @example
 * {
 *   type: 'function',
 *   function: {
 *     name: 'get_weather',
 *     description: '获取指定城市的天气',
 *     parameters: {
 *       type: 'object',
 *       properties: {
 *         city: { type: 'string', description: '城市名称' }
 *       },
 *       required: ['city']
 *     }
 *   }
 * }
 */
export interface ToolDefinition {
    type: 'function'
    function: {
        name: string
        description: string
        parameters: Record<string, unknown>
    }
}

/**
 * LLM 响应结构
 *
 * @property id - 请求唯一标识
 * @property object - 对象类型（chat.completion 或 chat.completion.chunk）
 * @property created - 创建时间戳（Unix）
 * @property model - 实际使用的模型名称
 * @property choices - 生成结果列表（通常只有一个元素）
 * @property choices[].message - 生成的完整消息（非流式）
 * @property choices[].delta - 增量消息（流式，包含新增的内容片段）
 * @property choices[].finish_reason - 结束原因：
 *   - 'stop': 正常完成
 *   - 'length': 达到 token 限制
 *   - 'tool_calls': 调用了工具
 *   - 'content_filter': 被内容过滤器拦截
 *   - null: 未完成（流式输出中）
 * @property usage - Token 使用情况（流式模式下可能为 undefined）
 */
export interface LLMResponse {
    id: string
    object: string
    created: number
    model: string
    choices: {
        index: number
        message?: LLMMessage
        delta?: Partial<LLMMessage>
        finish_reason: 'stop' | 'length' | 'tool_calls' | 'content_filter' | null
    }[]
    usage?: {
        prompt_tokens: number
        completion_tokens: number
        total_tokens: number
    }
}

/**
 * LLM 客户端配置
 *
 * @property provider - 服务提供商
 * @property apiKey - API 密钥
 * @property baseURL - 自定义 API 基础地址（可选，用于代理或自定义部署）
 * @property model - 默认使用的模型名称
 * @property defaultOptions - 每次请求的默认参数
 * @property timeout - 请求超时时间（毫秒），默认 60000（1分钟）
 */
export interface LLMConfig {
    provider: 'openai' | 'anthropic' | 'google' | 'azure' | 'minimax' | 'custom'
    apiKey: string
    baseURL?: string
    model: string
    defaultOptions?: Partial<LLMRequestOptions>
    /** 请求超时时间（毫秒），默认 60000 */
    timeout?: number
}

/**
 * 流式响应回调函数
 *
 * @property onChunk - 收到每个内容片段时触发
 * @property onToolCall - 收到工具调用请求时触发
 * @property onFinish - 流式输出完成时触发
 * @property onError - 发生错误时触发
 */
export interface StreamCallbacks {
    /** 收到内容片段时触发，chunk 为本次收到的文本 */
    onChunk?: (chunk: string, response?: LLMResponse) => void
    /** 收到工具调用时触发 */
    onToolCall?: (toolCall: ToolCall) => void
    /** 输出完成时触发，fullResponse 为完整文本 */
    onFinish?: (fullResponse: string, usage?: LLMResponse['usage']) => void
    /** 发生错误时触发 */
    onError?: (error: Error) => void
}

// ==================== 提供商配置 ====================

/**
 * 各 LLM 提供商的默认配置
 *
 * 包含：
 * 1. 默认基础 URL
 * 2. 请求头构建函数（处理不同提供商的认证方式差异）
 *
 * 认证方式差异：
 * - OpenAI: Authorization: Bearer {apiKey}
 * - Anthropic: x-api-key: {apiKey} + anthropic-version 头
 * - Google: x-goog-api-key: {apiKey}
 * - Azure: api-key: {apiKey}
 */
const PROVIDER_CONFIGS: Record<
    string,
    { baseURL: string; headerBuilder: (apiKey: string) => Record<string, string> }
> = {
    openai: {
        baseURL: 'https://api.openai.com/v1',
        headerBuilder: (apiKey) => ({
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        }),
    },
    anthropic: {
        baseURL: 'https://api.anthropic.com/v1',
        headerBuilder: (apiKey) => ({
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
        }),
    },
    google: {
        baseURL: 'https://generativelanguage.googleapis.com/v1beta',
        headerBuilder: (apiKey) => ({
            'x-goog-api-key': apiKey,
            'Content-Type': 'application/json',
        }),
    },
    azure: {
        baseURL: '', // 需要用户完整提供
        headerBuilder: (apiKey) => ({
            'api-key': apiKey,
            'Content-Type': 'application/json',
        }),
    },
    minimax: {
        // Minimax 支持 Anthropic API 格式
        // 端点: https://api.minimaxi.com/anthropic/v1
        baseURL: 'https://api.minimaxi.com/anthropic/v1',
        headerBuilder: (apiKey) => ({
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01',
        }),
    },
    custom: {
        baseURL: '', // 需要用户提供
        headerBuilder: (apiKey) => ({
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        }),
    },
}

// ==================== LLM 客户端类 ====================

/**
 * LLM 客户端类
 *
 * 提供与各种 LLM 提供商交互的统一接口，自动处理：
 * - 不同 API 格式的转换
 * - 请求头认证
 * - 超时和取消
 * - 响应解析
 *
 * 使用方法：
 * 1. 使用 createXXXClient 便捷函数创建实例
 * 2. 调用 chat() 进行非流式对话
 * 3. 调用 streamChat() 进行流式对话
 * 4. 调用 abort() 取消正在进行的请求
 */
export class LLMClient {
    private config: LLMConfig
    private abortController: AbortController | null = null

    /**
     * 创建 LLM 客户端实例
     * @param config - 客户端配置，包含提供商、API Key、模型等
     */
    constructor(config: LLMConfig) {
        this.config = {
            timeout: 60000, // 默认 60 秒超时
            ...config,
        }
    }

    /**
     * 获取请求的 URL 和 Headers
     *
     * 不同提供商的端点格式：
     * - OpenAI: {baseURL}/chat/completions
     * - Anthropic: {baseURL}/messages
     * - Google: {baseURL}/models/{model}:generateContent
     * - Azure: {baseURL}/chat/completions?api-version=2024-02-01
     *
     * @private
     * @returns 包含 url 和 headers 的对象
     */
    private getRequestConfig(): { url: string; headers: Record<string, string> } {
        const providerConfig = PROVIDER_CONFIGS[this.config.provider]

        // 确定基础 URL：优先使用用户提供的，否则使用默认
        let baseURL: string
        if (this.config.baseURL) {
            baseURL = this.config.baseURL.replace(/\/$/, '') // 移除末尾斜杠
        } else if (this.config.provider === 'azure') {
            throw new Error('Azure provider requires full baseURL')
        } else {
            baseURL = providerConfig.baseURL
        }

        // 根据提供商构建端点 URL
        let url: string
        if (this.config.provider === 'azure') {
            // Azure 需要 api-version 查询参数
            url = `${baseURL}/chat/completions?api-version=2024-02-01`
        } else if (this.config.provider === 'anthropic' || this.config.provider === 'minimax') {
            // Anthropic 和 Minimax 使用 /messages 端点
            url = `${baseURL}/messages`
        } else if (this.config.provider === 'google') {
            // Google Gemini 格式：/models/{model}:generateContent
            url = `${baseURL}/models/${this.config.model}:generateContent`
        } else {
            // OpenAI 标准格式 / 自定义
            url = `${baseURL}/chat/completions`
        }

        return {
            url,
            headers: providerConfig.headerBuilder(this.config.apiKey),
        }
    }

    /**
     * 将统一的请求选项转换为提供商特定的请求体格式
     *
     * 格式转换说明：
     * - Anthropic: 分离 system 消息，max_tokens 必填
     * - Google: 使用 contents/parts 结构，参数放在 generationConfig
     * - OpenAI/自定义: 直接使用标准格式
     *
     * @private
     * @param options - 统一的请求选项
     * @returns 转换后的请求体对象
     */
    private formatRequestBody(options: LLMRequestOptions): Record<string, unknown> {
        const { provider, model } = this.config

        // Anthropic 格式转换（也适用于 Minimax）
        // Anthropic 要求 system 消息单独放在顶层，不在 messages 数组中
        if (provider === 'anthropic' || provider === 'minimax') {
            const systemMessage = options.messages.find((m) => m.role === 'system')
            const otherMessages = options.messages.filter((m) => m.role !== 'system')

            return {
                model,
                messages: otherMessages.map((m) => ({
                    role: m.role === 'user' ? 'user' : 'assistant',
                    content: m.content,
                })),
                system: systemMessage?.content,
                max_tokens: options.max_tokens ?? 4096, // Anthropic 必填
                temperature: options.temperature,
                top_p: options.top_p,
                stream: options.stream,
                tools: options.tools,
            }
        }

        // Google Gemini 格式转换
        // Gemini 使用 roles: user/model，而不是 user/assistant
        if (provider === 'google') {
            return {
                contents: options.messages.map((m) => ({
                    role: m.role === 'user' ? 'user' : 'model',
                    parts: [{ text: m.content }],
                })),
                generationConfig: {
                    temperature: options.temperature,
                    maxOutputTokens: options.max_tokens,
                    topP: options.top_p,
                },
            }
        }

        // OpenAI 标准格式（默认，也适用于兼容的自定义端点）
        return {
            model,
            messages: options.messages,
            temperature: options.temperature,
            max_tokens: options.max_tokens,
            top_p: options.top_p,
            stream: options.stream,
            tools: options.tools,
            tool_choice: options.tool_choice,
        }
    }

    /**
     * 解析提供商的响应为统一格式
     *
     * 将不同提供商的响应结构转换为统一的 LLMResponse 格式
     *
     * @private
     * @param data - 原始响应数据
     * @returns 统一格式的响应对象
     */
    private parseResponse(data: Record<string, unknown>): LLMResponse {
        // Anthropic 格式转换（也适用于 Minimax）
        if (this.config.provider === 'anthropic' || this.config.provider === 'minimax') {
            const content = (data.content as Array<{ type: string; text?: string }>) || []
            // Minimax 返回的内容可能包含 thinking 和 text 两种类型，我们只需要 text
            const textContent =
                content
                    .filter((c) => c.type === 'text')
                    .map((c) => c.text)
                    .join('') || ''

            return {
                id: (data.id as string) || '',
                object: 'chat.completion',
                created: Math.floor(Date.now() / 1000),
                model: (data.model as string) || this.config.model,
                choices: [
                    {
                        index: 0,
                        message: {
                            role: 'assistant',
                            content: textContent,
                        },
                        finish_reason:
                            (data.stop_reason as LLMResponse['choices'][0]['finish_reason']) ||
                            'stop',
                    },
                ],
                usage: {
                    prompt_tokens:
                        (data.usage as Record<string, number> | undefined)?.input_tokens || 0,
                    completion_tokens:
                        (data.usage as Record<string, number> | undefined)?.output_tokens || 0,
                    total_tokens:
                        ((data.usage as Record<string, number> | undefined)?.input_tokens || 0) +
                        ((data.usage as Record<string, number> | undefined)?.output_tokens || 0),
                },
            }
        }

        // Google Gemini 格式转换
        if (this.config.provider === 'google') {
            const candidates = (data.candidates as Array<Record<string, unknown>>) || []
            const firstCandidate = candidates[0] || {}
            const content = firstCandidate.content as Record<string, unknown>
            const parts = (content?.parts as Array<{ text?: string }>) || []

            return {
                id: `gemini-${Date.now()}`,
                object: 'chat.completion',
                created: Math.floor(Date.now() / 1000),
                model: this.config.model,
                choices: [
                    {
                        index: 0,
                        message: {
                            role: 'assistant',
                            content: parts[0]?.text || '',
                        },
                        finish_reason:
                            ((firstCandidate.finishReason as string)?.toLowerCase() as
                                | LLMResponse['choices'][0]['finish_reason']
                                | undefined) || 'stop',
                    },
                ],
                usage: {
                    prompt_tokens:
                        (data.usageMetadata as Record<string, number> | undefined)
                            ?.promptTokenCount || 0,
                    completion_tokens:
                        (data.usageMetadata as Record<string, number> | undefined)
                            ?.candidatesTokenCount || 0,
                    total_tokens:
                        (data.usageMetadata as Record<string, number> | undefined)
                            ?.totalTokenCount || 0,
                },
            }
        }

        // OpenAI 标准格式（直接返回）
        return data as unknown as LLMResponse
    }

    /**
     * 发送非流式聊天请求
     *
     * 适用场景：
     * - 后台任务、不需要实时显示
     * - 需要完整回答后再处理
     * - 需要准确的 usage 信息
     *
     * @param options - 请求选项，包含 messages 和其他参数
     * @returns 包含完整回答的响应对象
     * @throws 请求失败或超时时抛出错误
     *
     * @example
     * const response = await client.chat({
     *   messages: [{ role: 'user', content: '你好' }],
     *   temperature: 0.7
     * })
     * console.log(response.choices[0].message.content)
     */
    async chat(options: LLMRequestOptions): Promise<LLMResponse> {
        const { url, headers } = this.getRequestConfig()
        const body = this.formatRequestBody({
            ...this.config.defaultOptions,
            ...options,
            stream: false,
        })

        // 创建 AbortController 用于超时控制
        this.abortController = new AbortController()
        const timeoutId = setTimeout(() => this.abortController?.abort(), this.config.timeout)

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(body),
                signal: this.abortController.signal,
            })

            clearTimeout(timeoutId)

            if (!response.ok) {
                const errorText = await response.text()
                throw new Error(`LLM API error: ${response.status} ${errorText}`)
            }

            const data = await response.json()
            return this.parseResponse(data)
        } catch (error) {
            clearTimeout(timeoutId)
            if (error instanceof Error && error.name === 'AbortError') {
                throw new Error('LLM request timeout')
            }
            throw error
        }
    }

    /**
     * 发送流式聊天请求（SSE 服务器推送）
     *
     * 适用场景：
     * - 聊天界面，实现打字机效果
     * - 长文本生成，让用户不必等待全部完成
     * - 提升交互体验
     *
     * 流式响应处理流程：
     * 1. 建立连接，发送 stream: true 的请求
     * 2. 读取响应体的 ReadableStream
     * 3. 解析 SSE (Server-Sent Events) 格式的数据
     * 4. 对每个 data: {...} 块调用 onChunk 回调
     * 5. 收到 [DONE] 标记时调用 onFinish 回调
     *
     * @param options - 请求选项，stream 自动设为 true
     * @param callbacks - 流式响应回调函数
     * @returns Promise，在流式输出完成或出错时 resolve
     *
     * @example
     * await client.streamChat(
     *   { messages: [{ role: 'user', content: '讲个故事' }] },
     *   {
     *     onChunk: (chunk) => process.stdout.write(chunk),
     *     onFinish: (full) => console.log('\n完成')
     *   }
     * )
     */
    async streamChat(options: LLMRequestOptions, callbacks: StreamCallbacks): Promise<void> {
        const { url, headers } = this.getRequestConfig()
        const body = this.formatRequestBody({
            ...this.config.defaultOptions,
            ...options,
            stream: true,
        })

        this.abortController = new AbortController()
        const timeoutId = setTimeout(() => this.abortController?.abort(), this.config.timeout)

        let fullResponse = ''
        let finalUsage: LLMResponse['usage']

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers,
                body: JSON.stringify(body),
                signal: this.abortController.signal,
            })

            clearTimeout(timeoutId)

            if (!response.ok) {
                const errorText = await response.text()
                throw new Error(`LLM API error: ${response.status} ${errorText}`)
            }

            if (!response.body) {
                throw new Error('Response body is null')
            }

            // 获取 ReadableStream 阅读器
            const reader = response.body.getReader()
            const decoder = new TextDecoder()

            // 循环读取流数据
            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                // 解码二进制数据为文本
                const chunk = decoder.decode(value, { stream: true })
                const lines = chunk.split('\n').filter((line) => line.trim())

                // 处理 SSE 格式的每一行
                for (const line of lines) {
                    // SSE 注释行，忽略
                    if (line.startsWith(':')) continue

                    // 数据行格式: data: {...}
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6)

                        // 流结束标记 [DONE]
                        if (data === '[DONE]') {
                            callbacks.onFinish?.(fullResponse, finalUsage)
                            return
                        }

                        try {
                            const parsed = JSON.parse(data)
                            const parsedResponse = this.parseStreamChunk(parsed)

                            if (parsedResponse.choices?.[0]) {
                                const choice = parsedResponse.choices[0]
                                const deltaContent = choice.delta?.content || ''

                                // 调用 onChunk 回调，传递新增内容
                                if (deltaContent) {
                                    fullResponse += deltaContent
                                    callbacks.onChunk?.(deltaContent, parsedResponse)
                                }

                                // 处理工具调用
                                if (choice.delta?.tool_calls) {
                                    for (const toolCall of choice.delta.tool_calls) {
                                        callbacks.onToolCall?.(toolCall)
                                    }
                                }

                                // 记录 usage（通常在最后一条消息）
                                if (parsedResponse.usage) {
                                    finalUsage = parsedResponse.usage
                                }
                            }
                        } catch (e) {
                            // 忽略解析错误（可能是心跳或格式问题）
                        }
                    }
                }
            }

            callbacks.onFinish?.(fullResponse, finalUsage)
        } catch (error) {
            clearTimeout(timeoutId)
            if (error instanceof Error && error.name === 'AbortError') {
                callbacks.onError?.(new Error('LLM request timeout'))
            } else {
                callbacks.onError?.(error instanceof Error ? error : new Error(String(error)))
            }
        }
    }

    /**
     * 解析流式响应的数据块
     *
     * 将提供商特定的流式格式转换为统一的 LLMResponse 格式
     *
     * @private
     * @param data - 原始流式数据块
     * @returns 统一格式的响应对象
     */
    private parseStreamChunk(data: Record<string, unknown>): LLMResponse {
        // Anthropic 流式格式转换（也适用于 Minimax）
        if (this.config.provider === 'anthropic' || this.config.provider === 'minimax') {
            const delta = data.delta as Record<string, unknown>

            return {
                id: (data.id as string) || '',
                object: 'chat.completion.chunk',
                created: Math.floor(Date.now() / 1000),
                model: (data.model as string) || this.config.model,
                choices: [
                    {
                        index: 0,
                        delta: {
                            content: (delta?.text as string) || '',
                            role: 'assistant',
                        },
                        finish_reason: data.type === 'message_stop' ? 'stop' : null,
                    },
                ],
            }
        }

        // OpenAI 标准格式直接返回
        return data as unknown as LLMResponse
    }

    /**
     * 取消当前正在进行的请求
     *
     * 可用于：
     * - 用户点击"停止生成"按钮
     * - 超时后强制终止
     *
     * 注意：取消后正在进行的 chat() 或 streamChat() 会抛出 AbortError
     */
    abort(): void {
        this.abortController?.abort()
    }

    /**
     * 更新客户端配置
     *
     * 可用于：
     * - 动态切换模型
     * - 更新 API Key
     * - 调整默认参数
     *
     * @param config - 要更新的配置项（部分配置）
     */
    updateConfig(config: Partial<LLMConfig>): void {
        this.config = { ...this.config, ...config }
    }
}

// ==================== 便捷函数 ====================

/**
 * 创建 LLM 客户端的工厂函数
 *
 * @param config - 完整的 LLM 配置
 * @returns LLMClient 实例
 *
 * @example
 * const client = createLLMClient({
 *   provider: 'openai',
 *   apiKey: 'sk-xxx',
 *   model: 'gpt-4o-mini'
 * })
 */
export function createLLMClient(config: LLMConfig): LLMClient {
    return new LLMClient(config)
}

/**
 * 快速发送单条消息（非流式）
 *
 * 最简化的使用方式，不需要创建客户端实例
 *
 * @param config - LLM 配置
 * @param message - 用户消息内容
 * @param systemPrompt - 可选的系统提示词
 * @returns AI 的回答文本
 *
 * @example
 * const answer = await quickChat(
 *   { provider: 'openai', apiKey: 'sk-xxx', model: 'gpt-4o-mini' },
 *   '什么是 TypeScript？',
 *   '你是编程专家'
 * )
 */
export async function quickChat(
    config: LLMConfig,
    message: string,
    systemPrompt?: string,
): Promise<string> {
    const client = new LLMClient(config)

    const messages: LLMMessage[] = []
    if (systemPrompt) {
        messages.push({ role: 'system', content: systemPrompt })
    }
    messages.push({ role: 'user', content: message })

    const response = await client.chat({ messages })
    return response.choices[0]?.message?.content || ''
}

// ==================== 预配置客户端 ====================

/**
 * 创建 OpenAI 客户端
 *
 * @param apiKey - OpenAI API 密钥
 * @param model - 模型名称，默认 'gpt-4o-mini'
 * @param baseURL - 可选的自定义 API 地址（用于代理）
 * @returns LLMClient 实例
 *
 * @example
 * const client = createOpenAIClient('sk-xxx', 'gpt-4o')
 */
export function createOpenAIClient(
    apiKey: string,
    model = 'gpt-4o-mini',
    baseURL?: string,
): LLMClient {
    return new LLMClient({
        provider: 'openai',
        apiKey,
        model,
        baseURL,
    })
}

/**
 * 创建 Anthropic Claude 客户端
 *
 * @param apiKey - Anthropic API 密钥
 * @param model - 模型名称，默认 'claude-3-5-sonnet-20241022'
 * @returns LLMClient 实例
 *
 * @example
 * const client = createAnthropicClient('sk-ant-xxx', 'claude-3-5-sonnet-20241022')
 */
export function createAnthropicClient(
    apiKey: string,
    model = 'claude-3-5-sonnet-20241022',
): LLMClient {
    return new LLMClient({
        provider: 'anthropic',
        apiKey,
        model,
    })
}

/**
 * 创建 Google Gemini 客户端
 *
 * @param apiKey - Google AI Studio API 密钥
 * @param model - 模型名称，默认 'gemini-1.5-flash'
 * @returns LLMClient 实例
 *
 * @example
 * const client = createGeminiClient('xxx', 'gemini-1.5-pro')
 */
export function createGeminiClient(apiKey: string, model = 'gemini-1.5-flash'): LLMClient {
    return new LLMClient({
        provider: 'google',
        apiKey,
        model,
    })
}

/**
 * 创建 Azure OpenAI 客户端
 *
 * 注意：Azure 需要完整的部署 URL
 *
 * @param apiKey - Azure API 密钥
 * @param baseURL - 完整的 Azure OpenAI 端点 URL
 * @param model - 部署时使用的模型名称
 * @returns LLMClient 实例
 *
 * @example
 * const client = createAzureClient(
 *   'xxx',
 *   'https://your-resource.openai.azure.com/openai/deployments/your-deployment',
 *   'gpt-4'
 * )
 */
export function createAzureClient(apiKey: string, baseURL: string, model: string): LLMClient {
    return new LLMClient({
        provider: 'azure',
        apiKey,
        baseURL,
        model,
    })
}

/**
 * 创建自定义端点客户端
 *
 * 适用于兼容 OpenAI API 格式的第三方服务，包括：
 * - 国内模型：通义千问、文心一言、智谱 GLM、Moonshot、DeepSeek 等
 * - 私有化部署的模型
 * - API 代理服务
 *
 * @param apiKey - API 密钥
 * @param baseURL - API 基础地址（如 'https://api.deepseek.com'）
 * @param model - 模型名称
 * @returns LLMClient 实例
 *
 * @example
 * // DeepSeek
 * const client = createCustomClient('sk-xxx', 'https://api.deepseek.com', 'deepseek-chat')
 *
 * @example
 * // 通义千问
 * const client = createCustomClient('sk-xxx', 'https://dashscope.aliyuncs.com/compatible-mode/v1', 'qwen-turbo')
 */
export function createCustomClient(apiKey: string, baseURL: string, model: string): LLMClient {
    return new LLMClient({
        provider: 'custom',
        apiKey,
        baseURL,
        model,
    })
}

// ==================== 使用示例 ====================

/**
 * 示例 1: 基础对话
 * ```typescript
 * const client = createOpenAIClient('your-api-key', 'gpt-4o-mini')
 * const response = await client.chat({
 *   messages: [
 *     { role: 'system', content: '你是一个有帮助的助手' },
 *     { role: 'user', content: '你好！' }
 *   ]
 * })
 * console.log(response.choices[0].message.content)
 * ```
 *
 * 示例 2: 流式输出
 * ```typescript
 * await client.streamChat(
 *   { messages: [{ role: 'user', content: '讲个故事' }] },
 *   {
 *     onChunk: (chunk) => process.stdout.write(chunk),
 *     onFinish: (full) => console.log('\n完成'),
 *   }
 * )
 * ```
 *
 * 示例 3: 国内模型（以 DeepSeek 为例）
 * ```typescript
 * const client = createCustomClient(
 *   'your-api-key',
 *   'https://api.deepseek.com',
 *   'deepseek-chat'
 * )
 * ```
 *
 * 示例 4: 工具调用
 * ```typescript
 * const response = await client.chat({
 *   messages: [{ role: 'user', content: '北京天气如何？' }],
 *   tools: [{
 *     type: 'function',
 *     function: {
 *       name: 'get_weather',
 *       description: '获取天气信息',
 *       parameters: {
 *         type: 'object',
 *         properties: {
 *           location: { type: 'string', description: '城市名称' }
 *         },
 *         required: ['location']
 *       }
 *     }
 *   }]
 * })
 * ```
 */
