<script setup>
import PlayBar from './PlayBar.vue'
import {
    computed,
    onActivated,
    onBeforeMount,
    onBeforeUnmount,
    onDeactivated,
    onMounted,
    ref,
    watch,
} from 'vue'
import { createMessage } from '@/utils/message.ts'
import updateVideoList from '@/utils/handleVideo'
import LoadingPage from './LoadingPage.vue'

import { debounce } from 'lodash-es'

import { useRoute } from 'vue-router'
const route = useRoute()

const playMode = computed(() => {
    if (route.params.vid && route.params.eid) {
        console.log('playMode', true)
        return true
    }
    console.log('playMode', false)
    return false
})
const vid_ref = ref(route.params.vid)
const eid_ref = ref(route.params.eid)

// 处理交互的数据
const isDragging = ref(false)
const startY = ref(0)
const currentY = ref(0)
const offsetY = ref(0)

// 维护渲染用的队列
const curIndex = ref(0)
const videoInfoList = ref([])
const videoElement = ref(null)

/**
 * 由于没有专门用于批量请求eid信息的接口，我只能使用获取剧集播放地址的接口来间接获取剧集信息，
 * 但是对于大量的剧集信息，想要通过这一个接口来获取是很困难的，会造成流量很大，
 * 我的想法是本地存储一部分之前通过随机获取的剧集信息，这样就能减少发送请求的次数.
 */
// 存储剧集信息
import { useDramaInfo } from '@/stores/useDramaInfo'
const dramaInfo = useDramaInfo()

/**
 * 这部分倒底是做什么的我已经不记得了，我也不敢动...
 * 没用了
 */
// // 存储当前的短剧信息，用于获取剧集信息
// import { useEpisodeStore } from '@/stores/episode'
// const episodeStore = useEpisodeStore()

// const updataCurEpisodeInfo = (obj) => {
//     episodeStore.updata(obj)
// }

// 目标切换距离
const TARGGET_Y = ref(80)
// 用于保证切换到制定视频，不会因为默认事件而影响
// const TIME_INTEVAL = ref(400)

const isRequiring = ref(false)

const _requireNew = async (vid, eid) => {
    isRequiring.value = true
    if (vid && eid) {
        videoInfoList.value = await updateVideoList(vid, eid)
        // console.log('有参数', videoInfoList.value)
    } else {
        videoInfoList.value = await updateVideoList()
        // console.log('🈚参数', videoInfoList.value)
    }

    videoInfoList.value.forEach((item) => {
        dramaInfo.updateDramaInfo(item)
    })
    isRequiring.value = false
    // updataCurEpisodeInfo(videoInfoList.value[curIndex.value])
}

const requireNew = debounce(_requireNew, 100)

const next = async () => {
    if (curIndex.value < videoInfoList.value.length - 1) {
        curIndex.value++
        // showMessage('next:' + curIndex.value)
        scrollToCurrent()
    } else {
        createMessage('到底了')
        await requireNew(route.params.vid, route.params.eid)
        setTimeout(() => {
            curIndex.value = 0
            scrollToCurrent()
        }, 400)
    }
}

const prev = () => {
    if (curIndex.value > 0) {
        // showMessage('上滑 → 上一个')
        curIndex.value--
        scrollToCurrent()
    } else {
        createMessage('到顶了')
    }
}

/**
 * @description
 * @param {Boolen} option 默认为true：丝滑滚动，false：取消
 */
const scrollToCurrent = (option = true) => {
    // console.log(videoElement.value)

    if (videoElement.value) {
        const videoElementRef = videoElement.value.getBoundingClientRect()

        const videoHeight = videoElementRef.height
        // showMessage(curIndex.value * videoHeight)
        if (option) {
            videoElement.value.scrollTo({
                top: curIndex.value * videoHeight,
                behavior: 'smooth',
            })
        } else {
            videoElement.value.scrollTo({
                top: curIndex.value * videoHeight,
            })
        }
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
        // showMessage(scrollDistance)
        videoElement.value.scrollTo({
            top: scrollDistance,
            behavior: 'smooth',
        })
    }
}

