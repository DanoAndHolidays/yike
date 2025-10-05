<script setup>
// import PlayBar from '@/views/Layout/components/PlayBar.vue'
import Start from '@/views/Start/index.vue'
import TabBar from './components/TabBar.vue'
// import Start from '@/views/Start/index.vue'
// import { ref } from 'vue'
import Detail from '@/views/Detail/index.vue'
import { useAppStore } from '@/stores/app'
const appStore = useAppStore()

import { useVidStore } from '@/stores/user'
const vidStore = useVidStore()

import { ref } from 'vue'
// appStore.setIsReady()

const isReady = appStore.getIsReady()

const keepAliveList = ref(['Mine', 'Category'])
</script>

<template>
    <div class="parent-container" id="parent-container">
        <Start v-if="!isReady" class="start" />
        <div class="view">
            <router-view v-slot="{ Component }">
                <keep-alive :include="keepAliveList">
                    <component :is="Component" />
                </keep-alive>
            </router-view>
        </div>
        <TabBar class="tab-bar" />
    </div>
</template>

<style scoped lang="scss">
.parent-container {
    margin: auto;
    position: relative;
    width: 100vw;
    height: 100vh;
    min-width: 375px;
    min-height: 667px;
    max-width: 500px;
    overflow: hidden !important;
    box-shadow: 0px 0px 30px 3px rgba(0, 0, 0, 0.8);

    overflow-x: auto;
    /* 隐藏默认的滚动条样式 */
    scrollbar-width: none;
    /* Firefox */
    -ms-overflow-style: none;

    /* IE and Edge */
    &::-webkit-scrollbar {
        display: none;
        /* Chrome, Safari, and Opera */
    }

    .start {
        user-select: none;
        position: absolute;
        z-index: 2000;
    }

    .view {
        background-color: rgb(0, 0, 0);
        height: 300vh;
        overflow: hidden;
    }
    .tab-bar {
        position: fixed;
        bottom: 0px;
        width: 100vw;
        max-width: 500px;
        z-index: 1000;
        user-select: none;
    }
}
</style>
