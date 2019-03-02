const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const users = require('./routes/users')
const history = require('koa2-connect-history-api-fallback');
const mongoose = require('./config/mongoose.js');
const koaBody = require('koa-body');
const cors = require('koa2-cors');
const db = mongoose();
app.use(cors({
  origin: function (ctx) {
      return '*';
  },
  exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'],
  maxAge: 5,
  credentials: true,
  allowMethods: ['GET', 'POST', 'DELETE'],
  allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
}))
// error handler
onerror(app)
// middlewares
app.use(koaBody({
  multipart: true,
  formidable: {
      maxFileSize: 200*1024*1024,
      multipart: true,   // 设置上传文件大小最大限制，默认2M
  }
}));
app.use(bodyparser({
  enableTypes: ['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(history({whiteList:['/api','/public']}));
app.use(require('koa-static')(__dirname + '/public/dist'))
app.use(views(__dirname + '/views', {
  extension: 'pug'
}))

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// routes
app.use(users.routes(), users.allowedMethods())
// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app
