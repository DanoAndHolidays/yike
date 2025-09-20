import { ElMessage } from 'element-plus'
export const createMessage = (message) => {
    ElMessage({
        message: message,
        type: 'success',
        duration: 900,
        plain: true,
        offset: 90,
    })
}
