/**
 * LLM 客户端类型定义
 *
 * 本文件包含所有与 LLM 交互相关的类型定义
 */

// ==================== 基础类型 ====================

/**
 * 消息角色类型
 * - system: 系统提示词，设定 AI 的行为和角色
 * - user: 用户输入
 * - assistant: AI 助手的回复
 * - tool: 工具调用的结果（Function Calling）
 */
export type MessageRole = 'system' | 'user' | 'assistant' | 'tool'

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
    timestamp?: Date
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

// ==================== 请求/响应类型 ====================

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

// ==================== 配置类型 ====================

/**
 * 支持的 LLM 提供商类型
 */
export type LLMProvider =
    | 'openai'
    | 'anthropic'
    | 'google'
    | 'azure'
    | 'minimax'
    | 'custom'
    | 'deepseek'

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
    provider: LLMProvider
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

// ==================== 提供商配置类型 ====================

/**
 * 提供商配置结构
 */
export interface ProviderConfig {
    baseURL: string
    headerBuilder: (apiKey: string) => Record<string, string>
}

/**
 * 提供商配置映射
 */
export type ProviderConfigs = Record<LLMProvider, ProviderConfig>

/**
 * Agent基类配置
 */
export interface AgentConfig {
    shit: string
}
