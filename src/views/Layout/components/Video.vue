<script setup>
import PlayBar from './PlayBar.vue'
import { onMounted, ref, watch } from 'vue'
import { createMessage } from '@/utils/message'
import { getRandom } from '@/apis/play'
import _ from 'lodash'

const videoList = ref([
    {
        name: 'video1',
        id: 'my-player1',
        isPlaying: false,
    },
    {
        name: 'video2',
        id: 'my-player2',
        isPlaying: true,
    },
    {
        name: 'video3',
        id: 'my-player3',
        isPlaying: false,
    },
])

// 0上一个,1当前,2下一个
const curIndex = ref(1)
const isDragging = ref(false)
const startY = ref(0)
const currentY = ref(0)
const offsetY = ref(0)
const isRequire = ref(false)
const playInfo = ref([false, true, false])

const videoElement = ref(null)

// 目标切换距离
const TARGGET_Y = ref(80)
// 用于保证切换到制定视频，不会因为默认事件而影响
const TIME_INTEVAL = ref(400)

const updateVideoList = () => {}

const _requireNew = () => {
    // showMessage('正在请求...')

    setTimeout(() => {
        // showMessage('请求完成')
        createMessage('请求完成')
    }, 1000)
}

const requireNew = _.debounce(_requireNew, 100)

const updataPlayInfo = () => {
    for (let video of videoList.value) {
        // showMessage(video)
        video.isPlaying = false
        // showMessage(video)
    }
    videoList.value[curIndex.value].isPlaying = true
    showMessage(videoList.value)
}

// 显示提示
const showMessage = (text) => {
    console.log('---CONSOLE---', text)
}
const next = () => {
    if (curIndex.value < videoList.value.length - 1) {
        // showMessage('下滑 → 下一个')
        curIndex.value++
        scrollToCurrent()
    } else {
        createMessage('到底了')
        requireNew()
    }
}

const prev = () => {
    if (curIndex.value > 0) {
        // showMessage('上滑 → 上一个')
        curIndex.value--
        scrollToCurrent()
    } else {
        createMessage('到顶了')
        requireNew()
    }
}

const scrollToCurrent = () => {
    // console.log(videoElement.value)

    if (videoElement.value) {
        const videoElementRef = videoElement.value.getBoundingClientRect()

        const videoHeight = videoElementRef.height
        // showMessage(curIndex.value * videoHeight)
        videoElement.value.scrollTo({
            top: curIndex.value * videoHeight,
            behavior: 'smooth',
        })

        // 这里的setTimeout是为了保证在触摸默认事件的影响下完成切换视频
        setTimeout(() => {
            videoElement.value.scrollTo({
                top: curIndex.value * videoHeight,
                behavior: 'smooth',
            })
        }, TIME_INTEVAL.value)

        setTimeout(() => {
            videoElement.value.scrollTo({
                top: curIndex.value * videoHeight,
                behavior: 'smooth',
            })
        }, TIME_INTEVAL.value * 1.5)
    }
}

const _moveWithScroll = () => {
    if (videoElement.value) {
        const videoElementRef = videoElement.value.getBoundingClientRect()

        const videoHeight = videoElementRef.height

        // 根据用户的移动距离 (offsetY) 计算应该滚动的距离
        // 这里根据 offsetY 来调整滚动位置
        const scrollDistance = curIndex.value * videoHeight - offsetY.value

        // 应用滚动效果，使用平滑过渡
        showMessage(scrollDistance)
        videoElement.value.scrollTo({
            top: scrollDistance,
            behavior: 'smooth',
        })
    }
}

const moveWithScroll = _.debounce(_moveWithScroll, 5)

// 触摸开始
const onTouchStart = (e) => {
    e.stopPropagation()
    e.preventDefault()
    isDragging.value = true
    startY.value = e.touches[0].clientY
    currentY.value = startY.value
}

// 触摸移动
const onTouchMove = (e) => {
    e.stopPropagation()
    e.preventDefault()
    if (!isDragging.value) return
    // console.log('正在移动')

    const y = e.touches[0].clientY
    // console.log(y, currentY.value, offsetY.value)

    offsetY.value += y - currentY.value
    currentY.value = y

    moveWithScroll()
}

// 触摸结束
const onTouchEnd = (e) => {
    e.stopPropagation()
    e.preventDefault()
    // console.log('触摸结束', e)
    // showMessage('move:' + offsetY.value)
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

// 鼠标事件（用于桌面端测试)
const onMouseDown = (e) => {
    e.stopPropagation()
    // showMessage(e)
    isDragging.value = true
    startY.value = e.clientY
    currentY.value = startY.value
}

const onMouseMove = (e) => {
    e.stopPropagation()
    if (!isDragging.value) return
    // console.log('正在移动')

    const y = e.clientY
    // console.log(y, currentY.value, offsetY.value)

    offsetY.value += y - currentY.value
    currentY.value = y

    moveWithScroll()
}

const onMouseEnd = (e) => {
    e.stopPropagation()
    // console.log('点击结束', e)
    // showMessage('move:' + offsetY.value)
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

const _handleWheel = (e) => {
    e.preventDefault()
    const delta = e.deltaY
    if (delta > 0) {
        // 向下滚动
        next()
    } else {
        // 向上滚动
        prev()
    }
}

const handleWheel = _.debounce(_handleWheel, 200)

onMounted(() => {
    scrollToCurrent()

    // 添加键盘事件支持
    window.addEventListener('keyup', (e) => {
        e.preventDefault()
        if (e.key === 'ArrowDown') {
            next()
        } else if (e.key === 'ArrowUp') {
            prev()
            // console.log('shit')
        }
    })
    window.addEventListener('wheel', (e) => {
        handleWheel(e)
    })
})

watch(curIndex, updataPlayInfo)
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
            :videoInfo="video.id"
            :videoIsPlaying="video.isPlaying"
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