const moveWithScroll = debounce(_moveWithScroll, 5)

// 触摸开始
const onTouchStart = (e) => {
    // e.stopPropagation()
    e.preventDefault()
    isDragging.value = true
    startY.value = e.touches[0].clientY
    currentY.value = startY.value
}

// 触摸移动
const onTouchMove = (e) => {
    // e.stopPropagation()
    // e.preventDefault()
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
    // e.stopPropagation()
    e.preventDefault()
    if (!isDragging.value) return

    isDragging.value = false
    // 根据滑动距离判断是否切换
    if (offsetY.value > TARGGET_Y.value) {
        prev()
    } else if (offsetY.value < -TARGGET_Y.value) {
        next()
    } else {
        scrollToCurrent()
    }

    offsetY.value = 0
}

// 鼠标事件（用于桌面端测试)
const onMouseDown = (e) => {
    // e.stopPropagation()
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

const handleWheel = debounce(_handleWheel, 200)

const keyupHandle = (e) => {
    e.preventDefault()
    if (e.key === 'ArrowDown') {
        next()
    } else if (e.key === 'ArrowUp') {
        prev()
        // console.log('shit')
    }
}

// const wheelHandle = (e) => {}

onBeforeMount(async () => {
    await requireNew(route.params.vid, route.params.eid)
    // console.log(videoInfoList.value)
})

const addKeyAndWheelEvent = () => {
    // 添加键盘事件支持
    window.addEventListener('keyup', keyupHandle)
    window.addEventListener('wheel', handleWheel)
}

const removeKeyAndWheelEvent = () => {
    window.removeEventListener('keyup', keyupHandle)
    window.removeEventListener('wheel', handleWheel)
}
watch(route, () => {
    requireNew(route.params.vid, route.params.eid)
    curIndex.value = 0
    createMessage('切换中...')
})

onMounted(() => {
    scrollToCurrent()
    addKeyAndWheelEvent()
})

onActivated(() => {
    scrollToCurrent()
    addKeyAndWheelEvent()
})

onBeforeUnmount(() => {
    removeKeyAndWheelEvent()
})

onDeactivated(() => {
    removeKeyAndWheelEvent()
})

const isEpisodeDrawerOpen = ref(false)

const handleOnEpisode = (e) => {
    if (e) {
        isEpisodeDrawerOpen.value = true
        removeKeyAndWheelEvent()
    } else {
        isEpisodeDrawerOpen.value = false
        addKeyAndWheelEvent()
    }
}

const readyVideoNum = ref(0)

const videosIsReady = computed(() => {
    if (
        readyVideoNum.value >= videoInfoList.value.length &&
        videoInfoList.value.length != 0 &&
        !isRequiring.value
    ) {
        return true
    } else {
        return false
    }
})

const handleVideoReady = (e) => {
    readyVideoNum.value += e
}
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
        <Transition>
            <KeepAlive>
                <div class="loading-page" v-if="!videosIsReady">
                    <LoadingPage />
                </div>
            </KeepAlive>
        </Transition>

        <PlayBar
            @onVideoReady="handleVideoReady"
            @onEpisode="handleOnEpisode"
            class="play"
            v-for="(video, index) in videoInfoList"
            :key="video.eid"
            :videoInfo="`video${video.title}${video.eid}`"
            :eid="video.eid"
            :episode="video.episode"
            :episode_total="video.episode_total"
            :img="video.img"
            :is_vip="video.is_vip"
            :title="video.title"
            :url="video.url"
            :url2="video.url2"
            :vid="video.vid"
            :Playing="index == curIndex"
        ></PlayBar>
    </div>
</template>

<style scoped lang="scss">
.v-enter-active,
.v-leave-active {
    transition: opacity 0.3s ease;
}

.v-enter-from,
.v-leave-to {
    opacity: 0;
}
.video-container {
    height: 100vh;
    overflow: scroll;
    position: relative;

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

    .loading-page {
        position: absolute;
        z-index: 15;
        height: 100%;
        width: 100%;
    }

    .unshow {
        display: none;
    }
}
</style>
