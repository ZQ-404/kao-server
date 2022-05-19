const Koa = require("koa");
const app = new Koa();
const views = require("koa-views");
const json = require("koa-json");
const onerror = require("koa-onerror");
const bodyparser = require("koa-bodyparser");
const logger = require("koa-logger");
const log4js = require("./utils/log4j.js"); //log4j
const router = require("koa-router")();
const jwt = require("jsonwebtoken");
const users = require("./routes/users");
const menus = require("./routes/menus");
const roles = require("./routes/roles");
const depts = require("./routes/depts");

// error handler
onerror(app);

require("./config/db");

// middlewares
app.use(
  bodyparser({
    enableTypes: ["json", "form", "text"],
  })
);
app.use(json());
app.use(logger());
app.use(require("koa-static")(__dirname + "/public"));

app.use(
  views(__dirname + "/views", {
    extension: "pug",
  })
);

// logger
app.use(async (ctx, next) => {
  await next();
  debugger;
  log4js.info(`log output`);
});

//一级路由
router.prefix("/api");

//对token进行解密
router.get("/leave/count", (ctx) => {
  const token = ctx.request.headers.Authorization.split(" ")[1];
  const payload = jwt.verify(token, "imooc");
  ctx.body = payload;
});

// 二级路由
app.use(router.routes(), router.allowedMethods());
router.use(users.routes(), users.allowedMethods());
router.use(menus.routes(), menus.allowedMethods());
router.use(roles.routes(), roles.allowedMethods());
router.use(depts.routes(), depts.allowedMethods());

// error-handling
app.on("error", (err, ctx) => {
  log4js.error(`${err.stack}`);
});

module.exports = app;

