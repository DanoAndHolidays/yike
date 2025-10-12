import path from 'node:path'

// 提取文件后缀名
const extractExt = (fileName) => {
    // 查找'.'在fileName中最后出现的位置
    const lastIndex = fileName.lastIndexOf('.')
    // 如果'.'不存在，则返回空字符串
    if (lastIndex === -1) {
        return ''
    }
    // 否则，返回从'.'后一个字符到fileName末尾的子串作为文件后缀（包含'.'）
    return fileName.slice(lastIndex)
}

// 提取文件后缀名
const extractExt2 = (fileName) => {
    return path.extname(fileName) ?? ''
}

console.log(extractExt('.js'))
console.log(extractExt2('.js'))
