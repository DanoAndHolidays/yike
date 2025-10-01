<script setup>
import HistoryCard from './HistoryCard.vue'
// import InfoCard from './InfoCard.vue'
import { ref, computed } from 'vue'

import { useDramaInfo } from '@/stores/useDramaInfo'
const dramaInfo = useDramaInfo()

import { onMounted } from 'vue'

import { getAllEpisode } from '@/apis/play'
const getDramaInfo = async (vid) => {
    const res = await getAllEpisode(vid, 2, 15)
    const info = await res.data.data.data[0]
    console.log('log info', info)

    return info
}

const renderInfo = ref([])

import { useDramaStore } from '@/stores/useDramaStore'
const dramaStore = useDramaStore()
const handleHistory = async () => {
    const collections = dramaStore.getWatchRecordAll()

    // console.log('collections', collections)

    // 通过 Promise.all 等待所有 getDramaInfo 调用完成
    let newCollections = await Promise.all(
        collections.map(async (item) => {
            let have = dramaInfo.isHas(item[0])
            if (have) {
                // console.log('have', have)
                have.vid = item[0]
                have.time = formatDate(item[1].timestamp)
                // console.log('have', have)

                return have
            } else {
                // 等待 getDramaInfo 执行完毕，得到 info 数据
                // let info = await getDramaInfo(item)
                // console.log('get', info)
                return {}
            }
        }),
    )

    renderInfo.value = newCollections.reverse()

    console.log('history renderInfo', renderInfo.value)
}

onMounted(() => {
    handleHistory()
})

function formatDate(date) {
    if (!(date instanceof Date)) {
        date = new Date(date) // 允许传入时间戳或字符串
    }

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0') // 月份从0开始
    const day = String(date.getDate()).padStart(2, '0')
    const hour = String(date.getHours()).padStart(2, '0')
    const minute = String(date.getMinutes()).padStart(2, '0')

    return `${year}-${month}-${day} ${hour}:${minute}`
}

const formattedTime = computed(() => {
    if (dramaStore.getWatchRecord(props?.vid).value?.timestamp) {
        return formatDate(dramaStore.getWatchRecord(props.vid).value.timestamp)
    } else {
        return '暂无数据'
    }
})

import { createMessage } from '@/utils/message'
// 用于跳转至详情页
import router from '@/router'
import { useVidStore } from '@/stores/user'
const vidStore = useVidStore()
const toDetail = (vid) => {
    router.push('detail')
    vidStore.setVidAndShowDetail(vid)
}
</script>

<template>
    <div class="history-container">
        <HistoryCard
            class="con"
            v-for="item in renderInfo"
            :title="item.title"
            :img="item.img"
            :time="item.time"
            @click="toDetail(item.vid)"
        />
    </div>
</template>

<style lang="scss" scoped>
.history-container {
    .con {
        // border: wheat 2px solid;
        width: 100%;
        height: 100%;
        aspect-ratio: 3 / 4;
    }
    height: calc(100vh - $tab-bar-height - $episode-height);
    width: 100%;
    background-color: $tiktok-background-color-1;
    color: $text-color-1;
    overflow-y: auto;
    overflow-x: hidden;
    display: grid;
    grid-template-columns: repeat(3, auto); /* 三列，均分 */

    gap: 2px; /* 行列间距 */
    // padding: 0 15px;

    /* 隐藏默认的滚动条样式 */
    scrollbar-width: none;
    /* Firefox */
    -ms-overflow-style: none;

    /* IE and Edge */
    &::-webkit-scrollbar {
        display: none;
        /* Chrome, Safari, and Opera */
    }
}
</style>
