var express = require('express');
var request = require('request');
var router = express.Router();
var db = require("../db");
var Partner=require('../models/partner');
var xmlreader = require("xmlreader");
var fs = require("fs");
var wxpay = require('../models/wxpay');
var appid = 'wx336c381b82f01bba';
var appsecret = 'ee19ed7b8116cbd540f6772a952ffc30';
var mchid = '1481199952'
var mchkey = 'ee19ed7b8116cbd540f6772a952ffc30';
var wxurl = 'https://p6gihf4p.qcloud.la/weixinNotify';
router.post('/pay', (req, res) => {
	//首先拿到前端传过来的参数
	let orderCode = req.query.orderNo;
	//let money = req.query.money;
//	let orderID = req.query.orderID;
//	console.log('APP传过来的参数是', orderCode + '----' + money + '------' + orderID + '----' + appid + '-----' + appsecret + '-----' + mchid + '-----' + mchkey);

	//首先生成签名sign

	//appid
	let mch_id = mchid;
	let nonce_str = wxpay.createNonceStr();
	let timestamp = wxpay.createTimeStamp();
	let body = '测试微信支付';
	let out_trade_no = orderCode;
	let total_fee = wxpay.getmoney(0.5);
	//let spbill_create_ip = req.connection.remoteAddress;
	let spbill_create_ip ='https://p6gihf4p.qcloud.la';
	let notify_url = wxurl;
	let trade_type = 'NATIVE';
	let sign = wxpay.paysignjsapi(appid, body, mch_id, nonce_str, notify_url, out_trade_no, spbill_create_ip, total_fee, trade_type, mchkey);
	console.log('sign==', sign);
	//组装xml数据
	var formData = "<xml>";
	formData += "<appid>" + appid + "</appid>"; //appid
	formData += "<body><![CDATA[" + "测试微信支付" + "]]></body>";
	formData += "<mch_id>" + mch_id + "</mch_id>"; //商户号
	formData += "<nonce_str>" + nonce_str + "</nonce_str>"; //随机字符串，不长于32位。
	formData += "<notify_url>" + notify_url + "</notify_url>";
	formData += "<out_trade_no>" + out_trade_no + "</out_trade_no>";
	formData += "<spbill_create_ip>" + spbill_create_ip + "</spbill_create_ip>";
	formData += "<total_fee>" + total_fee + "</total_fee>";
	formData += "<trade_type>" + trade_type + "</trade_type>";
	formData += "<sign>" + sign + "</sign>";
	formData += "</xml>";
	console.log('formData===', formData);
	var url = 'https://api.mch.weixin.qq.com/pay/unifiedorder';
	request({
		url: url,
		method: 'POST',
		body: formData
	}, function(err, response, body) {
    console.log("进入微信请求"+response.xml)
		if(!err && response.statusCode == 200) {
			xmlreader.read(body.toString("utf-8"), function(errors, response) {
				if(null !== errors) {
					console.log(errors)
					return;
				}
			//	console.log('长度===', response.xml.prepay_id.text().length);
				var prepay_id = response.xml.prepay_id();
				console.log('解析后的prepay_id==', prepay_id);
				//将预支付订单和其他信息一起签名后返回给前端
				let finalsign = wxpay.paysignjsapifinal(appid, mch_id, prepay_id, nonce_str, timestamp, mchkey);
				res.json({
					'appId': appid,
					'partnerId': mchid,
					'prepayId': prepay_id,
					'nonceStr': nonce_str,
					'timeStamp': timestamp,
					'package': 'Sign=WXPay',
					'sign': finalsign
				});
			});
		}
	});
})
router.get('/weixinNotify', function(req, res, next) {
	console.log("支付成功")
  //res.render('index', { title: 'fffffffffffffff' });
});
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'node数据库' });
});
router.get('/about', function(req, res) {
  res.send('About birds');
});
router.post('/login', function(req,res,next) {
  var userName=req.body.userName;
  var password=req.body.password
  var sql = `SELECT * FROM t_system_user where 1=1 `;
  if(userName != null && userName != ''){
    sql+=` and user_name = '${userName}' `;
  }
  db.query(sql,function(err,rows){
     if(err){
     res.send({datas:rows});
     }else {
       if(rows.length==0){
         res.send({code:'404',message:'没有该用户'});
       }else if(rows[0].password!=password){
          res.send({code:'500',message:'你输入的密码有误'});
       }else{
         res.send({code:'200',message:rows});
       }
     }
  });
});


///partner/partnerinfo/page
router.post("/partner/partnerinfo/page",function(req,res,next){
  Partner.getList(req,function(err,rows){
    if(err){
           return next(err);
       }else {
       	res.send({datas:rows});
       }
  })
});
router.post("/partner/partnerinfo/get/:id",function(req,res,next){
  Partner.getById(req,function(err,rows){
    if(err){
           return next(err);
       }else {
       	   res.send({rows});
       }
  })
});
router.post("/partner/partnerinfo/add",function(req,res,next){
  Partner.add(req,function(err,rows){
    if(err){
           return next(err);
       }else {
       	   res.send({datas:rows});
       }
  })
});

router.post("/partner/partnerinfo/delete/:id",function(req,res){
    Partner.delete(req,function(err,rows){
    if(err){
           return next(err);
       }else {
       	   res.send({datas:rows});
       }
  	})
});
router.post("/partner/partnerinfo/update/:id",function(req,res,next){
   Partner.update(req,function(err,rows){
    if(err){
           return next(err);
       }else {
       	   res.send({datas:rows});
       }
  	})
});


/**
 * 查询
 */
router.post("/search",function(req,res,next){
    var name = req.body.s_name;
    var age = req.body.s_age;
    var sql = "select * from userinfo";
    if(name){
        sql += " where name = '"+ name +"'";
    }
    //if(age){
    //    sql += " and age = '" + age + "'";
    //}

    sql.replace("and","where");
    db.query(sql,function(err,rows){
        if(err){
            res.send("查询失败: "+err);
        }else{
            res.render("users",{title:"用户列表",datas:rows,s_name:name,s_age:age});
        }
    });
})
router.post("/article",function(req,res,next){
	 var page=req.body.page;
	 var pagesize=2;
	 var start=page*pagesize;
	 var totalpage=0;
	 db.query('SELECT COUNT(id) as num FROM article',function(err,rows){
		 if(err){
			   res.send({code:'500',message:"查询失败: "+err});
		 }else{
         totalpage=rows[0].num;
         var sql =`select * from article limit ${start}, ${pagesize}`;
				 db.query(sql,function(err,rows){
						 if(err){
								 res.send({code:'500',message:"查询失败: "+err});
						 }else{
								res.send({totalpage:totalpage,datas:rows});
						 }
				 });

		 }
	 })
})

router.get("/article/detail",function(req,res){
	var id = req.query.id;
	 var sql = `SELECT article.title,article_detail.content  FROM article, article_detail WHERE article.id= article_detail.acticleId AND article_detail.acticleId=${id}`;
	 db.query(sql,function(err,rows){
			 if(err){
					 res.send({code:'500',message:"查询失败: "+err});
			 }else {
					res.send({datas:rows});
			 }
	 });
});
router.get("/account",function(req,res,next){
         var sql =`select * from ll_account`;
				 db.query(sql,function(err,rows){
						 if(err){
								 res.send({code:'500',message:"查询失败: "+err});
						 }else{
								res.send({datas:rows});
						 }
				 });
	 })
module.exports = router;
