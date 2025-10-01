<script setup>
defineOptions({
    name: 'Category',
})

import CategoryCard from './components/CategoryCard.vue'
import Header from './components/Header.vue'
import { onMounted, ref } from 'vue'
import { getCategoryEpisode } from '@/apis/play'

// 用于跳转至详情页
import router from '@/router'
import { useVidStore } from '@/stores/user'
const vidStore = useVidStore()
const toDetail = (vid) => {
    router.push('detail')
    vidStore.setVidAndShowDetail(vid)
}

const curIndex = ref(0)
const categoryContentList = ref([])

const getCategoryEpisodeList = async (name_en, page, limit) => {
    let res = await getCategoryEpisode(name_en, page, limit)
    categoryContentList.value = await res.data.data.data
    console.log(categoryContentList.value)
}

const handleChange = async (index, name_en) => {
    curIndex.value = index
    await getCategoryEpisodeList(name_en, 1, 100)
}

onMounted(() => {
    getCategoryEpisodeList('hotPlayer', 1, 100)
})
</script>

<template>
    <div class="test">
        <Header class="top" @changecategory="handleChange" />
        <div class="container">
            <CategoryCard
                v-for="item in categoryContentList"
                :img="item.img"
                :vid="item.vid"
                :episode_total="item.episode"
                :tag="item.tag"
                :rank="item.rank"
                :title="item.title"
                @click="toDetail(item.vid)"
            />
        </div>
    </div>
</template>

<style lang="scss" scoped>
.test {
    .top {
        position: sticky;
        top: 0;
    }

    /* 隐藏默认的滚动条样式 */
    scrollbar-width: none;
    /* Firefox */
    -ms-overflow-style: none;

    /* IE and Edge */
    &::-webkit-scrollbar {
        display: none;
        /* Chrome, Safari, and Opera */
    }

    height: calc(100vh - $tab-bar-height);
    overflow-y: scroll;
    overflow-x: hidden;
    background-color: $tiktok-background-color-1;
    padding-bottom: 10px;
    .container {
        padding: 0 10px;
        background-color: $tiktok-background-color-1;
        color: $text-color-1;
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px; /* 行列间距 */
    }
}
</style>
