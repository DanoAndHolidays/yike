import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore(
    'userInfo',
    () => {
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
