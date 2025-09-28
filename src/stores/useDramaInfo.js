import { defineStore } from 'pinia'
import { DramaInfo } from './dramaInfo'
import { computed, reactive, watch } from 'vue'

export const useDramaInfo = defineStore('dramaInfo', () => {
    const storedDataInfo = localStorage.getItem('dramaInfo')
    // console.log(storedDataInfo)

    const infoManager = reactive(
        storedDataInfo ? DramaInfo.fromJSON(JSON.parse(storedDataInfo).dramaInfo) : new DramaInfo(),
    )

    watch(
        () => infoManager.toJOSN(),
        (newVale) => {
            localStorage.setItem('dramaInfo', JSON.stringify(newVale))
        },
        { deep: true },
    )

    const isHas = (vid) => {
        // console.log('test6', infoManager.getDramaInfo(vid))

        return infoManager.getDramaInfo(vid)
    }
    const updateDramaInfo = (vid) => {
        infoManager.updateDramaInfo(vid)
    }

    const clearAll = () => {
        infoManager.clear()
        localStorage.removeItem('dramaInfo')
    }

    return { infoManager, isHas, clearAll, updateDramaInfo }
})
