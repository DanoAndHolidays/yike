// import SparkMD5 from './spark-md5.min.js'
// 由于同源策略只能加载同源文件
self.importScripts('spark-md5.min.js')

console.log(`worker is working!!!`)

// 文件使用增量计算的阈值大小
const fileIncrementalMdSize = 5 * 1024 * 1024

// 创建文件切片
function createFileChunk(file, chunkSize) {
    return new Promise((resolve, reject) => {
        let fileChunkList = []
        let cur = 0
        console.group()
        while (cur < file.size) {
            // Blob 接口的 slice() 方法创建并返回一个新的 Blob 对象，该对象包含调用它的 blob 的子集中的数据。
            fileChunkList.push({ chunkFile: file.slice(cur, cur + chunkSize) })
            cur += chunkSize

            console.log(
                `当前切割位置相对整个文件的大小${cur / 1024 / 1024}MB，总计${
                    file.size / 1024 / 1024
                }MB`,
            )
        }
        console.groupEnd()
        // 返回全部文件切片
        resolve(fileChunkList)
    })
}

// 这里实现一个全量的MD5计算，仅针对小文件
const calculateChunksHashMin = async (file, fileChunkList) => {
    try {
        const spark = new SparkMD5.ArrayBuffer()

        const reader = new FileReader()
        reader.readAsArrayBuffer(file)
        reader.onload = (e) => {
            spark.append(e.target.result)
        }
        reader.onerror = (err) => {
            reject(err) // 如果读取错误，则拒绝Promise
        }

        const md5 = spark.end()
        console.log(`全量文件MD5${md5}`)

        self.postMessage({ percentage: 100, fileHash: md5, fileChunkList }) // 发送最终结果到主线程
        self.close() // 关闭Worker
    } catch (err) {
        self.postMessage({ name: 'error', data: err }) // 发送错误到主线程
        self.close() // 关闭Worker
    }
}

// 加载并计算文件切片的MD5
async function calculateChunksHash(fileChunkList) {
    // 初始化脚本
    // const spark = new SparkMD5.ArrayBuffer()
    const spark = new SparkMD5.ArrayBuffer()

    // 计算切片进度（拓展功能，可自行添加）
    let percentage = 0

    // 计算切片次数
    let count = 0

    // 这里的含义是，将分片的文件依次加入spark之后计算hash值？那我为啥不直接计算整个文件的，递归什么呢
    // https://zqd123.github.io/js-spark-md5-testpage/test/test.html 因为使用全量的计算方式有可能会崩溃
    // 递归函数，用于处理文件切片
    async function loadNext(index) {
        if (index >= fileChunkList.length) {
            // 所有切片都已处理完毕
            return spark.end() // 返回最终的MD5值
        }

        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.readAsArrayBuffer(fileChunkList[index].chunkFile)
            reader.onload = (e) => {
                count++
                spark.append(e.target.result)

                // 更新进度并处理下一个切片
                percentage += 100 / fileChunkList.length
                self.postMessage({ percentage }) // 发送进度到主线程

                resolve(loadNext(index + 1)) // 递归调用，处理下一个切片
            }
            reader.onerror = (err) => {
                reject(err) // 如果读取错误，则拒绝Promise
            }
        })
    }

    try {
        // 开始计算切片
        const fileHash = await loadNext(0) // 等待所有切片处理完毕
        console.log(`文件切片结果`, fileHash)

        self.postMessage({ percentage: 100, fileHash, fileChunkList }) // 发送最终结果到主线程
        self.close() // 关闭Worker
    } catch (err) {
        self.postMessage({ name: 'error', data: err }) // 发送错误到主线程
        self.close() // 关闭Worker
    }
}

// 监听消息
onmessage = async (e) => {
    try {
        const { file, chunkSize } = e.data
        const fileChunkList = await createFileChunk(file, chunkSize) // 创建文件切片
        if (file.size < fileIncrementalMdSize) {
            console.log(
                `文件的大小小于${
                    fileIncrementalMdSize / 1024 / 1024
                }MB，采用全量计算，可能会崩溃😫,如果这都受不了，还真是一个杂鱼浏览器呢❤️❤️❤️`,
            )
            await calculateChunksHashMin(file, fileChunkList)
        } else {
            await calculateChunksHash(fileChunkList) // 等待计算完成
        }
    } catch (err) {
        // 这里实际上不会捕获到calculateChunksHash中的错误，因为错误已经在Worker内部处理了
        // 但如果未来有其他的异步操作，这里可以捕获到它们
        console.error('worker监听发生错误:', err)
    }
}

// 主线程可以监听 Worker 是否发生错误。如果发生错误，Worker 会触发主线程的error事件。
onerror = (event) => {
    console.log('Worker触发主线程的error事件：', event)
    self.close() // 关闭Worker
}
