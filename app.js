/**
 * Created by web-01 on 2018/1/10.
 */
const express = require("express");
const pool = require("pool");
const http = require("http");
const cookie = require("cookie-parser");
const session = require("express-session");
const bodyParser = require("body-parser");
const user = require("./router/user");
const goods = require("./router/goods");
const menu = require("./router/menu");
const activity = require("./router/activity");
const work = require("./router/work");
const cors = require("cors");

var app = new express();
var server = http.createServer(app);

server.listen(8035);
console.log("this server running on 8035......");

app.use(bodyParser.urlencoded({extended:false}));
app.use(cookie("boasing"));
app.use(session({
    secret:"boasing",
    resave:true,
    saveUninitialized:true,
    cookie:{maxAge:360*60*1000}
}));

app.use((req,res,next)=>{
    req.session._garbage = new Date();
    req.session.touch();
    next();
});

app.use(cors({
    origin:'*'
}));

app.use("/user",user);
app.use("/goods",goods);
app.use("/menu",menu);
app.use("/activity",activity);
app.use("/work",work);
