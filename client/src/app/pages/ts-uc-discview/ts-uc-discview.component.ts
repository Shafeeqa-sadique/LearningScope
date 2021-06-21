import { Component, OnInit, Input, ViewChild, OnChanges, SimpleChanges } from '@angular/core';
import {  NbToastrService, NbDialogService  } from '@nebular/theme';
import { FormGroup, FormBuilder } from '@angular/forms';
import { jqxTreeGridComponent } from 'jqwidgets-ng/jqxtreegrid';
import { ConfirmdialogComponent } from '../modal-overlays/confirmdialog/confirmdialog.component';

import { SPXlstService } from '../../../services/SPXlst.service';
import { GlbVarService } from '../../../../src/services/glbvar.service';
import { LogininfoService } from '../../../services/logininfo.service';
import { EnvService } from '../../../services/env.service';
import { forkJoin, Observable } from 'rxjs';


@Component({
  selector: 'ngx-ts-uc-discview',
  templateUrl: './ts-uc-discview.component.html',
  styleUrls: ['./ts-uc-discview.component.scss'],
})
export class TsUcDiscviewComponent implements OnInit, OnChanges  {

  @Input() inWeekID: number;
  @Input() inUserID: number;
  @Input() inRolID: number;
  @Input() inCallOff: string;
  @Input() inTSPrj: string;
  @Input() inDtWk: any[] = [];
  @Input() inRolCode: string;


  _wkId: number;
  _usrId: number;
  _rolId: number;
  _calOff: string;
  _tsPrj: string;
  _dtWk: any[] = [];

  _isSNCLD: boolean= true;
  dtApproveDtl: any =[]

  frmGrp: FormGroup;
  isProg: boolean = false;
  slctStrtDt: Date;
  slctEndDt: Date;

  grdCol: any[];
  grdDA: any;
  grdData: any;
  grdColGrp: any;
  grdSource: any;
  @ViewChild('grdTS', { static: false }) grdTS: jqxTreeGridComponent;
  grdDtTSSts: any = [];

  constructor(
    private srSPXLst: SPXlstService,
    private srMsg: NbToastrService,
    private srGlbVar: GlbVarService,
    private srDialog: NbDialogService,
    public srLoginInfo: LogininfoService,
    private frmBuild: FormBuilder,
    public env: EnvService,
  ) { }

  ngOnInit(): void {
    this.prepareForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('this.inRolID')
    console.log(this.inRolID)
    if ((changes.inWeekID !== undefined) &&
       (changes.inWeekID !== null)) {
          this._wkId = this.inWeekID;
          this._dtWk = this.inDtWk;
          this._usrId = this.inUserID;
          this._rolId = this.inRolID;
          //this.getAllTSSts(this._wkId);
          // if(this.inRolCode == this.srGlbVar.rolSNCDisLD){
          //   this._isSNCLD = true;
          // } else{
          //   this._isSNCLD = false;
          // }
          this.fnGrdLoadCol();
          if (this.grdSource !== undefined && this.grdTS != undefined) {
            this.grdSource.localdata = [];
            this.grdTS.updateBoundData();
            this.actionBtnEnableDisc(0);
          }


          this.getTSData(this._wkId);
       }
      //  let isGrdDataLoad: boolean = false;

      //  if ((changes.inCallOff !== undefined) &&
      //  (changes.inCallOff !== null)) {
      //     this._calOff = this.inCallOff;
      //     isGrdDataLoad = true;
      //  }
      //  if ((changes.inTSPrj !== undefined) &&
      //  (changes.inTSPrj !== null)) {
      //     this._tsPrj = this.inTSPrj;
      //     isGrdDataLoad = true;
      //  }
      //  if (isGrdDataLoad === true) {
      //   this.getTSData(this._wkId);
      //   this.reloadStatus();
      //  }

      this.reloadStatus();
  }

