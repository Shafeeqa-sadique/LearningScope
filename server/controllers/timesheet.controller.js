/* ========================================================================== */
/*                                  USER API'S                                */
/* ========================================================================== */

const express         = require('express'); 
const router          = express.Router();
const common          = require('../helper/common'); 
const TYPES = require('tedious').TYPES;

let getWkBookTimesheet = (req, res) => {
    var sqlQuery = 
    `
    --SET DATEFIRST 6;   
    select 
    CONVERT(nvarchar(3), datename(month, tst.Mnth)) + '-' + CAST(DatePart(YYYY, tst.Mnth) as nvarchar(4))+' - Week ' + cast(tst.Wk as varchar) as WkName
    ,tst.Mnth,tst.Wk,min(tst.book_dt) start_dt,max(tst.book_dt) as end_dt
    from 
    ( 
        select 
        ts.BOOK_DT,
        DATEADD(month, DATEDIFF(month, 0, ts.book_dt), 0) Mnth, 
        --datepart(wk, ts.book_dt) - datepart(wk,dateadd(m, DATEDIFF(M, 0, ts.book_dt), 0)) + 1 as Wk
		case 
			when DAY(ts.book_dt) <= 7 then 1			   
			when (DAY(ts.book_dt) > 7 and DAY(ts.book_dt) <= 14)  then 2
			when (DAY(ts.book_dt) > 14 and DAY(ts.book_dt) <= 21)  then 3
			when (DAY(ts.book_dt) > 21)  then 4
		end as Wk
        from 
        (
            select book_dt from [TB_TIMESHEET]
            group by book_dt 
        ) ts --where month(book_dt)=9
    ) tst
    group by tst.Mnth,tst.Wk
    order by Mnth,wk
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

let getDepart = (req, res) =>{
    var sqlQuery = 
    `
    select '0' DptValue, 'All' as DptName
    union all 
    select distinct pf.Discipline, pf.Discipline from  [dbo].[TB_PAF_REGISTER] pf
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

let getWkBookTsDetail = (req, res) => {
    if(!req.params.strtDt){
        return common.sendFullResponse(req, res, 300, result, "Week Start Date Required!");
    }
    if(!req.params.endDt){
        return common.sendFullResponse(req, res, 300, result, "Week End Date Required!");
    }
    if(!req.params.TmPrj){
        return common.sendFullResponse(req, res, 300, result, "Timesheet Project Required!");
    }    
    if(!req.params.CalOffNO){
        return common.sendFullResponse(req, res, 300, result, "Call Off NO Required!");
    }      
    console.log(req.params) ;
    let dyColPrefix ="WDay"
    let rsDtFld =[
        { name:'PAF_ID', type:'number' },
        { name:'PARENT_ID', type:'number' },
        { name:'CallOffNO', type:'string' },
        { name:'CTRNO', type:'string' },
        { name:'EmpID', type:'string' },
        { name:'Name', type:'string' },
        { name:'Position', type:'string' },
        { name:'OrgChartPositionTitle', type:'string' },
        { name:'TimesheetProject', type:'string' },
        { name:'Category', type:'string' },
        { name:'PAF_NO', type:'string' },
        { name:'Discipline', type:'string' },
        { name:'APP_STATUS', type:'string' },
        { name:'tot_man_days', type:'number' },
    ]  
    let rsCol =[
        { text: "##", datafield: "PAF_ID", width: 30, cellsalign: 'center', align: 'center' , hidden: true,exportable:true },
        { text: "Call Off NO", datafield: "CallOffNO", width:100, cellsalign: 'left', align: 'center' , columntype: 'textbox', pinned:false},
        { text: "CTR Number", datafield: "CTRNO", width:220,cellsalign: 'left', align: 'center' , columntype: 'textbox', pinned:false},
        { text: "Employee ID" ,datafield: "EmpID", width:100, cellsalign: 'left', align: 'center', columntype: 'textbox' , pinned:true},
        { text: "Name" ,datafield: "Name", width:180, cellsalign: 'left', align: 'center', columntype: 'textbox', pinned:true },
        { text: "PAAF / CTR Position" ,datafield: "Position", width:180,  cellsalign: 'left', align: 'center', columntype: 'textbox' },
        { text: "Org Chart Position Title" ,datafield: "OrgChartPositionTitle",width:180,   cellsalign: 'left', align: 'center', columntype: 'textbox' },
        { text: "Org Chart ID No." ,datafield: "OrgChartIDNo", width:120,  cellsalign: 'left', align: 'center', columntype: 'textbox' },
        { text: "Category" ,datafield: "Category", width:210,  cellsalign: 'left', align: 'center', columntype: 'textbox' },
        { text: "Timesheet Project" ,datafield: "TimesheetProject",width:180,   cellsalign: 'left', align: 'center', columntype: 'textbox' },
        { text: "PAAF No." ,datafield: "PAF_NO", width:80,  cellsalign: 'center', align: 'center', columntype: 'textbox' },
        { text: "Department" ,datafield: "Discipline", width:120,  cellsalign: 'left', align: 'center', columntype: 'textbox' },
        { text: "Total Man Days" ,datafield: "tot_man_days", width:85,  cellsalign: 'center', align: 'center', columntype: 'textbox' },        
    ]   
    let rsGrpCol =[]                                   
    var sqlQuery = 
    `   
        declare @dtCnt as integer
        set @dtCnt = DATEDIFF(D,'${req.params.strtDt}','${req.params.endDt}')
        select '${dyColPrefix}'+ cast(rwCnt as varchar) as rwID,replace(CONVERT(varchar,DATEADD(D,rwCnt,'${req.params.strtDt}'),6),' ','-') as Dt,left(DATENAME(W,DATEADD(D,rwCnt,'${req.params.strtDt}')),3) as Wk from 
        (
            SELECT top(@dtCnt+1) ROW_NUMBER() over (order by (select null))-1 rwCnt 
            FROM sys.columns AS a  
        ) tb
    `; 
    console.log(sqlQuery);
    common.exceSelect(sqlQuery, (err, result)=> {
        if(err) return common.sendFullResponse(req, res, 500, {}, err);
        if(result){ 
            let dynSqlCol ="";

            result.forEach(e => {
                //COLUMN HEADERS
                let rw ={
                    text: e.Dt ,datafield: e.rwID, columngroup: e.rwID, width:60,  cellsalign: 'center', align: 'center', columntype: 'textbox'
                }
                rsCol.push(rw);

                let rwGrp ={
                    text: e.Wk, align: 'center', name: e.rwID
                }
                rsGrpCol.push(rwGrp);

                let rwDtFld ={
                    name: e.rwID, type:'number'
                }
                rsDtFld.push(rwDtFld);
                dynSqlCol = dynSqlCol +',['+e.rwID+']'
            });

            rsCol.push(
                { text: "Approval Status" ,datafield: "APP_STATUS", width:110,  cellsalign: 'center', align: 'center', columntype: 'textbox',cellsrenderer: this.celRenApp  },
                { text: "Client Comments" ,datafield: "CLIENT_COMMENTS", width:260,  cellsalign: 'left', align: 'center', columntype: 'textbox' }
            )
            sqlQuery = 
            `
                select tb.*--,
                ---wk.APP_STATUS
                ${dynSqlCol} 
                From 
                (
                    select
                    pf.PAF_ID, pf.CallOffNO,pf.CTRNO,pf.EmpID,pf.Name,
                    pf.Position,pf.OrgChartPositionTitle,pf.OrgChartIDNo,pf.TimesheetProject,pf.Category,(pf.PAAFNo + '-'+ cast(pf.Rev as varchar)) as PAF_NO,pf.discipline
                    ,(select count(*) from 
                        (
                            select distinct BOOK_DT,PAF_ID from [dbo].[TB_TIMESHEET] ts where ts.PAF_ID=pf.PAF_ID 
                            and ts.book_dt>=CONVERT(DATE, '${req.params.strtDt}') 
                            and ts.book_dt<=CONVERT(DATE, '${req.params.endDt}') 
                            and (pf.TimesheetProject='${req.params.TmPrj}'  or '0'='${req.params.TmPrj}')
                            and (pf.[CallOffNO]='${req.params.CalOffNO}'  or '0'='${req.params.CalOffNO}')
                        ) t
                    ) as tot_man_days
                    from [dbo].[TB_PAF_REGISTER] pf
                    where exists 
                    (
                        select 1 from [dbo].[TB_TIMESHEET] ts where ts.PAF_ID = pf.paf_id 
                        and ts.book_dt>=CONVERT(DATE, '${req.params.strtDt}') 
                        and ts.book_dt<=CONVERT(DATE, '${req.params.endDt}') 
                        and (pf.TimesheetProject='${req.params.TmPrj}'  or '0'='${req.params.TmPrj}')
                        and (pf.[CallOffNO]='${req.params.CalOffNO}'  or '0'='${req.params.CalOffNO}')
                    )    
                ) tb left join 
                (
                    select 
                    PAF_ID--,
                    --isnull(APP_STATUS,'Yet to Submit')  APP_STATUS 
                    ${dynSqlCol}
                    From 
                    (
                        select distinct 
                         pf.PAF_ID 
                        ,ts.BOOK_DT
                        ---,ts.APP_STATUS
                        --,substring(datename(weekday,ts.BOOK_DT),0,4) as dtname
                        ,'${dyColPrefix}' + cast(DATEDIFF(D,CONVERT(DATE, '${req.params.strtDt}'),ts.BOOK_DT) as varchar) as dtdiff
                        from [dbo].[TB_PAF_REGISTER] pf,[dbo].[TB_TIMESHEET] ts where ts.PAF_ID = pf.paf_id 
                        and ts.book_dt>=CONVERT(DATE, '${req.params.strtDt}') 
                        and ts.book_dt<=CONVERT(DATE, '${req.params.endDt}') 
                        and (pf.TimesheetProject='${req.params.TmPrj}'  or '0'='${req.params.TmPrj}')
                        and (pf.[CallOffNO]='${req.params.CalOffNO}'  or '0'='${req.params.CalOffNO}')
                    ) as srctb
                    PIVOT
                    (
                    count(book_dt)
                    FOR dtdiff IN (${dynSqlCol.substring(1)})
                    ) AS PivotTable 
                ) wk on tb.PAF_ID=wk.paf_id       
            `;     
            console.log(sqlQuery);
            common.exceSelect(sqlQuery, (err, rs2)=> {
                if(err) return common.sendFullResponse(req, res, 500, {}, err);
                if(rs2){
                    let resData ={
                        col : rsCol,
                        colGrp : rsGrpCol,
                        colType : rsDtFld,
                        grdData :  rs2 
                    }
                    common.sendFullResponse(req, res, 200, resData, 'D');
                }
                else{
                    common.sendFullResponse(req, res, 300, {}, "No data available");
                }
            })  
        }
        else{
            common.sendFullResponse(req, res, 300, {}, "No Col info available");
        }
    })       

    
    
}

let getTSDynamicCols= (req, res) =>{          
    if(!req.params.strtDt){
        return common.sendFullResponse(req, res, 300, result, "Week Start Date Required!");
    }
    if(!req.params.endDt){
        return common.sendFullResponse(req, res, 300, result, "Week End Date Required!");
    }   
    let rsDtFld =[
        { name:'PAF_ID', type:'number' },
        { name:'PARENT_ID', type:'number' },
        { name:'CallOffNO', type:'string' },
        { name:'CTRNO', type:'string' },
        { name:'EmpID', type:'string' },
        { name:'Name', type:'string' },
        { name:'Position', type:'string' },
        { name:'OrgChartPositionTitle', type:'string' },
        { name:'TimesheetProject', type:'string' },
        { name:'Category', type:'string' },
        { name:'PAF_NO', type:'string' },
        { name:'Discipline', type:'string' },
        { name:'tot_man_days', type:'number' },
    ]  
    let rsCol =[
        { text: "##", datafield: "PAF_ID", width: 30, cellsalign: 'center', align: 'center' , hidden: true,exportable:true },
        { text: "Call Off NO", datafield: "CallOffNO", width:100, cellsalign: 'left', align: 'center' , columntype: 'textbox', pinned:false},
        { text: "CTR Number", datafield: "CTRNO", width:220,cellsalign: 'left', align: 'center' , columntype: 'textbox', pinned:false},
        { text: "Employee ID" ,datafield: "EmpID", width:100, cellsalign: 'left', align: 'center', columntype: 'textbox' , pinned:true},
        { text: "Name" ,datafield: "Name", width:180, cellsalign: 'left', align: 'center', columntype: 'textbox', pinned:true },
        { text: "PAAF / CTR Position" ,datafield: "Position", width:180,  cellsalign: 'left', align: 'center', columntype: 'textbox' },
        { text: "Org Chart Position Title" ,datafield: "OrgChartPositionTitle",width:180,   cellsalign: 'left', align: 'center', columntype: 'textbox' },
        { text: "Org Chart ID No." ,datafield: "OrgChartIDNo", width:120,  cellsalign: 'left', align: 'center', columntype: 'textbox' },
        { text: "Category" ,datafield: "Category", width:210,  cellsalign: 'left', align: 'center', columntype: 'textbox' },
        { text: "Timesheet Project" ,datafield: "TimesheetProject",width:180,   cellsalign: 'left', align: 'center', columntype: 'textbox' },
        { text: "PAAF No." ,datafield: "PAF_NO", width:100,  cellsalign: 'left', align: 'center', columntype: 'textbox' },
        { text: "Department" ,datafield: "Discipline", width:120,  cellsalign: 'left', align: 'center', columntype: 'textbox' },
        { text: "Total Man Days" ,datafield: "tot_man_days", width:110,  cellsalign: 'center', align: 'center', columntype: 'textbox' },
        { text: "Approval Status" ,datafield: "APP_STATUS", width:110,  cellsalign: 'center', align: 'center', columntype: 'textbox',cellsrenderer: this.celRenApp  },
        { text: "Client Comments" ,datafield: "CLIENT_COMMENTS", width:260,  cellsalign: 'left', align: 'center', columntype: 'textbox' },
    ]   
    let rsGrpCol =[]                                   
    var sqlQuery = 
    `   
        declare @dtCnt as integer
        set @dtCnt = DATEDIFF(D,'${req.params.strtDt}','${req.params.endDt}')
        select rwCnt as rwID,CONVERT(varchar,DATEADD(D,rwCnt,'${req.params.strtDt}'),6) as Dt,left(DATENAME(W,DATEADD(D,rwCnt,'${req.params.strtDt}')),3) as Wk from 
        (
            SELECT top(@dtCnt+1) ROW_NUMBER() over (order by (select null))-1 rwCnt 
            FROM sys.columns AS a  
        ) tb
    `;   
    common.exceSelect(sqlQuery, (err, result)=> {
        if(err) return common.sendFullResponse(req, res, 500, {}, err);
        if(result){ 
            result.forEach(e => {
                let rw ={
                    text: e.Dt ,datafield: e.rwID, columngroup: e.rwID, width:70,  cellsalign: 'center', align: 'center', columntype: 'textbox'
                }
                rsCol.push(rw);
                let rwGrp ={
                    text: e.Wk, align: 'center', name: e.rwID
                }
                rsGrpCol.push(rwGrp);
                let rwDtFld ={
                    name: e.rwID, type:'number'
                }
                rsDtFld.push(rwDtFld);
            });
            let resData ={
                col : rsCol,
                colGrp : rsGrpCol,
                colType : rsDtFld
            }
            common.sendFullResponse(req, res, 200, resData, 'D');
        }
        else{
            common.sendFullResponse(req, res, 300, {}, "No users found");
        }
    })
}


let uptTSStatus = (req, res) => {
    console.log(req.body);   
    if(req.body){
        data =req.body.data;
    }
    console.log(data);
    var dtStrt = data.DtStrt;
    var dtEnd = data.DtEnd;
    var Dpt = data.Dpt;
    var Sts = data.Sts; 
    if (!dtStrt) {
        return common.sendFullResponse(req, res, 300, {}, "Start Date not available");
    }
    if (!dtEnd) {
        return common.sendFullResponse(req, res, 300, {}, "End Date not available");
    } 
    if (!Dpt) {
        return common.sendFullResponse(req, res, 300, {}, "Department Not available");
    }
    if (!Sts) {
        return common.sendFullResponse(req, res, 300, {}, "Status Not available");
    }
    
    var sqlQuery = 
    `
        update ts set ts.APP_STATUS='${Sts}'  From [dbo].[TB_PAF_REGISTER] pf,[dbo].[TB_TIMESHEET] ts 
        where pf.PAF_ID=ts.PAF_ID 
        and (pf.OCDepart='${Dpt}' or '0'='${Dpt}') 
        and ts.BOOK_DT>=CONVERT(DATE, '${dtStrt}') and ts.BOOK_DT<=CONVERT(DATE, '${dtEnd}')
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

/* ------------------------- ALL ROUTES ------------------------ */

router.get('/getWkBookTsCol/:strtDt/:endDt/', getTSDynamicCols);
router.get('/getWkBookTs', getWkBookTimesheet);
router.get('/getDepart', getDepart);
router.get('/getWkBookTsDetail/:strtDt/:endDt/:TmPrj/:CalOffNO', getWkBookTsDetail);
router.post('/uptTsSts',uptTSStatus)
module.exports = router;