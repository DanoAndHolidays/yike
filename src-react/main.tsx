import type { FC } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import '@arco-design/web-react/dist/css/arco.css'
import '@/styles/main.scss'
import routes from './routes'

const App: FC = () => {
    return (
        <HashRouter>
            <Routes>
                {routes.map((route) => (
                    <Route
                        key={route.path}
                        path={route.path}
                        element={
                            route.redirect ? (
                                <Navigate to={route.redirect} replace />
                            ) : (
                                <route.component />
                            )
                        }
                    />
                ))}
            </Routes>
        </HashRouter>
    )
}

const container = document.getElementById('react-app')
if (container) {
    const root = createRoot(container)
    root.render(<App />)
}
