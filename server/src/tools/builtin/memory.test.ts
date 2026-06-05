import { expect, test, describe, beforeEach } from 'vitest'
import { MemoryTool } from './memory'

describe('MemoryTool 工具', () => {
    let memoryTool: MemoryTool

    beforeEach(() => {
        memoryTool = new MemoryTool('./workspace')
    })

    test('MemoryTool 实例已创建', () => {
        expect(memoryTool).toBeDefined()
        expect(memoryTool.name).toBe('memoryTool')
    })

    test('add 操作可以添加记忆', () => {
        const result = memoryTool.execute('add', {
            content: '测试记忆内容',
            memoryType: 'working',
            importance: 0.7,
        })
        expect(result).toContain('记忆已添加')
    })

    test('add 操作返回正确的记忆ID', () => {
        const result = memoryTool.execute('add', {
            content: '测试记忆2',
            memoryType: 'working',
            importance: 0.5,
        })
        // 应该包含 wm- 时间戳格式的ID
        expect(result).toMatch(/wm-\d+/)
    })

    test('search 操作', () => {
        const result = memoryTool.execute('search', {
            query: '测试',
        })
        expect(result).toBeDefined()
    })

    test('summary 操作', () => {
        const result = memoryTool.execute('summary', {})
        expect(result).toBeDefined()
    })

    test('未知操作返回错误信息', () => {
        const result = memoryTool.execute('unknown', {})
        expect(result).toContain('没有匹配')
    })
})