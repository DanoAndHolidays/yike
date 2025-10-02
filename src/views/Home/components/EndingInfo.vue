<script setup>
const emit = defineEmits(['onToEpisodeMode'])
</script>

<template>
    <div class="container">
        <div class="content">
            <div class="info">喜欢就追剧吧！</div>
            <div class="button-group">
                <button @click="emit('onToEpisodeMode', 1)" @touchend="emit('onToEpisodeMode', 1)">
                    详情
                </button>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.container {
    display: flex;
    justify-content: center;
    // height: 300px;
    height: inherit;
    width: inherit;
    color: $text-color-1;
    background-color: transparent;
    pointer-events: none;
    position: relative;
    transition: all 0.3s ease;

    .content {
        position: absolute;
        pointer-events: all;
        opacity: 0.85;

        // border: #e3e3e374 2px solid;
        border-radius: 20px;
        padding: 15px 20px;
        top: 50%;
        width: 60%;

        .info {
            font-size: large;
            font-weight: bold;
            text-align: center;
        }

        .button-group {
            // pointer-events: all;
            button {
                margin-top: 10px;
                background-color: transparent;
                border: #e3e3e392 2px solid;
                border-radius: 10px;
                color: $text-color-1;
                width: 100%;
                padding: 8px 0;
            }
        }
    }
}
</style>
