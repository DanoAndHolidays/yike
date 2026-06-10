export interface PermissionNode {
  id: string
  label: string
  children?: PermissionNode[]
}

/** 互斥规则：ids 中的所有权限互斥，最多只能选中一个 */
export interface MutexRule {
  ids: string[]
  message: string
}

export interface DiffResult {
  added: string[]
  removed: string[]
}
