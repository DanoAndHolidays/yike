<script setup>
import LikeInfoCard from './LikeInfoCard.vue'
import { ref } from 'vue'

import { useDramaInfo } from '@/stores/useDramaInfo'
const dramaInfo = useDramaInfo()

import { useDramaStore } from '@/stores/useDramaStore'
import { onMounted } from 'vue'

import { getAllEpisode } from '@/apis/play'
const getDramaInfo = async (vid) => {
    const res = await getAllEpisode(vid, 2, 15)
    const info = await res.data.data.data[0]
    console.log('log info', info)

    return info
}

const renderInfo = ref([])

const dramaStore = useDramaStore()
const handleLike = async () => {
    const collections = dramaStore.getLikes()

    // 通过 Promise.all 等待所有 getDramaInfo 调用完成
    let newCollections = await Promise.all(
        collections.map(async (item) => {
            let have = dramaInfo.isHas(item)
            if (have) {
                // console.log('have', have)
                have.vid = item
                console.log('have', have)

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

    console.log('log renderInfo', renderInfo.value)
}

onMounted(() => {
    handleLike()
})
</script>

<template>
    <div class="like-container">
        <LikeInfoCard
            v-for="item in renderInfo"
            :key="item?.vid"
            :episode="item?.episode"
            :episode_total="item?.episode_total"
            :img="item?.img"
            :title="item?.title"
            :vid="item?.vid"
        />
    </div>
</template>

<style lang="scss" scoped>
.like-container {
    height: calc(100vh - $tab-bar-height - 55px);
    width: 100%;
    background-color: $tiktok-background-color-1;
    color: $text-color-1;
    overflow: scroll;
    overflow-x: hidden;
    padding: 0 15px;

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
