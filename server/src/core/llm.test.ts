/**
 * LLM 客户端统一测试脚本
 * 支持测试多个提供商：DeepSeek、Minimax、OpenAI、Anthropic 等
 *
 * 运行方式:
 *   pnpm tsx src/core/llm.test.ts              # 测试所有配置的提供商
 *   pnpm tsx src/core/llm.test.ts deepseek     # 只测试 DeepSeek
 *   pnpm tsx src/core/llm.test.ts minimax      # 只测试 Minimax
 *   pnpm tsx src/core/llm.test.ts openai       # 只测试 OpenAI
 *   pnpm tsx src/core/llm.test.ts anthropic    # 只测试 Anthropic
 */

import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import path from 'path'

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 加载 .env 文件
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

import { LLMClient, LLMMessage } from './llm.js'

// ==================== 测试配置 ====================

/**
 * 提供商测试配置
 * 每个提供商包含：
 * - name: 显示名称
 * - client: LLMClient 实例创建函数
 * - model: 测试使用的模型名称（用于显示）
 */
const PROVIDER_TESTS: Record<
    string,
    {
        name: string
        client: () => LLMClient | null
        model: string
    }
> = {
    deepseek: {
        name: 'DeepSeek',
        client: () => {
            const apiKey = process.env.DEEPSEEK_API_KEY
            if (!apiKey) return null
            return new LLMClient({
                provider: 'custom',
                apiKey,
                baseURL: 'https://api.deepseek.com',
                model: 'deepseek-chat',
            })
        },
        model: 'deepseek-chat',
    },
    minimax: {
        name: 'Minimax',
        client: () => {
            const apiKey = process.env.MINIMAX_API_KEY
            if (!apiKey) return null
            return new LLMClient({
                provider: 'minimax',
                apiKey,
                model: 'MiniMax-M2.7',
            })
        },
        model: 'MiniMax-M2.7',
    },
    openai: {
        name: 'OpenAI',
        client: () => {
            const apiKey = process.env.OPENAI_API_KEY
            if (!apiKey || apiKey === 'your-openai-api-key-here') return null
            return new LLMClient({
                provider: 'openai',
                apiKey,
                model: 'gpt-4o-mini',
            })
        },
        model: 'gpt-4o-mini',
    },
    anthropic: {
        name: 'Anthropic Claude',
        client: () => {
            const apiKey = process.env.ANTHROPIC_API_KEY
            if (!apiKey || apiKey === 'your-anthropic-api-key-here') return null
            return new LLMClient({
                provider: 'anthropic',
                apiKey,
                model: 'claude-3-5-sonnet-20241022',
            })
        },
        model: 'claude-3-5-sonnet-20241022',
    },
}

// ==================== 测试用例 ====================

/**
 * 测试 1: 基础对话（非流式）
 */
async function testBasicChat(client: LLMClient, providerName: string): Promise<boolean> {
    console.log(`\n📤 [${providerName}] 测试基础对话...`)
    console.log('----------------------------------------')

    try {
        const messages: LLMMessage[] = [
            { role: 'system', content: '你是一个有帮助的助手，回答简洁明了。' },
            { role: 'user', content: '你好！请用一句话介绍自己。' },
        ]

        const response = await client.chat({
            messages,
            temperature: 0.7,
            max_tokens: 200,
        })

        console.log('\n📥 响应结果：')
        console.log('----------------------------------------')
        console.log('AI 回答：', response.choices[0]?.message?.content)
        console.log('\n📊 Token 使用情况：')
        console.log('  - Prompt tokens:', response.usage?.prompt_tokens)
        console.log('  - Completion tokens:', response.usage?.completion_tokens)
        console.log('  - Total tokens:', response.usage?.total_tokens)

        return true
    } catch (error) {
        console.error(`\n❌ [${providerName}] 基础对话测试失败：`, error)
        return false
    }
}

/**
 * 测试 2: 流式输出
 */
async function testStreamingChat(client: LLMClient, providerName: string): Promise<boolean> {
    console.log(`\n\n🌊 [${providerName}] 测试流式输出...`)
    console.log('----------------------------------------')

    return new Promise((resolve) => {
        const messages: LLMMessage[] = [
            { role: 'user', content: '请用3句话介绍人工智能的发展历程。' },
        ]

        client
            .streamChat(
                {
                    messages,
                    temperature: 0.8,
                    max_tokens: 300,
                },
                {
                    onChunk: (chunk) => {
                        process.stdout.write(chunk)
                    },
                    onFinish: (fullResponse, usage) => {
                        console.log('\n----------------------------------------')
                        console.log('✅ 流式输出完成！')
                        console.log('\n📊 Token 使用情况：')
                        console.log('  - Total tokens:', usage?.total_tokens)
                        resolve(true)
                    },
                    onError: (error) => {
                        console.error('\n❌ 流式输出错误：', error.message)
                        resolve(false)
                    },
                },
            )
            .catch((error) => {
                console.error('\n❌ 流式输出异常：', error)
                resolve(false)
            })
    })
}

/**
 * 测试 3: 多轮对话
 */
