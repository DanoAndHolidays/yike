<script setup>
import NavBar from '@/views/NavBar/index.vue'
import Play from '@/views/Play/index.vue'
import TabBar from '@/views/TabBar/index.vue'
</script>

<template>
    <div class="parent-container">
        <nav-bar />
        <play />
        <TabBar />
    </div>

</template>

<style scoped lang="scss">
.parent-container {
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;

    .play {
        height: calc(100vh - $tab-bar-height);
    }

    .tab-bar {
        position: relative;
        bottom: 0;
        width: 100%;
    }

    .nav-bar {
        position: absolute;
        top: 0;
        width: 100%;
    }
}
</style>
