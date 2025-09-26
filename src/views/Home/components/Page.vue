<script setup>
import { getAllEpisode } from '@/apis/play'
import { onMounted, ref } from 'vue'

const props = defineProps({
    vid: Number,
})

const allEpisodeList = ref([])

const getAllEpisodeList = async (vid, page, limit) => {
    let res = await getAllEpisode(vid, page, limit)

    allEpisodeList.value = await res.data.data.data
    // console.log(allEpisodeList.value)
}

onMounted(() => {
    getAllEpisodeList(props.vid, 1, 1000)
})
</script>

<template>
    <div class="info"><slot></slot></div>
    <div class="container">
        <div class="fade-top"></div>
        <div class="content">
            <div v-for="item in allEpisodeList" :key="item.url">{{ item.episode }}</div>
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
                border: #d8728020 1.5px solid;
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
