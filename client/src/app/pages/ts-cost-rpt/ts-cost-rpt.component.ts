import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import {  NbToastrService  } from '@nebular/theme';
import { jqxTreeComponent } from 'jqwidgets-ng/jqxtree';
import { jqxDropDownButtonComponent } from 'jqwidgets-ng/jqxdropdownbutton';
import { jqxTreeGridComponent } from 'jqwidgets-ng/jqxtreegrid';

import { SPXlstService } from '../../../services/SPXlst.service';
import { GlbVarService } from '../../../../src/services/glbvar.service';
import { LogininfoService } from '../../../services/logininfo.service';
//import { SPXUserInfoService } from '../../../services/SPXuserinfo.service';
import { EnvService } from '../../../services/env.service';
import { XlService } from '../../../services/xl.service';

@Component({
  selector: 'ngx-ts-cost-rpt',
  templateUrl: './ts-cost-rpt.component.html',
  styleUrls: ['./ts-cost-rpt.component.scss']
})
export class TsCostRptComponent implements OnInit {

  frmGrp: FormGroup;
  dtWk: any[] = [];
  slctStrtDt: Date;
  slctEndDt: Date;

  _pgRolID: number;
  _pgWkID: number;

  treTotPAF: number = 0;
  treSrc;
  treDA;
  treData;
  treRecords;
  treDataRaw: any[] = [];
  @ViewChild('treID', { static: false }) treID: jqxTreeComponent;
  @ViewChild('treDll', { static: false }) treDll: jqxDropDownButtonComponent;
  dtDllDpt: any = [];
  _calOff: string;
  _tsPrj: string;
  cmSlctDeptTxt = '';
  slctDept: string;

  grdCol: any[];
  grdDA: any;
  grdData: any;
  grdColGrp: any;
  grdSource: any;
  @ViewChild('grdTS', { static: false }) grdTS: jqxTreeGridComponent;
  grdDtTSSts: any = [];
  _isSNCLD: boolean = true;
  isProg: boolean = false;

  constructor(
    private frmBld: FormBuilder,
    private srGlbVar: GlbVarService,
    private srSPXLst: SPXlstService,
    private srMsg: NbToastrService,
    public srLoginInfo: LogininfoService,
    public env: EnvService,
    private srXl: XlService
  ) { }

  ngOnInit(): void {
    this.prepareForm();
    const obj = this.srSPXLst.getMRolIDByRoleName(this.srGlbVar.rolGCMGR);
    obj.then((rs) => {
      this._pgRolID = rs;
    });
    this.getTsName();
    this.getDepart();
  }


  /* ----------------------------- PREPARE FORM ---------------------------- */
  prepareForm() {
    this.frmGrp = this.frmBld.group({
        tsName: [null],
        dtFrom: [null],
        dtTo: [null],
      });
  }

