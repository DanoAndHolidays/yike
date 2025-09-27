import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

import { DramaManager } from './dramaManager'

export const useUserStore = defineStore(
    'userInfo',
    () => {
        // 静音相关
        const isMute = ref(true)
        function getIsMute() {
            return isMute
        }
        function setIsMute(mute) {
            isMute.value = mute
        }

        return { isMute, getIsMute, setIsMute }
    },
    { persist: true },
)
