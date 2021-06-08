import { Injectable } from '@angular/core';
import { SPXapi } from './SPXapi.service';
import { map, mergeMap } from 'rxjs/operators';
import { GlbVarService } from '../services/glbvar.service';
//import { EnvService } from '../services/env.service';

import { forkJoin, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SPXlstService extends SPXapi {

  // TIMESHEET
  lstTSWeekly: string = 'LS_TS_WK_DTL';
  lstTSMaster: string = 'LS_M_TS_WK';
  lsTSSts: string = 'LS_TS_WK_STATUS';
  lsTSDtlHrs: string = 'LS_TS_WK_HRS';

  lstMCode: string = 'LS_M_CODE';
  lstMRol: string = 'LS_M_ROLE';
  lstWFRole: string = 'LS_ROLE_WF_ACCESS';
  lsUsrDisc: string = 'LS_USR_DISC_ACCESS';
  lsUsrRol: string = 'LS_ROLE_USR';

  lsMCBS: string = 'LS_M_CBS';
  lsMRol: string = 'LS_M_ROLE';
  lsMSts: string = 'LS_M_STATUS';
  lsMTsRoleSts: string = 'LS_TS_STATUS_ROLE';
  lsAtch: string = 'LS_TS_WK_ATTACH';
  lsMPaf: string = 'LS_M_PAF_REGISTER';
  lsAppName: string='LS_TS_APPROVER';
  lsAppGrp: string='LS_TS_APPROVER_GRP';
  lsPAFRnR: string='LS_PAF_ROTATION';

  lsLgEmail: string= 'LS_LOG_EMAIL';

  getTSMaster(pWkName) {
    let vflt  = '';
    if (pWkName !== null) {
      vflt = '$filter=substringof(\'' + pWkName + '\',WkName)';
    }
    const qry = '/_api/web/lists/GetByTitle(\'' + this.lstTSMaster + '\')/items?$filter=is_visible+eq+1&' + vflt + '&$select=Id,WkName,Mnth,Wk,start_dt,end_dt'
    const obj = this.get(qry).pipe(
      map(res => JSON.parse(JSON.stringify(res)) ),
    );
    return obj;
  }

  getPAFRnR(pWkID){
    let vFlt  = '';
    let vWk = '';
    if (pWkID !== null) {
      vWk = 'LkWkName/ID+eq+' + pWkID;
      if (vFlt.length > 0)
        vFlt = vFlt + ' and ' + vWk;
      else
        vFlt = vWk;
    }
    if(vFlt.length >0){
      vFlt = '$filter=' + vFlt;
    }
    const url = `/_api/web/lists/GetByTitle('${this.lsPAFRnR}')/items?$Top=5000&${vFlt}&$select=LkEmployeeIDId`;
    return this.getSPX(url);
  }

  getMCode(pCode) {
    let vflt  = '';
    if (pCode !== null) {
      vflt = '$filter=substringof(\'' + pCode + '\',CODE)';
    }
    const obj = this.get('/_api/web/lists/GetByTitle(\'' + this.lstMCode + '\')/items?' + vflt + '&$select=DISP_ID,DISP_VALUE,DISP_NAME,CODE').pipe(
      map(res => JSON.parse(JSON.stringify(res)) ),
    );
    return obj;
  }

  getMRol(pCode) {
    let vflt  = '';
    if (pCode !== null) {
      vflt = '$filter=substringof(\'' + pCode + '\',RoleName)';
    }
    const obj = this.get('/_api/web/lists/GetByTitle(\'' + this.lsMRol + '\')/items?' + vflt + '&$select=ID,RoleName').pipe(
      map(res => JSON.parse(JSON.stringify(res)) ),
    );
    return obj;
  }

  getMCBS(pCat) {
    let vflt  = '';
    if (pCat !== null) {
      vflt = '$filter=TASK_CATEGORY eq \'' + pCat + '\'';
    }

    const qry = '/_api/web/lists/GetByTitle(\'' + this.lsMCBS + '\')/items?' + vflt + '&$select=ID,TASK_CODE,TASK_DESC,TASK_SL_NO,TASK_SL_NO_PARENT,TASK_CATEGORY';
    return this.getSPX(qry);
  }

  getPrjCalOff(pCalOf, pTmPrj, pUsrId) {

    let qry  = '';
    if (pUsrId !== null) {
      qry = 'LkUsrName/Id eq ' + pUsrId;
    }
    let vTmPrj = '';
    if (pTmPrj !== null) {
      vTmPrj = 'substringof(\'' + this.removeSplChr(pTmPrj) + '\',TSPrj)';
      if (qry.length > 0)
        qry = qry + ' and ' + vTmPrj;
      else
        qry = vTmPrj;
    }


    let vTil = '';
    if (pCalOf !== null) {
      vTil = 'substringof(\'' + this.removeSplChr(pCalOf) + '\',Title)';
      if (qry.length > 0)
        qry = qry + ' and ' + vTil;
      else
        qry = vTil;
    }
    if (qry !== '') {
      qry = '$filter=' + qry;
    }
    qry = `/_api/web/lists/GetByTitle('${this.lsUsrDisc}')/items?${qry}&$select=Id,Title,TSPrj,LkUsrName/Id,LkUsrName/UsrName,LkUsrName/FullName&$expand=LkUsrName`;
    const obj = this.get(qry).pipe(
      map(res => JSON.parse(JSON.stringify(res)) ),
    );
    return obj;
  }

  getPrjCalOffPAF() {

    let qry = `/_api/web/lists/GetByTitle('${this.lsMPaf}')/items?$select=Id,CallOffNumber,TSProject`;
    const obj = this.get(qry).pipe(
      map(res => JSON.parse(JSON.stringify(res)) ),
    );
    return obj;
  }


  getUsrByTSPrjRol(pCalOf, pTmPrj, pRolCod) {

    let qry  = '';
    if (pRolCod !== null) {
      qry = 'LkRoleName/RoleName eq \'' + pRolCod + '\'';
    }
    let vTmPrj = '';
    if (pTmPrj !== null) {
      vTmPrj = 'TSPrj eq \'' + this.removeSplChr(pTmPrj) + '\'';
      if (qry.length > 0)
        qry = qry + ' and ' + vTmPrj;
      else
        qry = vTmPrj;
    }

    let vTil = '';
    if (pCalOf !== null) {
      vTil = 'Title eq \'' + this.removeSplChr(pCalOf) + '\'';
      if (qry.length > 0)
        qry = qry + ' and ' + vTil;
      else
        qry = vTil;
    }
    qry = `/_api/web/lists/GetByTitle('${this.lsUsrDisc}')/items?$filter=${qry}&$select=Id,Title,TSPrj,LkUsrName/Id,LkUsrName/UsrName,LkUsrName/FullName,LkRoleName/RoleName&$expand=LkUsrName,LkRoleName`;
    const obj = this.get(qry).pipe(
      map(res => JSON.parse(JSON.stringify(res)) ),
    );
    return obj;
  }

  getTSWkStsByTSPrjRol(pCalOf, pTmPrj, pRolID, pCurrSts, pUsrID, pWkID) {

    let qry  = '';
    if (pRolID !== null) {
      qry = 'LkActionByRoleName/RoleName eq \'' + pRolID + '\'';
    }
    let vTmPrj = '';
    if (pTmPrj !== null) {
      vTmPrj = 'TSPrj eq \'' + this.removeSplChr(pTmPrj) + '\'';
      if (qry.length > 0)
        qry = qry + ' and ' + vTmPrj;
      else
        qry = vTmPrj;
    }
    let vTil = '';
    if (pCalOf !== null) {
      vTil = 'CallOffNo eq \'' + this.removeSplChr(pCalOf) + '\'';
      if (qry.length > 0)
        qry = qry + ' and ' + vTil;
      else
        qry = vTil;
    }
    let vAct = '';
    if (pCurrSts !== null) {
      let vl;
      if (pCurrSts) vl = '1'; else vl = '0';
      vAct = 'IsActiveStatus+eq+' + vl;
      if (qry.length > 0)
        qry = qry + ' and ' + vAct;
      else
        qry = vAct;
    }
    let vWk = '';
    if (pWkID !== null) {
      vWk = 'LkWkName/ID+eq+' + pWkID;
      if (qry.length > 0)
        qry = qry + ' and ' + vWk;
      else
        qry = vWk;
    }
    let vUsr = '';
    if (pUsrID !== null) {
      vUsr = 'LkTsUsrName/ID+eq+' + pUsrID;
      if (qry.length > 0)
        qry = qry + ' and ' + vUsr;
      else
        qry = vUsr;
    }
    qry = `/_api/web/lists/GetByTitle('${this.lsTSSts}')/items?$Top=5000&$filter=${qry}&$select=Id,CallOffNo,TSPrj,SubmitDt,Comments,LkTsUsrNameId,LkStatusCodeId,LkStatusCode/StatusName,LkStatusCode/Css,LkWkName/WkName,LkTsUsrName/Id,LkTsUsrName/UsrName,LkActionByUsrName/FullName,LkActionByRoleName/RoleName,LkWkNameId&$expand=LkTsUsrName,LkActionByUsrName,LkActionByRoleName,LkStatusCode,LkWkName`;
    const obj = this.get(qry).pipe(
      map(res => JSON.parse(JSON.stringify(res)) ),
    );
    return obj;
  }

  getTSStsByRol(pTsStsID, pRolID, pAction, pVisible) {
    let vFlt = '';

    let vAct  = '';
    if (pAction !== null) {
      let vl;
      if (pAction) vl = '1'; else vl = '0';
      vAct = 'IsAction eq ' + vl + ' ';
      if (vFlt.length > 0)
        vFlt = vFlt + ' and ' + vAct;
      else
        vFlt = vAct;
    }


    let vStsID  = '';
    if (pTsStsID !== null) {
      vStsID = 'LkStatusCode/ID eq ' + pTsStsID + '';
      if (vFlt.length > 0)
        vFlt = vFlt + ' and ' + vStsID;
      else
        vFlt = vStsID;
    }


    let vRolID  = '';
    if (pRolID !== null) {
      vRolID = 'LkRoleName/ID eq ' + pRolID + '';
      if (vFlt.length > 0)
        vFlt = vFlt + ' and ' + vRolID;
      else
        vFlt = vRolID;
    }

    let vVis  = '';
    if (pVisible !== null) {
      let vl;
      if (pVisible) vl = '1'; else vl = '0';
      vVis = 'IsVisible eq ' + vl + '';
      if (vFlt.length > 0)
        vFlt = vFlt + ' and ' + vVis;
      else
        vFlt = vVis;
    }

    const qry = `/_api/web/lists/GetByTitle('${this.lsMTsRoleSts}')/items?&$filter=${vFlt}&$select=Title,IsAction,GrpActionType,LkStatusCodeId,LkRoleNameId,LkRoleName/ID,LkStatusCode/ID&$expand=LkStatusCode,LkRoleName`;
    return this.getSPX(qry);
  }

  getApproverByRol(pRolCode,pRolId,pAppUsrId){
    let vFlt ='';
    let vRolCode  = '';
    if (pRolCode !== null) {
      vRolCode = `LkRoleName/RoleName+eq+'${pRolCode}'`;
      if (vFlt.length > 0)
        vFlt = vFlt + ' and ' + vRolCode;
      else
        vFlt = vRolCode;
    }
    let vRolId  = '';
    if (pRolId !== null) {
      vRolId = `LkRoleName/ID+eq+'${pRolId}'`;
      if (vFlt.length > 0)
        vFlt = vFlt + ' and ' + vRolId;
      else
        vFlt = vRolId;
    }
    let vAprId  = '';
    if (pAppUsrId !== null) {
      vAprId = `LkAppUsrName/ID+eq+'${pAppUsrId}'`;
      if (vFlt.length > 0)
        vFlt = vFlt + ' and ' + vAprId;
      else
        vFlt = vAprId;
    }
    if(vFlt.length >0){
      vFlt = `&$filter=${vFlt}`
    }
    const qry = `/_api/web/lists/GetByTitle('${this.lsAppName}')/items?$top=5000&${vFlt}&$select=LkUsrName/ID,LkUsrName/UsrName,LkUsrName/FullName,LkAppUsrName/ID,LkAppUsrName/UsrName,LkAppUsrName/FullName,LkRoleName/RoleName&$expand=LkUsrName,LkAppUsrName,LkRoleName`;
    return this.getSPX(qry);
  }

  getApproverByRolGrp(pRolCode){
    let vFlt ='';
    let vRolCode  = '';
    if (pRolCode !== null) {
      vRolCode = `LkRoleName/RoleName+eq+'${pRolCode}'`;
      if (vFlt.length > 0)
        vFlt = vFlt + ' and ' + vRolCode;
      else
        vFlt = vRolCode;
    }
    if(vFlt.length >0){
      vFlt = `&$filter=${vFlt}`
    }
    const qry = `/_api/web/lists/GetByTitle('${this.lsAppGrp}')/items?$top=5000&${vFlt}&$select=LkUsrNameId,LkUsrName/Id,AprName,AprEmailID,AprID,LkRoleName/RoleName&$expand=LkUsrName,LkRoleName`;
    console.log(qry)
    return this.getSPX(qry);
  }



  getPAFnWkTSSts(pWkID): Observable<any[]> {
    const rsPaf = this.getPAFReg(null);
    const rsTSWkSts = this.getTSWkStsByTSPrjRol(null, null, null, true, null, pWkID);
    return forkJoin([rsPaf, rsTSWkSts]);
  }

  getTSAdminCode(): Observable<any[]> {
    const obj = new GlbVarService;
    const rsCodeAFEType = this.getMCode(obj.ddlCodeAFEType);
    const rsCodeTrans = this.getMCode(obj.ddlCodeTransport);
    const rsCBS = this.getMCBS(obj.ddlCodeCBSAFE);
    return forkJoin([rsCodeAFEType, rsCBS, rsCodeTrans]);
  }

  async getMRolIDByRoleName(pRolName): Promise<number> {
    let vflt  = '';
    if (pRolName !== null) {
      vflt = '$filter=substringof(\'' + pRolName + '\',RoleName)';
    }
    const obj = await this.get('/_api/web/lists/GetByTitle(\'' + this.lsMRol + '\')/items?' + vflt + '&$select=ID,RoleName').pipe(
      map(res => {
        const obj = JSON.parse(JSON.stringify(res));
        if (obj.d.results.length > 0) {
          return obj.d.results[0].ID;
        } else {
          return null;
        }
      }),
    ).toPromise();
    return obj;
  }

  async getMStsIDByStatusCode(pStsCode): Promise<number> {
    let vflt  = '';
    if (pStsCode !== null) {
      vflt = '$filter=substringof(\'' + pStsCode + '\',StatusCode)';
    }
    const obj = await this.get('/_api/web/lists/GetByTitle(\'' + this.lsMSts + '\')/items?' + vflt + '&$select=ID,StatusCode,StatusName').pipe(
      map(res => {
        const obj = JSON.parse(JSON.stringify(res));
        if (obj.d.results.length > 0) {
          return obj.d.results[0].ID;
        } else {
          return null;
        }
      }),
    ).toPromise();
    return obj;
  }




  getWFNxtAction(pCurrStsID, pRolID, pActGrp) {
    const qry = `/_api/web/lists/GetByTitle('${this.lstWFRole}')/items?$filter=LkRoleName/ID eq ${pRolID} and LkStatusCode/ID eq ${pCurrStsID} and ActionGrpType eq '${pActGrp}'&$select=ID,Title,LkRoleName/ID,LkNxtStatusCode/ID,CurrStatusDesc,NxtStatusDesc,NxtStatusColor,NxtStatusEmail,LkNxtStatusCodeId,LkStatusCode/ID,NxtActOnlyToUsr&$expand=LkStatusCode,LkRoleName,LkNxtStatusCode`;
    return this.getSPX(qry);
  }

  getWFNxtActionType(pRolID) {
    const qry = `/_api/web/lists/GetByTitle('${this.lstWFRole}')/items?$filter=LkRoleName/ID eq ${pRolID}&$select=ID,ActionGrpType,LkStatusCodeId,LkNxtStatusCodeId,LkRoleName/ID&$expand=LkRoleName`;
    return this.getSPX(qry);
  }


  removeSplChr(attribute) {
    // replace the single quotes
    if(attribute){
      attribute = attribute.replace(/'/g, '\'\'');

      attribute = attribute.replace(/%/g, '%25');
      attribute = attribute.replace(/\+/g, '%2B');
      attribute = attribute.replace(/\//g, '%2F');
      attribute = attribute.replace(/\?/g, '%3F');

      attribute = attribute.replace(/#/g, '%23');
      attribute = attribute.replace(/&/g, '%26');
    }
    return attribute;
  }

  getOrFilter(field, arrVal) {
    const idFilter = field + ' eq ';
    let filter = '';
    for (let i = 0; i < arrVal.length; i++) {
        if (i == arrVal.length - 1) {
            filter += idFilter + arrVal[i];
        } else {
            filter += idFilter + arrVal[i] + ' or ';
        }
    }
    return filter;
}



  getMPAF() {
    const qry = '/_api/web/lists/GetByTitle(\'' + this.lsMPaf + '\')/items?$top=5000';
    return this.getSPX(qry);
  }

  private getSPX(pQry) {
    const obj = this.get(pQry).pipe(
      map(res => JSON.parse(JSON.stringify(res)) ),
    );
    return obj;
  }


  getUsrRole(pArrRolId) {
    let vFlt = '';
    let vRolID  = '';
    if (pArrRolId !== null) {
      // vRolID = "LkRoleName/ID eq "+pRolID+""
      vRolID = this.getOrFilter('LkRoleName/ID', pArrRolId);
      vFlt = '$filter=' + vRolID;
    }

    const qry = '/_api/web/lists/GetByTitle(\'' + this.lsUsrRol + '\')/items?$top=5000&' + vFlt + '&$select=LkUsrName/Id,LkUsrName/UsrName,LkUsrName/FullName,LkUsrName/UsrEmail,LkUsrName/UsrName,LkUsrName/IsActive,LkRoleNameId,Title&$expand=LkUsrName';
    return this.getSPX(qry);
  }

  getToEmail(pNxtStsID) {
    return this.getTSStsByRol(pNxtStsID, null, true, null).pipe(
      mergeMap((rs) =>  {
          const dt = rs.d.results;
          const arr = [];
          dt.forEach(el => {
            arr.push(el.LkRoleNameId);
          });
          return this.getUsrRole(arr);

        }),
      );
  }


  addSendNxtStatusEmail(pCcEmail, pAction,
     pNxtStsId, pIsToUsr,
     pWkName, pWkId, pUsrId,
     pEmailCnt,
     pJsonTS, pJsonUsrInfo, pRmks
     , pCallOff, pTSPrj) {
    //const objConfig = new EnvService;
    if ((pEmailCnt !== null) && (pEmailCnt !== undefined)) {
      if (pEmailCnt.trim().length > 0) {
        const rsTSStsHis = this.getTSWkStsByTSPrjRol(null, null, null, null, pUsrId, pWkId);
        const rsEmail = this.getToEmail(pNxtStsId);

        // //GET USERWISE DISCIPLINE ACCESS DETAILS
        //##** THERE IS A FLAW THE DISC TO USER TABLE TO REMOVED
        //const rsDiscUsr = this.getPrjCalOff(pCallOff, pTSPrj, null);

        forkJoin([rsTSStsHis, rsEmail]).subscribe(rs  => {
          const dtTSSts = rs[0].d.results;
          const dtEmailLst = rs[1].d.results;
          const dtEmailDiscUsr = [];// rs[2].d.results;
          const toEmailLst = [];


          let emlName = '';
          if (dtEmailLst.length > 0) {
            for (let i = 0; i < dtEmailLst.length; i++) {
              if (dtEmailLst[i]['LkUsrName'].IsActive == 1 && toEmailLst.length <=5) {
                // IF TO USER IS TRUE SEND IT ONLY THE USER
                // IF TO USER IS FALSE SEND IT TO THE EITHER USERS IN THE ROLE
                if (pIsToUsr) {
                  const fltdt = dtTSSts.filter(el => el.LkWkNameId == pWkId &&
                    el.LkTsUsrNameId == pUsrId &&
                    el.LkTsUsrName.UsrName ==  dtEmailLst[i]['LkUsrName'].UsrName);
                    if (fltdt.length > 0) {
                      toEmailLst.push(dtEmailLst[i]['LkUsrName'].UsrName);
                      emlName = emlName + dtEmailLst[i]['LkUsrName'].FullName + ' / ';
                    }
                } else {
                  // IF CALL OF IS NULL THEN IT MEANS THIS EMAIL IS FOR INDIVIDUAL TIMESHEET EMAIL.
                  // IF CALL OFF AVAILABLE THEN ITS DISCIPLINE WISE APPROVAL EMAIL, THEN GET USERS APPLICABLE FOR THIS CALL OFF ONLY
                  if (pCallOff === null) {
                    toEmailLst.push(dtEmailLst[i]['LkUsrName'].UsrName);
                    emlName = emlName + dtEmailLst[i]['LkUsrName'].FullName + ' / ';
                  } else {
                    const flt = dtEmailDiscUsr.filter(el => el['LkUsrName'].Id == dtEmailLst[i]['LkUsrName'].Id && el.TSPrj == pTSPrj && el.Title == pCallOff);
                    if (flt.length > 0) {
                      toEmailLst.push(dtEmailLst[i]['LkUsrName'].UsrName);
                      emlName = emlName + dtEmailLst[i]['LkUsrName'].FullName + ' / ';
                    }
                  }

                }
              }
            }
            emlName = emlName.slice(0, -2) + ',';
            let emlCnt = pEmailCnt.toString().replace('{to}', emlName);
            const obj = new GlbVarService;
            let tbs = '';
            if (pJsonTS !== null) {
              tbs = obj.json2Html(pJsonTS);
            }
            emlCnt = emlCnt.replace('{wk}', pWkName);
            emlCnt = emlCnt.replace('{tbTS}', tbs);

            if (pJsonUsrInfo !== null) {
             tbs = obj.json2Html(pJsonUsrInfo);
            } else {
             tbs = '';
            }
            emlCnt = emlCnt.replace('{tbUsrInfo}', tbs);
            emlCnt = emlCnt.replace('{applnk}', this.env.emailURL);
            emlCnt = emlCnt.replace('{rmks}', pRmks);
            emlCnt = emlCnt.replace('{act}', pAction);
            console.log('TO EMAIL')
            console.log(JSON.parse(JSON.stringify(toEmailLst)));
            console.log('CC EMAIL')
            console.log(pCcEmail);

            this.sendEmail(this.loginInfo.authCode
              , 'collaborationSPAPR@snclavalin.com'
              , JSON.parse(JSON.stringify(toEmailLst))
              , pCcEmail
              , emlCnt, 'PDO Timesheet - ' + pWkName + ' - ' + pAction).subscribe(rs => {
                console.log('Email Response');
              });
          }
        });
      }
    }


  }

  addSendNxtStatusEmailLead(pCcEmail, pAction,
    pNxtStsId, pIsToUsr,
    pWkName, pWkId, pUsrId,
    pEmailCnt,
    pJsonTS, pJsonUsrInfo, pRmks,
    pArrEmailLst) {
   //const objConfig = new EnvService;
   if ((pEmailCnt !== null) && (pEmailCnt !== undefined)) {
     if (pEmailCnt.trim().length > 0) {
       const rsTSStsHis = this.getTSWkStsByTSPrjRol(null, null, null, null, this.loginInfo.loginId, pWkId);
       const rsEmail = this.getToEmail(pNxtStsId);
       forkJoin([rsTSStsHis, rsEmail]).subscribe(rs  => {
         const dtTSSts = rs[0].d.results;
         const dtEmailLst = rs[1].d.results;
         const dtEmailDiscUsr = pArrEmailLst;
         const toEmailLst = [];
         let emlName = '';
         if (dtEmailLst.length > 0) {
           for (let i = 0; i < dtEmailLst.length; i++) {
             if (dtEmailLst[i]['LkUsrName'].IsActive == 1 && toEmailLst.length <=5) {
               // IF TO USER IS TRUE SEND IT ONLY THE USER
               // IF TO USER IS FALSE SEND IT TO THE EITHER USERS IN THE ROLE
               if (pIsToUsr) {
                 const fltdt = dtTSSts.filter(el => el.LkWkNameId == pWkId &&
                   el.LkTsUsrNameId == pUsrId &&
                   el.LkTsUsrName.UsrName ==  dtEmailLst[i]['LkUsrName'].UsrName);
                   if (fltdt.length > 0) {
                     toEmailLst.push(dtEmailLst[i]['LkUsrName'].UsrName);
                     emlName = emlName + dtEmailLst[i]['LkUsrName'].FullName + ' / ';
                   }
               } else {
                 // IF CALL OF IS NULL THEN IT MEANS THIS EMAIL IS FOR INDIVIDUAL TIMESHEET EMAIL.
                 // IF CALL OFF AVAILABLE THEN ITS DISCIPLINE WISE APPROVAL EMAIL, THEN GET USERS APPLICABLE FOR THIS CALL OFF ONLY
                  const flt = dtEmailDiscUsr.filter(el => el['LkUsrName'].Id == dtEmailLst[i]['LkUsrName'].Id );
                  if (flt.length > 0) {
                    toEmailLst.push(dtEmailLst[i]['LkUsrName'].UsrName);
                    emlName = emlName + dtEmailLst[i]['LkUsrName'].FullName + ' / ';
                  }
               }
             }
           }
           emlName = emlName.slice(0, -2) + ',';
           let emlCnt = pEmailCnt.toString().replace('{to}', emlName);
           const obj = new GlbVarService;
           let tbs = '';
           if (pJsonTS !== null) {
             tbs = obj.json2Html(pJsonTS);
           }
           emlCnt = emlCnt.replace('{wk}', pWkName);
           emlCnt = emlCnt.replace('{tbTS}', tbs);

           if (pJsonUsrInfo !== null) {
            tbs = obj.json2Html(pJsonUsrInfo);
           } else {
            tbs = '';
           }
           emlCnt = emlCnt.replace('{tbUsrInfo}', tbs);
           emlCnt = emlCnt.replace('{applnk}', this.env.emailURL);
           emlCnt = emlCnt.replace('{rmks}', pRmks);
           emlCnt = emlCnt.replace('{act}', pAction);
           console.log(JSON.parse(JSON.stringify(toEmailLst)));
           // console.log('GCMC Timesheet - '+pWkName+ ' - ' + pAction)
           // console.log(emlCnt)
           this.sendEmail(this.loginInfo.authCode
             , 'collaborationSPAPR@snclavalin.com'
             , JSON.parse(JSON.stringify(toEmailLst))
             , pCcEmail
             , emlCnt, 'GCMC Timesheet - ' + pWkName + ' - ' + pAction).subscribe(rs => {
               console.log('Email Response');
             });
         }
       });
     }
   }
 }

  addSendNxtStatusEmailDirector(pCcEmail, pAction,
    pNxtStsId, pIsToUsr,
    pWkName, pWkId, pUsrId,
    pEmailCnt,
    pJsonTS, pJsonUsrInfo, pRmks
    ) {
   //const objConfig = new EnvService;
   if ((pEmailCnt !== null) && (pEmailCnt !== undefined)) {
     if (pEmailCnt.trim().length > 0) {
       const rsTSStsHis = this.getTSWkStsByTSPrjRol(null, null, null, null, this.loginInfo.loginId, pWkId);
       const rsEmail = this.getToEmail(pNxtStsId);

       forkJoin([rsTSStsHis, rsEmail]).subscribe(rs  => {
         const dtTSSts = rs[0].d.results;
         const dtEmailLst = rs[1].d.results;
         const toEmailLst = [];
         let emlName = '';
         if (dtEmailLst.length > 0) {
           for (let i = 0; i < dtEmailLst.length; i++) {
             if (dtEmailLst[i]['LkUsrName'].IsActive == 1 && toEmailLst.length <=5) {
               // IF TO USER IS TRUE SEND IT ONLY THE USER
               // IF TO USER IS FALSE SEND IT TO THE EITHER USERS IN THE ROLE
               if (pIsToUsr) {
                 const fltdt = dtTSSts.filter(el => el.LkWkNameId == pWkId &&
                   el.LkTsUsrNameId == pUsrId &&
                   el.LkTsUsrName.UsrName ==  dtEmailLst[i]['LkUsrName'].UsrName);
                   if (fltdt.length > 0) {
                     toEmailLst.push(dtEmailLst[i]['LkUsrName'].UsrName);
                     emlName = emlName + dtEmailLst[i]['LkUsrName'].FullName + ' / ';
                   }
               } else {
                  toEmailLst.push(dtEmailLst[i]['LkUsrName'].UsrName);
                  emlName = emlName + dtEmailLst[i]['LkUsrName'].FullName + ' / ';
               }
             }
           }
           emlName = emlName.slice(0, -2) + ',';
           let emlCnt = pEmailCnt.toString().replace('{to}', emlName);
           const obj = new GlbVarService;
           let tbs = '';
           if (pJsonTS !== null) {
             tbs = obj.json2Html(pJsonTS);
           }
           emlCnt = emlCnt.replace('{wk}', pWkName);
           emlCnt = emlCnt.replace('{tbTS}', tbs);

           if (pJsonUsrInfo !== null) {
            tbs = obj.json2Html(pJsonUsrInfo);
           } else {
            tbs = '';
           }
           emlCnt = emlCnt.replace('{tbUsrInfo}', tbs);
           emlCnt = emlCnt.replace('{applnk}', this.env.emailURL);
           emlCnt = emlCnt.replace('{rmks}', pRmks);
           emlCnt = emlCnt.replace('{act}', pAction);
           console.log(JSON.parse(JSON.stringify(toEmailLst)));
           // console.log('GCMC Timesheet - '+pWkName+ ' - ' + pAction)
           // console.log(emlCnt)
           this.sendEmail(this.loginInfo.authCode
             , 'no-reply@sharepointonline.com'
             , JSON.parse(JSON.stringify(toEmailLst))
             , pCcEmail
             , emlCnt, 'PDO Timesheet - ' + pWkName + ' - ' + pAction).subscribe(rs => {
               console.log('Email Response');
             });
         }
       });
     }
   }


  }

  getTSGrdDetail(dtStrt: Date, dtEnd: Date) {

    const dyColPrefix = 'WDay';
    const rsDtFld = [
        { name: 'PAF_ID', type: 'number' },
        { name: 'PARENT_ID', type: 'number' },
        { name: 'CallOffNO', type: 'string' },
        { name: 'CTRNO', type: 'string' },
        { name: 'EmpID', type: 'string' },
        { name: 'Name', type: 'string' },
        { name: 'Position', type: 'string' },
        { name: 'OrgChartPositionTitle', type: 'string' },
        { name: 'TimesheetProject', type: 'string' },
        { name: 'Category', type: 'string' },
        { name: 'PAF_NO', type: 'string' },
        { name: 'Discipline', type: 'string' },
        { name: 'APP_STATUS', type: 'string' },
        { name: 'tot_man_days', type: 'number' },
    ];
    const rsCol = [
        { text: '##', datafield: 'PAF_ID', width: 30, cellsalign: 'center', align: 'center' , hidden: true, exportable: true },
        { text: 'Call Off NO', datafield: 'CallOffNO', width: 100, cellsalign: 'left', align: 'center' , columntype: 'textbox', pinned: false},
        { text: 'CTR Number', datafield: 'CTRNO', width: 220, cellsalign: 'left', align: 'center' , columntype: 'textbox', pinned: false},
        { text: 'Employee ID' , datafield: 'EmpID', width: 100, cellsalign: 'left', align: 'center', columntype: 'textbox' , pinned: true},
        { text: 'Name' , datafield: 'Name', width: 180, cellsalign: 'left', align: 'center', columntype: 'textbox', pinned: true },
        { text: 'PAAF / CTR Position' , datafield: 'Position', width: 180,  cellsalign: 'left', align: 'center', columntype: 'textbox' },
        { text: 'Org Chart Position Title' , datafield: 'OrgChartPositionTitle', width: 180,   cellsalign: 'left', align: 'center', columntype: 'textbox' },
        { text: 'Org Chart ID No.' , datafield: 'OrgChartIDNo', width: 120,  cellsalign: 'left', align: 'center', columntype: 'textbox' },
        { text: 'Category' , datafield: 'Category', width: 210,  cellsalign: 'left', align: 'center', columntype: 'textbox' },
        { text: 'Timesheet Project' , datafield: 'TimesheetProject', width: 180,   cellsalign: 'left', align: 'center', columntype: 'textbox' },
        { text: 'PAAF No.' , datafield: 'PAF_NO', width: 80,  cellsalign: 'center', align: 'center', columntype: 'textbox' },
        { text: 'Department' , datafield: 'Discipline', width: 120,  cellsalign: 'left', align: 'center', columntype: 'textbox' },
        { text: 'Total Man Days' , datafield: 'tot_man_days', width: 85,  cellsalign: 'center', align: 'center', columntype: 'textbox' },
    ];
    const rsGrpCol = [];

    const vDtEnd = new Date(dtEnd);
    const vDtSrt = new Date(dtStrt);
    const diffTime = Math.abs(vDtEnd.getTime() - vDtSrt.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const wkday = new Array(7);
    wkday[0] = 'Sun';
    wkday[1] = 'Mon';
    wkday[2] = 'Tue';
    wkday[3] = 'Wed';
    wkday[4] = 'Thu';
    wkday[5] = 'Fri';
    wkday[6] = 'Sat';
    let dynSqlCol = '';
    for (let idx = 0; idx <= diffDays; idx++) {
      const dtWk = new Date(vDtSrt);
      dtWk.setDate(vDtSrt.getDate() + idx);
      const WkID = dyColPrefix + idx.toString();
       const rw = {
            text: this.formatDate(dtWk) , datafield: WkID, columngroup: WkID, width: 70,  cellsalign: 'center', align: 'center', columntype: 'textbox',
        };
        rsCol.push(rw);

        const rwGrp = {
            text: wkday[dtWk.getDay()], align: 'center', name: WkID,
        };
        rsGrpCol.push(rwGrp);

        const rwDtFld = {
            name: WkID, type: 'number',
        };
        rsDtFld.push(rwDtFld);
        dynSqlCol = dynSqlCol + ',[' + idx + ']';
    }
    // rsCol.push(
    //     { text: "Approval Status" ,datafield: "APP_STATUS", width:110,  cellsalign: 'center', align: 'center', columntype: 'textbox' }, //,cellsrenderer: this.celRenApp
    //     { text: "Client Comments" ,datafield: "CLIENT_COMMENTS", width:260,  cellsalign: 'left', align: 'center', columntype: 'textbox' }
    // )



    const resData = {
      col : rsCol,
      colGrp : rsGrpCol,
      colType : rsDtFld,
      grdData :  null,
    };
     return resData;
  }

  RenderNotesPage(ID) {
      return '<input type="button" class="gridButton" value="View Notes" onclick="window.open(\'' + '@Url.RouteUrl("ChangeOrderNotes", new { ChangeOrderID = -1 })'.replace('-1', ID) + '\', \'\', \'toolbars=0,width=400,height=400,left=200,top=200,scrollbars=1,resizable=1\'), event.preventDefault();" />';
  }

  getTSGrdHrsCol(dtStrt: Date, dtEnd: Date, dll) {

    const dyColPrefix = 'WDay';
    const rsDtFld = [
        { name: 'Id', type: 'number' },
        { name: 'LkUsrNameId', type: 'number' },
        { name: 'LkCBSCodeId', type: 'number' },
        { name: 'LkWkNameId', type: 'number' },
        { name: 'Task', type: 'string' },
        { name: 'Title', type: 'string' },
    ];
    const rsCol = [
          {
            text: '#', sortable: false, filterable: false, editable: false,
            groupable: false, draggable: false, resizable: false,
            datafield: '', columntype: 'number', width: 10
            , displayfield: 'Title'
            , cellsrenderer: (row: number, column: any, value: number): string => {
                return '<div style="margin: 4px;">' + (value + 1) + '</div>';
            }
            , buttonclick: null,
        },
        { text: '##', datafield: 'Id', width: 30, cellsalign: 'center', align: 'center' , hidden: true, exportable: true
          , cellsrenderer: '', createeditor: null, displayfield: null, buttonclick: null,
        },
        { text: 'LkUsrNameId', datafield: 'LkUsrNameId', width: 30, cellsalign: 'center', align: 'center' , hidden: true, exportable: true
          , cellsrenderer: '', createeditor: null, displayfield: null, buttonclick: null,
        },
        // { text: "LkCBSCodeId", datafield: "LkCBSCodeId", width: 30, cellsalign: 'center', align: 'center' , hidden: true,exportable:true },
        { text: 'LkWkNameId', datafield: 'LkWkNameId', width: 30, cellsalign: 'center', align: 'center' , hidden: true, exportable: true },
        {
          text: 'Task Code' , datafield: 'LkCBSCodeId', width: 180,  cellsalign: 'left', align: 'center'
          , columntype: 'dropdownlist'
          , createeditor: (row: number, value: any, editor: any): void => {
          editor.jqxDropDownList({ width: '140', height: 32, source: dll, displayMember: 'afe_desc', valueMember: 'LkCBSCodeId' });
          }
          , displayfield: 'Title'
          , cellsrenderer: function() { return null; }, buttonclick: function(r) { },
        },
    ];
    const rsGrpCol = [];

    const vDtEnd = new Date(dtEnd);
    const vDtSrt = new Date(dtStrt);
    const diffTime = Math.abs(vDtEnd.getTime() - vDtSrt.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const wkday = new Array(7);
    wkday[0] = 'Sun';
    wkday[1] = 'Mon';
    wkday[2] = 'Tue';
    wkday[3] = 'Wed';
    wkday[4] = 'Thu';
    wkday[5] = 'Fri';
    wkday[6] = 'Sat';
    let dynSqlCol = '';
    for (let idx = 0; idx <= diffDays; idx++) {
      const dtWk = new Date(vDtSrt);
      dtWk.setDate(vDtSrt.getDate() + idx);
      const WkID = dyColPrefix + idx.toString();
       const rw = {
            text: this.formatDate(dtWk) , datafield: WkID, columngroup: WkID, width: 70,  cellsalign: 'center', align: 'center', columntype: 'textbox'
            , createeditor: null, displayfield: null
            , cellsrenderer: null, buttonclick: null,
        };
        rsCol.push(rw);

        const rwGrp = {
            text: wkday[dtWk.getDay()], align: 'center', name: WkID,
        };
        rsGrpCol.push(rwGrp);

        const rwDtFld = {
            name: WkID, type: 'number',
        };
        rsDtFld.push(rwDtFld);
        dynSqlCol = dynSqlCol + ',[' + idx + ']';
    }
    // rsCol.push(
    //     { text: "Approval Status" ,datafield: "APP_STATUS", width:110,  cellsalign: 'center', align: 'center', columntype: 'textbox' }, //,cellsrenderer: this.celRenApp
    //     { text: "Comments" ,datafield: "CLIENT_COMMENTS", width:260,  cellsalign: 'left', align: 'center', columntype: 'textbox' },
    // )

    rsCol.push(
       { text: 'Remarks' , datafield: 'Remrk', width: null,  cellsalign: 'center', align: 'center', columntype: 'textbox'
         , createeditor: null, displayfield: null
         , cellsrenderer: null, buttonclick: null,
          // ,cellsrenderer: function () {
          //     return "Save";
          // }
          // ,buttonclick: function (row) {
          //     open the popup window when the user clicks a button.
          // }
        }, // ,cellsrenderer: this.celRenApp
        { text: 'Delete' , datafield: 'delete', width: 60,  cellsalign: 'left', align: 'center', columntype: 'textbox'
          , createeditor: null, displayfield: null
          , cellsrenderer: function() { return '<button >Delete</button>'; }
          , buttonclick: function(r) {
          },
        },
    );

    const resData = {
      col : rsCol,
      colGrp : rsGrpCol,
      colType : rsDtFld,
      grdData :  null,
    };
     return resData;
  }

  getTSGrdHrsDtl(pWkId, pUsrId) {
    let qry  = '';
    if (pWkId !== null) {
      qry = 'LkWkName/Id eq ' + pWkId;
    }
    let vUsrId = '';
    if (pUsrId !== null) {
      vUsrId = 'LkUsrName/Id eq ' + pUsrId;
      if (qry.length > 0)
        qry = qry + ' and ' + vUsrId;
      else
        qry = vUsrId;
    }
    const url = '/_api/web/lists/GetByTitle(\'' + this.lsTSDtlHrs + '\')/items?$filter=' + qry + '&$select=ID,Title,AFEType,LkUsrName/Id,LkUsrName/UsrName,LkCBSCode/TASK_CODE,LkCBSCode/TASK_DESC,LkWkName/Id,LkUsrNameId,LkCBSCodeId,LkWkNameId,WDay0,WDay1,WDay2,WDay3,WDay4,WDay5,WDay6,WDay7,WDay8,WDay9&$expand=LkUsrName,LkCBSCode,LkWkName';
    return this.getSPX(url);
  }


  formatDate(date) {
    if (date !== undefined && date !== '') {
      const myDate = new Date(date);
      const month = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ][myDate.getMonth()];
      const str = myDate.getDate() + ' ' + month + ' ' + myDate.getFullYear();
      return str;
    }
    return '';
  }


  getWkTsAllSts(pRptId) {
    const qry = `/_api/web/lists/GetByTitle('${this.lstTSWeekly}')/items?$top=5000&$filter=LkWkName/Id+eq+${pRptId}&$select=ID,CallOffNO,TSPrj,PAAFNo,EmpID,Name,TotManDays,LkUsrNameId,LkStatusCode/StatusCode,LkStatusCode/ID&$expand=LkStatusCode`;
    return this.getSPX(qry);
  }

  getWkTSDaysSmry(pRptID, pCal, pTSPrj, pUsrId) {
    let vFlt ='';
    let vUsrId = '';
    if (pUsrId !== null) {
      vUsrId = 'LkUsrName/Id eq ' + pUsrId;
      if (vFlt.length > 0)
        vFlt = vFlt + ' and ' + vUsrId;
      else
        vFlt = vUsrId;
    }
    let vCal = '';
    if (pCal !== null) {
      vCal = 'CallOffNO eq \'' + pCal + '\'';
      if (vFlt.length > 0)
        vFlt = vFlt + ' and ' + vCal;
      else
        vFlt = vCal;
    }
    let vTSPrj = '';
    if (pTSPrj !== null) {
      vTSPrj = 'TSPrj eq \'' + this.removeSplChr(pTSPrj) + '\'';
      if (vFlt.length > 0)
        vFlt = vFlt + ' and ' + vTSPrj;
      else
        vFlt = vTSPrj;
    }
    let vRptID = '';
    if (pRptID !== null) {
      vRptID = 'LkWkName/Id eq ' + pRptID ;
      if (vFlt.length > 0)
        vFlt = vFlt + ' and ' + vRptID;
      else
        vFlt = vRptID;
    }
    if(vFlt.length >0){
      vFlt = '&$filter=' + vFlt
    }
    const url = `/_api/web/lists/GetByTitle('${this.lstTSWeekly}')/items?$top=5000${vFlt}`;
    return this.getSPX(url);
  }


  getTSWKDetail(RptID) {
    // let fltDprt =""
    // let fltDt ="(StartDt ge datetime'" + dtStrt  + "' and EndDt le datetime'" +dtEnd+"')"
    // if((dptName != "") && (dptName != "0" )){
    //   fltDprt = " and substringof('" +dptName+"',discipline)"
    // }
    const url = '/_api/web/lists/GetByTitle(\'' + this.lstTSWeekly + '\')/items?$filter=Id eq ' + RptID;
    const obj = this.get(url).pipe(
      map(res => JSON.parse(JSON.stringify(res)) ),
    );
    return obj;
  }

  AddWkTSDays(authCode, data) {
     return this.AddSpx(authCode, data, this.lstTSWeekly);
  }

  UptWkTSDays(authCode, data, pId) {
    return this.UptSpx(authCode, data, this.lstTSWeekly, pId);
 }

  public getCheckTsExist(vWkName, dptName) {
    let dptFlt = '';
    if (dptName != '0') {
      dptFlt = ' and substringof(\'' + dptName + '\',discipline)';
    }

    const obj = this.get('/_api/web/lists/getByTitle(\'' + this.lstTSWeekly + '\')/items?$select=ID&$filter=(substringof(\'' + vWkName + '\',WkName)' + dptFlt + ')').pipe(
      map(res => JSON.parse(JSON.stringify(res)) ),
    );
    return obj;
  }

  AddTS(authCode, data) {
    return this.AddSpx(authCode, data, this.lsTSDtlHrs);
  }

  UptTS(pAuthCode, pData, pId) {
    return this.UptSpx(pAuthCode, pData, this.lsTSDtlHrs, pId);
  }

  DelTS(pAuthCode, pId) {
    return this.DelSpx(pAuthCode, this.lsTSDtlHrs, pId);
  }

  AddTSSts(authCode, data) {
    return this.AddSpx(authCode, data, this.lsTSSts);
  }

  AddPAF(authCode, data) {
    return this.AddSpx(authCode, data, this.lsMPaf);
  }



  UptPAF(pAuthCode, pData, pId) {
    return this.UptSpx(pAuthCode, pData, this.lsMPaf, pId);
  }

  DelPAF(pAuthCode, pId) {
    return this.DelSpx(pAuthCode, this.lsMPaf, pId);
  }

  DelSpx(pAuthCode, pLstName, pId) {
   // var itemType = this.getItemTypeForListName(pLstName) ;
   // pData["__metadata"] = { "type": itemType };
    return this.post('/_api/web/lists/getByTitle(\'' + pLstName + '\')/items(' + pId + ')', pAuthCode, '', 'D').pipe(
      map(res => {
        return JSON.parse(JSON.stringify(res));
        }),
    );
  }

  bulkAddSts(pAuthCode, pArrData) {
    return this.batch(pAuthCode, pArrData, 'GC-MCode', null, 'C');
  }

  UptSpx(pAuthCode, pData, pLstName, pId) {
    const itemType = this.getItemTypeForListName(pLstName) ;
    pData['__metadata'] = { 'type': itemType };
    return this.post('/_api/web/lists/getByTitle(\'' + pLstName + '\')/items(' + pId + ')', pAuthCode, pData, 'U').pipe(
      map(res => {
        return JSON.parse(JSON.stringify(res));
        }),
    );
  }

  AddSpx(authCode, data, lstName) {
    const itemType = this.getItemTypeForListName(lstName) ;
    data['__metadata'] = { 'type': itemType };
    return this.post('/_api/web/lists/getByTitle(\'' + lstName + '\')/items', authCode, data, 'C').pipe(
      map(res => {
        return JSON.parse(JSON.stringify(res));
        }),
    );
  }

  AddFileMetadata(pAuthCode, pData) {
    return this.AddSpx(pAuthCode, pData, this.lsAtch);
  }

  AddFile(authCode, file , fileName, Id, isNew: boolean) {
    // let url ="/_api/web/lists/getByTitle('"+ this.lsAtch +"')/RootFolder/Files/Add(url='"+fileName+"', overwrite=true)"
    let url = '';
    if (isNew) {
      url = '/_api/web/lists/getbytitle(\'' + this.lsAtch  + '\')/items(' + Id + ')/AttachmentFiles/add(FileName=\'' + fileName + '\')';
    } else {
      url = '/_api/web/getfolderbyserverrelativeurl(\'Lists/' + this.lsAtch + '/Attachments/' + Id + '/\')/files/add(overwrite=true,url=\'' + fileName + '\')';
    }

    //
    return this.postFile(
      url, authCode, file,
      ).pipe(
      map(res => {
        return JSON.parse(JSON.stringify(res));
        }),
    );
  }

  getAttachDtl(pUsrId, pWkId) {
    let vFlt = '';
    let vUsr = '';
    if (pUsrId !== null) {
      vUsr = 'and LkUsrName/Id eq \'' + pUsrId + '\'';
      vFlt = vUsr;
    }

    const qry = '/_api/web/lists/GetByTitle(\'' + this.lsAtch + '\')/items?$filter=IsActiveStatus eq 1 and LkWkName/Id eq ' + pWkId + ' ' + vFlt + '&$select=ID,LkUsrNameId,LkWkName/Id,Attachments,FL_NME&$expand=LkWkName';
    return this.getSPX(qry);
  }

  getAttachLink(pItmId) {
    const qry = '/_api/web/lists/GetByTitle(\'' + this.lsAtch + '\')/items(' + pItmId + ')/AttachmentFiles?$select=FileName,ServerRelativeUrl';
    return this.getSPX(qry);
  }

  async  getAttachLinkByWkId(pWkId): Promise<any> {
    const dt: any[] = [];
    console.log(pWkId);
    const obj = await this.getAttachDtl(null, pWkId).pipe(
      map(async rs => {
        const resDtID = rs.d.results;
        if (resDtID.length > 0) {
          for (let i = 0; i < resDtID.length; i++) {
            const usrId = resDtID[i].LkUsrNameId;
            await this.getAttachLink(resDtID[i].ID).pipe(
              map( rsUrl => {
                const dtUrl = rsUrl.d.results;
                  const rw = {
                    LkUsrNameId: usrId,
                    atchUrl : this.env.spxHref + dtUrl[dtUrl.length - 1].ServerRelativeUrl,
                    atchFileName : dtUrl[dtUrl.length - 1].FileName,
                  };
                  dt.push(rw);
              }),
            ).toPromise();
          }
          return dt;
        } else
          return dt;
      }),
     ).toPromise();

    return obj;
  }

  getPAFByCalTSPrj(pCal, pTSPrj, pEmpSts) {
    let vFlt = '';
    let vCal = '';
    if (pCal !== null) {
      vCal = 'CallOffNumber eq \'' + pCal + '\'';
      if (vFlt.length > 0)
        vFlt = vFlt + ' and ' + vCal;
      else
        vFlt = vCal;
    }
    let vTSPrj = '';
    if (pTSPrj !== null) {
      vTSPrj = 'TSProject eq \'' + this.removeSplChr(pTSPrj) + '\'';
      if (vFlt.length > 0)
        vFlt = vFlt + ' and ' + vTSPrj;
      else
        vFlt = vTSPrj;
    }
    let vSts = '';
    if (pEmpSts !== null) {
      vSts = 'EmployeeStatus eq \'' + pEmpSts + '\'';
      if (vFlt.length > 0)
        vFlt = vFlt + ' and ' + vSts;
      else
        vFlt = vSts;
    }
    const url = '/_api/web/lists/GetByTitle(\'' + this.lsMPaf + '\')/items?$top=5000&$filter=' + vFlt;
    return this.getSPX(url);
  }

  getTSGrdHrsDtlByTSPrj(pWkId, pCallOf, pTSPrj) {
    let qry  = '';
    if (pWkId !== null) {
      qry = 'LkWkName/Id eq ' + pWkId;
    }
    let vCal = '';
    if (pCallOf !== null) {
      vCal = 'CallOffNo eq \'' + pCallOf + '\'';
      if (qry.length > 0)
        qry = qry + ' and ' + vCal;
      else
        qry = vCal;
    }
    let vTSPrj = '';
    if (pTSPrj !== null) {
      vTSPrj = 'TSPrj eq \'' + this.removeSplChr(pTSPrj) + '\'';
      if (qry.length > 0)
        qry = qry + ' and ' + vTSPrj;
      else
        qry = vTSPrj;
    }
    const url = '/_api/web/lists/GetByTitle(\'' + this.lsTSDtlHrs + '\')/items?$top=5000&$filter=' + qry + '&$select=ID,Title,AFEType,LkUsrName/Id,LkUsrName/UsrName,LkCBSCode/TASK_CODE,LkCBSCode/TASK_DESC,LkWkName/Id,LkUsrNameId,LkCBSCodeId,LkWkNameId,WDay0,WDay1,WDay2,WDay3,WDay4,WDay5,WDay6,WDay7,WDay8,WDay9&$expand=LkUsrName,LkCBSCode,LkWkName';
    return this.getSPX(url);
  }

  getTSCostCtrl(pWkID, pCal, pTSPrj, pRolID): Observable<any[]> {
    const objGlb = new GlbVarService;
    const rsPAF = this.getPAFByCalTSPrj(pCal, pTSPrj, objGlb.ddlPAFEmpStsActive);
    const rsTSHrs = this.getTSGrdHrsDtlByTSPrj(pWkID, pCal, pTSPrj);
    const rsWkTSDays = this.getWkTSDaysSmry(pWkID, pCal, pTSPrj, null);
    const rsAtch = this.getAttachDtl(null, pWkID);
    const rsRolSts = this.getTSStsByRol(null, pRolID, null, true);
    const rsActGrp = this.getWFNxtActionType(pRolID);
    const rsTSSts = this.getTSWkStsByTSPrjRol(pCal,pTSPrj,null,null,null,pWkID);
    const rsAprDtl = this.getApproverByRol(null,null,null);
    const rsPAFRnR = this.getPAFRnR(pWkID);
    return forkJoin([rsPAF, rsTSHrs, rsWkTSDays, rsAtch, rsRolSts, rsActGrp, rsTSSts, rsAprDtl,rsPAFRnR]);
  }

  getTSCostCtrlActDirector(pWkID,pRolID): Observable<any[]> {
    const objGlb = new GlbVarService;
    const dtTSWkSts = this.getWkTsAllSts(pWkID);
    const rsRolSts = this.getTSStsByRol(null, pRolID, null, true);
    const rsPAF = this.getPAFByCalTSPrj(null, null, objGlb.ddlPAFEmpStsActive);
    const rsActGrp = this.getWFNxtActionType(pRolID);
    const rsPAFRnR = this.getPAFRnR(pWkID);
    return forkJoin([dtTSWkSts, rsRolSts,rsPAF, rsActGrp,rsPAFRnR]);
  }

  getTSDirector(pWkID, pRolID): Observable<any[]> {
    const rsWkTSDays = this.getWkTSDaysSmry(pWkID, null, null, null);
    const rsAtch = this.getAttachDtl(null, pWkID);
    const rsTSWkSts = this.getTSWkStsByTSPrjRol(null, null, null,null, null, pWkID);
    const rsRolSts = this.getTSStsByRol(null, pRolID, null, true);
    return forkJoin([rsWkTSDays, rsAtch, rsTSWkSts, rsRolSts]);
  }

  getTSStatus(pWkID, pRolID): Observable<any[]> {
    const objGlb = new GlbVarService;
    const rsPAF = this.getPAFByCalTSPrj(null, null, objGlb.ddlPAFEmpStsActive);
    const rsWkTSDays = this.getWkTSDaysSmry(pWkID, null, null, null);
    const rsTSWkSts = this.getTSWkStsByTSPrjRol(null, null, null,null, null, pWkID);
    const rsRolSts = this.getTSStsByRol(null, pRolID, null, true);
    const rsPAFRnR = this.getPAFRnR(pWkID);
    return forkJoin([rsPAF, rsWkTSDays, rsTSWkSts, rsRolSts, rsPAFRnR]);
  }

  getTSLead(pWkID, pRolID,pUsrID): Observable<any[]> {
    const rsTSHrs = this.getTSGrdHrsDtlByTSPrj(pWkID, null, null);
    const rsWkTSDays = this.getWkTSDaysSmry(pWkID, null, null, null);
    const rsAtch = this.getAttachDtl(null, pWkID);
    const rsRolSts = this.getTSStsByRol(null, pRolID, null, true);
    const rsActGrp = this.getWFNxtActionType(pRolID);
    const rsAprDtl = this.getApproverByRol(null,pRolID,pUsrID);
    const rsTSWkSts = this.getTSWkStsByTSPrjRol(null, null, null,null, null, pWkID);
    return forkJoin([rsTSHrs, rsWkTSDays, rsAtch, rsRolSts, rsActGrp, rsAprDtl,rsTSWkSts]);
  }

  getWkRpt(pWkID,pCallOf,pTSPrj): Observable<any[]> {
    const rsWkTSDays = this.getWkTSDaysSmry(pWkID, pCallOf, pTSPrj, null);
    const rsTSHrs = this.getTSGrdHrsDtlByTSPrj(pWkID, pCallOf, pTSPrj);
    const rsTSWkSts = this.getTSWkStsByTSPrjRol(pCallOf, pTSPrj, null,null, null, pWkID);
    return forkJoin([rsWkTSDays, rsTSHrs, rsTSWkSts]);
  }

  getPAFReg(pUsrID) {
    let vFlt = '';
    if (pUsrID !== null) {
      vFlt = `&$filter=LkUsrName/ID+eq+${pUsrID}&expand=LkUsrName`;
    }
    const qry = '/_api/web/lists/GetByTitle(\'' + this.lsMPaf + '\')/items?$top=5000' + vFlt;
    return this.getSPX(qry);
  }

  AddLogEmail(authCode, data) {
    return this.AddSpx(authCode, data, this.lsLgEmail);
  }

  sendEmail(authCode, from, to, cc, bdy, subj) {
    const lg ={
      Title: from,
       to: JSON.stringify(to),
       cc: cc,
       subj: subj,
       bdy: bdy
    }
    //return this.AddLogEmail(authCode, lg);

    this.AddLogEmail(authCode, lg).subscribe(rs =>{
      console.log('rs_eml_lg');
    })
    const data = {
      'properties': {
          '__metadata': { 'type': 'SP.Utilities.EmailProperties' },
          'From': from,
          'To': { 'results':  to },
          'CC': { 'results': [cc] },
          'Body': bdy,
          'Subject': subj,
          'AdditionalHeaders': {
            '__metadata': { 'type': 'Collection(SP.KeyValue)' },
            'results':
            [
                {
                    '__metadata': {
                        'type': 'SP.KeyValue',
                    },
                    'Key': 'content-type',
                    'Value': 'text/html',
                    'ValueType': 'Edm.String',
                },
            ],
          },
        },
      };
    return this.post('/_api/SP.Utilities.Utility.SendEmail', authCode, JSON.stringify(data), 'C').pipe(
      map(res => {
        return JSON.parse(JSON.stringify(res));
        }),
    );
  }

}