  reloadStatus() {
    // this.fnLodAppr(this._calOff, this._tsPrj, this.srGlbVar.rolSNCDisLD, 'ctSncLdIName', 'ctSncLdSts', 'ctSncLdDt', this._wkId);
    // this.fnLodAppr(this._calOff, this._tsPrj, this.srGlbVar.rolSNCMGR, 'ctCrMgrAName', 'ctCrMgrAAp', 'ctCrMgrADt', this._wkId);
    // this.fnLodAppr(this._calOff, this._tsPrj, this.srGlbVar.rolGCDisLD, 'ctCoLdIName', 'ctCoLdIAp', 'ctCoLdIDt', this._wkId);
    // this.fnLodAppr(this._calOff, this._tsPrj, this.srGlbVar.rolGCMGR, 'ctCoMgrAName', 'ctCoMgrAAp', 'ctCoMgrADt', this._wkId);

    if(this.frmGrp !== undefined)
      this.frmGrp.controls['tsAppRmks'].setValue(null);
  }

  /* ----------------------------- PREPARE FORM ---------------------------- */
  prepareForm() {
    this.frmGrp = this.frmBuild.group({
      tsAppRmks : [null],
      ctSncLdIName: [null],
      ctSncLdSts: [null],
      ctSncLdDt: [null],
      ctCrMgrAName: [null],
      ctCrMgrAAp: [null],
      ctCrMgrADt: [null],
      ctCoLdIName: [null],
      ctCoLdIAp: [null],
      ctCoLdIDt: [null],
      ctCoMgrAName: [null],
      ctCoMgrAAp: [null],
      ctCoMgrADt: [null],
    });
  }

