DROP DATABASE IF EXISTS pinganshan;
create database pinganshan charset=utf8;
use pinganshan
set names utf8;

create table users(
    uid int primary key AUTO_INCREMENT,
    uname varchar(12) not null unique,
    upwd varchar(32) not null,
    email varchar(64) not null,
	name varchar(20) not null unique,
    phone varchar(11) not null,
    grende int,
    birthday date not null
);

insert into users values(1,'admin','admin666','88888888@pan.com','超级管理员','88888888888',888,'2018-04-15');

create table activities(
	aid int primary key AUTO_INCREMENT,
	aname varchar(64) not null unique,
	aperson_uid int not null,
	abegin date not null,
	aend date not null,
	alabel varchar(32) not null,
	amaterials text not null,
	pic_url varchar(60) not null,
	FOREIGN KEY(aperson_uid) REFERENCES users(uid)
) charset=utf8;


create table menus(
	mid int primary key AUTO_INCREMENT,
	mname varchar(64) not null,
	mmode varchar(16) not null,
	mtime int not null,
	mlabel varchar(16) not null,
	meffect varchar(16) not null,
	mintroduction TEXT not null,
	mmaterials TEXT not null,
	pic_url varchar(30)
) charset=utf8;

create table menus_week(
	mwid int primary key AUTO_INCREMENT,
	mid int not null,
	FOREIGN KEY(mid) REFERENCES menus(mid)
) charset=utf8;

create table menus_month(
	monid int primary key AUTO_INCREMENT,
	mid int not null,
	FOREIGN KEY(mid) REFERENCES menus(mid)
) charset=utf8;

create table steps(
	sid int primary key AUTO_INCREMENT,
	src varchar(128) not null,
	sdetailed TEXT,
	s_mid int not null ,
	last int,
	FOREIGN KEY(s_mid) REFERENCES menus(mid)
) charset=utf8;

create table a_menus(
	aid int primary key AUTO_INCREMENT,
	a_mode int not null,
	a_mid int not null,
	a_aid int not null,
	a_date date not null,
	FOREIGN KEY(a_aid) REFERENCES activities(aid),
	FOREIGN KEY(a_mid) REFERENCES menus(mid)
) charset=utf8;


create table works(
    wid int primary key AUTO_INCREMENT,
    wname varchar(12) not null,
    wperson int not null,
    w_activity int not null,
    wtime varchar(30) ,
	wblong varchar(20) not null,
    wfinish varchar(128) not null,
	wmaterials TEXT ,
    wstandard TEXT,
	mode int,
	FOREIGN KEY(wperson) REFERENCES users(uid),
	FOREIGN KEY(w_activity) REFERENCES activities(aid)
);

create table workers(
    wkid int primary key AUTO_INCREMENT,
    wk_uid int not null,
	wk_wid int not null,
	FOREIGN KEY(wk_uid) REFERENCES users(uid),
	FOREIGN KEY(wk_wid) REFERENCES works(wid)
);


create table workers_temporary(
    wtid int primary key AUTO_INCREMENT,
	wt_wid int not null,
	uname varchar(30) not null,
	grende int ,
	year int ,
	contact varchar(128),
	remark TEXT,
	FOREIGN KEY(wt_wid) REFERENCES works(wid)
);

create table reimbursement(
    rid int primary key AUTO_INCREMENT,
	r_uid int not null,
	food varchar(64) not null,
	price float,
	num int ,
	rtime date ,
	rplace varchar(128),
	FOREIGN KEY(r_uid) REFERENCES users(uid)
);

create table reimbursement_sign(
    r_sid int primary key AUTO_INCREMENT,
	rid int not null,
	signPerson int not null,
	FOREIGN KEY(rid) REFERENCES reimbursement(rid),
	FOREIGN KEY(signPerson) REFERENCES users(uid)
);

create table food_register(
    fid int primary key AUTO_INCREMENT,
	f_uid int not null,
	food varchar(64) not null,
	price float,
	num int ,
	remak TEXT,
	ftime date ,
	fplace varchar(128),
	FOREIGN KEY(f_uid) REFERENCES users(uid)
);


create table supply(
    sid int primary key AUTO_INCREMENT,
	s_uid int not null,
	sname varchar(64) not null,
	num int ,
	ftime date ,
	fplace varchar(128),
	FOREIGN KEY(s_uid) REFERENCES users(uid)
);


create table rice(
    rid int primary key AUTO_INCREMENT,
	r_uid int not null,
	ricenum int ,
	flournum int ,
	rtime date ,
	fsource varchar(128),
	remark TEXT,
	FOREIGN KEY(r_uid) REFERENCES users(uid)
);

create table rice_iol_statistics(
    r_iid int primary key AUTO_INCREMENT,
	ricenum int not null,
	flournum int ,
	oilnum int ,
	year int ,
	month int
);


create table day_sign (
    did int primary key AUTO_INCREMENT,
	d_uid int not null,
	dtime date ,
	FOREIGN KEY(d_uid) REFERENCES users(uid)
);

create table department (
    dpid int primary key AUTO_INCREMENT,
	dname varchar(30)
);

insert into department value(1,'总经理办公室');
insert into department value(2,' 财务部');
insert into department value(3,' 餐厅部');
insert into department value(4,' 膳食部');
insert into department value(5,' 采购部');
insert into department value(6,' 工程部');
insert into department value(7,' 营销部');
insert into department value(8,' 未分配');


create table positioner (
    pid int primary key AUTO_INCREMENT,
	poname varchar(30)
);

insert into positioner value(1,' 总经理');
insert into positioner value(2,' 经理');
insert into positioner value(3,' 主管');
insert into positioner value(4,' 员工');

create table user_department (
    u_dpid int primary key AUTO_INCREMENT,
	did int not null,
	udid int not null,
	FOREIGN KEY(did) REFERENCES department(dpid),
	FOREIGN KEY(udid) REFERENCES users(uid)
);

insert into user_department values(null,1,1);

create table user_position (
    u_pid int primary key AUTO_INCREMENT,
	p_pid int not null,
	u_uid int not null,
	FOREIGN KEY(p_pid) REFERENCES positioner(pid),
	FOREIGN KEY(u_uid) REFERENCES users(uid)
);

insert into user_position values(null,1,1);


