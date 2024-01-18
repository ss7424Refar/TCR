// const bodyParser = require("body-parser"); // 配置解析表单的中间件
const cors = require("cors"); // 一定在路由前配置cors这个中间件,用来解决跨域问题
const express = require("express");
const app = express(); // 创建express的服务器实例
const router = require("./router");
const history = require('connect-history-api-fallback');


app.all("*", function (req, res, next) {
  //设置允许跨域的域名，*代表允许任意域名跨域
  res.header("Access-Control-Allow-Origin", "*");
  //允许的header类型
  res.header("Access-Control-Allow-Headers", "content-type");
  //跨域允许的请求方式
  res.header("Access-Control-Allow-Methods", "DELETE,PUT,POST,GET,OPTIONS");
  if (req.method.toLowerCase() == "options")
    res.sendStatus(200); //让options尝试请求快速结束
  else next();
});


app
  .use('/', history({
    rewrites: [
      {
        from: /^\/api\/.*$/,
        to: function (context) {
          return context.parsedUrl.path
        }
      }
    ]
  }))
  .use(cors())
  //   .use(bodyParser.urlencoded({ extended: false }))
  //   .use(bodyParser.json())
  .use(express.static(__dirname + '/public'))
  .use("/api", router)
  .listen(7081, function () {
    console.log("server is running ...");
  });
