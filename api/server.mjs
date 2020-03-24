import Koa from 'koa'
import joiRouter from 'koa-joi-router'
import bodyParser from 'koa-bodyparser'

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
        ctx.request.url.match(/^\/ping$/) ||
        ctx.request.method === 'OPTIONS'
    ) {
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

const router = joiRouter()
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
            ctx.response.code = 404
        } else {
            console.log(e)
            ctx.res.statusCode = 500
        }
    }
})

router.post("/admin/auth", async ctx => {
    try {
        if (
            ctx.request.body.placeId !== undefined &&
            ctx.request.body.password !== undefined &&
            await DAL.adminAuth(ctx.request.body.placeId, ctx.request.body.password)
        ) {
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
})

export default app