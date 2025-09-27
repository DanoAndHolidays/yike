import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { applog } from '@/utils/applog'

export const useEpisodeStore = defineStore('episode', () => {
    let curEpisode = ref({})
    function updata(new_episode) {
        curEpisode.value = new_episode
    }
    function get() {
        return curEpisode
    }

    return { curEpisode, updata, get }
})
