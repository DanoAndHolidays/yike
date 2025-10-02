<script setup>
import Header from './components/Header.vue'
import Page from '../Home/components/Page.vue'

import { onMounted, ref } from 'vue'

const emit = defineEmits(['return'])

defineOptions({
    name: 'Detail',
})
import { useVidStore } from '@/stores/user'
const vidStore = useVidStore()
const vid = vidStore.getVid

// const vid = ref(10010)
const allEpisodeList = ref([])

import { getAllEpisode } from '@/apis/play'
const getAllEpisodeList = async (vid, page, limit) => {
    let res = await getAllEpisode(vid, page, limit)
    allEpisodeList.value = await res.data.data.data[0]
    // console.log(allEpisodeList.value)
}

onMounted(() => {
    getAllEpisodeList(vid ?? 10009, 1, 1000)
})
</script>

<template>
    <div class="detail-container">
        <div class="top">
            <div class="header-container">
                <div class="content" @click.stop.prevent="$router.back">
                    <el-icon style="vertical-align: middle" size="22px"><ArrowLeft /></el-icon>
                </div>
                <div class="content">剧集信息</div>
                <div class="content">
                    <el-icon style="vertical-align: middle" size="22px"><Share /></el-icon>
                </div>
            </div>
            <Header
                :vid="vid"
                :episode_total="allEpisodeList.episode_total"
                :title="allEpisodeList.title"
                :img="allEpisodeList.img"
            />
        </div>
        <div class="page">
            <Page :vid="vid" :size="true" />
        </div>
    </div>
</template>

<style lang="scss" scoped>
.detail-container {
    background-color: $tiktok-background-color-1;
    color: $text-color-1;
    width: 100%;
    height: 100vh;
    position: relative;

    .top {
        position: absolute;
        top: 0;
        height: calc($detail-top-height + 50px);
        width: 100%;
        // border: gold solid 3px;
        padding: 0 15px;

        overflow: hidden;
        .header-container {
            height: 50px;
            padding: 0 10px;
            background-color: $tiktok-background-color-1;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            color: $text-color-1;
            border-bottom: rgba(248, 248, 248, 0.127) solid 0.5px;
            font-weight: bolder;
            font-size: 1.1rem;
            // opacity: 0.95;
        }
    }

    .page {
        height: calc(100vh - $detail-top-height - 40px);
        width: 100%;
        // border: red solid 3px;
        position: absolute;
        bottom: 0;
        padding: 0 15px;
    }
}
</style>