  getTSData(pRptID: number) {
    this.isProg = true;
    this.srSPXLst.getTSLead(pRptID, this._rolId,this._usrId).subscribe(rs => {
      const dtTS = rs[0].d.results;
      const dtWkTSDays = rs[1].d.results;
      const dtFile = rs[2].d.results;
      const dtRolSts = rs[3].d.results;
      const dtActGrpType = rs[4].d.results;
      const dtAprUsr = rs[5].d.results;
      const dtWKSts = rs[6].d.results;

      this.dtAprSNCLd = this.getApproverDt(this.srGlbVar.rolSNCDisLD,false);
      this.dtAprSNCMgr = this.getApproverDt(this.srGlbVar.rolSNCMGR,false);
      this.dtAprClntLd = this.getApproverDt(this.srGlbVar.rolGCDisLD,false);
      this.dtAprClntMgr = this.getApproverDt(this.srGlbVar.rolGCMGR,false);

      const dtGrdData = [];
      let roPCnt: number = 0;
      const fltAssignUsrId = [];
      dtAprUsr.forEach(el => {
        fltAssignUsrId.push(el.LkUsrName.ID);
      });

      const fltWkTSDays = dtWkTSDays.filter(function(it){
        return fltAssignUsrId.indexOf(it.LkUsrNameId) > -1;
      });

      fltWkTSDays.forEach(el => {
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
              PDOWBS: elcld.LkWBS.Title,
              ClusterCode: elcld.LkWBS.ClusterCode
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
          atchUrl: flUrl,
          atchFileName: flName,
          LkUsrNameId: el.LkUsrNameId,
          CallOffNO: el.CallOffNO,
          TSPrj: el.TSPrj,
          PDOWBS: null,
          ClusterCode: null
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

        const fltTsDays = fltWkTSDays.filter(dt => dt.LkUsrNameId == el.LkUsrNameId);
        //THIS OPTION IS REQUIRED TO DISPLAY THE TIMESHEET ONLY WHEN ITS APPLICABLE TO SHOW TIMESHEET
        //AS OF NOW BY DEFAULT SHOW THE TIMESHEET AT ANY CONDITION
        let vIsVisible: boolean = true;
        if (fltTsDays.length > 0) {
           let vTSStsId: number = 0;
          let vIsAction: boolean = false;
          let vStsDesc: string = '';
          vTSStsId = fltTsDays[0]['LkStatusCodeId'];
          const fltStsDtl = dtRolSts.filter(elf => elf.LkStatusCodeId == vTSStsId);
          if (fltStsDtl.length > 0) {
            vIsAction = fltStsDtl[0].IsAction;
            vStsDesc = fltStsDtl[0].Title;
            vIsVisible = true;
            //IF ACTION AVAILABLE THEN CHECK IF THE ACTION IS FOR INDIVIDUAL USER
            const fltGrp = dtActGrpType.filter(el => el.LkStatusCodeId == vTSStsId && el.ActionGrpType == this.srGlbVar.nxtActionGrpLead)
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
        fltTsDays.forEach(elDays => {
          for (const key in elDays) {
              if (elDays.hasOwnProperty(key)) {
                if (key.includes('WDay')) {
                  if (vIsVisible == true)
                    grRw[key] = elDays[key];
                  else
                    grRw[key] = null;
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
        // if (vIsVisible === false) {
        //   grRw['children'] = [];
        // }
        dtGrdData.push(grRw);
      });

      this.isProg = false;
      this.grdData = dtGrdData;
      this.grdSource.localdata = this.grdData;
      this.grdTS.updateBoundData();
      this.actionBtnEnableDisc(this._rolId);
    });
  }

  grdEditSetting: any =
  {
    saveOnPageChange: true, saveOnBlur: true,
    saveOnSelectionChange: false, cancelOnEsc: true,
    saveOnEnter: true, editOnDoubleClick: false, editOnF2: false,
  };

  fnLodAppr(vCalOf, vTs, rolCod, frmCtlApr, frmCtlSts, frmCtlDt, pWkId) {
    // CHECK IF TS ALREADY APPROVED THEN GET THE DETAILS

    this.srSPXLst.getTSWkStsByTSPrjRol(vCalOf, vTs, rolCod, null, null, pWkId).subscribe(rs2 => {
        if (rs2.d.results.length == 0) {
          this.srSPXLst.getUsrByTSPrjRol(vCalOf, vTs, rolCod).subscribe(rs => {
            let dtTSUsr: any = [];
            dtTSUsr = rs.d.results;
            let vUsr = '';
            dtTSUsr.forEach(e => {
              vUsr = vUsr + e.LkUsrName.FullName + ';';
              });
            if (vUsr.length > 0)
              this.frmGrp.controls[frmCtlApr].setValue(vUsr);
              this.frmGrp.controls[frmCtlSts].setValue(null);
              this.frmGrp.controls[frmCtlDt].setValue(null);
          });
        } else {
          let dt: any[] = [];
          dt = rs2.d.results;
          if (dt.length > 0) {
            // GET THE LATEST STATUS
            this.frmGrp.controls[frmCtlApr].setValue(dt[dt.length - 1].LkActionByUsrName.FullName);
            this.frmGrp.controls[frmCtlSts].setValue(dt[dt.length - 1].LkStatusCode.StatusName);
            this.frmGrp.controls[frmCtlDt].setValue(this.srGlbVar.formatDate(dt[dt.length - 1].SubmitDt));
          }
        }
    });
  }

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
        { name: 'clnt_mgr_css', type: 'string'},
        { name: 'PDOWBS', type: 'string'},
        { name: 'ClusterCode', type:'string'}
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
          , cellclassname: null,
        },
        {
          text: 'Status', width: 140, cellsAlign: 'center', align: 'center', columnType: 'none' , sortable: false, dataField: 'btncol'
          , exportable: false, hidden: false
          , cellsRenderer: (row, dataField, cellValueInternal, rowData, cellText): string => {
            const rw = rowData;
            return `<div id='grd_btn_id_${row}' grd-btn-desc='${rw.TSStsDesc}' grd-row-id='${row}'
                    IsAction='${rw.IsAction}' LkUsrNameId='${rw.LkUsrNameId}' grd-btn-status ></div>`;
          }
          , cellclassname: null
        },
        {
          text: 'PAAF No.' , datafield: 'PAAFNo', width: 60,  cellsalign: 'left', align: 'center', hidden: true,
          editable: false
          , cellclassname: null
          , exportable: true
        },
        {
          text: 'Employee Name' , datafield: 'Name', width: 210,  cellsalign: 'left', align: 'center'
          , editable: false
          , cellclassname: null
          , exportable: true
        },
        {
          text: 'PAAF Job Title' , datafield: 'PAAFJobTitle', width: 120,  cellsalign: 'left', align: 'center', hidden: false,
          editable: false
          , cellclassname: null
          , exportable: true
        },
        // {
        //   text: 'Org Chart ID No.' , datafield: 'OrgChartIDNo', width: 120,  cellsalign: 'left', align: 'center', hidden: false,
        //   editable: false
        //   , cellclassname: null
        //   , exportable: true
        // },

        // {
        //   text: 'Work Location' , datafield: 'ServicesLocation', width: 90,  cellsalign: 'left', align: 'center', hidden: false,
        //   editable: false
        //   , cellclassname: null
        //   , exportable: true
        // },
        {
          text: 'PDO WBS' , datafield: 'PDOWBS', width: 120,  cellsalign: 'left', hidden: false,
          align: 'center', editable: false
          , cellclassname: null
          , exportable: true
        },
        {
          text: 'Cluster Code' , datafield: 'ClusterCode', width: 80,  cellsalign: 'left', hidden: false,
          align: 'center', editable: false
          , cellclassname: null
          , exportable: true
        },
        {
          text: 'CBS Code' , datafield: 'CBSCode', width: 90,  cellsalign: 'left', hidden: false,
          align: 'center', editable: false
          , cellclassname: null
          , exportable: true
        },
        {
          text: 'Category' , datafield: 'AFEType', width: 80,  cellsalign: 'left', hidden: false,
          align: 'center', editable: false
          , cellclassname: null
          , exportable: true
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
          , exportable: true
        },
    ];
    // if(this._isSNCLD === true){
    //   let rw1 =  {
    //     text: 'CBS Code' , datafield: 'CBSCode', width: 90,  cellsalign: 'left', align: 'center'
    //     , cellclassname: null, hidden: false, exportable: false, editable: false
    //   }
    //   rsCol.push(rw1);
    //   rw1 =  {
    //     text: 'Category' , datafield: 'AFEType', width: 80,  cellsalign: 'left', align: 'center'
    //     , cellclassname: null, hidden: false, exportable: false, editable: false
    //   }
    //   rsCol.push(rw1);
    // }

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
    // colAppr =
    // {
    //     text: 'Approver Name'
    //   , datafield: 'snc_mgr_name', columngroup: 'snc_mgr', width: 90,  cellsalign: 'center', align: 'center'
    //   , cellsrenderer: null, cellclassname: null, editable: false
    //   , hidden: false, exportable: false
    // }
    // rsCol.push(colAppr);
    // colAppr =
    // {
    //     text: 'Status'
    //   , datafield: 'snc_mgr_sts', columngroup: 'snc_mgr', width: 90,  cellsalign: 'center', align: 'center'
    //   , cellsrenderer: null, cellclassname: this.cellclass, editable: false
    //   , hidden: false, exportable: false
    // }
    // rsCol.push(colAppr);
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
    // colAppr =
    // {
    //     text: 'Approver Name'
    //   , datafield: 'clnt_mgr_name', columngroup: 'clnt_mgr', width: 90,  cellsalign: 'center', align: 'center'
    //   , cellsrenderer: null, cellclassname: this.cellclass, editable: false
    //   , hidden: false, exportable: false
    // }
    // rsCol.push(colAppr);
    // colAppr =
    // {
    //     text: 'Status'
    //   , datafield: 'clnt_mgr_sts', columngroup: 'clnt_mgr', width: 90,  cellsalign: 'center', align: 'center'
    //   , cellsrenderer: null, cellclassname: this.cellclass, editable: false
    //   , hidden: false, exportable: false
    // }
    // rsCol.push(colAppr);
    rsGrpCol.push({ text: 'Contractor Lead', align: 'center', name: 'snc_lead' })
    // rsGrpCol.push({ text: 'SNC Director', align: 'center', name: 'snc_mgr' })
    rsGrpCol.push({ text: 'Company Lead', align: 'center', name: 'clnt_lead' })
    //rsGrpCol.push({ text: 'ROO Contract Admin', align: 'center', name: 'clnt_mgr'})
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
  grdRendered = (): void =>  {
    console.log('Grid')
  }
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

  // getAllTSSts(pRptID) {
  //   this.srSPXLst.getWkTsAllSts(pRptID).subscribe(rs => {
  //     this.grdDtTSSts = rs.d.results;
  //   }, err => {
  //     console.log(err);
  //     this.srMsg.show(err, 'ERROR',
  //       {status: 'danger', destroyByClick: true, duration: 8000, hasIcon: true},
  //       );
  //   });
  // }

  dtBtnAction: any[] = [];
  actionBtnEnableDisc(pRolId) {
    if(this.grdData !== undefined){
      let crrSts = 0;
      const flt = this.grdData.filter(el => el.ActionGrpDisc == true)

      // IF ALL TIMESHEET APPROVED BY COST CONTROL THEN ENABLE LEAD SUBMIT BUTTON
      if (flt.length > 0) {
        crrSts = flt[0]['LkStatusCodeId'];
        //crrSts = flt[0]['LkStatusCode']['ID'];
          if (flt.length >= this.grdData.length) {
            this.srSPXLst.getWFNxtAction(crrSts, pRolId,this.srGlbVar.nxtActionGrpLead).subscribe(rs => {
              this.dtBtnAction = rs.d.results;
            });
          } else{
            this.dtBtnAction = [];
          }
        } else{
          this.dtBtnAction = [];
        }

      } else{
        this.dtBtnAction = [];
      }

  }

  onSubmitTSLead(pNxtStsID) {
    const calOff = this._calOff;
    const tsPrj = this._tsPrj;
    const fltr = this._dtWk.filter(a => a.Id == this._wkId);
    const fltAct = this.dtBtnAction.filter(a => a.LkNxtStatusCodeId == pNxtStsID);
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
            let vLkStsCodeID :number;
            let vCallOff :string;
            let vTSPrj :string;
            this.isProg = true;
            let observables: Observable<any>[] =<any>[];
            for (let i = 0; i < this.grdData.length; i++) {
              const el = this.grdData[i];
              const dtNow = this.srGlbVar.dateAheadFix(new Date());
              const rwSumSts ={
                LkStatusCodeId: pNxtStsID,
                // LkWkNameId: this._wkId,
                // LkUsrNameId: el.LkUsrNameId,
                LastActDt: dtNow,
                LastRmks: this.frmGrp.controls['tsAppRmks'].value,
                LkActUsrNameId: this.srLoginInfo.loginId,
                LkActRolNameId: this._rolId,
                LogSts: 1
              }
              vLkStsCodeID=el.LkStatusCodeId;;
              vCallOff=el.CallOffNumber;
              vTSPrj=el.TSProject;
              observables.push(this.srSPXLst.UptWkTSDays(this.srLoginInfo.authCode,rwSumSts,el.DAYSID))
              //this.fnUpdSummary(rwSumSts,el.DAYSID)
              //this.uptChangeSts(fltr[0].WkName, pNxtStsID, el.LkUsrNameId, el.LkStatusCodeId, el.CallOffNO, el.TSPrj);
            }
            forkJoin(observables).subscribe(rsArr => {
              console.log('Request Array Done');
              this.fnSendEmail(fltr[0].WkName, pNxtStsID,vLkStsCodeID, this.frmGrp.controls['tsAppRmks'].value)
              this.isProg = false;
            });
          }
        });
    }
  }

  fnSendEmail(pTSName, pNxtStsID, pCurrStsID, pRmks){
      const flt = this.dtBtnAction.filter(a => a.LkNxtStatusCodeId == pNxtStsID);
      let dsNxtDesc = '';
      if (flt.length > 0) {
        dsNxtDesc = flt[0].NxtStatusDesc;
      }
      if(
        (pCurrStsID !== pNxtStsID) &&
        (flt[0].NxtStatusEmail != null)
        ){
          //console.log(this.expGrdAsJson());
          this.srSPXLst.addSendNxtStatusEmail(
            this.srLoginInfo.loginUsrName,dsNxtDesc,pNxtStsID,
            flt[0].NxtActOnlyToUsr,
            pTSName,this._wkId,this._usrId,
            flt[0].NxtStatusEmail,
            this.expGrdAsJson(),null,
            pRmks
            ,null,null
            )
      }
      this.srMsg.show(pTSName + ' - ' + dsNxtDesc + ' Successfully', 'Success',
      {status: 'success', destroyByClick: true, duration: 5000, hasIcon: true},
      );
      this.getTSData(this._wkId);
      this.reloadStatus();
  }

  fnUpdSummary(pSmryUpt,pDayId){
    //UPDATE USER SUMMARY TABLE STATUS
    this.srSPXLst.UptWkTSDays(this.srLoginInfo.authCode,pSmryUpt,pDayId).subscribe(rs =>{

    })
  }

  isStsUptCnt = 0;
  uptChangeSts(pTSName, pNxtStsID, pUsrNameId, pCurrStsID, pCallOff, pTSPrj) {
    this.isProg = true;
    const dtNow = this.srGlbVar.dateAheadFix(new Date());
    const rw = {
      CallOffNo: pCallOff,
      TSPrj: pTSPrj,
      SubmitDt: dtNow,
      Comments: this.frmGrp.controls['tsAppRmks'].value,
      LkStatusCodeId: pNxtStsID,
      LkWkNameId: this._wkId,
      LkTsUsrNameId: pUsrNameId,
      LkActionByUsrNameId: this.srLoginInfo.loginId,
      LkActionByRoleNameId: this._rolId,
    };
    const flt = this.dtBtnAction.filter(a => a.LkNxtStatusCodeId == pNxtStsID);
    this.srSPXLst.AddTSSts(this.srLoginInfo.authCode, rw).subscribe(rs => {
      this.isStsUptCnt = this.isStsUptCnt + 1;
      if (this.isStsUptCnt >= this.grdData.length) {
        if (rs !== null) {
          let dsNxtDesc = '';
          if (flt.length > 0) {
            dsNxtDesc = flt[0].NxtStatusDesc;
          }
          this.isProg = false;
          if(
            (pCurrStsID !== pNxtStsID) &&
            (flt[0].NxtStatusEmail != null)
            ){
              //console.log(this.expGrdAsJson());
              this.srSPXLst.addSendNxtStatusEmail(
                this.srLoginInfo.loginUsrName,dsNxtDesc,pNxtStsID,
                flt[0].NxtActOnlyToUsr,
                pTSName,this._wkId,this._usrId,
                flt[0].NxtStatusEmail,
                this.expGrdAsJson(),null,
                this.frmGrp.controls['tsAppRmks'].value
                ,null,null
                )
          }
          this.srMsg.show(pTSName + ' - ' + dsNxtDesc + ' Successfully', 'Success',
          {status: 'success', destroyByClick: true, duration: 5000, hasIcon: true},
          );
          this.getTSData(this._wkId);
          this.reloadStatus();
        }
      }
    }, err => {
      this.srMsg.show('Error adding PAAF, Please contact support' + err, 'Error',
        {status: 'danger', destroyByClick: true, duration: 8000, hasIcon: false},
        );
    });
  }

  expGrdAsJson() {
    const obj: any[] = [];
    const csv = this.grdData;
    for (let i = 0; i < csv.length; i++) {
      const el = csv[i];
      const rw = {};

      for (let j = 0; j < this.grdCol.length; j++) {
        if ((this.grdCol[j]['exportable'] !== false)) {
          if ((el[this.grdCol[j]['datafield']] !== null) && (el[this.grdCol[j]['datafield']] !== undefined)) {
            if(this.grdCol[j]['datafield'] == 'TotManDays'){
              rw[this.grdCol[j]['text']] = Math.round(el[this.grdCol[j]['datafield']] * 10) /10
            } else{
              rw[this.grdCol[j]['text']] = el[this.grdCol[j]['datafield']];
            }

          } else {
            rw[this.grdCol[j]['text']] = '';
          }
        }
      }

      obj.push(rw);
    }
    return obj;
  }

  dtAprSNCLd :any[]=[];
  dtAprSNCMgr :any[]=[];
  dtAprClntLd :any[]=[];
  dtAprClntMgr :any[]=[];
  getApproverDt(rolCode, isDllFlt){
    const objData :any[]=[];
    const dtReturn :any[]=[];
    const rsData = this.dtApproveDtl.filter(el => el.LkRoleName.RoleName == rolCode)
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
        let obj = rsData.filter(r => r.LkUsrName.ID == elID);
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

}
