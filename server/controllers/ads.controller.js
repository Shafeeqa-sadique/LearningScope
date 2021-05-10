
const express         = require('express');
const config          = require('../config.js');
const router          = express.Router();
const common          = require('../helper/common');
const jwt             = require('jsonwebtoken');
const passwordHash    = require('password-hash');
const multer = require('multer');
const fs = require('fs');
const base64Img = require('base64-img');
const randomstring    = require("randomstring");
const sms          = require('../helper/sms/nexmo');
const users = require('../models/user.model')

/* ------------------------------ REGISTER USER ----------------------------- */

/**
 * @param  {} req
 * @param  {} res
 * @param  {} next
 */
let register = (req, res, next) => { 
    
    if(!req.body.name) {
        return common.sendFullResponse(req, res, 300, {}, "Please enter name.");
    }
    if(!req.body.ph_no) {
        return common.sendFullResponse(req, res, 300, {}, "Please enter phone number.");
    } 
    if(!req.body.pwd) {
        return common.sendFullResponse(req, res, 300, {}, "Please enter password.");
    } 
    if(!req.body.co_ord) {
        return common.sendFullResponse(req, res, 300, {}, "Please choose your coordinates.");
    } 
    try {
        var smsCode = randomstring.generate( {length: 4, charset: '0123456789'});
        var sqlQuery = `         
            DECLARE @c_id int;
            DECLARE @table table (id int);
            declare @v_name as varchar(64)='${req.body.name}';
            declare @v_no as varchar(50)='${req.body.ph_no}';
            declare @v_cod as varchar(64)='${req.body.co_ord}';
            declare @v_pwd as varchar(64)='${req.body.pwd}';
            declare @v_code as varchar(8)='${smsCode}';

            if not exists
            (select 1 FROM TB_M_CLIENT C WHERE C.CLIENT_PUBLIC_NO =@v_no 
            UNION 
            select 1 FROM TB_M_USER C WHERE C.[MOBILE_NO] =@v_no 
            ) 
            BEGIN

                INSERT INTO [TB_M_CLIENT]
                ([CLIENT_PUBLIC_NAME],[CLIENT_PUBLIC_NO],[CLIENT_COORDINATES])
                output inserted.[CLIENT_ID] into @table
                values (@v_name,@v_no,@v_cod);
                SELECT @c_id = id from @table; 

                INSERT INTO [TB_M_USER]
                ([PASSWORD],[MOBILE_NO],[CLIENT_ID],[VERIFY_CODE])
                output inserted.[USER_ID] as U_ID VALUES
                (@v_pwd, @v_no,@c_id,@v_code)
            END 
            ELSE 
            BEGIN 
                SELECT 0 AS U_ID
            END 
        `
        common.exceSelect(sqlQuery, (err, result) => {
            if(err) return common.sendFullResponse(req, res, 500, {}, err);
            if (result.length > 0) {
                
                if(result[0].U_ID =="0")
                {
                    common.sendFullResponse(req, res, 300, result, "Phone number already registered, try forgot password.");     
                }
                else
                {
                    sms.send_verify_code(req.body.ph_no,smsCode, (err,results) => {
                        console.log('SMS err:' + err);
                        console.log('SMS Results:' + results);
                    });   
                    common.sendFullResponse(req, res, 200, result,"SMS Code: "+ smsCode + " User Created successfully..!!");  
                                        
                }
                    
            }
            else
            {
                common.sendFullResponse(req, res, 500, result, "Oops!! something went wrong ( AD002 )"); 
            }
        }); 

    }
    catch(err) {
        var message = 'Oops!! something went wrong ( AD001 )';
        return common.sendFullResponse(req, res, 500, {}, message);
    }
}


/* ------------------------------- LOGIN USER ------------------------------- */
/**
 * @param  {} req
 * @param  {} res
 * @param  {} next
 */

