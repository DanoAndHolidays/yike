import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            name: 'Home',
            path: '/',
            alias: '/home',
            component: () => import('@/views/Home/index.vue'),
        },
        {
            name: 'Mine',
            path: '/mine',
            component: () => import('@/views/Mine/index.vue'),
        },
        {
            name: 'Category',
            path: '/category',
            component: () => import('@/views/Category/index.vue'),
        },
        {
            name: 'Episode',
            path: '/episode',
            component: () => import('@/views/Episode/index.vue'),
        },
        {
            name: 'Detail',
            path: '/detail',
            component: () => import('@/views/Detail/index.vue'),
        },
        {
            name: 'Play',
            path: '/play/:vid/:eid',
            component: () => import('@/views/Play/index.vue'),
        },
        {
            name: 'Upload',
            path: '/upload',
            component: () => import('@/views/Upload/index.vue'),
        },
        {
            name: 'Login',
            path: '/login',
            component: () => import('@/views/Login/index.vue'),
        },
    ],
})

router.beforeEach((to, from) => {
    const userStore = useUserStore()
    const isLogin = userStore.getIsLogin()
    if (!isLogin.value && to.name === 'Mine') {
        console.log('前往登录')
        return '/login'
    } else {
    }
})

router.beforeEach((to, from) => {})

export default router
