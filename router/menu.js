/**
 * Created by web-01 on 2018/1/31.
 */
const express = require("express");
const pool = require("pool");
const fs = require("fs");
const formidable = require("formidable");
var router = express.Router();
const bodyParser = require("body-parser");
router.use(bodyParser.urlencoded({extended:false}));
router.post("/addmenu",(req,res)=>{

    var mname=req.body.mname;
    var mmode=req.body.mmode;
    var mtime=req.body.mtime;
    var mlabel=req.body.mlabel;
    var meffect=req.body.meffect;
    var mintroduction=req.body.mintroduction;
    var mmaterials=req.body.mmaterials;
    var pic_url = req.body.pic_url;
    var step=JSON.parse(req.body.step);
    var stepS = [];
    pool.getConnection((err,conn)=>{
        if(err) throw err;
        let sql = "insert into menus value(null,?,?,?,?,?,?,?,?)";
        conn.query(sql,[mname,mmode,mtime,mlabel,meffect,mintroduction,mmaterials,pic_url],(err,result)=>{
            if(err) throw err;
            if(result.affectedRows==1){
                var mid = result.insertId;
                for(index in step){
                    stepS.push([null,JSON.stringify(step[index].imgUrl),step[index].sdetailed,mid,index]);
                }
                let sql = "insert into steps value ?";
                conn.query(sql,[stepS],(err,result)=>{
                    if(err) throw err;
                    if(result.affectedRows!=0){
                        res.json({code:1,msg:"添加成功"});
                    }else{
                        res.json({code:0,msg:"添加失败"});
                    }
                    conn.release();
                });
            }else{
                res.json({code:0,msg:"添加失败"});
                conn.release();
            }
        });
    });
});


router.post("/uploadImg",(req,res)=>{
    var index = req.query.index || "0";
    var form = new formidable.IncomingForm();
    form.encoding = 'utf-8';
    form.uploadDir = '../pinganshan/static/images/menu' ;   //设置上路径
    form.keepExtensions = true;
    form.maxFieldsSize = 3 * 1024 * 1024;
    form.parse(req, function(err, fields, files) {
        if (err) {
            res.locals.error = err;
            res.render('index', { title: "上传错误" });
            return;
        }
        var extName = '';
        switch (files.file.type) {
            case 'image/pjpeg':
                extName = 'jpg';
                break;
            case 'image/jpeg':
                extName = 'jpg';
                break;
            case 'image/png':
                extName = 'png';
                break;
            case 'image/x-png':
                extName = 'png';
                break;
        }
        if(extName.length == 0){
            res.json({code:0,msg:"只支持png和jpg格式图片"});
            return;
        }
        var now = new Date();
        var avatarName = now.getFullYear()+""+now.getMonth()+now.getDate()+now.getHours()+now.getMinutes()+now.getSeconds()+now.getMilliseconds() + '.' + extName;
        //图片写入地址；
        var newPath = form.uploadDir +  "/"  + avatarName;
        //文件转存
        fs.rename(files.file.path, newPath,(err)=>{
            if(err) throw err;
            var showUrl =  avatarName;
            res.json({
                code:"ok",
                index:index,
                path:showUrl
            });
        });
    });
});


router.post("/getAllMenu",(req,res)=>{
    pool.getConnection((err, conn) => {
        if (err) throw  err;
        let sql = "select * from menus";
        conn.query(sql, (err, result) => {
            if (err) throw  err;
            res.json({code:"ok",list:result});
            conn.release();
        });
    });
});

router.post("/getMenu",(req,res)=>{
    var mid = req.body.mid;
    pool.getConnection((err, conn) => {
        if (err) throw  err;
        let sql = "select * from menus where mid=?";
        conn.query(sql,[mid],(err, result) => {
            if (err) throw  err;
            res.json({code:"ok",list:result});
            conn.release();
        });
    });
});

router.post("/getStep",(req,res)=>{
    var mid = req.body.mid;
    pool.getConnection((err, conn) => {
        if (err) throw  err;
        let sql = "select * from steps where s_mid=? order by last asc";
        conn.query(sql,[mid],(err, result) => {
            if (err) throw  err;
            res.json({code:"ok",list:result});
            conn.release();
        });
    });
});


