// 使用xhr实现的请求，实际上没啥用

const xhr = new XMLHttpRequest()

xhr.timeout = 3000
xhr.ontimeout = () => {
    console.log('timeout')
}

xhr.open('GET', 'https://playlet.zonelian.com/api/microtime?zlsj=zlsj')
xhr.onreadystatechange = () => {
    if (xhr.readyState === 4) {
        console.log('res:', xhr.response)
        console.log('URL:', xhr.responseURL)
        console.log('header', xhr.getResponseHeader('content-type'))
    }
}
xhr.send()
//xhr.abort(); 取消请求
