export class DramaManager {
    // 如果data存在就使用data
    constructor(data) {
        this.likes = new Set(data?.likes || [])
        this.collections = new Set(data?.collections || [])

        this.watchRecords = new Map(
            (data?.watchRecords || []).map((r) => [
                r.id,
                {
                    lastEpisode: r.lastEpisode,
                    timestamp: r.timestamp,
                    episodes: new Set(r.episodes),
                },
            ]),
        )
    }

    toggleLike(id) {
        this.likes.has(id) ? this.likes.delete(id) : this.likes.add(id)
    }

    toggleCollection(id) {
        this.collections.has(id) ? this.collections.delete(id) : this.collections.add(id)
    }

    updateWatchRecord(id, episode) {
        if (!this.watchRecords.has(id)) {
            this.watchRecords.set(id, {
                lastEpisode: episode,
                timestamp: Date.now(),
                episodes: new Set([episode]),
            })
        } else {
            const record = this.watchRecords.get(id)
            record.lastEpisode = episode
            record.timestamp = Date.now()
            record.episodes.add(episode)
        }
    }

    getLikesCount() {
        return this.likes.size
    }

    getCollectionsCount() {
        return this.collections.size
    }

    getWatchRecordsCount() {
        return this.watchRecords.size
    }

    getWatchRecord(id) {
        return this.watchRecords.get(id) || null
    }

    getLikes() {
        return this.likes || null
    }

    getCollections = () => {
        // console.log(this.collections)
        return this.collections || null
    }

    // 序列化为 JSON，利于Pinia 持久化
    toJSON() {
        return {
            likes: Array.from(this.likes),
            collections: Array.from(this.collections),
            watchRecords: Array.from(this.watchRecords.entries()).map(([id, rec]) => ({
                id,
                lastEpisode: rec.lastEpisode,
                timestamp: rec.timestamp,
                episodes: Array.from(rec.episodes),
            })),
        }
    }
    clearAll() {
        this.likes.clear()
        this.collections.clear()
        this.watchRecords.clear()
    }
    // 从 JSON 恢复
    static fromJSON(data) {
        return new DramaManager(data)
    }
}
