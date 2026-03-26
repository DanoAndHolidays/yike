import React from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import '@arco-design/web-react/dist/css/arco.css'
import '@/styles/main.scss'
import Demo from './views/Demo'

function App() {
    return (
        <HashRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/react-demo" replace />} />
                <Route path="/react-demo" element={<Demo />} />
            </Routes>
        </HashRouter>
    )
}

const container = document.getElementById('react-app')
if (container) {
    const root = createRoot(container)
    root.render(<App />)
}
