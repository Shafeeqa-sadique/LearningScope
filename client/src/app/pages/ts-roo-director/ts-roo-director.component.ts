import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import {  NbToastrService  } from '@nebular/theme';

import { SPXlstService } from '../../../services/SPXlst.service';
import { GlbVarService } from '../../../../src/services/glbvar.service';
import { LogininfoService } from '../../../services/logininfo.service';
import { SPXUserInfoService } from '../../../services/SPXuserinfo.service';
import { EnvService } from '../../../services/env.service';


@Component({
  selector: 'ngx-ts-roo-director',
  templateUrl: './ts-roo-director.component.html',
  styleUrls: ['./ts-roo-director.component.scss']
})
export class TsRooDirectorComponent implements OnInit {

  frmGrp: FormGroup;
  dtWk: any[] = [];
  slctStrtDt: Date;
  slctEndDt: Date;

  _pgRolID: number;
  _pgWkID: number;

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

  ngOnInit(): void {
    this.prepareForm();
     const obj = this.srSPXLst.getMRolIDByRoleName(this.srGlbVar.rolGCDrct);
     obj.then((rs) => {
       this._pgRolID = rs;
     });
     this.getTsName();
     this.loadUsrInfo();
   }


   /* ----------------------------- PREPARE FORM ---------------------------- */
   prepareForm() {
    this.frmGrp = this.frmBld.group({
        tsName: [null],
        dtFrom: [null],
        dtTo: [null],
      });
  }


  loadUsrInfo() {
    if (this.srLoginInfo.loginId) {
      const objUsr = this.srUserInfo.getLoginDtl();
      objUsr.then((rs) => {
        this.srLoginInfo.loginId = rs.loginId;
        this.srLoginInfo.loginFulName = rs.loginFulName;
        this.srLoginInfo.loginUsrName = rs.loginUsrName;
      });
    } else {

    }
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
    const flt = this.dtWk.filter(a => a.Id == RptID);
    this._pgWkID = RptID;
    this.slctStrtDt = flt[0].start_dt;
    this.slctEndDt = flt[0].end_dt;
    this.frmGrp.controls['dtFrom'].setValue(this.srGlbVar.formatDate(this.slctStrtDt));
    this.frmGrp.controls['dtTo'].setValue(this.srGlbVar.formatDate(this.slctEndDt));
  }

  onSelectTsName(value) {
    this.setStrtEndDt(value);
  }

}
