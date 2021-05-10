/* ========================================================================== */
/*                                  USER VOWD                                 */
/* ========================================================================== */

const express         = require('express');
//const config          = require('../config.js');
const router          = express.Router();
const common          = require('../helper/common');
const TYPES = require('tedious').TYPES;

let getVOWD = (req, res) => {
    var sqlQuery = "select * From TB_VOWD"; 
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

let uptGenerateVOWD = (req, res) => {
    console.log(req.body);
    if(req.body){
        data = req.body.data;
    }
    if (!data.p_vowd_rpt_dt) {
        return common.sendFullResponse(req, res, 300, {}, "Please provide cut off date");
    }
    if (!data.p_vowd_f_dt) {
        return common.sendFullResponse(req, res, 300, {}, "Please provide the forecast date");
    }
    if (req.body.data) { 
        var statement = 'sp_add_vowd_rpt';    
        let paramIn = [
            ,{name:'p_vowd_rpt_dt',type:TYPES.Date,value:data.p_vowd_rpt_dt}  
            ,{name:'p_vowd_f_dt',type:TYPES.Date,value:data.p_vowd_f_dt}    
            ,{name:'p_force_delete',type:TYPES.VarChar,value:data.p_force_delete}    
            ,{name:'p_usr_id',type:TYPES.VarChar,value:data.p_usr_id}
            ];
        console.log(paramIn);
        let paramOut = [    
            ,{name:'p_err_code',type:TYPES.VarChar,value: null }
            ,{name:'p_err_desc',type:TYPES.VarChar,value: null }
            ];
        common.callProcedure(statement, paramIn,paramOut, (err, result) => { 
            //console.log(err) ;
            if(err) return common.sendFullResponse(req, res, 500, {}, err); 
            let errNO = null;
            let errDesc =null;
            paramOut.forEach(elem =>{
                if(elem.name =='p_err_code'){
                    errNO = elem.value
                }
                if(elem.name =='p_err_desc'){
                    errDesc = elem.value
                }  
            }) 
            common.sendFullResponse(req, res, errNO, result, errDesc);            
        });
    }
     
}



/* ------------------------- ALL ROUTES ------------------------ */
 
router.get('/getVOWD', getVOWD); 
router.post('/uptGenerateVOWD', uptGenerateVOWD);

module.exports = router;