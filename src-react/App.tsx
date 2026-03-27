import type { FC } from 'react'
import DemoSSR from './views/Demo/index.ssr'

interface AppProps {
    location?: string
}

const App: FC<AppProps> = ({ location = '/' }) => {
    return <DemoSSR />
}

export default App
