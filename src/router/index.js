import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            component: () => import('@/views/Home/index.vue'),
        },
        {
            path: '/mine',
            component: () => import('@/views/Mine/index.vue'),
        },
        {
            path: '/category',
            component: () => import('@/views/Category/index.vue'),
        },
        {
            path: '/episode',
            component: () => import('@/views/Episode/index.vue'),
        },
        {
            path: '/detail',
            component: () => import('@/views/Detail/index.vue'),
        },
        {
            path: '/play/:vid/:eid',
            component: () => import('@/views/Play/index.vue'),
        },
        {
            path: '/upload',
            component: () => import('@/views/Upload/index.vue'),
        },
    ],
})

export default router
