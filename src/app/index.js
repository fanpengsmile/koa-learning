const Koa = require('koa');
const route = require('koa-route');
const { proxyAxios } = require('./controller/proxy');
const bodyParser = require('koa-bodyparser');
const koaBody = require('koa-body');
const logger = require('koa-logger');
const logge = require('./controller/logger');

const app = new Koa();

app.use(koaBody({ multipart: true }));
app.use(bodyParser());
app.use(logger());
app.use(async (ctx, next) => {
    logge.info('ctx-url=%s', ctx.url);
    await next();
});
app.use(route.get('/*', async (ctx) => {
    await proxyAxios(ctx, 'get');
}));
app.use(route.post('/*', async (ctx) => {
    await proxyAxios(ctx, 'post');
}));

module.exports = app;
