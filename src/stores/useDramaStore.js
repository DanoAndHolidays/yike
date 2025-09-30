// src/store/useDramaStore.js
import { defineStore } from 'pinia'
import { reactive, computed, watch } from 'vue'
import { DramaManager } from './dramaManager'

export const useDramaStore = defineStore('drama', () => {
    // 从本地恢复
    const storedData = localStorage.getItem('dramaStore')
    const manager = reactive(
        storedData ? DramaManager.fromJSON(JSON.parse(storedData)) : new DramaManager(),
    )

    // Watch manager 的变化，自动同步到 localStorage
    watch(
        () => manager.toJSON(),
        (newVal) => {
            localStorage.setItem('dramaStore', JSON.stringify(newVal))
        },
        { deep: true },
    )

    // Actions
    function toggleLike(vid) {
        if (vid) manager.toggleLike(vid)
    }

    function toggleCollection(vid) {
        if (vid) manager.toggleCollection(vid)
    }

    function updateWatchRecord(vid, eid) {
        if (vid && eid) manager.updateWatchRecord(vid, eid)
    }

    // 新增清除本地信息功能
    function clearAllData() {
        manager.clearAll()
        localStorage.removeItem('dramaStore')
    }

    const isLiked = (vid) => computed(() => manager.likes.has(vid))
    const isCollected = (vid) => computed(() => manager.collections.has(vid))
    const getWatchRecord = (vid) => computed(() => manager.getWatchRecord(vid))
    const getWatchRecordAll = () => {
        return Array.from(manager.getWatchRecordAll())
    }
    const getLikes = () => {
        return Array.from(manager.getLikes())
    }

    const getCollections = () => {
        return Array.from(manager.getCollections())
    }

    const likesCount = computed(() => manager.likes.size)
    const collectionsCount = computed(() => manager.collections.size)
    const watchRecordsCount = computed(() => manager.watchRecords.size)

    return {
        manager,
        toggleLike,
        toggleCollection,
        updateWatchRecord,
        isLiked,
        isCollected,
        getWatchRecord,
        clearAllData,
        getLikes,
        getCollections,
        likesCount,
        collectionsCount,
        watchRecordsCount,
        getWatchRecordAll,
    }
})
