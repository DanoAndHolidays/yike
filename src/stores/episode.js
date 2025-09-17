import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useEpisodeStore = defineStore('episode', () => {
    let episode = ref([])
    function addAndUpdata(new_episode) {
        episode.value = Array.from(new_episode)
    }
    function get() {
        return episode
    }

    return { episode, addAndUpdata, get }
})

export const useVideoStore = defineStore('video', () => {
    let video = ref([])
})
