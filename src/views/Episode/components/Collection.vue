<script setup>
import InfoCard from './InfoCard.vue'
import { ref } from 'vue'

import { useDramaInfo } from '@/stores/useDramaInfo'
const dramaInfo = useDramaInfo()

import { useDramaStore } from '@/stores/useDramaStore'
import { onMounted } from 'vue'

import { getAllEpisode } from '@/apis/play'
const getDramaInfo = async (vid) => {
    const res = await getAllEpisode(vid, 1, 1)
    const info = await res.data.data.data[0]
    return info
}

const renderInfo = ref([])

const dramaStore = useDramaStore()
const handleCollection = async () => {
    const collections = dramaStore.getCollections()

    // 通过 Promise.all 等待所有 getDramaInfo 调用完成
    let newCollections = await Promise.all(
        collections.map(async (item) => {
            const have = dramaInfo.isHas(item)
            if (have) {
                return have
            } else {
                // 等待 getDramaInfo 执行完毕，得到 info 数据
                const info = await getDramaInfo(item)
                return info
            }
        }),
    )

    renderInfo.value = newCollections
}

onMounted(() => {
    handleCollection()
})
</script>

<template>
    <div class="container1">
        <InfoCard
            v-for="item in renderInfo"
            :key="item.vid"
            :episode="item.episode"
            :episode_total="item.episode_total"
            :img="item.img"
            :title="item.title"
        />
    </div>
</template>

<style lang="scss" scoped>
.container1 {
    height: calc(100vh - $tab-bar-height - 110px);
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
