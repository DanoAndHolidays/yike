<script setup>
import { ref, defineAsyncComponent } from 'vue'

// 使用组件懒加载
const UploadModule = defineAsyncComponent(() => import('./components/UploadModule.vue'))
</script>

<template>
    <div class="container">
        <UploadModule />
    </div>
</template>

<style scoped lang="scss">
.container {
    height: calc(100vh - $tab-bar-height);
    overflow: hidden;
    background-color: ($tiktok-background-color-1);
}
</style>
