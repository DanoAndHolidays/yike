<script setup>
import { createMessage } from '@/utils/message'
import { ref, onMounted, watch, computed } from 'vue'
import videojs from 'video.js'
import 'video.js/dist/video-js.css'
import _ from 'lodash'

const isLike = ref(false)
const isFavorite = ref(false)
const isShare = ref(false)
const isMute = ref(true) //默认静音
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

const toggleMute = () => {
    isMute.value = !isMute.value
    createMessage(isMute.value ? '静音开启' : '静音解除')

    player.muted(isMute.value)
}

const handerClick = (e) => {
    console.log('触发事件处理函数:', e)
    console.log('没点之前是', player.paused() ? '暂停' : '播放')
    e.stopPropagation()

    if (player.paused()) {
        console.log('pause->play')
        player.play()
        // 播放时隐藏控制栏，但Video.js在播放时可能会自动隐藏，所以可能需要额外处理
    } else {
        console.log('play->pause')
        player.pause()
    }
    console.log('现在是', player.paused() ? '暂停' : '播放')
}

const handerTouched = (e) => {
    console.log('触发事件处理函数:', e)
    console.log('没点之前是', player.paused() ? '暂停' : '播放')
    e.stopPropagation()
    if (player.paused()) {
        console.log('pause->play')
        player.play()
        // 播放时隐藏控制栏，但Video.js在播放时可能会自动隐藏，所以可能需要额外处理
        player.controls(false) // 注意：这会完全禁用控制栏，而不是隐藏
    } else {
        console.log('play->pause')
        player.pause()
        player.controls(true) // 暂停时显示控制栏
    }
    console.log('现在是', player.paused() ? '暂停' : '播放')
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
    }
    player = videojs(props.videoInfo, options, function onPlayerReady() {
        videojs.log('播放器准备好了!')
        // 最新的浏览器一般禁止video自动播放，直接调用play()会报错。只有用户在页面上操作后或者在video标签上添加muted（静音）属性，才能调用play函数。本案例是在video标签上添加了muted属性。
        // this.play()
        this.on('ended', function () {
            videojs.log('播放结束!')
        })
    })
    // 添加播放器事件监听
    player.on('play', () => {
        console.log('视频开始播放')

        isEnded.value = false
    })

    player.on('pause', () => {
        console.log('视频暂停')
    })

    player.muted(isMute.value)

    player.on('ended', function () {
        isEnded.value = true
    })
})

//@click="handerTouched" @touchend="handerTouched"
// 事件的穿透还是有些问题，先搞滑动

onMounted(() => {
    autoPlay(props.Playing)
})

watch(props, () => {
    autoPlay(props.Playing)
})
</script>

<template>
    <div class="play">
        <div
            class="video"
            :class="{
                'is-puased': !props.Playing,
                'is-ended': isEnded,
            }"
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

        <div class="tab" ref="tab">
            <div @click="isLike = !isLike">
                <i class="fa-solid fa-heart fa-2xl" :class="{ 'active-like': isLike }"></i>
                <p>12.3万</p>
            </div>
            <div @click="isFavorite = !isFavorite">
                <i class="fa-solid fa-star fa-2xl" :class="{ 'active-favorite': isFavorite }"></i>
                <p>1.9万</p>
            </div>
            <div @click="isShare = true">
                <i class="fa-solid fa-share fa-2xl"></i>
                <p>0.9万</p>
            </div>
            <div>
                <i class="fa-solid fa-bars-staggered fa-2xl"></i>
                <p>{{ props.episode_total }}集</p>
            </div>
            <div @click="toggleMute" class="mute">
                <i class="fa-solid fa-volume-xmark fa-2xl" v-if="isMute"></i>
                <i class="fa-solid fa-volume-low fa-2xl" v-else></i>
            </div>
            <el-drawer v-model="isShare" title="暂未实现" :with-header="true" direction="btt">
                <p></p>
            </el-drawer>
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
