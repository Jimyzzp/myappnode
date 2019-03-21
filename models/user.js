var db = require("../db");
function User(){

}
module.exports=User;
User.prototype.save=function(){
  var sql="";
}
User.getList=function(req,callback){
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
  db.query(sql,function(err,rows){
      if(err){
         return callback(err);
      }else {
		      callback(err,rows);
      }
  });

}
