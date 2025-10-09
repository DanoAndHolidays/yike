const map = new Map()
/**
 * @param {number} n
 * @return {number}
 */
var climbStairs = function (n) {
    if (n === 0 || n === 1) {
        return 1
    } else if (n === 2) {
        return 2
    }

    if (map.has(n)) {
        console.group()
        console.log('has', map.get(n))
        console.groupEnd()

        return map.get(n)
    } else {
        const temp = climbStairs(n - 1) + climbStairs(n - 2)
        map.set(n, temp)
        return temp
    }
}

export { climbStairs }
