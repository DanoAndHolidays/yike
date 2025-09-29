<script setup>
defineOptions({
    name: 'Episode',
})
import { ref } from 'vue'
// import Page from '@/views/Home/components/Page.vue'
import Statistic from './components/Statistic.vue'
import Collection from './components/Collection.vue'
import Like from './components/Like.vue'
import History from './components/History.vue'

import { useDramaStore } from '@/stores/useDramaStore'
const dramaStore = useDramaStore()
</script>

<template>
    <div class="container">
        <!-- <Statistic /> -->
        <el-tabs :stretch="true" class="tab-header">
            <el-tab-pane>
                <template #label name="a">
                    <span class="custom-tabs-label">
                        <i class="fa-solid fa-star fa-xl"> </i>
                        <div>收藏 {{ dramaStore.collectionsCount }}</div>
                        <div></div>
                    </span>
                </template>
                <Collection />
            </el-tab-pane>
            <el-tab-pane>
                <template #label name="a">
                    <span class="custom-tabs-label">
                        <i class="fa-solid fa-heart fa-xl"> </i>
                        <div>喜欢 {{ dramaStore.likesCount }}</div>
                    </span>
                </template>
                <Like />
            </el-tab-pane>
            <el-tab-pane>
                <template #label name="a">
                    <span class="custom-tabs-label">
                        <el-icon style="vertical-align: middle" size="24px"><Clock /></el-icon>
                        <div>观看历史 {{ dramaStore.watchRecordsCount }}</div>
                    </span>
                </template>
                <History />
            </el-tab-pane>
        </el-tabs>
    </div>
</template>

<style lang="scss" scoped>
.container {
    height: 100%;
    width: 100%;
    background-color: $tiktok-background-color-1;
    color: $text-color-1;
}
</style>