router.post("/delMenu",(req,res)=>{
    var mid = req.body.mid;
    console.log(mid)
    pool.getConnection((err, conn) => {
        if (err) throw  err;
        let sql = "delete from steps where s_mid=?";
        conn.query(sql,[mid],(err, result) => {
            if (err) throw  err;
            console.log(1)
            let sql = "delete from a_menus where a_mid=?";
            conn.query(sql,[mid],(err,result)=>{
                if(err) throw err;
                let sql = "delete from menus_month where mid=?";
                conn.query(sql,[mid],(err,result)=>{
                    if(err) throw err;
                    let sql = "delete from menus_week where mid=?";
                    conn.query(sql,[mid],(err,result)=>{
                        if(err) throw err;
                        let sql ="delete from menus where mid=?";
                        conn.query(sql,[mid],(err,result)=>{
                            if(err) throw err;
                            console.log(3)
                            res.json({code:1,msg:"删除成功"});
                            conn.release();
                        });
                    });
                });
            });
        });
    });
});


router.post("/getMenusWeek",(req,res)=>{
    pool.getConnection((err, conn) => {
        if (err) throw  err;
        let sql = "select * from menus_week A left join menus B on A.mid=B.mid";
        conn.query(sql,(err, result) => {
            if (err) throw  err;
            res.json({code:"ok",list:result});
            conn.release();
        });
    });
});

router.post("/getMenusMonth",(req,res)=>{
    pool.getConnection((err, conn) => {
        if (err) throw  err;
        let sql = "select * from menus_month A left join menus B on A.mid=B.mid";
        conn.query(sql,(err, result) => {
            if (err) throw  err;
            res.json({code:"ok",list:result});
            conn.release();
        });
    });
});

router.post("/addMenusMonth",(req,res)=>{
    var mid = req.body.mid;
    pool.getConnection((err, conn) => {
        if (err) throw  err;
        let sql = "insert into menus_month value(null,?)";
        conn.query(sql,[mid],(err, result) => {
            if (err) throw  err;
            if(result.affectedRows==1){
                res.json({code:1,msg:"添加成功"});
            }else{
                res.json({code:0,msg:"添加失败"});
            }
            conn.release();
        });
    });
});

router.post("/addMenusWeek",(req,res)=>{
    var mid = req.body.mid;
    pool.getConnection((err, conn) => {
        if (err) throw  err;
        let sql = "insert into menus_week value(null,?)";
        conn.query(sql,[mid],(err, result) => {
            if (err) throw  err;
            if(result.affectedRows==1){
                res.json({code:1,msg:"添加成功"});
            }else{
                res.json({code:0,msg:"添加失败"});
            }
            conn.release();
        });
    });
});

router.post("/delMenusMonth",(req,res)=>{
    var mid = req.body.mid;
    pool.getConnection((err, conn) => {
        if (err) throw  err;
        let sql = "delete from menus_month where monid=?";
        conn.query(sql,[mid],(err, result) => {
            if (err) throw  err;
            if(result.affectedRows==1){
                res.json({code:1,msg:"删除成功"});
            }else{
                res.json({code:0,msg:"删除失败"});
            }
            conn.release();
        });
    });
});

router.post("/delMenusWeek",(req,res)=>{
    var mid = req.body.mid;
    pool.getConnection((err, conn) => {
        if (err) throw  err;
        let sql = "delete from menus_week where mwid=?";
        conn.query(sql,[mid],(err, result) => {
            if (err) throw  err;
            if(result.affectedRows==1){
                res.json({code:1,msg:"删除成功"});
            }else{
                res.json({code:0,msg:"删除失败"});
            }
            conn.release();
        });
    });
});

router.post("/getMenusIndex",(req,res)=>{
    pool.getConnection((err, conn) => {
        if (err) throw  err;
        let sql = "select * from menus_week A left join menus B on A.mid=B.mid LIMIT 0,6";
        conn.query(sql,(err, result) => {
            if (err) throw  err;
            res.json({code:"ok",list:result});
            conn.release();
        });
    });
});

module.exports = router;