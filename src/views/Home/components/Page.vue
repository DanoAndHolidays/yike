<script setup>
import { getAllEpisode } from '@/apis/play'
import { computed, onMounted, ref, nextTick } from 'vue'
import router from '@/router'

const props = defineProps({
    vid: Number,
    size: Boolean,
})

import { useDramaStore } from '@/stores/useDramaStore'
import { useRoute } from 'vue-router'
const dramaStore = useDramaStore()

const isWatched = (eid) => {
    const watchRecord = dramaStore.getWatchRecord(props.vid)?.value
    if (!watchRecord) return false

    // watchRecord.episodes 是 Set，所以用 has 判断
    return watchRecord.episodes.has(eid)
}

const islastEpisode = (eid) => {
    const watchRecord = dramaStore.getWatchRecord(props.vid)?.value
    if (!watchRecord) return false

    // watchRecord.episodes 是 Set，所以用 has 判断
    return watchRecord.lastEpisode === eid
}

const allEpisodeList = ref([])

// 存放每一集 DOM 元素
const episodeRefs = {}

// 存放内容容器 DOM
const contentWrapper = ref(null)

const getAllEpisodeList = async (vid, page, limit) => {
    let res = await getAllEpisode(vid, page, limit)

    allEpisodeList.value = await res.data.data.data

    // 下一轮 DOM 更新完成后滚动到最后观看位置
    nextTick(() => {
        scrollToLastEpisode()
    })
}

// 滚动到最后观看集数，只在 content 内部滚动
const scrollToLastEpisode = () => {
    // 得到最新剧集的数字
    const lastEid = dramaStore.getWatchRecord(props.vid)?.value?.lastEpisode ?? 1

    // 获取ref
    const el = episodeRefs[lastEid]
    if (el && contentWrapper.value) {
        // 计算相对于 contentWrapper 的位置
        const top = el.offsetTop - contentWrapper.value.offsetTop
        contentWrapper.value.scrollTo({
            top: top - contentWrapper.value.clientHeight / 2 + el.clientHeight / 2, // 居中显示
            behavior: 'smooth',
        })
    }
}

onMounted(() => {
    getAllEpisodeList(props.vid, 1, 1000)
})

const emit = defineEmits(['onToEpisodeMode'])

const route = useRoute()

const toPlay = (vid, eid) => {
    emit('onToEpisodeMode', true)

    router.push(`/play/${vid}/${eid}`)

    // console.log('toPlay', vid, eid)
}
</script>

<template>
    <div class="info"><slot></slot></div>
    <div class="container" :style="props.size ? 'height:55vh;' : ''">
        <div class="fade-top"></div>
        <div class="content" ref="contentWrapper" :style="props.size ? 'height:45vh;' : ''">
            <div
                v-for="item in allEpisodeList"
                :key="item.url"
                :ref="(el) => (episodeRefs[item.eid] = el)"
                :class="{ wached: isWatched(item.eid), lasted: islastEpisode(item.eid) }"
                @click="toPlay(item.vid, item.eid)"
            >
                {{ item.episode }}
            </div>
        </div>
        <div class="fade-bottom"></div>
        <div class="footer">
            Copyright &copy;2025 Dano
            <br />
            <span style="font-size: 0.7rem; opacity: 0.8"
                >「一刻」短剧&nbsp;&nbsp;|&nbsp;&nbsp;由Dano开发，仅学习使用</span
            >
        </div>
    </div>
</template>

<style lang="scss" scoped>
.info {
    margin-top: 10px;
}

.container {
    // margin-top: 10px;
    height: 40vh;
    width: 100%;
    // border: red solid 2px;
    display: flex;
    justify-content: center;
    position: relative;
    overflow-y: auto;

    .fade-top {
        position: absolute;
        top: 0vh;
        width: 100%;
        height: 20px;
        background: linear-gradient(to top, transparent, rgba(0, 0, 0, 0.1));
        pointer-events: none;
        // opacity: 0;
        // transition: opacity 0.3s;
        z-index: 10; /* 确保在内容之上 */
        // background-color: red;
    }

    .content {
        // border-top: #656565 1px solid;
        border-bottom: #65656574 1px solid;

        height: 30vh;
        // border: red solid 2px;
        overflow: scroll;
        overflow-x: hidden;
        scrollbar-width: none;
        /* Firefox */
        -ms-overflow-style: none !important;

        /* IE and Edge */
        &::-webkit-scrollbar {
            display: none !important;
            /* Chrome, Safari, and Opera */
        }

        display: grid;
        /* 修复：定义5列，每列等宽 */
        grid-template-columns: repeat(6, 1fr);
        /* 修复：定义2行，每行自动高度 */
        // grid-template-rows: auto auto;
        gap: 10px; /* 添加间距使布局更清晰 */
        width: 100%;
        padding: 10px 0;
        // margin: 10px 0;
        position: relative;

        .wached {
            background-color: #9b9b9b5f;
            opacity: 0.4;
            border: #e3e3e37a 1px solid;
        }

        .lasted {
            border: #c7a2a747 1px solid;
            color: $primary-color;
            background-color: #d8728049;

            filter: brightness(110%);
            opacity: 1;
        }

        div {
            // border: green solid 2px;
            display: flex;
            // background-color: green;
            border-radius: 20%;
            aspect-ratio: 1/1;
            justify-content: center;
            align-items: center;
            color: $text-color-4;
            border-radius: 15px;
            border: $tiktok-text-color-1 1px solid;
            box-shadow: 0 0 5px 5px $tiktok-background-color-1;
            opacity: 0.8;
            transition: all 0.2s;

            &:hover {
                border: #c7a2a747 1px solid;
                color: $primary-color;
                background-color: #d8728049;
            }
        }
    }

    .fade-bottom {
        position: absolute;
        bottom: 10vh;
        width: 100%;
        height: 30px;
        background: linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.25));
        pointer-events: none;
        // opacity: 0;
        // transition: opacity 0.3s;
        z-index: 10; /* 确保在内容之上 */
        // background-color: red;
    }

    .footer {
        position: absolute;
        bottom: 2vh;
        margin: 64px 0;
        color: $text-color-1;
        font-size: 0.8rem;
        text-align: center;
        opacity: 0.4;
        margin: 0;
    }
}
</style>
