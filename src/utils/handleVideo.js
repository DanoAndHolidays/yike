import { getRandom } from '@/apis/play'
import { getVideoAddress } from '@/apis/play'
import { ref } from 'vue'
import { createMessage } from './message'
import { getAllEpisode } from '@/apis/play'

const VIDEO_LIST_LEBGTH = 5

const randomList = ref([])
const nextList = ref([])
const videoInfoList = ref([])

const getRandomList = async (page = 1, limit = 15) => {
    let res = await getRandom(page, limit)
    randomList.value = await res.data.data.data
}

const getNextList = async (vid, page = 1, limit = 5) => {
    // let res = await getNextEpisode(vid, eid, page, limit)
    let res = await getAllEpisode(vid, page, (limit = 1000))
    nextList.value = await res.data.data.data.reverse()
}
/**
 * @description 这里使用的鉴权接口，我打算改为一个鉴权一个不用
 */
const getVideoAdd = async (eid) => {
    let res = await getVideoAddress(eid)
    // console.log('video address:', res.data.data.url)

    return res.data.data.url
}

let preVid = 0
let preEid = 0

/**
 * @description 更新维护的五个视频队列
 * @param {Number} vid 下一集观看逻辑的vid，默认值为0，
 * @param {Number} eid 同上，这两个参数有一个不填，就是随机获取
 * @returns 返回一个用于渲染队列的数组
 */
const updateVideoList = async (vid, eid) => {
    const isRandom = vid && eid ? false : true
    // console.log('isRandom', isRandom)

    if (isRandom) {
        if (randomList.value.length == 0) {
            await getRandomList()
        }

        if (videoInfoList.value.length < VIDEO_LIST_LEBGTH) {
            while (videoInfoList.value.length < VIDEO_LIST_LEBGTH) {
                const videoInfo = await randomList.value.pop()

                const add = await getVideoAdd(videoInfo.eid)
                videoInfo.url2 = add
                videoInfoList.value.push(videoInfo)
            }
        } else if (videoInfoList.value.length == VIDEO_LIST_LEBGTH) {
            videoInfoList.value = []
            for (let index = 0; index < VIDEO_LIST_LEBGTH; index++) {
                const videoInfo = await randomList.value.pop()

                const add = await getVideoAdd(videoInfo.eid)
                videoInfo.url2 = add
                videoInfoList.value.push(videoInfo)
            }
        }

        setTimeout(() => {
            createMessage('加载成功')
        }, 1000)
        return videoInfoList.value
    } else {
        if (preEid == eid && preVid == vid) {
            if (nextList.value.length == 0) {
                await getNextList(vid)
                const temp = nextList.value.filter((value) => value.eid >= eid)
                nextList.value = temp
                // console.log('next', nextList.value)
            }
        } else {
            preEid = eid
            preVid = vid
            await getNextList(vid)
            const temp = nextList.value.filter((value) => value.eid >= eid)
            nextList.value = temp
            // console.log('next', nextList.value)
        }

        if (videoInfoList.value.length < VIDEO_LIST_LEBGTH) {
            while (videoInfoList.value.length < VIDEO_LIST_LEBGTH) {
                const videoInfo = await nextList.value.pop()

                const add = await getVideoAdd(videoInfo.eid)
                videoInfo.url2 = add
                videoInfoList.value.push(videoInfo)
            }
        } else if (videoInfoList.value.length == VIDEO_LIST_LEBGTH) {
            videoInfoList.value = []
            for (let index = 0; index < VIDEO_LIST_LEBGTH; index++) {
                const videoInfo = await nextList.value.pop()

                const add = await getVideoAdd(videoInfo.eid)
                videoInfo.url2 = add
                videoInfoList.value.push(videoInfo)
            }
        }

        setTimeout(() => {
            createMessage('加载成功')
        }, 1000)
        return videoInfoList.value
    }
}

export default updateVideoList
