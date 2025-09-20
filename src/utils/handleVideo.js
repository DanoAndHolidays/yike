import { getRandom } from '@/apis/play'
import { getVideoAddress } from '@/apis/play'
import { ref } from 'vue'
import { createMessage } from './message'

const VIDEO_LIST_LEBGTH = 5

const randomList = ref([])
const videoInfoList = ref([])

const getRandomList = async (page = 1, limit = 15) => {
    let res = await getRandom(page, limit)
    // console.log(res)

    randomList.value = await res.data.data.data
    // console.log(randomList.value)
}

const getVideoAdd = async (eid) => {
    let res = await getVideoAddress(eid)
    // console.log(res.data.data.url)

    return res.data.data.url
}

/**
 * @description 更新维护的三个视频队列
 * @param {boolean} di true为上拉 false为下拉
 * @returns 返回一个用于渲染队列的数组
 */
const updateVideoList = async (di) => {
    if (randomList.value.length == 0) {
        await getRandomList()
    }

    if (videoInfoList.value.length < VIDEO_LIST_LEBGTH) {
        while (videoInfoList.value.length < VIDEO_LIST_LEBGTH) {
            const videoInfo = await randomList.value.pop()
            // console.log(videoInfo)

            const add = await getVideoAdd(videoInfo.eid)
            videoInfo.url2 = add
            videoInfoList.value.push(videoInfo)
        }
    } else if (videoInfoList.value.length == VIDEO_LIST_LEBGTH) {
        videoInfoList.value = []
        for (let index = 0; index < VIDEO_LIST_LEBGTH; index++) {
            const videoInfo = await randomList.value.pop()
            // console.log(videoInfo)

            const add = await getVideoAdd(videoInfo.eid)
            videoInfo.url2 = add
            videoInfoList.value.push(videoInfo)
        }
    }

    // console.log(videoInfoList.value)
    setTimeout(() => {
        createMessage('加载成功')
    }, 500)
    return videoInfoList.value
}

export default updateVideoList
