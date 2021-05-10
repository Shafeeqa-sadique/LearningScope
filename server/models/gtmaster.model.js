var Request     = require('tedious').Request;
var connection  = require('../helper/connection');
var common      = require('../helper/common');
var table       = 'TB_GT_MASTER';
var table1      = 'TB_GT_PHOTO';

let create = (insertData, callback) => { 
    if(insertData) {
        if(insertData.PURCHASE_DT != null)
        {
            insertData.PURCHASE_DT = "'"+ insertData.PURCHASE_DT +"'"
        }
        if(insertData.BIRTH_DT !=null)
        {
            
            insertData.BIRTH_DT = "'"+ insertData.BIRTH_DT +"'"
        }
        if(insertData.SOLD_DT != null)
        {
            insertData.SOLD_DT = "'"+ insertData.SOLD_DT +"'"
        }

        if(insertData.BUY_LOCATION != null)
        {
            insertData.BUY_LOCATION = "'"+ insertData.BUY_LOCATION +"'"
        }
        if(insertData.SHED != null)
        {
            insertData.SHED = "'"+ insertData.SHED +"'"
        }
        if(insertData.REMARKS != null)
        {
            insertData.REMARKS = "'"+ insertData.REMARKS +"'"
        }

        var insertSql = `INSERT INTO ${table} 
            ([GT_NO],[GT_NAME],[PURCHASE_DT]
            ,[PURCHASE_WEIGHT],[PURCHASE_AMOUNT]
            ,[BIRTH_DT],[SOLD_DT],[SOLD_PRICE],[STATUS_ID],[BREED_ID],[BUY_LOCATION],[PARENT_GT_ID]
            ,[SOLD_DATE],[GENDER_ID],[REMARKS],[FOR_SALE_ID],[FATHER_GT_ID],[SHED],[CLIENT_ID]
            ,[CRE_DT],[CRE_USR_ID],[UPD_DT],[UPD_USR_ID])
        Output Inserted.GT_ID VALUES 
        ('${insertData.GT_NO}','${insertData.GT_NAME}',${insertData.PURCHASE_DT}, 
         ${insertData.PURCHASE_WEIGHT}, ${insertData.PURCHASE_AMOUNT}, 
         ${insertData.BIRTH_DT},${insertData.SOLD_DT},${insertData.SOLD_PRICE}, ${insertData.STATUS}, ${insertData.BREED}, 
         ${insertData.BUY_LOCATION},${insertData.PARENT_GT_ID},
        ${insertData.SOLD_DATE}, '${insertData.GENDER}', ${insertData.REMARKS},${insertData.FOR_RESALE},${insertData.FATHER_GT_ID}, 
        ${insertData.SHED},${insertData.CLIENT_ID}, GETDATE(), '${insertData.CRE_USR_ID}', GETDATE(), 
        '${insertData.UPD_USR_ID}' )`;
        var request = new Request(insertSql,
        function(err, rowsCount, rows) {
            if(err) {
                console.log(err);
                return callback(err);
            };
            jsonArray = []
            rows.forEach(function (columns) {
                var rowObject ={};
                columns.forEach(function(column) {
                    rowObject[column.metadata.colName] = column.value;
                });
                jsonArray.push(rowObject)
            });
            callback(null, jsonArray);
        });
        connection.execSql(request);
    }
}

