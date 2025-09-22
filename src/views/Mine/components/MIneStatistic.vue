<script setup>
import { ref } from 'vue'

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
                <el-statistic class="text" :value="item.num" />
                <div class="footer-item">
                    <span>{{ item.title }}</span>
                </div>
            </div>
        </div>

        <el-button>编辑资料</el-button>
    </div>
    <div class="info">
        <div class="write">能不能早点退休</div>
        <div class="tag">
            <span>20岁</span>
            <span>上海·松江</span>
            <span>上海大学</span>
            <button>添加性别等标签</button>
        </div>
    </div>
    <div class="enter-container">
        <div class="enter">抖音商城</div>
        <div class="enter">观看历史</div>
        <div class="enter">我的钱包</div>
        <div class="enter">我的小程序</div>
        <div class="enter">查看更多</div>
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
            margin: 0 20px;
            &:first-child {
                margin-left: 0;
            }

            .text {
                color: $text-color-1 !important;
                font-weight: bolder !important;
                font-size: small !important;
            }

            .footer-item {
                color: $text-color-4;
                font-weight: bolder !important;
                font-size: small !important;
                margin: 0 !important;
            }
        }
    }
}

.enter-container {
    display: flex;
    justify-content: space-between;
}
</style>
