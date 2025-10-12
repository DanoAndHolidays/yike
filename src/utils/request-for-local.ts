// 使用ts类型化重写的request.js
import type { AxiosInstance, AxiosResponse, AxiosError } from 'axios'
import axios from 'axios'

const localhost = 3030

const httpInstance: AxiosInstance = axios.create({
    baseURL: `http://localhost:${localhost}`,
    timeout: 2000,
})

// 请求拦截器（可选，用于添加token等）
httpInstance.interceptors.request.use(
    (config) => {
        // 可以在这里添加请求头，比如token
        // config.headers.Authorization = `Bearer ${token}`
        return config
    },
    (error: AxiosError) => {
        return Promise.reject(error)
    },
)

// 响应拦截器
httpInstance.interceptors.response.use(
    (response: AxiosResponse) => {
        // 直接返回数据，去掉外层的data包装
        return response.data
    },
    (error: AxiosError) => {
        let errorMessage = '本地服务器连接失败，请检查是否启动'

        return Promise.reject({
            success: false,
            message: errorMessage,
            originalError: error,
        })
        throw new Error(errorMessage)
    },
)

export default httpInstance