let update = (updateData, callback) => {
    if(updateData) {
        var sqlQuery1 = `UPDATE ${table} SET `
        if(updateData.GT_NAME) {
            sqlQuery1 = sqlQuery1+`GT_NAME = '${updateData.GT_NAME}', `
        } 
        if(updateData.PURCHASE_DT) {
            sqlQuery1 = sqlQuery1+`PURCHASE_DT = '${updateData.PURCHASE_DT}', `
        } 
        if(updateData.PURCHASE_WEIGHT) {
            sqlQuery1 = sqlQuery1+`PURCHASE_WEIGHT = '${updateData.PURCHASE_WEIGHT}', `
        }
        if(updateData.PURCHASE_AMOUNT) {
            sqlQuery1 = sqlQuery1+`PURCHASE_AMOUNT = '${updateData.PURCHASE_AMOUNT}', `
        }  
        if(updateData.BIRTH_DT) {
            sqlQuery1 = sqlQuery1+`BIRTH_DT = '${updateData.BIRTH_DT}', `
        }  
        if(updateData.SOLD_DT) {
            sqlQuery1 = sqlQuery1+`SOLD_DT = '${updateData.SOLD_DT}', `
        }  
        if(updateData.SOLD_PRICE) {
            sqlQuery1 = sqlQuery1+`SOLD_PRICE = '${updateData.SOLD_PRICE}', `
        }  
        if(updateData.STATUS) {
            sqlQuery1 = sqlQuery1+`STATUS_ID = '${updateData.STATUS}', `
        }  
        if(updateData.BREED) {
            sqlQuery1 = sqlQuery1+`BREED_ID = '${updateData.BREED}', `
        }  
        if(updateData.BUY_LOCATION) {
            sqlQuery1 = sqlQuery1+`BUY_LOCATION = '${updateData.BUY_LOCATION}', `
        }  
        if(updateData.PARENT_GT_ID) {
            sqlQuery1 = sqlQuery1+`PARENT_GT_ID = '${updateData.PARENT_GT_ID}', `
        }  
        if(updateData.SOLD_DATE) {
            sqlQuery1 = sqlQuery1+`SOLD_DATE = '${updateData.SOLD_DATE}', `
        }  
        if(updateData.GENDER) {
            sqlQuery1 = sqlQuery1+`GENDER_ID = '${updateData.GENDER}', `
        }  
        if(updateData.REMARKS) {
            sqlQuery1 = sqlQuery1+`REMARKS = '${updateData.REMARKS}', `
        }  
        if(updateData.FOR_RESALE) {
            sqlQuery1 = sqlQuery1+`FOR_SALE_ID = '${updateData.FOR_RESALE}', `
        }  
        if(updateData.FATHER_GT_ID) {
            sqlQuery1 = sqlQuery1+`FATHER_GT_ID = '${updateData.FATHER_GT_ID}', `
        }  
        if(updateData.SHED) {
            sqlQuery1 = sqlQuery1+`SHED = '${updateData.SHED}', `
        }  
        mainQuery = sqlQuery1+"UPD_DT = GETDATE() WHERE GT_ID = "+ updateData.GT_ID;
 
        var request = new Request(mainQuery,
        function(err, rowsCount, rows) {
            if(err) {
                console.log(err);
                return callback(err);
            };
            jsonArray = [];
            rows.forEach(function (columns) {
                var rowObject ={};
                columns.forEach(function(column) {
                    rowObject[column.metadata.colName] = column.value;
                });
                jsonArray.push(rowObject)
            });
            callback(null, jsonArray);
        });
        connection.execSql(request);
    }
}

let remove = (GT_ID, callback) => {
    if(GT_ID){
        var sqlQuery = `DELETE FROM ${table} WHERE GT_ID = ${GT_ID}`;
        var request  = new Request(sqlQuery,
        function(err, rowCount, rows) {
            if(err) {
                console.log(err);
                return callback(err);
            };
            callback(null, rowCount);
        });
    
        connection.execSql(request);
    }
}

let uploadPic = (insertData, callback) => {    
    if(insertData) {
        var insertSql = `INSERT INTO ${table1} 
        ([GT_ID],[FILE_NAME],[FILE_ATTRIBUTE],[FILE_SIZE],[FILE_STREAM],[CRE_DT],[CRE_USR_ID],[UPD_DT],[UPD_USR_ID],[IMG_PATH],[ICON_PATH],[ICON_STREAM],[CLIENT_ID])
        Output INSERTED.GT_PHOTO_ID 
        VALUES (${insertData.GT_ID},'${insertData.FILE_NAME}','${insertData.FILE_ATTRIBUTE}', ${insertData.FILE_SIZE}, '${insertData.FILE_STREAM}', GETDATE(), ${insertData.CRE_USR_ID}, GETDATE(), ${insertData.CRE_USR_ID},'${insertData.IMG_PATH}','${insertData.ICON_PATH}','${insertData.ICON_STREAM}', ${insertData.CLIENT_ID})`;
        
        var request = new Request(insertSql,
        function(err, rowsCount, rows) {
            if(err) {
                return callback(err);
            };
            jsonArray = []
            rows.forEach(function (columns) {
                var rowObject ={};
                columns.forEach(function(column) {
                    rowObject[column.metadata.colName] = column.value;
                });
                jsonArray.push(rowObject)
            });
            callback(null, jsonArray);
        });
        connection.execSql(request);
    }
}

