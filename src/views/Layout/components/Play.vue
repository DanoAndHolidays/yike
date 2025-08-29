<script setup>
import { ref } from 'vue';
import { createMessage } from '@/utils/message'

const isLike = ref(true);
const isFavorite = ref(true);

const isShare = ref(false);
const isMute = ref(true);//默认静音

const tab = ref(null);
</script>

<template>
    <div class="play">
        <div class="video">
            视频
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
            <div @click="isMute = !isMute; createMessage(isMute ? '已静音' : '解除静音')" class="mute">
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
.play {
    height: 100%;
    width: 100%;
    position: relative;

    .video {
        background-color: rgb(90, 90, 155);
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
        z-index: 100;

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