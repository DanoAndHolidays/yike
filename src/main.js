import '@/styles/main.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import {
    Clock,
    FullScreen,
    CaretBottom,
    More,
    Search,
    Pointer,
    User,
    Menu,
    Paperclip,
    Wallet,
    ShoppingCart,
    Notebook,
    CameraFilled,
    ArrowLeft,
    Delete,
} from '@element-plus/icons-vue'

const iconObject = {
    Clock,
    FullScreen,
    CaretBottom,
    More,
    Search,
    Pointer,
    User,
    Menu,
    Paperclip,
    Wallet,
    ShoppingCart,
    Notebook,
    CameraFilled,
    ArrowLeft,
    Delete,
}

import App from './App.vue'
import router from './router'

const app = createApp(App)

for (const [key, component] of Object.entries(iconObject)) {
    app.component(key, component)
}

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)

app.mount('#appp')
