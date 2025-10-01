<script setup>
const props = defineProps({
    img: String,
    vid: Number,
    title: String,
    episode_total: Number,
    tag: String,
    rank: String,
})
</script>

<template>
    <div class="his-card-container">
        <div class="content">
            <img :src="props.img" />
            <div class="tag">
                <div class="text" v-if="props.tag">{{ props.tag }}</div>
            </div>
            <div class="rank" :class="{ have: props.rank }">
                <div class="text">
                    {{ props.rank }}
                    <div v-if="props.rank">TOP</div>
                </div>
            </div>
            <div class="ep">{{ props.episode_total }}集全</div>
        </div>
        <div class="info">{{ props.title }}</div>
    </div>
</template>

<style lang="scss" scoped>
.his-card-container {
    background-color: $tiktok-background-color-1;
    color: $text-color-1;
    width: 100%;
    height: 100%;
    // border: red solid 2px;

    .content {
        // border: green 3px solid;
        position: relative;
        border-radius: 15px;
        overflow: hidden;
        img {
            width: 100%;
            background-color: $text-color-2;
            border: #656565 1px solid;
            border-radius: 15px;
            overflow: hidden;
        }
        .tag {
            position: absolute;
            top: 5px;
            right: 0;
            background-color: #161616d7;
            margin: 2px 6px;
            border-radius: 5px;
            .text {
                color: $text-color-1;
                padding: 1px 5px;
                font-size: 10px;
            }
        }
        .have {
            background-image: linear-gradient(155deg, rgb(0, 44, 238) 0%, #e84a5f00 33%);
        }
        .rank {
            width: 100%;
            aspect-ratio: 1 / 1;
            position: absolute;
            top: 0;
            left: 0;

            .text {
                color: $text-color-1;
                padding: 3px 5px;
                font-size: 13px;
                font-style: oblique;
                font-weight: bold;
            }
        }
        .ep {
            position: absolute;
            right: 5px;
            bottom: 5px;
            text-shadow: 0 0 5px black;
            font-size: small;
            padding: 3px;
        }
    }

    .info {
        color: $text-color-4;
        font-size: small;
        text-overflow: ellipsis;

        width: calc(70px);
        white-space: nowrap;
        // white-space: nowrap;
    }
}
</style>
