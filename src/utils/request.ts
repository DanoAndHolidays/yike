// 使用ts类型化重写的request.js
import type { AxiosInstance } from 'axios'
import axios from 'axios'

const httpInstance: AxiosInstance = axios.create({
    baseURL: 'https://playlet.zonelian.com',
    timeout: 5000,
})

export default httpInstance
