import type { FC } from 'react'
import { Suspense } from 'react'
import { Button, Space, Card, Typography, Tag, Divider } from '@arco-design/web-react'
import creatMessge from '../../components/message'

const { Text } = Typography

import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

// 我们自己实现的useQuery钩子和这个库中的具有一样的参数，可以直接替换
// import { useQuery } from 'react-query'
import useQuery from '../../hooks/useQuery'
import { dividerProps } from 'element-plus'

// 用React Hooks获取数据
const API = 'https://hn.algolia.com/api/v1/search'

// type searchRes = {
//     query?: string
//     hitsPerPage?: number
//     hits?: Story
//     params?: string
// }

type Story = {
    objectID: string
    title: string
    url: string
}

creatMessge('test')

const App = () => {
    // const [data, setData] = useState<Story[]>([])
    // const [allData, setAllData] = useState<searchRes>({})

    const [search, setSearch] = useState<string>('')
    const [activeSearch, setActiveSearch] = useState<string>('react')

    // const [isLoading, setIsLoading] = useState<boolean>(false)
    // const [isError, setIsError] = useState<boolean>(false)

    // 使用自定义的hook将请求的逻辑封装在一个单独的文件中
    // 在这之后又改造了其通用性，看的脑壳痛
    const { data, isLoading, isError } = useQuery<Story[]>({
        // 这个就是重新请求的依赖
        queryKey: [activeSearch],

        // 这个是请求的函数
        queryFn: async () => {
            const result = await axios(`${API}?query=${activeSearch}`)

            return result.data.hits
        },

        // 这个是没有请求前，data的初始值
        initialData: [],
    })

    // 这里的功能其实没有多难，但是洋洋洒洒写了140多行了。理解起来也很费劲了，两个月以后的自己肯定是记不住了。
    // 这里的写法就和项目中的实际代码强度几乎一致了

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value)
    }

    const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        setActiveSearch(search)
        setSearch(search)

        e.preventDefault()
    }
    // https://www.robinwieruch.de/react-hooks-fetch-data/ 教程地址
    return (
        <>
            <form onSubmit={handleSearchSubmit}>
                <input type="text" value={search} onChange={handleSearchChange} />
                <button type="submit">Search</button>
            </form>

            {isError && <div>Something went wrong...</div>}

            <ul>
                {isLoading ? (
                    <div>Loading...</div>
                ) : (
                    data.map((item) => (
                        <li key={item.objectID}>
                            <a href={item.url}>{item.title}</a>
                        </li>
                    ))
                )}
            </ul>
        </>
    )
}

// Canvas 指纹生成函数
const generateCanvasFingerprint = async (): Promise<string> => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    canvas.width = 200
    canvas.height = 30

    // 绘制文本 - 不同设备渲染会有微小差异
    ctx.textBaseline = 'top'
    ctx.font = '14px Arial'
    ctx.fillStyle = '#f60'
    ctx.fillRect(125, 1, 62, 20)
    ctx.fillStyle = '#069'
    ctx.fillText('Hello World', 2, 15)
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)'
    ctx.fillText('Canvas FP', 4, 17)

    // 获取 base64 数据
    const dataURL = canvas.toDataURL()

    // 使用 Web Crypto API 进行 SHA-256 哈希
    const encoder = new TextEncoder()
    const data = encoder.encode(dataURL)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')

    console.log(hashHex, '666')

    return hashHex
}

const Demo: FC = () => {
    const navigate = useNavigate()
    const [fingerprint, setFingerprint] = useState<string>('')

    useEffect(() => {
        generateCanvasFingerprint().then(setFingerprint)
    }, [])

    return (
        <div style={{ padding: '24px', background: '', minHeight: '100vh' }}>
            <Card
                title="很抱歉,由于APIfox的后端项目已停止提供服务,yike目前无法正常运行"
                extra={<Tag color="red">已停止</Tag>}
                style={{ maxWidth: '600px', margin: '0 auto' }}
            >
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                    <div>
                        <Text type="secondary">我目前正在寻找新的短剧资源,尝试恢复服务</Text>
                        <br />
                        <br />
                        <a
                            href="https://github.com/DanoAndHolidays/yike"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            查看项目介绍
                        </a>
                    </div>

                    <Divider />

                    <div>
                        <Text type="success" bold>
                            ✓ React + TypeScript 配置成功！
                        </Text>
                    </div>

                    <Divider />

                    <div>
                        <Text bold>🖼️ Canvas 指纹 (设备唯一标识)</Text>
                        <br />
                        <div
                            style={{
                                marginTop: '8px',
                                padding: '12px',
                                background: '#f5f5f5',
                                borderRadius: '4px',
                                fontFamily: 'monospace',
                                wordBreak: 'break-all',
                                fontSize: '12px',
                            }}
                        >
                            {fingerprint || '生成中...'}
                        </div>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            基于 Canvas 渲染差异 + SHA-256 哈希
                        </Text>
                    </div>

                    <div>
                        <Suspense fallback={<div>Loading...</div>}>
                            <App />
                        </Suspense>
                    </div>

                    <Divider />

                    <div style={{ textAlign: 'center' }}>
                        <Button type="outline" size="large" onClick={() => navigate('/tree-demo')}>
                            查看树形虚拟滚动 Demo (100k 节点)
                        </Button>
                    </div>
                </Space>
            </Card>
        </div>
    )
}

export default Demo
