<script setup>
import { ref } from 'vue'

const emit = defineEmits(['changecategory'])

const renderList = ref([
    {
        title: '热门',
        index: 0,
        name_en: 'hotPlayer',
    },
    {
        title: '赘婿',
        index: 1,
        name_en: 'zhuiXu',
    },
    {
        title: '重生',
        index: 2,
        name_en: 'chuanYue',
    },
    {
        title: '都市',
        index: 3,
        name_en: 'duShi',
    },
    {
        title: '古装',
        index: 4,
        name_en: 'guZhuang',
    },
    {
        title: '情感',
        index: 5,
        name_en: 'qingGan',
    },
    {
        title: '神医',
        index: 6,
        name_en: 'shenYi',
    },
    {
        title: '言情',
        index: 7,
        name_en: 'yanQing',
    },
])

const curIndex = ref(0)

const clickHandle = (index) => {
    curIndex.value = index
    emit('changecategory', curIndex.value, renderList.value[curIndex.value].name_en)
}
</script>

<template>
    <div class="nav-bar">
        <div>
            <i class="fa-solid fa-bars fa-lg"></i>
        </div>
        <div
            class="tag"
            v-for="item in renderList"
            :key="item.index"
            @click="clickHandle(item.index)"
        >
            <h3 :class="{ active: item.index == curIndex }">{{ item.title }}</h3>
        </div>

        <div>
            <i class="fa-solid fa-magnifying-glass fa-lg"></i>
        </div>
    </div>
</template>

<style scoped lang="scss">
.nav-bar {
    height: 2.5rem;
    overflow: hidden;
    color: $text-color-4;
    display: flex;
    justify-content: space-around;
    align-items: center;
    z-index: 11;
    background-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.75));
    backdrop-filter: blur(15px);
    user-select: none;

    @media screen and (min-width: 500px) {
        & {
            cursor: pointer;
        }
    }

    margin-bottom: 5px;
    .tag {
        .active {
            color: $text-color-1;
            border-bottom: 2.5px solid $text-color-1;
            transition: color 0.3s;
            transform: scale(1.05);
            transform: translateY(1px);
        }
    }
}
</style>
