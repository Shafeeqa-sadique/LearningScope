import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import {  NbToastrService  } from '@nebular/theme';


import { SPXlstService } from '../../../services/SPXlst.service';
import { GlbVarService } from '../../../../src/services/glbvar.service';
import { LogininfoService } from '../../../services/logininfo.service';
import { SPXUserInfoService } from '../../../services/SPXuserinfo.service';
//import { jqxTreeComponent } from 'jqwidgets-ng/jqxtree';
import { EnvService } from '../../../services/env.service';



@Component({
  selector: 'ngx-ts-admin',
  templateUrl: './ts-admin.component.html',
  styleUrls: ['./ts-admin.component.scss'],
})
export class TsAdminComponent implements OnInit {

  constructor(
    private frmBld: FormBuilder,
    private srGlbVar: GlbVarService,
    private srSPXLst: SPXlstService,
    private srMsg: NbToastrService,
    public srLoginInfo: LogininfoService,
    public env: EnvService,
    private srUserInfo: SPXUserInfoService
  ) {
    this.srUserInfo.getRefreshAuthToken();
   }

  frmGrp: FormGroup;
  frmGrpTS: FormGroup;
  dtWk: any[] = [];
  slctStrtDt: Date;
  slctEndDt: Date;
  dtPAFSts: any[] = [];
  dtEXIN: any[] = [];
  dtTSFilterSTs;
  dtTSWkSts;
  _pgRolID: number;
  _pgRolCode: string = this.srGlbVar.rolTSAdm;
  _tsStsIntialID: number;
  cmSlctWkID = null;
  cmSlctUsrID = null;
  isSubmitProg = false;

  treTotPAF: number = 0;
  treSrc;
  treDA;
  treData;
  treRecords;
  treDataRaw: any[] = [];
  //@ViewChild('trPAF', { static: false }) trPAF: jqxTreeComponent;

