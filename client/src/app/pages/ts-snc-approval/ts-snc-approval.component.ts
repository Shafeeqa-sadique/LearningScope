import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { TimesheetService } from '../../../services/timesheet.service';
import {  NbToastrService, NbDialogService  } from '@nebular/theme';
import { jqxTreeComponent } from 'jqwidgets-ng/jqxtree';
import { jqxDropDownButtonComponent } from 'jqwidgets-ng/jqxdropdownbutton';

import { SPXUserInfoService } from '../../../services/SPXuserinfo.service';
import { SPXlstService } from '../../../services/SPXlst.service';
import { LogininfoService } from '../../../../src/services/logininfo.service';
 import { GlbVarService } from '../../../../src/services/glbvar.service';

@Component({
  selector: 'ngx-ts-snc-approval',
  templateUrl: './ts-snc-approval.component.html',
  styleUrls: ['./ts-snc-approval.component.scss'],
})
export class TsSncApprovalComponent implements OnInit {
  public frmGroup: FormGroup;
  dtWkTimesheet: any = [];
  dtDllDpt: any = [];
  dtRol: any = [];
  dataAdapter: any;
  grdData: any[];
  source: any;

  slctDept: string;
  isSubmitOk: boolean = false;
  // @ViewChild('jdxPrg', { static: false }) jdxPrg: jqxProgressBarComponent;
  // @ViewChild('grdTS') grdTS: jqxGridComponent;
  // grdColumns : any =[];
  // grdColGrp : any =[];
  // grdColType : any=[];
  // vStsSncLd='CODE_S01';
  // vStsSncMgr='CODE_S04';
  // vStsGCLd='CODE_S06';
  // vStsGCMgr='CODE_S08';

  dtWk: any = [];
  slctStrtDt: Date;
  slctEndDt: Date;
  _pgRolID: number;
  _wkID: number;
  _usrID: number;
  _calOff: string;
  _tsPrj: string;
  _rolCode: string = this.srGlbVar.rolSNCDisLD;

  treTotPAF: number = 0;
  treSrc;
  treDA;
  treData;
  treRecords;
  treDataRaw: any[] = [];
  @ViewChild('treID', { static: false }) treID: jqxTreeComponent;
  @ViewChild('treDll', { static: false }) treDll: jqxDropDownButtonComponent;

  constructor(
    private srTimesheet: TimesheetService,
    private frmBuild: FormBuilder,
    private srMsg: NbToastrService,
    private dialogService: NbDialogService,
    private srSPXLst: SPXlstService,
    private srLoginInfo: LogininfoService,
    private srUserInfo: SPXUserInfoService,
    private srGlbVar: GlbVarService,
  ) {
    const obj = this.srSPXLst.getMRolIDByRoleName(this.srGlbVar.rolSNCDisLD);
    obj.then((rs) => {
      this._pgRolID = rs;
    });
  }

  ngOnInit(): void {
    this.slctDept = '0';
    this.prepareForm();
    this.getTsName();
    this.loadUsrInfo();
  }
  grdGetWidth(): any {
    if (document.body.offsetWidth < 850) {
      return '100%';
    }
    return '100%';
  }

 /* ----------------------------- PREPARE FORM ---------------------------- */
 prepareForm() {

    this.frmGroup = this.frmBuild.group({
      tsName: [null],
      dtFrom: [null],
      dtTo: [null],
      tsDepart: [null],
      ctCallOff: [null],
      ctTSPrj: [null]
    });
  }


