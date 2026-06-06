// MCP 服务器示例
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'

const mcpServer = new McpServer({
    name: 'greeting-server',
    version: '1.0.0',
})

mcpServer.registerTool(
    'greet',
    {
        description: 'Greet someone by name',
        inputSchema: z.object({
            name: z.string(),
        }),
    },
    async ({ name }) => ({
        content: [{ type: 'text', text: `Hello, ${name}!` }],
    }),
)

async function main() {
    const transport = new StdioServerTransport()
    await mcpServer.connect(transport)
    console.log('MCP Server running on stdio')
}

main()

