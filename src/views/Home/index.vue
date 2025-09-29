<script setup>
defineOptions({
    name: 'Home',
})
import Video from '@/views/Home/components/Video.vue'
import NavBar from '@/views/Home/components/NavBar.vue'
</script>

<template>
    <div class="container">
        <NavBar />
        <Video />
    </div>
</template>

<style lang="scss" scoped>
.container {
    height: 100%;
    width: 100%;
    background-color: $tiktok-background-color-1;

    .nav-bar {
        position: fixed;
        top: 0;
        width: 100vw;
        max-width: 500px;
        z-index: 1000;
    }
}
</style>
