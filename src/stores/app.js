import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { applog } from '@/utils/applog'

export const useAppStore = defineStore('appInfo', () => {
    const isReady = ref(false)
    function setIsReady() {
        if (isReady.value) {
            // applog('切换加载完成')
            return
        } else {
            isReady.value = true
            applog('首次加载完成')
        }
    }

    function getIsReady() {
        return isReady
    }

    return { isReady, getIsReady, setIsReady }
})
