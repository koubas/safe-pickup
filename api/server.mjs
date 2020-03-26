import Koa from 'koa'
import joiRouter from 'koa-joi-router'
import bodyParser from 'koa-bodyparser'

import jsBase64 from 'js-base64'
const { Base64 } = jsBase64

import * as DAL from './src/DAL.mjs'

const app = new Koa()

// run webserver when server.mjs invoked directly
if (process.argv.length >= 2 && process.argv[1].match(/server.mjs$/)) {
    app.listen(3001)
}

// body parser 
app.use(bodyParser());

// CORS override
app.use((ctx, next) => {
    ctx.set('Access-Control-Allow-Origin', '*');
    if (ctx.request.method == 'OPTIONS') {
        ctx.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT, PATCH');
        ctx.set('Access-Control-Allow-Headers', 'Content-type, Auth');
        ctx.res.statusCode = 200;
    } else {
        return next();
    }
});

// auth
app.use(async (ctx, next) => {
    if (
        ctx.request.url.match(/^\/admin\//) ||
        ctx.request.url.match(/^\/place-public\//) ||
        ctx.request.url.match(/^\/register-place$/) ||
        ctx.request.url.match(/^\/ping$/) ||
        ctx.request.method === 'OPTIONS'
    ) {
        // skip auth now
        return next()
    }
  
    const authKey = ctx.request.get('Auth');
    try {
        const result = await DAL.auth(authKey)
        if (result === null) {
            ctx.res.statusCode = 401
            // no next!!
        } else {
            ctx.state.auth = result
            return next();
        }
    } catch(e) {
        console.log(e)
        ctx.res.statusCode = 500
        // no next!!
    }
});

// admin auth
app.use(async (ctx, next) => {
    if (
        !ctx.request.url.match(/^\/admin\//) ||
        ctx.request.url.match(/^\/admin\/auth/)
    ) {
        // skip admin auth now
        return next()
    }
    try {
        const authKey = ctx.request.get('Auth')
        const authObject = JSON.parse(Base64.decode(authKey));

        if (!("placeId" in authObject || "password" in authObject)) {
            // invalid format: get out!
            ctx.res.statusCode = 401
        } else {
            const { placeId, password } = authObject
            if (!await DAL.adminAuth(placeId, password)) {
                ctx.res.statusCode = 401
            } else {
              ctx.state.auth = {
                  placeId,
                  authKey,
              }
              return next();
            }
        }
    } catch(e) {
        if (!(e instanceof SyntaxError)) { // fail silently when 
            console.log(e)
        }
        ctx.res.statusCode = 500
    }
});

const router = joiRouter()
const Joi = joiRouter.Joi
app.use(router.middleware())

router.get("/ping", async ctx => {
    ctx.body = 'pong'
})

router.get("/place-public/:placeId", async ctx => {
    const params = ctx.request.params

    try {
         let data = await DAL.getPlace(params.placeId)
         data = {
            name: data.name
         }
         ctx.body = data
    } catch(e) {
        ctx.res.statusMessage = e.message
        if (e instanceof DAL.ErrorPlaceNotFound) {
            ctx.res.statusCode = 404
        } else {
            console.log(e)
            ctx.res.statusCode = 500
        }
    }
})

router.get("/place/:placeId", async ctx => {
    const params = ctx.request.params
    try {
        let [ place, visits ] = await Promise.all([
            DAL.getPlace(params.placeId),
            DAL.getVisitsByPlace(params.placeId),
        ])

        const myVisit = visits.reduce((acc, visit) => {
            return (visit.visitor_id === ctx.state.auth.visitorId)  ? visit : acc
        })

        ctx.body = {
            id: place.id,
            name: place.name,
            opens: place.opens,
            closes: place.closes,
            myVisit: visits
                    .reduce((acc, visit) => {
                        return (visit.visitor_id === ctx.state.auth.visitorId)  ? visit : acc
                    }),
            visits: visits
                    // remove myVisit from visits
                    .filter(visit => visit.visitor_id !== ctx.state.auth.visitorId)
                    // redact visits (return just visit times)
                    .map(item => ({ at: item.at }))
            }
    } catch(e) {
        ctx.res.statusMessage = e.name
        if (e instanceof DAL.ErrorPlaceNotFound) {
            ctx.res.statusCode = 404
        } else {
            console.log(e)
            ctx.res.statusCode = 500
        }
    }
})

router.route({
    method: "PATCH",
    path: "/visit",
    validate: {
        type: "json",
        body: {
            at: Joi.string()
        }
    },
    handler: async ctx => {
        try {
            await DAL.getUpdateMyVisit(ctx.state.auth.placeId, ctx.state.auth.visitorId, ctx.request.body.at)
            ctx.res.statusCode = 200
        } catch(e) {
            console.log(e)
            ctx.res.statusCode = 500
        }
    }
})

router.route({
    method: "post",
    path: "/admin/auth",
    validate: {
        type: "json",
        body: {
            placeId: Joi.string(),
            password: Joi.string().max(50),
        }
    },
    handler: async ctx => {
        try {
            if (await DAL.adminAuth(ctx.request.body.placeId, ctx.request.body.password)) {
                ctx.res.statusCode = 200
            } else {
                throw new Error("login_failed")
            }
        } catch(e) {
            ctx.res.statusMessage = "Bad login o password"
            ctx.res.statusCode = 401
            if (!(e instanceof Error && e.message == 'login_failed') && !(e instanceof DAL.ErrorPlaceNotFound)) {
                console.log(e)
            }
        }
    }
})

router.route({
    method: "post",
    path: "/register-place",
    validate: {
        type: "json",
        body: {
            placeName: Joi.string().min(10).max(50),
            email: Joi.string().min(5).max(50),
            password: Joi.string().min(8).max(50),
        }
    },
    handler: async ctx => {
        try {
            const placeId = await DAL.registerPlace(ctx.request.body.placeName, ctx.request.body.email, ctx.request.body.password)
            
            if (placeId === null) {
                ctx.res.statusCode = 500
            } else {
                ctx.res.statusCode = 200
                ctx.body = {
                    placeId
                }
            }
        } catch(e) {
            console.log(e)
            ctx.res.statusCode = 500
        }
    }
})

router.get("/admin/place", async ctx => {
    try {
        let [ place, visits ] = await Promise.all([
            DAL.getPlace(ctx.state.auth.placeId),
            DAL.getVisitsByPlace(ctx.state.auth.placeId),
        ])
        ctx.body = {
            id: place.id,
            name: place.name,
            opens: place.opens,
            closes: place.closes,
            visits: visits
        }
    } catch(e) {
        console.log(e)
        ctx.res.statusCode = 500
    }
})

router.route({
    method: "PATCH",
    path: "/admin/place",
    validate: {
        type: "json",
        body: {
            opens: Joi.string(),
            closes: Joi.string(),
        }
    },
    handler: async ctx => {
        try {
            await DAL.adminUpdatePlace(ctx.state.auth.placeId, ctx.request.body.opens, ctx.request.body.closes)
            ctx.res.statusCode = 200
        } catch(e) {
            console.log(e)
            ctx.res.statusCode = 500
        }
    }
})

router.route({
    method: "PATCH",
    path: "/admin/visits",
    validate: {
        type: "json",
        body: Joi.array().items(Joi.object().keys({
            visitor_id: Joi.string(),
            visitor: Joi.string().allow('')
        }))
    },
    handler: async ctx => {
        try {
            const place = await DAL.getPlace(ctx.state.auth.placeId)
            ctx.body = await DAL.adminUpdateVisits(place.id, ctx.request.body)
        } catch(e) {
            console.log(e)
            ctx.res.statusCode = 500
        }
    }
})

export default app