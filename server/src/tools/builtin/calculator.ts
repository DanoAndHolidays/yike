import { ToolRegistry } from '../registry'

function add(a: number, b: number): string {
    return String(a + b)
}

function subtract(a: number, b: number): string {
    return String(a - b)
}

function multiply(a: number, b: number): string {
    return String(a * b)
}

function divide(a: number, b: number): string {
    if (b === 0) return '错误: 除数不能为0'
    return String(a / b)
}

function modulo(a: number, b: number): string {
    if (b === 0) return '错误: 取模除数不能为0'
    return String(a % b)
}

function power(base: number, exponent: number): string {
    return String(Math.pow(base, exponent))
}

function sqrt(n: number): string {
    if (n < 0) return '错误: 不能对负数开平方根'
    return String(Math.sqrt(n))
}

function round(n: number): string {
    return String(Math.round(n))
}

export function createCalculator() {
    const registry = new ToolRegistry()

    registry.regidterFunction('add', '加法运算，计算两数之和', add)
    registry.regidterFunction('subtract', '减法运算，计算两数之差', subtract)
    registry.regidterFunction('multiply', '乘法运算，计算两数之积', multiply)
    registry.regidterFunction('divide', '除法运算，计算两数之商', divide)
    registry.regidterFunction('modulo', '取模运算，计算两数之余数', modulo)
    registry.regidterFunction('power', '幂运算，计算base的exponent次方', power)
    registry.regidterFunction('sqrt', '平方根运算，计算数的平方根', sqrt)
    registry.regidterFunction('round', '四舍五入运算，对数字进行四舍五入', round)

    return registry
}
