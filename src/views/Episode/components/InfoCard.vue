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

    time: {
        type: String,
    },
    watchedNum: {
        type: Number,
    },
    vid: Number,
})

// const emit = defineEmits(['toggleCollection'])

import { useDramaStore } from '@/stores/useDramaStore'
import { computed } from 'vue'
const dramaStore = useDramaStore()

function formatDate(date) {
    if (!(date instanceof Date)) {
        date = new Date(date) // 允许传入时间戳或字符串
    }

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0') // 月份从0开始
    const day = String(date.getDate()).padStart(2, '0')
    const hour = String(date.getHours()).padStart(2, '0')
    const minute = String(date.getMinutes()).padStart(2, '0')

    return `${year}-${month}-${day} ${hour}:${minute}`
}

const formattedTime = computed(() => {
    if (dramaStore.getWatchRecord(props?.vid).value?.timestamp) {
        return formatDate(dramaStore.getWatchRecord(props.vid).value.timestamp)
    } else {
        return '暂无数据'
    }
})

import { createMessage } from '@/utils/message'

const hander = () => {
    dramaStore.toggleCollection(props.vid)
    dramaStore.isCollected(props.vid).value ? createMessage('已收藏') : createMessage('已取消')
}
</script>

<template>
    <div class="container">
        <div class="episode-drawer">
            <div class="episode-info">
                <img :src="props.img" :alt="props.title" />
                <div class="text">
                    <div class="info">
                        <div class="title">{{ props.title }}</div>
                        <div class="head" @click.stop.prevent="hander">
                            <div
                                :class="{
                                    coll: dramaStore.isCollected(props.vid).value,
                                    normal: !dramaStore.isCollected(props.vid).value,
                                }"
                            >
                                {{ dramaStore.isCollected(props.vid).value ? '已收藏' : '未收藏' }}
                            </div>
                        </div>
                    </div>
                    <div class="details">
                        <div class="content">
                            <div>总剧集 &nbsp; {{ props.episode_total }}</div>
                            <div>{{ formattedTime }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.container {
    height: 110px;
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
                border-radius: 7px;
                border: $tiktok-text-color-1 1px solid;
                box-shadow: 0 0 5px 5px $tiktok-background-color-1;
                margin-right: 15px;
            }

            .text {
                flex: 1;
                border-bottom: 1px #e3e3e31b solid;
                // border-top: 1px #e3e3e31b solid;

                .info {
                    display: flex;
                    height: 25px;
                    justify-content: space-between;

                    .title {
                        font-size: 1.1rem;
                        color: $text-color-1;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        width: calc(100% - 90px);
                    }
                    .head {
                        div.normal {
                            margin: 0px 10px;
                            padding: 0 5px;
                            border: 2.5px $text-color-4 solid;
                            border-radius: 100px;
                            opacity: 0.7;
                            font-weight: bold;
                        }

                        div.coll {
                            color: $favorite-color;
                            margin: 0px 10px;
                            padding: 0 5px;
                            border: 2.5px $favorite-color solid;
                            border-radius: 100px;
                            font-weight: bold;
                            opacity: 0.7;
                        }
                    }
                }

                .details {
                    color: $text-color-4;

                    .content {
                        opacity: 0.5;
                        // border-top: 1px #e3e3e33d solid;
                        margin-top: 5px;
                        // padding-top: 3px;
                        border: 0;
                    }
                }
            }
        }
    }
}
</style>
