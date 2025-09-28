<script setup>
// import { Ship } from '@element-plus/icons-vue/dist/types'
import InfoCard from './InfoCard.vue'

import { useDramaStore } from '@/stores/useDramaStore'
import { reactive } from 'vue'
const dramaStore = useDramaStore()

const date = new Date()

const formattedDate = date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
})

// console.log(formattedDate)

const info = reactive({
    time: formattedDate,
    episode: 1,
    episode_total: 90,
    img: 'https://static.zhonglian.com/upload/200004/2024/03/15/11/23cccb6a812a50bb82341654a2309ab9.png',
    isColloected: true,
    title: '儿媳的反击',
})
</script>

<template>
    <div class="container2">
        <InfoCard
            :time="info.time"
            :episode="info.episode"
            :episode_total="info.episode_total"
            :img="info.img"
            :is-colloected="true"
            :title="info.title"
            :watched-num="23"
        />
        <InfoCard
            :time="info.time"
            :episode="info.episode"
            :episode_total="info.episode_total"
            :img="info.img"
            :is-colloected="true"
            :title="info.title"
            :watched-num="230"
        />
        <InfoCard
            :time="info.time"
            :episode="info.episode"
            :episode_total="info.episode_total"
            :img="info.img"
            :is-colloected="true"
            :title="info.title"
            :watched-num="230"
        />
        <InfoCard
            :time="info.time"
            :episode="info.episode"
            :episode_total="info.episode_total"
            :img="info.img"
            :is-colloected="true"
            :title="info.title"
            :watched-num="230"
        />
        <InfoCard
            :time="info.time"
            :episode="info.episode"
            :episode_total="info.episode_total"
            :img="info.img"
            :is-colloected="true"
            :title="info.title"
            :watched-num="230"
        />
        <InfoCard
            :time="info.time"
            :episode="info.episode"
            :episode_total="info.episode_total"
            :img="info.img"
            :is-colloected="true"
            :title="info.title"
            :watched-num="230"
        />
        <InfoCard
            :time="info.time"
            :episode="info.episode"
            :episode_total="info.episode_total"
            :img="info.img"
            :is-colloected="true"
            :title="info.title"
            :watched-num="230"
        /><InfoCard
            :time="info.time"
            :episode="info.episode"
            :episode_total="info.episode_total"
            :img="info.img"
            :is-colloected="true"
            :title="info.title"
            :watched-num="230"
        />
        <InfoCard
            :time="info.time"
            :episode="info.episode"
            :episode_total="info.episode_total"
            :img="info.img"
            :is-colloected="true"
            :title="info.title"
            :watched-num="230"
        />
        <InfoCard
            :time="info.time"
            :episode="info.episode"
            :episode_total="info.episode_total"
            :img="info.img"
            :is-colloected="true"
            :title="info.title"
            :watched-num="230"
        />
    </div>
</template>

<style lang="scss" scoped>
.container2 {
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
