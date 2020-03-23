//const apiUrl = "http://10.107.11.67:3001"
const apiUrl = "https://uy2ca9ys1c.execute-api.eu-central-1.amazonaws.com/dev"

export async function getPlacePublicInfo(placeId) {
    const res = await fetch(`${apiUrl}/place-public/${placeId}`)
    let result = {
        statusCode: res.status
    }
    if (res.status === 200) {
        result = {
            ...result,
            ...await res.json(),
        }
    }
    return result
}

export async function getPlace(placeId, visitorId) {
    const res = await fetch(`${apiUrl}/place/${placeId}`, {
        headers: {
            'Auth': `${placeId}-${visitorId}`
        }
    })
    let result = {
        statusCode: res.status
    }
    if (res.status === 200) {
        result = {
            ...result,
            ...await res.json(),
        }
    }
    return result
}