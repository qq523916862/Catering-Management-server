/**
 * Created by web-01 on 2018/1/31.
 */
const express = require("express");
const pool = require("pool");


var router = express.Router();


router.post("/reimbursement",(req,res)=>{
    var uid = req.body.uid;
    var food = req.body.food;
    var price = req.body.price;
    var num = req.body.num;
    var rtime = req.body.rtime;
    var rplace = req.body.rplace;
    pool.getConnection((err,conn)=>{
        if(err) throw err;
        let sql = "insert into reimbursement value(null,?,?,?,?,?,?)";
        conn.query(sql,[uid,food,price,num,rtime,rplace],(err,result)=>{
            if(err) throw err;
            if(result.affectedRows==1){
                res.json({code:1,msg:"添加成功"});
            }else{
                res.json({code:0,msg:"添加失败"});
            }
            conn.release();
        });
    });
});

router.post("/foodRegister",(req,res)=>{
    var uid = req.body.uid;
    var food = req.body.food;
    var price = req.body.price;
    var num = req.body.num;
    var remark = req.body.remark;
    var ftime = req.body.ftime;
    var fplace = req.body.fplace;
    pool.getConnection((err,conn)=>{
        if(err) throw err;
        let sql = "insert into food_register value(null,?,?,?,?,?,?,?)";
        conn.query(sql,[uid,food,price,num,remark,ftime,fplace],(err,result)=>{
            if(err) throw err;
            if(result.affectedRows==1){
                res.json({code:1,msg:"添加成功"});
            }else{
                res.json({code:0,msg:"添加失败"});
            }
            conn.release();
        });
    });
});


router.post("/supply",(req,res)=>{
    var uid = req.body.uid;
    var name = req.body.name;
    var num = req.body.num;
    var ftime = req.body.ftime;
    var fplace = req.body.fplace;
    pool.getConnection((err,conn)=>{
        if(err) throw err;
        let sql = "insert into supply value(null,?,?,?,?,?)";
        conn.query(sql,[uid,name,num,ftime,fplace],(err,result)=>{
            if(err) throw err;
            if(result.affectedRows==1){
                res.json({code:1,msg:"添加成功"});
            }else{
                res.json({code:0,msg:"添加失败"});
            }
            conn.release();
        });
    });
});

router.post("/rice",(req,res)=>{
    var uid = req.body.uid;
    var ricenum = req.body.ricenum;
    var flournum = req.body.flournum;
    var rtime = req.body.rtime;
    var fsource = req.body.rsource;
    var remark = req.body.remark;
    pool.getConnection((err,conn)=>{
        if(err) throw err;
        let sql = "insert into rice value(null,?,?,?,?,?,?)";
        conn.query(sql,[uid,ricenum,flournum,rtime,fsource,remark],(err,result)=>{
            if(err) throw err;
            if(result.affectedRows==1){
                res.json({code:1,msg:"添加成功"});
            }else{
                res.json({code:0,msg:"添加失败"});
            }
            conn.release();
        });
    });
});

router.post("/riceyear",(req,res)=>{
    var ricenum = req.body.ricenum;
    var flournum = req.body.flournum;
    var oilnum = req.body.oilnum;
    var ryear = req.body.ryear;
    var rmonth = req.body.rmonth;
    pool.getConnection((err,conn)=>{
        if(err) throw err;
        let sql = "insert into rice_iol_statistics value(null,?,?,?,?,?)";
        conn.query(sql,[ricenum,flournum,oilnum,ryear,rmonth],(err,result)=>{
            if(err) throw err;
            if(result.affectedRows==1){
                res.json({code:1,msg:"添加成功"});
            }else{
                res.json({code:0,msg:"添加失败"});
            }
            conn.release();
        });
    });
});

router.get("/checkName",(req,res)=>{
    var name = req.query.uname;
    pool.getConnection((err,conn)=>{
        if(err) throw err;
        var sql = "select * from users where name=?";
        conn.query(sql,[name],(err,result)=>{
            if(err) throw err;
            if(result.length!=0){
                res.json({code:1,msg:result[0].uid});
            }else{
                res.json({code:0,msg:"员工不存在"});
            }
            conn.release();
        });
    })
});

router.get("/checkMonth",(req,res)=>{
    var year = req.query.year;
    var month = req.query.month;
    pool.getConnection((err,conn)=>{
        if(err) throw err;
        var sql = "select * from rice_iol_statistics where year=? AND month=?";
        conn.query(sql,[year,month],(err,result)=>{
            if(err) throw err;
            if(result.length==0){
                res.json({code:1,msg:"该月份未添加"});
            }else{
                res.json({code:0,msg:"该月份已经添加"});
            }
            conn.release();
        });
    })
});

