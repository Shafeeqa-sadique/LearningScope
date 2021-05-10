/* ========================================================================== */
/*                                 USER MODELS                                */
/* ========================================================================== */

var Request     = require('tedious').Request;
var connection  = require('../helper/connection');
var common      = require('../helper/common');
const jwt             = require('jsonwebtoken');
const config          = require('../config.js');
/* ------------------------- TABLE ------------------------- */
var table       = 'TB_M_USER';

/* ------------------------- START:SELECT FROM USER TABLE ------------------------- */

/**
 * @param  {} userData
 * @param  {} callback
 */

let select = (userData, callback) => {
    
    var checkUserSql = "SELECT * FROM TB_M_USER WHERE USER_EMAIL= '" + userData.user_email +"'";
    common.exceSelect(checkUserSql, (err, result)=>{
        if(err) return callback(err);
        return callback(null, result);
    });
}

/* ------------------------- END:SELECT FROM USER TABLE ------------------------- */

/* ------------------------- START:SELECT FROM USER TABLE ------------------------- */

/**
 * @param  {} userData
 * @param  {} callback
 */

let selectByEmail = (userEmail, callback) => {
    
    var checkUserSql = `SELECT * FROM TB_M_USER WHERE USER_EMAIL= '${userEmail}'`;
    common.exceSelect(checkUserSql, (err, result)=>{
        if(err) return callback(err);
        return callback(null, result);
    });
}

/* ------------------------- END:SELECT FROM USER TABLE ------------------------- */

/* ------------------------- INSERT INTO USER TABLE ------------------------- */

/**
 * @param  {} insertData
 * @param  {} callback
 */
let insert = (insertData, callback) => {
    if(insertData) {
        var insertUserSql = `INSERT INTO ${table} (USER_EMAIL, PASSWORD, MOBILE_NO, PROVIDER, PROVIDER_ID, CRE_DT) OUTPUT INSERTED.USER_ID VALUES ('${insertData.USER_EMAIL}','${insertData.PASSWORD}','${insertData.MOBILE_NO}','${insertData.PROVIDER}','${insertData.PROVIDER_ID}', GETDATE())`;
        var request = new Request(insertUserSql,
        function(err, resp) {
            if(err) {
                return callback(err);
            };
            callback(null, resp);
        });
    
        connection.execSql(request);
    }
}

/* ------------------------- LOGIN CREDENTIALS ------------------------- */

/**
 * @param  {} insertData
 * @param  {} callback
 */
let login = (usr,pwd, callback) => {
    //console.log(usr)
    var sqlQuery = `SELECT * FROM TB_M_USER WHERE (USER_EMAIL = '${usr}' or MOBILE_NO='${usr}')`;
    //console.log(sqlQuery)
    common.exceSelect(sqlQuery, (err, result)=> {
        if(err) return common.sendFullResponse(req, res, 500, {}, err);
        if(result && result.length > 0) {
            var resData = result[0];
            //var verifyPassword = passwordHash.verify(password, result.PASSWORD);                
            let verifyPassword = false; 
            if (pwd == resData.PASSWORD) verifyPassword = true 
            else verifyPassword = false;                                
            if(verifyPassword == true){                                  
                var token = jwt.sign({ue: resData.USER_EMAIL, pd:pwd, ci: resData.CLIENT_ID, ui: resData.USER_ID },
                    config.secret,
                    { expiresIn: config.jwtet }
                );
                var userData = {
                    UI: resData.USER_ID,
                    UE: resData.USER_EMAIL,                        
                    token: token,                        
                    CI: resData.CLIENT_ID
                };
                callback(err,userData);
            } else {
                callback(err,null);
            }
        } else {
            callback(err, null);
        }
    });
}

var user = {};

user.insert             = insert;
user.select             = select;
user.selectByEmail      = selectByEmail;
user.login              = login;

module.exports = user;