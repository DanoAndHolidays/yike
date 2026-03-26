import React from 'react'
import { Button, Space, Card, Typography, Tag } from '@arco-design/web-react'

const { Text } = Typography

function Demo() {
    return (
        <div style={{ padding: '24px', background: '', minHeight: '100vh' }}>
            <Card
                title="React + Arco Design 测试"
                extra={
                    <Tag color="arcoblue">运行中</Tag>
                }
                style={{ maxWidth: '600px', margin: '0 auto' }}
            >
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                    <div>
                        <Text type="secondary">
                            这是一个使用 React + Arco Design + SCSS 的示例页面。
                        </Text>
                    </div>

                    <Space>
                        <Button type="primary">主要按钮</Button>
                        <Button type="secondary">次要按钮</Button>
                        <Button type="dashed">虚线按钮</Button>
                    </Space>

                    <Space>
                        <Button status="success">成功</Button>
                        <Button status="warning">警告</Button>
                        <Button status="danger">危险</Button>
                    </Space>

                    <div>
                        <Text bold>技术栈：</Text>
                        <ul style={{ margin: '8px 0' }}>
                            <li>React 19</li>
                            <li>Arco Design Web React</li>
                            <li>React Router DOM</li>
                            <li>SCSS</li>
                        </ul>
                    </div>

                    <div style={{ marginTop: '16px' }}>
                        <Text type="success" bold>✓ React 配置成功！</Text>
                    </div>
                </Space>
            </Card>
        </div>
    )
}

export default Demo
