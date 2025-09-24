<script setup>
import { ref } from 'vue'

const newVisiter = ref(3)
const yikiID = ref(81759321887)
const userName = ref('Dano想放假')

const src = '/src/assets/avater.jpg'
</script>

<template>
    <div class="header-container">
        <div class="header">
            <div class="left">
                <div class="item">
                    <!-- <el-icon></el-icon> -->
                    <el-icon size="1rem" style="vertical-align: middle"><User /></el-icon>
                    添加朋友
                </div>
            </div>
            <div class="right">
                <div class="item">
                    <!-- <el-icon></el-icon> -->
                    <el-icon size="1rem" style="vertical-align: middle"><Pointer /></el-icon>
                    新访客 {{ newVisiter }}
                </div>
                <div class="item icon">
                    <el-icon size="1rem" style="vertical-align: middle"><Search /></el-icon>
                </div>
                <div class="item icon">
                    <el-icon size="1rem" style="vertical-align: middle"><More /></el-icon>
                </div>
            </div>
        </div>
        <div class="avater">
            <div class="eav"></div>
            <div class="profile">
                <div class="name">
                    {{ userName }}
                    <div class="func">
                        <el-icon size="1rem" color="#e3e3e3"><CaretBottom /></el-icon>
                    </div>
                </div>
                <div class="id">
                    一刻号：{{ yikiID }}
                    <el-icon style="vertical-align: middle"><FullScreen /></el-icon>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.func {
    display: inline-block;
    border-radius: 100px;
    padding: 0 8px;
    background-color: #91919143;
    // padding: 10px;
}

.header-container {
    width: 100%;
    height: 25vh;
    background-image: url('/src/assets/bg.jpg');
    background-position: center center; /* 背景图片居中 */
    background-size: cover; /* 背景图片覆盖容器 */
    padding-top: 25px;
    position: relative; /* 确保伪元素正确定位 */
    z-index: 0;
    display: flex;
    flex-direction: column;
    justify-content: end;

    &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
        background-image: linear-gradient(
            to bottom,
            rgba(0, 0, 0, 0),
            rgba(0, 0, 0, 0.9)
        ); /* 渐变效果 */
        z-index: -1;
    }

    .header {
        // border: green 2px solid;
        // background-color: red;
        display: flex;
        color: $text-color-1;
        font-weight: bolder;
        font-size: small;
        justify-content: space-between;
        z-index: 10 !important;
        margin-bottom: 15px;

        .right {
            display: flex;
            .item {
                margin: 0 15px 0px 0;
                padding: 5px 10px;
                border-radius: 100px;
                background-color: #23232383;
            }
        }

        .left {
            display: flex;
            .item {
                margin: 0 15px 0px 15px;
                padding: 5px 10px;
                border-radius: 100px;
                background-color: #23232383;
            }
        }
    }

    .avater {
        display: flex;
        margin: 15px;
        align-items: center;
        .eav {
            border: 3px $text-color-1 solid;
            height: 110px;
            width: 110px;
            border-radius: 50%;
            background-image: url('/src/assets/avater.jpg');
            background-position: center center; /* 背景图片居中 */
            background-size: cover; /* 背景图片覆盖容器 */
        }

        .profile {
            margin-left: 20px;
            .name {
                font-size: 1.5rem;
                font-weight: bolder;
            }
            .id {
                color: $text-color-4;
                font-size: 0.75rem;
                // font-weight: bolder;
            }
        }
    }
}
</style>
