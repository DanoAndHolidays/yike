<script setup>
import PlayBar from './PlayBar.vue';
import { ref } from 'vue';

const videoList = ref([
    {
        name: 'video1',
        id: 'my-player1'
    },
    {
        name: 'video2',
        id: 'my-player2'
    },

])

</script>

<template>
    <PlayBar class="play" v-for="video in videoList" :key="video.id" :videoJsId="video.id"></PlayBar>
    <div class="placeholder"></div>
</template>

<style scoped lang="scss">
.play {
    height: calc(100vh - $tab-bar-height);
}

.placeholder {
    height: $tab-bar-height;
}
</style>