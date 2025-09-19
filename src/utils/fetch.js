// 使用fetch实现的请求，实际上没啥用

export const createFetch = async () => {
    const res = await fetch(
        'https://playlet.zonelian.com/api/playlet/random?page=1&limit=15&zlsj=zlsj',
        {
            method: 'GET',
            headers: {
                'content-type': 'application/json',
                a: 1,
            },
        },
    )
    console.log(res)
    const data = await res.json()
    console.log(data)
}
