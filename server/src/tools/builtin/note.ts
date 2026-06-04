import { Tool } from '../base'
import { ToolRegistry } from '../registry'
import { ToolParameter } from '../base'

export class NoteTool extends Tool {
    workspace: string
    constructor(workspace: string) {
        super('noteTool', '一个记录状态、结论、阻塞与行动项等内容的工具，可以持久化保存信息')
        this.workspace = workspace
    }

    /**
     * 记录笔记
     * @param parameters
     * @returns
     */
    run(parameters: Record<string, any>): string {
        return ''
    }
    /**
     * 创建笔记
     */
    createNote() {}

    // TODO
    readNote() {}

    parseMarkdown() {}

    updateNote() {}

    /**
     * 搜索笔记
     */
    searchNote() {}

    /**
     * 列出笔记
     */
    listNote() {}

    summaryNote() {}

    deleteNote() {}

    getParameters(): ToolParameter[] {
        return '' as unknown as ToolParameter[]
    }
}
