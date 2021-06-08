import {  Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import {  NbToastrService, NbDialogService  } from '@nebular/theme';

import { TsCostApprovalDialogComponent } from '../modal-overlays/ts-cost-approval-dialog/ts-cost-approval-dialog.component';
import { ConfirmdialogComponent } from '../modal-overlays/confirmdialog/confirmdialog.component';
import { jqxTreeGridComponent } from 'jqwidgets-ng/jqxtreegrid';

import { SPXUserInfoService } from '../../../services/SPXuserinfo.service';
import { LogininfoService } from '../../../services/logininfo.service';
import { GlbVarService } from '../../../../src/services/glbvar.service';
import { SPXlstService } from '../../../services/SPXlst.service';
import { EnvService } from '../../../services/env.service';
import { XlService } from '../../../services/xl.service';
import { forkJoin, Observable } from 'rxjs';
//import { now } from 'jquery';


@Component({
  selector: 'ngx-ts-cost-ctrl',
  templateUrl: './ts-cost-ctrl.component.html',
  styleUrls: ['./ts-cost-ctrl.component.scss']
})
export class TsCostCtrlComponent implements OnInit {

  constructor(
    private frmBld: FormBuilder,
    private srGlbVar: GlbVarService,
    private srSPXLst: SPXlstService,
    private srMsg: NbToastrService,
    private srLoginInfo: LogininfoService,
    public env: EnvService,
    private srUserInfo: SPXUserInfoService,
    private srDialog: NbDialogService,
    private srXl: XlService
  ) {
    this.srUserInfo.getRefreshAuthToken();
   }

  frmGrp1: FormGroup;
  frmGrpDtl: FormGroup;

  dtWk: any = [];
  slctStrtDt: Date;
  slctEndDt: Date;
  _pgRolID: number;
  _pgRolCode: string= this.srGlbVar.rolTSCostCtrl;
  _wkID: number;
  isProg = false;

  _rolClntLead: string = this.srGlbVar.rolGCDisLD;
  _rolSNCLead: string = this.srGlbVar.rolSNCDisLD;

  grdCol: any[];
  grdDA;
  grdData;
  grdColGrp;
  grdSource: any;
  @ViewChild('grdTS', { static: false }) grdTS: jqxTreeGridComponent;

  @ViewChild('grdDiv') private grdDiv: ElementRef;

  grdTSStsAll: any = [];

  dtApproveDtl: any =[]

  ngOnInit(): void {
    this. prepareForm();
    const obj = this.srSPXLst.getMRolIDByRoleName(this.srGlbVar.rolTSCostCtrl);
    obj.then((rs) => {
      this._pgRolID = rs;
      this.getTsName();
    });
    this.loadUsrInfo();
    this.getCBSCode();
  }

  /* ----------------------------- PREPARE FORM ---------------------------- */
  prepareForm() {
    this.frmGrp1 = this.frmBld.group({
      tsName: [null],
      dtFrom: [null],
      dtTo: [null],
      tsSts: [null],
      tsDepart: [null],
      tsCmts: [null],
      ctCallOff: [null],
      ctTSPrj: [null],
      tsAllRmks: [null]
    });
    this.frmGrpDtl = this.frmBld.group({
      ddlAprType:[null],
      ddlAprUsrName:[null],
      ddlHideCol:[null],
      tsAppRmks:[null],
      ctEmailEnable:[true]
    });
  }

  getTsName() {
    this.srSPXLst.getTSMaster(null).subscribe(rs => {
      this.dtWk = rs.d.results;

      if (this.dtWk.length > 0) {
        const dfDt = this.dtWk[this.dtWk.length - 1]['Id'];
        this.frmGrp1.controls['tsName'].setValue(dfDt);
        this.setStrtEndDt(dfDt);

      }
    }, err => {
      console.log(err);
      this.srMsg.show(err, 'ERROR',
        {status: 'danger', destroyByClick: true, duration: 8000, hasIcon: true},
        );
    },
    );
  }

  ddlSrcCbs: any;
  ddlDaCbs: any;
  getCBSCode(){
    this.srSPXLst.getMCBS(this.srGlbVar.ddlCodeCBSAFE).subscribe(rs =>{
      this.ddlSrcCbs ={
        datatype: 'array',
          datafields: [
              { name: 'TASK_CODE', type: 'string' },
              { name: 'ID', type: 'number' },
          ],
          localdata : rs.d.results,
      }
      this.ddlDaCbs = new jqx.dataAdapter(this.ddlSrcCbs, { autoBind: true });
    })
  }

  setStrtEndDt(RptID) {
    const flt = this.dtWk.filter(a => a.Id == RptID);
    this._wkID = RptID;
    this.slctStrtDt = flt[0].start_dt;
    this.slctEndDt = flt[0].end_dt;
    this.frmGrp1.controls['dtFrom'].setValue(this.srGlbVar.formatDate(this.slctStrtDt));
    this.frmGrp1.controls['dtTo'].setValue(this.srGlbVar.formatDate(this.slctEndDt));
    this.fnGrdLoadCol();
    this.getAllTSSts(this._wkID);
    this.getTSData(this._wkID)
  }

  loadUsrInfo() {
    if ((this.srLoginInfo.loginId === null) ||
     (this.srLoginInfo.loginId === undefined)) {
      const objUsr = this.srUserInfo.getLoginDtl();
      objUsr.then((rs) => {
        this.srLoginInfo.loginId = rs.loginId;
        this.srLoginInfo.loginFulName = rs.loginFulName;
        this.srLoginInfo.loginUsrName = rs.loginUsrName;

      });
    } else {
    }
  }
  grdDataFld;
  fnGrdLoadCol() {
    const obj = this.grdDynCol(this.slctStrtDt, this.slctEndDt);
    this.grdCol = obj['col'];
    this.grdColGrp = obj['colGrp'];
    this.grdDataFld = obj['dataField'];
    this.grdSource = {
      localdata: this.grdData,
      dataType: 'json',
      datafields:  this.grdDataFld,
      hierarchy:
      {
          root: 'children',
      },
      id: 'ID',
      // addRow: (rowID, rowData, position, parentID, commit) => {
      //   // synchronize with the server - send insert command
      //   // call commit with parameter true if the synchronization with the server is successful
      //   // and with parameter false if the synchronization failed.
      //   // you can pass additional argument to the commit callback which represents the new ID if it is generated from a DB.

      //   commit(true);
      // },
      updateRow: (rowID, rowData, commit) => {
          // synchronize with the server - send update command
          // call commit with parameter true if the synchronization with the server is successful
          // and with parameter false if the synchronization failed.
          commit(true);
      },
      // deleteRow: (rowID, commit) => {
      //     // synchronize with the server - send delete command
      //     // call commit with parameter true if the synchronization with the server is successful
      //     // and with parameter false if the synchronization failed.
      //     commit(true);
      // },
    };

    this.grdDA = new jqx.dataAdapter(this.grdSource);
  }

  onSelectTsName(value) {
    this.setStrtEndDt(value);

  }

  grdDynCol(dtStrt: Date, dtEnd: Date) {
    const dyColPrefix = 'WDay';
    const rsDtFld = [
        { name: 'ID', type: 'number' },
        { name: 'PAFID', type: 'number' },
        { name: 'HRSID', type: 'number' },
        { name: 'DAYSID', type: 'number' },
        { name: 'SLNO', type: 'number' },
        { name: 'LkUsrNameId', type: 'number' },
        { name: 'LkCBSCodeId', type: 'number' },
        { name: 'LkWkNameId', type: 'number' },
        { name: 'Name', type: 'string' },
        { name: 'PAAFJobTitle', type: 'string' },
        { name: 'OrgChartPositionTitle', type: 'string' },
        { name: 'OrgChartIDNo', type: 'string' },
        { name: 'ServicesLocation', type: 'string' },
        { name: 'PAAFNo', type: 'string' },
        { name: 'TotManDays', type: 'number' },
        { name: 'CBSCode', type: 'string' },
        { name: 'AFEType', type: 'string' },
        { name: 'children', type: 'array' },
        { name: 'atchUrl', type: 'string' },
        { name: 'atchFileName', type: 'string' },
        { name: 'LkStatusCodeId', type: 'string' },
        { name: 'IsAction', type: 'number' },
        { name: 'IsVisible', type: 'number' },
        { name: 'TSStsDesc', type: 'string' },
        { name: 'ActionGrpUser', type: 'string'},
        { name: 'ActionGrpDisc', type: 'string'},
        { name: 'snc_lead', type: 'string'},
        { name: 'snc_mgr', type: 'string'},
        { name: 'snc_ld_name', type: 'string'},
        { name: 'snc_ld_sts', type: 'string'},
        { name: 'snc_ld_css', type: 'string'},
        { name: 'snc_mgr_name', type: 'string'},
        { name: 'snc_mgr_sts', type: 'string'},
        { name: 'snc_mgr_css', type: 'string'},
        { name: 'clnt_ld_name', type: 'string'},
        { name: 'clnt_ld_sts', type: 'string'},
        { name: 'clnt_ld_css', type: 'string'},
        { name: 'clnt_mgr_name', type: 'string'},
        { name: 'clnt_mgr_sts', type: 'string'},
        { name: 'clnt_mgr_css', type: 'string'},
        { name: 'clnt_drct_name', type: 'string'},
        { name: 'clnt_drct_sts', type: 'string'},
        { name: 'clnt_drct_css', type: 'string'},
        { name: 'snc_ld_apr_email', type: 'string'},
        { name: 'snc_mgr_apr_email', type: 'string'},
        { name: 'clnt_ld_apr_email', type: 'string'},
        { name: 'clnt_mgr_apr_email', type: 'string'},
        { name: 'clnt_drct_apr_email', type: 'string'},
        { name: 'CallOffNO', type: 'string'},
        { name: 'TSPrj', type: 'string'}
    ];
    const rsCol = [
        { text: 'LkUsrNameId', datafield: 'LkUsrNameId', width: 30, cellsalign: 'center', align: 'center' , hidden: true, exportable: true
          , cellsrenderer: '', createeditor: null, displayfield: null, buttonclick: null,
        },
        { text: 'LkWkNameId', datafield: 'LkWkNameId', width: 30, cellsalign: 'center', align: 'center' , hidden: true
        , exportable: false,
        },
        { text: 'IsAction', datafield: 'IsAction', width: 30, cellsalign: 'center', align: 'center' , hidden: true
        , exportable: false,
        },
        { text: 'LkStatusCodeId', datafield: 'LkStatusCodeId', width: 30, cellsalign: 'center', align: 'center' , hidden: true
        , exportable: false,
        },
        { text: 'TSStsDesc', datafield: 'TSStsDesc', width: 30, cellsalign: 'center', align: 'center' , hidden: true
          , exportable: false,
        },
        {
          text: 'Task Code' , datafield: 'LkCBSCodeId', width: 180,  cellsalign: 'left', align: 'center', hidden: true
          , exportable: true,
        },
        {
          text: 'SlNo', datafield: 'SLNO', width: 60, cellsalign: 'center', align: 'center', hidden: false, exportable: true
          , pinned: true, editable: false
          , cellclassname: null//, cellclassname: this.cellclass,
        },
        {
          text: 'Status', width: 130, cellsAlign: 'center', align: 'center', columnType: 'none' , sortable: false, dataField: 'btncol'
          , exportable: false, editable: false
          , cellsRenderer: (row, dataField, cellValueInternal, rowData, cellText): string => {
            const rw = rowData;
            const strReturn =`<div id='grd_btn_id_${row}' grd-btn-desc='${rw.TSStsDesc}' grd-row-id='${row}'
            IsAction='${rw.IsAction}' LkUsrNameId='${rw.LkUsrNameId}' grd-btn-status ></div>`;
            if(rw.IsAction){
              if((rw.IsAction == true) &&
                (rw.ActionGrpUser == true)){
                return strReturn
              } else{
                return `<div id='grd_btn_id_${row}' grd-btn-desc='${rw.TSStsDesc}' grd-row-id='${row}'
                IsAction='false' LkUsrNameId='${rw.LkUsrNameId}' grd-btn-status ></div>`;
              }
            }
            return strReturn;
          }
          , cellclassname: null// cellclassname: this.cellclass
        },
        {
          text: 'Employee Name' , datafield: 'Name', width: 240,  cellsalign: 'left', align: 'center'
          , editable: false
          , cellclassname: null//cellclassname: this.cellclass,
        },
        {
          text: 'PAAF Job Title' , datafield: 'PAAFJobTitle', width: 180,  cellsalign: 'left', align: 'center', hidden: true,
          editable: false
          , cellclassname: null// cellclassname: this.cellclass,
        },
        {
          text: 'Org Chart Position Title' , datafield: 'OrgChartPositionTitle', width: 180,  cellsalign: 'left', hidden: true,
          align: 'center', editable: false
          , cellclassname: null//, cellclassname: this.cellclass,
          ,exportable: false
        },
        {
          text: 'Org Chart ID No.' , datafield: 'OrgChartIDNo', width: 120,  cellsalign: 'left', align: 'center', hidden: true,
          editable: false
          , cellclassname: null//, cellclassname: this.cellclass,
          ,exportable: false
        },
        {
          text: 'Work Location' , datafield: 'ServicesLocation', width: 90,  cellsalign: 'left', align: 'center', hidden: true,
          editable: false
          , cellclassname: null//, cellclassname: this.cellclass,
          ,exportable: false
        },
        {
          text: 'PAAF No.' , datafield: 'PAAFNo', width: 60,  cellsalign: 'left', align: 'center', hidden: false,
          editable: false
          ,cellclassname: null//cellclassname: this.cellclass,
          ,exportable: true
        },
        {
          text: 'Attachment' , datafield: 'atchUrl', width: 70,  cellsalign: 'left', align: 'center', hidden: false, editable: false,
          cellsrenderer: this.grdFnLnkRender
          , cellclassname: null//, cellclassname: this.cellclass
          , exportable: false,
        },
        {
          text: 'CTR Project Code' , datafield: 'CBSCode', width: 120,  cellsalign: 'left', align: 'center'
          , cellclassname: this.cellclass
          , columntype: 'template'
          , exportable: false
          , createeditor: (row: number, value: any, editor: any): void => {
            editor.jqxDropDownList({ width: '135', height: 22, source: this.ddlDaCbs, displayMember: 'TASK_CODE', valueMember: 'ID' });
          },
          initEditor: (row, cellvalue, editor, celltext, width, height) => {
            // set the editor's current value. The callback is called each time the editor is displayed..
            let flt = this.ddlSrcCbs.localdata.filter(el => el.TASK_CODE == cellvalue)
            if(flt.length >0){
              editor.jqxDropDownList('selectItem', flt[0].ID);
            }
          },
          getEditorValue: (row, cellvalue, editor) => {
            // return the editor's value.
            let flt = this.ddlSrcCbs.localdata.filter(el => el.ID == editor.val());
            console.log(flt[0])
            if(flt.length >0){
              this.grdTS.setCellValue(row,'CBSCode',flt[0].TASK_CODE);
              return flt[0].TASK_CODE;//editor.val();
            } else{
              return editor.val();
            }
          }
        },
        {
          text: 'Category' , datafield: 'AFEType', width: 60,  cellsalign: 'left', align: 'center'
          , cellclassname: this.cellclass
          , exportable: false
        },
        {
          text: 'Total Man Days' , datafield: 'TotManDays', width: 60,  cellsalign: 'center', align: 'center', hidden: false,
          editable: false
          , cellclassname: this.cellclass
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
            text: this.srGlbVar.formatDate(dtWk)
            , datafield: WkID, columngroup: WkID, width: 76,  cellsalign: 'center', align: 'center'
            , cellsrenderer: null
            , cellclassname: this.cellclass
            , editable: true,
        };
        rsCol.push(rw);

        const rwGrp = {  text: wkday[dtWk.getDay()], align: 'center', name: WkID  };
        rsGrpCol.push(rwGrp);
        const rwDtFld = { name: WkID, type: 'number' };
        rsDtFld.push(rwDtFld);
        dynSqlCol = dynSqlCol + ',[' + idx + ']';
    }
    let
    colAppr =
    {
        text: 'Approver Name'
      , datafield: 'snc_ld_name', columngroup: 'snc_lead', width: 90,  cellsalign: 'center', align: 'center'
      , cellsrenderer: null, cellclassname: null, editable: false
      , hidden: false, exportable: true
    }
    rsCol.push(colAppr);
    colAppr =
    {
        text: 'Status'
      , datafield: 'snc_ld_sts', columngroup: 'snc_lead', width: 90,  cellsalign: 'center', align: 'center'
      , cellsrenderer: null, cellclassname: null, editable: false
      , hidden: false, exportable: true
    }
    rsCol.push(colAppr);
    // colAppr =
    // {
    //     text: 'Approver Name'
    //   , datafield: 'snc_mgr_name', columngroup: 'snc_mgr', width: 90,  cellsalign: 'center', align: 'center'
    //   , cellsrenderer: null, cellclassname: null, editable: false
    //   , hidden: false, exportable: true
    // }
    // rsCol.push(colAppr);
    // colAppr =
    // {
    //     text: 'Status'
    //   , datafield: 'snc_mgr_sts', columngroup: 'snc_mgr', width: 90,  cellsalign: 'center', align: 'center'
    //   , cellsrenderer: null, cellclassname: null, editable: false
    //   , hidden: false, exportable: true
    // }
    // rsCol.push(colAppr);
    colAppr =
    {
        text: 'Approver Name'
      , datafield: 'clnt_ld_name', columngroup: 'clnt_lead', width: 90,  cellsalign: 'center', align: 'center'
      , cellsrenderer: null, cellclassname: null, editable: false
      , hidden: false, exportable: true
    }
    rsCol.push(colAppr);
    colAppr =
    {
        text: 'Status'
      , datafield: 'clnt_ld_sts', columngroup: 'clnt_lead', width: 90,  cellsalign: 'center', align: 'center'
      , cellsrenderer: null, cellclassname: null, editable: false
      , hidden: false, exportable: true
    }
    rsCol.push(colAppr);
    // colAppr =
    // {
    //     text: 'Approver Name'
    //   , datafield: 'clnt_mgr_name', columngroup: 'clnt_mgr', width: 90,  cellsalign: 'center', align: 'center'
    //   , cellsrenderer: null, cellclassname: null, editable: false
    //   , hidden: false, exportable: true
    // }
    // rsCol.push(colAppr);
    // colAppr =
    // {
    //     text: 'Status'
    //   , datafield: 'clnt_mgr_sts', columngroup: 'clnt_mgr', width: 90,  cellsalign: 'center', align: 'center'
    //   , cellsrenderer: null, cellclassname: null, editable: false
    //   , hidden: false, exportable: true
    // }
    // rsCol.push(colAppr);
    // colAppr =
    // {
    //     text: 'Approver Name'
    //   , datafield: 'clnt_drct_name', columngroup: 'clnt_drct', width: 90,  cellsalign: 'center', align: 'center'
    //   , cellsrenderer: null, cellclassname: null, editable: false
    //   , hidden: false, exportable: true
    // }
    // rsCol.push(colAppr);
    // colAppr =
    // {
    //     text: 'Status'
    //   , datafield: 'clnt_drct_sts', columngroup: 'clnt_drct', width: 90,  cellsalign: 'center', align: 'center'
    //   , cellsrenderer: null, cellclassname: null, editable: false
    //   , hidden: false, exportable: true
    // }
    // rsCol.push(colAppr);
    rsGrpCol.push({ text: 'SNC Lead', align: 'center', name: 'snc_lead' })
    //rsGrpCol.push({ text: 'SNC Director', align: 'center', name: 'snc_mgr' })
    rsGrpCol.push({ text: 'Client Lead', align: 'center', name: 'clnt_lead' })
    // rsGrpCol.push({ text: 'ROO Contract Admin', align: 'center', name: 'clnt_mgr'})
    // rsGrpCol.push({ text: 'ROO Director', align: 'center', name: 'clnt_drct'})
    const resData = {
      col : rsCol,
      colGrp : rsGrpCol,
      dataField : rsDtFld,
      grdData :  null,
    };
     return resData;

  }

  cellclass = function (row, dataField, cellValueInternal, rowData, cellText) {
    if (rowData['Name'] == null) {
      return 'cssGrdChildRow';
    }
    if(dataField =='snc_ld_sts'){
      if(rowData['snc_ld_css'] == 'red'){
        return 'grdTxtRed';
      } else if(rowData['snc_ld_css'] == 'green'){
        return 'grdTxtGreen';
      } else {
        return null
      }
    }
    if(dataField =='snc_mgr_sts'){
      if(rowData['snc_mgr_css'] == 'red'){
        return 'grdTxtRed';
      } else if(rowData['snc_mgr_css'] == 'green'){
        return 'grdTxtGreen';
      } else {
        return null
      }
    }
    if(dataField =='clnt_ld_sts'){
      if(rowData['clnt_ld_css'] == 'red'){
        return 'grdTxtRed';
      } else if(rowData['clnt_ld_css'] == 'green'){
        return 'grdTxtGreen';
      } else {
        return null
      }
    }
    if(dataField =='clnt_mgr_sts'){
      if(rowData['clnt_mgr_css'] == 'red'){
        return 'grdTxtRed';
      } else if(rowData['clnt_mgr_css'] == 'green'){
        return 'grdTxtGreen';
      } else {
        return null
      }
    }
    if(dataField =='clnt_drct_sts'){
      if(rowData['clnt_drct_css'] == 'red'){
        return 'grdTxtRed';
      } else if(rowData['clnt_drct_css'] == 'green'){
        return 'grdTxtGreen';
      } else {
        return null
      }
    }
    return null
  };

  grdFnLnkRender(row, dataField, cellValueInternal, rowData, cellText): string {
     const cellUrl = rowData[dataField];
     let cellValue = rowData['atchFileName'];
     if ((cellUrl !== null) && (cellUrl !== undefined)) {
       if(cellValue){
        if (cellValue.length > 10) {
          cellValue = String(cellValue).substr(0, 7) + '...';
        }
      }
       return '<a href=\'' + cellUrl + '\' target=\'_blank\'>' + cellValue + '</a>';
     } else
       return '';

  }

  getAllTSSts(pRptID) {
    this.grdTSStsAll =[];
    this.srSPXLst.getTSCostCtrlActDirector(pRptID,this._pgRolID).subscribe(rs => {
      const dtWKSts = rs[0].d.results;
      const dtRolSts = rs[1].d.results;
      const dtPAFRw = rs[2].d.results;
      const dtActGrpType = rs[3].d.results;
      const dtRnR = rs[4].d.results;
      //REMOVE R&R EMPLOYEE FROM TIMESHEET SUBMISSION
      //GET THE JSON IS ARRAY STRING
      let vFltRnRID =''
      for (let i = 0; i < dtRnR.length; i++) {
        const el = dtRnR[i].LkEmployeeIDId;
        vFltRnRID = vFltRnRID +'|'+ el +'|';
      }
      //FILTER NOT IN THE STRING
      const dtPAF = dtPAFRw.filter(d => {
        const v = '|' + d.ID +'|';
        return !vFltRnRID.includes(v)
      })

      for (let i = 0; i < dtPAF.length; i++) {
        let elPAF = dtPAF[i];
        if(elPAF.LkUsrNameId){
          let fltSts = dtWKSts.filter(eSts => eSts.LkUsrNameId == elPAF.LkUsrNameId)
          if(fltSts.length >0){
            elPAF['LkStatusCodeId']=fltSts[0]['LkStatusCode'].ID
            const fltStsDtl = dtRolSts.filter(elf => elf.LkStatusCodeId == elPAF['LkStatusCodeId']);
            if (fltStsDtl.length > 0) {
              elPAF['IsAction'] = fltStsDtl[0].IsAction;
              elPAF['TSStsDesc'] = fltStsDtl[0].Title;
              elPAF['IsVisible'] = true;
              const fltGrpSts = dtActGrpType.filter(el => el.LkStatusCodeId == elPAF['LkStatusCodeId'] && el.ActionGrpType == this.srGlbVar.nxtActionGrpDirector)
              if(fltGrpSts.length >0){
                elPAF['ActionGrpAll']= true;
              } else{
                elPAF['ActionGrpAll']= false;
              }

            }
            elPAF['DAYSID']=fltSts[0]['ID'];
            elPAF['TotManDays']=fltSts[0]['TotManDays'];
          }
        } else{
          elPAF['DAYSID']=0;
        }

        this.grdTSStsAll.push(elPAF)
      }
      this.actionBtnEnableDirector();
    }, err => {
      console.log(err);
      this.srMsg.show(err, 'ERROR',
        {status: 'danger', destroyByClick: true, duration: 8000, hasIcon: true},
        );
    });
  }

  dtBtnActionLead: any[] = [];
  actionBtnEnableLead() {
    const slctLd =  this.frmGrpDtl.controls.ddlAprUsrName.value
    if(slctLd !== null){
      let crrSts = 0;
      const flt = this.grdSource.localdata.filter(el => el.ActionGrpDisc == true)
      if (flt.length > 0) {
        crrSts = flt[0]['LkStatusCodeId'];
        // IF ALL TIMESHEET APPROVED BY COST CONTROL THEN ENABLE LEAD SUBMIT BUTTON
        if (flt.length == this.grdSource.localdata.length) {
          this.srSPXLst.getWFNxtAction(crrSts, this._pgRolID,this.srGlbVar.nxtActionGrpLead).subscribe(rs => {
            this.dtBtnActionLead = rs.d.results;
          });
        } else {
          this.dtBtnActionLead = [];
        }
      } else{
        this.dtBtnActionLead = [];
      }
    } else{
      this.dtBtnActionLead = [];
    }

  }

  dtBtnActionAll: any[] = [];
  actionBtnEnableDirector() {
    let crrSts = 0;
    const flt = this.grdTSStsAll.filter(el => el.ActionGrpAll== true);
    if (flt.length > 0) {
      crrSts = flt[0]['LkStatusCodeId'];
      // IF ALL TIMESHEET APPROVED BY COST CONTROL THEN ENABLE DIRECTOR SUBMIT BUTTON
      if (this.grdTSStsAll.length == flt.length){
        this.srSPXLst.getWFNxtAction(crrSts, this._pgRolID,this.srGlbVar.nxtActionGrpDirector).subscribe(rs => {
          this.dtBtnActionAll = rs.d.results;
        });
      } else{
        this.dtBtnActionAll = [];
      }
    } else{
      this.dtBtnActionAll = [];
    }

  }

  onSubmitTSDirector(pNxtStsID) {
    const tsName = this.frmGrp1.get('tsName').value;
    const fltr = this.dtWk.filter(a => a.Id == tsName);
    const fltAct = this.dtBtnActionAll.filter(a => a.LkNxtStatusCodeId == pNxtStsID);
    if (fltr) {
      this.srDialog.open(ConfirmdialogComponent,
        {
          context: {
            IsConfirm: true,
            title: 'Confirm',
            message: 'Are you sure, you want to ' + fltAct[0].CurrStatusDesc + ' ( ' + fltr[0].WkName + ' ) ?',
          }, dialogClass:'jqx-menu'
        })
        .onClose.subscribe(result => {
          if (result == true) {
            this.isProg = true;
            let vLkStsCodeID :number;
            let vCallOff :string;
            let vTSPrj :string;
            const dtNow = this.srGlbVar.dateAheadFix(new Date());
            let observables: Observable<any>[] =<any>[];
            for (let i = 0; i < this.grdTSStsAll.length; i++) {
              const el = this.grdTSStsAll[i];
              const rwSumSts ={
                LkStatusCodeId: pNxtStsID,
                // LkWkNameId: this._wkID,
                // LkUsrNameId: el.LkUsrNameId,
                LastActDt: dtNow,
                LastRmks: this.frmGrp1.controls.tsAllRmks.value,
                LkActUsrNameId: this.srLoginInfo.loginId,
                LkActRolNameId: this._pgRolID,
                LogSts: 0
              }
              vLkStsCodeID=el.LkStatusCodeId;
              vCallOff=el.CallOffNumber;
              vTSPrj=el.TSProject;
              observables.push(this.srSPXLst.UptWkTSDays(this.srLoginInfo.authCode,rwSumSts,el.DAYSID));

              // this.fnUpdSummary(rwSumSts,el.DAYSID)
              // this.uptChangeStsDirector(fltr[0].WkName, pNxtStsID, el.LkUsrNameId, el.LkStatusCodeId
              //   , el.CallOffNumber, el.TSProject,true,false
              //   ,this.frmGrp1.controls.tsAllRmks.value);
            }
            forkJoin(observables).subscribe(rsArr => {
              console.log('Request Array Done');
              this.fnSendEmail(fltr[0].WkName, pNxtStsID,vLkStsCodeID
                ,true,false
                , this.frmGrp1.controls.tsAllRmks.value)
              this.isProg = false;
            });
          }
        });
    }
  }

  fnSendEmail(pTSName, pNxtStsID, pCurrStsID
    ,pEmailEnabled: boolean,pIsLeadData: boolean, pRmks){
      const flt = this.dtBtnActionAll.filter(a => a.LkNxtStatusCodeId == pNxtStsID);
      let dsNxtDesc = '';
      if (flt.length > 0) {
        dsNxtDesc = flt[0].NxtStatusDesc;
      }
      this.isProg = false;
      if (
        (pCurrStsID !== pNxtStsID) &&
        (flt[0].NxtStatusEmail != null) &&
        pEmailEnabled
        ) {
          this.srSPXLst.addSendNxtStatusEmailDirector(
            this.srLoginInfo.loginUsrName, dsNxtDesc, pNxtStsID,
            flt[0].NxtActOnlyToUsr,
            pTSName, this._wkID, this.srUserInfo.loginInfo.loginId,
            flt[0].NxtStatusEmail,
            this.expGrdAsJson(pIsLeadData), null,
            pRmks
            );
      }
      this.srMsg.show(pTSName + ' - ' + dsNxtDesc + ' Successfully', 'Success',
      {status: 'success', destroyByClick: true, duration: 5000, hasIcon: true},
      );
      this.setStrtEndDt(this._wkID);
      this.loadUsrInfo();
  }

  fnUpdSummary(pSmryUpt,pDayId){
    //UPDATE USER SUMMARY TABLE STATUS
    this.srSPXLst.UptWkTSDays(this.srLoginInfo.authCode,pSmryUpt,pDayId).subscribe(rs =>{

    })
  }

  uptChangeStsDirector(pTSName, pNxtStsID, pUsrNameId, pCurrStsID, pCallOff, pTSPrj
    ,pEmailEnabled: boolean,pIsLeadData: boolean, pRmks) {
    this.isProg = true;
    const dtNow = this.srGlbVar.dateAheadFix(new Date());
    const rw = {
      CallOffNo: pCallOff,
      TSPrj: pTSPrj,
      SubmitDt: dtNow,
      Comments: pRmks,
      LkStatusCodeId: pNxtStsID,
      LkWkNameId: this._wkID,
      LkTsUsrNameId: pUsrNameId,
      LkActionByUsrNameId: this.srLoginInfo.loginId,
      LkActionByRoleNameId: this._pgRolID,
    };
    const flt = this.dtBtnActionAll.filter(a => a.LkNxtStatusCodeId == pNxtStsID);

    this.srSPXLst.AddTSSts(this.srLoginInfo.authCode, rw).subscribe(rs => {
      this.isStsUptCnt = this.isStsUptCnt + 1;
      if (this.isStsUptCnt >= this.grdTSStsAll.length) {
        if (rs !== null) {
          let dsNxtDesc = '';
          if (flt.length > 0) {
            dsNxtDesc = flt[0].NxtStatusDesc;
          }
          this.isProg = false;
          if (
            (pCurrStsID !== pNxtStsID) &&
            (flt[0].NxtStatusEmail != null) &&
            pEmailEnabled
            ) {
              this.srSPXLst.addSendNxtStatusEmailDirector(
                this.srLoginInfo.loginUsrName, dsNxtDesc, pNxtStsID,
                flt[0].NxtActOnlyToUsr,
                pTSName, this._wkID, this.srUserInfo.loginInfo.loginId,
                flt[0].NxtStatusEmail,
                this.expGrdAsJson(pIsLeadData), null,
                pRmks
                );
          }
          this.srMsg.show(pTSName + ' - ' + dsNxtDesc + ' Successfully', 'Success',
          {status: 'success', destroyByClick: true, duration: 5000, hasIcon: true},
          );
          this.setStrtEndDt(this._wkID);
          this.loadUsrInfo();
        }
      }
    }, err => {
      this.srMsg.show('Error adding PAAF, Please contact support' + err, 'Error',
        {status: 'danger', destroyByClick: true, duration: 8000, hasIcon: false},
        );
    });
  }

  isStsUptCnt = 0;
  uptChangeSts(pTSName, pNxtStsID, pUsrNameId, pCurrStsID,
    pEmailEnabled: boolean, pRmks, pCallOff, pTSPrj) {
    this.isProg = true;
    const dtNow = this.srGlbVar.dateAheadFix(new Date());
    const rw = {
      CallOffNo: pCallOff,
      TSPrj: pTSPrj,
      SubmitDt: dtNow,
      Comments: pRmks,
      LkStatusCodeId: pNxtStsID,
      LkWkNameId: this._wkID,
      LkTsUsrNameId: pUsrNameId,
      LkActionByUsrNameId: this.srLoginInfo.loginId,
      LkActionByRoleNameId: this._pgRolID,
    };
    const flt = this.dtBtnActionLead.filter(a => a.LkNxtStatusCodeId == pNxtStsID);


    this.srSPXLst.AddTSSts(this.srLoginInfo.authCode, rw).subscribe(rs => {
      this.isStsUptCnt = this.isStsUptCnt + 1;
      //IF DIRECTOR SUBMIT BUTTON THEN CHECK FOR GRID WITHOUT FILTER DATA, IF LEAD THEN CHECK ONLY FOR THE LOADED GRID DATA
      let grdCnt = this.grdSource.localdata.length;

      if (this.isStsUptCnt >= grdCnt) {
        if (rs !== null) {
          let dsNxtDesc = '';
          if (flt.length > 0) {
            dsNxtDesc = flt[0].NxtStatusDesc;
          }
          this.isProg = false;
          if (
            (pCurrStsID !== pNxtStsID) &&
            (flt[0].NxtStatusEmail != null) &&
            pEmailEnabled
            ) {
                //#### TO MODIFY
                const dtSlctEmail = this.ddlFltApr.filter(el => el.AprEmailID == this.frmGrpDtl.controls.ddlAprUsrName.value)
                console.log('dtSlctEmail');
                console.log(dtSlctEmail);
                const dtSndEml =[];
                if(dtSlctEmail.length >0) {
                  let arAprID = dtSlctEmail[0].AprID.split('/');
                  let arAprEmail = dtSlctEmail[0].AprID.split('/');
                  for (let i = 0; i < arAprID.length; i++) {
                    let ch ={
                      Id: arAprID[i],
                      Email: arAprEmail[i]
                    }
                    let rw ={
                      LkUsrName: ch
                    }
                    dtSndEml.push(rw);
                  }
                  console.log('dtSndEml');
                  console.log(dtSndEml);
                   this.srSPXLst.addSendNxtStatusEmailLead(
                    this.srLoginInfo.loginUsrName, dsNxtDesc, pNxtStsID,
                    flt[0].NxtActOnlyToUsr,
                    pTSName, this._wkID, this.srUserInfo.loginInfo.loginId,
                    flt[0].NxtStatusEmail,
                    this.expGrdAsJson(true), null,
                    this.frmGrpDtl.controls.tsAppRmks.value
                    , dtSndEml
                    );
                }
          }
          this.getTSData(this._wkID);
          this.srMsg.show(pTSName + ' - ' + dsNxtDesc + ' Successfully', 'Success',
          {status: 'success', destroyByClick: true, duration: 5000, hasIcon: true},
          );
        }
      }
    }, err => {
      this.srMsg.show('Error adding PAAF, Please contact support' + err, 'Error',
        {status: 'danger', destroyByClick: true, duration: 8000, hasIcon: false},
        );
    });
  }

  expGrdAsJson(isLead) {
    let obj: any[] = [];
    if(isLead){
      const csvLead = this.grdSource.localdata;
      for (let i = 0; i < csvLead.length; i++) {
        const el = csvLead[i];
        const rw = {};
        for (let j = 0; j < this.grdCol.length; j++) {
          if ((this.grdCol[j]['exportable'] !== false) && (this.grdCol[j]['exportable'] === undefined)) {
            if ((el[this.grdCol[j]['datafield']] !== null) && (el[this.grdCol[j]['datafield']] !== undefined)) {
              rw[this.grdCol[j]['text']] = el[this.grdCol[j]['datafield']];
            } else {
              rw[this.grdCol[j]['text']] = '';
            }
          }
        }
        obj.push(rw);
      }
    } else{
      for (let i = 0; i < this.grdTSStsAll.length; i++) {
        const el = this.grdTSStsAll[i];
        const rw = {
          'Call Off NO': el.CallOffNumber,
          'Timesheet Project': el.TSProject,
          'PAAF NO': el.PAAFNo +'-'+el.Rev,
          'Employee ID': el.EmployeeID,
          'Name': el.Name,
          'PAAF Job Title': el.PAAFJobTitle,
          'Work Location' :el.ServicesLocation,
          'Total Man Days': Math.round(el.TotManDays * 10) /10
        };
        obj.push(rw);
      }
    }
    return obj;
  }

  grdEditSettings: any =
  {
    saveOnPageChange: true, saveOnBlur: true,
    saveOnSelectionChange: true, cancelOnEsc: true,
    saveOnEnter: true, editSingleCell: true, editOnDoubleClick: true, editOnF2: false
  };

  grdRendered = (): void =>  {

    const arrSts =  $('[grd-btn-status]');
    for (let i = 0; i < arrSts.length; i++) {
      const el = $(arrSts[i]);
      const elAct = el.attr('isaction');
      if (elAct === 'true') {
        el.attr('class', 'csBtnBlue');
      } else {
        const desc = el.attr('grd-btn-desc');
        if ((desc !== undefined) && (desc !== 'undefined'))
          el.html(el.attr('grd-btn-desc'));
        else
          el.html('');
      }

    }


  if ($('.csBtnBlue').length > 0) {
      const uglyEditButtons = jqwidgets.createInstance('.csBtnBlue', 'jqxButton', { width: 125, height: 18, value: 'Edit' });
      const flattenEditButtons = flatten(uglyEditButtons);
      function flatten(arr: any[]): any[] {
          if (arr.length) {
              return arr.reduce((flat: any[], toFlatten: any[]): any[] => {
                  return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
              }, []);
          }
      }
      if (flattenEditButtons) {
          for (let i = 0; i < flattenEditButtons.length; i++) {
            // event.target.getAttribute('data-desc')
            flattenEditButtons[i]._text.outerHTML = flattenEditButtons[i].field.getAttribute('grd-btn-desc');
            const btnId = flattenEditButtons[i].field.getAttribute('id');
            flattenEditButtons[i].addEventHandler('click', (event: any): void => {
                this.grdOnAction(event, btnId, flattenEditButtons[i]);
            });
          }
      }
    }
  }

  grdOnAction($event, btnId, obj) {
    const fltr = this.dtWk.filter(a => a.Id == this.frmGrp1.controls['tsName'].value);
    const rw = this.grdTS.getRow(this.rowKey);
    const wkID = this.frmGrp1.controls['tsName'].value;
    // const flt = this.dtDllDpt.filter(el => el.TSPrjs.some(s =>  s.Id == this.slctDept ));
    // let CallOf = '';
    // let TSPrj = '';
    // if (flt.length > 0) {
    //   const da = flt[0].TSPrjs.filter(s => s.Id == this.slctDept);
    //   CallOf = flt[0].CallOFF;
    //   TSPrj = da[0].TSPrj;
    // }
    this.srDialog.open(TsCostApprovalDialogComponent,
      {
        context: {
          inName: rw['Name'],
          inWkId: wkID,
          inUsrId: rw['LkUsrNameId'],
          inCallOff: rw['CallOffNO'],
          inTSPrj: rw['TSPrj'],
          inRowKey: this.rowKey,
          inLkStatusCodeId: rw['LkStatusCodeId'],
          inWkName: fltr[0].WkName,
          inSmryID: rw['DAYSID']
        },
        hasBackdrop: true, closeOnBackdropClick: false,
        closeOnEsc : false,
    })
    .onClose.subscribe(rs => {
      // this.grdTS.updateRow(rs.rowKey,{Name: "Done" });
      if (rs.isSucess !== null) {
        if (rs.isSucess == true) {
          this.grdTS.setCellValue(rs.rowKey, 'IsAction', false);
          this.grdTS.setCellValue(rs.rowKey, 'TSStsDesc', rs.stsNxtDesc);
          this.srMsg.show(rs.stsNxtDesc + ' Successfully!!!!', 'Success',
                {status: 'success', destroyByClick: true, duration: 5000, hasIcon: true},
                );
        } else {
          this.srMsg.show(rs.stsNxtDesc + ' Successfully!!!!', 'Success',
          {status: 'warning', destroyByClick: true, duration: 5000, hasIcon: true},
          );
        }

      } else {
        if(rs.isCancel == true){
          //NO ACTION
        }else {
          this.srMsg.show('Error on updating ' + rw['Name'] + ', please contact support team', 'Warning',
          {status: 'warning', destroyByClick: true, duration: 8000, hasIcon: false},
          );
        }

      }
    });
  }

  rowKey: number = -1;
  grdRowClick(event: any): void {
      this.rowKey = event.args.key;
  }

  grdBindingComplete(event: any): void
  {
    //##DISABLING THE LOCK ROW AS OF NOW
    // if(this.grdData && this.grdTS){
    //   for (let i = 0; i < this.grdData.length; i++) {
    //     const rw = this.grdData[i];
    //     if(rw.IsAction){
    //       if(rw.IsAction != true){
    //         //this.grdEditEnable(true)
    //         this.grdTS.lockRow(i);
    //       }
    //     } else{
    //       this.grdTS.lockRow(i);
    //     }
    //   }
    // }
  }

  grdVEditCellOldVal :any;
  grdVEditRowId :number;
  grdOnCellBeginEdit(event: any): void {
    let args = event.args;
    // row key
    let rowKey = args.key;
    // row's data.
    let rowData = args.row;
    // column's data field.
    let columnDataField = args.dataField;
    // column's display field.
    let columnDisplayField = args.displayField;
    // cell's value.
    let value = args.value;
    this.grdVEditCellOldVal=value;
    this.grdVEditRowId = rowKey;
  }

  grdOnCellEndEdit(event: any): void {
      let args = event.args;
      let rowData = args.row;
      let colDtFld = args.dataField;
      let value = args.value;

      if(rowData['DAYSID'] !== 0){
        let id = rowData['DAYSID']
        const rw ={}
        rw[colDtFld]= value
        this.srSPXLst.UptWkTSDays(this.srLoginInfo.authCode,rw,id).subscribe(rs =>{
          console.log(rs)
        },err =>{
          this.grdTS.setCellValue(this.grdVEditRowId.toString(),colDtFld,this.grdVEditCellOldVal);
          this.srMsg.show('Error :' +err, 'Warning',
          {status: 'warning', destroyByClick: true, duration: 8000, hasIcon: false},
          );
        })
      }
      if(rowData['HRSID'] !== 0){
        let id = rowData['HRSID']
        const rw ={}
        if(colDtFld =='CBSCode'){
          rw['LkCBSCodeId']=this.ddlSrcCbs.localdata.filter(el => el.TASK_CODE == value)[0].ID
          rw['Title']= value
        } else{
          rw[colDtFld]= value
        }
        this.srSPXLst.UptTS(this.srLoginInfo.authCode,rw,id).subscribe(rs =>{
          console.log(rs)
        },err =>{
          this.grdTS.setCellValue(this.grdVEditRowId.toString(),colDtFld,this.grdVEditCellOldVal);
          this.srMsg.show('Error :' +err, 'Warning',
          {status: 'warning', destroyByClick: true, duration: 8000, hasIcon: false},
          );
        })
      }
  }

  getTSData(pRptID) {
    this.isProg = true;
    this.srSPXLst.getTSCostCtrl(pRptID, null, null, this._pgRolID).subscribe(rs => {
      const dtPAFRw = rs[0].d.results;
      const dtTS = rs[1].d.results;
      const dtWkTSDays = rs[2].d.results;
      const dtFile = rs[3].d.results;
      const dtRolSts = rs[4].d.results;
      const dtActGrpType = rs[5].d.results;
      const dtWKSts = rs[6].d.results;
      this.dtApproveDtl = rs[7].d.results;
      const dtRnR = rs[8].d.results;
      this.dtAprSNCLd = this.getApproverDt(this.srGlbVar.rolSNCDisLD,false);
     //this.dtAprSNCMgr = this.getApproverDt(this.srGlbVar.rolSNCMGR,false);
      this.dtAprClntLd = this.getApproverDt(this.srGlbVar.rolGCDisLD,false);
      //this.dtAprClntMgr = this.getApproverDt(this.srGlbVar.rolGCMGR,false);

      // console.log(dtPAFRw)
      // console.log(dtTS)
      // console.log(dtWkTSDays)
      console.log(dtWKSts);
      //REMOVE R&R EMPLOYEE FROM TIMESHEET SUBMISSION
      //GET THE JSON IS ARRAY STRING
      let vFltRnRID =''
      for (let i = 0; i < dtRnR.length; i++) {
        const el = dtRnR[i].LkEmployeeIDId;
        vFltRnRID = vFltRnRID +'|'+ el +'|';
      }
      //FILTER NOT IN THE STRING
      const dtPAF = dtPAFRw.filter(d => {
        const v = '|' + d.ID +'|';
        return !vFltRnRID.includes(v)
      })
      const dtGrdData = [];
      let roPCnt: number = 0;
      let rwID: number= 0;
      dtPAF.forEach(el => {
        rwID = rwID + 1;
        const fltFile = dtFile.filter(elF => elF.LkUsrNameId == el.LkUsrNameId);
        let flUrl;
        let flName;
        if (fltFile !== undefined) {
          if (fltFile.length > 0) {
            if (fltFile[0].Attachments == true) {
              flUrl = this.env.spxHref + this.env.spxHrefAtchPath + fltFile[0].ID + '/' + fltFile[0].FL_NME;
              flName = fltFile[0].FL_NME;
            }
          }
        }
        const fltChild = dtTS.filter(dt => dt.LkUsrNameId == el.LkUsrNameId);
        const dtChild: any[] = [];
        let roCCnt: number = 0;
        // if(vIsVisible){
          fltChild.forEach(elcld => {

            roCCnt = roCCnt + 1;
            const rw = {
              ID: rwID,
              PAFID: el.ID,
              DAYSID:0,
              SLNO: roCCnt,
              Name: null,
              PAAFJobTitle: null,
              OrgChartPositionTitle: null,
              OrgChartIDNo: null,
              ServicesLocation: null,
              PAAFNo: null,
              CBSCode: elcld['LkCBSCode'].TASK_CODE
              //LkCBSCode: elcld['LkCBSCode'].TASK_CODE
              // CBSCode: fltCBS[0].TASK_CODE //+ '-' + fltCBS[0].TASK_DESC
            };
            for (const key in elcld) {
                if (elcld.hasOwnProperty(key)) {
                    rw[key] = elcld[key];
                }
                if (String(key) == 'ID') {
                  rw['HRSID'] = elcld[key];
                }
            }
            dtChild.push(rw);
          });
        // }
        roPCnt = roPCnt + 1;
        const grRw = {
          ID: rwID,
          PAFID: el.ID,
          HRSID: 0,
          SLNO: roPCnt,
          Name: el.Name,
          PAAFJobTitle: el.PAAFJobTitle,
          OrgChartPositionTitle: el.OrgChartPositionTitle,
          OrgChartIDNo: el.OrgChartIDNo,
          ServicesLocation: el.ServicesLocation,
          PAAFNo: el.PAAFNo + '-' + el.Rev,
          children: dtChild,
          atchUrl: flUrl,
          atchFileName: flName,
          LkUsrNameId: el.LkUsrNameId,
          CallOffNO: el.CallOffNumber,
          TSPrj: el.TSProject
          // IsAction:vIsAction,
          // TSStsDesc:vStsDesc,
          // IsVisible:vIsVisible
        };
        let fltSts = dtWKSts.filter(eSts => eSts.LkTsUsrNameId == grRw.LkUsrNameId && eSts['LkActionByRoleName'].RoleName == this.srGlbVar.rolSNCDisLD)
        if(fltSts.length >0){
          grRw['snc_ld_name'] = fltSts[fltSts.length-1]['LkActionByUsrName'].FullName
          grRw['snc_ld_sts'] = fltSts[fltSts.length-1]['LkStatusCode'].StatusName
          grRw['snc_ld_css']= fltSts[fltSts.length-1]['LkStatusCode'].Css
          const dtName = this.dtAprSNCLd.filter(e => e.LkUsrNameId == grRw.LkUsrNameId);
          if(dtName.length >0){
            grRw['snc_ld_apr_email'] = dtName[0].AprEmailID;
          }
        } else{
          const dtName = this.dtAprSNCLd.filter(e => e.LkUsrNameId == grRw.LkUsrNameId);
          if(dtName.length >0){
            grRw['snc_ld_name'] = dtName[0].AprName;
            grRw['snc_ld_apr_email'] = dtName[0].AprEmailID;
          }
          grRw['snc_ld_sts'] = null;
          grRw['snc_ld_css'] = null;
        }
        fltSts = dtWKSts.filter(eSts => eSts.LkTsUsrNameId == grRw.LkUsrNameId && eSts['LkActionByRoleName'].RoleName == this.srGlbVar.rolSNCMGR)
        if(fltSts.length >0){
          grRw['snc_mgr_name'] = fltSts[fltSts.length-1]['LkActionByUsrName'].FullName
          grRw['snc_mgr_sts'] = fltSts[fltSts.length-1]['LkStatusCode'].StatusName
          grRw['snc_mgr_css']= fltSts[fltSts.length-1]['LkStatusCode'].Css
          const dtName = this.dtAprSNCMgr.filter(e => e.LkUsrNameId == grRw.LkUsrNameId)
          if(dtName.length >0){
            grRw['snc_mgr_name'] = dtName[0].AprName;
          }
        } else{
          const dtName = this.dtAprSNCMgr.filter(e => e.LkUsrNameId == grRw.LkUsrNameId)
          if(dtName.length >0){
            grRw['snc_mgr_name'] = dtName[0].AprName;
            grRw['snc_mgr_apr_email'] = dtName[0].AprEmailID;
          }
          grRw['snc_mgr_sts'] = null;
          grRw['snc_mgr_css'] = null;
        }
        fltSts = dtWKSts.filter(eSts => eSts.LkTsUsrNameId == grRw.LkUsrNameId && eSts['LkActionByRoleName'].RoleName == this.srGlbVar.rolGCDisLD)
        if(fltSts.length >0){
          grRw['clnt_ld_name'] = fltSts[fltSts.length-1]['LkActionByUsrName'].FullName
          grRw['clnt_ld_sts'] = fltSts[fltSts.length-1]['LkStatusCode'].StatusName
          grRw['clnt_ld_css']= fltSts[fltSts.length-1]['LkStatusCode'].Css
          const dtName = this.dtAprClntLd.filter(e => e.LkUsrNameId == grRw.LkUsrNameId)
          if(dtName.length >0){
            grRw['clnt_ld_apr_email'] = dtName[0].AprEmailID;
          }
        } else{
          const dtName = this.dtAprClntLd.filter(e => e.LkUsrNameId == grRw.LkUsrNameId)
          if(dtName.length >0){
            grRw['clnt_ld_name'] = dtName[0].AprName;
            grRw['clnt_ld_apr_email'] = dtName[0].AprEmailID;
          }
          grRw['clnt_ld_sts'] = null
          grRw['clnt_ld_css'] = null;
        }
        fltSts = dtWKSts.filter(eSts => eSts.LkTsUsrNameId == grRw.LkUsrNameId && eSts['LkActionByRoleName'].RoleName == this.srGlbVar.rolGCMGR)
        if(fltSts.length >0){
          grRw['clnt_mgr_name'] = fltSts[fltSts.length-1]['LkActionByUsrName'].FullName
          grRw['clnt_mgr_sts'] = fltSts[fltSts.length-1]['LkStatusCode'].StatusName
          grRw['clnt_mgr_css']= fltSts[fltSts.length-1]['LkStatusCode'].Css
          const dtName = this.dtAprClntMgr.filter(e => e.LkUsrNameId == grRw.LkUsrNameId)
          if(dtName.length >0){
            grRw['clnt_mgr_apr_email'] = dtName[0].AprEmailID;
          }
        } else{
          const dtName = this.dtAprClntMgr.filter(e => e.LkUsrNameId == grRw.LkUsrNameId)
          if(dtName.length >0){
            grRw['clnt_mgr_name'] = dtName[0].AprName;
            grRw['clnt_mgr_apr_email'] = dtName[0].AprEmailID;
          }
          grRw['clnt_mgr_sts'] = null
          grRw['clnt_mgr_css'] = null;
        }
        fltSts = dtWKSts.filter(eSts => eSts.LkTsUsrNameId == grRw.LkUsrNameId && eSts['LkActionByRoleName'].RoleName == this.srGlbVar.rolGCDrct)
        if(fltSts.length >0){
          grRw['clnt_drct_name'] = fltSts[fltSts.length-1]['LkActionByUsrName'].FullName
          grRw['clnt_drct_sts'] = fltSts[fltSts.length-1]['LkStatusCode'].StatusName
          grRw['clnt_drct_css']= fltSts[fltSts.length-1]['LkStatusCode'].Css
          const dtName = this.dtAprClntMgr.filter(e => e.LkUsrNameId == grRw.LkUsrNameId)
          if(dtName.length >0){
            grRw['clnt_drct_apr_email'] = dtName[0].AprEmailID;
          }
        } else{
          const dtName = this.dtAprClntMgr.filter(e => e.LkUsrNameId == grRw.LkUsrNameId)
          if(dtName.length >0){
            grRw['clnt_drct_name'] = dtName[0].AprName;
            grRw['clnt_drct_apr_email'] = dtName[0].AprEmailID;
          }
          grRw['clnt_drct_sts'] = null
          grRw['clnt_drct_css'] = null;
        }
        const fltTsDays = dtWkTSDays.filter(dt => dt.LkUsrNameId == el.LkUsrNameId);
        fltTsDays.forEach(elDays => {
          for (const key in elDays) {
              if (elDays.hasOwnProperty(key)) {
                if (key.includes('WDay')) {
                  grRw[key] = elDays[key];
                }
                if (String(key) == 'ID') {
                  grRw['DAYSID'] = elDays[key];
                }
                if (key.includes('TotManDays')) {
                  grRw[key] = elDays[key];
                }
              }
          }
        });
        if (fltTsDays.length > 0) {
           let vTSStsId: number = 0;
          let vIsAction: boolean = false;
          let vStsDesc: string = '';
          let vIsVisible: boolean = false;
          vTSStsId = fltTsDays[0]['LkStatusCodeId'];
          //CHECK IF ANY ACTION AVAILABLE FOR THE STATUS
          const fltStsDtl = dtRolSts.filter(elf => elf.LkStatusCodeId == vTSStsId);
          if (fltStsDtl.length > 0) {
            vIsAction = fltStsDtl[0].IsAction;
            vStsDesc = fltStsDtl[0].Title;
            vIsVisible = true;
            //IF ACTION AVAILABLE THEN CHECK IF THE ACTION IS FOR INDIVIDUAL USER
            let fltGrp = dtActGrpType.filter(el => el.LkStatusCodeId == vTSStsId && el.ActionGrpType == this.srGlbVar.nxtActionGrpUser)
            if(fltGrp.length >0){
              grRw['ActionGrpUser']= true
            } else{
              grRw['ActionGrpUser']= false
            }
            fltGrp = dtActGrpType.filter(el => el.LkStatusCodeId == vTSStsId && el.ActionGrpType == this.srGlbVar.nxtActionGrpLead)
            if(fltGrp.length >0){
              grRw['ActionGrpDisc']= true
            } else{
              grRw['ActionGrpDisc']= false
            }
          }
          grRw['LkStatusCodeId'] = vTSStsId;
          grRw['IsAction'] = vIsAction;
          grRw['TSStsDesc'] = vStsDesc;
          grRw['IsVisible'] = vIsVisible;
        }
        dtGrdData.push(grRw);
      });
      this.isProg = false;
      this.grdData = dtGrdData;
      this.grdSource.localdata = this.grdData;
      if(this.grdTS){
        this.grdTS.updateBoundData();
      }
      this.actionBtnEnableLead();
    });
  }

  onDllSelectColHide($event) {
    const str = JSON.parse(JSON.stringify($event));
    let rs = str.find(el => el == 'PAAFJobTitle');
    this.fnGrdSHCol(rs, 'PAAFJobTitle');

    rs = str.find(el => el == 'OrgChartPositionTitle');
    this.fnGrdSHCol(rs, 'OrgChartPositionTitle');

    rs = str.find(el => el == 'OrgChartIDNo');
    this.fnGrdSHCol(rs, 'OrgChartIDNo');

    rs = str.find(el => el == 'ServicesLocation');
    this.fnGrdSHCol(rs, 'ServicesLocation');

    // rs = str.find(el => el == 'PAAFNo')
    // this.fnGrdSHCol(rs,'PAAFNo')

    // rs = str.find(el => el == 'atchUrl')
    // this.fnGrdSHCol(rs,'atchUrl')
  }

  fnGrdSHCol(rs, cName) {
    if (rs !== undefined)
      this.grdTS.showColumn(rs);
    else
      this.grdTS.hideColumn(cName);
  }

  ddlFltApr =[];
  onDllSelectAprType($event) {
    const strRole = JSON.parse(JSON.stringify($event));
    this.frmGrpDtl.controls.ddlAprUsrName.setValue(null);
    this.ddlFltApr =[];
    this.ddlFltApr =this.getApproverDt(strRole,true);
    //this.onDllSelectAprName(null);
  }

  getDate(){
    var d = new Date,
    dformat = [d.getMonth()+1,   d.getDate(),  d.getFullYear()].join('/')+' '+ [d.getHours(), d.getMinutes(),  d.getSeconds()].join(':');
    return dformat
  }

  onDllSelectAprName($event) {
    const str = JSON.parse(JSON.stringify($event));
    this.grdSource.localdata = null;
    if(str == null){
      this.grdSource.localdata = this.grdData;
    } else{
      if(this.frmGrpDtl.controls.ddlAprType.value ==this._rolSNCLead){
        //console.log('Filter Start:' + this.getDate())
        const dt = this.grdData.filter(el => el.snc_ld_apr_email == str)
        this.grdSource.localdata = dt;
        //console.log('Filter End:' + Date.now().toString())
      }
      if(this.frmGrpDtl.controls.ddlAprType.value ==this._rolClntLead){
        //console.log('Filter Start:' + this.getDate())
        const dt = this.grdData.filter(el => el.clnt_ld_apr_email == str)
        this.grdSource.localdata = dt;
       //console.log('Filter End :' + this.getDate())
      }
    }
    //console.log('Bind Start :' + this.getDate())
    this.grdTS.updateBoundData();
   // this.grdDiv.nativeElement
    this.actionBtnEnableLead();
    //console.log('Bind End:' + this.getDate())

  }

  dtAprSNCLd :any[]=[];
  dtAprSNCMgr :any[]=[];
  dtAprClntLd :any[]=[];
  dtAprClntMgr :any[]=[];
  getApproverDt(rolCode, isDllFlt){
    const objData :any[]=[];
    const dtReturn :any[]=[];
    const rsData = this.dtApproveDtl.filter(el => el.LkRoleName.RoleName == rolCode)
    //return rsData;
    if(rsData.length >0){
      let arTsUsr =[];
      const map = new Map();
      for (let i = 0; i < rsData.length; i++) {
        const el = rsData[i];
        if (!map.has(el.LkUsrName.ID)) {
          map.set(el.LkUsrName.ID, true);
          arTsUsr.push(el.LkUsrName.ID);
        }
      }
      for (let i = 0; i < arTsUsr.length; i++) {
        const elID = arTsUsr[i];
        let rw ={
         'LkUsrNameId': elID
        }
        let aprName ='';
        let aprEmail ='';
        let aprID='';
        let obj = rsData.filter(r => r.LkUsrName.ID == elID).sort((a, b) => (a.LkAppUsrName.ID > b.LkAppUsrName.ID ? 1 : -1));
        for (let j = 0; j < obj.length; j++) {
          const elApp = obj[j];
          aprName = elApp.LkAppUsrName.FullName + '/'+ aprName
          aprEmail = elApp.LkAppUsrName.UsrName +'/'+ aprEmail
          aprID = elApp.LkAppUsrName.ID +'/'+ aprID
        }
        rw['AprName']= aprName.substring(0,aprName.length -1)
        rw['AprEmailID']= aprEmail.substring(0,aprEmail.length -1)
        rw['AprID']= aprID.substring(0,aprID.length -1)
        objData.push(rw)
      }
      if(isDllFlt == true){
        const map1 = new Map();
        for (let i = 0; i < objData.length; i++) {
          const el = objData[i];
          if (!map1.has(el.AprEmailID)) {
            map1.set(el.AprEmailID, true);
            dtReturn.push({AprEmailID: el.AprEmailID, AprName: el.AprName, AprID: el.AprID  });
          }
        }
        return dtReturn;
      } else{
        return objData;
      }
    } else{
      return objData;
    }


  }

  onSubmitTSLead(pNxtStsID) {
    const tsName = this.frmGrp1.get('tsName').value;
    const fltr = this.dtWk.filter(a => a.Id == tsName);
    const fltAct = this.dtBtnActionLead.filter(a => a.LkNxtStatusCodeId == pNxtStsID);
    if (fltr) {
      this.srDialog.open(ConfirmdialogComponent,
        {
          context: {
            IsConfirm: true,
            title: 'Confirm',
            message: 'Are you sure, you want to ' + fltAct[0].CurrStatusDesc + ' ( ' + fltr[0].WkName + ' ) ?',
          },
        })
        .onClose.subscribe(result => {
          if (result == true) {
            this.isProg = true;
            let vLkStsCodeID :number;
            let vCallOff :string;
            let vTSPrj :string;
            const dtNow = this.srGlbVar.dateAheadFix(new Date());
            let observables: Observable<any>[] =<any>[];
            for (let i = 0; i < this.grdSource.localdata.length; i++) {
              const el = this.grdSource.localdata[i];
              const rwSumSts ={
                LkStatusCodeId: pNxtStsID,
                LkWkNameId: this._wkID,
                LkUsrNameId: el.LkUsrNameId,
                LkActRolNameId: this._pgRolID,
                LogSts: 0
              }
              vLkStsCodeID=el.LkStatusCodeId;
              vCallOff=el.CallOffNO;
              vTSPrj=el.TSPrj;
              observables.push(this.srSPXLst.UptWkTSDays(this.srLoginInfo.authCode,rwSumSts,el.DAYSID));

              // this.fnUpdSummary(rwSumSts,el.DAYSID)
              // this.uptChangeSts(fltr[0].WkName, pNxtStsID, el.LkUsrNameId, el.LkStatusCodeId,
              //   this.frmGrpDtl.controls.ctEmailEnable.value,this.frmGrpDtl.controls.tsAppRmks.value
              //   ,el.CallOffNO, el.TSPrj);
            }
            forkJoin(observables).subscribe(rsArr => {
              console.log('Request Array Done');
              this.fnSendEmailLead(fltr[0].WkName, pNxtStsID, vLkStsCodeID,
                this.frmGrpDtl.controls.ctEmailEnable.value,this.frmGrpDtl.controls.tsAppRmks.value)
              this.isProg = false;
            });
          }
        });
    }
  }

  fnSendEmailLead(pTSName, pNxtStsID, pCurrStsID,
    pEmailEnabled: boolean, pRmks){
      const flt = this.dtBtnActionLead.filter(a => a.LkNxtStatusCodeId == pNxtStsID);
      let dsNxtDesc = '';
      if (flt.length > 0) {
        dsNxtDesc = flt[0].NxtStatusDesc;
      }
      if (
        (pCurrStsID !== pNxtStsID) &&
        (flt[0].NxtStatusEmail != null) &&
        pEmailEnabled
        ) {
            //#### TO MODIFY
            const dtSlctEmail = this.ddlFltApr.filter(el => el.AprEmailID == this.frmGrpDtl.controls.ddlAprUsrName.value);
            const dtSndEml =[];
            if(dtSlctEmail.length >0) {
              let arAprID = dtSlctEmail[0].AprID.split('/');
              let arAprEmail = dtSlctEmail[0].AprID.split('/');
              for (let i = 0; i < arAprID.length; i++) {
                let ch ={
                  Id: arAprID[i],
                  Email: arAprEmail[i]
                }
                let rw ={
                  LkUsrName: ch
                }
                dtSndEml.push(rw);
              }
               this.srSPXLst.addSendNxtStatusEmailLead(
                this.srLoginInfo.loginUsrName, dsNxtDesc, pNxtStsID,
                flt[0].NxtActOnlyToUsr,
                pTSName, this._wkID, this.srUserInfo.loginInfo.loginId,
                flt[0].NxtStatusEmail,
                this.expGrdAsJson(true), null,
                pRmks
                , dtSndEml
                );
            }
          }
      this.getTSData(this._wkID);
      this.srMsg.show(pTSName + ' - ' + dsNxtDesc + ' Successfully', 'Success',
      {status: 'success', destroyByClick: true, duration: 5000, hasIcon: true},
      );
      this.isProg = false;
  }

  grdExportXL(): void {
    console.log('exl')
    //this.grdTS.exportData('xls');
    this.srXl.FlatXL("Sample","Weekly Report",this.grdSource.localdata,null);
  };

  // dtChild: any[] = []
  // getTSData1(pRptID) {
  //   this.isProg = true;
  //   console.log('Req Start :' + this.getDate())
  //   this.srSPXLst.getTSCostCtrl(pRptID, null, null, this._pgRolID).subscribe(rs => {
  //     const dtPAF = rs[0].d.results;
  //     const dtTS = rs[1].d.results;
  //     const dtWkTSDays = rs[2].d.results;
  //     const dtFile = rs[3].d.results;
  //     const dtRolSts = rs[4].d.results;
  //     const dtActGrpType = rs[5].d.results;
  //     const dtWKSts = rs[6].d.results;
  //     this.dtApproveDtl = rs[7].d.results;
  //     this.dtAprSNCLd = this.getApproverDt(this.srGlbVar.rolSNCDisLD,false);
  //    //this.dtAprSNCMgr = this.getApproverDt(this.srGlbVar.rolSNCMGR,false);
  //     this.dtAprClntLd = this.getApproverDt(this.srGlbVar.rolGCDisLD,false);
  //     //this.dtAprClntMgr = this.getApproverDt(this.srGlbVar.rolGCMGR,false);
  //     console.log('Req End :' + this.getDate())
  //     const dtGrdData = [];
  //     let roPCnt: number = 0;
  //     let rwID: number= 0;
  //     dtPAF.forEach(el => {
  //       rwID = rwID + 1;
  //       const fltFile = dtFile.filter(elF => elF.LkUsrNameId == el.LkUsrNameId);
  //       let flUrl;
  //       let flName;
  //       if (fltFile !== undefined) {
  //         if (fltFile.length > 0) {
  //           if (fltFile[0].Attachments == true) {
  //             flUrl = this.env.spxHref + this.env.spxHrefAtchPath + fltFile[0].ID + '/' + fltFile[0].FL_NME;
  //             flName = fltFile[0].FL_NME;
  //           }
  //         }
  //       }
  //       const fltChild = dtTS.filter(dt => dt.LkUsrNameId == el.LkUsrNameId);
  //       const dtChild: any[] = [];
  //       let roCCnt: number = 0;
  //       // if(vIsVisible){
  //         fltChild.forEach(elcld => {

  //           roCCnt = roCCnt + 1;
  //           const rw = {
  //             ID: rwID,
  //             PAFID: el.ID,
  //             DAYSID:0,
  //             SLNO: roCCnt,
  //             Name: null,
  //             PAAFJobTitle: null,
  //             OrgChartPositionTitle: null,
  //             OrgChartIDNo: null,
  //             ServicesLocation: null,
  //             PAAFNo: null,
  //             CBSCode: elcld['LkCBSCode'].TASK_CODE
  //             //LkCBSCode: elcld['LkCBSCode'].TASK_CODE
  //             // CBSCode: fltCBS[0].TASK_CODE //+ '-' + fltCBS[0].TASK_DESC
  //           };
  //           for (const key in elcld) {
  //               if (elcld.hasOwnProperty(key)) {
  //                   rw[key] = elcld[key];
  //               }
  //               if (String(key) == 'ID') {
  //                 rw['HRSID'] = elcld[key];
  //               }
  //           }
  //           this.dtChild.push(rw);
  //         });
  //       // }
  //       roPCnt = roPCnt + 1;
  //       const grRw = {
  //         ID: rwID,
  //         PAFID: el.ID,
  //         HRSID: 0,
  //         SLNO: roPCnt,
  //         Name: el.Name,
  //         PAAFJobTitle: el.PAAFJobTitle,
  //         OrgChartPositionTitle: el.OrgChartPositionTitle,
  //         OrgChartIDNo: el.OrgChartIDNo,
  //         ServicesLocation: el.ServicesLocation,
  //         PAAFNo: el.PAAFNo + '-' + el.Rev,
  //         children: dtChild,
  //         atchUrl: flUrl,
  //         atchFileName: flName,
  //         LkUsrNameId: el.LkUsrNameId,
  //         CallOffNO: el.CallOffNumber,
  //         TSPrj: el.TSProject
  //         // IsAction:vIsAction,
  //         // TSStsDesc:vStsDesc,
  //         // IsVisible:vIsVisible
  //       };
  //       let fltSts = dtWKSts.filter(eSts => eSts.LkTsUsrNameId == grRw.LkUsrNameId && eSts['LkActionByRoleName'].RoleName == this.srGlbVar.rolSNCDisLD)
  //       if(fltSts.length >0){
  //         grRw['snc_ld_name'] = fltSts[fltSts.length-1]['LkActionByUsrName'].FullName
  //         grRw['snc_ld_sts'] = fltSts[fltSts.length-1]['LkStatusCode'].StatusName
  //         grRw['snc_ld_css']= fltSts[fltSts.length-1]['LkStatusCode'].Css
  //         const dtName = this.dtAprSNCLd.filter(e => e.LkUsrNameId == grRw.LkUsrNameId);
  //         if(dtName.length >0){
  //           grRw['snc_ld_apr_email'] = dtName[0].AprEmailID;
  //         }
  //       } else{
  //         const dtName = this.dtAprSNCLd.filter(e => e.LkUsrNameId == grRw.LkUsrNameId);
  //         if(dtName.length >0){
  //           grRw['snc_ld_name'] = dtName[0].AprName;
  //           grRw['snc_ld_apr_email'] = dtName[0].AprEmailID;
  //         }
  //         grRw['snc_ld_sts'] = null;
  //         grRw['snc_ld_css'] = null;
  //       }
  //       fltSts = dtWKSts.filter(eSts => eSts.LkTsUsrNameId == grRw.LkUsrNameId && eSts['LkActionByRoleName'].RoleName == this.srGlbVar.rolSNCMGR)
  //       if(fltSts.length >0){
  //         grRw['snc_mgr_name'] = fltSts[fltSts.length-1]['LkActionByUsrName'].FullName
  //         grRw['snc_mgr_sts'] = fltSts[fltSts.length-1]['LkStatusCode'].StatusName
  //         grRw['snc_mgr_css']= fltSts[fltSts.length-1]['LkStatusCode'].Css
  //         const dtName = this.dtAprSNCMgr.filter(e => e.LkUsrNameId == grRw.LkUsrNameId)
  //         if(dtName.length >0){
  //           grRw['snc_mgr_name'] = dtName[0].AprName;
  //         }
  //       } else{
  //         const dtName = this.dtAprSNCMgr.filter(e => e.LkUsrNameId == grRw.LkUsrNameId)
  //         if(dtName.length >0){
  //           grRw['snc_mgr_name'] = dtName[0].AprName;
  //           grRw['snc_mgr_apr_email'] = dtName[0].AprEmailID;
  //         }
  //         grRw['snc_mgr_sts'] = null;
  //         grRw['snc_mgr_css'] = null;
  //       }
  //       fltSts = dtWKSts.filter(eSts => eSts.LkTsUsrNameId == grRw.LkUsrNameId && eSts['LkActionByRoleName'].RoleName == this.srGlbVar.rolGCDisLD)
  //       if(fltSts.length >0){
  //         grRw['clnt_ld_name'] = fltSts[fltSts.length-1]['LkActionByUsrName'].FullName
  //         grRw['clnt_ld_sts'] = fltSts[fltSts.length-1]['LkStatusCode'].StatusName
  //         grRw['clnt_ld_css']= fltSts[fltSts.length-1]['LkStatusCode'].Css
  //         const dtName = this.dtAprClntLd.filter(e => e.LkUsrNameId == grRw.LkUsrNameId)
  //         if(dtName.length >0){
  //           grRw['clnt_ld_apr_email'] = dtName[0].AprEmailID;
  //         }
  //       } else{
  //         const dtName = this.dtAprClntLd.filter(e => e.LkUsrNameId == grRw.LkUsrNameId)
  //         if(dtName.length >0){
  //           grRw['clnt_ld_name'] = dtName[0].AprName;
  //           grRw['clnt_ld_apr_email'] = dtName[0].AprEmailID;
  //         }
  //         grRw['clnt_ld_sts'] = null
  //         grRw['clnt_ld_css'] = null;
  //       }
  //       fltSts = dtWKSts.filter(eSts => eSts.LkTsUsrNameId == grRw.LkUsrNameId && eSts['LkActionByRoleName'].RoleName == this.srGlbVar.rolGCMGR)
  //       if(fltSts.length >0){
  //         grRw['clnt_mgr_name'] = fltSts[fltSts.length-1]['LkActionByUsrName'].FullName
  //         grRw['clnt_mgr_sts'] = fltSts[fltSts.length-1]['LkStatusCode'].StatusName
  //         grRw['clnt_mgr_css']= fltSts[fltSts.length-1]['LkStatusCode'].Css
  //         const dtName = this.dtAprClntMgr.filter(e => e.LkUsrNameId == grRw.LkUsrNameId)
  //         if(dtName.length >0){
  //           grRw['clnt_mgr_apr_email'] = dtName[0].AprEmailID;
  //         }
  //       } else{
  //         const dtName = this.dtAprClntMgr.filter(e => e.LkUsrNameId == grRw.LkUsrNameId)
  //         if(dtName.length >0){
  //           grRw['clnt_mgr_name'] = dtName[0].AprName;
  //           grRw['clnt_mgr_apr_email'] = dtName[0].AprEmailID;
  //         }
  //         grRw['clnt_mgr_sts'] = null
  //         grRw['clnt_mgr_css'] = null;
  //       }
  //       fltSts = dtWKSts.filter(eSts => eSts.LkTsUsrNameId == grRw.LkUsrNameId && eSts['LkActionByRoleName'].RoleName == this.srGlbVar.rolGCDrct)
  //       if(fltSts.length >0){
  //         grRw['clnt_drct_name'] = fltSts[fltSts.length-1]['LkActionByUsrName'].FullName
  //         grRw['clnt_drct_sts'] = fltSts[fltSts.length-1]['LkStatusCode'].StatusName
  //         grRw['clnt_drct_css']= fltSts[fltSts.length-1]['LkStatusCode'].Css
  //         const dtName = this.dtAprClntMgr.filter(e => e.LkUsrNameId == grRw.LkUsrNameId)
  //         if(dtName.length >0){
  //           grRw['clnt_drct_apr_email'] = dtName[0].AprEmailID;
  //         }
  //       } else{
  //         const dtName = this.dtAprClntMgr.filter(e => e.LkUsrNameId == grRw.LkUsrNameId)
  //         if(dtName.length >0){
  //           grRw['clnt_drct_name'] = dtName[0].AprName;
  //           grRw['clnt_drct_apr_email'] = dtName[0].AprEmailID;
  //         }
  //         grRw['clnt_drct_sts'] = null
  //         grRw['clnt_drct_css'] = null;
  //       }
  //       const fltTsDays = dtWkTSDays.filter(dt => dt.LkUsrNameId == el.LkUsrNameId);
  //       fltTsDays.forEach(elDays => {
  //         for (const key in elDays) {
  //             if (elDays.hasOwnProperty(key)) {
  //               if (key.includes('WDay')) {
  //                 grRw[key] = elDays[key];
  //               }
  //               if (String(key) == 'ID') {
  //                 grRw['DAYSID'] = elDays[key];
  //               }
  //               if (key.includes('TotManDays')) {
  //                 grRw[key] = elDays[key];
  //               }
  //             }
  //         }
  //       });
  //       if (fltTsDays.length > 0) {
  //          let vTSStsId: number = 0;
  //         let vIsAction: boolean = false;
  //         let vStsDesc: string = '';
  //         let vIsVisible: boolean = false;
  //         vTSStsId = fltTsDays[0]['LkStatusCodeId'];
  //         //CHECK IF ANY ACTION AVAILABLE FOR THE STATUS
  //         const fltStsDtl = dtRolSts.filter(elf => elf.LkStatusCodeId == vTSStsId);
  //         if (fltStsDtl.length > 0) {
  //           vIsAction = fltStsDtl[0].IsAction;
  //           vStsDesc = fltStsDtl[0].Title;
  //           vIsVisible = true;
  //           //IF ACTION AVAILABLE THEN CHECK IF THE ACTION IS FOR INDIVIDUAL USER
  //           let fltGrp = dtActGrpType.filter(el => el.LkStatusCodeId == vTSStsId && el.ActionGrpType == this.srGlbVar.nxtActionGrpUser)
  //           if(fltGrp.length >0){
  //             grRw['ActionGrpUser']= true
  //           } else{
  //             grRw['ActionGrpUser']= false
  //           }
  //           fltGrp = dtActGrpType.filter(el => el.LkStatusCodeId == vTSStsId && el.ActionGrpType == this.srGlbVar.nxtActionGrpLead)
  //           if(fltGrp.length >0){
  //             grRw['ActionGrpDisc']= true
  //           } else{
  //             grRw['ActionGrpDisc']= false
  //           }
  //         }
  //         grRw['LkStatusCodeId'] = vTSStsId;
  //         grRw['IsAction'] = vIsAction;
  //         grRw['TSStsDesc'] = vStsDesc;
  //         grRw['IsVisible'] = vIsVisible;
  //       }
  //       dtGrdData.push(grRw);
  //     });
  //     this.isProg = false;
  //     this.grdData = dtGrdData;
  //     this.grdSource.localdata = this.grdData;
  //     console.log('Gird Bind Start:' + this.getDate())
  //     console.log(this.grdData)
  //     this.grdTS.updateBoundData();
  //     this.actionBtnEnableLead();
  //     console.log('Gird Bind End:' + this.getDate())
  //   });
  // }

  virtualModeCreateRecords = (expandedRecord, done): void => {
      //expandedrecord is equal to null when the  is initially called, because there is still no record to be expanded.
      //prepare the data
      // const obj = this.grdDynCol(this.slctStrtDt, this.slctEndDt);
      // console.log('Created')
      // console.log(obj)
      // this.grdCol = obj['col'];
      // this.grdColGrp = obj['colGrp'];
      this.grdSource = {
        localdata: this.grdData, //expandedRecord === null? this.grdData : this.dtChild,
        dataType: 'json',
        datafields: this.grdDataFld,
        hierarchy:
        {
            root: 'children',
            // keyDataField: {
            //   name: 'DAYSID'
            // },
            // parentDataField: {
            //   name: 'PAFID'
            // }
        },
        id: 'ID'
      };
      this.grdDA = new jqx.dataAdapter(this.grdSource , {
        loadComplete: () => {
          done(this.grdDA.records);
        }
    });
    this.grdDA.dataBind();

     // this.grdDA = new jqx.dataAdapter(this.grdSource);
  }
  virtualModeRecordCreating(record): void {
    if (record.level == 2) {
        // by setting the record's leaf member to true, you will define the record as a leaf node.
        record.leaf = true;
    }
  };

  generatekey = () => {
    let S4 = () => {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    return (S4() + S4() + '-' + S4() + '-' + S4() + '-' + S4() + '-' + S4() + S4() + S4());
  };
}
