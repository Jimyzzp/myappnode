var db = require("../db");
function Partner(){

}
module.exports=Partner;
Partner.prototype.save=function(){
  var sql="";
}
Partner.getList=function(req,callback){
  var currentPage = req.query.currentPage;
  var pageSize = req.query.pageSize;
  var sortName = req.query.sortName;
  var sortType = req.query.sortType;
  var likePartnerName=req.body.likePartnerName;
  var sql = `SELECT * FROM t_partner_info where 1=1 `;
  if(likePartnerName != null && likePartnerName != ''){
    sql+=` and partner_name LIKE '%${likePartnerName}%' `;
  }
  sql+=`ORDER BY ${sortName}  ${sortType}  LIMIT ${currentPage},${pageSize}  `;
  console.log(sql);
  db.query(sql,function(err,rows){
      if(err){
         return callback(err);
      }else {
		      callback(err,rows);
      }
  });
}
Partner.getById=function(req,callback){
 var id = req.params.id;
  var sql = `SELECT * FROM t_partner_info where id=${id}`;
  db.query(sql,function(err,rows){
      if(err){
         return callback(err);
      }else {
		      callback(err,rows);
      }
  });
}
Partner.add=function(req,callback){
    var partner_name=req.body.partnerName;
    	console.log(partner_name)
    var sql="insert into t_partner_info(partner_name,company_id) values('"+partner_name+"','"+ 18 +"')";
    console.log(sql)
    db.query(sql,function(err,rows){
    	console.log(rows)
        if(err){
            return callback(err);
        }else {
           callback(err,rows);
        }
    });
}
Partner.delete=function(req,callback){
    var id = req.params.id;
    db.query("delete from t_partner_info where id = " + id,function(err,rows){
        if(err){
             return callback(err);
        }else {
            callback(err,rows);
        }
    });
}

Partner.update=function(req,callback){
    var id = req.params.id;
    var partner_name = req.body.partnerName;
    var sql = "update t_partner_info set partner_name = '"+ partner_name +"' where id = " + id;
    console.log(sql);
    db.query(sql,function(err,rows){
        if(err){
            res.send("修改失败 " + err);
        }else {
            callback(err,rows);
        }
    });
};