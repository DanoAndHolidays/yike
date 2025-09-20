<script setup>
import { ref } from 'vue'
import { applog } from '@/utils/applog'
import router from '@/router'

// 默认首页
const tabBarIndex = ref(0)
const handleClick = (index) => {
    tabBarIndex.value = index
    applog(`${index}?`)

    const routeLink = ref(['/', '/category', '/', '/episode', '/mine'])

    router.push(routeLink.value[index])
}
</script>

<template>
    <div class="tab-bar">
        <div class="tab" @click="handleClick(0)" :class="{ active: tabBarIndex == 0 }">
            <h3>首页</h3>
        </div>
        <div class="tab" @click="handleClick(1)" :class="{ active: tabBarIndex == 1 }">
            <h3>分类</h3>
        </div>
        <div class="tab" @click="handleClick(2)" :class="{ active: tabBarIndex == 2 }">
            <i class="fa-solid fa-plus fa-xl"></i>
        </div>
        <div class="tab" @click="handleClick(3)" :class="{ active: tabBarIndex == 3 }">
            <h3>剧集</h3>
        </div>
        <div class="tab" @click="handleClick(4)" :class="{ active: tabBarIndex == 4 }">
            <h3>我的</h3>
        </div>
    </div>
</template>

<style scoped lang="scss">
.tab-bar {
    color: $text-color-4;
    background-color: $primary-color;
    display: flex;
    justify-content: space-around;
    height: $tab-bar-height;
    align-items: center;
    z-index: 8;
    border-top: 0.5px $text-color-4 solid;

    @media screen and (min-width: 500px) {
        & {
            cursor: pointer;
        }
    }

    .active {
        color: $text-color-1 !important;
        transition: color 0.2s;
        transform: scale(1.01);
    }

    h3 {
        margin: 0;
        font-size: large;
    }
}
</style>
