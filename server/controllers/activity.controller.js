const express         = require('express');
const router          = express.Router();
const common          = require('../helper/common');
const TYPES = require('tedious').TYPES;

let getAllActivity = (req,res) => {    
    var statement = `SELECT [GT_ACTIVITY_ID] GAI,[GT_ID] GI,[ACTIVITY_DT] AD,[WEIGHT] WT,[YEAR_MEDICINE] YM,[MONTH_MEDICINE] MM,[PTR] PT,[CHECK_WEIGHT] CW FROM [BK_TB_GT_ACTIVITY]`;
    common.exceSelect(statement, (err, result) => {
        if(err) return common.sendFullResponse(req, res, 500, {}, err);
        if (result.length > 0) {
            common.sendFullResponse(req, res, 200, result, "Users fetched successfully..!!");
        } else {
            common.sendFullResponse(req, res, 300, [], "No data found"); 
            

        }
    });
    common.get_req_client_id(req);
    common.get_req_user_id(req);
}

let uptAct = (req,res) => {     
    if(!req.body.rid){
        return common.sendFullResponse(req, res, 300, {}, "Act Detail Required!");
    }  
    if(!req.body.wght){
        return common.sendFullResponse(req, res, 300, {}, "weight Detail Required!");
    }   
    var statement = `
        update [TB_GT_ACT]  set UPD_DT=GETDATE(),UPD_USR_ID=${common.get_req_user_id(req)} , WGHT=${req.body.wght}  
        WHERE ACT_ID=${req.body.rid} AND CLIENT_ID=${common.get_req_client_id(req)}; SELECT @@ROWCOUNT CNT        
    `;
    common.exceSelect(statement, (err, result) => {
        if(err) return common.sendFullResponse(req, res, 500, {}, err);
        if (result.length > 0) {
            common.sendFullResponse(req, res, 200, result, "updated successfully..!!");
        } else {
            common.sendFullResponse(req, res, 300, [], "No data found");
        }
    });    
}


let addActByDate = (req,res) => {    
    if(!req.body.dt){
        return common.sendFullResponse(req, res, 300, {}, "Date Required!");
    }    
    let vUsID =  common.get_req_user_id(req);
    let vCID = common.get_req_client_id(req);
    var statement = `
        INSERT INTO [TB_GT_ACT]
        ([ACT_DT],[GT_ID],[WGHT],[CRE_USR_ID],[UPD_USR_ID],[CLIENT_ID])
        select '${req.body.dt}',ms.GT_ID,null,${vUsID} ,${vUsID} ,${vCID} 
        from [TB_GT_MASTER] ms where ms.STATUS_ID IN (SELECT GT_STATUS_ID from [TB_GT_STATUS] where GT_STATUS_CODE='alive') 
        and CLIENT_ID =${vCID} 
        and not exists (select 1 from [TB_GT_ACT] ac where ac.[GT_ID]=ms.[GT_ID] and ac.[ACT_DT]='${req.body.dt}')
        SELECT @@ROWCOUNT CNT        
    `;
    common.exceSelect(statement, (err, result) => {
        if(err) return common.sendFullResponse(req, res, 500, {}, err);
        if (result.length > 0) {
            common.sendFullResponse(req, res, 200, result, "updated successfully..!!");
        } else {
            common.sendFullResponse(req, res, 300, [], "No data found");
        }
    });    
}

let delActByDate = (req,res) => {     
    if(!req.body.dt){
        return common.sendFullResponse(req, res, 300, {}, "Date Required!");
    }        
    let vCID = common.get_req_client_id(req);
    var statement = `        
        delete from [TB_GT_ACT] where CLIENT_ID=${vCID}  AND ACT_DT='${req.body.dt}';
        SELECT @@ROWCOUNT CNT        
    `;
    common.exceSelect(statement, (err, result) => {
        if(err) return common.sendFullResponse(req, res, 500, {}, err);
        if (result.length > 0) {
            common.sendFullResponse(req, res, 200, result, "updated successfully..!!");
        } else {
            common.sendFullResponse(req, res, 300, [], "No data found");
        }
    });    
}


let getActivityDates = (req,res) => {    
   
    var statement = `
    SELECT * FROM ( 
    select distinct 
    CAST(ACT_DT AS DATE) AS ADT,  replace(CONVERT(NVARCHAR, ACT_DT, 106),' ','-')  AMT 
    FROM [TB_GT_ACT] 
    WHERE CLIENT_ID=${common.get_req_client_id(req)}  
    ) TMP ORDER BY ADT DESC 
    `;    
    
    common.exceSelect(statement, (err, result) => {
        if(err) return common.sendFullResponse(req, res, 500, {}, err);
        if (result.length > 0) {
            common.sendFullResponse(req, res, 200, result, "Su");
        } else {
            common.sendFullResponse(req, res, 300, [], "N/A");
        }
    });    
}



