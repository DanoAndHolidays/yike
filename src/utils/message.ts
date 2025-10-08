// message.js was type-rewriting by ts 
import { ElMessage } from 'element-plus'
export const createMessage = (message: string): void => {
    ElMessage({
        message: message,
        type: 'success',
        duration: 900,
        plain: true,
        offset: 90,
    })
}
