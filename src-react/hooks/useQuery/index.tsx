import { useEffect, useState } from 'react'

// 用React Hooks获取数据
// const API = 'https://hn.algolia.com/api/v1/search'

// type searchRes = {
//     query?: string
//     hitsPerPage?: number
//     hits?: Story
//     params?: string
// }

// type Story = {
//     objectID: string
//     title: string
//     url: string
// }

type UseQueryArgs<T> = {
    queryKey: string[]
    queryFn: () => Promise<T>
    initialData: T
}

function useQuery<T>({ queryKey, queryFn, initialData }: UseQueryArgs<T>) {
    const [data, setData] = useState<T>(initialData)
    // const [allData, setAllData] = useState<searchRes>({})

    // const [search, setSearch] = useState<string>('')

    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [isError, setIsError] = useState<boolean>(false)

    useEffect(() => {
        // 这里是用来标记组件是否被卸载的flag，当组件被卸载的时候，标记就会消失，也就无法继续setState了
        // 但这并不是将请求abort了，而是不设置值而已
        let didCancel = false

        // 由于不能直接在effect钩子中使用async函数，需要包一层
        const fetchData = async () => {
            setIsLoading(true)
            setIsError(false)

            try {
                const result = await queryFn()

                if (!didCancel) setData(result)
            } catch (error) {
                if (!didCancel) {
                    setIsError(true)
                    console.log(error)
                }
            }

            setIsLoading(false)
        }
        fetchData()
    }, [...queryKey])

    return {
        data,
        isLoading,
        isError,
    }
}

export default useQuery
