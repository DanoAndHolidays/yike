import httpInstance from '@/utils/request'

/**
 * @description
 * @param {Number} page
 * @param {Number} limit
 * @param {String} zlsj
 */
export const getCategoryList = (page, limit, zlsj = 'zlsj') => {
    return httpInstance({
        url: '/api/category/list',
        method: 'GET',
        param: {
            page,
            limit,
            zlsj,
        },
    })
}
/**
 * @description 获取服务器时间戳
 */
export const getTimestamp = (zlsj = 'zlsj') => {
    return httpInstance({
        url: '/api/microtime',
        method: 'GET',
        param: {
            zlsj,
        },
    })
}
