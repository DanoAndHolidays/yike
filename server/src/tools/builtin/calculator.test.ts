import { createCalculator } from './calculator.js'

const registry = createCalculator()
const functions = (registry as any)._functions

function assert(condition: boolean, message: string) {
    if (!condition) {
        console.error(`❌ 测试失败: ${message}`)
        process.exit(1)
    }
    console.log(`✅ ${message}`)
}

console.log('\n========== 计算器工具测试 ==========\n')

assert(functions.add !== undefined, 'add 函数已注册')
assert(functions.subtract !== undefined, 'subtract 函数已注册')
assert(functions.multiply !== undefined, 'multiply 函数已注册')
assert(functions.divide !== undefined, 'divide 函数已注册')
assert(functions.modulo !== undefined, 'modulo 函数已注册')
assert(functions.power !== undefined, 'power 函数已注册')
assert(functions.sqrt !== undefined, 'sqrt 函数已注册')
assert(functions.round !== undefined, 'round 函数已注册')

console.log('\n--- 基本运算测试 ---')

let result = functions.add.func(2, 3)
assert(result === '5', `add(2, 3) = ${result}`)

result = functions.subtract.func(10, 4)
assert(result === '6', `subtract(10, 4) = ${result}`)

result = functions.multiply.func(3, 4)
assert(result === '12', `multiply(3, 4) = ${result}`)

result = functions.divide.func(10, 2)
assert(result === '5', `divide(10, 2) = ${result}`)

result = functions.modulo.func(10, 3)
assert(result === '1', `modulo(10, 3) = ${result}`)

result = functions.power.func(2, 3)
assert(result === '8', `power(2, 3) = ${result}`)

result = functions.sqrt.func(9)
assert(result === '3', `sqrt(9) = ${result}`)

result = functions.round.func(4.6)
assert(result === '5', `round(4.6) = ${result}`)

console.log('\n--- 边界情况测试 ---')

result = functions.divide.func(5, 0)
assert(result === '错误: 除数不能为0', `divide(5, 0) = ${result}`)

result = functions.modulo.func(5, 0)
assert(result === '错误: 取模除数不能为0', `modulo(5, 0) = ${result}`)

result = functions.sqrt.func(-4)
assert(result === '错误: 不能对负数开平方根', `sqrt(-4) = ${result}`)

console.log('\n========== 所有测试通过! ==========\n')
