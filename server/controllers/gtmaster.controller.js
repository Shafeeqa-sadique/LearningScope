const express = require('express');
const router = express.Router();
const multer = require('multer');
const common = require('../helper/common');
const GtModel = require('../models/gtmaster.model');
const fs = require('fs');
const base64Img = require('base64-img');
const path = require('path')

let storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/' + common.get_req_client_id(req) + '/')
    },
    filename: (req, file, cb) => {
        if ((file.mimetype.toLowerCase() == 'image/jpg') || (file.mimetype.toLowerCase() == 'image/jpeg')) {
            cb(null, common.get_req_client_id(req) + '-' + Date.now() + '.jpg');
        }
        if (file.mimetype.toLowerCase() == 'image/png') {
            cb(null, common.get_req_client_id(req) + '-' + Date.now() + '.png');
        }
    }
});

let reduceImageSize = (fileName, callback) => {

    var nPath = fileName.replace('.', '-ic.'); 
    var sharp = require('sharp');
    sharp(fileName)
        .resize(45, 45)
        .toFile(nPath, function (err) {
            // output.jpg is a 300 pixels wide and 200 pixels high image
            // containing a scaled and cropped version of input.jpg
            console.log(err)
            //if(err) return common.sendFullResponse(req, res, 200, goatData, "Error in converting the image format");
            return callback(err, nPath);
        }); 
    //return callback(null,nPath);

}

let create = (req, res) => {
    let vCID = common.get_req_client_id(req)
    let vUID = common.get_req_user_id(req)
    var dir = './uploads/' + vCID;
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    
    let upload = multer({ storage: storage }).single("file");

    let data = {};
    upload(req, res, function (err) { 
        if (err) {
            console.log(err);
        } else {
            if (req.body.data) {
                data = JSON.parse(req.body.data);
            }
            if (!data.gtNo) {
                return common.sendFullResponse(req, res, 300, {}, "Please enter goat no");
            }            
            // if(!data.purchaseAmt) {
            //     return common.sendFullResponse(req, res, 300, {}, "Please enter purchase amount");
            // }
            if (!data.status) {
                return common.sendFullResponse(req, res, 300, {}, "Please enter status");
            }
            // if(!data.forResale) {
            //     return common.sendFullResponse(req, res, 300, {}, "Please enter resel value.");
            // }                      
            var checkUserSql = `SELECT * FROM TB_GT_MASTER M, TB_GT_STATUS SS WHERE M.GT_NO= '${data.gtNo}' AND SS.GT_STATUS_ID =M.STATUS_ID AND SS.GT_STATUS_CODE='ALIVE' AND M.CLIENT_ID=${vCID}`;
            common.exceSelect(checkUserSql, (err, gtData) => {
                if (err) return common.sendFullResponse(req, res, 500, {}, err);
                if (gtData && gtData.length === 0) {
                    var goatData = {
                        GT_NO: data.gtNo,
                        GT_NAME: data.gtName,
                        PURCHASE_DT: data.purchaseDt || null,
                        PURCHASE_WEIGHT: data.purchaseWgt,
                        PURCHASE_AMOUNT: data.purchaseAmt || 0,
                        BIRTH_DT: data.birthDt,
                        SOLD_DT: data.soldDt,
                        SOLD_PRICE: data.soldPrice || null,
                        STATUS: data.status,
                        BREED: data.breed,
                        BUY_LOCATION: data.buyLocation || null,
                        PARENT_GT_ID: data.parentGtId || null,
                        SOLD_DATE: data.soldDate || null,
                        GENDER: data.gender,
                        REMARKS: data.remarks || null,
                        FOR_RESALE: data.forResale || 0,
                        FATHER_GT_ID: data.fatherGtId || null,
                        SHED: data.shed || null,
                        CLIENT_ID: common.get_req_client_id(req),
                        CRE_USR_ID: vUID,
                        UPD_USR_ID: vUID,
                    }
                    GtModel.create(goatData, (err, insertedData) => {

                        if (err) return common.sendFullResponse(req, res, 500, {}, err);
                        if (insertedData) {
                            // var nPath = dir + '/'+ req.file.filename.replace('.', '-ic.');                            
                            // var sharp = require('sharp');
                            // sharp(req.file.path)
                            // .resize(50, 50)
                            // .toFile(nPath, function(err) {
                            //     // output.jpg is a 300 pixels wide and 200 pixels high image
                            //     // containing a scaled and cropped version of input.jpg
                            //     if(err) return common.sendFullResponse(req, res, 200, goatData, "Error in converting the image format");
                            // });




                            if (req.file) {
                                reduceImageSize(req.file.path, (err, vIconPath) => {
                                    var uploadPicData = {
                                        GT_ID: insertedData[0].GT_ID,
                                        FILE_NAME: req.file.originalname,
                                        FILE_SIZE: req.file.size,
                                        FILE_ATTRIBUTE: req.file.mimetype,
                                        FILE_STREAM: base64Img.base64Sync(req.file.path),
                                        IMG_PATH: req.file.path.replace('./', '/'),
                                        CLIENT_ID: vCID,
                                        ICON_PATH: vIconPath,
                                        ICON_STREAM: base64Img.base64Sync(vIconPath),
                                        CRE_USR_ID: vUID
                                    } 
                                    goatData.FILE_NAME = req.file.originalname;
                                    goatData.FILE_STREAM = uploadPicData.FILE_STREAM;
                                    goatData.GT_ID = insertedData[0].GT_ID;
                                    GtModel.uploadPic(uploadPicData, (err, insertPicData) => {
                                        if (err) return common.sendFullResponse(req, res, 300, {}, err);
                                        if (insertPicData) {
                                            return common.sendFullResponse(req, res, 200, goatData, "Tag No# " + data.gtNo + " information added successfully");
                                        }
                                    });
                                })
                            } else {
                                goatData.GT_ID = insertedData[0].GT_ID;
                                return common.sendFullResponse(req, res, 200, goatData, "Tag No# " + data.gtNo + " information added successfully.");
                            }
                        } else {
                            return common.sendFullResponse(req, res, 300, {}, "Failed to add Goat information");
                        }
                    })
                } else {
                    common.sendFullResponse(req, res, 300, {}, "Tag No# already exists in the farm");
                }
            });
        }
    });
}

