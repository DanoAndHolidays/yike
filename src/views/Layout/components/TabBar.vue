<script setup>
</script>

<template>
    <div class="tab-bar">
        <div>
            <h3>首页</h3>
        </div>
        <div>
            <h3>分类</h3>
        </div>
        <div class="shang">
            <i class="fa-solid fa-plus fa-xl"></i>
        </div>
        <div>
            <h3>剧集</h3>
        </div>
        <div>
            <h3>我的</h3>
        </div>
    </div>
</template>

<style scoped lang="scss">
.tab-bar {
    color: $text-color-1;
    background-color: $primary-color;
    display: flex;
    justify-content: space-around;
    height: $tab-bar-height;
    align-items: center;
}
</style>