  ngOnInit(): void {
    this.prepareForm();
    this.loadUsrInfo();
    //this.getEMPSts();
    this.getTsName();
    const obj = this.srSPXLst.getMRolIDByRoleName(this._pgRolCode);
    obj.then((rs) => {
      this._pgRolID = rs;
      //this.getTSFilterSts(this._pgRolID);
    });

    const obj1 = this.srSPXLst.getMStsIDByStatusCode(this.srGlbVar.TSStsCodeIntial);
    obj1.then((rs) => {
      this._tsStsIntialID = rs;
    });

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

  /* ----------------------------- PREPARE FORM ---------------------------- */
  prepareForm() {
  this.frmGrp = this.frmBld.group({
      tsName: [null],
      dtFrom: [null],
      dtTo: [null],
    });
    this.frmGrpTS = this.frmBld.group({
      ddlPAF: [null],
      treTot: [null],
    });
  }

  onSelectTsName(value) {
    this.setStrtEndDt(value);
    this.fltrEmp = [];
    this.fltrStsId = null;
    this.cmSlctUsrID = null;
  }


  onTreSelect($event) {
    // console.log($event);
    // const slcNode = this.trPAF.getSelectedItem();
    // this.cmSlctUsrID = slcNode.value;
    // this.cmSlctWkID = this.frmGrp.controls['tsName'].value;
  }

  fltrEmp: any[] = [];
  onDllSelectEmp($event) {
    const str = JSON.parse(JSON.stringify($event));
   // let flt = {PAAFStatus:[$event[0],$event[1],$event[2],$event[3]]}
   // this.fltEmp = {EmployeeStatus:str}
   this.fltrEmp =  str;
    this.fnFltrPAF();
  }

  fltrStsId;
  onDllSelectSts($event) {
    const str = JSON.parse(JSON.stringify($event));
   // let flt = {PAAFStatus:[$event[0],$event[1],$event[2],$event[3]]}
   this.fltrStsId = str;
    this.fnFltrPAF();
  }
  fltrInEx;
  onDllSelectInEx($event) {
    const str = JSON.parse(JSON.stringify($event));
    this.fltrInEx = str;
     this.fnFltrPAF();
  }
  // FILTER THE TREE
  fnFltrPAF() {
    const fltr = {};
    if ((this.fltrStsId != undefined) || (this.fltrStsId != null)) {
      fltr['LkStatusCodeId'] = [this.fltrStsId];
    }
    if ((this.fltrEmp.length != 0)) {
      fltr['EmployeeStatus'] = this.fltrEmp;
    }
    if ((this.fltrInEx != undefined) || (this.fltrInEx != null)) {
      fltr['EXLN'] = [this.fltrInEx];
    }
    const r = this.treDataRaw.filter(x =>
      Object.keys(fltr).every(f =>
        fltr[f].some( z => z == x[f] )));
    this.treData = this.fnPAfReformat(r);
    this.treeConfig();
    // if ((this.trPAF !== undefined) || (this.trPAF !== null))
    //     this.trPAF.refresh();
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

  getTSCurrSts(slctWkId) {
    this.isSubmitProg = true;
    this.srSPXLst.getPAFnWkTSSts(slctWkId).subscribe(rsLst => {
      const dtPAF = rsLst[0].d.results;
      const dtTSWkSts = rsLst[1].d.results;
      for (let i = 0; i < dtPAF.length; i++) {

        const stsArr = dtTSWkSts.filter(el => el.LkTsUsrNameId == dtPAF[i].LkUsrNameId);
        let stsID ;
        if (stsArr.length <= 0)
          stsID = this._tsStsIntialID;
        else
          stsID = stsArr[0].LkStatusCodeId;

        dtPAF[i].LkStatusCodeId = stsID;
      }
      this.treDataRaw = dtPAF;

      this.treData = this.fnPAfReformat(this.treDataRaw);
      this.treeConfig();
      // if ((this.trPAF !== undefined) || (this.trPAF !== null))
      //   this.trPAF.refresh();

        this.isSubmitProg = false;
    });

  }



    // CONVERT TO PAF REGISTER AS PARENT CHILD
    fnPAfReformat(dtRs) {
      const result = [];
      const map = new Map();
      // GET DISTINCT TSPROJECT AND PUSH IT AS PARENT
      for (const item of this.treDataRaw) {
          if (!map.has(item.TSProject)) {
              map.set(item.TSProject, true);    // set any value to Map
              const lblArr =  dtRs.filter(v => v.TSProject === item.TSProject);
              const lblCnt = lblArr.length > 0 ? ' (<strong>' + lblArr.length + '</strong>)' : '';
              const lbl  = item.TSProject + lblCnt;
              result.push({
                  id: item.TSProject,
                  display: lbl,
                  parentid: null,
                  cat: 'TS',
                  value: null,
              });
          }
      }
      // ADD ALL
      this.treTotPAF = 0;
      for (const item of dtRs) {
        const rw = {
          id: item.ID,
          display: item.EmployeeID + ' - ' + item.Name,
          parentid: item.TSProject,
          cat: 'NM',
          value: item.LkUsrNameId,
        };
        result.push(rw);
        this.treTotPAF = this.treTotPAF + 1;
      }
      return result;
    }


  getTSFilterSts(pRolId) {
    this.srSPXLst.getTSStsByRol(null, pRolId, null, true).subscribe(rs => {
      const dt = rs.d.results;
      if (dt.length > 0) {
        this.dtTSFilterSTs = dt;
      }
    }, err => {
      console.log(err);
      this.srMsg.show(err, 'ERROR',
        {status: 'danger', destroyByClick: true, duration: 8000, hasIcon: true},
        );
    },
    );
  }



  getEMPSts() {
    this.srSPXLst.getMCode(this.srGlbVar.ddlCodeEmpSts).subscribe(rs => {
      this.dtPAFSts = rs.d.results;
      if (this.dtWk.length > 0) {
        const dfDt = this.dtWk[this.dtWk.length - 1]['Id'];
        this.frmGrp.controls['tsName'].setValue(dfDt);
        // this.onPrdSelect(this.slctStrtDt,this.slctEndDt,null);
      }
    }, err => {
      console.log(err);
      this.srMsg.show(err, 'ERROR',
        {status: 'danger', destroyByClick: true, duration: 8000, hasIcon: true},
        );
    },
    );
    this.srSPXLst.getMCode(this.srGlbVar.ddlCodeEXIN).subscribe(rs => {
      this.dtEXIN = rs.d.results;
    }, err => {
      console.log(err);
      this.srMsg.show(err, 'ERROR',
        {status: 'danger', destroyByClick: true, duration: 8000, hasIcon: true},
        );
    },
    );
  }

  getTsName() {
    this.srSPXLst.getTSMaster(null).subscribe(rs => {
      this.dtWk = rs.d.results;
      if (this.dtWk.length > 0) {
        const dfDt = this.dtWk[this.dtWk.length - 1]['Id'];
        this.frmGrp.controls['tsName'].setValue(dfDt);
        this.setStrtEndDt(dfDt);
        // this.onPrdSelect(this.slctStrtDt,this.slctEndDt,null);
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
    //this.getTSCurrSts(RptID);
    this.cmSlctWkID = RptID;
    const flt = this.dtWk.filter(a => a.Id == RptID);
    this.slctStrtDt = flt[0].start_dt;
    this.slctEndDt = flt[0].end_dt;
    this.frmGrp.controls['dtFrom'].setValue(this.srGlbVar.formatDate(this.slctStrtDt));
    this.frmGrp.controls['dtTo'].setValue(this.srGlbVar.formatDate(this.slctEndDt));
  }



  getWidth(): any {
    if (document.body.offsetWidth < 850) {
      return '100%';
    }
    return '100%';
  }

}
