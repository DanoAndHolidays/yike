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

export const useVidStore = defineStore(
    'vidInfo',
    () => {
        const vid = ref(0)
        const showDetail = ref(false)

        function setVidAndShowDetail(num) {
            vid.value = num
            console.log('vid:', vid.value)

            showDetail.value = true
            console.log('show:', showDetail.value)
        }
        const getVid = computed(() => vid.value)

        function unShowDetial() {
            showDetail.value = false
            console.log('show:', showDetail.value)
        }

        const getShowdetial = computed(() => showDetail.value)

        return { vid, setVidAndShowDetail, getVid, unShowDetial, getShowdetial, showDetail }
    },
    { persist: true },
)
