<script setup>
import MineHeader from './components/MineHeader.vue'
import MIneStatistic from './components/MIneStatistic.vue'
</script>

<template>
    <div class="container">
        <MineHeader />
        <MIneStatistic />
    </div>
</template>

<style lang="scss" scoped>
.container {
    height: 100%;
    width: 100%;
    background-color: $tiktok-background-color-1;
    color: $text-color-1;
    // margin: 15px;
}
</style>
