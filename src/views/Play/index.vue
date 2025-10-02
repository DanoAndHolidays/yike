<script setup>
defineOptions({
    name: 'Play',
})

import Video from '../Home/components/Video.vue'
import Header from './components/Header.vue'
</script>

<template>
    <div class="play-container">
        <div class="header">
            <Header />
        </div>
        <div class="video">
            <Video />
        </div>
    </div>
</template>

<style lang="scss" scoped>
.play-container {
    height: 100%;
    width: 100%;
    background-color: $tiktok-background-color-1;
    color: $text-color-1;
    position: relative;
    // margin: 15px;
    // pointer-events: none;
    .header {
        position: absolute;
        width: 100%;
        top: 0;
        z-index: 20;
    }
    .video {
        position: relative;
    }
}
</style>
