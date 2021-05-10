const express         = require('express');
//const config          = require('../config.js');
const router          = express.Router();
const common          = require('../helper/common');

let getCBS = (req, res) => {
    var sqlQuery = "SELECT [TASK_SL_NO]+' '+[TASK_CODE] DISPLAY_CODE, [CBS_ID],[TASK_CODE],[TASK_DESC],[TASK_SL_NO],[TASK_SL_NO_PARENT],[TASK_CATEGORY],[SORT_ORDER]  FROM [TB_CBS]"; 
    console.log(sqlQuery);
    common.exceSelect(sqlQuery, (err, result)=> {
        if(err) return common.sendFullResponse(req, res, 500, {}, err);
        if(result){
            common.sendFullResponse(req, res, 200, result, 'D');
        }
        else{
            common.sendFullResponse(req, res, 300, {}, "No users found");
        }
    })
}

let uptCBS = (req, res) => {
    
    if(req.body){
        data =JSON.parse(req.body.data);
    }
    //console.log(data);    
    if (!data) {
        return common.sendFullResponse(req, res, 300, {}, "Row data required");
    }
    var sqlQuery = "SELECT [TASK_CODE] FROM [TB_CBS] WHERE TASK_CODE='" + data.TASK_CODE +"' GROUP BY TASK_CODE HAVING COUNT(*)>1"  ;         
    common.exceSelect(sqlQuery, (err, result)=> {
        if(err) return common.sendFullResponse(req, res, 500, {}, err);
        if(result){
            if(result.length >0){
                common.sendFullResponse(req, res, 300, result, 'Task Code already exists');
            }else{
                sqlQuery = `UPDATE [TB_CBS]
                            SET [TASK_CODE] = '${data.TASK_CODE}' 
                            ,[TASK_DESC] = iif('${data.TASK_DESC}' ='null',null,'${data.TASK_DESC}')                            
                            ,[TASK_SL_NO] = iif('${data.TASK_SL_NO}' ='null',null,'${data.TASK_SL_NO}')
                            ,[TASK_SL_NO_PARENT] = iif('${data.TASK_SL_NO_PARENT}' ='null',null,'${data.TASK_SL_NO_PARENT}')
                            ,[TASK_CATEGORY] = '${data.TASK_CATEGORY}'                            
                            ,[SORT_ORDER] = ${data.SORT_ORDER}
                            OUTPUT deleted.TASK_CODE
                            WHERE [CBS_ID] = ${data.CBS_ID}` ;   
                console.log(sqlQuery);  
                common.exceSelect(sqlQuery, (err, rs)=> {
                    if(err) return common.sendFullResponse(req, res, 500, {}, err);
                    if(rs){
                        if(rs.length >0){
                            common.sendFullResponse(req, res, 200, rs, 'D');
                        }else{
                            common.sendFullResponse(req, res, 300, rs, 'Task Code Or Sl No already exits');    
                        }
                    }
                })         

            }
        }
        else{
            common.sendFullResponse(req, res, 300, {}, "Task Code Or Sl No already exits");
        }
    })
}