let login = (req, res, next) => {
    
    if(!req.body.usr_nm) {
        return common.sendFullResponse(req, res, 300, {}, "Please provide email address or phone number to login.");
    }
    if(!req.body.pwd) {
        return common.sendFullResponse(req, res, 300, {}, "Please enter password.");
    }    
    var email       = req.body.usr_nm;
    var password    = req.body.pwd;
    try {
            users.login(email,password, (err, result) =>{
            if(err) return common.sendFullResponse(req, res, 500, {}, err);
            if(result && result.length > 0) {
                common.sendFullResponse(req, res, 200, result, 'Login successfully!');
            } else
            {
                common.sendFullResponse(req, res, 300, result, 'Invalid Credentials!');
            }

        });
    } catch(err) {
        var message = 'Sorry! SQL Exception occurred!';
        return common.sendFullResponse(req, res, 300, {}, message);
    }
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
            if(!req.file) 
            {
                return common.sendFullResponse(req, res, 300, {}, "Please choose a image");
            }
            if (!req.body.wght) {
                return common.sendFullResponse(req, res, 300, {}, "Please provide wght");
            } 
            if (!req.body.amt) {
                return common.sendFullResponse(req, res, 300, {}, "Please enter amt");
            }    
            if (!req.body.remarks) {
                return common.sendFullResponse(req, res, 300, {}, "Please enter remarks");
            }   
            if (!req.body.brd) {
                return common.sendFullResponse(req, res, 300, {}, "Please enter brd");
            }                
            var sqlQuery = `
            INSERT INTO [TB_GT_ADS]
            ([GT_WGHT],[GT_SELL_AMT],[REMARKS],[BREED],[CLIENT_ID])
            OUTPUT inserted.ADS_ID VALUES
            (${req.body.wght},${req.body.amt},'${req.body.remarks}','${req.body.brd}',${vCID})
            `;
             
            common.exceSelect(sqlQuery, (err, result) => {
                if (err) return common.sendFullResponse(req, res, 500, {}, "Oops!!! Something went wrong (ADC002)");
                if (result.length > 0) {
                    if(req.file)
                    {
                        reduceImageSize(req.file.path, (err, vIconPath) => {
                            var picd = {
                                ADS_ID: result[0].ADS_ID,
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
                            var sqlQuery = `
                            INSERT INTO [TB_GT_ADS_PHOTO]
                            ([ADS_ID] ,[FILE_ATTRIBUTE] ,[FILE_SIZE] ,[FILE_STREAM] 
                            ,[CRE_USR_ID]  ,[UPD_USR_ID] ,[IMG_PATH] ,[ICON_PATH] ,[FILE_NAME] ,[ICON_STREAM]
                            ,[CLIENT_ID]) OUTPUT inserted.[GT_ADS_PHOTO_ID]
                            values (
                             ${picd.ADS_ID},'${picd.FILE_ATTRIBUTE}',${picd.FILE_SIZE},'${picd.FILE_STREAM}'
                             ,${vUID},${vUID},'${picd.IMG_PATH}','${picd.ICON_PATH}','${picd.FILE_NAME}','${picd.ICON_STREAM}'
                             ,${vCID}
                            )
                            `
                            common.exceSelect(sqlQuery, (err, result) => {
                                if (result.length > 0) {
                                    common.sendFullResponse(req, res, 200, result, "Added Successfully!!!");
                                }
                                else
                                {
                                    common.sendFullResponse(req, res, 300, result, "Oops!!! Something went wrong (ADC003)");
                                }
                            });
                        })    
                    }
                    else
                    {
                        common.sendFullResponse(req, res, 200, result, "Added Successfully!!!");
                    }
                   
                } else {
                    common.sendFullResponse(req, res, 300, {}, "Oops!!! Something went wrong (ADC001)");
                }
            });
        }
    });
}


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


