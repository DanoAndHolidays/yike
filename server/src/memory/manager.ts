// interface MemoryConfig {}
import { MemoryItem, MemoryConfig } from './base'
import { WorkingMemory } from './types/working'

export class MemoryManager {
    config?: MemoryConfig
    userID: string = 'default'
    enableWorking: boolean = true
    enableEpisodic: boolean = false
    enableSemantic: boolean = false
    enablePerceptual: boolean = false
    memoryTypes: Record<string, any> = {}
    workingMemory?: WorkingMemory

    constructor(
        config: MemoryConfig,
        userID: string,
        enableWorking: boolean,
        enableEpisodic?: boolean,
        enableSemantic?: boolean,
        enablePerceptual?: boolean,
    ) {
        this.config = config
        this.userID = userID
        this.enableWorking = enableWorking

        // TODO
        // this.store = MemoryStore(this.config)

        if (enableWorking) this.workingMemory = new WorkingMemory(this.config)
    }

    addMemory(
        content: string,
        memoryType: string,
        importance: number,
        metadata: Record<string, any>,
    ) {
        if (memoryType === 'working') {
            const id = `wm-${Date.now()}`
            this.workingMemory?.add({
                id,
                content,
                importance,
                timestamp: new Date().getTime(),
                memoryType: 'working',
                metadata,
            })
            return id
        }
        return null
    }
}