let getAllGoat = (req, res) => {
    // var statement = `SELECT TOP(1) TB_GT_MASTER.*, TB_GT_PHOTO.FILE_NAME, TB_GT_PHOTO.FILE_STREAM FROM TB_GT_MASTER LEFT JOIN TB_GT_PHOTO ON TB_GT_MASTER.GT_ID = TB_GT_PHOTO.GT_ID WHERE TB_GT_MASTER.GT_ID = ${el.GT_ID} ORDER BY TB_GT_PHOTO.GT_PHOTO_ID DESC`;
    let vCID = common.get_req_client_id(req);
    let vGID = null;
     
    if (req.params.gtID !=null) {
        vGID =req.params.gtID
    }
     

    getGoatDetail(vGID,vCID, function(sql) {
        
        common.exceSelect(sql, async (err, result) => {
            if (err) return common.sendFullResponse(req, res, 500, {}, err);
            if (result && result.length > 0) {
                common.sendFullResponse(req, res, 200, result, "Data Fetched Sucessfully");
            } else {
                common.sendFullResponse(req, res, 300, [], "No Data Found");
            }
        });
    });
}

let getAllGoatTest = (req, res) => {
    let vCID = common.get_req_client_id(req);
    let vGID = null; 
    if (req.params.gtID !=null) {
        vGID =req.params.gtID
    } 
    
    var sql = `
                    SELECT
                    GTM.[GT_ID]
                    ,GTM.[GT_NO]
                    ,GTM.[GT_NAME]                                        
                    FROM TB_GT_MASTER AS GTM
                    LEFT JOIN 
                    (SELECT GT_ID,MAX(GT_PHOTO_ID) GT_PHOTO_ID FROM TB_GT_PHOTO WHERE CLIENT_ID=${vCID} GROUP BY GT_ID)
                    AS TP 
                    ON GTM.GT_ID = TP.GT_ID 
                    LEFT JOIN 
                    TB_GT_PHOTO GTP ON GTP.GT_PHOTO_ID = TP.GT_PHOTO_ID
                    where GTM.CLIENT_ID=${vCID} 
                    `;

    common.exceSelect(sql, async (err, result) => {
        if (err) return common.sendFullResponse(req, res, 500, {}, err);
        if (result && result.length > 0) {
            common.sendFullResponse(req, res, 200, result, "Data Fetched Sucessfully");
        } else {
            common.sendFullResponse(req, res, 300, [], "No Data Found");
        }
    });
    
}


