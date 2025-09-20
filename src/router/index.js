import { createRouter, createWebHistory } from 'vue-router'
import Mine from '@/views/Mine/index.vue'
import Category from '@/views/Category/index.vue'
import Episode from '@/views/Episode/index.vue'
import Home from '@/views/Home/index.vue'

import Video from '@/views/Home/components/Video.vue'
import NavBar from '@/views/Home/components/NavBar.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            component: Home,
        },
        {
            path: '/mine',
            component: Mine,
        },
        {
            path: '/category',
            component: Category,
        },
        {
            path: '/episode',
            component: Episode,
        },
    ],
})

export default router
