/**
 * Created by web-01 on 2018/1/31.
 */
const express = require("express");
const pool = require("pool");
const fs = require("fs");
var router = express.Router();
const bodyParser = require("body-parser");
router.use(bodyParser.urlencoded({extended:false}));

router.post("/addworkGroup",(req,res)=>{
    var wname=req.body.wname;
    var wperson=req.body.wperson;
    var w_activity=req.body.w_activity;
    var wtime=req.body.wtime;
    var wblong=req.body.wblong;
    var wfinish=req.body.wfinish;
    var wmaterials=req.body.wmaterials;
    var wstandard = req.body.wstandard;
    var worker=JSON.parse(req.body.worker);
    var workerS = [];
    console.log(wname,wperson,w_activity,wtime,wblong,wfinish,wmaterials,wstandard,worker);
    pool.getConnection((err,conn)=>{
        if(err) throw err;
        let sql = "insert into works value(null,?,?,?,?,?,?,?,?,1)";
        conn.query(sql,[wname,wperson,w_activity,wtime,wblong,wfinish,wmaterials,wstandard],(err,result)=>{
            if(err) throw err;
            if(result.affectedRows==1){
                var wid = result.insertId;
                for(index in worker){
                    workerS.push([null,worker[index],wid]);
                }
                let sql = "insert into workers value ?";
                conn.query(sql,[workerS],(err,result)=>{
                    if(err) throw err;
                    if(result.affectedRows!=0){
                        res.json({code:1,msg:"添加成功"});
                    }else{
                        res.json({code:0,msg:"添加失败"});
                    }
                    conn.release();
                });
                console.log(worker);
            }else{
                res.json({code:0,msg:"添加失败"});
                conn.release();
            }
        });
    });
});

router.post("/addworkTGroup",(req,res)=>{
    var wname=req.body.wname;
    var wperson=req.body.wperson;
    var w_activity=req.body.w_activity;
    var wtime=req.body.wtime;
    var wblong=req.body.wblong;
    var wfinish=req.body.wfinish;
    var wmaterials=req.body.wmaterials;
    var wstandard = req.body.wstandard;
    var worker=JSON.parse(req.body.worker);
    var workerS = [];
    pool.getConnection((err,conn)=>{
        if(err) throw err;
        let sql = "insert into works value(null,?,?,?,?,?,?,?,?,0)";
        conn.query(sql,[wname,wperson,w_activity,wtime,wblong,wfinish,wmaterials,wstandard],(err,result)=>{
            if(err) throw err;
            if(result.affectedRows==1){
                var wid = result.insertId;
                for(index in worker){
                    workerS.push([null,wid,worker[index].name,worker[index].sex,worker[index].year,worker[index].contact,worker[index].remark]);
                }
                let sql = "insert into workers_temporary value ?";
                conn.query(sql,[workerS],(err,result)=>{
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

router.get("/getWorkList",(req,res)=>{
    pool.getConnection((err,conn)=>{
        if(err) throw err;
        let sql = "select * from works";
        conn.query(sql,(err,result)=>{
            if(err) throw err;
            result.map((item,index)=>{
                item.personMsg = "loading...";
                item.personsMsg = "loading...";
                item.activityMsg = "loading...";
            });
            res.json({code:1,data:result});
            conn.release();
        });
    });
});

router.get("/getPerson",(req,res)=>{
    var uid = req.query.uid;
    pool.getConnection((err,conn)=>{
        if(err) throw err;
        let sql = "select name from users where uid=?";
        conn.query(sql,[uid],(err,result)=>{
            if(err) throw err;
            res.json({code:1,msg:result[0].name});
            conn.release();
        });
    });
});

router.get("/getAName",(req,res)=>{
    var aid = req.query.aid;
    pool.getConnection((err,conn)=>{
        if(err) throw err;
        let sql = "select * from activities where aid=?";
        conn.query(sql,[aid],(err,result)=>{
            if(err) throw err;
            res.json({code:1,msg:result[0].aname});
            conn.release();
        });
    });
});

router.get("/getPersons",(req,res)=>{
    var mode = req.query.mode;
    var wid = req.query.wid;
    pool.getConnection((err,conn)=>{
        if(err) throw err;
        let sql = mode==1?"select name from workers LEFT JOIN users ON wk_uid=uid where wk_wid=?":"select uname from workers_temporary where wt_wid=?";
        conn.query(sql,[wid],(err,result)=>{
            if(err) throw err;
            res.json({code:1,data:result});
            conn.release();
        });
    });
});


router.get("/deleteWork",(req,res)=>{
    var mode = req.query.mode;
    var wid = req.query.wid;
    pool.getConnection((err,conn)=>{
        if(err) throw err;
        let sql = mode==1?"delete from workers where wk_wid=?":"delete from workers_temporary where wt_wid=?";
        conn.query(sql,[wid],(err,result)=>{
            if(err) throw err;
            let sql ="delete from works where wid=?";
            conn.query(sql,[wid],(err,result)=>{
                if(err) throw err;
                res.json({code:1,msg:"删除成功"});
                conn.release();
            });
        });
    });
});

module.exports = router;