/**
 * Minimax LLM 客户端测试脚本
 * 运行方式: pnpm tsx src/core/llm.test.minimax.ts
 */

import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import path from 'path'

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 加载 .env 文件
dotenv.config({ path: path.resolve(__dirname, '../../.env') })

import { createMinimaxExample } from './llm.example.js'

async function main() {
    console.log('🚀 开始测试 Minimax LLM 客户端...\n')

    // 创建 Minimax 客户端
    const client = createMinimaxExample()

    console.log('📤 发送请求到 Minimax API...')
    console.log('----------------------------------------')

    try {
        // 测试 1: 基础对话
        const response = await client.chat({
            messages: [
                { role: 'system', content: '你是一个有帮助的助手，回答简洁明了。' },
                { role: 'user', content: '你好！请用一句话介绍自己。' },
            ],
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

        // 测试 2: 流式输出
        console.log('\n\n🌊 测试流式输出...')
        console.log('----------------------------------------')

        await client.streamChat(
            {
                messages: [
                    { role: 'user', content: '请用3句话介绍人工智能的发展历程。' },
                ],
                temperature: 0.8,
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
                },
                onError: (error) => {
                    console.error('\n❌ 流式输出错误：', error.message)
                },
            }
        )

        console.log('\n\n✅ Minimax 所有测试通过！')

    } catch (error) {
        console.error('\n❌ 请求失败：', error)
        process.exit(1)
    }
}

main()
