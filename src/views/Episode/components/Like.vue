<script setup>
import InfoCard from './InfoCard.vue'
</script>

<template>
    <div class="container3">
        <InfoCard />
    </div>
</template>

<style lang="scss" scoped>
.container3 {
    height: calc(100vh - $tab-bar-height - 110px);
    width: 100%;
    background-color: $tiktok-background-color-1;
    color: $text-color-1;
    overflow: scroll;
    overflow-x: hidden;
    padding: 0 15px;

    /* 隐藏默认的滚动条样式 */
    scrollbar-width: none;
    /* Firefox */
    -ms-overflow-style: none;

    /* IE and Edge */
    &::-webkit-scrollbar {
        display: none;
        /* Chrome, Safari, and Opera */
    }
}
</style>
