<script setup>
import { createMessage } from '@/utils/message'
import { ref, onMounted, watch } from 'vue'
import videojs from 'video.js'
import 'video.js/dist/video-js.css'
import _ from 'lodash'

// 应用运行信息
import { useAppStore } from '@/stores/app'
const appStore = useAppStore()

// 用户信息浏览器存储
import { useUserStore } from '@/stores/user'
// import { use } from 'video.js/dist/types/tech/middleware'
const userStore = useUserStore()

// 处理滑动与点击的冲突
let startX = 0
let startY = 0
let isDragging = false
const currentMoveThreshold = 30

// 侧边按钮的状态管理
const isLike = ref(false)
const isFavorite = ref(false)
const isShare = ref(false)
const isMute = userStore.getIsMute() //默认静音

const tab = ref(null)

const isEnded = ref(false)
let player = null
// const src = ref('https://playletcdn.nnchenxin.cn/video/sqzalsbnl/17.mp4')

const autoPlay = (playing) => {
    if (playing) {
        player.play()
    } else {
        player.pause()
    }
}

const autoMute = () => {
    player.muted(isMute.value)
}

const props = defineProps({
    Playing: {
        type: Boolean,
    },
    videoInfo: {
        type: String,
    },
    videoIsPlaying: {
        type: Boolean,
    },
    eid: {
        type: Number,
    },
    episode: {
        type: Number,
    },
    episode_total: {
        type: Number,
    },
    img: {
        type: String,
    },
    is_vip: {
        type: Number,
    },

    title: {
        type: String,
    },
    url: {
        type: String,
    },
    url2: {
        type: String,
    },
    vid: {
        type: Number,
    },
})

const toggleMute = (e) => {
    e.stopPropagation()
    e.preventDefault()
    isMute.value = !isMute.value
    createMessage(isMute.value ? '静音开启' : '静音解除')
    player.muted(isMute.value)
}

const toggleFavorite = (e) => {
    e.stopPropagation()
    e.preventDefault()
    isFavorite.value = !isFavorite.value
    createMessage(isFavorite.value ? '收藏成功' : '收藏移除')
}

// 触摸开始事件
function handleTouchStart(e) {
    // e.stopPropagation()
    e.preventDefault()

    const touch = e.touches ? e.touches[0] : e
    startX = touch.clientX
    startY = touch.clientY

    isDragging = false
}

// 触摸移动事件
function handleTouchMove(e) {
    // e.stopPropagation()
    e.preventDefault()

    if (!startX || !startY) return

    const touch = e.touches ? e.touches[0] : e
    const currentX = touch.clientX
    const currentY = touch.clientY

    const deltaX = Math.abs(currentX - startX)
    const deltaY = Math.abs(currentY - startY)
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

    // 如果移动距离超过阈值，则认为是滑动
    if (distance > currentMoveThreshold) {
        isDragging = true
    }
}

// 触摸结束事件
function handleTouchEnd(e) {
    // e.stopPropagation()
    e.preventDefault()

    if (!startX || !startY) return

    // 如果不是滑动且时间小于阈值，则认为是点击
    if (!isDragging) {
        // console.log('点击，不是滑动')

        if (player.paused()) {
            player.play()
            createMessage('继续播放')
        } else {
            player.pause()
            createMessage('暂停播放')
        }
    }

    // 重置状态
    startX = 0
    startY = 0
}

onMounted(() => {
    // 添加初始化宽和高，否则加载播放器的时候会闪一下,添加了还是哈
    let options = {
        height: '1415',
        width: '795.94',
        aspectRatio: '9:16',
        controlBar: {
            fullscreenToggle: false,
            playToggle: false,
            volumeMenuButton: false,
            // durationDisplay: false,
            // currentTimeDisplay: false,
            timeDivider: false,
            volumePanel: false,
            pictureInPictureToggle: false,
            remainingTimeDisplay: false,
        },
        userAction: {
            click: true,
            doubleClick: false,
        },
        controls: true,
    }
    player = videojs(props.videoInfo, options, function onPlayerReady() {
        // videojs.log('播放器准备好了!')
        // 最新的浏览器一般禁止video自动播放，直接调用play()会报错。只有用户在页面上操作后或者在video标签上添加muted（静音）属性，才能调用play函数。本案例是在video标签上添加了muted属性。
        // this.play()
        // this.on('ended', function () {
        //     videojs.log('播放结束!')
        // })

        appStore.setIsReady()
    })
    // 添加播放器事件监听
    player.on('play', () => {
        // console.log('视频开始播放')
        // createMessage('继续播放')
        isEnded.value = false
    })

    player.on('pause', () => {
        // console.log()
    })

    player.muted(isMute.value)

    player.on('ended', function () {
        isEnded.value = true
    })

    // console.log('视频组件准备完毕')
})
onMounted(() => {
    autoPlay(props.Playing)
    autoMute()
})

