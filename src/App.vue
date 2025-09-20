<script setup>
import Start from '@/views/Start/index.vue'
// import { ref, watch } from 'vue'
import { useAppStore } from '@/stores/app'
const appStore = useAppStore()

const isReady = appStore.getIsReady()
</script>

<template>
    <div class="main-container">
        <Start v-if="!isReady" class="start" />
        <RouterView class="view" />
    </div>
</template>

<style scoped lang="scss">
.main-container {
    position: relative;
    display: flex;
    justify-content: center;
    .start {
        position: absolute;
        z-index: 2000;
    }
    .view {
        position: absolute;
    }
}
</style>
