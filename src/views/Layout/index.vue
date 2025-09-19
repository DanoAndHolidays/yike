<script setup>
import NavBar from '@/views/Layout/components/NavBar.vue'
import PlayBar from '@/views/Layout/components/PlayBar.vue'
import TabBar from '@/views/Layout/components/TabBar.vue'
import Video from './components/Video.vue'
</script>

<template>
    <div class="parent-container">
        <nav-bar />
        <div class="test">
            <Video />
        </div>
        <TabBar />
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
    overflow: hidden;
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

    .test {
        background-color: rgb(0, 0, 0);
        height: 300vh;
        overflow: hidden;
    }

    .tab-bar {
        position: fixed;
        bottom: 0;
        width: 100vw;
        max-width: 500px;
        z-index: 1000;
    }

    .nav-bar {
        position: fixed;
        top: 0;
        width: 100vw;
        max-width: 500px;
    }
}
</style>
