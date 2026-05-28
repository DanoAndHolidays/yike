import { expect, test, describe } from 'vitest'
import { createCalculator } from './calculator'

const registry = createCalculator()
const functions = (registry as any)._functions

describe('Calculator 函数注册', () => {
    test('add 函数已注册', () => {
        expect(functions.add).toBeDefined()
    })
    test('subtract 函数已注册', () => {
        expect(functions.subtract).toBeDefined()
    })
    test('multiply 函数已注册', () => {
        expect(functions.multiply).toBeDefined()
    })
    test('divide 函数已注册', () => {
        expect(functions.divide).toBeDefined()
    })
    test('modulo 函数已注册', () => {
        expect(functions.modulo).toBeDefined()
    })
    test('power 函数已注册', () => {
        expect(functions.power).toBeDefined()
    })
    test('sqrt 函数已注册', () => {
        expect(functions.sqrt).toBeDefined()
    })
    test('round 函数已注册', () => {
        expect(functions.round).toBeDefined()
    })
})

describe('Calculator 基本运算', () => {
    test('add(2, 3) = 5', () => {
        expect(functions.add.func(2, 3)).toBe('5')
    })
    test('subtract(10, 4) = 6', () => {
        expect(functions.subtract.func(10, 4)).toBe('6')
    })
    test('multiply(3, 4) = 12', () => {
        expect(functions.multiply.func(3, 4)).toBe('12')
    })
    test('divide(10, 2) = 5', () => {
        expect(functions.divide.func(10, 2)).toBe('5')
    })
    test('modulo(10, 3) = 1', () => {
        expect(functions.modulo.func(10, 3)).toBe('1')
    })
    test('power(2, 3) = 8', () => {
        expect(functions.power.func(2, 3)).toBe('8')
    })
    test('sqrt(9) = 3', () => {
        expect(functions.sqrt.func(9)).toBe('3')
    })
    test('round(4.6) = 5', () => {
        expect(functions.round.func(4.6)).toBe('5')
    })
})

describe('Calculator 边界情况', () => {
    test('divide(5, 0) 返回错误', () => {
        expect(functions.divide.func(5, 0)).toBe('错误: 除数不能为0')
    })
    test('modulo(5, 0) 返回错误', () => {
        expect(functions.modulo.func(5, 0)).toBe('错误: 取模除数不能为0')
    })
    test('sqrt(-4) 返回错误', () => {
        expect(functions.sqrt.func(-4)).toBe('错误: 不能对负数开平方根')
    })
})
