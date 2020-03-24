import AWS from 'aws-sdk'
import bcrypt from 'bcrypt'
import moment from 'moment-timezone'

export class ErrorPlaceNotFound extends Error{ constructor() { super("ERR_PLACE_NOT_FOUND")} }
export class ErrorPlaceExists extends Error{ constructor() { super("ERR_PLACE_EXISTS")} }

AWS.config.update({
    region: "eu-central-1",
});

  
export async function getPlace(placeId) {
    const docClient = new AWS.DynamoDB.DocumentClient()
    return new Promise((resolve, reject) =>{
        docClient.query({
            TableName: "safe-pickup-place",
            KeyConditionExpression: "id = :id",
            ExpressionAttributeValues: {
                ':id': placeId
            }
        },
        (err, data) =>{
            if (err !== null) {
                reject(err)
            } else if (data.Items.length !== 1 || !data.Items[0].approved) {
                reject(new ErrorPlaceNotFound())
            } else {
                resolve(data.Items[0])
            }
        })
    })
}

export async function getVisitsByPlace(placeId) {

    const docClient = new AWS.DynamoDB.DocumentClient()
    return new Promise((resolve, reject) =>{
        docClient.query({
            TableName: "safe-pickup-visit",
            KeyConditionExpression: "place_id = :placeId",
            ExpressionAttributeValues: {
                ':placeId': placeId
            }
        },
        (err, data) =>{
            if (err !== null) {
                reject(err)
            } else {
                resolve(data.Items)
            }
        })
    })
}

export async function getVisitorByPlaceAndCode(placeId, code) {
    const docClient = new AWS.DynamoDB.DocumentClient()
    return new Promise((resolve, reject) =>{
        docClient.query({
            TableName: "safe-pickup-visit",
            KeyConditionExpression: "place_id = :placeId AND visitor_id = :code",
            ExpressionAttributeValues: {
                ':placeId': placeId,
                ':code': code,
            }
        },
        (err, data) =>{
            if (err !== null) {
                reject(err)
            } else {
                resolve(data.Items)
            }
        })
    })
}

export async function auth(authKey) {
    const parts = authKey.split('-') 
    if (parts.length !== 2) {
        // invalid format: get out!
        return null
    }
    const [ placeId, visitorId ] = parts
    const result = await getVisitorByPlaceAndCode(placeId, visitorId)
    if (Array.isArray(result) && result.length === 1) {
        return {
            visitorId
        }
    }
    return null
}

export async function adminAuth(placeId, password) {
    try {
        const place = await getPlace(placeId)

        // twin-bcrypt with native support for $2y$ is slow and this works
        const fixedHash = place.admin_password.replace(/^\$2y\$/, "$2a$")

        return await bcrypt.compare(password, fixedHash)
    } catch (e) {
        if (!e instanceof ErrorPlaceNotFound) {
            console.log(e)
        }
        throw e
    }
}

export async function registerPlace(placeName, password) {
    const docClient = new AWS.DynamoDB.DocumentClient()
    
    const placeId = 'bbcdef'
    const existingPlace = await new Promise((resolve, reject) =>{
        docClient.scan({
            TableName: "safe-pickup-place",
            FilterExpression: "#name = :placeName",
            ExpressionAttributeNames: {
                '#name': 'name'
            },
            ExpressionAttributeValues: {
                ':placeName': placeName,
            }
        },
        (err, data) =>{
            if (err !== null) {
                reject(err)
            } else {
                resolve(data.Items)
            }
        })
    })

    if (existingPlace.length > 0) {
        throw new ErrorPlaceExists()
    }

    return new Promise(async (resolve, reject) =>{
        docClient.put({
            TableName: "safe-pickup-place",
            Item: {
                id: placeId,
                name: placeName,
                admin_password: await bcrypt.hash(password, await bcrypt.genSalt()),
                created: moment().toISOString(true),
                approved: false,
            }
        },
        (err) =>{
            if (err !== null) {
                reject(err)
            } else {
                resolve(placeId)
            }
        })
    })
}
