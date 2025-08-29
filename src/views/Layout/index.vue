<script setup>
import NavBar from '@/views/Layout/components/NavBar.vue'
import Play from '@/views/Layout/components/Play.vue'
import TabBar from '@/views/Layout/components/TabBar.vue'
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
    margin: auto;
    position: relative;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    min-width: 375px;
    min-height: 667px;
    max-width: 500px;


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