router.get("/reimbursementCount",(req,res)=>{
    pool.getConnection((err,conn)=>{
        if(err) throw err;
        var sql = "select count(*) AS count from reimbursement ";
        conn.query(sql,(err,result)=>{
            if(err) throw err;
            res.json({code:"ok",count:result[0].count});
            conn.release();
        });
    })
});

router.get("/getReimbursement",(req,res)=>{
    var page = req.query.page;
    var start = (page-1)*20;

    pool.getConnection((err,conn)=>{
        if(err) throw err;
        var sql = "select rid,food,price,num,rtime,rplace,name from reimbursement LEFT OUTER JOIN users ON r_uid=uid order by rtime DESC LIMIT ?,20";
        conn.query(sql,start,(err,result)=>{
            if(err) throw err;
            conn.query("select rid,signPerson,name AS signName from reimbursement_sign LEFT OUTER JOIN users ON signPerson=uid",(err,result1)=> {
                if (err) throw err;
                result.map((item,index)=>{
                    item.signName="未通过";
                    for(item1 of result1){
                        if(item.rid==item1.rid){
                            item.signName=item1.signName;
                        }
                    }
                });
                res.json({code:"ok",data:result});
            });
            conn.release();
        });
    })
});


router.get("/reimbursement",(req,res)=>{
    pool.getConnection((err,conn)=>{
        if(err) throw err;
        var sql = "select * from music_index_hot LIMIT 0,20";
        conn.query(sql,(err,result)=>{
            if(err) throw err;
            res.json(result);
            conn.release();
        });
    })
})

router.get("/foodRegisterCount",(req,res)=>{
    pool.getConnection((err,conn)=>{
        if(err) throw err;
        var sql = "select count(*) AS count from food_register ";
        conn.query(sql,(err,result)=>{
            if(err) throw err;
            res.json({code:"ok",count:result[0].count});
            conn.release();
        });
    })
});

router.get("/getfoodRegister",(req,res)=>{
    var page = req.query.page;
    var start = (page-1)*20;

    pool.getConnection((err,conn)=>{
        if(err) throw err;
        var sql = "select fid,food,price,num,ftime,fplace,remak,name from food_register LEFT OUTER JOIN users ON f_uid=uid order by ftime DESC LIMIT ?,20";
        conn.query(sql,start,(err,result)=>{
            if(err) throw err;
            res.json({code:"ok",data:result});
            });
            conn.release();
    });
});

router.get("/supplyCount",(req,res)=>{
    pool.getConnection((err,conn)=>{
        if(err) throw err;
        var sql = "select count(*) AS count from supply ";
        conn.query(sql,(err,result)=>{
            if(err) throw err;
            res.json({code:"ok",count:result[0].count});
            conn.release();
        });
    })
});

router.get("/getSupply",(req,res)=>{
    var page = req.query.page;
    var start = (page-1)*20;

    pool.getConnection((err,conn)=>{
        if(err) throw err;
        var sql = "select sid,sname,num,ftime,fplace,name from supply LEFT OUTER JOIN users ON s_uid=uid order by ftime DESC LIMIT ?,20";
        conn.query(sql,start,(err,result)=>{
            if(err) throw err;
            res.json({code:"ok",data:result});
        });
        conn.release();
    });
});

router.get("/riceCount",(req,res)=>{
    pool.getConnection((err,conn)=>{
        if(err) throw err;
        var sql = "select count(*) AS count from rice ";
        conn.query(sql,(err,result)=>{
            if(err) throw err;
            res.json({code:"ok",count:result[0].count});
            conn.release();
        });
    })
});

router.get("/getRice",(req,res)=>{
    var page = req.query.page;
    var start = (page-1)*20;

    pool.getConnection((err,conn)=>{
        if(err) throw err;
        var sql = "select rid,ricenum,flournum,rtime,fsource,remark,name from rice LEFT OUTER JOIN users ON r_uid=uid order by rtime DESC LIMIT ?,20";
        conn.query(sql,start,(err,result)=>{
            if(err) throw err;
            res.json({code:"ok",data:result});
        });
        conn.release();
    });
});

router.get("/riceYearCount",(req,res)=>{
    pool.getConnection((err,conn)=>{
        if(err) throw err;
        var sql = "select count(*) AS count from rice_iol_statistics ";
        conn.query(sql,(err,result)=>{
            if(err) throw err;
            res.json({code:"ok",count:result[0].count});
            conn.release();
        });
    })
});

router.get("/getRiceYear",(req,res)=>{
    var page = req.query.page;
    var start = (page-1)*20;

    pool.getConnection((err,conn)=>{
        if(err) throw err;
        var sql = "select * from rice_iol_statistics order by year,month DESC LIMIT ?,20";
        conn.query(sql,start,(err,result)=>{
            if(err) throw err;
            res.json({code:"ok",data:result});
        });
        conn.release();
    });
});

module.exports = router;