function getGoatDetail(vId,vCID,callback){
    var sql="";
    
    if(vId != null)
    {
        sql = " and GTM.GT_ID=" + vId
    }
    var statement = `
                    SELECT
                    GTM.[GT_ID]
                    ,GTM.[GT_NO]
                    ,GTM.[GT_NAME]
                    ,REPLACE(CONVERT(CHAR(9),GTM.[PURCHASE_DT], 6),' ', '-') [PDT]
                    ,GTM.[PURCHASE_WEIGHT]
                    ,GTM.[PURCHASE_AMOUNT]
                    ,REPLACE(CONVERT(CHAR(9),GTM.[BIRTH_DT], 6),' ', '-') [BDT]
                    ,REPLACE(CONVERT(CHAR(9),GTM.[SOLD_DT], 6),' ', '-') [SDT]
                    ,GTM.[SOLD_PRICE]
                    ,(SELECT TOP 1 GT_STATUS_NAME from [dbo].[TB_GT_STATUS] SS WHERE ss.GT_STATUS_ID=GTM.[STATUS_ID]) AS [STATUS]
                    ,(SELECT TOP 1 GT_STATUS_NAME from [dbo].[TB_GT_STATUS] SS WHERE ss.GT_STATUS_ID=GTM.[BREED_ID]) AS BREED
                    ,GTM.[BUY_LOCATION]
                    ,(select top 1 PR.GT_NO from TB_GT_MASTER PR WHERE PR.GT_ID= GTM.[PARENT_GT_ID]) [PARENT_GT_ID]
                    ,GTM.[SOLD_DATE]
                    ,(SELECT TOP 1 GT_STATUS_NAME from [dbo].[TB_GT_STATUS] SS WHERE ss.GT_STATUS_ID=GTM.[GENDER_ID]) [GENDER]
                    ,GTM.[REMARKS]                    
					,(SELECT TOP 1 GT_STATUS_NAME from [dbo].[TB_GT_STATUS] SS WHERE ss.GT_STATUS_ID=GTM.[FOR_SALE_ID]) FOR_RESALE
                    ,(select top 1 PR.GT_NO from TB_GT_MASTER PR WHERE PR.GT_ID= GTM.[FATHER_GT_ID]) [FATHER_GT_ID]
                    ,GTM.[SHED]
                    ,GTM.[CLIENT_ID], GTP.FILE_NAME,  GTP.GT_PHOTO_ID
                    FROM TB_GT_MASTER AS GTM
                    LEFT JOIN 
                    (SELECT GT_ID,MAX(GT_PHOTO_ID) GT_PHOTO_ID FROM TB_GT_PHOTO WHERE CLIENT_ID=${vCID} GROUP BY GT_ID)
                    AS TP 
                    ON GTM.GT_ID = TP.GT_ID 
                    LEFT JOIN 
                    TB_GT_PHOTO GTP ON GTP.GT_PHOTO_ID = TP.GT_PHOTO_ID
                    where GTM.CLIENT_ID=${vCID} ${sql}
                    `;

    
    return callback(statement);
}



