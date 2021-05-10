import { Component, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import {  NbToastrService, NbDialogService  } from '@nebular/theme';
import { FormGroup, FormBuilder } from '@angular/forms';
import { jqxGridComponent } from 'jqwidgets-ng/jqxgrid';
import { ConfirmdialogComponent } from '../modal-overlays/confirmdialog/confirmdialog.component';

import { SPXlstService } from '../../../services/SPXlst.service';
import { GlbVarService } from '../../../../src/services/glbvar.service';
import { LogininfoService } from '../../../services/logininfo.service';
import { EnvService } from '../../../services/env.service';
import { SPXUserInfoService } from '../../../services/SPXuserinfo.service';
import { forkJoin, Observable } from 'rxjs';

@Component({
  selector: 'ngx-ts-uc-director',
  templateUrl: './ts-uc-director.component.html',
  styleUrls: ['./ts-uc-director.component.scss']
})
export class TsUcDirectorComponent implements OnInit {

  @Input() inWeekID: number;
  @Input() inUserID: number;
  @Input() inRolID: number;
  @Input() inRolCode: string;
  @Input() inDtWk: any[] = [];

  _wkId: number;
  _usrId: number;
  _rolId: number;
  _dtWk: any[] = [];

  isProg: boolean = false;
  slctStrtDt: Date;
  slctEndDt: Date;

  grdCol: any[];
  grdDA: any;
  grdData: any;
  grdColGrp: any;
  grdSource: any;
  @ViewChild('grdTS', { static: false }) grdTS: jqxGridComponent;

  grdTSStsAll: any = [];
  frmGrp: FormGroup;

  constructor(
    private srSPXLst: SPXlstService,
    private srMsg: NbToastrService,
    private srGlbVar: GlbVarService,
    private srDialog: NbDialogService,
    public srLoginInfo: LogininfoService,
    private srUserInfo: SPXUserInfoService,
    private frmBld: FormBuilder,
    public env: EnvService,
  ) { }


  ngOnInit(): void {
    this.prepareForm();
  }

  /* ----------------------------- PREPARE FORM ---------------------------- */
  prepareForm() {
    this.frmGrp = this.frmBld.group({
      tsAllRmks: [null]
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes.inWeekID)) {
        this._wkId = this.inWeekID;
        this._dtWk = this.inDtWk;
        this._usrId = this.inUserID;
        this._rolId = this.inRolID;
        this.fnGrdLoadCol();
        this.getTSData(this._wkId);
        if(this.inRolCode != this.srGlbVar.rolTSCostCtrl)
          this.getAllTSSts(this._wkId);
    }
  }

  grdGetWidth() : any {
		if (document.body.offsetWidth < 850) {
			return '90%';
		} 	return 850;
	}

  getTSData(pRptID: number) {
    this.isProg = true;
    const dtGrdData =[];
    this.srSPXLst.getTSDirector(pRptID,this._rolId).subscribe(rs => {
      const dtTSDays = rs[0].d.results;
      const dtAttach = rs[1].d.results;
      const dtWKSts = rs[2].d.results;
      const dtRolSts = rs[3].d.results;
      let rowCnt: number = 0;
      for (let i = 0; i < dtTSDays.length; i++) {
        let elPAF = dtTSDays[i];
        rowCnt = rowCnt+1;
        elPAF['SLNO'] =rowCnt;
        if(elPAF.LkUsrNameId){
          const fltFile = dtAttach.filter(elF => elF.LkUsrNameId == elPAF.LkUsrNameId);
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
          elPAF['atchUrl'] =flUrl,
          elPAF['atchFileName'] =flName
          let fltSts = dtWKSts.filter(eSts => eSts.LkTsUsrNameId == elPAF.LkUsrNameId && eSts['LkActionByRoleName'].RoleName == this.srGlbVar.rolSNCDisLD)
          if(fltSts.length >0){
            elPAF['snc_ld_name'] = fltSts[fltSts.length-1]['LkActionByUsrName'].FullName
            elPAF['snc_ld_sts'] = fltSts[fltSts.length-1]['LkStatusCode'].StatusName
            elPAF['snc_ld_css']= fltSts[fltSts.length-1]['LkStatusCode'].Css
          } else{
            elPAF['snc_mgr_name'] = null;
            elPAF['snc_mgr_sts'] = null;
            elPAF['snc_mgr_css'] = null;
          }
          fltSts = dtWKSts.filter(eSts => eSts.LkTsUsrNameId == elPAF.LkUsrNameId && eSts['LkActionByRoleName'].RoleName == this.srGlbVar.rolSNCMGR)
          if(fltSts.length >0){
            elPAF['snc_mgr_name'] = fltSts[fltSts.length-1]['LkActionByUsrName'].FullName
            elPAF['snc_mgr_sts'] = fltSts[fltSts.length-1]['LkStatusCode'].StatusName
            elPAF['snc_mgr_css']= fltSts[fltSts.length-1]['LkStatusCode'].Css
          } else{
            elPAF['snc_mgr_name'] = null;
            elPAF['snc_mgr_sts'] = null;
            elPAF['snc_mgr_css'] = null;
          }
          fltSts = dtWKSts.filter(eSts => eSts.LkTsUsrNameId == elPAF.LkUsrNameId && eSts['LkActionByRoleName'].RoleName == this.srGlbVar.rolGCDisLD)
          if(fltSts.length >0){
            elPAF['clnt_ld_name'] = fltSts[fltSts.length-1]['LkActionByUsrName'].FullName
            elPAF['clnt_ld_sts'] = fltSts[fltSts.length-1]['LkStatusCode'].StatusName
            elPAF['clnt_ld_css']= fltSts[fltSts.length-1]['LkStatusCode'].Css
          } else{
            elPAF['clnt_ld_name'] = null
            elPAF['clnt_ld_sts'] = null
            elPAF['clnt_ld_css'] = null;
          }
          fltSts = dtWKSts.filter(eSts => eSts.LkTsUsrNameId == elPAF.LkUsrNameId && eSts['LkActionByRoleName'].RoleName == this.srGlbVar.rolGCMGR)
          if(fltSts.length >0){
            elPAF['clnt_mgr_name'] = fltSts[fltSts.length-1]['LkActionByUsrName'].FullName
            elPAF['clnt_mgr_sts'] = fltSts[fltSts.length-1]['LkStatusCode'].StatusName
            elPAF['clnt_mgr_css']= fltSts[fltSts.length-1]['LkStatusCode'].Css
          } else{
            elPAF['clnt_mgr_name'] = null
            elPAF['clnt_mgr_sts'] = null
            elPAF['clnt_mgr_css'] = null;
          }
        }
        dtGrdData.push(elPAF)
      }
      //console.log(dtGrdData)
      //this.actionBtnEnableDirector();
      this.isProg = false;
      this.grdData = dtGrdData;
      this.grdSource.localdata = this.grdData;
      this.grdTS.updatebounddata();
      //this.actionBtnEnableDisc(this._rolId);
    }, err => {
      console.log(err);
      this.srMsg.show(err, 'ERROR',
        {status: 'danger', destroyByClick: true, duration: 8000, hasIcon: true},
        );
    });
  }

  grdRenderStatusBar: any = function(statusbar) {
    const container = $('<div style=\'margin: 5px;\'></div>');
    const leftResult = '24 Items';
    const nextToLeftResult = '0 Selected';
    const rightResult = '114.4 Size';
    const leftSpan = $(`<span style='float: left; margin-top: 5px; margin-left: 18px;'>${leftResult}</span>`);
    const nextToLeftSpan = $(`<span style='float: left; margin-top: 5px; margin-left: 18px;'>${nextToLeftResult}</span>`);
    const rightSpan = $(`<span style='float: right; margin-top: 5px; margin-right: 45px;'>${rightResult}</span>`);
    container.append(leftSpan);
    container.append(nextToLeftSpan);
    container.append(rightSpan);
    statusbar.append(container);
  };

  fnGrdLoadCol() {
    const flt = this.inDtWk.filter(a => a.Id == this.inWeekID);
    this.slctStrtDt = flt[0].start_dt;
    this.slctEndDt = flt[0].end_dt;
    const obj = this.grdDynCol(this.slctStrtDt, this.slctEndDt);
    this.grdCol = obj['col'];
    this.grdColGrp = obj['colGrp'];
    this.grdSource = {
      localdata: this.grdData,
      dataType: 'json',
      datafields:  obj['dataField'],
      // hierarchy:
      // {
      //     root: 'children',
      // },
      id: 'ID',
      addRow: (rowID, rowData, position, parentID, commit) => {
        commit(true);
      },
      updateRow: (rowID, rowData, commit) => {
          commit(true);
      },
      deleteRow: (rowID, commit) => {
          commit(true);
      },
    };
    this.grdDA = new jqx.dataAdapter(this.grdSource);
  }

  grdDynCol(dtStrt: Date, dtEnd: Date) {
    const dyColPrefix = 'WDay';
    const rsDtFld = [
        { name: 'ID', type: 'number' },
        { name: 'PAFID', type: 'number' },
        { name: 'DAYSID', type: 'number' },
        { name: 'SLNO', type: 'number' },
        { name: 'LkUsrNameId', type: 'number' },
        { name: 'LkCBSCodeId', type: 'number' },
        { name: 'LkWkNameId', type: 'number' },
        { name: 'CallOffNO', type: 'string' },
        { name: 'TSPrj', type: 'string' },
        { name: 'Name', type: 'string' },
        { name: 'PAAFJobTitle', type: 'string' },
        { name: 'OrgChartPositionTitle', type: 'string' },
        { name: 'OrgChartIDNo', type: 'string' },
        { name: 'ServicesLocation', type: 'string' },
        { name: 'PAAFNo', type: 'string' },
        { name: 'TotManDays', type: 'number' },
        { name: 'atchUrl', type: 'string' },
        { name: 'atchFileName', type: 'string' },
        { name: 'LkStatusCodeId', type: 'string' },
        { name: 'IsAction', type: 'number' },
        { name: 'IsVisible', type: 'number' },
        { name: 'TSStsDesc', type: 'string' },
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
    ];
    const rsCol = [
        {
          text: '##',datafield: 'ID', columngroup: null, width: 76,  cellsalign: 'center', align: 'center'
          ,cellsrenderer: null, cellclassname: null, editable: true, hidden: true, exportable: false
        },
        // {
        //   text: '##',datafield: 'atchFileName', columngroup: null, width: 76,  cellsalign: 'center', align: 'center'
        //   ,cellsrenderer: null, cellclassname: null, editable: true, hidden: true, exportable: true
        // },
        // {
        //   text: '##',datafield: 'snc_ld_css', columngroup: null, width: 76,  cellsalign: 'center', align: 'center'
        //   ,cellsrenderer: null, cellclassname: null, editable: true, hidden: true, exportable: true
        // },
        // {
        //   text: '##',datafield: 'snc_mgr_css', columngroup: null, width: 76,  cellsalign: 'center', align: 'center'
        //   ,cellsrenderer: null, cellclassname: null, editable: true, hidden: true, exportable: true
        // },
        // {
        //   text: '##',datafield: 'clnt_ld_css', columngroup: null, width: 76,  cellsalign: 'center', align: 'center'
        //   ,cellsrenderer: null, cellclassname: null, editable: true, hidden: true, exportable: true
        // },
        // {
        //   text: '##',datafield: 'clnt_mgr_css', columngroup: null, width: 76,  cellsalign: 'center', align: 'center'
        //   ,cellsrenderer: null, cellclassname: null, editable: true, hidden: true, exportable: true
        // },
        // { text: 'LkUsrNameId', datafield: 'LkUsrNameId', width: 30, cellsalign: 'center', align: 'center' , hidden: true, exportable: true
        //   , cellsrenderer: '', createeditor: null, displayfield: null, buttonclick: null,
        // },
        // { text: 'LkWkNameId', datafield: 'LkWkNameId', width: 30, cellsalign: 'center', align: 'center' , hidden: true
        // , exportable: false,
        // },
        // { text: 'IsAction', datafield: 'IsAction', width: 30, cellsalign: 'center', align: 'center' , hidden: true
        // , exportable: false,
        // },
        // { text: 'LkStatusCodeId', datafield: 'LkStatusCodeId', width: 30, cellsalign: 'center', align: 'center' , hidden: true
        // , exportable: false,
        // },
        // { text: 'TSStsDesc', datafield: 'TSStsDesc', width: 30, cellsalign: 'center', align: 'center' , hidden: true
        //   , exportable: false,
        // },
        {
          text: 'SlNo', datafield: 'SLNO', width: 40, cellsalign: 'center', align: 'center', hidden: false, exportable: true
          , pinned: true, editable: false
          , cellclassname: null,
        },
        {
          text: 'Org Chart Position Title' , datafield: 'OrgChartPositionTitle', width: 180,  cellsalign: 'left', hidden: false,
          align: 'center', editable: false
          , cellclassname: null,
        },
        {
          text: 'Employee Name' , datafield: 'Name', width: 240,  cellsalign: 'left', align: 'center'
          , editable: false
          , cellclassname: null,
        },
        {
          text: 'Call Off No.' , datafield: 'CallOffNO', width: 80,  cellsalign: 'left', align: 'center', hidden: false,
          editable: false, cellclassname: null,
        },
        {
          text: 'Timesheet Project' , datafield: 'TSPrj', width: 120,  cellsalign: 'left', align: 'center', hidden: false,
          editable: false, cellclassname: null,
        },
        {
          text: 'PAAF No.' , datafield: 'PAAFNo', width: 60,  cellsalign: 'left', align: 'center', hidden: true,
          editable: false, cellclassname: null,
        },
        {
          text: 'PAAF Job Title' , datafield: 'PAAFJobTitle', width: 180,  cellsalign: 'left', align: 'center', hidden: true,
          editable: false
          , cellclassname: null,
        },
        {
          text: 'Org Chart ID No.' , datafield: 'OrgChartIDNo', width: 120,  cellsalign: 'left', align: 'center', hidden: false,
          editable: false
          , cellclassname: null,
        },
        {
          text: 'Work Location' , datafield: 'ServicesLocation', width: 90,  cellsalign: 'left', align: 'center', hidden: false,
          editable: false
          , cellclassname: null,
        },
        {
          text: 'Attachment' , datafield: 'atchUrl', width: 70,  cellsalign: 'left', align: 'center', hidden: false, editable: false,
          cellsrenderer: this.grdFnLnkRender
          , cellclassname: null, exportable: false,
        },
        {
          text: 'Total Man Days' , datafield: 'TotManDays', width: 60,  cellsalign: 'center', align: 'center', hidden: false,
          editable: false
          , cellclassname: null
        }
    ];
    const rsGrpCol :any[] = [];
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
            , datafield: WkID, columngroup: WkID, width: 70,  cellsalign: 'center', align: 'center'
            , cellsrenderer: null, cellclassname: null, editable: true
            , hidden: false, exportable: true
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
        text: 'Name'
      , datafield: 'snc_ld_name', columngroup: 'snc_lead', width: 90,  cellsalign: 'center', align: 'center'
      , cellsrenderer: null, cellclassname: null, editable: true
      , hidden: false, exportable: true
    }
    rsCol.push(colAppr);
    colAppr =
    {
        text: 'Status'
      , datafield: 'snc_ld_sts', columngroup: 'snc_lead', width: 90,  cellsalign: 'center', align: 'center'
      , cellsrenderer: null, cellclassname: this.cellclass, editable: true
      , hidden: false, exportable: true
    }
    rsCol.push(colAppr);
    colAppr =
    {
        text: 'Name'
      , datafield: 'snc_mgr_name', columngroup: 'snc_mgr', width: 90,  cellsalign: 'center', align: 'center'
      , cellsrenderer: null, cellclassname: null, editable: true
      , hidden: false, exportable: true
    }
    rsCol.push(colAppr);
    colAppr =
    {
        text: 'Status'
      , datafield: 'snc_mgr_sts', columngroup: 'snc_mgr', width: 90,  cellsalign: 'center', align: 'center'
      , cellsrenderer: null, cellclassname: this.cellclass, editable: true
      , hidden: false, exportable: true
    }
    rsCol.push(colAppr);
    colAppr =
    {
        text: 'Name'
      , datafield: 'clnt_ld_name', columngroup: 'clnt_lead', width: 90,  cellsalign: 'center', align: 'center'
      , cellsrenderer: null, cellclassname: null, editable: true
      , hidden: false, exportable: true
    }
    rsCol.push(colAppr);
    colAppr =
    {
        text: 'Status'
      , datafield: 'clnt_ld_sts', columngroup: 'clnt_lead', width: 90,  cellsalign: 'center', align: 'center'
      , cellsrenderer: null, cellclassname: this.cellclass, editable: true
      , hidden: false, exportable: true
    }
    rsCol.push(colAppr);
    colAppr =
    {
        text: 'Name'
      , datafield: 'clnt_mgr_name', columngroup: 'clnt_mgr', width: 90,  cellsalign: 'center', align: 'center'
      , cellsrenderer: null, cellclassname: null, editable: true
      , hidden: false, exportable: true
    }
    rsCol.push(colAppr);
    colAppr =
    {
        text: 'Status'
      , datafield: 'clnt_mgr_sts', columngroup: 'clnt_mgr', width: 90,  cellsalign: 'center', align: 'center'
      , cellsrenderer: null, cellclassname: this.cellclass, editable: true
      , hidden: false, exportable: true
    }
    rsCol.push(colAppr);
    //let colAppr =[
      // {
      //   text: 'Name', width: 90, cellsAlign: 'center', align: 'center', columnType: 'none' , sortable: false, dataField: 'snc_ld_name'
      //   , exportable: true, editable: false
      //   , cellclassname: null
      //   , columngroup: 'snc_lead',
      // },
      // {
      //   text: 'Status', width: 60, cellsAlign: 'center', align: 'center', columnType: 'none' , sortable: false, dataField: 'snc_ld_sts'
      //   , exportable: true, editable: false
      //   , cellclassname: this.cellclass
      //   , columngroup: 'snc_lead',
      // },
      // {
      //   text: 'Name', width: 90, cellsAlign: 'center', align: 'center', columnType: 'none' , sortable: false, dataField: 'snc_mgr_name'
      //   , exportable: true, editable: false
      //   , cellclassname: null
      //   , columngroup: 'snc_mgr',
      // },
      // {
      //   text: 'Status', width: 60, cellsAlign: 'center', align: 'center', columnType: 'none' , sortable: false, dataField: 'snc_mgr_sts'
      //   , exportable: true, editable: false
      //   , cellclassname: this.cellclass
      //   , columngroup: 'snc_mgr',
      // },
      // {
      //   text: 'Name', width: 90, cellsAlign: 'center', align: 'center', columnType: 'none' , sortable: false, dataField: 'clnt_ld_name'
      //   , exportable: true, editable: false
      //   , cellclassname: null
      //   , columngroup: 'clnt_lead',
      // },
      // {
      //   text: 'Status', width: 60, cellsAlign: 'center', align: 'center', columnType: 'none' , sortable: false, dataField: 'clnt_ld_sts'
      //   , exportable: true, editable: false
      //   , cellclassname: this.cellclass
      //   , columngroup: 'clnt_lead',
      // },
      // {
      //   text: 'Name', width: 90, cellsAlign: 'center', align: 'center', columnType: 'none' , sortable: false, dataField: 'clnt_mgr_name'
      //   , exportable: true, editable: false
      //   , cellclassname: null
      //   , columngroup: 'clnt_mgr',
      // },
      // {
      //   text: 'Status', width: 60, cellsAlign: 'center', align: 'center', columnType: 'none' , sortable: false, dataField: 'clnt_mgr_sts'
      //   , exportable: true, editable: false
      //   , cellclassname: this.cellclass
      //   , columngroup: 'clnt_mgr',
      // }
    //]


    rsGrpCol.push({ text: 'SNC Lead', align: 'center', name: 'snc_lead' })
    rsGrpCol.push({ text: 'SNC Director', align: 'center', name: 'snc_mgr' })
    rsGrpCol.push({ text: 'ROO Lead', align: 'center', name: 'clnt_lead' })
    rsGrpCol.push({ text: 'ROO Contract Admin', align: 'center', name: 'clnt_mgr'})
    const resData = {
      col : rsCol,
      colGrp : rsGrpCol,
      dataField : rsDtFld,
      grdData :  null,
    };
     return resData;

  }

  cellclass = function (row, dataField, cellValueInternal, rowData, cellText) {
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
    return null
  };

  grdFnLnkRender(row: number, columnfield: string, value: string | number, defaulthtml: string, columnproperties: any, rowdata: any): string {
     const cellUrl =  rowdata['atchUrl'];
     let cellValue = rowdata['atchFileName'];
     if (cellUrl) {
       if (cellValue.length > 10) {
         cellValue = String(cellValue).substr(0, 7) + '...';
       }
       return '<div style=\'padding-top:2px\'><a href=\'' + cellUrl + '\' target=\'_blank\'>' + cellValue + '</a></div>';
     } else{
      return '';
     }


  }

  getAllTSSts(pRptID) {
    this.grdTSStsAll =[];
    this.srSPXLst.getTSCostCtrlActDirector(pRptID,this._rolId).subscribe(rs => {
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
          let fltSts :any[]= dtWKSts.filter(eSts => eSts.LkUsrNameId == elPAF.LkUsrNameId);
          if(fltSts.length > 0){
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
          } else{
            elPAF['DAYSID']=0;
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

  dtBtnActionAll: any[] = [];
  actionBtnEnableDirector() {
    let crrSts = 0;
    const flt = this.grdTSStsAll.filter(el => el.ActionGrpAll== true);
    if (flt.length > 0) {
      crrSts = flt[0]['LkStatusCodeId'];
      // IF ALL TIMESHEET APPROVED BY COST CONTROL THEN ENABLE DIRECTOR SUBMIT BUTTON
      if (this.grdTSStsAll.length == flt.length){
        this.srSPXLst.getWFNxtAction(crrSts, this._rolId,this.srGlbVar.nxtActionGrpDirector).subscribe(rs => {
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
    const fltr = this._dtWk.filter(a => a.Id == this._wkId);
    const fltAct = this.dtBtnActionAll.filter(a => a.LkNxtStatusCodeId == pNxtStsID);
    if (fltr) {
      this.srDialog.open(ConfirmdialogComponent,
        {
          context: {
            IsConfirm: true,
            title: 'Confirm',
            message: 'Are you sure, you want to ' + fltAct[0].CurrStatusDesc + ' ( ' + fltr[0].WkName + ' ) ?',
          }//, dialogClass:'jqx-menu'
        })
        .onClose.subscribe(result => {
          if (result == true) {
            this.isProg = true;
            let vLkStsCodeID :number;
            let vCallOff :string;
            let vTSPrj :string;

            let observables: Observable<any>[] =<any>[];
            const dtNow = this.srGlbVar.dateAheadFix(new Date());
            for (let i = 0; i < this.grdTSStsAll.length; i++) {
              const el = this.grdTSStsAll[i];
              const rwSumSts ={
                LkStatusCodeId: pNxtStsID,
                LastActDt: dtNow,
                LastRmks: this.frmGrp.controls.tsAllRmks.value,
                LkActUsrNameId: this.srLoginInfo.loginId,
                LkActRolNameId: this._rolId,
                LogSts: 1
              }
              vLkStsCodeID=el.LkStatusCodeId;
              vCallOff=el.CallOffNumber;
              vTSPrj=el.TSProject;
              observables.push(this.srSPXLst.UptWkTSDays(this.srLoginInfo.authCode,rwSumSts,el.DAYSID))

              //this.fnUpdSummary(rwSumSts,el.DAYSID)
              // this.uptChangeStsDirector(fltr[0].WkName, pNxtStsID, el.LkUsrNameId, el.LkStatusCodeId
              //   , el.CallOffNumber, el.TSProject,true,false
              //   ,this.frmGrp.controls.tsAllRmks.value);
            }
            forkJoin(observables).subscribe(rsArr => {
              console.log('Request Array Done');
              this.fnSendEmail(fltr[0].WkName, pNxtStsID,vLkStsCodeID,
                true, false, this.frmGrp.controls.tsAllRmks.value)
              this.isProg = false;
            });
          }
        });
    }
  }

  fnSendEmail(pTSName, pNxtStsID, pCurrStsID,
    pEmailEnabled: boolean,pIsLeadData: boolean, pRmks){
    const flt = this.dtBtnActionAll.filter(a => a.LkNxtStatusCodeId == pNxtStsID);
    let dsNxtDesc = '';
    if (flt.length > 0) {
      dsNxtDesc = flt[0].NxtStatusDesc;
    }
    if (
      (pCurrStsID !== pNxtStsID) &&
      (flt[0].NxtStatusEmail != null) &&
      pEmailEnabled
      ) {
        this.srSPXLst.addSendNxtStatusEmailDirector(
          this.srLoginInfo.loginUsrName, dsNxtDesc, pNxtStsID,
          flt[0].NxtActOnlyToUsr,
          pTSName, this._wkId, this.srUserInfo.loginInfo.loginId,
          flt[0].NxtStatusEmail,
          this.expGrdAsJson(pIsLeadData), null,
          pRmks
          );
    }
    this.srMsg.show(pTSName + ' - ' + dsNxtDesc + ' Successfully', 'Success',
          {status: 'success', destroyByClick: true, duration: 5000, hasIcon: true},
          );
    this.getAllTSSts(this._wkId);
  }

  fnUpdSummary(pSmryUpt,pDayId){
    //UPDATE USER SUMMARY TABLE STATUS
    this.srSPXLst.UptWkTSDays(this.srLoginInfo.authCode,pSmryUpt,pDayId).subscribe(rs =>{
    })
  }

  isStsUptCnt = 0;
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
      LkWkNameId: this._wkId,
      LkTsUsrNameId: pUsrNameId,
      LkActionByUsrNameId: this.srLoginInfo.loginId,
      LkActionByRoleNameId: this._rolId,
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
                pTSName, this._wkId, this.srUserInfo.loginInfo.loginId,
                flt[0].NxtStatusEmail,
                this.expGrdAsJson(pIsLeadData), null,
                pRmks
                );
          }
          this.srMsg.show(pTSName + ' - ' + dsNxtDesc + ' Successfully', 'Success',
          {status: 'success', destroyByClick: true, duration: 5000, hasIcon: true},
          );
          this.getAllTSSts(this._wkId);
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
      const csvLead = this.grdData;
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
          'SlNo': i+1,
          // 'Call Off NO': el.CallOffNumber,
          // 'Timesheet Project': el.TSProject,
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

}
