import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/views/Layout/index.vue'
import Start from '@/views/Start/index.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '',
            component: Layout,
        },
        {
            path: '/start',
            component: Start,
        },
    ],
})

export default router
