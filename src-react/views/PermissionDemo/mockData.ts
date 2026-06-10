import type { PermissionNode, MutexRule } from './types'

export const permissionTree: PermissionNode[] = [
  {
    id: 'sys_mgmt',
    label: '系统管理',
    children: [
      { id: 'view_user', label: '查看用户' },
      { id: 'create_user', label: '创建用户' },
      { id: 'edit_user', label: '编辑用户' },
      { id: 'delete_user', label: '删除用户' },
      { id: 'manage_roles', label: '管理角色' },
    ],
  },
  {
    id: 'content_mgmt',
    label: '内容管理',
    children: [
      { id: 'view_article', label: '查看文章' },
      { id: 'create_article', label: '创建文章' },
      { id: 'edit_article', label: '编辑文章' },
      { id: 'delete_article', label: '删除文章' },
      { id: 'publish_article', label: '发布文章' },
    ],
  },
  {
    id: 'data_analysis',
    label: '数据分析',
    children: [
      { id: 'view_report', label: '查看报表' },
      { id: 'export_data', label: '导出数据' },
      { id: 'full_access', label: '完全访问' },
    ],
  },
  {
    id: 'special',
    label: '特殊权限',
    children: [
      { id: 'read_only', label: '只读访问' },
    ],
  },
]

export const mutexRules: MutexRule[] = [
  {
    ids: ['full_access', 'read_only'],
    message: '"完全访问" 与 "只读访问" 互斥，已自动取消冲突项',
  },
  {
    ids: ['delete_user', 'edit_user'],
    message: '"删除用户" 与 "编辑用户" 互斥，已自动取消冲突项',
  },
  {
    ids: ['publish_article', 'delete_article'],
    message: '"发布文章" 与 "删除文章" 互斥，已自动取消冲突项',
  },
]

/** 模拟后端返回的初始已选中权限 */
export const initialChecked: string[] = [
  'view_user',
  'create_user',
  'edit_user',
  'manage_roles',
  'view_article',
  'create_article',
  'edit_article',
  'view_report',
  'read_only',
]