let getActivityWghtByDate = (req,res) => {    
   
    if(!req.params.mnth){
        return common.sendFullResponse(req, res, 300, result, "Month required!");
    }
    
    let vCID = common.get_req_client_id(req);
    var statement = 'sp_get_wght_diff';    
    let param = [
         {name:'p_client_id',type:TYPES.BigInt,value:vCID}    
        ,{name:'p_as_of_dt',type:TYPES.Date,value: req.params.mnth }   
        ]; 
    common.callProcedure(statement, param, (err, result) => {
        if(err) return common.sendFullResponse(req, res, 500, {}, err);
        if (result.length > 0) {
            common.sendFullResponse(req, res, 200, result, "Su");
        } else {
            common.sendFullResponse(req, res, 300, [], "N/A");
        }
    });    
}


let getActivityWghtByDateS = (req,res) => {    
  
    if(!req.params.mnth){
        return common.sendFullResponse(req, res, 300, result, "Month required!");
    }
    var statement = `  
                        select tmp3.*
                        ,REPLACE(CONVERT(CHAR(9),tmp3.PRV_DT, 6),' ', '-') PDT
                        ,REPLACE(CONVERT(CHAR(9),tmp3.ACT_DT, 6),' ', '-') ADT
                        from 
                        (
                            SELECT ROW_NUMBER() OVER(ORDER BY ACT_ID ) AS SNO
                            ,tmp2.ACT_ID RID,tmp2.GT_ID GID, M.GT_NO GNO
                            ,(select top 1 ss.GT_STATUS_NAME from TB_GT_STATUS ss where ss.GT_STATUS_ID = m.STATUS_ID) STS
                            ,(select top 1 ss.GT_STATUS_NAME from TB_GT_STATUS ss where ss.GT_STATUS_ID = m.BREED_ID) BRD
                            ,m.PARENT_GT_ID MNO,m.SHED SHD,m.SOLD_DT
                            ,CASE WHEN M.BIRTH_DT IS NULL THEN NULL ELSE CONCAT(Round(DATEDIFF(MONTH, M.BIRTH_DT, GETDATE()) / 12,0),'.',(DATEDIFF(MONTH, M.BIRTH_DT, GETDATE())%12)) END AGE
                            ,PRV_DT
                            ,tmp2.PRV_WGHT PWT
                            ,ACT_DT
                            , tmp2.WGHT AWT  
                            ,(select top 1 ss.GT_STATUS_CODE from TB_GT_STATUS ss where ss.GT_STATUS_ID = m.STATUS_ID) SCOD
                            from  
                            (
                                select tb2.*
                                ,(select top 1 act_id from TB_GT_ACT acc where acc.ACT_DT = tb2.ACT_DT AND acc.GT_ID= tb2.GT_ID) as ACT_ID 
                                ,(select top 1 WGHT from TB_GT_ACT acc where acc.ACT_DT = tb2.ACT_DT AND acc.GT_ID= tb2.GT_ID) as WGHT 
                                ,(select top 1 WGHT from TB_GT_ACT acc where acc.ACT_DT = tb2.PRV_DT AND acc.GT_ID= tb2.GT_ID) as PRV_WGHT 
                                from
                                ( 
                                    select 				
                                        cs.GT_ID
                                    ,(SELECT MAX(ACT_DT) FROM TB_GT_ACT ACC WHERE ACC.ACT_DT<'${req.params.mnth}') PRV_DT
                                    ,CAST('${req.params.mnth}'as date) ACT_DT FROM
                                    (
                                        select GT_ID from TB_GT_ACT AC where ac.act_dt='${req.params.mnth}' 
                                        AND ac.CLIENT_ID=${common.get_req_client_id(req)}  
                                        union 
                                        select GT_ID FROM  TB_GT_ACT AC where ac.act_dt=(SELECT MAX(ACT_DT) FROM TB_GT_ACT ACC WHERE ACC.ACT_DT<'${req.params.mnth}'
                                        AND ac.CLIENT_ID=${common.get_req_client_id(req)}
                                        )
                                    ) CS
                                ) tb2
                            ) tmp2 left join TB_GT_MASTER M
                            ON TMP2.GT_ID = M.GT_ID
                        ) tmp3  where 
                        (SCOD='sold' and tmp3.SOLD_DT> DATEADD(s,-1,DATEADD(mm, DATEDIFF(m,0,tmp3.ACT_DT)+1,0)))
                        or
                        (tmp3.SCOD <>'sold')
    `;    

    common.exceSelect(statement, (err, result) => {
        if(err) return common.sendFullResponse(req, res, 500, {}, err);
        if (result.length > 0) {
            common.sendFullResponse(req, res, 200, result, "Su");
        } else {
            common.sendFullResponse(req, res, 300, [], "N/A");
        }
    });    
}

//router.get('/getAllActivity', getAllActivity); 
router.get('/getActDt', getActivityDates); 
router.get('/getActLst/:mnth', getActivityWghtByDate); 
router.post('/uptAct', uptAct); 
router.post('/addAct',addActByDate)
router.post('/delAct',delActByDate)

module.exports = router;