import { Component, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import {  NbToastrService, NbDialogService,NbWindowService   } from '@nebular/theme';
import { FormGroup, FormBuilder } from '@angular/forms';
//import { jqxGridComponent } from 'jqwidgets-ng/jqxgrid';
import { jqxTreeGridComponent } from 'jqwidgets-ng/jqxtreegrid';
import { TsUcTsviewComponent } from '../ts-uc-tsview/ts-uc-tsview.component';

import { SPXlstService } from '../../../services/SPXlst.service';
import { GlbVarService } from '../../../../src/services/glbvar.service';
import { LogininfoService } from '../../../services/logininfo.service';
import { EnvService } from '../../../services/env.service';

@Component({
  selector: 'ngx-ts-uc-sts',
  templateUrl: './ts-uc-sts.component.html',
  styleUrls: ['./ts-uc-sts.component.scss']
})
export class TsUcStsComponent implements OnInit {

  @Input() inWeekID: number;
  @Input() inUserID: number;
  @Input() inRolID: number;
  @Input() inRolCode: string;
  @Input() inDtWk: any[] = [];
  @Input() inTitle: string;

  _wkId: number;
  _usrId: number;
  _rolId: number;
  _dtWk: any[] = [];
  _rolCode: string;

  isProg: boolean = false;
  slctStrtDt: Date;
  slctEndDt: Date;

  grdCol: any[];
  grdDA: any;
  grdData: any;
  grdColGrp: any;
  grdSource: any;
  //@ViewChild('grdTS', { static: false }) grdTS: jqxGridComponent;
  @ViewChild('grdTS', { static: false }) grdTS: jqxTreeGridComponent;

  dtPAFSts: any[] = [];
  dtEXIN: any[] = [];
  dtTSFilterSTs;
  dtTSWkSts;
  fltrEmp: any[] = [];

  constructor(
    private srSPXLst: SPXlstService,
    private srMsg: NbToastrService,
    private srGlbVar: GlbVarService,
    private srDialog: NbDialogService,
    public srLoginInfo: LogininfoService,
    private frmBuild: FormBuilder,
    public env: EnvService,
    private srWindow: NbWindowService
  ) { }

  ngOnInit(): void {
    this._wkId = this.inWeekID;
    this._dtWk = this.inDtWk;
    this._usrId = this.inUserID;
    this._rolId = this.inRolID;
    this._rolCode = this.inRolCode;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes.inWeekID)) {
        this._wkId = this.inWeekID;
        this._dtWk = this.inDtWk;
        this._usrId = this.inUserID;
        this._rolId = this.inRolID;
        this._rolCode = this.inRolCode;
        this.fnGrdLoadCol();
        this.getTSData(this.inWeekID);
    }
  }

  grdGetWidth() : any {
		if (document.body.offsetWidth < 850) {
			return '90%';
		} 	return 850;
	}

  _dtRolSts :any[]=[];
  getTSData(pRptID: number) {
    this.isProg = true;
    const dtGrdData =[];
    this.srSPXLst.getTSStatus(pRptID,this._rolId).subscribe(rs => {
      const dtTSPAFRw = rs[0].d.results;
      const dtTSDays = rs[1].d.results;
      const dtWKSts = rs[2].d.results;
      this._dtRolSts = rs[3].d.results;
      const dtRnR = rs[4].d.results;
      //REMOVE R&R EMPLOYEE FROM TIMESHEET SUBMISSION
      //GET THE JSON IS ARRAY STRING
      let vFltRnRID =''
      for (let i = 0; i < dtRnR.length; i++) {
        const el = dtRnR[i].LkEmployeeIDId;
        vFltRnRID = vFltRnRID +'|'+ el +'|';
      }
      //FILTER NOT IN THE STRING
      const dtTSPAF = dtTSPAFRw.filter(d => {
        const v = '|' + d.ID +'|';
        return !vFltRnRID.includes(v)
      })

      let rowCnt: number = 0;
      for (let i = 0; i < dtTSPAF.length; i++) {
        let elPAF = dtTSPAF[i];
        rowCnt = rowCnt+1;
        elPAF['SLNO'] =rowCnt;
        if(elPAF.LkUsrNameId){
          let fltSts = dtTSDays.filter(eSts => eSts.LkUsrNameId == elPAF.LkUsrNameId)
          fltSts.forEach(elDays => {
            for (const key in elDays) {
                if (elDays.hasOwnProperty(key)) {
                  if (key.includes('WDay')) {
                    elPAF[key] = elDays[key];
                  }
                  if (String(key) == 'ID') {
                    elPAF['DAYSID'] = elDays[key];
                  }
                }
            }
          });

          if(fltSts.length >0){
            elPAF['LkStatusCodeId']=fltSts[0]['LkStatusCodeId']
            elPAF['Created']= fltSts[0].Created
            const fltStsDtl = this._dtRolSts.filter(elf => elf.LkStatusCodeId == elPAF['LkStatusCodeId']);
            if (fltStsDtl.length > 0) {
              elPAF['IsAction'] = fltStsDtl[0].IsAction
              elPAF['TSStsDesc'] = fltStsDtl[0].Title;
              elPAF['IsVisible'] = true;
              elPAF['GrpActionType']= fltStsDtl[0].GrpActionType
            }
          } else{
            elPAF['Created']= null
          }
          if(elPAF['IsAction']){
            if(elPAF['IsAction'] == true){
              elPAF['IsActView'] ='Yes'
            } else{
              elPAF['IsActView'] ='No'
            }
          } else{
            elPAF['IsActView'] ='No'
          }
          fltSts = dtWKSts.filter(eSts => eSts.LkTsUsrNameId == elPAF.LkUsrNameId && eSts['LkActionByRoleName'].RoleName == this.srGlbVar.rolSNCDisLD)
          if(fltSts.length >0){
            elPAF['snc_ld_name'] = fltSts[fltSts.length - 1]['LkActionByUsrName'].FullName
            elPAF['snc_ld_sts'] = fltSts[fltSts.length - 1]['LkStatusCode'].StatusName
            elPAF['snc_ld_css']= fltSts[fltSts.length - 1]['LkStatusCode'].Css
          } else{
            elPAF['snc_mgr_name'] = null;
            elPAF['snc_mgr_sts'] = null;
            elPAF['snc_mgr_css'] = null;
          }
          fltSts = dtWKSts.filter(eSts => eSts.LkTsUsrNameId == elPAF.LkUsrNameId && eSts['LkActionByRoleName'].RoleName == this.srGlbVar.rolSNCMGR)
          if(fltSts.length >0){
            elPAF['snc_mgr_name'] = fltSts[fltSts.length - 1]['LkActionByUsrName'].FullName
            elPAF['snc_mgr_sts'] = fltSts[fltSts.length - 1]['LkStatusCode'].StatusName
            elPAF['snc_mgr_css']= fltSts[fltSts.length - 1]['LkStatusCode'].Css
          } else{
            elPAF['snc_mgr_name'] = null;
            elPAF['snc_mgr_sts'] = null;
            elPAF['snc_mgr_css'] = null;
          }
          fltSts = dtWKSts.filter(eSts => eSts.LkTsUsrNameId == elPAF.LkUsrNameId && eSts['LkActionByRoleName'].RoleName == this.srGlbVar.rolSNCMGR)
          if(fltSts.length >0){
            elPAF['clnt_ld_name'] = fltSts[fltSts.length - 1]['LkActionByUsrName'].FullName
            elPAF['clnt_ld_sts'] = fltSts[fltSts.length - 1]['LkStatusCode'].StatusName
            elPAF['clnt_ld_css']= fltSts[fltSts.length - 1]['LkStatusCode'].Css
          } else{
            elPAF['clnt_ld_name'] = null
            elPAF['clnt_ld_sts'] = null
            elPAF['clnt_ld_css'] = null;
          }
          fltSts = dtWKSts.filter(eSts => eSts.LkTsUsrNameId == elPAF.LkUsrNameId && eSts['LkActionByRoleName'].RoleName == this.srGlbVar.rolSNCMGR)
          if(fltSts.length >0){
            elPAF['clnt_mgr_name'] = fltSts[fltSts.length - 1]['LkActionByUsrName'].FullName
            elPAF['clnt_mgr_sts'] = fltSts[fltSts.length - 1]['LkStatusCode'].StatusName
            elPAF['clnt_mgr_css']= fltSts[fltSts.length - 1]['LkStatusCode'].Css
          } else{
            elPAF['clnt_mgr_name'] = null
            elPAF['clnt_mgr_sts'] = null
            elPAF['clnt_mgr_css'] = null;
          }
        } else{
          elPAF['IsActView'] ='No'
        }
        dtGrdData.push(elPAF)
      }
      this.isProg = false;
      this.grdData = dtGrdData;
      this.grdSource.localdata = this.grdData;
      //this.grdTS.updatebounddata();
      this.grdTS.updateBoundData();

      this.grdFnShowColByRol(this._rolCode);
    }, err => {
      console.log(err);
      this.srMsg.show(err, 'ERROR',
        {status: 'danger', destroyByClick: true, duration: 8000, hasIcon: true},
        );
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

  grdFnShowColByRol(pRolCode){
    console.log(pRolCode)
    if(pRolCode == this.srGlbVar.rolTSAdm){

      this.grdTS.hideColumn('snc_lead');
      this.grdTS.hideColumn('snc_mgr');
      this.grdTS.hideColumn('snc_ld_name');
      this.grdTS.hideColumn('snc_ld_sts');
      this.grdTS.hideColumn('snc_ld_css');
      this.grdTS.hideColumn('snc_mgr_name');
      this.grdTS.hideColumn('snc_mgr_sts');
      this.grdTS.hideColumn('snc_mgr_css');
      this.grdTS.hideColumn('clnt_ld_name');
      this.grdTS.hideColumn('clnt_ld_sts');
      this.grdTS.hideColumn('clnt_ld_css');
      this.grdTS.hideColumn('clnt_mgr_name');
      this.grdTS.hideColumn('clnt_mgr_sts');
      this.grdTS.hideColumn('clnt_mgr_css');
    } else{
      this.grdTS.showColumn('snc_lead');
      this.grdTS.showColumn('snc_mgr');
      this.grdTS.showColumn('snc_ld_name');
      this.grdTS.showColumn('snc_ld_sts');
      this.grdTS.showColumn('snc_ld_css');
      this.grdTS.showColumn('snc_mgr_name');
      this.grdTS.showColumn('snc_mgr_sts');
      this.grdTS.showColumn('snc_mgr_css');
      this.grdTS.showColumn('clnt_ld_name');
      this.grdTS.showColumn('clnt_ld_sts');
      this.grdTS.showColumn('clnt_ld_css');
      this.grdTS.showColumn('clnt_mgr_name');
      this.grdTS.showColumn('clnt_mgr_sts');
      this.grdTS.showColumn('clnt_mgr_css');
    }
  }

  grdDynCol(dtStrt: Date, dtEnd: Date) {
    const dyColPrefix = 'WDay';
    const rsDtFld = [
        { name: 'PAFID', type: 'number' },
        { name: 'DAYSID', type: 'number' },
        { name: 'SLNO', type: 'number' },
        { name: 'LkUsrNameId', type: 'number' },
        { name: 'LkCBSCodeId', type: 'number' },
        { name: 'LkWkNameId', type: 'number' },
        { name: 'CallOffNumber', type: 'string' },
        { name: 'TSProject', type: 'string' },
        { name: 'Name', type: 'string' },
        { name: 'PAAFJobTitle', type: 'string' },
        { name: 'OrgChartPositionTitle', type: 'string' },
        { name: 'OrgChartIDNo', type: 'string' },
        { name: 'ServicesLocation', type: 'string' },
        { name: 'PAAFNo', type: 'string' },
        { name: 'Rev', type: 'string' },
        { name: 'EmployeeID', type: 'string' },
        { name: 'DirectIndirec', type: 'string' },
        { name: 'EXLN', type: 'string' },
        { name: 'TotManDays', type: 'number' },
        { name: 'atchUrl', type: 'string' },
        { name: 'atchFileName', type: 'string' },
        { name: 'LkStatusCodeId', type: 'string' },
        { name: 'IsAction', type: 'number' },
        { name: 'IsActView', type: 'string' },
        { name: 'IsVisible', type: 'number' },
        { name: 'TSStsDesc', type: 'string' },
        { name: 'GrpActionType', type: 'string'},
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
        { name: 'EmployeeStatus', type: 'string'},
        { name: 'Created', type: 'date'}
    ];
    const rsCol = [
        {
          text: '##',datafield: 'ID', columngroup: null, width: 76,  cellsalign: 'center', align: 'center'
          ,cellsrenderer: null, cellclassname: null, editable: true, hidden: true, exportable: false
        },
        {
          text: 'Sl No',datafield: 'SLNO', columngroup: null, width: 40,  cellsalign: 'center', align: 'center'
          ,cellsrenderer: null, cellclassname: null, editable: false, hidden: false, exportable: true
          ,pinned: true
        },
        {
          text: 'View Detail', width: 80, cellsAlign: 'center', align: 'center', columnType: 'none' , sortable: false, dataField: 'btncol'
          , exportable: false, editable: false
          //, cellsRenderer: (row: number, columnfield: string, value: string | number, defaulthtml: string, columnproperties: any, rowdata: any): string => {
          , cellsRenderer: (row, dataField, cellValueInternal, rowdata, cellText): string => {
            const rw = rowdata;
            let desc ='N/A'
            if(rw.TSStsDesc)
              desc = 'Detail' //rw.TSStsDesc
            const strReturn =`<div id='grd_btn_id_${row}' grd-btn-desc='${desc}' grd-row-id='${row}'
            IsAction='${rw.IsAction}' class='csBtnBlue' LkUsrNameId='${rw.LkUsrNameId}' grd-btn-status ></div>`;
            if(rw.IsAction){
              if((rw.IsAction === true) &&
                (rw.GrpActionType == this.srGlbVar.nxtActionGrpUser)){
                return strReturn
              } else{

                return `<div id='grd_btn_id_${row}' grd-btn-desc='${desc}' grd-row-id='${row}'
                IsAction='false' class='csBtnBlue' LkUsrNameId='${rw.LkUsrNameId}' grd-btn-status ></div>`;
              }
            }
            return strReturn;
          }
          , cellclassname: this.cellclass
        },
        {
          text: 'Status' , datafield: 'TSStsDesc', width: 120,  cellsalign: 'center', align: 'center', hidden: false,
          editable: false, cellclassname: this.cellclass,
        },
        {
          text: 'Action Required' , datafield: 'IsActView', width: 80,  cellsalign: 'center', align: 'center', hidden: false,
          editable: false, cellclassname: this.cellclass,
        },
        {
          text: 'Call Off No.' , datafield: 'CallOffNumber', width: 80,  cellsalign: 'left', align: 'center', hidden: false,
          editable: false, cellclassname: null,
        },
        {
          text: 'Timesheet Project' , datafield: 'TSProject', width: 120,  cellsalign: 'left', align: 'center', hidden: false,
          editable: false, cellclassname: null,
        },
        {
          text: 'PAAF No.' , datafield: 'PAAFNo', width: 60,  cellsalign: 'left', align: 'center', hidden: false,
          editable: false, cellclassname: null,
        },
        {
          text: 'Rev' , datafield: 'Rev', width: 40,  cellsalign: 'left', align: 'center'
          , editable: false
          , cellclassname: null,
        },
        {
          text: 'Employee ID' , datafield: 'EmployeeID', width: 80,  cellsalign: 'left', align: 'center'
          , editable: false
          , cellclassname: null,
        },
        {
          text: 'Employee Name' , datafield: 'Name', width: 240,  cellsalign: 'left', align: 'center'
          , editable: false
          , cellclassname: null,
        },
        {
          text: 'Direct/Indirect' , datafield: 'DirectIndirec', width: 60,  cellsalign: 'left', align: 'center'
          , editable: false
          , cellclassname: null,
        },
        {
          text: 'EX/IN' , datafield: 'EXLN', width: 40,  cellsalign: 'left', align: 'center'
          , editable: false
          , cellclassname: null,
        },
        {
          text: 'PAAF Job Title' , datafield: 'PAAFJobTitle', width: 180,  cellsalign: 'left', align: 'center', hidden: true,
          editable: false
          , cellclassname: null,
        },
        {
          text: 'Org Chart Position Title' , datafield: 'OrgChartPositionTitle', width: 180,  cellsalign: 'left', hidden: true,
          align: 'center', editable: false
          , cellclassname: null,
        },
        {
          text: 'Org Chart ID No.' , datafield: 'OrgChartIDNo', width: 120,  cellsalign: 'left', align: 'center', hidden: true,
          editable: false
          , cellclassname: null,
        },
        {
          text: 'Work Location' , datafield: 'ServicesLocation', width: 90,  cellsalign: 'left', align: 'center', hidden: true,
          editable: false
          , cellclassname: null,
        },
        {
          text: 'Submitted Date' , datafield: 'Created', width: 70,  cellsalign: 'left', align: 'center', hidden: false, editable: false,
          cellsrenderer: null
          , cellclassname: null, exportable: false, cellsformat: 'dd-MMM-yy'
        },
        {
          text: 'Name', width: 90, cellsAlign: 'center', align: 'center', columnType: 'none' , sortable: false, dataField: 'snc_ld_name'
          , exportable: true, editable: false
          , cellclassname: null
          , columngroup: 'snc_lead', hidden: false
        },
        {
          text: 'Status', width: 60, cellsAlign: 'center', align: 'center', columnType: 'none' , sortable: false, dataField: 'snc_ld_sts'
          , exportable: true, editable: false
          , cellclassname: this.cellclass
          , columngroup: 'snc_lead', hidden: false
        },
        {
          text: 'Name', width: 90, cellsAlign: 'center', align: 'center', columnType: 'none' , sortable: false, dataField: 'snc_mgr_name'
          , exportable: true, editable: false
          , cellclassname: null
          , columngroup: 'snc_mgr', hidden: false
        },
        {
          text: 'Status', width: 60, cellsAlign: 'center', align: 'center', columnType: 'none' , sortable: false, dataField: 'snc_mgr_sts'
          , exportable: true, editable: false
          , cellclassname: this.cellclass
          , columngroup: 'snc_mgr', hidden: false
        },
        {
          text: 'Name', width: 90, cellsAlign: 'center', align: 'center', columnType: 'none' , sortable: false, dataField: 'clnt_ld_name'
          , exportable: true, editable: false
          , cellclassname: null
          , columngroup: 'clnt_lead', hidden: false
        },
        {
          text: 'Status', width: 60, cellsAlign: 'center', align: 'center', columnType: 'none' , sortable: false, dataField: 'clnt_ld_sts'
          , exportable: true, editable: false
          , cellclassname: this.cellclass
          , columngroup: 'clnt_lead', hidden: false
        },
        {
          text: 'Name', width: 90, cellsAlign: 'center', align: 'center', columnType: 'none' , sortable: false, dataField: 'clnt_mgr_name'
          , exportable: true, editable: false
          , cellclassname: null
          , columngroup: 'clnt_mgr', hidden: false
        },
        {
          text: 'Status', width: 60, cellsAlign: 'center', align: 'center', columnType: 'none' , sortable: false, dataField: 'clnt_mgr_sts'
          , exportable: true, editable: false
          , cellclassname: this.cellclass
          , columngroup: 'clnt_mgr', hidden: false
        },
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
            , datafield: WkID, columngroup: WkID, width: 76,  cellsalign: 'center', align: 'center'
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
    rsGrpCol.push({ text: 'SNC Lead', align: 'center', name: 'snc_lead' })
    rsGrpCol.push({ text: 'SNC Director', align: 'center', name: 'snc_mgr' })
    rsGrpCol.push({ text: 'ROO Lead', align: 'center', name: 'clnt_lead' })
    rsGrpCol.push({ text: 'ROO Director', align: 'center', name: 'clnt_mgr'})
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
    if(dataField =='IsActView'){
      if(rowData['IsActView'] == 'Yes'){
        return 'grdTxtRed';
      } else if(rowData['IsActView'] == 'No'){
        return 'grdTxtGreen';
      } else {
        return null
      }
    }
    return null
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
      const uglyEditButtons = jqwidgets.createInstance('.csBtnBlue', 'jqxButton', { width: 70, height: 18, value: 'Edit' });
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
            // flattenEditButtons[i]._text.outerHTML = flattenEditButtons[i].field.getAttribute('grd-btn-desc');
            flattenEditButtons[i]._text.innerHTML = flattenEditButtons[i].field.getAttribute('grd-btn-desc');
            const btnId = flattenEditButtons[i].field.getAttribute('id');
            flattenEditButtons[i].addEventHandler('click', (event: any): void => {
                this.grdOnAction(event, btnId, flattenEditButtons[i]);
            });
          }
      }
    }
  }

  rowKey: number = -1;
  grdRowClick(event: any): void {
      this.rowKey = event.args.key;
      console.log(this.rowKey);
  }

  grdOnAction($event, btnId, obj) {
    //const rw = this.grdTS.getrowdata(this.rowKey);
    const rw = this.grdTS.getRow(this.rowKey);;

    this.srWindow.open(TsUcTsviewComponent,
      {
        title:  'Timesheet - ' + this._dtWk.filter( el => el.ID == this.inWeekID)[0].WkName,
        context: {
          inWeekID: this._wkId,
          inUserID:  rw['LkUsrNameId'],
          inRolID: this._rolId
        },
        hasBackdrop: true, closeOnBackdropClick: false,
        closeOnEsc : false, windowClass:'nbWindowClass'
      })
      .onClose.subscribe(rs => {

        this.isProg = true
        this.srSPXLst.getWkTSDaysSmry(this._wkId,null,null,rw['LkUsrNameId']).subscribe(rs =>{
          const dt = rs.d.results
          if(dt.length >0){
            const intCodId = dt[0]['LkStatusCodeId']
            const fltStsDtl = this._dtRolSts.filter(elf => elf.LkStatusCodeId == intCodId);
            if (fltStsDtl.length > 0) {
              let rwObj = this.grdData.filter(el => el.LkUsrNameId == rw['LkUsrNameId'])[0];
              rwObj['IsAction'] = fltStsDtl[0].IsAction
              rwObj['TSStsDesc'] = fltStsDtl[0].Title
              rwObj['IsVisible'] = true
              rwObj['GrpActionType'] = fltStsDtl[0].GrpActionType
              if(fltStsDtl[0].IsAction){
                if(fltStsDtl[0].IsAction == true){
                  rwObj['IsActView'] ='Yes'
                } else{
                  rwObj['IsActView'] ='No'
                }
              } else{
                rwObj['IsActView'] ='No'
              }
              this.grdSource.localdata = this.grdData;
              this.grdTS.updateBoundData();
              this.grdFnShowColByRol(this._rolCode);
            }
          }
          this.isProg = false
        })
      })
    // this.srDialog.open(TsUcTsviewComponent,
    //   {
    //     context: {
    //       inWeekID: 9,
    //       inUserID:  rw['LkUsrNameId'],
    //       inRolID: 39
    //     },
    //     hasBackdrop: true, closeOnBackdropClick: false,
    //     closeOnEsc : true
    //   })
    //   .onClose.subscribe(rs => {
    //     console.log(rs)
    //   })
  }



}
