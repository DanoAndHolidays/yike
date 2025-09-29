<script setup>
defineOptions({
    name: 'Mine',
})
import MineHeader from './components/MineHeader.vue'
import MIneStatistic from './components/MIneStatistic.vue'
import MineTab from './components/MineTab.vue'
</script>

<template>
    <div class="container">
        <MineHeader />
        <MIneStatistic />
        <MineTab />
    </div>
</template>

<style lang="scss" scoped>
.container {
    height: 100%;
    width: 100%;
    background-color: $tiktok-background-color-1;
    color: $text-color-1;
    // margin: 15px;
    // pointer-events: none;
}
</style>
