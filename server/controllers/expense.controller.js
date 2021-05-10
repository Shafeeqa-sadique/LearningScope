const express         = require('express');
const router          = express.Router();
const common          = require('../helper/common');


let addExpense = (req,res) => {   
    //console.log('Hited')  ;
    //console.log(req.body.data)
    if(req.body){
        data = JSON.parse(req.body.data);
    }
    if(!data.td) {
        return common.sendFullResponse(req, res, 300, {}, "Transaction date is required");
    }
    if(!data.OPR) {
        return common.sendFullResponse(req, res, 300, {}, "Transaction category is required");
    }
    var statement = `
    INSERT INTO TB_GT_OPR_COST (OPR_DT,GT_STATUS_ID,CREDIT,DEBIT,REMARKS,CLIENT_ID,CRE_USR_ID,UPD_USR_ID) 
    output inserted.OPR_ID values ('${data.td}',${data.OPR}
    ,${data.CT == undefined || data.CT == "" || data.CT.length == 0 ? 'Null' : data.CT  }
    ,${data.DT == undefined || data.DT == "" || data.DT.length == 0 ? 'Null' : data.DT  }
    ,'${data.RS == undefined || data.RS == "" || data.RS.length == 0 ? '' : data.RS  }'
    ,${common.get_req_client_id(req)},${common.get_req_user_id(req)},${common.get_req_user_id(req)})      
    `;       
   console.log(statement);
    common.exceSelect(statement, (err, result) => {
        if(err) return common.sendFullResponse(req, res, 500, {}, err);
        if (result.length > 0) {
            common.sendFullResponse(req, res, 200, result, "Expense added successfully!!");
        } else {
            common.sendFullResponse(req, res, 300, [], "Something went wrong!!!");
        }
    });
    
}

let getAllExpenses = (req,res) => {    
    //console.log('Client ID:' + common.get_req_client_id(req)); //2019-02-07 0635    
    //console.log(JSON.parse(req.body.data));
    //console.log(req.body.yr.length);
    var statement = `
    SELECT  OPR_ID RID, ROW_NUMBER() OVER(ORDER BY OPR_DT DESC,OPR_ID ASC) AS SL,REPLACE(CONVERT(CHAR(9),[OPR_DT], 6),' ', '-') OD
        ,ST.GT_STATUS_NAME OTC
        ,[CREDIT] CT
        ,[DEBIT] DT
        ,[REMARKS] RS from TB_GT_OPR_COST CT LEFT JOIN TB_GT_STATUS ST ON CT.GT_STATUS_ID = ST.GT_STATUS_ID where CT.client_id=${common.get_req_client_id(req)} 
     ${ req.body.yr == undefined || req.body.yr == "" || req.body.yr.length == 0 ? '' : ' AND YEAR([OPR_DT]) IN (' + req.body.yr +')'  }   
     ${ req.body.mnth == undefined  || req.body.mnth == "" || req.body.mnth.length == 0 ? '' : ' AND month([OPR_DT]) IN (' + req.body.mnth +') '  }   
    `;
    console.log(statement);
    common.exceSelect(statement, (err, result) => {
        if(err) return common.sendFullResponse(req, res, 500, {}, err);
        if (result.length > 0) {
            common.sendFullResponse(req, res, 200, result, "Users fetched successfully..!!");
        } else {
            common.sendFullResponse(req, res, 300, [], "No data found");
        }
    });
    
}

let delExpense = (req,res) => {     
    if(!req.body.RID){
        return common.sendFullResponse(req, res, 300, result, "Sl No. required!");
    }   
    var statement = `
     delete from TB_GT_OPR_COST OUTPUT deleted.OPR_ID RID where client_id=${common.get_req_client_id(req)} 
     and OPR_ID=${req.body.RID} 
    `;
    console.log(statement);
    common.exceSelect(statement, (err, result) => {
        if(err) return common.sendFullResponse(req, res, 500, {}, err);
        if (result.length > 0) {
            common.sendFullResponse(req, res, 200, result, "deleted successfully..!!");
        } else {
            common.sendFullResponse(req, res, 300, [], "No data found");
        }
    });
    
}

let getGetExpMonth = (req,res) => {    
    
    // var statement = `
    // select  DFT_SELECT DS,DISP_VALUE DV,DISP_NAME  DN
    // from
    // (
    //     --select 0 DFT_SELECT,GETDATE() AS DISP_VALUE,'All' as DISP_NAME 
    //     --FROM [dbo].[TB_GT_OPR_COST] where CLIENT_ID=${common.get_req_client_id(req)}
    //     --UNION          
    //     SELECT 
    //     case when dt_month = (select max(DATEADD(month, DATEDIFF(month, 0, [OPR_DT]), 0)) from [dbo].[TB_GT_OPR_COST]) then 1 else 0 end DFT_SELECT
    //     ,dt_month DISP_VALUE,DT DISP_NAME FROM
    //     (
    //     SELECT  
    //     distinct DATEADD(month, DATEDIFF(month, 0, [OPR_DT]), 0) dt_month,  right(REPLACE(CONVERT(VARCHAR(11), [OPR_DT], 106),' ','-'),8) DT     
    //     FROM  [dbo].[TB_GT_OPR_COST] where CLIENT_ID=${common.get_req_client_id(req)}
    //     ) TMP 
    // ) tpm1 order by DISP_VALUE DESC
    // `;

    var statement = `
    select  DFT_SELECT DS,DISP_VALUE DV,DISP_NAME  DN
    from
    (              
        SELECT 
        case when dt_month = (select max(DATEADD(month, DATEDIFF(month, 0, [OPR_DT]), 0)) from [dbo].[TB_GT_OPR_COST]) then 1 else 0 end DFT_SELECT
        ,dt_month DISP_VALUE,DT DISP_NAME FROM
        (
        SELECT  
        distinct DATEADD(month, DATEDIFF(month, 0, [OPR_DT]), 0) dt_month,  right(REPLACE(CONVERT(VARCHAR(11), [OPR_DT], 106),' ','-'),8) DT     
        FROM  [dbo].[TB_GT_OPR_COST] where CLIENT_ID=${common.get_req_client_id(req)}
        ) TMP 
    ) tpm1 order by DISP_VALUE DESC
    `;
    console.log(statement);
    common.exceSelect(statement, (err, result) => {
        if(err) return common.sendFullResponse(req, res, 500, {}, err);
        if (result.length > 0) {
            common.sendFullResponse(req, res, 200, result, "Users fetched successfully..!!");
        } else {
            common.sendFullResponse(req, res, 300, [], "No data found");
        }
    });
    
}

router.post('/getAllExpenses', getAllExpenses); 
router.get('/getGetExpMonth', getGetExpMonth); 
router.post('/addExpense',addExpense);
router.post('/delExpense',delExpense);

module.exports = router;