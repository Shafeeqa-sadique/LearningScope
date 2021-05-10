/* ========================================================================== */
/*                        COMMON FILE TO SEND RESPONSE                        */
/* ========================================================================== */

var Request         = require('tedious').Request;
var pool            = require('./connection-pool'); 
var logger          = require('logger').createLogger('error.log');
var fs              = require('fs');
const jwt             = require('jsonwebtoken');

/* ------------------------------ SEND RESPONSE ----------------------------- */

var sqlErrorMessage = 'Sorry! SQL Exception occurred!';

/**
 * @param  {} req
 * @param  {} res
 * @param  {} code
 * @param  {} data
 * @param  {} message
 */

exports.sendFullResponse = (req, res, code, data, message) => {
    console.log(message);
    var resp = {
        code: code,
        data: data,
        message: (typeof message != 'string' ) ? sqlErrorMessage : message
    }

    if(typeof message != 'string' ) resp.stack = message;
    
    return res.send(resp);
}

/* ------------------ THROW EXCEPTION IF ANY DATABASE ERROR ----------------- */

/**
 * @param  {} req
 * @param  {} res
 * @param  {} err
 * @param  {} next
 */
exports.throwSQLException = (req, res, err, next) => {
    if(err){
        console.log(err);
        var message = 'Sorry! SQL Exception occurred!';
        exports.sendFullResponse(req, res, 500, {}, message, err);
    }
}

/* ------------------ SELECT STATMENT EXECUTION ----------------- */

/**
 * @param  {} statement
 * @param  {} callback
 */
exports.exceSelect = (statement, callback) => {
    var results = [];
    try {
        // ACQUIRE A CONNECTION
        pool.acquire(function (err, connection) {
            if (err) {
                logger.error(err);
                return callback(err);
            }
            // USER THE CONNECTION AS NORMAL
            var request = new Request(statement, function(err, rowCount, rows) {
                if (err) {
                    logger.error(err);
                    return callback(err);
                }
                // RESLEASE THE CONNECTION BACK TO THE POOL WHEN FINISHED
                connection.release();

                return callback(null, results);
            });
        
            request.on('row', function(columns) {
                var rowObject ={};
                columns.forEach(function(column) {
                    rowObject[column.metadata.colName] = column.value;
                });
                results.push(rowObject)
            });
        
            connection.execSql(request);
        });
    } catch (error) {
        logger.error(err);
        return callback(error);
    }
}

/* ------------------ STORE PROCEDURE EXECUTION ----------------- */
/**
 * @param  {} statement
 * @param  {} callback
 */
exports.callProcedure = (statement,paramIn,paramOut, callback) => {
    var results = [];
    try {
        // ACQUIRE A CONNECTION
        pool.acquire(function (err, connection) {
            if (err) {
                logger.error(err);
                return callback(err);
            }
            // USER THE CONNECTION AS NORMAL
            var request = new Request(statement, function(err, rowCount, rows) {
                if (err) {
                    logger.error(err);
                    return callback(err);
                }               
                // RESLEASE THE CONNECTION BACK TO THE POOL WHEN FINISHED
                connection.release();

                return callback(null, results);
            });
            
            paramIn.forEach(elem =>{
                request.addParameter(elem.name, elem.type,elem.value);                
            }) 
            paramOut.forEach(elem =>{
                request.addOutputParameter(elem.name, elem.type);
            })                

            request.on('row', function(columns) {
                var rowObject ={};
                columns.forEach(function(column) {
                    rowObject[column.metadata.colName] = column.value;
                });
                results.push(rowObject)
            });      
            request.on('returnValue', function(parameterName, value, metadata) {                
                paramOut.forEach(elem =>{
                    if(elem.name == parameterName){
                       elem.value =  value;
                    }
                })   
              });      
            connection.callProcedure(request);
        });
    } catch (error) {
        logger.error(error);
        console.log(error);
        return callback(error);
    }
}

/* ------------------ START: BASE64 IMG CONVERSION ----------------- */
/**
 * Function to encode file data to base64 encoded string
 * @param  {} statement
 * @param  {} callback
 */
exports.base64_encode = (file) => {
    // read binary data
    var bitmap = fs.readFileSync(file);
    // convert binary data to base64 encoded string
    return Buffer.alloc(bitmap).toString('base64');
}

/* ------------------ END: BASE64 IMG CONVERSION ----------------- */

exports.get_req_client_id = (req) => {    
    return jwt.decode(req.headers.authorization.split(' ')[1]).ci;
}

exports.get_req_user_id = (req) => {    
    return jwt.decode(req.headers.authorization.split(' ')[1]).ui;
}