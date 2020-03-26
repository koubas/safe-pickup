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

export async function updateVisit(at, code) {
    const res = await fetch(`${apiUrl}/visit`, {
        method: "PATCH",
        headers: {
            'Auth': code,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ at }),
    })
    const result = {
        statusCode: res.status
    }
    if (res.status === 200) {
        //result.place = await res.json()
    }
    return result
}

export async function adminAuth(placeId, password) {
    const res = await fetch(`${apiUrl}/admin/auth`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ placeId, password }),
    })
    const result = {
        statusCode: res.status
    }
    if (res.statusCode === 200) {
        result.place = await res.json()
    }
    return result
}

export async function registerPlace(placeName, email, password) {
    const res = await fetch(`${apiUrl}/register-place`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ placeName, email, password }),
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

export async function adminGetPlace(authKey) {
    const res = await fetch(`${apiUrl}/admin/place`, {
        headers: {
            Auth: authKey
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

export async function adminUpdateVisits(visitUpdates, authKey) {
    const res = await fetch(`${apiUrl}/admin/visits`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Auth: authKey,
        },
        body: JSON.stringify(visitUpdates),
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

export async function adminUpdatePlace(placeUpdate, authKey) {
    const res = await fetch(`${apiUrl}/admin/place`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Auth: authKey,
        },
        body: JSON.stringify(placeUpdate),
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