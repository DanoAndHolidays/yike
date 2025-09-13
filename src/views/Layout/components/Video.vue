<script setup>
/**
 * 已经合并到了PlayBar中，弃用
 */
import { ref, onMounted } from 'vue';
import videojs from 'video.js';
import "video.js/dist/video-js.min.css"

let player = null
const src = ref('https://playletcdn.nnchenxin.cn/video/jaxczcqrgdq/9.mp4')

const handerClick = () => {
    console.log("click");
    console.log(player.paused());

    if (player.paused()) {
        player.play();
        player.controls(false)
    } else {
        player.pause();
        player.controls(true)
    }
}

onMounted(() => {
    // 添加初始化宽和高，否则加载播放器的时候会闪一下,添加了还是哈
    let options = { height: "1415", width: "795.94", autoplay: 'muted', aspectRatio: '9:16' }
    player = videojs('my-player', options, function onPlayerReady() {
        videojs.log('播放器准备好了!');
        // 最新的浏览器一般禁止video自动播放，直接调用play()会报错。只有用户在页面上操作后或者在video标签上添加muted（静音）属性，才能调用play函数。本案例是在video标签上添加了muted属性。
        this.play();
        this.on('ended', function () {
            videojs.log('播放结束!');
        });
    });
    // 添加播放器事件监听
    player.on('play', () => {
        console.log('视频开始播放');
    });

    player.on('pause', () => {
        console.log('视频暂停');
    });
})
</script>

<template>
    <div class="video" @click="handerClick()" @touchend="handerClick()">
        <video id="my-player" class="video-js" controls preload="auto" muted>
            <source :src="src" type="video/mp4" />
        </video>
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
</style>