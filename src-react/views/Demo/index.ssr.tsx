import type { FC } from 'react'
import { useEffect, useState } from 'react'

const DemoSSR: FC = () => {
    const [isClient, setIsClient] = useState<boolean>(false)
    const [localStorageStatus, setLocalStorageStatus] = useState<string>('等待客户端挂载...')
    const [localStorageValue, setLocalStorageValue] = useState<string>('')

    useEffect(() => {
        console.log('useEffect 执行')
        setIsClient(true)

        try {
            if (typeof localStorage !== 'undefined') {
                console.log('localStorage 可用')
                const testValue = localStorage.getItem('test_key') || '首次访问'
                setLocalStorageValue(testValue)
                localStorage.setItem('test_key', `访问时间: ${new Date().toLocaleString()}`)
                setLocalStorageStatus('✓ localStorage 可用')
            } else {
                console.log('localStorage 不可用')
                setLocalStorageStatus('✗ localStorage 不可用（服务端）')
            }
        } catch (error) {
            console.error('localStorage 错误:', error)
            setLocalStorageStatus('✗ localStorage 访问失败')
        }
    }, [])

    return (
        <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
            <div
                style={{
                    maxWidth: '600px',
                    margin: '0 auto',
                    background: 'white',
                    padding: '24px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
            >
                <h1 style={{ color: '#165DFF', margin: '0 0 16px 0' }}>React SSR 测试</h1>
                <div style={{ color: '#86909C', marginBottom: '16px' }}>
                    这是一个使用 React SSR 渲染的示例页面。
                </div>
                <div style={{ marginBottom: '16px' }}>
                    <h3 style={{ margin: '0 0 8px 0' }}>技术栈：</h3>
                    <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                        <li>React 19 + TypeScript</li>
                        <li>React Router DOM</li>
                        <li>Express SSR</li>
                    </ul>
                </div>
                <div style={{ color: '#00B42A', fontWeight: 'bold', marginTop: '16px' }}>
                    ✓ React SSR 配置成功！
                </div>
                <div
                    style={{
                        marginTop: '16px',
                        padding: '16px',
                        background: '#E8F3FF',
                        borderRadius: '4px',
                    }}
                >
                    <p style={{ margin: '0' }}>
                        <strong>服务器渲染状态：</strong> 成功
                    </p>
                    <p style={{ margin: '8px 0 0 0' }}>
                        <strong>渲染时间：</strong> {new Date().toISOString()}
                    </p>
                </div>
                <div
                    style={{
                        marginTop: '16px',
                        padding: '16px',
                        background: isClient ? '#E6FFE6' : '#FFF7E6',
                        borderRadius: '4px',
                    }}
                >
                    <h3 style={{ margin: '0 0 8px 0', color: isClient ? '#52C41A' : '#FA8C16' }}>
                        localStorage 测试
                    </h3>
                    <p style={{ margin: '0 0 8px 0' }}>
                        <strong>是否在客户端：</strong> {isClient ? '✓ 是' : '✗ 否（服务端渲染）'}
                    </p>
                    <p style={{ margin: '0 0 8px 0' }}>
                        <strong>localStorage 状态：</strong> {localStorageStatus}
                    </p>
                    <p style={{ margin: '0' }}>
                        <strong>存储的值：</strong> {localStorageValue}
                    </p>
                </div>
            </div>
        </div>
    )
}

export default DemoSSR
