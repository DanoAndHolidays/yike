import axios from 'axios'

const httpInstance = axios.create({
    baseURL: 'https://playlet.zonelian.com',
    timeout: 5000,
})

export default httpInstance
