import type { ComponentType } from 'react'
import DemoSSR from '../views/Demo/index.ssr'

export interface RouteConfig {
    path: string
    redirect?: string
    component?: ComponentType
    meta?: {
        title?: string
    }
}

const routes: RouteConfig[] = [
    {
        path: '/',
        redirect: '/react-demo',
    },
    {
        path: '/react-demo',
        component: DemoSSR,
        meta: {
            title: 'React SSR 测试',
        },
    },
]

export default routes
