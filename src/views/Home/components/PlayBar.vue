<script setup>
import { createMessage } from '@/utils/message'
import { ref, onMounted, watch, computed } from 'vue'
// import videojs from 'video.js/core.es.js';
// import 'video.js/dist/video-js.css'
import ShareDrawer from './ShareDrawer.vue'
import EndingInfo from './EndingInfo.vue'
// import toDetial from '@/utils/toDetail'


import avater_jungle from '@/assets/avater_jungle.webp'
import avater_cat from '@/assets/avater_cat.webp'
import avater_junhe from '@/assets/avater_junhe.webp'
import avater_sister from '@/assets/avater_sister.webp'
import avater_ji from '@/assets/avater_ji.webp'
import avater_gebi from '@/assets/avater_gebi.webp'
import avater_weixin from '@/assets/avater_weixin.webp'

// 用于跳转至详情页
import router from '@/router'
import { useVidStore } from '@/stores/user'
const vidStore = useVidStore()

const props = defineProps({
    Playing: {
        type: Boolean,
    },
    videoInfo: {
        type: String,
    },
    videoIsPlaying: {
        // 似乎是没有用了
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

// 存储观看记录、收藏等。
import { useDramaStore } from '@/stores/useDramaStore'
const dramaStore = useDramaStore()

import Page from './Page.vue'

// const videojsIsReady = ref(false)

const friendInfo = ref([
    {
        name: '微信好友',
        url: avater_weixin,
    },
    {
        name: 'Jungle',
        url: avater_jungle,
    },
    {
        name: '萝莉岛主',
        url: avater_cat,
    },
    {
        name: '中非小炮弹',
        url: avater_junhe,
    },
    {
        name: '弈',
        url: avater_sister,
    },
    {
        name: '鸡鸡一柱擎天',
        url: avater_ji,
    },
    {
        name: '隔壁小孩',
        url: avater_gebi,
    },
])

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
const isLike = dramaStore.isLiked(props.vid)
const isFavorite = dramaStore.isCollected(props.vid)
const isShare = ref(false)
const isMute = userStore.getIsMute() //默认静音

// 控制抽屉的开关，这变量名，我自己起的，也是醉了
const isEpisode = ref(false)

const shareTitle = ref('分享给朋友')
const episodeTitle = ref('剧集信息')
const detailContent = ref(`一刻短剧由Dano基于Apifox公开项目
    「悦享好剧」开发，仅做学习研究使用。
    若有Bug请发邮件或在GitHub中提出issue。
    主要技术栈：「 Vue 」「 Vite 」「 Pinia 」「 Vue Router 」`)

const tab = ref(null)

const handleLike = () => {
    dramaStore.toggleLike(props.vid)
}

const isEnded = ref(false)
let player = null

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
    // isFavorite.value = !isFavorite.value
    dramaStore.toggleCollection(props.vid)
    createMessage(isFavorite.value ? '收藏成功' : '收藏移除')
}

// 触摸开始事件
function handleTouchStart(e) {
    // console.log('handleTouchStart')

    const touch = e.touches ? e.touches[0] : e
    startX = touch.clientX
    startY = touch.clientY
    isDragging = false
}

// 触摸移动事件
function handleTouchMove(e) {
    // console.log('handleTouchMove')

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
    // console.log('handleTouchEnd')

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

    startX = 0
    startY = 0
}

// 鼠标按下事件
function handleMouseDown(e) {
    // console.log('handleMouseDown')

    startX = e.clientX
    startY = e.clientY
    isDragging = false
}

// 鼠标移动事件
function handleMouseMove(e) {
    // console.log('handleMouseMove')

    if (!startX || !startY) return

    const currentX = e.clientX
    const currentY = e.clientY

    const deltaX = Math.abs(currentX - startX)
    const deltaY = Math.abs(currentY - startY)
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

    // 如果移动距离超过阈值，则认为是拖动
    if (distance > currentMoveThreshold) {
        isDragging = true
    }
}

// 鼠标抬起事件
function handleMouseUp(e) {
    // console.log('handleMouseUp')

    if (!startX || !startY) return

    // 如果不是拖动且时间小于阈值，则认为是点击
    if (!isDragging) {
        // console.log('点击，不是拖动')

        if (player.paused()) {
            player.play()
            createMessage('继续播放')
        } else {
            player.pause()
            createMessage('暂停播放')
        }
    }

    startX = 0
    startY = 0
}

onMounted(() => {
    // 确保 videojs 已通过 CDN 加载
    if (typeof window.videojs === 'undefined') {
        console.error('video.js 未加载，请检查 CDN 引入')
        return
    }
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
    player = window.videojs(props.videoInfo, options, function onPlayerReady() {
        emit('onVideoReady', 1)
        appStore.setIsReady()
    })
    // 添加播放器事件监听
    player.on('play', () => {
        dramaStore.updateWatchRecord(props.vid, props.eid)
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

const shareFriendNum = ref(0)
const shareButtonActive = computed(() => {
    return shareFriendNum.value ? true : false
})

const handleShare = (e) => {
    shareFriendNum.value += e
    console.log(shareFriendNum.value)
}

const emit = defineEmits(['onEpisode', 'onVideoReady'])

const handleShareClick = () => {
    isEpisode.value = true
    emit('onEpisode', true)
}

const handleClosed = () => {
    emit('onEpisode', false)
}

const openEpisodeMode = () => {
    router.push('/detail')
    vidStore.setVidAndShowDetail(props.vid)
    // createMessage('已进入追剧模式')
    isEpisode.value = false
}
</script>

<template>
    <div class="play">
        <div class="tab" ref="tab">
            <div @click="handleLike" @touchend="handleLike">
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
            <div @click="handleShareClick" @touchend="handleShareClick">
                <i class="fa-solid fa-bars-staggered fa-2xl"></i>
                <p>{{ props.episode_total }}集</p>
            </div>
            <div @click="toggleMute" @touchend="toggleMute" class="mute">
                <i class="fa-solid fa-volume-xmark fa-2xl" v-if="isMute"></i>
                <i class="fa-solid fa-volume-low fa-2xl" v-else></i>
            </div>
            <el-drawer
                :close-delay="200"
                v-model="isShare"
                :title="shareTitle"
                :with-header="true"
                direction="btt"
                :lock-scroll="true"
                custom-class="no-scroll-drawer"
                append-to="#parent-container"
                size="28%"
                class="el-drawer"
            >
                <div class="share-title">
                    <div>{{ props.title }} &nbsp;第{{ props.episode }}集</div>
                </div>
                <div class="share-drawer" id="share-drawer">
                    <ShareDrawer
                        @onShare="handleShare"
                        v-for="value in friendInfo"
                        :key="value.name"
                        :name="value.name"
                        :url="value.url"
                    />
                </div>
                <button
                    @click="((isShare = false), createMessage('分享成功'))"
                    @touchend="isShare = false"
                    class="button share-button"
                    :class="{ disabled: !shareButtonActive }"
                >
                    一键分享
                </button>
            </el-drawer>

            <!-- 剧集抽屉 -->
            <el-drawer
                @close="handleClosed"
                resizable
                v-model="isEpisode"
                :title="episodeTitle"
                :with-header="true"
                direction="btt"
                :lock-scroll="true"
                custom-class="no-scroll-drawer"
                append-to="#parent-container"
                size="80%"
            >
                <div class="episode-drawer">
                    <div class="episode-info">
                        <img :src="props.img" :alt="props.title" />
                        <div class="text">
                            <div class="title">{{ props.title }}</div>
                            <div class="details">
                                <div class="head">
                                    <div>
                                        当前剧集 &nbsp;
                                        {{ props.episode }}
                                    </div>
                                    <div :class="{ coll: isFavorite, normal: !isFavorite }">
                                        {{ isFavorite ? '已收藏' : '未收藏' }}
                                    </div>
                                </div>

                                <div class="content">
                                    {{ detailContent }}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="episode-select">
                        <div class="button-group">
                            <button @click="openEpisodeMode">详情</button>
                        </div>
                        <Page :vid="props.vid" @on-to-episode-mode="openEpisodeMode">
                            <div>全{{ props.episode_total }}集</div>
                        </Page>
                    </div>
                </div>
            </el-drawer>
        </div>

        <EndingInfo @onToEpisodeMode="openEpisodeMode" class="end-info" v-if="isEnded" />

        <div
            class="video"
            :class="{ 'is-ended': isEnded }"
            @touchstart.prevent="handleTouchStart"
            @touchmove.prevent="handleTouchMove"
            @touchend.prevent="handleTouchEnd"
            @mousedown.prevent="handleMouseDown"
            @mousemove.prevent="handleMouseMove"
            @mouseup.prevent="handleMouseUp"
        >
            <video
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
    height: 100%;
    width: 100%;
    position: relative;
    z-index: 10;
    user-select: none;
    // background-color: transparent;

    .end-info {
        position: absolute;
        top: 0;
        width: 100%;
        height: 100%;
        z-index: 1000;
    }

    .is-ended {
        transition: all 1s;
        position: relative;
        filter: blur(5px) brightness(80%) contrast(110%) saturate(120%);
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

        .share-title {
            display: flex;

            background-color: red;
        }

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

.no-scroll-drawer {
    :deep(.el-drawer__body) {
        overflow: hidden !important;
    }

    :deep(.el-drawer) {
        overflow: hidden;
    }
}
</style>
