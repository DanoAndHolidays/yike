interface ToolParameter {
    name: string
    type: string
    description: string
    required?: boolean
    default?: any
}

// 这里可以使用ts中的abstract关键字来声明抽象类与抽象方法
export abstract class Tool {
    name: string
    description: string
    constructor(name: string, description: string) {
        // 禁止直接实例化一个抽象类

        this.name = name
        this.description = description
    }

    abstract run(parameters: Record<string, any>): string

    abstract getParameters(): ToolParameter[]
}