let update = (req, res) => { 
    let vCID = common.get_req_client_id(req);
    let vUID = common.get_req_user_id(req);
    let upload = multer({ storage: storage }).single("file");
    let data = {};
    upload(req, res, function (err) {
        if (err) {
            console.log(err);
        } else {
            if (req.body.data) {
                data = JSON.parse(req.body.data);
            }
            if (!data.gtNo) {
                return common.sendFullResponse(req, res, 300, {}, "Please enter Tag No#");
            }
            var gtId = data.gtId;
            var sqlQuery = `
            UPDATE [dbo].[TB_GT_MASTER]
                     SET [GT_NO] = ${data.gtNo == undefined || data.gtNo == "" || data.gtNo.length == 0 ? 'Null' : '\'' + data.gtNo + '\''}
                        ,[GT_NAME] = ${data.gtName == undefined || data.gtName == "" || data.gtName.length == 0 ? 'Null' : '\'' + data.gtName + '\''}
                        ,[PURCHASE_DT] = ${data.purchaseDt == undefined || data.purchaseDt == "" || data.purchaseDt.length == 0 ? 'Null' : '\'' + data.purchaseDt + '\''}
                        ,[PURCHASE_WEIGHT] = ${data.purchaseWgt == undefined || data.purchaseWgt == "" || data.purchaseWgt.length == 0 ? 'Null' : data.purchaseWgt}
                        ,[PURCHASE_AMOUNT] = ${data.purchaseAmt == undefined || data.purchaseAmt == "" || data.purchaseAmt.length == 0 ? 0 : data.purchaseAmt}
                        ,[BIRTH_DT] =${data.birthDt == undefined || data.birthDt == "" || data.birthDt.length == 0 ? 'Null' : '\'' + data.birthDt + '\''}
                        ,[SOLD_DT] = ${data.soldDt == undefined || data.soldDt == "" || data.soldDt.length == 0 ? 'Null' : '\'' + data.soldDt + '\''}
                        ,[SOLD_PRICE] = ${data.soldPrice == undefined || data.soldPrice == "" || data.soldPrice.length == 0 ? 'Null' : data.soldPrice}
                        ,[STATUS_ID] = ${data.status == undefined || data.status == "" || data.status.length == 0 ? 'Null' : data.status}
                        ,[BREED_ID] = ${data.breed == undefined || data.breed == "" || data.breed.length == 0 ? 'Null' : data.breed}
                        ,[BUY_LOCATION] = ${data.buyLocation == undefined || data.buyLocation == "" || data.buyLocation.length == 0 ? 'Null' : '\'' + data.buyLocation + '\''}
                        ,[PARENT_GT_ID] = ${data.parentGtId == undefined || data.parentGtId == "" || data.parentGtId.length == 0 ? 'Null' : data.parentGtId}                        
                        ,[GENDER_ID] = ${data.gender == undefined || data.gender == "" || data.gender.length == 0 ? 'Null' : data.gender}
                        ,[REMARKS] = ${data.remarks == undefined || data.remarks == "" || data.remarks.length == 0 ? 'Null' : '\'' + data.remarks + '\''}
                        ,[FOR_SALE_ID] = ${data.forResale == undefined || data.forResale == "" || data.forResale.length == 0 ? 'Null' : data.forResale}
                        ,[FATHER_GT_ID] = ${data.fatherGtId == undefined || data.fatherGtId == "" || data.fatherGtId.length == 0 ? 'Null' : data.fatherGtId}
                        ,[SHED] = ${data.shed == undefined || data.shed == "" || data.shed.length == 0 ? 'Null' : '\'' + data.shed + '\''}
                        ,[CLIENT_ID] = ${vCID}                        
                        ,[UPD_DT] = getdate()
                        ,[UPD_USR_ID] = ${vUID}                       
                    WHERE [GT_ID]=${gtId}; select @@ROWCOUNT CNT;`;
           

            common.exceSelect(sqlQuery, (err, result) => {
                if (err) return common.sendFullResponse(req, res, 500, {}, err);
                if (result && result.length > 0) {
                    result = result[0]['CNT'];
                    if (result > 0) {
                        if (req.file) {
                            reduceImageSize(req.file.path, (err, vIconPath) => {
                                var updatePicData = {
                                    GT_ID: data.gtId,
                                    FILE_NAME: req.file.originalname,
                                    FILE_SIZE: req.file.size,
                                    FILE_ATTRIBUTE: req.file.mimetype,
                                    FILE_STREAM: base64Img.base64Sync(req.file.path),
                                    IMG_PATH: req.file.path.replace('./', '/'),
                                    CLIENT_ID: vCID,
                                    ICON_PATH: vIconPath,
                                    ICON_STREAM: base64Img.base64Sync(vIconPath),
                                    CRE_USR_ID: vUID
                                }
                                //fs.unlinkSync(req.file.path);
                                GtModel.uploadPic(updatePicData, (err, updatedPicData) => {
                                    if (err) return common.sendFullResponse(req, res, 300, {}, err);
                                    if (updatedPicData) {
                                        // updateData.FILE_NAME    = updatePicData.FILE_NAME;
                                        // updateData.FILE_STREAM  = updatePicData.FILE_STREAM;
                                        return common.sendFullResponse(req, res, 200, result, "File Uploaded Successfully");
                                    }
                                });
                            });
                        } else {
                            return common.sendFullResponse(req, res, 200, result, "Tag No# " + data.gtNo + " details updated successfully");
                        }
                    } else {
                        return common.sendFullResponse(req, res, 300, {}, "Failed to update goat detail");
                    }
                } else {
                    return common.sendFullResponse(req, res, 300, {}, "No data Found");
                }
            });

            /*
            return common.sendFullResponse(req, res, 300, {}, "No data Found");
            common.exceSelect(sqlQuery, (err, result) => {
                if(err) return common.sendFullResponse(req, res, 500, {}, err);
                if(result && result.length > 0){
                    result = result[0];
                    var updateData = {
                        GT_ID : data.gtId? data.gtId : result.GT_ID,
                        GT_NO: data.gtNo ? data.gtNo : result.GT_NO,
                        GT_NAME: data.gtName? data.gtName : result.GT_NAME, 
                        PURCHASE_DT: data.purchaseDt? data.purchaseDt : result.PURCHASE_DT,
                        PURCHASE_WEIGHT: data.purchaseWgt? data.purchaseWgt : result.PURCHASE_WEIGHT,
                        PURCHASE_AMOUNT: data.purchaseAmt? data.purchaseAmt : result.PURCHASE_AMOUNT,
                        BIRTH_DT: data.birthDt? data.birthDt : result.BIRTH_DT,
                        SOLD_DT: data.soldDt? data.soldDt : result.SOLD_DT,
                        SOLD_PRICE: data.soldPrice? data.soldPrice : result.SOLD_PRICE || 0,
                        STATUS: data.status? data.status : result.STATUS,
                        BREED: data.breed? data.breed : result.BREED,
                        BUY_LOCATION: data.buyLocation? data.buyLocation : result.BUY_LOCATION,
                        PARENT_GT_ID: data.parentGtId? data.parentGtId : result.PARENT_GT_ID || 0,
                        SOLD_DATE: data.soldDate? data.soldDate : result.SOLD_DATE,
                        GENDER: data.gender? data.gender : result.GENDER,
                        REMARKS: data.remarks? data.remarks : result.REMARKS,
                        FOR_RESALE: data.forResale? data.forResale : result.FOR_RESALE, 
                        FATHER_GT_ID: data.fatherGtId? data.fatherGtId : result.FATHER_GT_ID || 0,
                        SHED: data.shed? data.shed : result.SHED,
                        FILE_NAME: result.FILE_NAME || ''
                    }
                 
                    GtModel.update(updateData, (err, uData) => {
                        if(err) return common.sendFullResponse(req, res, 500, {}, err);        
                        if (uData) {
                            if(req.file){
                                reduceImageSize(req.file.path,(err, vIconPath) => {
                                    var updatePicData = {
                                        GT_ID : data.gtId,
                                        FILE_NAME: req.file.originalname,
                                        FILE_SIZE: req.file.size,
                                        FILE_ATTRIBUTE: req.file.mimetype,
                                        FILE_STREAM: base64Img.base64Sync(req.file.path),
                                        IMG_PATH: req.file.path.replace('./','/'),
                                        CLIENT_ID : common.get_req_client_id(req),
                                        ICON_PATH: vIconPath,
                                        ICON_STREAM : base64Img.base64Sync(vIconPath)
                                    }
                                    //fs.unlinkSync(req.file.path);
                                    GtModel.uploadPic(updatePicData, (err, updatedPicData) => {
                                        if(err) return common.sendFullResponse(req, res, 300, {}, err);
                                        if(updatedPicData) {
                                            updateData.FILE_NAME    = updatePicData.FILE_NAME;
                                            updateData.FILE_STREAM  = updatePicData.FILE_STREAM;
                                            return common.sendFullResponse(req, res, 200, updateData, "File Uploaded Successfully");
                                        }                                   
                                    }); 
                                });                      
                            } else{
                                return common.sendFullResponse(req, res, 200, updateData, "Goat details updated successfully");
                            }                   
                        } else {
                            return common.sendFullResponse(req, res, 300, {}, "Failed to update goat detail");
                        }
                    })
                } else {
                    return common.sendFullResponse(req, res, 300, {}, "No data Found");
                }
            });
            */
        }
    });
}

