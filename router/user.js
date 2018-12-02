/**
 * Created by web-01 on 2018/1/25.
 */
const express = require("express");
const pool = require("pool");
const session = require("express-session");
const cookie = require("cookie-parser");
const bodyParser = require("body-parser");

var router = express.Router();

router.use(bodyParser.urlencoded({extended:false}));
router.use(cookie("boasing"));

router.use(session({
    secret:"boasing",
    resave:true,
    saveUninitialized:true,
    cookie:{maxAge:360*60*1000}
}));

router.post("/login",(req,res)=>{
    var uname = req.body.uname;
    var upwd = req.body.upwd;
    pool.getConnection((err, conn) => {
        if (err) throw  err;
        let sql = "select * from users where uname=? AND upwd=?";
        conn.query(sql, [uname, upwd], (err, result) => {
            if (err) throw err;
            if (result.length === 1) {
                req.session.uid = result[0].uid;
                res.json({code: 1, msg: "登录成功"});
            } else {
                res.json({code: 0, msg: "账号与密码不匹配"});
            }
            conn.release();
        });
    });
});

router.post("/register",(req,res)=>{
    var uname = req.body.uname;
    var upwd = req.body.upwd;
    var email = req.body.email;
    var phone = req.body.phone;
    var name = req.body.name;
    var birth = req.body.birth;
    var sex = req.body.sex;
    pool.getConnection((err,conn)=>{
        if(err) throw err;
        let sql = "insert into users value(null,?,?,?,?,?,?,?)";
        conn.query(sql,[uname,upwd,email,name,phone,sex,birth],(err,result)=>{
            if(err) throw err;
            if(result.affectedRows==1){
                var uid =  result.insertId;
                let sql = "insert into user_position value(null,?,?)";
                conn.query(sql,[4,uid],(err,result)=>{
                    if(err) throw err;
                    let sql = "insert into user_department value(null,?,?)";
                    conn.query(sql,[8,uid],(err,result)=>{
                        if(err) throw err;
                        res.json({code:1,msg:"注册成功"});
                    });
                });
            }else{
                res.json({code:0,msg:"注册失败"});
            }
            conn.release();
        });
    });
});

router.post("/checkUname",(req,res)=>{
    var uname = req.body.uname;
    pool.getConnection((err,conn)=>{
        if(err) throw err;
        let sql = "select * from users where uname=?";
        conn.query(sql,[uname],(err,result)=>{
            if(err) throw err;
            if(result.length==1){
                res.json({code:0,msg:"用户名已存在"});
            }else{
                res.json({code:1,msg:"用户名可以使用"});
            }
            conn.release();
        });
    });
});

router.get("/userdestory",(req,res)=>{
    req.session.destroy();
    res.json({code:1,msg:"注销成功"});
});


router.get("/checkLogin",(req,res)=>{
    if(req.session.uid){
        pool.getConnection((err, conn) => {
            if (err) throw  err;
            let sql = "select name from users where uid=?";
            conn.query(sql, [req.session.uid], (err, result) => {
                if (err) throw  err;
                res.json({code: 1, msg: result[0].name});
                conn.release();
            });
        });
    }else{
        res.json({code:0,msg:"未登录"});
    }
});

router.get("/getPower",(req,res)=>{
    pool.getConnection((err, conn) => {
        if (err) throw  err;
        let sql = "select p_pid from user_position where u_uid=?";
        conn.query(sql, [req.session.uid], (err, result) => {
            if (err) throw  err;
            if(result.length==0){
                res.json({code: 1, position:5 });
            }else{
                res.json({code: 1, position: result[0].p_pid});
            }
            conn.release();
        });
    });
});

router.get("/getBossList",(req,res)=>{
    pool.getConnection((err, conn) => {
        if (err) throw  err;
        let sql = "select uid,name,p_pid from user_position LEFT OUTER JOIN users ON u_uid=uid where u_uid<4 AND u_uid>1";
        conn.query(sql, (err, result) => {
            if (err) throw  err;
            res.json({code:"ok",list:result});
            conn.release();
        });
    });
});

router.get("/getAllUser",(req,res)=>{
    pool.getConnection((err, conn) => {
        if (err) throw  err;
        let sql = "select uid,name from users";
        conn.query(sql, (err, result) => {
            if (err) throw  err;
            res.json({code:"ok",list:result});
            conn.release();
        });
    });
});

