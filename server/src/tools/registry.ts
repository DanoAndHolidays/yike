import { Tool } from './base'

// Tool对象注册：适合复杂工具，支持完整的参数定义和验证
// 函数直接注册：适合简单工具，快速集成现有函数
export class ToolRegistry {
    private _tools: Record<string, any> = {}
    private _functions: Record<string, any> = {}

    regidterTool(tool: Tool) {
        if (this._tools[tool.name]) console.warn(`工具${tool.name}已经存在，即将覆盖`)

        this._tools[tool.name] = tool
        console.log(`工具${tool.name}，已经创建`)
    }

    regidterFunction(name: string, description: string, func: Function) {
        if (this._functions[name]) console.warn(`工具${name}已经存在，即将覆盖`)

        this._functions[name] = {
            description: description,
            func: func,
        }
        console.log(`工具${name}，已经创建`)
    }

    getToolsDescription(): string {
        let descroption =``
        for (const [name, tool] of Object.entries(this._tools)) {
            descroption += `name: ${name} tool: ${tool}\n`
        }
        return descroption
    }

    // TODO
    toOpenAiSchema(){}
}