let remove = (req, res) => {
    if (!req.body.gtId) {
        return common.sendFullResponse(req, res, 300, {}, "Please enter goat number.");
    }
    var gtId = req.body.gtId;
    var sqlQuery = `SELECT * FROM TB_GT_MASTER WHERE GT_ID = ${gtId}`;
    common.exceSelect(sqlQuery, (err, result) => {
        if (err) return common.sendFullResponse(req, res, 500, {}, err);
        if (result && result.length > 0) {
            GtModel.remove(gtId, (err, result) => {
                if (err) return common.sendFullResponse(req, res, 500, {}, err);
                if (result) {
                    return common.sendFullResponse(req, res, 200, {}, "Data removed successfully");
                } else {
                    return common.sendFullResponse(req, res, 200, {}, "Failed to remove goat details");
                }
            });
        } else {
            return common.sendFullResponse(req, res, 300, {}, "No data found");
        }
    });
}

let getAllStatus = (req, res) => {
    
    var globalStatus = {};

    let vCID = common.get_req_client_id(req);
    // var statement = `
    // SELECT GT_PARENT_STATUS TYP,  GT_STATUS_ID COD, GT_STATUS_NAME DSPN FROM TB_GT_STATUS WHERE CLIENT_ID=${vCID} 
    // union 
    // select 'MOM',cast(ms.GT_ID as varchar),ms.GT_NO From TB_GT_MASTER ms left join TB_GT_STATUS ss on ms.STATUS_ID = ss.GT_STATUS_ID where ms.GENDER='F' and ss.GT_STATUS_CODE='ALIVE' and ms.CLIENT_ID=${vCID} and ss.CLIENT_ID=${vCID} 
    // union 
    // select 'DAD',cast(ms.GT_ID as varchar),ms.GT_NO From TB_GT_MASTER ms left join TB_GT_STATUS ss on ms.STATUS_ID = ss.GT_STATUS_ID where ms.GENDER='M' and ss.GT_STATUS_CODE='ALIVE' and ms.CLIENT_ID=${vCID} and ss.CLIENT_ID=${vCID} 
    // `;
     
    var statement = `
    SELECT GT_PARENT_STATUS TYP,  GT_STATUS_ID COD, GT_STATUS_NAME DSPN FROM TB_GT_STATUS WHERE CLIENT_ID=${vCID} 
    union 
    select 'MOM',cast(ms.GT_ID as varchar),ms.GT_NO From TB_GT_MASTER ms left join TB_GT_STATUS ss on ms.GENDER_ID = ss.GT_STATUS_ID where ss.GT_STATUS_CODE = 'F'  and ms.CLIENT_ID=${vCID} and ss.CLIENT_ID=${vCID} 
    union 
    select 'DAD',cast(ms.GT_ID as varchar),ms.GT_NO From TB_GT_MASTER ms left join TB_GT_STATUS ss on ms.GENDER_ID = ss.GT_STATUS_ID where ss.GT_STATUS_CODE = 'M'  and ms.CLIENT_ID=${vCID} and ss.CLIENT_ID=${vCID} 
    `;

    common.exceSelect(statement, (err, result) => {
        if (err) return common.sendFullResponse(req, res, 500, {}, err);
        if (result.length > 0) {
            globalStatus['status'] = result.filter(value => value.TYP == "STATUS");
            globalStatus['breed'] = result.filter(value => value.TYP == "BREED");
            globalStatus['gender'] = result.filter(value => value.TYP == "GENDER");
            globalStatus['forResale'] = result.filter(value => value.TYP == "forResale");
            globalStatus['mom'] = result.filter(value => value.TYP == "MOM");
            globalStatus['dad'] = result.filter(value => value.TYP == "DAD");
            common.sendFullResponse(req, res, 200, globalStatus, "Status details fetched successfully..!!");
        } else {
            common.sendFullResponse(req, res, 300, [], "No status found");
        }
    });
}