router.get("/reimSign",(req,res)=>{
    var rid = req.query.rid;
    pool.getConnection((err,conn)=>{
        if(err) throw err;
        var sql = "insert into reimbursement_sign value(null,?,?)";
        conn.query(sql,[rid,req.session.uid],(err,result)=>{
            if(err) throw err;
            if(err) throw err;
            if(result.affectedRows==1){
                res.json({code:1,msg:"签名成功"});
            }else{
                res.json({code:0,msg:"签名失败"});
            }
            conn.release();
        });
    })
})


router.post("/signDay",(req,res)=>{
    var now = new Date();
    var time = now.getFullYear()+"-"+(now.getMonth()+1)+"-"+now.getDate();
    pool.getConnection((err,conn)=>{
        if(err) throw err;
        var sql = "insert into day_sign value(null,?,?)";
        conn.query(sql,[req.session.uid,time],(err,result)=>{
            if(err) throw err;
            if(err) throw err;
            if(result.affectedRows==1){
                res.json({code:1,msg:"签到成功"});
            }else{
                res.json({code:0,msg:"签到失败"});
            }
            conn.release();
        });
    });
});



router.get("/checkSign",(req,res)=>{
    var now = new Date();
    var time = now.getFullYear()+"-"+(now.getMonth()+1)+"-"+now.getDate();
    pool.getConnection((err,conn)=>{
        if(err) throw err;
        var sql = "select * from day_sign where d_uid=? AND dtime=?";
        conn.query(sql,[req.session.uid,time],(err,result)=>{
            if(err) throw err;
            if(result.length!=0){
                res.json({code:1,msg:"已经签到"});
            }else{
                res.json({code:0,msg:"未签到"});
            }
            conn.release();
        });
    });
});

router.post("/getDetialUser",(req,res)=>{
    var uid = req.body.uid;
    pool.getConnection((err,conn)=>{
        if(err) throw err;
        var sql = "select * FROM users LEFT JOIN user_department ON uid = udid LEFT JOIN department ON did=dpid LEFT JOIN user_position ON uid = u_uid LEFT JOIN positioner ON p_pid = pid where uid=?";
        conn.query(sql,[uid],(err,result)=>{
            if(err) throw err;
                res.json({code:1,data:result});
            conn.release();
        });
    });
});

router.post("/getUserMsg",(req,res)=>{
    pool.getConnection((err,conn)=>{
        if(err) throw err;
        var sql = "select uid,uname,name,dname,poname FROM users LEFT JOIN user_department ON uid = udid LEFT JOIN department ON did=dpid LEFT JOIN user_position ON uid = u_uid LEFT JOIN positioner ON p_pid = pid";
        conn.query(sql,(err,result)=>{
            if(err) throw err;
            res.json({code:1,data:result});
            conn.release();
        });
    });
});

router.post("/editBefore",(req,res)=>{
    var uid = parseInt(req.query.uid);
    pool.getConnection((err,conn)=>{
        if(err) throw err;
        var sql = "select * from user_position where u_uid = ? UNION ALL select * from user_position where u_uid = ?";
        conn.query(sql,[req.session.uid,uid],(err,result)=>{
            if(err) throw err;
            if((result[0].p_pid<=3&&result[0].p_pid<result[1].p_pid)||uid==req.session.uid){
                var sql = "select * FROM users where uid=?";
                conn.query(sql,[uid],(err,result)=>{
                    if(err) throw err;
                    res.json({code:1,data:result});
                    conn.release();
                });
            }else{
                res.json({code:0,msg:"对不起你并没有权限"});
            }
        });
    });
});

router.post("/edit",(req,res)=>{
    var uid = req.body.uid;
    var name = req.body.name;
    var upwd = req.body.upwd;
    var email = req.body.email;
    var phone = req.body.phone;
    pool.getConnection((err,conn)=>{
        if(err) throw err;
        var sql = "select * from user_position where u_uid = ? UNION ALL select * from user_position where u_uid = ?";
        conn.query(sql,[req.session.uid,uid],(err,result)=>{
            if(err) throw err;
            if((result[0].p_pid<=3&&result[0].p_pid<result[1].p_pid)||uid==req.session.uid){
                var sql = "update users set upwd=?,email=?,name=?,phone=? where uid =?;";
                conn.query(sql,[upwd,email,name,phone,uid],(err,result)=>{
                    if(err) throw err;
                    if(result.affectedRows==1){
                        res.json({code:1,msg:"修改成功"});
                    }else{
                        res.json({code:1,msg:"修改失败"});
                    }
                    conn.release();
                });
            }else{
                res.json({code:0,msg:"对不起你并没有权限"});
            }
        });
    });
});


