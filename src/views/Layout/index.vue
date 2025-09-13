<script setup>
import NavBar from '@/views/Layout/components/NavBar.vue'
import PlayBar from '@/views/Layout/components/PlayBar.vue'
import TabBar from '@/views/Layout/components/TabBar.vue'
</script>

<template>
    <div class="parent-container">
        <nav-bar />
        <div class="test">
            <play-bar />
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
        background-color: red;
    }

    .play {
        height: calc(100vh - $tab-bar-height);
    }

    .tab-bar {
        position: fixed;
        bottom: 0;
        width: 100vw;
        max-width: 500px;
    }

    .nav-bar {
        position: fixed;
        top: 0;

        width: 100vw;
        max-width: 500px;
    }
}
</style>
