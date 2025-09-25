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
    console.log(allEpisodeList.value)
}

onMounted(() => {
    getAllEpisodeList(props.vid, 1, 1000)
})
</script>

<template>
    <div class="info"><slot></slot></div>
    <div class="container">
        <div class="content">
            <div v-for="item in allEpisodeList" :key="item.url">{{ item.episode }}</div>
        </div>

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
    max-height: 500px;
    width: 100%;
    // border: red solid 2px;
    display: flex;
    justify-content: center;
    align-items: center;

    .content {
        height: 450px;

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

    .footer {
        position: absolute;
        bottom: 0;
        margin: 64px 0;
        color: $text-color-1;
        font-size: 0.8rem;
        text-align: center;
        opacity: 0.4;
    }
}
</style>
