<script setup>
const props = defineProps({
    episode: {
        type: Number,
    },
    episode_total: {
        type: Number,
    },
    img: {
        type: String,
    },
    title: {
        type: String,
    },
    isColloected: {
        type: Boolean,
    },
    time: {
        type: String,
    },
    watchedNum: {
        type: Number,
    },
})
</script>

<template>
    <div class="container">
        <div class="episode-drawer">
            <div class="episode-info">
                <img :src="props.img" :alt="props.title" />
                <div class="text">
                    <div class="title">{{ props.title }}</div>
                    <div class="details">
                        <div class="head">
                            <div>{{ props.time }}</div>
                            <div :class="{ coll: props.isColloected, normal: !props.isColloected }">
                                {{ props.isColloected ? '已收藏' : '未收藏' }}
                            </div>
                        </div>

                        <div class="content">
                            <div>
                                观看进度 &nbsp;
                                {{ ((props.watchedNum / props.episode_total) * 100).toFixed(0) }}%
                                &nbsp; 总剧集 &nbsp; {{ props.episode_total }}
                            </div>
                            <div></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.container {
    height: 115px;
    width: 100%;
    background-color: $tiktok-background-color-1;
    color: $text-color-1;
    // border: red solid 2px;
    margin: 5px 0;

    display: flex;

    .episode-drawer {
        width: calc(100% + 15px);

        .episode-info {
            display: flex;
            img {
                background-color: $tiktok-background-color-1;
                height: 100px;
                width: 75px;
                border-radius: 15px;
                border: $tiktok-text-color-1 1px solid;
                box-shadow: 0 0 5px 5px $tiktok-background-color-1;
                margin-right: 15px;
            }

            .text {
                flex: 1;
                border-bottom: 1px #e3e3e31b solid;
                .title {
                    font-size: 1.3rem;
                    color: $text-color-1;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    width: calc(100% - 40px);
                }

                .details {
                    color: $text-color-4;
                    .head {
                        display: flex;
                        justify-content: space-between;

                        div.normal {
                            margin: 0px 10px;
                            padding: 0 5px;
                            border: 1.5px $text-color-4 solid;
                            border-radius: 100px;
                            opacity: 0.7;
                        }
                        div.nomal {
                            margin: 0px 10px;
                            padding: 0 5px;
                            border: 1.5px $favorite-color solid;
                            border-radius: 100px;
                            opacity: 0.7;
                        }

                        div.coll {
                            color: $favorite-color;
                            margin: 0px 10px;
                            padding: 0 5px;
                            border: 1.5px $favorite-color solid;
                            border-radius: 100px;
                            opacity: 0.7;
                        }
                    }
                    .content {
                        opacity: 0.5;
                        border-top: 1px #e3e3e33d solid;
                        margin-top: 5px;
                        padding-top: 3px;
                    }
                }
            }
        }
    }
}
</style>