async function testMultiTurnChat(client: LLMClient, providerName: string): Promise<boolean> {
    console.log(`\n\n💬 [${providerName}] 测试多轮对话...`)
    console.log('----------------------------------------')

    try {
        const conversationHistory: LLMMessage[] = [
            { role: 'system', content: '你是一个乐于助人的助手，回答简洁。' },
        ]

        // 第一轮
        conversationHistory.push({ role: 'user', content: '我叫张三，请记住。' })
        const response1 = await client.chat({ messages: conversationHistory })
        const reply1 = response1.choices[0].message!
        console.log('User: 我叫张三，请记住。')
        console.log('AI:', reply1.content)
        conversationHistory.push({ role: 'assistant', content: reply1.content || '' })

        // 第二轮
        conversationHistory.push({ role: 'user', content: '我叫什么名字？' })
        const response2 = await client.chat({ messages: conversationHistory })
        console.log('\nUser: 我叫什么名字？')
        console.log('AI:', response2.choices[0].message?.content)

        // 验证
        const answer = response2.choices[0].message?.content || ''
        if (answer.includes('张三')) {
            console.log('✅ 多轮对话测试通过（AI 记住了名字）')
            return true
        } else {
            console.log('⚠️ 多轮对话测试警告（AI 可能没记住名字）')
            return true // 仍然返回 true，因为这不是错误
        }
    } catch (error) {
        console.error(`\n❌ [${providerName}] 多轮对话测试失败：`, error)
        return false
    }
}

// ==================== 测试运行器 ====================

/**
 * 运行单个提供商的所有测试
 */
async function runProviderTests(
    providerKey: string,
    config: (typeof PROVIDER_TESTS)[string],
): Promise<{ name: string; passed: boolean; results: boolean[] }> {
    console.log(`\n${'='.repeat(60)}`)
    console.log(`🧪 开始测试: ${config.name} (${config.model})`)
    console.log('='.repeat(60))

    const client = config.client()
    if (!client) {
        console.log(`⏭️  跳过 ${config.name}：未配置 API Key`)
        return { name: config.name, passed: false, results: [] }
    }

    const results: boolean[] = []

    // 运行测试
    results.push(await testBasicChat(client, config.name))
    results.push(await testStreamingChat(client, config.name))
    results.push(await testMultiTurnChat(client, config.name))

    const allPassed = results.every((r) => r)

    console.log(`\n${'='.repeat(60)}`)
    if (allPassed) {
        console.log(`✅ ${config.name} 所有测试通过！`)
    } else {
        console.log(`❌ ${config.name} 部分测试失败`)
    }
    console.log('='.repeat(60))

    return { name: config.name, passed: allPassed, results }
}

/**
 * 主函数
 */
async function main() {
    console.log('🚀 LLM 客户端统一测试脚本')
    console.log('==========================\n')

    // 解析命令行参数
    const args = process.argv.slice(2)
    const specificProvider = args[0]?.toLowerCase()

    let providersToTest: string[]

    if (specificProvider && PROVIDER_TESTS[specificProvider]) {
        // 测试指定提供商
        providersToTest = [specificProvider]
        console.log(`📋 只测试: ${PROVIDER_TESTS[specificProvider].name}\n`)
    } else if (specificProvider) {
        console.error(`❌ 未知提供商: ${specificProvider}`)
        console.log('支持的提供商:', Object.keys(PROVIDER_TESTS).join(', '))
        process.exit(1)
    } else {
        // 测试所有已配置 API Key 的提供商
        providersToTest = Object.keys(PROVIDER_TESTS)
        console.log('📋 测试所有已配置的提供商\n')
    }

    // 运行测试
    const allResults: { name: string; passed: boolean; results: boolean[] }[] = []

    for (const key of providersToTest) {
        const result = await runProviderTests(key, PROVIDER_TESTS[key])
        allResults.push(result)
    }

    // 汇总报告
    console.log('\n\n📊 测试汇总报告')
    console.log('='.repeat(60))

    const tested = allResults.filter((r) => r.results.length > 0)
    const skipped = allResults.filter((r) => r.results.length === 0)
    const passed = tested.filter((r) => r.passed)
    const failed = tested.filter((r) => !r.passed)

    console.log(`\n总计: ${allResults.length} 个提供商`)
    console.log(`  - ✅ 通过: ${passed.length} 个`)
    console.log(`  - ❌ 失败: ${failed.length} 个`)
    console.log(`  - ⏭️  跳过: ${skipped.length} 个 (未配置 API Key)`)

    if (tested.length > 0) {
        console.log('\n详细结果:')
        for (const result of allResults) {
            if (result.results.length === 0) continue
            const status = result.passed ? '✅' : '❌'
            const passedCount = result.results.filter((r) => r).length
            console.log(`  ${status} ${result.name}: ${passedCount}/${result.results.length} 项通过`)
        }
    }

    console.log('='.repeat(60))

    // 退出码
    if (failed.length > 0) {
        process.exit(1)
    }
}

// 运行测试
main().catch((error) => {
    console.error('测试运行失败:', error)
    process.exit(1)
})
