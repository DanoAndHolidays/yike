import { expect, test } from 'vitest'
import { climbStairs } from './climbStairs'

test('climbStairs(5) toBe 8', () => {
    expect(climbStairs(5)).toBe(8)
})

test('climbStairs(2) toBe 2', () => {
    expect(climbStairs(2)).toBe(2)
})
