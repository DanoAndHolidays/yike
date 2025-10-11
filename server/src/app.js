import express from 'express'
import cros from 'cors'
import chalk from 'chalk'
import path from 'path'
import { fileURLToPath } from 'url'
import fsex from "fs-extra";

// 在ESM中获取 __dirname 的等效方式
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

app.use(cros(), express.static(path.join(__dirname, 'public')))

app.listen(3030, () => {
    console.log(chalk.bgRedBright('一刻短剧后端服务正在运行在：http://localhost:3030'))
})

app.options('/', (req, res) => {
    res.sendStatus(200)
})

app.get('/test', (req, res) => {
    res.send('Hello Dano')
})

app.post('/upload', async (req, res) => {
    console.log(chalk.bgGreen('开始上传'))
    try {
        // 使用动态导入加载CJS模块
        const multiparty = (await import('multiparty')).default

        // 这个库的主要作用就是去解析上传的form-data
        const form = new multiparty.Form()

        form.parse(req, (err, fields, files) => {
            if (err) {
                console.error(chalk.red('解析错误:'), err)
                return res.status(500).json({ error: '文件解析失败', data: err, code: -1 })
            }
            const { fileHash, chunkHash, fileName } = fields

            console.log(chalk.blue('字段:'), fields)
            console.log(chalk.blue('文件:'), files)

            

            // 处理上传逻辑
            res.json({
                message: '上传成功',
                fields,
                files,
            })
        })
    } catch (error) {
        console.error(chalk.red('导入multiparty失败:'), error)
        res.status(500).json({ error: '服务器错误' })
    }
})
