import { ContextBuilder } from './builder'
import { LLMConfig, LLMMessage, LLMRequestOptions, LLMResponse, AgentConfig } from '../core/types'
import { ContextConfig } from './config'
import { ContextPacket } from './packet'
// import { config } from "dotenv";

const config = new ContextConfig(1000, 0.2, 0.2, true)

const builder = new ContextBuilder(config)

let conversationHistory: LLMMessage[] = [
    { role: 'user', content: '我正在开发一个数据分析工具', timestamp: new Date() },
    {
        role: 'assistant',
        content: '很好!数据分析工具通常需要处理大量数据。您计划使用什么技术栈?',
        timestamp: new Date(),
    },
    {
        role: 'user',
        content: '我打算使用Python和Pandas,已经完成了CSV读取模块',
        timestamp: new Date(),
    },
    {
        role: 'assistant',
        content: '不错的选择!Pandas在数据处理方面非常强大。接下来您可能需要考虑数据清洗和转换。',
        timestamp: new Date(),
    },
]

let context = builder.build(
    '如何优化Pandas的内存占用?',
    '你是一位资深的Python数据工程顾问。你的回答需要:1) 提供具体可行的建议 2) 解释技术原理 3) 给出代码示例',
    conversationHistory,
)

console.log(context)
// [Role & Policies]
// 你是一位资深的Python数据工程顾问。你的回答需要:1) 提供具体可行的建议 2) 解释技术原理 3) 给出代码示例
// 
// [Task]
// 如何优化Pandas的内存占用?
// 
// [Context]
// user: 我正在开发一个数据分析工具
// assistant: 很好!数据分析工具通常需要处理大量数据。您计划使用什么技术栈?
// user: 我打算使用Python和Pandas,已经完成了CSV读取模块
// assistant: 不错的选择!Pandas在数据处理方面非常强大。接下来您可能需要考虑数据清洗和转换。      
// 
// [Output]
// 请基于以上信息，提供准确、有据的回答。