router.post("/powerBefore",(req,res)=>{
    var uid = parseInt(req.query.uid);
    if(req.session.uid!=uid){
        pool.getConnection((err,conn)=>{
            if(err) throw err;
            var sql = "select * from user_position where u_uid = ? UNION ALL select * from user_position where u_uid = ?";
            conn.query(sql,[req.session.uid,uid],(err,result)=>{
                if(err) throw err;
                if(result[0].p_pid<=3&&result[0].p_pid<result[1].p_pid){
                    var sql = "select * from user_department left join user_position on udid=u_uid  where udid = ?";
                    conn.query(sql,[uid],(err,result1)=> {
                        if (err) throw err;
                        conn.release();
                        res.json({code:1,data:result1,power:result[0].p_pid});
                    });
                }else{
                    res.json({code:0,msg:"对不起你并没有权限"});
                }
            });
        });
    }else{
        res.json({code:0,msg:"对不起你并没有权限"});
    }
});

router.post("/setPower",(req,res)=>{
    var uid = req.body.uid;
    var pid = req.body.pid;
    var did = req.body.did;
    if(req.session.uid!=uid){
        pool.getConnection((err,conn)=>{
            if(err) throw err;
            var sql = "select * from user_position where u_uid = ?";
            conn.query(sql,[req.session.uid],(err,result)=>{
                if(err) throw err;
                if(result[0].p_pid<=3&&result[0].p_pid<pid){
                    var sql = "update user_position set p_pid=? where u_uid =?";
                    conn.query(sql,[pid,uid],(err,result1)=> {
                        if (err) throw err;
                            var sql = "update user_department set did=? where udid =?";
                            conn.query(sql,[did,uid],(err,result1)=> {
                                if (err) throw err;
                                res.json({code:1,msg:"修改成功"});
                                conn.release();
                            });
                    });
                }else{
                    res.json({code:0,msg:"对不起,您的权限不够"});
                }
            });
        });
    }else{
        res.json({code:0,msg:"对不起你并没有权限"});
    }
});


router.get("/getDepartment",(req,res)=>{
    pool.getConnection((err,conn)=>{
        if(err) throw err;
        var sql = "select * from department";
        conn.query(sql,(err,result)=>{
            if(err) throw err;
            res.json({code:1,data:result});
            conn.release();
        });
    });
});

router.get("/getPositioner",(req,res)=>{
    pool.getConnection((err,conn)=>{
        if(err) throw err;
        var sql = "select * from positioner";
        conn.query(sql,(err,result)=>{
            if(err) throw err;
            res.json({code:1,data:result});
            conn.release();
        });
    });
});

router.post("/powerBefore",(req,res)=>{
    var uid = parseInt(req.query.uid);
    if(req.session.uid!=uid){
        pool.getConnection((err,conn)=>{
            if(err) throw err;
            var sql = "select * from user_position where u_uid = ? UNION ALL select * from user_position where u_uid = ?";
            conn.query(sql,[req.session.uid,uid],(err,result)=>{
                if(err) throw err;
                if(result[0].p_pid<=3&&result[0].p_pid<result[1].p_pid){
                    var sql = "select * from user_department left join user_position on udid=u_uid  where udid = ?";
                    conn.query(sql,[uid],(err,result)=> {
                        if (err) throw err;
                        conn.release();
                        res.json({code:1,data:result});
                    });
                }else{
                    res.json({code:0,msg:"对不起你并没有权限"});
                }
            });
        });
    }else{
        res.json({code:0,msg:"对不起你并没有权限"});
    }
});

router.get("/getSignList",(req,res)=>{
    pool.getConnection((err,conn)=>{
        if(err) throw err;
        var sql = "select * from day_sign where d_uid=?";
        conn.query(sql,[req.session.uid],(err,result)=>{
            if(err) throw err;
            res.json({code:1,data:result});
            conn.release();
        });
    });
});

module.exports = router;