  getTsName() {
    this.srSPXLst.getTSMaster(null).subscribe(rs => {
      this.dtWk = rs.d.results;
      if (this.dtWk.length > 0) {
        const dfDt = this.dtWk[this.dtWk.length - 1]['Id'];
        this.frmGroup.controls['tsName'].setValue(dfDt);
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
    const flt = this.dtWk.filter(a => a.Id == RptID);
    this._wkID = RptID;
    this.slctStrtDt = flt[0].start_dt;
    this.slctEndDt = flt[0].end_dt;
    this.frmGroup.controls['dtFrom'].setValue(this.srGlbVar.formatDate(this.slctStrtDt));
    this.frmGroup.controls['dtTo'].setValue(this.srGlbVar.formatDate(this.slctEndDt));

  }

  loadUsrInfo() {
    if ((this.srLoginInfo.loginId === null) ||
     (this.srLoginInfo.loginId === undefined)) {
      const objUsr = this.srUserInfo.getLoginDtl();
      objUsr.then((rs) => {
        this.srLoginInfo.loginId = rs.loginId;
        this.srLoginInfo.loginFulName = rs.loginFulName;
        this.srLoginInfo.loginUsrName = rs.loginUsrName;
        this.getDepart(this.srLoginInfo.loginId);
        this._usrID = this.srLoginInfo.loginId;
      });
    } else {
      this.getDepart(this.srLoginInfo.loginId);
      this._usrID = this.srLoginInfo.loginId;
    }
  }
  getDepart(vUsrId) {
    this.srSPXLst.getPrjCalOff(null, null, vUsrId).subscribe(rs => {
      const dt = rs.d.results;
      const arr = this.srGlbVar.getDistinct(dt, 'Title');
      const rss = [];
      arr.forEach(e => {
        const rw = {
          CallOFF: e,
          TSPrjs: dt.filter(el => el.Title == e),
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

   // CONVERT TO CALL OFF & PROJECT AS PARENT CHILD
   fnTreFormat(dtRs) {
    const result = [];
    const map = new Map();
    // GET DISTINCT CALL OF AND PUSH IT AS PARENT
    const dtDis = this.srGlbVar.getDistinct(dtRs, 'Title');
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
      const lblArr =  dtRs.filter(v => v.Title === item.id);
      lblArr.forEach(el => {
        const rw = {
          id: el.ID,
          display: el.TSPrj,
          parentid: el.Title,
          cat: 'DISC',
          value: el.ID,
        };
        result.push(rw);
        this.treTotPAF = this.treTotPAF + 1;
      });
    }
    return result;
  }

  onSelectTsName(value) {
    // console.log("the selected value is " + value);
    this.setStrtEndDt(value);
  }

  cmSlctDeptTxt = '';
  onSelectDept(value) {
    this.slctDept = value;
    console.log(this.slctDept);
    const flt = this.dtDllDpt.filter(el => el.TSPrjs.some(s =>  s.Id == value ));
    if (flt.length > 0) {
      const da = flt[0].TSPrjs.filter(s => s.Id == value);
      this.cmSlctDeptTxt = flt[0].CallOFF + ' - ' + da[0].TSPrj;

      const wkID = this.frmGroup.controls['tsName'].value;

    } else {
      this.cmSlctDeptTxt = 'Select Options';
    }

  }

  onTreSelect($event) {
    const value = this.treID.getSelectedItem().value;
    this.slctDept = value;
    const flt = this.dtDllDpt.filter(el => el.TSPrjs.some(s =>  s.Id == value ));
    if (flt.length > 0) {
      const da = flt[0].TSPrjs.filter(s => s.Id == value);
      this.cmSlctDeptTxt = flt[0].CallOFF + ' - ' + da[0].TSPrj;
      this._calOff = flt[0].CallOFF;
      this._tsPrj = da[0].TSPrj;
      // this.frmGrpDtl.controls["ctCalOf"].patchValue(flt[0].CallOFF)
      // this.frmGrpDtl.controls["ctTSPrj"].patchValue(da[0].TSPrj)
      // let wkID = this.frmGrp1.controls['tsName'].value
      // this.getTSData(wkID,flt[0].CallOFF,da[0].TSPrj)
      if (this.treID && this.treDll) {
        // const item = this.treID.getItem(event.args.element);
        const dropDownContent = '<div style="position: relative; margin-left: 3px; margin-top: 4px;">' + this.cmSlctDeptTxt + '</div>';
        this.treDll.setContent(dropDownContent);
        this.treDll.close();
      }
      // this.fnLodAppr(flt[0].CallOFF,da[0].TSPrj,this.srGlbVar.rolSNCDisLD,"ctSncLd",this._wkID);
      // this.fnLodAppr(flt[0].CallOFF,da[0].TSPrj,this.srGlbVar.rolSNCMGR,"ctSncMgr",this._wkID);
      // this.fnLodAppr(flt[0].CallOFF,da[0].TSPrj,this.srGlbVar.rolGCDisLD,"ctClntLd",this._wkID);
      // this.fnLodAppr(flt[0].CallOFF,da[0].TSPrj,this.srGlbVar.rolGCMGR,"ctClntMgr",this._wkID);
    } else {
      this.cmSlctDeptTxt = 'Select Options';
    }
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

  fnLodAppr(vCalOf, vTs, rolCod, frmCtlApr, pWkId) {
    // CHECK IF TS ALREADY APPROVED THEN GET THE DETAILS

    this.srSPXLst.getTSWkStsByTSPrjRol(vCalOf, vTs, rolCod, 1, null, pWkId).subscribe(rs2 => {
        if (rs2.d.results.length == 0) {
          this.srSPXLst.getUsrByTSPrjRol(vCalOf, vTs, rolCod).subscribe(rs => {
            let dtTSUsr: any = [];
            dtTSUsr = rs.d.results;
            let vUsr = '';
            dtTSUsr.forEach(e => {
              vUsr = vUsr + e.LkUsrName.FullName + ';';
              });
            // if(vUsr.length >0)
              // this.frmGrpDtl.controls[frmCtlApr].setValue(vUsr)
          });
        } else {
          let dt: any = [];
          dt = rs2.d.results;
          // this.frmGrpDtl.controls[frmCtlApr].setValue(dt[0].LkUsrName.FullName)
          // this.frmGroup.controls[frmCtlSts].setValue(dt[0].LkStatusCode.StatusName)
          // this.frmGroup.controls[frmCtlDt].setValue(this.srGlbVar.formatDate(dt[0].SubmitDt))
        }
    });
  }




}

