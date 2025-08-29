<script setup>
</script>

<template>
    <div class="nav-bar">
        <div>
            <i class="fa-solid fa-bars fa-lg"></i>
        </div>
        <div>
            <h3>首页</h3>
        </div>
        <div>
            <h3>分类</h3>
        </div>
        <div>
            <h3>剧集</h3>
        </div>
        <div>
            <h3>我的</h3>
        </div>
        <div>
            <h3>首页</h3>
        </div>
        <div>
            <i class="fa-solid fa-magnifying-glass fa-lg"></i>
        </div>
    </div>

</template>

<style scoped lang="scss">
.nav-bar {
    height: 2.5rem;
    overflow: hidden;
    color: $text-color-1;
    display: flex;
    justify-content: space-around;
    overflow-x: hidden;
    align-items: center;
    z-index: 100;
    background-image: linear-gradient(to bottom,
            rgba(0, 0, 0, 0.3),
            rgba(0, 0, 0, 0));
}
</style>