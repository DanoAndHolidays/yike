// // 测试 RESTful API MCP 客户端 - 无需认证
// import { Client } from '@modelcontextprotocol/sdk/client/index.js'
// import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'

// const client = new Client(
//     {
//         name: 'rest-api-mcp-client',
//         version: '1.0.0',
//     },
//     {
//         capabilities: {
//             tools: {},
//         },
//     },
// )

// // 使用 JSONPlaceholder 免费 API 测试
// const transport = new StdioClientTransport({
//     command: 'cmd',
//     args: ['/c', 'npx', '-y', '@playwright/mcp'],
// })

// async function main() {
//     await client.connect(transport)

//     // 列出可用工具
//     const tools = await client.listTools()
//     console.log(
//         '可用工具:',
//         tools.tools.map((t) => t.name),
//     )

//     // 导航到一个网页
//     const result = await client.callTool('browser_navigate', {
//         url: 'https://www.baidu.com',
//     })
//     console.log('导航结果:', JSON.stringify(result, null, 2))
// }

// main().catch(console.error)
