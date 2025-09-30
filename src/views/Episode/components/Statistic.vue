<script setup>
import { useDramaStore } from '@/stores/useDramaStore'
const dramaStore = useDramaStore()
</script>

<template>
    <div class="header-container">
        <div class="content">
            <el-icon style="vertical-align: middle" size="22px"><ArrowLeft /></el-icon>
        </div>
        <div class="content">剧集</div>
        <div class="content">
            <el-icon style="vertical-align: middle" size="22px"><Delete /></el-icon>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.header-container {
    height: 50px;
    padding: 0 10px;
    background-color: $tiktok-background-color-1;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 0 0px;
    color: $text-color-1;
    border-bottom: rgba(248, 248, 248, 0.127) solid 0.5px;
    font-weight: bolder;
    font-size: 1.1rem;
    // opacity: 0.95;
}
</style>