watch(props, () => {
    autoPlay(props.Playing)
    autoMute()
})
</script>

<template>
    <div class="play">
        <div class="tab" ref="tab">
            <div @click="isLike = !isLike" @touchend="isLike = !isLike">
                <i class="fa-solid fa-heart fa-2xl" :class="{ 'active-like': isLike }"></i>
                <p>12.3万</p>
            </div>
            <div @click="toggleFavorite" @touchend="toggleFavorite">
                <i class="fa-solid fa-star fa-2xl" :class="{ 'active-favorite': isFavorite }"></i>
                <p>1.9万</p>
            </div>
            <div @click="isShare = true" @touchend="isShare = true">
                <i class="fa-solid fa-share fa-2xl"></i>
                <p>0.9万</p>
            </div>
            <div>
                <i class="fa-solid fa-bars-staggered fa-2xl"></i>
                <p>{{ props.episode_total }}集</p>
            </div>
            <div @click="toggleMute" @touchend="toggleMute" class="mute">
                <i class="fa-solid fa-volume-xmark fa-2xl" v-if="isMute"></i>
                <i class="fa-solid fa-volume-low fa-2xl" v-else></i>
            </div>
            <el-drawer v-model="isShare" title="暂未实现" :with-header="true" direction="btt">
                <p></p>
            </el-drawer>
        </div>
        <div
            class="video"
            :class="{
                'is-puased': !props.Playing,
                'is-ended': isEnded,
            }"
        >
            <video
                @touchstart="handleTouchStart"
                @touchmove="handleTouchMove"
                @touchend="handleTouchEnd"
                :id="props.videoInfo"
                webkit-playsinline="true"
                playsinline="ture"
                class="vjs-control-bar video-js"
                preload="auto"
                muted
                :poster="props.img"
            >
                <source :src="props.url2" type="video/mp4" />
            </video>
        </div>

        <div class="bottom">
            <h3>{{ props.title }}</h3>
            <small>当前剧集 {{ props.episode }}</small>
        </div>
        <div class="placeholder"></div>
    </div>
</template>

<style scoped lang="scss">
.play {
    .is-puased {
        filter: blur(10px);
        transform: scale(1.05);
        transition: all 0.4s;
    }
    .is-ended {
        transition: all 1s;
        position: relative;
        filter: blur(5px);
        transform: scale(1.05);
        &::after {
            position: absolute;
            top: 50%;
            right: 50%;
            color: $text-color-1;
            text-align: center;
            height: 100px;
            width: 100px;
            z-index: 200;
        }
    }

    .video {
        position: relative;
        background-color: rgb(0, 0, 0);
        height: calc(100% - $tab-bar-height);
        width: 100%;
        .video-js {
            height: 100%;
            border: 0;
        }
        .text {
            position: absolute;
            background-color: red;
        }
    }
    height: 100%;
    width: 100%;
    position: relative;
    z-index: 10;
    user-select: none;

    .tab {
        display: flex;
        flex-direction: column;
        color: $text-color-1;
        position: absolute;
        right: 0;
        bottom: $tab-bar-height;
        text-align: center;
        margin-bottom: 20px;
        z-index: 10;

        @media screen and (min-width: 500px) {
            & {
                cursor: pointer;
            }
        }

        div {
            margin: 10px;

            i {
                &.active-like {
                    color: $like-color;
                }

                &.active-favorite {
                    color: $favorite-color;
                }
            }

            p {
                font-size: small;
            }
        }
    }

    .bottom {
        max-width: 350px;
        color: $text-color-1;
        position: absolute;
        left: 0;
        bottom: $tab-bar-height;
        margin-bottom: 20px;
        z-index: 100;
        margin: 10px;
        margin-bottom: 20px;

        h3 {
            margin-bottom: 10px;
        }
    }

    .placeholder {
        display: block;
        height: $tab-bar-height;
    }
}
</style>
