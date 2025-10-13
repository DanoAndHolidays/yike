import service from '@/utils/request-for-local'

/**
 * [login] - 向本地后端请求是否已合并上传的切片
 * @param chunkSize 分片大小，Number
 * @param fileName 文件名称，String
 * @param fileSize 文件大小，Number
 */

export function login(data) {
    return service({
        url: '/api/user/login',
        method: 'post',
        data,
    })
}

/**
 * [logout] - 向本地后端请求是否已合并上传的切片
 * @param chunkSize 分片大小，Number
 * @param fileName 文件名称，String
 * @param fileSize 文件大小，Number
 */

export function logout(data) {
    return service({
        url: '/api/user/logout',
        method: 'post',
        data,
    })
}
