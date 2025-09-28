export class DramaInfo {
    /**
     * @description 传入一个对象数组
     */
    constructor(info) {
        // console.log('test', info)

        this.dramaInfo = new Map(
            (info ?? []).map((r) => [
                r.vid,
                {
                    eid: r.eid,
                    curEpisode: r.episode,
                    episode_total: r.episode_total,
                    title: r.title,
                    img: r.img,
                },
            ]),
        )
    }

    /**
     * @description 传入一个对象，会自动的进行解构
     */
    updateDramaInfo({ eid, episode, episode_total, title, img, vid }) {
        if (!this.dramaInfo.has(vid)) {
            this.dramaInfo.set(vid, {
                eid: eid,
                curEpisode: episode,
                episode_total: episode_total,
                title: title,
                img: img,
            })
        }
    }

    getDramaInfo(vid) {
        if (this.dramaInfo.has(vid)) {
            return this.dramaInfo.get(vid)
        }
        return null
    }

    // 由于Set和Map不能够自动的转化为JSON，需要手动实现。
    toJOSN() {
        return {
            dramaInfo: Array.from(this.dramaInfo.entries()).map(([vid, infomation]) => ({
                vid,
                curEpisode: infomation.curEpisode,
                episode_total: infomation.episode_total,
                title: infomation.title,
                img: infomation.img,
                eid: infomation.eid,
            })),
        }
    }

    clear() {
        this.dramaInfo.clear()
    }

    // 传入一个JSON，本质上的构造函数是传入的对象数组。
    static fromJSON(info) {
        return new DramaInfo(info)
    }
}
