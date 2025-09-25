<script setup>
import { ref } from 'vue'

const name = ref('first')

const handleClick = () => {}
</script>

<template>
    <div class="tab-container">
        <el-tabs :stretch="true" v-model="name" class="demo-tabs" @tab-click="handleClick">
            <el-tab-pane class="demo" label="作品" name="first">
                <div class="left">
                    <div class="icon">
                        <el-icon style="vertical-align: middle" size="25px"
                            ><CameraFilled
                        /></el-icon>
                    </div>
                    <div class="font">
                        <div>发作品，留下回忆</div>
                        <small>开始在抖音记录生活</small>
                    </div>
                </div>
                <button class="tbbutton" @click="">去发布</button>
            </el-tab-pane>
            <el-tab-pane label="私密">
                <div style="text-align: center">暂未实现</div>
            </el-tab-pane>
            <el-tab-pane label="收藏"><div style="text-align: center">暂未实现</div></el-tab-pane>
            <el-tab-pane label="喜欢"><div style="text-align: center">暂未实现</div></el-tab-pane>
        </el-tabs>
    </div>
</template>

<style lang="scss" scoped>
.tab-container {
    ::v-deep(.el-tabs__item.is-active) {
        color: $text-color-1;
    }

    ::v-deep(.el-tabs__active-bar) {
        background-color: #eec83c;
    }

    ::v-deep(.el-tabs__nav-wrap):after {
        display: none !important;
    }

    ::v-deep(.el-tabs__item) {
        padding: 30px !important;
        color: $text-color-4;
        font-size: 1rem;
        font-weight: bold;
        margin: auto !important;
    }

    .demo-tabs {
        .el-tabs__item {
            border: red 2px solid !important;
        }
        .demo {
            margin: 15px;
            margin-top: 0;
            border: 1px solid #212121;
            box-shadow: 0 0 1px 1px rgba(0, 0, 0, 0.2);
            display: flex;
            border-radius: 5px;
            padding: 15px;
            display: flex;
            justify-content: space-between;
            .left {
                display: flex;
                justify-content: space-between;
                .icon {
                    margin-right: 15px;
                    border-radius: 100px;
                    background-color: #91919143;
                    padding: 10px;
                }

                .font {
                    div {
                        color: $text-color-1;
                        font-weight: bold;
                        padding: 0;
                    }
                    small {
                        color: $text-color-4;
                        padding: 0;
                        margin: 0;
                    }
                }
            }

            .tbbutton {
                color: #ef3153;
                font-weight: bold;
                border-radius: 5px;
                background-color: #431c21;
                border: none;
                padding: 5px 20px;
                margin: auto 0;
            }
        }
    }
}
</style>