  getTsName() {
    this.srSPXLst.getTSMaster(null).subscribe(rs => {
      this.dtWk = rs.d.results;
      if (this.dtWk.length > 0) {
        const dfDt = this.dtWk[this.dtWk.length - 1]['Id'];
        this.frmGrp.controls['tsName'].setValue(dfDt);
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

  setStrtEndDt(RptID) {
    this.treID.selectItem(null);
    this.treDll.setContent('');

    const flt = this.dtWk.filter(a => a.Id == RptID);
    this._pgWkID = RptID;
    this.slctStrtDt = flt[0].start_dt;
    this.slctEndDt = flt[0].end_dt;
    this.frmGrp.controls['dtFrom'].setValue(this.srGlbVar.formatDate(this.slctStrtDt));
    this.frmGrp.controls['dtTo'].setValue(this.srGlbVar.formatDate(this.slctEndDt));
    this.fnGrdLoadCol();
  }

  onSelectTsName(value) {
    this.setStrtEndDt(value);
  }

  getDepart() {
    this.srSPXLst.getPrjCalOffPAF().subscribe(rs => {
      const dt = rs.d.results;
      const arr = this.srGlbVar.getDistinct(dt, 'CallOffNumber');
      const rss = [];
      arr.forEach(e => {
        const rw = {
          CallOFF: e,
          TSPrjs: dt.filter(el => el.CallOffNumber == e),
        };
        rss.push(rw);
      });
      this.dtDllDpt = rss;
      this.treData = this.fnTreFormat(dt);
      this.treeConfig();
    }, err => {
      console.log(err);
      this.srMsg.show(err, 'ERROR',
        {status: 'danger', destroyByClick: true, duration: 8000, hasIcon: true},
        );
    });
  }

  treeConfig() {
    // prepare the data
    this.treSrc = {
        datatype: 'json',
        datafields: [
            { name: 'id' },
            { name: 'parentid' },
            { name: 'display'},
            { name: 'cat'},
            { name: 'value'},
        ],
        id: 'id',
        localdata: this.treData,
    };
    this.treDA = new jqx.dataAdapter(this.treSrc, { autoBind: true });
    this.treRecords = this.treDA.getRecordsHierarchy('id', 'parentid', 'items', [{ name: 'display', map: 'label' }]);
  }

  // CONVERT TO CALL OFF & PROJECT AS PARENT CHILD
  fnTreFormat(dtRs) {
    const result = [];
    const map = new Map();
    // GET DISTINCT CALL OF AND PUSH IT AS PARENT
    const dtDis = this.srGlbVar.getDistinct(dtRs, 'CallOffNumber');
    for (const item of dtDis) {
            result.push({
                id: item,
                display: '<strong>' + item + '</strong>',
                parentid: null,
                cat: 'CALOF',
                value: null,
            });
    }
    // ADD ALL
    // this.treTotPAF =0;
    for (const item of result) {
      const lblArr =  dtRs.filter(v => v.CallOffNumber === item.id);
      const dtDis = this.srGlbVar.getDistinct(lblArr, 'TSProject');
      dtDis.forEach(el => {
        const rw = {
          id: item.id +'-'+ el,
          display: el,
          parentid: item.id,
          cat: 'DISC',
          value: item.id +'-'+ el,
        };
        result.push(rw);
        this.treTotPAF = this.treTotPAF + 1;
      });
    }
    return result;
  }

  onTreSelect($event) {
    const value = this.treID.getSelectedItem().value;
    if(value){
      this.slctDept = value;
      const flt = value.split('-')
      if (flt.length > 0) {
        this.cmSlctDeptTxt = value;
        this._calOff = flt[0];
        this._tsPrj = flt[1];
        if (this.treID && this.treDll) {
          const dropDownContent = '<div style="position: relative; margin-left: 3px; margin-top: 4px;">' + this.cmSlctDeptTxt + '</div>';
          this.treDll.setContent(dropDownContent);
          this.treDll.close();
          this.getRptData(this._pgWkID,this._calOff,this._tsPrj)
        }
      } else {
        this.cmSlctDeptTxt = 'Select Options';
      }
    }
  }

  grdEditSetting: any =
  {
    saveOnPageChange: true, saveOnBlur: true,
    saveOnSelectionChange: false, cancelOnEsc: true,
    saveOnEnter: true, editOnDoubleClick: false, editOnF2: false,
  };

  dtAprSNCLd =[];
  dtAprSNCMgr =[];
  dtAprClntLd =[];
  dtAprClntMgr =[];
  getRptData(pWkId,pCallOff,pTSPrj){
    this.isProg = true;
    this.srSPXLst.getWkRpt(pWkId,pCallOff,pTSPrj).subscribe(rs => {
      const dtWkTSDays = rs[0].d.results;
      const dtTS = rs[1].d.results;
      const dtWKSts = rs[2].d.results;
      console.log(dtWkTSDays)

      this.dtAprSNCLd = [];//this.getApproverDt(this.srGlbVar.rolSNCDisLD,false);
      this.dtAprSNCMgr = [];//this.getApproverDt(this.srGlbVar.rolSNCMGR,false);
      this.dtAprClntLd = [];//this.getApproverDt(this.srGlbVar.rolGCDisLD,false);
      this.dtAprClntMgr = [];//this.getApproverDt(this.srGlbVar.rolGCMGR,false);

      const dtGrdData = [];

      let roPCnt: number = 0;
      dtWkTSDays.forEach(el => {
        const fltChild = dtTS.filter(dt => dt.LkUsrNameId == el.LkUsrNameId);
        const dtChild: any[] = [];
        let roCCnt: number = 0;
        if(this._isSNCLD === true){
          fltChild.forEach(elcld => {
            roCCnt = roCCnt + 1;
            const rw = {
              DAYSID:0,
              SLNO: roCCnt,
              Name: null,
              PAAFJobTitle: null,
              OrgChartPositionTitle: null,
              OrgChartIDNo: null,
              ServicesLocation: null,
              PAAFNo: null,
              CBSCode: elcld.LkCBSCode.TASK_CODE,
            };
            for (const key in elcld) {
              if (elcld.hasOwnProperty(key)) {
                  rw[key] = elcld[key];
              }
            }
            dtChild.push(rw);
          });
        }
        roPCnt = roPCnt + 1;
        const grRw = {
          ID: el.ID,
          SLNO: roPCnt,
          Name: el.Name,
          PAAFJobTitle: el.PAFJobTitle,
          OrgChartPositionTitle: el.OrgChartPositionTitle,
          OrgChartIDNo: el.OrgChartIDNo,
          ServicesLocation: el.ServicesLocation,
          PAAFNo: el.PAAFNo,
          children: dtChild,
          atchUrl: null,
          atchFileName: null,
          LkUsrNameId: el.LkUsrNameId,
          CallOffNO: el.CallOffNO,
          TSPrj: el.TSPrj
        };
        let fltSts = dtWKSts.filter(eSts => eSts.LkTsUsrNameId == grRw.LkUsrNameId && eSts['LkActionByRoleName'].RoleName == this.srGlbVar.rolSNCDisLD)
        if(fltSts.length >0){
          grRw['snc_ld_name'] = fltSts[fltSts.length-1]['LkActionByUsrName'].FullName
          grRw['snc_ld_sts'] = fltSts[fltSts.length-1]['LkStatusCode'].StatusName
          grRw['snc_ld_css']= fltSts[fltSts.length-1]['LkStatusCode'].Css
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
        } else{
          const dtName = this.dtAprClntMgr.filter(e => e.LkUsrNameId == grRw.LkUsrNameId)
          if(dtName.length >0){
            grRw['clnt_mgr_name'] = dtName[0].AprName;
            grRw['clnt_mgr_apr_email'] = dtName[0].AprEmailID;
          }
          grRw['clnt_mgr_sts'] = null
          grRw['clnt_mgr_css'] = null;
        }
        for (const key in el) {
            if (el.hasOwnProperty(key)) {
              if (key.includes('WDay')) {
                  grRw[key] = el[key];
              }
              if (String(key) == 'ID') {
                grRw['DAYSID'] = el[key];
              }
              if (key.includes('TotManDays')) {
                grRw[key] = el[key];
              }
            }
        }
        dtGrdData.push(grRw);
      })

      this.isProg = false;
      this.grdData = dtGrdData;
      this.grdSource.localdata = this.grdData;
      this.grdTS.updateBoundData();

    }, err => {
      console.log(err);
      this.srMsg.show(err, 'ERROR',
        {status: 'danger', destroyByClick: true, duration: 8000, hasIcon: true},
        );
    });
  }

  grdDynCol(dtStrt: Date, dtEnd: Date) {
    const dyColPrefix = 'WDay';
    const rsDtFld = [
        { name: 'ID', type: 'number' },
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
        { name: 'ActionGrpDisc', type: 'string'},
        { name: 'CallOffNO', type: 'string'},
        { name: 'TSPrj', type: 'string'},
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
        { name: 'clnt_mgr_css', type: 'string'}
    ];
    const rsCol = [
        { text: '##', datafield: 'ID', width: 30, cellsalign: 'center', align: 'center' , hidden: true, exportable: false
          , cellsrenderer: '', createeditor: null, displayfield: null, buttonclick: null, columntype: 'textbox',
        },
        { text: 'LkUsrNameId', datafield: 'LkUsrNameId', width: 30, cellsalign: 'center', align: 'center' , hidden: true, exportable: false
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
          , exportable: false,
        },
        {
          text: 'SlNo', datafield: 'SLNO', width: 60, cellsalign: 'center', align: 'center', hidden: false, exportable: true
          , pinned: true, editable: false
          , cellclassname: this.cellclass,
        },
        {
          text: 'Status', width: 140, cellsAlign: 'center', align: 'center', columnType: 'none' , sortable: false, dataField: 'btncol'
          , exportable: false, hidden: true
          , cellsRenderer: (row, dataField, cellValueInternal, rowData, cellText): string => {
            const rw = rowData;
            return `<div id='grd_btn_id_${row}' grd-btn-desc='${rw.TSStsDesc}' grd-row-id='${row}'
                    IsAction='${rw.IsAction}' LkUsrNameId='${rw.LkUsrNameId}' grd-btn-status ></div>`;
          }
          , cellclassname: this.cellclass
        },
        {
          text: 'Employee Name' , datafield: 'Name', width: 240,  cellsalign: 'left', align: 'center'
          , editable: false
          , cellclassname: this.cellclass
          , exportable: true
        },
        {
          text: 'PAAF Job Title' , datafield: 'PAAFJobTitle', width: 180,  cellsalign: 'left', align: 'center', hidden: false,
          editable: false
          , cellclassname: this.cellclass
          , exportable: true
        },
        {
          text: 'Org Chart Position Title' , datafield: 'OrgChartPositionTitle', width: 180,  cellsalign: 'left', hidden: false,
          align: 'center', editable: false
          , cellclassname: this.cellclass
          , exportable: true
        },
        {
          text: 'Org Chart ID No.' , datafield: 'OrgChartIDNo', width: 120,  cellsalign: 'left', align: 'center', hidden: false,
          editable: false
          , cellclassname: this.cellclass
          , exportable: true
        },
        {
          text: 'Attachment' , datafield: 'atchUrl', width: 70,  cellsalign: 'left', align: 'center', hidden: false, editable: false,
          cellsrenderer: this.grdFnLnkRender
          , cellclassname: this.cellclass, exportable: false,
        },
        {
          text: 'Work Location' , datafield: 'ServicesLocation', width: 90,  cellsalign: 'left', align: 'center', hidden: false,
          editable: false
          , cellclassname: this.cellclass
          , exportable: true
        },
        {
          text: 'PAAF No.' , datafield: 'PAAFNo', width: 60,  cellsalign: 'left', align: 'center', hidden: false,
          editable: false
          , cellclassname: this.cellclass
          , exportable: true
        },
        {
          text: 'Total Man Days' , datafield: 'TotManDays', width: 60,  cellsalign: 'center', align: 'center', hidden: false,
          editable: false
          , cellclassname: this.cellclass
          , exportable: true
        },
    ];
    if(this._isSNCLD === true){
      let rw1 =  {
        text: 'CBS Code' , datafield: 'CBSCode', width: 90,  cellsalign: 'left', align: 'center'
        , cellclassname: this.cellclass, hidden: false, exportable: false, editable: false
      }
      rsCol.push(rw1);
      rw1 =  {
        text: 'Category' , datafield: 'AFEType', width: 80,  cellsalign: 'left', align: 'center'
        , cellclassname: this.cellclass, hidden: false, exportable: false, editable: false
      }
      rsCol.push(rw1);
    }
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
            ,datafield: WkID, columngroup: WkID, width: 76,  cellsalign: 'center', align: 'center'
            ,cellsrenderer: null , columntype: null, cellclassname: this.cellclass, hidden: false
            ,exportable: false, editable: false
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
      , hidden: false, exportable: false
    }
    rsCol.push(colAppr);
    colAppr =
    {
        text: 'Status'
      , datafield: 'snc_ld_sts', columngroup: 'snc_lead', width: 90,  cellsalign: 'center', align: 'center'
      , cellsrenderer: null, cellclassname: this.cellclass, editable: false
      , hidden: false, exportable: false
    }
    rsCol.push(colAppr);
    colAppr =
    {
        text: 'Approver Name'
      , datafield: 'snc_mgr_name', columngroup: 'snc_mgr', width: 90,  cellsalign: 'center', align: 'center'
      , cellsrenderer: null, cellclassname: null, editable: false
      , hidden: false, exportable: false
    }
    rsCol.push(colAppr);
    colAppr =
    {
        text: 'Status'
      , datafield: 'snc_mgr_sts', columngroup: 'snc_mgr', width: 90,  cellsalign: 'center', align: 'center'
      , cellsrenderer: null, cellclassname: this.cellclass, editable: false
      , hidden: false, exportable: false
    }
    rsCol.push(colAppr);
    colAppr =
    {
        text: 'Approver Name'
      , datafield: 'clnt_ld_name', columngroup: 'clnt_lead', width: 90,  cellsalign: 'center', align: 'center'
      , cellsrenderer: null, cellclassname: this.cellclass, editable: false
      , hidden: false, exportable: false
    }
    rsCol.push(colAppr);
    colAppr =
    {
        text: 'Status'
      , datafield: 'clnt_ld_sts', columngroup: 'clnt_lead', width: 90,  cellsalign: 'center', align: 'center'
      , cellsrenderer: null, cellclassname: this.cellclass, editable: false
      , hidden: false, exportable: false
    }
    rsCol.push(colAppr);
    colAppr =
    {
        text: 'Approver Name'
      , datafield: 'clnt_mgr_name', columngroup: 'clnt_mgr', width: 90,  cellsalign: 'center', align: 'center'
      , cellsrenderer: null, cellclassname: this.cellclass, editable: false
      , hidden: false, exportable: false
    }
    rsCol.push(colAppr);
    colAppr =
    {
        text: 'Status'
      , datafield: 'clnt_mgr_sts', columngroup: 'clnt_mgr', width: 90,  cellsalign: 'center', align: 'center'
      , cellsrenderer: null, cellclassname: this.cellclass, editable: false
      , hidden: false, exportable: false
    }
    rsCol.push(colAppr);
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
    // console.log(rowData)
     const cellUrl = rowData[dataField];
     let cellValue = rowData['atchFileName'];
     if ((cellUrl !== null) && (cellUrl !== undefined)) {
       if (cellValue.length > 10) {
         cellValue = String(cellValue).substr(0, 7) + '...';
       }
       return '<a href=\'' + cellUrl + '\' target=\'_blank\'>' + cellValue + '</a>';
     } else
       return '';

  }

  fnGrdLoadCol() {
    const obj = this.grdDynCol(this.slctStrtDt, this.slctEndDt);
    this.grdCol = obj['col'];
    this.grdColGrp = obj['colGrp'];
    this.grdSource = {
      localdata: this.grdData,
      dataType: 'json',
      datafields:  obj['dataField'],
      hierarchy:
      {
          root: 'children',
      },
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

  grdExportXL(): void {
    console.log('exl1')
    let pCol=[];
    this.grdCol.forEach(cl =>{
      if(cl.hidden === false){
        let colSetting ={
          header: cl.text,
          key: cl.datafield,
          width: 10,
          //style: { font: { name: 'Arial Black' }, numFmt: 'dd-MMM-yyyy' }
          //style: {  numFmt: 'dd-MMM-yyyy' },
          fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E4E4E4' } }
        }
        pCol.push(colSetting);
      }
    })
    //this.srXl.FlatXL("Sample","Weekly Report",this.grdSource.localdata,pCol);
    this.grdTS.exportData('xls');
  };

}
