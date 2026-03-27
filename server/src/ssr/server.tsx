// server.js
import express from 'express'
import { renderToString } from 'react-dom/server'
import React from 'react'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import App from '../../../src-react/App'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

console.log('SSR 服务器正在启动...')
console.log('工作目录:', process.cwd())
console.log('当前文件目录:', __dirname)

app.get('/bundle.js', (req, res, next) => {
    console.log(`收到请求: ${req.method} ${req.url}`)
    const bundlePath = path.join(__dirname, '../../public/bundle.js')
    console.log('请求 bundle.js，路径:', bundlePath)
    console.log('文件存在:', fs.existsSync(bundlePath))

    if (fs.existsSync(bundlePath)) {
        res.setHeader('Content-Type', 'application/javascript')
        fs.createReadStream(bundlePath).pipe(res)
    } else {
        res.status(404).send('bundle.js not found')
    }
})

app.use((req, res, next) => {
    console.log(`收到请求: ${req.method} ${req.url}`)
    next()
})

app.use((req, res) => {
    console.log('正在渲染 React 组件...')
    try {
        const appHtml = renderToString(<App location={req.url} />)
        console.log('React 组件渲染完成')

        const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>React SSR 应用</title>
      </head>
      <body>
        <div id="root">${appHtml}</div>
        <script src="/bundle.js"></script>
      </body>
    </html>
  `
        res.send(html)
        console.log('响应已发送')
    } catch (error) {
        console.error('渲染错误:', error)
        res.status(500).send('服务器错误')
    }
})

app.listen(8787, '127.0.0.1', () => {
    console.log('✅ SSR 服务器成功启动!')
    console.log('📡 访问地址: http://127.0.0.1:8787')
})