let getStatusExpense = (req, res) => {
    let vCID = common.get_req_client_id(req);
    var globalStatus = {};
    var statment = `SELECT GT_STATUS_ID SID,GT_PARENT_STATUS GPS, GT_STATUS_CODE COD, GT_STATUS_NAME NME FROM TB_GT_STATUS WHERE CLIENT_ID=${vCID}`;
    common.exceSelect(statment, (err, result) => {
        if (err) return common.sendFullResponse(req, res, 500, {}, err);
        if (result.length > 0) {
            globalStatus['EXP'] = result.filter(value => value.COD == "CODE_EXPENSE" || value.COD == "CODE_INVEST");
            globalStatus['INC'] = result.filter(value => value.COD == "CODE_INCOME");
            common.sendFullResponse(req, res, 200, globalStatus, "Status details fetched successfully..!!");
        } else {
            common.sendFullResponse(req, res, 300, [], "No status found");
        }
    });
}

let removeGoatPic = (req, res, next) => {
    var gtPID = req.body.gtPID;
    var gtID = req.body.gtID;
    if (!gtPID) {
        return common.sendFullResponse(req, res, 300, {}, "Please enter goat id.");
    }
    if (!gtID) {
        return common.sendFullResponse(req, res, 300, {}, "Please enter goat id.");
    }
    GtModel.removePic(gtPID, gtID, (err, result) => {
        if (err) return common.sendFullResponse(req, res, 500, {}, err);
        if (result) {
            return common.sendFullResponse(req, res, 200, result, "Goat pic removed successfully");
        } else {
            return common.sendFullResponse(req, res, 300, {}, "Failed to remove goat pic.");
        }
    })
}

