import type { ComponentType } from 'react'
import Demo from '../views/Demo'
import TreeDemo from '../views/TreeDemo'
import PermissionDemo from '../views/PermissionDemo'

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
    {
        path: '/permission-demo',
        component: PermissionDemo,
        meta: {
            title: '权限预览面板 — Set Diff + 互斥规则',
        },
    },
    {
        path: '/tree-demo',
        component: TreeDemo,
        meta: {
            title: '树形虚拟滚动 — 100k 节点',
        },
    },
]

export default routes
