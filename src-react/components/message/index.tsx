import { createRoot } from 'react-dom/client'

function creatMessge(message: string) {
    let el = document.createElement('div')
    el.id = 'global-message-container'
    document.body.appendChild(el)
    const root = createRoot(el)

    root.render(
        <>
            <div
                style={{
                    position: 'fixed',
                    top: 20,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 9999,
                    border: 'red 2px solid',
                    fontSize: 10,
                }}
            >
                {message}
            </div>
        </>,
    )

    let closed = false
    const close = () => {
        if (closed) return
        closed = true
        clearTimeout(timer)
        root.unmount()
        if (el.parentNode) {
            el.parentNode.removeChild(el)
        }
    }

    const timer = setTimeout(close, 3000)

    return close
}

export default creatMessge