let addpic = (req, res) => {
    let vCID = common.get_req_client_id(req)
    let vUID = common.get_req_user_id(req)
    var dir = './uploads/' + vCID;
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    let upload = multer({ storage: storage }).single("file");
    let vAdsID =0;
    upload(req, res, function (err) { 
        if(!req.file) 
        {
            return common.sendFullResponse(req, res, 300, {}, "Please choose a image");
        } 
        
        if (req.body.ads_id) {
           vAdsID = req.body.ads_id;
           console.log(vAdsID);
        } 
        
        if(vAdsID == 0)
        {
            var sqlQuery = `
            INSERT INTO [TB_GT_ADS]
            ([CLIENT_ID])
            OUTPUT inserted.ADS_ID VALUES
            (${vCID})
            `;
            common.exceSelect(sqlQuery, (err, result) => {
                if (err) return common.sendFullResponse(req, res, 500, {}, "Oops!!! Something went wrong (ADC002)");
                if (result.length > 0) {            
                   // console.log(result[0])    
                    vAdsID = result[0].ADS_ID 
                    insertImg(vUID, vCID, vAdsID, req, res);
                } else {
                    common.sendFullResponse(req, res, 300, {}, "Oops!!! Something went wrong (ADC001)");
                }
            });
        }  
        else
        {   
            insertImg(vUID, vCID, vAdsID, req, res);
            // reduceImageSize(req.file.path, (err, vIconPath) => {
            //     var picd = {
            //         ADS_ID: vAdsID,
            //         FILE_NAME: req.file.originalname,
            //         FILE_SIZE: req.file.size,
            //         FILE_ATTRIBUTE: req.file.mimetype,
            //         FILE_STREAM: base64Img.base64Sync(req.file.path),
            //         IMG_PATH: req.file.path.replace('./', '/'),
            //         CLIENT_ID: vCID,
            //         ICON_PATH: vIconPath,
            //         ICON_STREAM: base64Img.base64Sync(vIconPath),
            //         CRE_USR_ID: vUID
            //     } 
                
            //     var sqlQuery = `
            //     INSERT INTO [TB_GT_ADS_PHOTO]
            //     ([ADS_ID] ,[FILE_ATTRIBUTE] ,[FILE_SIZE] ,[FILE_STREAM] 
            //     ,[CRE_USR_ID]  ,[UPD_USR_ID] ,[IMG_PATH] ,[ICON_PATH] ,[FILE_NAME] ,[ICON_STREAM]
            //     ,[CLIENT_ID]) OUTPUT inserted.[GT_ADS_PHOTO_ID]
            //     values (
            //         ${vAdsID.toString()},'${picd.FILE_ATTRIBUTE}',${picd.FILE_SIZE},'${picd.FILE_STREAM}'
            //         ,${vUID},${vUID},'${picd.IMG_PATH}','${picd.ICON_PATH}','${picd.FILE_NAME}','${picd.ICON_STREAM}'
            //         ,${vCID}
            //     )
            //     `
                
            //     common.exceSelect(sqlQuery, (err, result) => {
            //         if (result.length > 0) {
            //             let row ={}
            //             row["ads_id"]= vAdsID
            //             row["photo"] = result
            //             common.sendFullResponse(req, res, 200, row, "Added Successfully!!!");
            //         }
            //         else
            //         {
            //             common.sendFullResponse(req, res, 300, result, "Oops!!! Something went wrong (ADC003)");
            //         }
            //     });
            // });
        }   
            
         
    });
 
}