let delCBS = (req, res) => {
    
    if(req.body){
        data =JSON.parse(req.body.data);
    }
    //console.log(data);    
    if (!data) {
        return common.sendFullResponse(req, res, 300, {}, "Row Index ID Required");
    }
    
    var sqlQuery = `
                    DECLARE @vr_tb TABLE
                    (cbs_id int);
                    DECLARE @Id varchar = '${data.CBS_ID}'
                    ;WITH cte AS
                    (
                        SELECT a.CBS_ID, a.TASK_SL_NO
                        FROM TB_CBS a
                        WHERE a.CBS_ID = ${data.CBS_ID}
                        UNION ALL
                        SELECT a.CBS_ID, a.TASK_SL_NO
                        FROM TB_CBS a
                        join TB_CBS s 
                        on a.TASK_SL_NO_PARENT = s.TASK_SL_NO
                        JOIN cte c ON s.TASK_SL_NO_PARENT = c.TASK_SL_NO
                    )
                    insert into @vr_tb
                    SELECT a.CBS_ID
                    FROM cte a
                    select CBS_ID From  [TB_TIMESHEET] ts where ts.CBS_ID in (select CBS_ID from @vr_tb where CBS_ID<>${data.CBS_ID})
                    `;         
    console.log(sqlQuery);
    common.exceSelect(sqlQuery, (err, result)=> {
        if(err) return common.sendFullResponse(req, res, 500, {}, err);
        if(result){
            if(result.length >0){
                common.sendFullResponse(req, res, 300, result, 'Timesheet already booked cannot delete it.');
            }else{
                sqlQuery = `select CBS_ID From  [TB_CBS] c where  c.TASK_SL_NO_PARENT in 
                (select TASK_SL_NO from  [TB_CBS] a where a.CBS_ID=${data.CBS_ID})`;      
                console.log(sqlQuery);   
                common.exceSelect(sqlQuery, (err, rs1)=> {
                    if(err) return common.sendFullResponse(req, res, 500, {}, err);
                    if(rs1){
                        if(rs1.length >0){
                            common.sendFullResponse(req, res, 300, rs1, 'Please delete the child and then delete the parent');
                        }else{
                            sqlQuery = `DELETE FROM [TB_CBS]
                            OUTPUT Deleted.[TASK_SL_NO]  
                            WHERE [CBS_ID] = ${data.CBS_ID};` ;    
                            console.log(sqlQuery);
                            common.exceSelect(sqlQuery, (err, rs2)=> {
                                if(err) return common.sendFullResponse(req, res, 500, {}, err);
                                if(rs2){
                                    if(rs2.length >0){
                                        common.sendFullResponse(req, res, 200, rs2, "##" + rs2[0]["TASK_SL_NO"]+ ': Task Code not available');
                                    }else{
                                        common.sendFullResponse(req, res, 300, rs2, 'Task Code Not available');
                                    }
                                }else{
                                    common.sendFullResponse(req, res, 300, rs2, 'Task Code Not available');
                                }
                            })                         
                        }
                    }
                });

            }
        }else{
            common.sendFullResponse(req, res, 300, {}, "Task Code Or Sl No already exits");
        }
    })

       
}

let addCBS = (req, res) => {
    
    if(req.body){
        data =JSON.parse(req.body.data);
    }
    //console.log(data);    
    if (!data) {
        return common.sendFullResponse(req, res, 300, {}, "Insert data not available");
    }
    var sqlQuery = `SELECT [TASK_CODE] FROM [TB_CBS] WHERE ((TASK_CODE='${data.TASK_CODE}') or (TASK_SL_NO='${data.TASK_SL_NO}') ) GROUP BY TASK_CODE,TASK_SL_NO HAVING COUNT(*)>0`;         
    common.exceSelect(sqlQuery, (err, result)=> {
        if(err) return common.sendFullResponse(req, res, 500, {}, err);
        if(result){
            if(result.length >0){
                common.sendFullResponse(req, res, 300, result, 'Task Code Or Sl No already exists');
            }else{
                sqlQuery = `INSERT INTO [TB_CBS]
                        ([CBS_ID]
                        ,[TASK_CODE]
                        ,[TASK_DESC]          
                        ,[TASK_SL_NO]
                        ,[TASK_SL_NO_PARENT]
                        ,[TASK_CATEGORY]
                        ,[SORT_ORDER]) 
                    OUTPUT inserted.TASK_SL_NO
                    VALUES
                    ((select isnull(max(CBS_ID),0) from TB_CBS)+1
                    ,'${data.TASK_CODE}'
                    ,'${data.TASK_DESC}'
                    ,'${data.TASK_SL_NO}'
                    ,iif('${data.TASK_SL_NO_PARENT}'='null',null,'${data.TASK_SL_NO_PARENT}')
                    ,'${data.TASK_CATEGORY}'
                    ,${data.SORT_ORDER}); ` ;    
                common.exceSelect(sqlQuery, (err, rs)=> {
                if(err) return common.sendFullResponse(req, res, 500, {}, err);
                if(rs){
                    if(rs.length >0){
                        common.sendFullResponse(req, res, 200, rs, "##" + rs[0]["TASK_SL_NO"]+ ': CBS Added successfully!!');
                    }else{
                        common.sendFullResponse(req, res, 300, rs, err);    
                    }
                }
            })   
            }
        }else{
            common.sendFullResponse(req, res, 300, {}, "Task Code Or Sl No already exits");
        }
    })

       
}

/* ------------------------- ALL ROUTES ------------------------ */
 
router.get('/getdetail', getCBS); 
router.post('/uptdetail', uptCBS);
router.post('/deldetail', delCBS);
router.post('/adddetail', addCBS);

module.exports = router;
 