let getAllGoatPic = (req, res) => {
    if (!req.params.gtId) {
        return common.sendFullResponse(req, res, 300, result, "GT_ID required!");
    }
    let vCID = common.get_req_client_id(req);
    var statement = `    
    SELECT p.FILE_NAME, p.GT_ID, p.GT_PHOTO_ID FROM TB_GT_MASTER ms LEFT JOIN TB_GT_PHOTO p ON ms.GT_ID = p.GT_ID
    WHERE p.GT_ID = ${req.params.gtId} AND p.CLIENT_ID=${vCID}  and ms.CLIENT_ID=${vCID}
    `;
   
    common.exceSelect(statement, (err, result) => {
        if (err) return common.sendFullResponse(req, res, 500, {}, err);
        if (result.length > 0) {
            common.sendFullResponse(req, res, 200, result, "Users fetched successfully..!!");
        } else {
            common.sendFullResponse(req, res, 300, [], "No data found");
        }
    });
}


let getGoatPic = (req, res) => {
    if (!req.params.gtId) {
        return common.sendFullResponse(req, res, 300, {}, "ID required!");
    }
    if (!req.params.IOrP) {
        return common.sendFullResponse(req, res, 300, {}, "Icon Or Pic required!");
    }
    let vCID = 1;// common.get_req_client_id(req);
    let vImageType = req.params.IOrP;
    let vCol =`
     SUBSTRING(p.ICON_STREAM,CHARINDEX(',', p.ICON_STREAM )+1 ,len( p.ICON_STREAM)) as FL
	,SUBSTRING(p.ICON_STREAM,1 ,CHARINDEX(';', p.ICON_STREAM )-1) as IMG_TYPE
    `
    if(vImageType =='p')
    {
        vCol =
        `
        SUBSTRING(p.FILE_STREAM,CHARINDEX(',', p.FILE_STREAM )+1 ,len( p.FILE_STREAM)) as FL
        ,SUBSTRING(p.FILE_STREAM,1 ,CHARINDEX(';', p.FILE_STREAM )-1) as IMG_TYPE
        `
    }
    var statement = `    
    SELECT ${vCol} FROM TB_GT_PHOTO p 
    WHERE p.GT_PHOTO_ID = ${req.params.gtId} AND p.CLIENT_ID=${vCID} 
    `;
  
    common.exceSelect(statement, (err, result) => {
        if (err) return common.sendFullResponse(req, res, 500, {}, err);
        if (result.length > 0) { 
            //res.send(result[0]["FL"]);
            let data = result[0]["FL"];
            let dataType = result[0]["IMG_TYPE"];
            var img = new Buffer(data, 'base64');

            res.writeHead(200, {
              'Content-Type': dataType,
              'Content-Length': img.length
            });
            res.end(img); 

        } else {
            res.send(null);
        }
    });
}


