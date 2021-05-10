/* ========================================================================== */
/*                                  USER API'S                                */
/* ========================================================================== */

const express         = require('express');
//const config          = require('../config.js');
const router          = express.Router();
const common          = require('../helper/common');
// const jwt             = require('jsonwebtoken');
// const passwordHash    = require('password-hash');
// const randomstring    = require("randomstring");
const TYPES = require('tedious').TYPES;

let getPAFReg = (req, res) => {
    var sqlQuery = "select * From TB_PAF_REGISTER"; 
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

let uptPAFReg = (req, res) => {
    //console.log(req.body);   
    if(req.body){
        data =req.body.data;
    }
    console.log(data);
    var rwIdx = data.ID;
    var colType = data.ctype;
    var colVal = data.cval;
    var colName = data.cname;
    if (!rwIdx) {
        return common.sendFullResponse(req, res, 300, {}, "Row Index required");
    }
    if (!colType) {
        return common.sendFullResponse(req, res, 300, {}, "Column Type required");
    }
    // if (!colVal) {
    //     return common.sendFullResponse(req, res, 300, {}, "Column value required");
    // }
    if (!colName) {
        return common.sendFullResponse(req, res, 300, {}, "Column name required");
    }
    var sqlValue = colName +'=';
    if(colType=='number') {
        sqlValue = sqlValue +colVal + ' where  PAF_ID=' + rwIdx;
    } else {
        sqlValue = sqlValue +'\''+ colVal + '\' where  PAF_ID=' + rwIdx;
    }
    
    var sqlQuery = "update TB_PAF_REGISTER  set " + sqlValue; 
    console.log(sqlQuery);
    // common.sendFullResponse(req, res, 200, null, 'D');

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


let addPAFReg =(req, res) =>{ 
     if (req.body.data) {
        data = JSON.parse(req.body.data);
        var sqlCol ="";
        var sqlVal="";
        Object.keys(data).forEach(function(key) {
            let cNme =key;
            let cVal =data[key]; 
            if(cNme == "PAF_ID") {
                sqlCol = sqlCol+cNme+","
                sqlVal =  sqlVal+"ISNULL((select max(PAF_ID) from TB_PAF_REGISTER),0)+1,"
            } else if((cNme == "Rev") || (cNme.includes("Rate") == true)){ 
                sqlCol = sqlCol+cNme+","
                sqlVal =  sqlVal+cVal+"," 
              }else if(
                (cNme.includes("Dt") == true) ||
                (cNme.includes("Date") == true)
              ){ 
                sqlCol = sqlCol + cNme + ","
                sqlVal = sqlVal + "'" + cVal + "'," 
              }
              else{
                sqlCol = sqlCol+cNme+","
                sqlVal =  sqlVal+"'"+cVal+"'," 
              }
        })
     }
     let sqlQuery =`INSERT INTO TB_PAF_REGISTER 
     ( ${sqlCol.substring(0,sqlCol.lastIndexOf(","))} ) 
     OUTPUT inserted.PAF_ID,inserted.PAAFNo
     VALUES 
     (${sqlVal.substring(0,sqlVal.lastIndexOf(","))})`

     console.log(sqlQuery);
     common.exceSelect(sqlQuery, (err, result)=> {
        if(err) return common.sendFullResponse(req, res, 500, {}, err);
        if(result){
            if(result.length >0){
                common.sendFullResponse(req, res, 200, result,'##'+ result[0]['PAF_ID'] +' PAAF Added Successfully!!!');
              }
              else{
                common.sendFullResponse(req, res, 300, {}, '##Error1 adding new PAAF');
              }
        }
        else{
            common.sendFullResponse(req, res, 300, {}, '###Error2 adding new PAAF');
        }
    })
}

let addPAFRegNOTUsed =(req, res) =>{
  
     // console.log(req.body);
      if (req.body.data) {
          data = JSON.parse(req.body.data);
          //console.log(data);
          var statement = 'sp_add_paaf'; 
          let paramIn =[];   
          Object.keys(data).forEach(function(key) {
            //console.table('Key : ' + key + ', Value : ' + data[key])
            //paramIn[key]=data[key];
            let row ={}
            row["name"] =key;
            row["value"] =data[key];
            if(key == "PAF_ID"){
              row["type"] =TYPES.Int;
            } else if(
              // (key == "PAAFNo") || 
              (key == "Rev")  
            ){
              row["type"] =TYPES.Float;
            }else if(
              (key== "ContractRate")
            ){
              row["type"] =TYPES.Money;
            }else if(
              (key.includes("Dt") == true) ||
              (key.includes("Date") == true)
            ){
              row["type"] =TYPES.Date;
            }
            else{
              row["type"] =TYPES.NVarChar;
            }
            
            paramIn.push(row);
          })
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
              if (errNO == '200') {                         
                  common.sendFullResponse(req, res, errNO, result, errDesc);
              } else {                         
                  common.sendFullResponse(req, res, 300, result, errDesc);
              }
          });
         
  }
        
 
}

let delPAFReg = (req, res) => {
  console.log(req.body);
  if(req.body){
    data =  JSON.parse(req.body.data);
  }
  var rwIdx = data.PAF_ID; 
  if (!rwIdx) {
      return common.sendFullResponse(req, res, 300, {}, "PAF ID required");
  }
  var sqlQuery = `
      select TS_ID From TB_TIMESHEET t where t.PAF_ID = ${rwIdx}
      `;      
      console.log(sqlQuery);   
      common.exceSelect(sqlQuery, (err, rs1)=> {
          if(err) return common.sendFullResponse(req, res, 500, {}, err);
          if(rs1){
              if(rs1.length >0){
                  common.sendFullResponse(req, res, 300, rs1, 'Already timesheet has been booked, please contact support team to delete it.');
              }else{
                    sqlQuery = "delete from TB_PAF_REGISTER OUTPUT deleted.PAF_ID where PAF_ID=" + rwIdx; 
                    console.log(sqlQuery);
                    common.exceSelect(sqlQuery, (err, result)=> {
                        if(err) return common.sendFullResponse(req, res, 500, {}, err);
                        if(result){
                            if(result.length >0){
                              common.sendFullResponse(req, res, 200, result,'##'+ result[0]['PAF_ID'] +' Deleted Successfully!!!');
                            }
                            else{
                              common.sendFullResponse(req, res, 300, {}, '##'+ data.ID + ' does not exists');
                            }
                        }
                        else{
                            common.sendFullResponse(req, res, 300, {}, '##'+ data.ID + ' does not exists');
                        }
                    })
                  }
          }else{
            return common.sendFullResponse(req, res, 500, {}, "There is some issue while deleting");
          }
      });
}

let getPosition = (req, res) => {
  var sqlQuery = "SELECT  [DISP_ID],[DISP_VALUE],[DISP_NAME],[CODE] FROM [DB_PS_GCMC].[dbo].[TB_M_CODE] where code='CODE_POSITION' "; 
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


/* ------------------------- ALL ROUTES ------------------------ */
 
router.get('/getpafreg', getPAFReg);
router.post('/uptpafreg', uptPAFReg);
router.post('/addpafreg', addPAFReg);
router.post('/delpafreg', delPAFReg);
router.get('/getPosition', getPosition);

module.exports = router;
 