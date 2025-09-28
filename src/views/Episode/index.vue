<script setup>
import { ref } from 'vue'
// import Page from '@/views/Home/components/Page.vue'

import Collection from './components/Collection.vue'
import Like from './components/Like.vue'
import History from './components/History.vue'
</script>

<template>
    <div class="container">
        <el-tabs :stretch="true" class="tab-header">
            <el-tab-pane>
                <template #label name="a">
                    <span class="custom-tabs-label">
                        <i class="fa-solid fa-star fa-lg"></i>
                        <div>收藏</div>
                    </span>
                </template>
                <Collection />
            </el-tab-pane>
            <el-tab-pane>
                <template #label name="a">
                    <span class="custom-tabs-label">
                        <i class="fa-solid fa-heart fa-lg"></i>
                        <div>喜欢</div>
                    </span>
                </template>
                <Like />
            </el-tab-pane>
            <el-tab-pane>
                <template #label name="a">
                    <span class="custom-tabs-label">
                        <el-icon style="vertical-align: middle" size="22px"><Clock /></el-icon>
                        <div>观看历史</div>
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
