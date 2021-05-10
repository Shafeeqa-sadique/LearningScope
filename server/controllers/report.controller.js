/* ========================================================================== */
/*                                  USER API'S                                */
/* ========================================================================== */

const express         = require('express');
//const config          = require('../config.js');
const router          = express.Router();
const common          = require('../helper/common');
//import { Parser } from 'json2csv';
const Json2csvParser = require("json2csv").Parser;
// const jwt             = require('jsonwebtoken');
// const passwordHash    = require('password-hash');
// const randomstring    = require("randomstring");


let getWeeklyTimesheet = (req, res) => {
    console.log(req.params);
    console.log(req.query);
    var qDepart;
    var qDt; 
    if(req.query){
        var pDtFrm  =req.query.from;
        var pDtTo  =req.query.to;
        var pDepart  =req.query.depart;
    } 
    if((pDepart === undefined) || (pDepart =='')){
        qDepart = '1=1';
    }
    else{
        qDepart = 'pf.OCDepart=\'' +pDepart+ '\'';
    }
    if((pDtFrm === undefined) || (pDtTo === undefined)){
        qDt = '1=1';
    }
    else{
        qDt = 'ts.book_dt>=\'' +pDtFrm+ '\' and ts.book_dt<=\'' + pDtTo + '\'';
    }
    var sqlQuery = `
    select --ROW_NUMBER() OVER (ORDER BY PAF_ID,book_dt)  as [SN], 
        CallOffNO [Call Off No.],
        ctrno [CTR Number],
        EmpID [Employee ID],Name [Employee Name],Position as [PAAF / CTR  Position],
        OrgChartPositionTitle [Org Chart Position Title],OrgChartIDNo [Org Chart ID No.],
        Category Category,
        project [Timesheet Project],
        PAAfNo [PAAF No.], 
        (select sum(iif(ts.[HOURS] >0,1,0)) from TB_TIMESHEET ts where ts.PAF_ID = TMP.PAF_ID and ${qDt}) [TOTAL MAN DAYS],
        [OCDepart] [Department],
        book_dt as [Date],[HOURS] 
        --,left(DATENAME(dw,ts.book_dt),3) as wkdayname   
        from
        (
            select 
            pf.PAF_ID,pf.name
            ,pf.CallOffNO 
            ,pf.ctrno,pf.EmpID,pf.Position,pf.OrgChartPositionTitle,pf.OrgChartIDNo,pf.project
            ,[Category]
            ,pf.PAAfNo 
            ,pf.[OCDepart]
            ,ts.book_dt,sum(ts.[HOURS]/pf.perdayhrs) [HOURS]
            From 
            TB_PAF_REGISTER  pf, 
            TB_CBS cbs,
            TB_TIMESHEET  ts 
            where ts.[CBS_ID] = cbs.cbs_id
            and ts.paf_id=pf.paf_id  
            and  ${qDepart} 
            and ${qDt}
            group by pf.PAF_ID,pf.name,pf.CallOffNO  
            ,pf.ctrno,pf.EmpID,pf.Position,pf.OrgChartPositionTitle,pf.OrgChartIDNo,pf.project
            ,[Category]
            ,pf.PAAfNo 
            ,pf.[OCDepart]
            ,ts.book_dt 
        ) tmp   
    `; 
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


let getRptVOWD = (req, res) => {
    console.log(req.params);
    console.log(req.query);
    var sqlQuery = 
    `
        select
        r.PAAFStatus [Status],r.CallOffNO [Call Off No.],r.Name [Employee Name],r.Position [PAAF Job/CONTRACT Title],r.OrgChartPositionTitle [Org Chart Position Title]
        ,r.TimesheetProject [Timesheet Project],'PAAF-'+r.PAAFNo+'-'+cast(r.Rev as varchar) as [PAAF No. and Rev]
        ,r.ServicesLocation as [Work Location],r.OrgChartIDNo [org Chart ID No.],r.OCDepart [Discipline],r.OCSubDepartment as [Sub Discipline]
        ,r.ExpLevel [Experience Level]
        ,r.Nationality
        ,r.DirectIndirect [Direct/Indirect]
        ,r.ProjectAssign [Direct/Indirect (AFE-wise)],c.TASK_CODE as [AFE Code],c.TASK_DESC [AFE Description]
        ,r.Nationality [Home Country]
        ,r.EmpID [Employee ID],r.CTRNO [CTR Number],r.Category,r.PAAFNo [PAAF No.],r.Rev,r.ContractRate [Contract Rate]
        ,CONVERT(char(10), t.BOOK_DT,126) BOOK_DT,t.HOURS 
        ,round((t.HOURS/r.PerDayHrs) ,2) as WorkDays
        ,IDCode,MonthlyRate        
        From TB_CBS c, TB_TIMESHEET t, TB_PAF_REGISTER r
        where c.CBS_ID = t.CBS_ID and t.PAF_ID =r.PAF_ID 
    `; 
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

let getPAFReg = (req, res) => {
  
 
    var sqlQuery = `
            SELECT [PAF_ID]
            ,'PAAF-'+PAAFNo+'-'+cast(Rev as varchar) as [PAAF No. and Rev]
            ,[PAAFNo] [PAAF NO#]
            ,[Rev]
            ,[EmpID] [Employee ID#] 
            ,CONVERT(char(10), [PAFDate] ,126) [PAAF Date]
            ,[Name]
            ,[Position]
            ,[ExpLevel]
            ,[TransportAllowance]
            ,[ContractNO]
            ,[CallOffNO]
            ,[CTRNO]
            ,[OrgChartIDNo] [Org Chart ID NO]
            ,[OrgChartPositionTitle]
            ,[OCDepart]
            ,[OCSubDepartment]
            ,[TimesheetProject]
            ,[ROOTimesheetProjectRef]
            ,[SNCTimesheetProject_Ref]
            ,[OvertimeReq]
            ,[OvertimeReqRefer]
            ,[EX_LN]
            ,[DirectIndirect]
            ,[ProjectAssign]
            ,[Nationality]
            ,[RequestLetterNO]
            ,[AprrovalLetterNO]
            ,[StaffAgency]
            ,[ContractPositionTitle]
            ,[Discipline]
            ,[Category]
            ,[KeyPersonnel]
            ,[Project]
            ,[ServicesLocation]
            ,CONVERT(char(10),[StartDtActual],126) [Actual Start Date]
            ,CONVERT(char(10),[EffectiveDt] ,126) [Effective Date]
            ,CONVERT(char(10),PAAFEndDt ,126) [PAAFEndDt]
            ,[ContractRate]
            ,[OvertimePaid]
            ,[DiscountedRate]
            ,[PAAFStatus]
            ,[EmployeeStatus]
            ,CONVERT(char(10),[SubmittedDate],126) [SubmittedDate] 
            ,CONVERT(char(10),[ApprovedDate],126) [ApprovedDate]
            ,CONVERT(char(10),[DePAAFDate],126) [DePAAFDate]
            ,CONVERT(char(10),[DemobilizedDate],126) [DemobilizedDate]
            ,[Remarks]
            ,[PerDayHrs]
            ,[IDCode]
            ,[MonthlyRate]
        FROM [dbo].[TB_PAF_REGISTER]
    `; 
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



let RptVOWDByMonth = (req, res) => {
    if(req.query){
        var pRptMonth  =req.query.ReportMonth;        
    } 
    var sqlQuery = `
            SELECT              
             [PAAFNo] [PAAF NO#]
            ,[Rev] [Rev]
            ,[EmpID] [Employee ID#] 
            ,CONVERT(char(10), [PAFDate] ,126) [PAAF Date]
            ,[Name]
            ,[Position]
            ,[ExpLevel] 
            ,[ContractNO]
            ,[CallOffNO]
            ,[CTRNO]
            ,[OrgChartIDNo] [Org Chart ID NO]
            ,[OrgChartPositionTitle]
            ,[OCDepart]
            ,[OCSubDepartment]
            ,[TimesheetProject]
            ,[ROOTimesheetProjectRef]
            ,[SNCTimesheetProject_Ref]
            ,[OvertimeReq]
            ,[OvertimeReqRefer]
            ,[EX_LN]
            ,[DirectIndirect] 
            ,[Nationality]
            ,[RequestLetterNO]
            ,[AprrovalLetterNO]
            ,[StaffAgency]
            ,[ContractPositionTitle]
            ,[Discipline]
            ,[Category]            
            ,CONVERT(char(10),[StartDtActual],126) [Actual Start Date]
            ,CONVERT(char(10),[EffectiveDt] ,126) [Effective Date]
            ,CONVERT(char(10),PAAFEndDt ,126) [PAAFEndDt]
            ,vrpt.[ContractRate]
            ,[OvertimePaid]
            ,[DiscountedRate]
            ,[PAAFStatus]
            ,[EmployeeStatus]
            ,CONVERT(char(10),[SubmittedDate],126) [SubmittedDate] 
            ,CONVERT(char(10),[ApprovedDate],126) [ApprovedDate]
            ,CONVERT(char(10),[DePAAFDate],126) [DePAAFDate]
            ,CONVERT(char(10),[DemobilizedDate],126) [DemobilizedDate]            
            ,[PerDayHrs]
            ,[IDCode]
			,c.TASK_CODE [AFE Code],c.TASK_CATEGORY [AFE Desc]
            ,vrpt.HOURS [Book Hrs],vrpt.BOOK_DT [Book Date], vrpt.BOOK_DAY_COUNT [Book Day Count]
            ,v.VOWD_CUTOFF_DT [VOWD Cut Off Date]
            From TB_VOWD v, TB_VOWD_RPT vrpt, TB_PAF_REGISTER p, TB_CBS C 
            where v.VOWD_ID=vrpt.VOWD_ID and p.PAF_ID = vrpt.PAF_ID AND vrpt.CBS_ID=C.CBS_ID
            and year(v.VOWD_CUTOFF_DT)= year('${pRptMonth}') and MONTH(v.VOWD_CUTOFF_DT)=month('${pRptMonth}')
    `; 
    console.log(sqlQuery);
    common.exceSelect(sqlQuery, (err, result)=> {
        if(err) return common.sendFullResponse(req, res, 500, {}, err);
        if(result){            
            res.send(result);
        }
        else{
            common.sendFullResponse(req, res, 300, {}, "No users found");
        }
    })
}

let RptVOWDByMonthTest = (req, res) => {
    if(req.query){
        var pRptMonth  =req.query.ReportMonth;        
    } 
    var sqlQuery = `
            SELECT              
             [PAAFNo] [PAAF NO#]
            ,[Rev] [Rev]
            ,[EmpID] [Employee ID#] 
            ,CONVERT(char(10), [PAFDate] ,126) [PAAF Date]
            ,[Name]
            ,[Position]
            ,[ExpLevel] 
            ,[ContractNO]
            ,[CallOffNO]
            ,[CTRNO]
            ,[OrgChartIDNo] [Org Chart ID NO]
            ,[OrgChartPositionTitle]
            ,[OCDepart]
            ,[OCSubDepartment]
            ,[TimesheetProject]
            ,[ROOTimesheetProjectRef]
            ,[SNCTimesheetProject_Ref]
            ,[OvertimeReq]
            ,[OvertimeReqRefer]
            ,[EX_LN]
            ,[DirectIndirect] 
            ,[Nationality]
            ,[RequestLetterNO]
            ,[AprrovalLetterNO]
            ,[StaffAgency]
            ,[ContractPositionTitle]
            ,[Discipline]
            ,[Category]            
            ,CONVERT(char(10),[StartDtActual],126) [Actual Start Date]
            ,CONVERT(char(10),[EffectiveDt] ,126) [Effective Date]
            ,CONVERT(char(10),PAAFEndDt ,126) [PAAFEndDt]
            ,vrpt.[ContractRate]
            ,[OvertimePaid]
            ,[DiscountedRate]
            ,[PAAFStatus]
            ,[EmployeeStatus]
            ,CONVERT(char(10),[SubmittedDate],126) [SubmittedDate] 
            ,CONVERT(char(10),[ApprovedDate],126) [ApprovedDate]
            ,CONVERT(char(10),[DePAAFDate],126) [DePAAFDate]
            ,CONVERT(char(10),[DemobilizedDate],126) [DemobilizedDate]            
            ,[PerDayHrs]
            ,[IDCode]
			,c.TASK_CODE [AFE Code],c.TASK_CATEGORY [AFE Desc]
            ,vrpt.HOURS [Book Hrs],vrpt.BOOK_DT [Book Date], vrpt.BOOK_DAY_COUNT [Book Day Count]
            ,v.VOWD_CUTOFF_DT [VOWD Cut Off Date]
            From TB_VOWD v, TB_VOWD_RPT vrpt, TB_PAF_REGISTER p, TB_CBS C 
            where v.VOWD_ID=vrpt.VOWD_ID and p.PAF_ID = vrpt.PAF_ID AND vrpt.CBS_ID=C.CBS_ID
            and year(v.VOWD_CUTOFF_DT)= year('${pRptMonth}') and MONTH(v.VOWD_CUTOFF_DT)=month('${pRptMonth}')
    `; 
    console.log(sqlQuery);
    common.exceSelect(sqlQuery, (err, result)=> {
        if(err) return common.sendFullResponse(req, res, 500, {}, err);
        if(result){            
            const jsonData = JSON.parse(JSON.stringify(result));
            console.log("jsonData", jsonData); 
            const json2csvParser = new Json2csvParser({ header: true});
            const csv = json2csvParser.parse(jsonData);
            res.header('Content-Type', 'text/csv');
            res.attachment("VOWDReport.csv");
            return res.send(csv);
            //res.send(result);
        }
        else{
            common.sendFullResponse(req, res, 300, {}, "No users found");
        }
    })
}


/* ------------------------- ALL ROUTES ------------------------ */
 
router.get('/RptWeeklyTimesheet', getWeeklyTimesheet);
router.get('/RptVOWD', getRptVOWD);
router.get('/RptPAAFRegister', getPAFReg);
router.get('/RptVOWDByMonth', RptVOWDByMonth); 
router.get('/RptJson2Csv', RptVOWDByMonthTest); 

module.exports = router;