let insertImg = (vUID, vCID, vAdsID, req, res) => {

    reduceImageSize(req.file.path, (err, vIconPath) => {
        var picd = {
            ADS_ID: vAdsID,
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
        
        var sqlQuery = `
        INSERT INTO [TB_GT_ADS_PHOTO]
        ([ADS_ID] ,[FILE_ATTRIBUTE] ,[FILE_SIZE] ,[FILE_STREAM] 
        ,[CRE_USR_ID]  ,[UPD_USR_ID] ,[IMG_PATH] ,[ICON_PATH] ,[FILE_NAME] ,[ICON_STREAM]
        ,[CLIENT_ID]) OUTPUT inserted.[GT_ADS_PHOTO_ID]
        values (
            ${vAdsID.toString()},'${picd.FILE_ATTRIBUTE}',${picd.FILE_SIZE},'${picd.FILE_STREAM}'
            ,${vUID},${vUID},'${picd.IMG_PATH}','${picd.ICON_PATH}','${picd.FILE_NAME}','${picd.ICON_STREAM}'
            ,${vCID}
        )
        `
        
        common.exceSelect(sqlQuery, (err, result) => {
            if (result.length > 0) {
                let row ={}
                row["ads_id"]= vAdsID
                row["photo"] = result
                common.sendFullResponse(req, res, 200, row, "Added Successfully!!!");
            }
            else
            {
                common.sendFullResponse(req, res, 300, result, "Oops!!! Something went wrong (ADC003)");
            }
        });
    });
}

let edit = (req, res) => {
    let vCID = common.get_req_client_id(req)
    let vUID = common.get_req_user_id(req)
    
    if (!req.body.ads_id) {
        return common.sendFullResponse(req, res, 300, {}, "Please provide id");
    } 
    if (!req.body.wght) {
        return common.sendFullResponse(req, res, 300, {}, "Please provide wght");
    } 
    if (!req.body.amt) {
        return common.sendFullResponse(req, res, 300, {}, "Please enter amt");
    }    
    if (!req.body.remarks) {
        return common.sendFullResponse(req, res, 300, {}, "Please enter remarks");
    }   
    if (!req.body.brd) {
        return common.sendFullResponse(req, res, 300, {}, "Please enter brd");
    }                
    var sqlQuery = `
    UPDATE [TB_GT_ADS]
    SET [GT_WGHT] = ${req.body.wght}
        ,[GT_SELL_AMT] = ${req.body.amt}
        ,[REMARKS] = '${req.body.remarks}'
        ,[UPD_DT] = getdate()
        ,[UPD_USR_ID] = ${vUID}
        ,[BREED] = '${req.body.brd}'
        OUTPUT deleted.ADS_ID
    WHERE  [ADS_ID]=${req.body.ads_id} and [CLIENT_ID]=${vCID}
    `;
    console.log(sqlQuery);
    common.exceSelect(sqlQuery, (err, result) => {
        if (err) return common.sendFullResponse(req, res, 500, {}, "Oops!!! Something went wrong (ADE002)");
        if (result.length > 0) { 
            common.sendFullResponse(req, res, 200, result, "Updated Successfully!!!");
                
        } else {
            common.sendFullResponse(req, res, 300, {}, "Oops!!! Ads does not exists.");
        }
    });
     
     
}

// let edit = (req, res) => {
//     let vCID = common.get_req_client_id(req)
//     let vUID = common.get_req_user_id(req)
//     var dir = './uploads/' + vCID;
//     if (!fs.existsSync(dir)) {
//         fs.mkdirSync(dir);
//     }

//     let upload = multer({ storage: storage }).single("file");
    
//     upload(req, res, function (err) {
      
//         if (err) {
//             console.log(err);
//         } else {
//             if(!req.file) 
//             {
//                 return common.sendFullResponse(req, res, 300, {}, "Please choose a image");
//             }
//             if (!req.body.id) {
//                 return common.sendFullResponse(req, res, 300, {}, "Please provide id");
//             } 
//             if (!req.body.wght) {
//                 return common.sendFullResponse(req, res, 300, {}, "Please provide wght");
//             } 
//             if (!req.body.amt) {
//                 return common.sendFullResponse(req, res, 300, {}, "Please enter amt");
//             }    
//             if (!req.body.remarks) {
//                 return common.sendFullResponse(req, res, 300, {}, "Please enter remarks");
//             }   
//             if (!req.body.brd) {
//                 return common.sendFullResponse(req, res, 300, {}, "Please enter brd");
//             }                
//             var sqlQuery = `
//             UPDATE [TB_GT_ADS]
//             SET [GT_WGHT] = ${req.body.wght}
//                 ,[GT_SELL_AMT] = ${req.body.amt}
//                 ,[REMARKS] = '${req.body.remarks}'
//                 ,[UPD_DT] = getdate()
//                 ,[UPD_USR_ID] = ${vUID}
//                 ,[BREED] = '${req.body.brd}'
//                 OUTPUT deleted.ADS_ID
//             WHERE  [ADS_ID]=${req.body.id} 
//             `;
//             common.exceSelect(sqlQuery, (err, result) => {
//                 if (err) return common.sendFullResponse(req, res, 500, {}, "Oops!!! Something went wrong (ADE002)");
//                 if (result.length > 0) {
//                     if(req.file)
//                     {
//                         reduceImageSize(req.file.path, (err, vIconPath) => {
//                             var picd = {
//                                 ADS_ID: result[0].ADS_ID,
//                                 FILE_NAME: req.file.originalname,
//                                 FILE_SIZE: req.file.size,
//                                 FILE_ATTRIBUTE: req.file.mimetype,
//                                 FILE_STREAM: base64Img.base64Sync(req.file.path),
//                                 IMG_PATH: req.file.path.replace('./', '/'),
//                                 CLIENT_ID: vCID,
//                                 ICON_PATH: vIconPath,
//                                 ICON_STREAM: base64Img.base64Sync(vIconPath),
//                                 CRE_USR_ID: vUID
//                             } 
//                             var sqlQuery = `
//                             UPDATE  [TB_GT_ADS_PHOTO]
//                             SET  [FILE_ATTRIBUTE] = '${picd.FILE_ATTRIBUTE}'
//                                 ,[FILE_SIZE] = ${picd.FILE_SIZE}
//                                 ,[FILE_STREAM] = '${picd.FILE_STREAM}'
//                                 ,[UPD_DT] = getdate()
//                                 ,[UPD_USR_ID] = ${vUID}
//                                 ,[IMG_PATH] ='${picd.IMG_PATH}'
//                                 ,[ICON_PATH] ='${picd.ICON_PATH}'
//                                 ,[FILE_NAME] = '${picd.FILE_NAME}'
//                                 ,[ICON_STREAM] ='${picd.ICON_STREAM}'
//                                 OUTPUT DELETED.GT_ADS_PHOTO_ID
//                             WHERE [ADS_ID]= ${picd.ADS_ID} 
//                             ` 
                            
//                             common.exceSelect(sqlQuery, (err, result) => {
//                                 if (result.length > 0) {
//                                     common.sendFullResponse(req, res, 200, result, "Updated Successfully!!!");
//                                 }
//                                 else
//                                 {
//                                     common.sendFullResponse(req, res, 300, result, "Oops!!! Something went wrong (ADE003)");
//                                 }
//                             });
//                         })    
//                     }
//                     else
//                     {
//                         common.sendFullResponse(req, res, 200, result, "Added Successfully!!!");
//                     }
                   
//                 } else {
//                     common.sendFullResponse(req, res, 300, {}, "Oops!!! Something went wrong (ADE001)");
//                 }
//             });
//         }
//     });
// }

/* ------------------------------ DELETE ADS ----------------------------- */ 
/**
 * @param  {} req
 * @param  {} res
 * @param  {} next
 */
let delads = (req, res, next) => { 
    let vCID = common.get_req_client_id(req) 
    if(!req.body.ads_id) {
        return common.sendFullResponse(req, res, 300, {}, "Please provide id.");
    } 
    try {
        var sqlQuery = `         
        UPDATE [TB_GT_ADS]
        SET [IS_DELETED] = 1
            OUTPUT deleted.ADS_ID
        WHERE  [ADS_ID]=${req.body.ads_id} and [CLIENT_ID]=${vCID}
        ` 
        common.exceSelect(sqlQuery, (err, result) => {
            if(err) return common.sendFullResponse(req, res, 500, {}, err);
            if (result.length > 0) {                
               common.sendFullResponse(req, res, 200, result, "Deleted successfully..!!");    
            }
            else
            {
                common.sendFullResponse(req, res, 500, result, "Oops!! something went wrong ( ADD001 )"); 
            }
        });  
    }
    catch(err) {
        var message = 'Oops!! something went wrong ( ADD002 )';
        return common.sendFullResponse(req, res, 500, {}, message);
    }
}

/* ------------------------------ DELETE PIC ----------------------------- */ 
/**
 * @param  {} req
 * @param  {} res
 * @param  {} next
 */
let delpic = (req, res, next) => { 
    let vCID = common.get_req_client_id(req) 
    if(!req.body.ads_photo_id) {
        return common.sendFullResponse(req, res, 300, {}, "Please provide delete picture id.");
    } 
    try {
        var sqlQuery = `         
        DELETE FROM [TB_GT_ADS_PHOTO] 
        OUTPUT deleted.gt_ads_photo_id as ads_photo_id 
        WHERE  [GT_ADS_PHOTO_ID]=${req.body.ads_photo_id} and [CLIENT_ID]=${vCID}
        ` 
        common.exceSelect(sqlQuery, (err, result) => {
            if(err) return common.sendFullResponse(req, res, 500, {}, err);
            if (result.length > 0) {                
               common.sendFullResponse(req, res, 200, result, "Deleted successfully..!!");    
            }
            else
            {
                common.sendFullResponse(req, res, 300, result, "Oops!! Picture doesnt not exists!!"); 
            }
        });  
    }
    catch(err) {
        var message = 'Oops!! something went wrong ( ADD002 )';
        return common.sendFullResponse(req, res, 500, {}, message);
    }
}

/* ------------------------------ DELETE USER ----------------------------- */ 
/**
 * @param  {} req
 * @param  {} res
 * @param  {} next
 */
let deluser = (req, res, next) => { 
    let vCID = common.get_req_client_id(req) 
    if(!req.body.CI) {
        return common.sendFullResponse(req, res, 300, {}, "Please provide auth request for client id.");
    } 
    try {
        var sqlQuery = `         
        DELETE FROM TB_M_USER AS US WHERE US.CLIENT_ID = ${vCID};
        DELETE FROM TB_M_CLIENT AS CC 
        OUTPUT deleted.CLIENT_ID as CI 
        WHERE CC.CLIENT_ID = ${vCID};
        ` 
        common.exceSelect(sqlQuery, (err, result) => {
            if(err) return common.sendFullResponse(req, res, 500, {}, err);
            if (result.length > 0) {                
               common.sendFullResponse(req, res, 200, result, "Deleted successfully..!!");    
            }
            else
            {
                common.sendFullResponse(req, res, 300, result, "Oops!! Picture doesnt not exists!!"); 
            }
        });  
    }
    catch(err) {
        var message = 'Oops!! something went wrong ( ADD002 )';
        return common.sendFullResponse(req, res, 500, {}, message);
    }
}


/* ------------------------------ GET ADS ----------------------------- */

/**
 * @param  {} req
 * @param  {} res
 * @param  {} next
 */
let getads = (req, res, next) => { 
   
    try {
        let adsidQry =" AND 1=1 ";
         
        console.log(req.query.adsid)
        if (req.query.adsid) {
           adsidQry = adsidQry + " AND ADS_ID=" + req.query.adsid
           //console.log(req.params.adsid)
        }
         

        var sqlQuery = `         
        SELECT  C.[CLIENT_ID]
        ,[CLIENT_PUBLIC_NAME] as NME      
        ,[CLIENT_PUBLIC_EMAIL] AS EMAIL
        ,[CLIENT_PUBLIC_NO] AS PHNO
        ,[CLIENT_PUBLIC_ADDRESS] AS ADDR
        ,[CLIENT_COORDINATES] AS COORD      
        FROM  [TB_M_CLIENT] C 
        WHERE EXISTS (SELECT 1 FROM TB_GT_ADS ADS where ads.CLIENT_ID = C.CLIENT_ID AND ads.IS_DELETED = 0 ${adsidQry})
        ` 
        console.log(sqlQuery)
        common.exceSelect(sqlQuery, (err, clntData) => {
            if(err) return common.sendFullResponse(req, res, 500, {}, err);
            if (clntData.length > 0) {    
               // console.log(clntData) 
                let sqlQuery = `         
                select 
                ad.ADS_ID,
                ad.CLIENT_ID as CI,
                ad.BREED as BRD,
                ad.GT_SELL_AMT as AMT,
                AD.GT_WGHT AS WGHT,
                AD.REMARKS 
                From TB_GT_ADS ad 
                where ad.IS_DELETED = 0 ${adsidQry}               
                ` 
                var returnData = [];
                common.exceSelect(sqlQuery, (err, adsData) => {
                    if(err) return common.sendFullResponse(req, res, 500, {}, err);
                    if (adsData.length > 0) {
                        let sqlQuery = `         
                            select ADS_ID
                            ,pt.GT_ADS_PHOTO_ID
                            ,CONCAT('/adspic/',PT.GT_ADS_PHOTO_ID,'/p') as PIC_URL 
                            ,CONCAT('/adspic/',PT.GT_ADS_PHOTO_ID,'/i') as ICON_URL
                            From TB_GT_ADS_PHOTO pt where exists (select 1 from TB_GT_ADS ad where ad.IS_DELETED=0  ${adsidQry})              
                            `
                            common.exceSelect(sqlQuery, (err, picsData) => {
                                if(err) return common.sendFullResponse(req, res, 500, {}, err);
                                if (picsData.length > 0) {
                                    clntData.forEach(clnt => {
                                        let row ={}
                                        row.CI = clnt.CLIENT_ID;
                                        row.NME = clnt.NME;
                                        row.EMAIL= clnt.EMAIL;
                                        row.PHNO =clnt.PHNO;
                                        row.ADDR=clnt.ADDR;
                                        row.COORD= clnt.COORD;
                                        //row.ADS = adsData.filter(value => value.CI == clnt.CLIENT_ID);
                                        
                                        let adsDataRow =[];
                                        adsDataRow = adsData.filter(value => value.CI == clnt.CLIENT_ID);
                                       // console.log(adsDataRow)
                                       let rowAds =[];
                                        adsDataRow.forEach(ads => { 
                                            let rowAd ={};
                                            rowAd.ADS_ID = ads.ADS_ID;
                                            //rowAd.CI= ads.CI;
                                            rowAd.BRD= ads.BRD;
                                            rowAd.AMT= ads.AMT;
                                            rowAd.WGHT= ads.WGHT;
                                            rowAd.REMARKS= ads.REMARKS ;
                                            rowAd.PICS = picsData.filter(value => value.ADS_ID == ads.ADS_ID) 
                                            rowAds.push(rowAd)
                                        }) 
                                        
                                        row.ADS = rowAds 
                                        returnData.push(row);
                                    });
                                    
                                }
                                common.sendFullResponse(req, res, 200, returnData, "Successful!!!"); 
                            });

                       
                        

                        
                            
                    }
                });
            }
            else
            {
                common.sendFullResponse(req, res, 300, null, "No ads available as of now"); 
            }
        }); 

    }
    catch(err) {
        var message = 'Oops!! something went wrong ( ADG002 )';
        return common.sendFullResponse(req, res, 500, {}, message);
    }
}


/* ------------------------------ VERIFY CODE----------------------------- */

/**
 * @param  {} req
 * @param  {} res
 * @param  {} next
 */
let verify = (req, res, next) => {
    if(!req.body.uid) {
        return common.sendFullResponse(req, res, 300, {}, "Please provide user id");
    }
    if(!req.body.code) {
        return common.sendFullResponse(req, res, 300, {}, "Please provide verify code");
    }   
    if(!req.body.usr_nm) {
        return common.sendFullResponse(req, res, 300, {}, "Please provide user id");
    }
    if(!req.body.pwd) {
        return common.sendFullResponse(req, res, 300, {}, "Please provide verify code");
    }    
    var uid    = req.body.uid;
    var code   = req.body.code;
    var usr_nm = req.body.usr_nm;
    var pwd    = req.body.pwd;
    try {
        var sqlQuery = `
        UPDATE TB_M_USER SET IS_MOBILE_VERIFIED=1 
        OUTPUT deleted.USER_ID as U_ID
        WHERE USER_ID = ${uid} and VERIFY_CODE='${code}' and IS_MOBILE_VERIFIED=0`;
        common.exceSelect(sqlQuery, (err, result)=> {            
            if(err) return common.sendFullResponse(req, res, 500, {}, err);   
            if(result && result.length > 0) {          
                users.login(usr_nm,pwd, (errs, results) =>{
                    if(errs) return common.sendFullResponse(req, res, 500, {}, errs); 
                    if(results) { 
                        common.sendFullResponse(req, res, 200, results, 'Code Validated Successfully!!');
                    } else {
                        common.sendFullResponse(req, res, 300, {}, 'Invalid Credentials!!');
                    }
                });
            }
            else
            {
                common.sendFullResponse(req, res, 300, {}, 'Invalid Code');
            }
        });
    } catch(err) {
        var message = 'Sorry! SQL Exception occurred!';
        return common.sendFullResponse(req, res, 300, {}, message);
    }
}

let reduceImageSize = (fileName, callback) => {

    var nPath = fileName.replace('.', '-ic.');
    var sharp = require('sharp');
    sharp(fileName)
        .resize(45, 45)
        .toFile(nPath, function (err) {
            // output.jpg is a 300 pixels wide and 200 pixels high image
            // containing a scaled and cropped version of input.jpg
            console.log(err)
            return callback(err, nPath);
        }); 
}



router.post('/register', register); 
router.post('/verify', verify); 
router.post('/login', login); 
router.post('/addpic',addpic);
//router.post('/addads', create); 
router.post('/editads', edit); 
router.post('/delads', delads); 
router.post('/delpic', delpic); 
router.post('/deluser', deluser); 
router.get('/getads', getads); 
router.get('/getads/:adsid', getads); 

module.exports = router;