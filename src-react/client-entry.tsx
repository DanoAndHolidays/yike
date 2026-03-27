import React from 'react'
import { createRoot } from 'react-dom/client'
import DemoSSR from './views/Demo/index.ssr'

console.log('客户端入口文件正在执行...')

const container = document.getElementById('root')
if (container) {
    console.log('找到 #root 元素，开始注水...')
    const root = createRoot(container)
    root.render(<DemoSSR />)
    console.log('注水完成！')
}
