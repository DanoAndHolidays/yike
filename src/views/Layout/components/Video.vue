<script setup>
import PlayBar from './PlayBar.vue'
import { onMounted, ref } from 'vue'
import { getRandom } from '@/apis/play'

const videoList = ref([
    {
        name: 'video1',
        id: 'my-player1',
    },
    {
        name: 'video2',
        id: 'my-player2',
    },
    {
        name: 'video3',
        id: 'my-player3',
    },
])

// 0上一个,1当前,2下一个
const curIndex = ref(1)
const isDragging = ref(false)
const startY = ref(0)
const currentY = ref(0)
const offsetY = ref(0)
const isRequire = ref(false)

const videoElement = ref(null)

// 目标切换距离
const TARGGET_Y = ref(180)

// 显示提示
const showMessage = (text) => {
    console.log('CONSOLE:', text)
}
const next = () => {
    if (curIndex.value < videoList.value.length - 1) {
        showMessage('下滑 → 下一个')
        curIndex.value++
        scrollToCurrent()
    } else {
        showMessage('已经是最后一个视频')
    }
}

const prev = () => {
    if (curIndex.value > 0) {
        showMessage('上滑 → 上一个')
        curIndex.value--
        scrollToCurrent()
    } else {
        showMessage('已经是第一个视频')
    }
}

const scrollToCurrent = () => {
    console.log(videoElement.value)

    if (videoElement.value) {
        const videoElementRef = videoElement.value.getBoundingClientRect()

        const videoHeight = videoElementRef.height
        showMessage(curIndex.value * videoHeight)
        videoElement.value.scrollTo({
            top: curIndex.value * videoHeight,
            behavior: 'smooth',
        })
    }
}

// const back = () => {
//     showMessage(`不够阈值${TARGGET_Y.value}，返回`)
//     const videoElementRef = videoElement.value.getBoundingClientRect()
//     showMessage(videoElementRef)

//     const videoHeight = videoElementRef.height / 3
//     // const videoY = videoElementRef.y
//     showMessage(
//         `单个视频高：${videoHeight}，视频组的位置：${videoElementRef.y}，重置的位置：${-curIndex.value * videoHeight}`,
//     )

//     videoElement.value.scrollTo({
//         top: 0,
//     })
//     // videoElement.value.style.top = `${}px`
// }

// 触摸开始
const onTouchStart = (e) => {
    isDragging.value = true
    startY.value = e.touches[0].clientY
    currentY.value = startY.value
}

// 触摸移动
const onTouchMove = (e) => {
    if (!isDragging.value) return
    // console.log('正在移动')

    const y = e.touches[0].clientY
    // console.log(y, currentY.value, offsetY.value)

    offsetY.value += y - currentY.value
    currentY.value = y
}

// 触摸结束
const onTouchEnd = (e) => {
    console.log('触摸结束', e)
    showMessage('move:' + offsetY.value)
    if (!isDragging.value) return

    isDragging.value = false
    // 根据滑动距离判断是否切换
    if (offsetY.value > TARGGET_Y.value) {
        prev()
    } else if (offsetY.value < -TARGGET_Y.value) {
        next()
    } else {
        // 滚动到当前视频
        scrollToCurrent()
    }

    offsetY.value = 0
}

// 鼠标事件（用于桌面端测试）------------------------------
const onMouseDown = (e) => {
    isDragging.value = true
    startY.value = e.clientY
    currentY.value = startY.value
}

const onMouseMove = (e) => {
    if (!isDragging.value) return

    const y = e.clientY
    offsetY.value = y - currentY.value
    currentY.value = y
}

const onMouseEnd = () => {
    if (!isDragging.value) return

    isDragging.value = false

    if (offsetY.value > TARGGET_Y.value) {
        prev()
    } else if (offsetY.value < -TARGGET_Y.value) {
        console.log('--------')

        next()
    } else {
        showMessage('不够阈值，返回')
    }

    offsetY.value = 0
}

onMounted(() => {
    scrollToCurrent()
})
</script>

<template>
    <div
        ref="videoElement"
        class="video-container"
        @touchstart="onTouchStart"
        @touchmove="onTouchMove"
        @touchend="onTouchEnd"
        @mousedown="onMouseDown"
        @mousemove="onMouseMove"
        @mouseup="onMouseEnd"
        @mouseleave="onMouseEnd"
    >
        <PlayBar
            class="play"
            v-for="video in videoList"
            :key="video.id"
            :videoJsId="video.id"
        ></PlayBar>
    </div>
</template>

<style scoped lang="scss">
.video-container {
    height: 100vh;
    overflow: scroll;

    /* 隐藏默认的滚动条样式 */
    scrollbar-width: none;
    /* Firefox */
    -ms-overflow-style: none;

    /* IE and Edge */
    &::-webkit-scrollbar {
        display: none;
        /* Chrome, Safari, and Opera */
    }
    .play {
        height: calc(100vh);
        overflow: hidden;
    }
}
</style>
