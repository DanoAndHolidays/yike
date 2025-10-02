<script setup>
import router from '@/router'
</script>

<template>
    <div class="header-container">
        <div class="content" @click="router.push('/')">
            <el-icon style="vertical-align: middle" size="22px"><ArrowLeft /></el-icon>
        </div>
        <div class="content">追剧模式</div>
        <div class="content">
            <el-icon style="vertical-align: middle" size="22px"><Share /></el-icon>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.header-container {
    height: 50px;
    padding: 0 10px;
    background-color: transparent;
    background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0) 100%);
    backdrop-filter: blur(4px);
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 0 0px;
    color: $text-color-1;
    // border-bottom: rgba(248, 248, 248, 0.127) solid 0.5px;
    // font-weight: bolder;
    font-size: 1.1rem;
    // opacity: 0.95;
    .content {
        font-weight: bold;
    }
}
</style>
