<script setup>
import { ref } from 'vue'

const openBar = ref(false)
</script>

<template>
    <div class="nav-bar">
        <div @click="openBar = !openBar">
            <i class="fa-solid fa-bars fa-lg"></i>
        </div>
        <div>
            <h3>热门</h3>
        </div>
        <div>
            <h3>赘婿</h3>
        </div>
        <div>
            <h3>重生</h3>
        </div>
        <div>
            <h3>都市</h3>
        </div>
        <div>
            <h3>古装</h3>
        </div>
        <div>
            <h3>情感</h3>
        </div>
        <div>
            <h3>神医</h3>
        </div>
        <div>
            <h3>言情</h3>
        </div>
        <div>
            <i class="fa-solid fa-magnifying-glass fa-lg"></i>
        </div>
        <el-drawer
            v-model="openBar"
            title="暂未实现"
            :with-header="true"
            direction="ltr"
            size="300"
        >
            <p></p>
        </el-drawer>
    </div>
</template>

<style scoped lang="scss">
.nav-bar {
    height: 2.5rem;
    overflow: hidden;
    color: $text-color-1;
    display: flex;
    justify-content: space-around;
    align-items: center;
    z-index: 11;
    background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0));
    backdrop-filter: blur(1px);
}
</style>
