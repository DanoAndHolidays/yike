<script setup>
import { createMessage } from '@/utils/message'
import { ref, onMounted } from 'vue'
import videojs from 'video.js'
import 'video.js/dist/video-js.min.css'

const isLike = ref(false)
const isFavorite = ref(false)
const isShare = ref(false)
const isMute = ref(true) //默认静音
const tab = ref(null)

let player = null
const src = ref('https://playletcdn.nnchenxin.cn/video/jaxczcqrgdq/9.mp4')

const toggleMute = () => {
    isMute.value = !isMute.value
    createMessage(isMute.value ? '已静音' : '解除静音')

    player.muted(isMute.value)
}

const handerClick = () => {
    console.log('click')
    console.log(player.paused())

    if (player.paused()) {
        player.play()
        player.controls(false)
    } else {
        player.pause()
        player.controls(true)
    }
}

onMounted(() => {
    // 添加初始化宽和高，否则加载播放器的时候会闪一下,添加了还是哈
    let options = { height: '1415', width: '795.94', autoplay: 'muted', aspectRatio: '9:16' }
    player = videojs('my-player', options, function onPlayerReady() {
        videojs.log('播放器准备好了!')
        // 最新的浏览器一般禁止video自动播放，直接调用play()会报错。只有用户在页面上操作后或者在video标签上添加muted（静音）属性，才能调用play函数。本案例是在video标签上添加了muted属性。
        this.play()
        this.on('ended', function () {
            videojs.log('播放结束!')
        })
    })
    // 添加播放器事件监听
    player.on('play', () => {
        console.log('视频开始播放')
    })

    player.on('pause', () => {
        console.log('视频暂停')
    })

    player.muted(isMute.value)
})
</script>

<template>
    <div class="play">
        <div class="video" @click="handerClick" @touchend="handerClick">
            <video id="my-player" class="video-js" controls preload="auto" muted>
                <source :src="src" type="video/mp4" />
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
                <p>120集</p>
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
            <h3>剧名剧名剧名</h3>
            <small>当前剧集 2</small>
        </div>
    </div>
</template>

<style scoped lang="scss">
.video {
    background-color: rgb(0, 0, 0);

    .video-js {
        height: 100%;
        border: 0;
    }
}

.play {
    height: 100%;
    width: 100%;
    position: relative;

    .video {
        height: 100%;
        width: 100%;
    }

    .tab {
        display: flex;
        flex-direction: column;
        color: $text-color-1;
        position: absolute;
        right: 0;
        bottom: 0;
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
        bottom: 0;
        margin-bottom: 20px;
        z-index: 100;
        margin: 10px;
        margin-bottom: 20px;

        h3 {
            margin-bottom: 10px;
        }
    }
}
</style>
