<script setup>
import { useDramaStore } from '@/stores/useDramaStore'
const dramaStore = useDramaStore()
</script>

<template>
    <div class="header-container">
        <el-statistic title="Coletions" :value="dramaStore.collectionsCount" />
        <el-statistic title="Likes" :value="dramaStore.likesCount" />
        <el-statistic title="Watched" :value="dramaStore.watchRecordsCount" />
    </div>
</template>

<style lang="scss" scoped>
.header-container {
    height: 40px;
    background-color: $tiktok-background-color-1;
    display: flex;
    justify-content: space-around;
    margin: 0 0px;
}
</style>
