import { ElMessage } from 'element-plus'
export const createMessage = (message) => {
    ElMessage({
        message: message,
        type: 'success',
        duration: 1500,
        plain: true,
        offset: 64,
    })
}
