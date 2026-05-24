/**
 * 这个其实没啥用，就是一坨
 * 
 * LLM 客户端 - 适配主流 OpenAI 标准 API
 *
 * 本模块提供统一的接口与多种大语言模型进行交互，包括：
 * - OpenAI (GPT-4, GPT-3.5, GPT-4o 等)
 * - Anthropic (Claude 3.5 Sonnet, Claude 3 Opus 等)
 * - Google (Gemini 1.5 Pro/Flash)
 * - Azure OpenAI
 * - Minimax
 * - 兼容 OpenAI 格式的国内模型（DeepSeek、通义千问、智谱 GLM、Moonshot 等）
 *
 * 核心功能：
 * 1. 统一的消息格式和响应格式
 * 2. 支持流式（实时）和非流式输出
 * 3. 支持工具调用（Function Calling）
 * 4. 自动处理不同提供商的 API 差异
 * 5. 内置超时和取消请求机制
 *
 * 项目结构：
 * - types.ts: 所有类型定义
 * - client.ts: LLMClient 类实现
 * - llm.ts: 入口文件（本文件），导出所有内容
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

// ==================== 导出类型 ====================

export type {
    // 基础类型
    MessageRole,
    LLMMessage,
    ToolCall,
    ToolDefinition,

    // 请求/响应类型
    LLMRequestOptions,
    LLMResponse,

    // 配置类型
    LLMProvider,
    LLMConfig,
    StreamCallbacks,

    // 提供商配置类型
    ProviderConfig,
    ProviderConfigs,
} from './types.js'

// ==================== 导出客户端类 ====================

export { LLMClient } from './client.js'

// ==================== 便捷函数 ====================

import { LLMClient } from './client.js'
import {
    LLMConfig,
    LLMMessage,
    LLMRequestOptions,
    LLMResponse,
} from './types.js'

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
export function createGeminiClient(
    apiKey: string,
    model = 'gemini-1.5-flash',
): LLMClient {
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
export function createAzureClient(
    apiKey: string,
    baseURL: string,
    model: string,
): LLMClient {
    return new LLMClient({
        provider: 'azure',
        apiKey,
        baseURL,
        model,
    })
}

/**
 * 创建 Minimax 客户端
 *
 * @param apiKey - Minimax API 密钥
 * @param model - 模型名称，默认 'abab6.5s-chat'
 * @returns LLMClient 实例
 *
 * @example
 * const client = createMinimaxClient('sk-xxx', 'abab6.5s-chat')
 */
export function createMinimaxClient(
    apiKey: string,
    model = 'abab6.5s-chat',
): LLMClient {
    return new LLMClient({
        provider: 'minimax',
        apiKey,
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
export function createCustomClient(
    apiKey: string,
    baseURL: string,
    model: string,
): LLMClient {
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
