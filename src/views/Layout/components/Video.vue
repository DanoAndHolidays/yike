<script setup>
import { ref, onMounted } from 'vue';
import { getRandom } from '@/apis/play';

const randomList = ref({});

const getRandomList = (page = 1, limit = 15) => {
    const res = getRandom(page, limit);
    randomList.value = res.data;
}

onMounted(() => {
    getRandomList();
})

</script>
<template>
    <div class="video">

    </div>
</template>

<style scoped lang="scss">
.video {
    background-color: rgb(90, 90, 155);
}
</style>