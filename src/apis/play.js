import httpInstance from '@/utils/request'

/**
 * @description 获取随机剧集
 * @param {Number} page 页数
 * @param {Number} limit 每页大小
 * @param {String} zlsj 默认跳过加密
 * @returns 返回一个promise
 */
export const getRandom = (page = 1, limit = 15, zlsj = 'zlsj') => {
    return httpInstance({
        url: '/api/playlet/random',
        method: 'GET',
        params: {
            page,
            limit,
            zlsj,
        },
    })
}

/**
 * @description 获取所有剧集
 * @param {Number} vid 短剧ID
 * @param {Number} page 页数
 * @param {Number} limit 每页大小
 * @param {String} zlsj 默认跳过加密
 * @returns 返回一个promise
 */
export const getAllEpisode = (vid, page, limit, zlsj = 'zlsj') => {
    return httpInstance({
        url: '/api/playlet/episode',
        method: 'GET',
        params: {
            vid,
            page,
            limit,
            zlsj,
        },
    })
}

/**
 * @description 获取下一集
 * @param {Number} vid 短剧ID
 * @param {Number} eid 剧集ID
 * @param {Number} page 页数
 * @param {Number} limit 每页大小
 * @param {String} zlsj 默认跳过加密
 * @returns 返回一个promise
 */
export const getNextEpisode = (vid, eid, page, limit, zlsj = 'zlsj') => {
    return httpInstance({
        url: '/api/playlet/watch',
        method: 'GET',
        param: {
            vid,
            eid,
            page,
            limit,
            zlsj,
        },
    })
}

/**
 * @description 获取分类下的短剧列表
 * @param {String} name_en 分类英文名
 * @param {Number} page 页数
 * @param {Number} limit 每页大小
 * @param {String} zlsj 默认跳过加密
 * @returns 返回一个promise
 */
export const getCategoryEpisode = (name_en, page, limit, zlsj) => {
    return httpInstance({
        url: '/api/playlet/list',
        method: 'GET',
        param: {
            name_en,
            page,
            limit,
            zlsj,
        },
    })
}

/**
 * @description 短剧鉴权（获取视频的地址）
 * @param {Number} eid 剧集ID
 * @param {String} zlsj 默认跳过加密
 * @returns 返回一个promise
 */
export const getVideoAddress = (eid, zlsj) => {
    return httpInstance({
        url: '/api/playlet/auth',
        method: 'POST',
        data: {
            eid,
            zlsj,
        },
    })
}

/**
 * @description 保存观看记录
 * @param {Number} uid 用户ID，默认815551832537446
 * @param {Number} vid 短剧ID
 * @param {Number} eid 剧集ID
 * @param {Number} second 秒数，不明所以的一个参数，默认为3
 * @param {String} zlsj 默认跳过加密
 * @returns 返回一个promise
 */
export const saveWatchRecord = (uid = 815551832537446, vid, eid, second = 3, zlsj = 'zlsj') => {
    return httpInstance({
        url: '/api/playlet/save',
        method: 'POST',
        data: {
            uid,
            vid,
            eid,
            second,
            zlsj,
        },
    })
}

/**
 * @description 获取观看记录
 * @param {Number} uid 用户ID，默认815551832537446
 * @param {Number} page 页数
 * @param {String} zlsj 默认跳过加密
 * @returns 返回一个promise
 */
export const getWatchRecord = (uid = 815551832537446, page, zlsj = 'zlsj') => {
    return httpInstance({
        url: '/api/playlet/record',
        method: 'GET',
        param: {
            uid,
            page,
            zlsj,
        },
    })
}
