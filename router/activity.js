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

router.post("/addActivity",(req,res)=>{
    var aname=req.body.aname;
    var aperson=req.body.aperson;
    var abegin=req.body.abegin;
    var aend=req.body.aend;
    var alabel=req.body.alabel;
    var amaterials=req.body.amaterials;
    var pic_url = req.body.pic_url;
    var menus=JSON.parse(req.body.menus);
    var menuS = [];
    pool.getConnection((err,conn)=>{
        if(err) throw err;
        let sql = "insert into activities value(null,?,?,?,?,?,?,?)";
        conn.query(sql,[aname,aperson,abegin,aend,alabel,amaterials,pic_url],(err,result)=>{
            if(err) throw err;
            if(result.affectedRows==1){
                var aid = result.insertId;
                for(index in menus){
                    menuS.push([null,menus[index].mode,menus[index].mid,aid,menus[index].date]);
                }
                let sql = "insert into a_menus value ?";
                conn.query(sql,[menuS],(err,result)=>{
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


router.get("/geMenus",(req,res)=>{
    pool.getConnection((err, conn) => {
        if (err) throw  err;
        let sql = "select mid,mname from menus";
        conn.query(sql, (err, result) => {
            if (err) throw  err;
            res.json({code:"ok",list:result});
            conn.release();
        });
    });
});


router.get("/getAllActivity",(req,res)=>{
    pool.getConnection((err, conn) => {
        if (err) throw  err;
        let sql = "select aid,aname from activities";
        conn.query(sql, (err, result) => {
            if (err) throw  err;
            res.json({code:"ok",list:result});
            conn.release();
        });
    });
});


router.get("/getActivityIndex",(req,res)=>{
    pool.getConnection((err, conn) => {
        if (err) throw  err;
        var now = new Date();
        var time = now.getFullYear()+"-"+(now.getMonth()+1)+"-"+now.getDate();
        let sql = "select * from activities where ?<aend LIMIT 0,6";
        conn.query(sql,[time],(err,result) => {
            if (err) throw  err;
            res.json({code:"ok",list:result});
            conn.release();
        });
    });
});



router.post("/uploadImg",(req,res)=>{
    var index = req.query.index || "0";
    var form = new formidable.IncomingForm();
    form.encoding = 'utf-8';
    form.uploadDir = '../pinganshan/static/images/activity' ;   //设置上路径
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


router.post("/getActivity",(req,res)=>{
    pool.getConnection((err, conn) => {
        if (err) throw  err;
        let sql = "select * from activities";
        conn.query(sql, (err, result) => {
            if (err) throw  err;
            result.map((item,index)=>{
                item.abegin = item.abegin.getFullYear()+"-"+(item.abegin.getMonth()+1)+"-"+item.abegin.getDate();
                item.aend = item.aend.getFullYear()+"-"+(item.aend.getMonth()+1)+"-"+item.aend.getDate();
            });
            res.json({code:"ok",list:result});
            conn.release();
        });
    });
});


router.post("/getOneActivity",(req,res)=>{
    var aid = parseInt(req.body.aid);
    pool.getConnection((err, conn) => {
        if (err) throw  err;
        let sql = "select * from activities where aid = ?";
        conn.query(sql,[aid],(err, result) => {
            if (err) throw  err;
            result.map((item,index)=>{
                item.abegin = item.abegin.getFullYear()+"-"+(item.abegin.getMonth()+1)+"-"+item.abegin.getDate();
                item.aend = item.aend.getFullYear()+"-"+(item.aend.getMonth()+1)+"-"+item.aend.getDate();
            });
            res.json({code:"ok",data:result});
            conn.release();
        });
    });
});


router.post("/getActivityMenus",(req,res)=>{
    var aid = parseInt(req.body.aid);
    pool.getConnection((err, conn) => {
        if (err) throw  err;
        let sql = "select a_mode,a_mid,a_aid,a_date,mname from a_menus left join menus on a_mid=mid  where a_aid = ? order by a_date asc ";
        conn.query(sql,[aid],(err, result) => {
            if (err) throw  err;
            res.json({code:"ok",data:result});
            conn.release();
        });
    });
});

router.post("/getActivityWork",(req,res)=>{
    var aid = parseInt(req.body.aid);
    pool.getConnection((err,conn)=>{
        if(err) throw err;
        let sql = "select * from works where w_activity=?";
        conn.query(sql,[aid],(err,result)=>{
            if(err) throw err;
            result.map((item,index)=>{
                item.personMsg = "loading...";
                item.personsMsg = "loading...";
            });
            res.json({code:1,data:result});
            conn.release();
        });
    });
});


router.post("/delActivity",(req,res)=>{
    var aid = req.body.aid;
    pool.getConnection((err, conn) => {
        if (err) throw  err;
        let sql = "select * from works where w_activity=?";
        conn.query(sql,[aid],(err, result) => {
            if (err) throw  err;
            if(result.length!=0){
                var wid = result[0].wid ;
                var mode = result[0].mode ;
            }else{
                var wid = 0;
                var mode =0;
            }
            let sql = mode==1?"delete from workers where wk_wid=?":"delete from workers_temporary where wt_wid=?";
            conn.query(sql,[wid],(err,result)=>{
                if(err) throw err;
                let sql ="delete from works where wid=?";
                conn.query(sql,[wid],(err,result)=>{
                    if(err) throw err;
                    let sql ="delete from a_menus where a_aid=?";
                    conn.query(sql,[aid],(err,result)=>{
                        if(err) throw err;
                        let sql ="delete from activities where aid=?";
                        conn.query(sql,[aid],(err,result)=>{
                            if(err) throw err;
                            res.json({code:1,msg:"删除成功"});
                            conn.release();
                        });
                    });
                });
            });
        });
    });
});

module.exports = router;