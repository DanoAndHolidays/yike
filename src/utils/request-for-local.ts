// 使用ts类型化重写的request.js
import type { AxiosInstance } from 'axios'
import axios from 'axios'

const localhost = 3030

const httpInstance: AxiosInstance = axios.create({
    baseURL: `https:locahost:${localhost}`,
    timeout: 2000,
})

export default httpInstance