let getAdsPic = (req, res) => {
    console.log('Get Photo hit')
    if (!req.params.pid) {
        return common.sendFullResponse(req, res, 300, {}, "ID required!");
    }
    if (!req.params.IOrP) {
        return common.sendFullResponse(req, res, 300, {}, "Icon Or Pic required!");
    }
    let vCID = 1;// common.get_req_client_id(req);
    let vImageType = req.params.IOrP;
    let vCol =`
     SUBSTRING(p.ICON_STREAM,CHARINDEX(',', p.ICON_STREAM )+1 ,len( p.ICON_STREAM)) as FL
	,SUBSTRING(p.ICON_STREAM,1 ,CHARINDEX(';', p.ICON_STREAM )-1) as IMG_TYPE
    `
    if(vImageType =='p')
    {
        vCol =
        `
        SUBSTRING(p.FILE_STREAM,CHARINDEX(',', p.FILE_STREAM )+1 ,len( p.FILE_STREAM)) as FL
        ,SUBSTRING(p.FILE_STREAM,1 ,CHARINDEX(';', p.FILE_STREAM )-1) as IMG_TYPE
        `
    }
    var statement = `    
    SELECT ${vCol} FROM TB_GT_ADS_PHOTO p 
    WHERE p.GT_ADS_PHOTO_ID = ${req.params.pid} 
    `;
    console.log(statement);
    common.exceSelect(statement, (err, result) => {
        if (err) return common.sendFullResponse(req, res, 500, {}, err);
        if (result.length > 0) { 
            //res.send(result[0]["FL"]);
            let data = result[0]["FL"];
            let dataType = result[0]["IMG_TYPE"];
            var img = new Buffer(data, 'base64');

            res.writeHead(200, {
              'Content-Type': dataType,
              'Content-Length': img.length
            });
            res.end(img); 

        } else {
            res.send(null);
        }
    });
}

router.post('/create', create);
router.post('/update', update);
router.post('/remove', remove);
router.get('/status', getAllStatus);
router.get('/status-opr', getStatusExpense);
router.post('/remove-gpic', removeGoatPic);
router.get('/', getAllGoat);
router.get('/test', getAllGoatTest);
router.get('/:gtID', getAllGoat);
router.get('/goatpic/:gtId', getAllGoatPic); 
//router.get('/getpic/:gtId/:IOrP', getGoatPic); 

module.exports = router;
module.exports.getGoatPic = getGoatPic ;
module.exports.getAdsPic = getAdsPic ;