let updatePic = (updatePicData, callback) => {
    if(updatePicData) {
        var sqlQuery1 = `UPDATE ${table1} SET `
        if(updatePicData.FILE_NAME) {
            sqlQuery1 = sqlQuery1+`FILE_NAME = '${updatePicData.FILE_NAME}', `
        } 
        if(updatePicData.FILE_SIZE) {
            sqlQuery1 = sqlQuery1+`FILE_SIZE = '${updatePicData.FILE_SIZE}', `
        } 
        if(updatePicData.FILE_STREAM) {
            sqlQuery1 = sqlQuery1+`FILE_STREAM = '${updatePicData.FILE_STREAM}', `
        }
        mainQuery = sqlQuery1+"UPD_DT = GETDATE() WHERE GT_ID = "+ updatePicData.GT_ID;
        var request = new Request(mainQuery,
        function(err, rowsCount, rows) {
            if(err) {
                console.log(err);
                return callback(err);
            };
            jsonArray = [];
            rows.forEach(function (columns) {
                var rowObject ={};
                columns.forEach(function(column) {
                    rowObject[column.metadata.colName] = column.value;
                });
                jsonArray.push(rowObject)
            });
            callback(null, jsonArray);
        });
        connection.execSql(request);
    }
}

let updateOrInsertPic = (picData, callback) => {
    gtId = picData.GT_ID;
    var sqlQuery = `SELECT * FROM TB_GT_PHOTO WHERE GT_ID = ${gtId}`;
    common.exceSelect(sqlQuery, (err, selectedResult) => {
        if(err) return callback(err);
        if(selectedResult && selectedResult.length > 0){
            updatePic(picData, (err, result)=>{
                if(err) return callback(err);
                return callback(null, result);
            })
        }else{
            uploadPic(picData, (err, result)=>{
                if(err) return callback(err);
                return callback(null, result);
            })
        }
    })
}

let removePic = (gtPID, gtID, callback) => {
    if(gtPID){
        var sqlQuery = `DELETE FROM ${table1} WHERE GT_PHOTO_ID = ${gtPID}`;
        var request  = new Request(sqlQuery,
        function(err, rowCount, rows) {
            if(err) {
                console.log(err);
                return callback(err);
            };
            var statement = `SELECT GTM.*, GTP.FILE_NAME, GTP.FILE_STREAM, GTP.GT_PHOTO_ID
                            FROM TB_GT_MASTER AS GTM
                            LEFT JOIN TB_GT_PHOTO AS GTP ON GTP.GT_PHOTO_ID = (
                                SELECT TOP(1) GT_PHOTO_ID
                                FROM TB_GT_PHOTO AS GTP1 
                                WHERE GTP1.GT_ID = GTM.GT_ID
                                ORDER BY GTP1.GT_PHOTO_ID DESC
                            ) WHERE GTM.GT_ID = ${gtID}`;
            // var sqlQuery = `SELECT TOP (1) TB_GT_MASTER.*, TB_GT_PHOTO.FILE_NAME FROM TB_GT_MASTER LEFT JOIN TB_GT_PHOTO ON TB_GT_MASTER.GT_ID = TB_GT_PHOTO.GT_ID WHERE TB_GT_MASTER.GT_ID = ${gtID}`;
            common.exceSelect(statement, (err, result)=>{
                if(err) return callback(err);
                result = result[0];
                return callback(null, result);
            });
        });
    
        connection.execSql(request);
    }
}

var gtmaster = {};

gtmaster.create     = create;
gtmaster.update     = update;
gtmaster.remove     = remove;
gtmaster.uploadPic  = uploadPic;
gtmaster.updatePic  = updatePic;
gtmaster.updateOrInsertPic  = updateOrInsertPic;
gtmaster.removePic  = removePic;

module.exports = gtmaster;