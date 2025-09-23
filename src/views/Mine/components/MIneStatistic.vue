<script setup>
import { ref } from 'vue'
import { createMessage } from '@/utils/message'

const userStatistic = ref([
    {
        title: '获赞',
        num: 0,
    },
    {
        title: '朋友',
        num: 6,
    },
    {
        title: '关注',
        num: 35,
    },
    {
        title: '粉丝',
        num: 7,
    },
])
</script>

<template>
    <div class="statistic-container">
        <div class="contai">
            <div v-for="item in userStatistic" class="statistic-card">
                <div class="text">{{ item.num }}</div>
                <div class="footer-item">
                    <span class="span">{{ item.title }}</span>
                </div>
            </div>
        </div>

        <button>编辑资料</button>
    </div>
    <div class="info">
        <div class="write">能不能早点退休</div>
        <div class="tag">
            <span>20岁</span>
            <span>上海·松江</span>
            <span>
                <el-icon style="vertical-align: middle"><Notebook /></el-icon>上海大学
            </span>
            <button>+ 添加性别等标签</button>
        </div>
    </div>
    <div class="enter-container" @click="createMessage('暂未实现')">
        <div class="enter">
            <div class="icon">
                <el-icon style="vertical-align: middle" size="25px"><ShoppingCart /></el-icon>
            </div>
            抖音商城
        </div>
        <div class="enter">
            <div class="icon">
                <el-icon style="vertical-align: middle" size="25px"><Clock /></el-icon>
            </div>
            观看历史
        </div>
        <div class="enter">
            <div class="icon">
                <el-icon style="vertical-align: middle" size="25px"><Wallet /></el-icon>
            </div>
            我的钱包
        </div>
        <div class="enter">
            <div class="icon">
                <el-icon style="vertical-align: middle" size="25px"><Paperclip /></el-icon>
            </div>
            我的小程序
        </div>
        <div class="enter">
            <div class="icon">
                <el-icon style="vertical-align: middle" size="25px"><Menu /></el-icon>
            </div>
            查看更多
        </div>
    </div>
</template>

<style lang="scss" scoped>
.statistic-container {
    margin: 15px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .contai {
        display: flex;
        justify-content: space-between;

        .statistic-card {
            text-align: center;
            margin: 0 16px;
            &:first-child {
                margin-left: 0;
            }
            .text {
                color: $text-color-1;
                font-weight: bold;
                font-size: 1.2rem;
            }
            .footer-item {
                color: $text-color-4 !important;
                font-weight: bolder !important;
                font-size: small !important;
                margin: 0 !important;
            }
        }
    }

    button {
        color: $text-color-1;
        font-weight: bold;
        padding: 7px 25px;
        font-size: 01rem;
        background-color: #393939;
        border-radius: 5px;
        border: none;
    }
}

.info {
    margin: 15px;
    .write {
        font-weight: bold;
        color: $text-color-1;
    }
    .tag {
        margin: 3px 0;
        span {
            margin: 5px;
            // color: $text-color-4;
            font-size: small;
        }
        button {
            margin: 5px;
            background-color: transparent;
            border: none;
            color: $text-color-4;
        }
    }
}
.enter-container {
    display: flex;
    justify-content: space-between;
    margin: 20px;
    font-size: 0.9rem;

    .enter .icon {
        // background-color: red;
        text-align: center;
    }
}
</style>
