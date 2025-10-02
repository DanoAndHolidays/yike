import '@/styles/main.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import App from './App.vue'
import router from './router'

const app = createApp(App)

// 设置全局错误处理器
app.config.errorHandler = (err, vm, info) => {
    // `err` 是错误对象
    // `vm` 是发生错误的 Vue 实例
    // `info` 是关于错误的附加信息（如组件生命周期钩子的名称）
    console.error(`错误对象:${err},错误组件:${vm},错误信息:${info}`)

    // 可以在这里做一些错误记录（例如发送到服务器）
}

// 捕获 JavaScript 错误
window.onerror = function (message, source, lineno, colno, error) {
    console.error('JavaScript 错误:', message)
    console.error('错误发生在:', source, lineno, colno)
    console.error('详细错误:', error)
    return true
}

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(ElementPlus)
app.use(pinia)
app.use(router)

app.mount('#appp')
