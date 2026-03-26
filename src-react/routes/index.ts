import type { ComponentType } from 'react'
import Demo from '../views/Demo'

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
        component: Demo,
        meta: {
            title: 'React + Arco Design 测试',
        },
    },
]

export default routes
