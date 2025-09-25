<script setup>
import { ref } from 'vue'

const isActive = ref(false)

const props = defineProps({
    name: String,
    url: String,
})

const emit = defineEmits(['onShare'])

const handleClick = () => {
    // emit('onShare', props.name)
    isActive.value = !isActive.value
    if (isActive.value) {
        emit('onShare', 1)
    } else {
        emit('onShare', -1)
    }
}
</script>

<template>
    <div class="container">
        <img
            :src="props.url"
            :alt="props.name"
            class="avater"
            @click="handleClick"
            :class="{ active: isActive }"
        />
        <p class="name">{{ props.name }}</p>
    </div>
</template>

<style lang="scss" scoped>
.container {
    // background-color: red;
    height: 50px;
    aspect-ratio: 1 / 1;
    border-radius: 50%;
    display: inline-block;
    // overflow: hidden;
    margin: 0 10px;
    user-select: none;

    .avater {
        height: 100%;
        aspect-ratio: 1 / 1;
        border-radius: 50%;
        border: transparent 3px solid;
        box-sizing: content-box;
    }

    .name {
        width: 50px;
        text-align: center;
        margin: 0;
        padding: 0;
        font-size: 8px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
}

.active {
    border: $primary-color 3px solid !important;
    box-sizing: content-box;
}
</style>
