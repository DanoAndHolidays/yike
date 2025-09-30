<script setup>
const props = defineProps({
    img: String,
    vid: Number,
    title: String,
    lastEpisode: Number,
    time: Number,
})
</script>

<template>
    <div class="his-card-container">
        <img :src="props.img" />
        <div class="info">
            {{ props.time ?? '34' }}
        </div>
    </div>
</template>

<style lang="scss" scoped>
.his-card-container {
    background-color: $tiktok-background-color-1;
    color: $text-color-1;
    position: relative;
    height: 100%;
    width: 100%;
    img {
        height: 100%;
        width: 100%;
        background-color: $text-color-2;
        position: absolute;
        top: 0;
        left: 0;
    }
    .info {
        position: absolute;
        bottom: 0px;
        left: 3px;
        width: 100%;
        color: $text-color-1;
        font-size: small;
        text-shadow: 0 0 3px $text-color-2;
        text-overflow: ellipsis;
        width: calc(100%);
        white-space: nowrap;
        overflow: hidden;
    }
}
</style>
