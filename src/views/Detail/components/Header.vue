<script setup>
// import Header from '@/views/Category/components/Header.vue'
import CategoryCard from '@/views/Category/components/CategoryCard.vue'
import { ref } from 'vue'

const props = defineProps({
    vid: Number,
    title: String,
    episode_total: Number,
    img: String,
})

const detailContent = ref(`一刻短剧由Dano基于Apifox公开项目
    「悦享好剧」开发，仅做学习研究使用。
    若有Bug请发邮件或在GitHub中提出issue。
    主要技术栈：「 Vue 」「 Vite 」「 Pinia 」「 Vue Router 」`)
</script>

<template>
    <div class="detail-container">
        <div class="card">
            <CategoryCard :img="props.img" :episode_total="props.episode_total" rank="一刻独播" />
        </div>
        <div class="infomation">
            <div class="text">
                <div class="title">{{ props.title }}</div>
                <div class="details">
                    <div class="head">
                        <div>{{ props.episode_total }}集全</div>
                    </div>
                    <div class="content">{{ detailContent }}</div>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.detail-container {
    position: absolute;
    background-color: $tiktok-background-color-1;
    color: $text-color-1;
    width: 100%;
    height: $detail-top-height !important;
    display: flex;

    .card {
        width: 170px;
        height: inherit;
    }
    .infomation {
        // background-color: red;
        // border: green 2px solid;
        flex: 1;
        padding-left: 15px;
        height: inherit;
        .text {
            flex: 1;
            border-bottom: 1px #e3e3e31b solid;
            .title {
                font-size: 1.3rem;
                color: $text-color-1;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                width: calc(100% - 40px);
            }

            .details {
                color: $text-color-4;
                .head {
                    display: flex;
                    justify-content: space-between;

                    div.normal {
                        margin: 0px 10px;
                        padding: 0 5px;
                        border: 2.5px $text-color-4 solid;
                        border-radius: 100px;
                        opacity: 0.7;
                        font-weight: bold;
                    }

                    div.coll {
                        color: $favorite-color;
                        margin: 0px 10px;
                        padding: 0 5px;
                        border: 2.5px $favorite-color solid;
                        border-radius: 100px;
                        opacity: 0.7;
                        font-weight: bold;
                    }
                }
                .content {
                    opacity: 0.5;
                    border-top: 1px #e3e3e33d solid;
                    margin-top: 5px;
                    padding-top: 3px;
                }
            }
        }
    }
}
</style>
