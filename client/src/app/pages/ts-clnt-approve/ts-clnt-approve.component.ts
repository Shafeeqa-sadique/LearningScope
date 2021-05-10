import { Component, OnInit, ViewChild  } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { jqxProgressBarComponent } from 'jqwidgets-ng/jqxprogressbar';
import { jqxGridComponent } from 'jqwidgets-ng/jqxgrid';
import {  NbToastrService, NbDialogService  } from '@nebular/theme';

import { TimesheetService } from '../../../services/timesheet.service';
import { ConfirmdialogComponent } from '../modal-overlays/confirmdialog/confirmdialog.component';
import { SPXlstService } from '../../../services/SPXlst.service';
import { SPXUserInfoService } from '../../../services/SPXuserinfo.service';
import { LogininfoService } from '../../../../src/services/logininfo.service';
import { ValidationService } from '../../validators/validation.service';

@Component({
  selector: 'ngx-ts-clnt-approve',
  templateUrl: './ts-clnt-approve.component.html',
  styleUrls: ['./ts-clnt-approve.component.scss'],
})
export class TsClntApproveComponent implements
OnInit  {

  public frmGroup: FormGroup;
  dtWkTimesheet: any = [];
  dtDepart: any = [];
  dataAdapter: any;
  grdData: any[];
  source: any;
  slctStrtDt: Date;
  slctEndDt: Date;
  slctDept: string;
  isSubmitOk: boolean = false;
  grdColumns: any = [];
  grdColGrp: any = [];
  grdColType: any = [];
  @ViewChild('jdxPrg', { static: false }) jdxPrg: jqxProgressBarComponent;
  @ViewChild('grdTS', { static: false }) grdTS: jqxGridComponent;
  loginRoleID: string;
  dtDllDpt: any = [];

  constructor(
    private srTimesheet: TimesheetService,
    private frmBuild: FormBuilder,
    private srMsg: NbToastrService,
    private srDialog: NbDialogService,
    private srSPXLst: SPXlstService,
    private srLoginInfo: LogininfoService,
    private srUserInfo: SPXUserInfoService,

  ) { }

  ngOnInit(): void {

    this.prepareForm();
    this.getTsName();
    this.getDepart(this.srLoginInfo.RoleId[0]);

  }

  grdGetWidth(): any {
    if (document.body.offsetWidth < 850) {
      return '100%';
    }
    return '100%';
  }

  prgBarRenderText = (text, value) => {
    if (value < 55) {
        return '<span class="jqx-rc-all" style="color: #333;">' + text + '</span>';
    }
    return '<span class="jqx-rc-all" style="color: #fff;">' + text + '</span>';
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

   /* ----------------------------- PREPARE FORM ---------------------------- */
  prepareForm() {
    this.frmGroup = this.frmBuild.group({
      tsName: [null],
      tsDepart: [this.slctDept],
      dtFrom: [null],
      dtTo: [null],
      tsCmt: [null, ValidationService.requiredValidator],
    });
  }

     /* ------------------------ VALIDATE ALL FORM FIELDS ------------------------ */

     validateAllFields(formGroup: FormGroup) {

      Object.keys(formGroup.controls).forEach(field => {
          const control = formGroup.get(field);
          if (control instanceof FormControl) {
              control.markAsTouched({ onlySelf: true });
          } else if (control instanceof FormGroup) {
              this.validateAllFields(control);
          }
      });
    }
  setStrtEndDt(RptID) {
    const filtered = this.dtWkTimesheet.filter(a => a.Id == RptID);
    this.slctStrtDt = filtered[0].start_dt;
    this.slctEndDt = filtered[0].end_dt;
    this.frmGroup.controls['dtFrom'].setValue(this.formatDate(this.slctStrtDt));
    this.frmGroup.controls['dtTo'].setValue(this.formatDate(this.slctEndDt));
  }
  onSelectTsName(value: Date) {
    this.setStrtEndDt(value);
    this.grdColType = null;
    this.frmGroup.controls['tsDepart'].setValue(null);
    this.grdData = null;
  }

  onSelectDept(value: string) {
    this.slctDept = value;
    this.grdColType = null;
    const RptID = this.frmGroup.controls['tsName'].value;
    this.grdGetData(this.slctStrtDt, this.slctEndDt, RptID);
  }

  getTsName() {
    this.srSPXLst.getTSMaster(null).subscribe(rs => {
      this.dtWkTimesheet = rs.d.results;

      if (this.dtWkTimesheet.length > 0) {
        const dfDt = this.dtWkTimesheet[this.dtWkTimesheet.length - 1]['Id'];
        this.frmGroup.controls['tsName'].setValue(dfDt);
        this.setStrtEndDt(dfDt);
      }
      // if(rs && rs['code'] == 200){
      //   this.dtWkTimesheet = rs["data"];
      // }
    }, err => {
      console.log(err);
      this.srMsg.show(err, 'ERROR',
        {status: 'danger', destroyByClick: true, duration: 8000, hasIcon: true},
        );
    },
    );
  }

  getDepart(vRolId) {
    this.srSPXLst.getPrjCalOff(null, null, vRolId).subscribe(rs => {
      rs.d.results.forEach(e => {
        if (e.CallOffNO !== null && e.CallOffNO !== '' ) {
          const rw = {
            Id : e.Id,
            DispName: e.CallOffNO + '-' + e.TimesheetProject,
            CallOffNO : e.CallOffNO,
            TsPrj: e.TimesheetProject,
          };
          this.dtDllDpt.push(rw);
        }
      });
      // dtArr.forEach(e => {
      //   let rw ={
      //     DptName : e['Discipline']['Title']
      //   }
      //   this.dtDepart.push(rw);
      // });
    }, err => {
      console.log(err);
      this.srMsg.show(err, 'ERROR',
        {status: 'danger', destroyByClick: true, duration: 8000, hasIcon: true},
        );
    });


    // this.srUserInfo.getRoleDisc(vRoleID).subscribe(rs =>{
    //   let dtArr = rs.d.results;
    //   dtArr.forEach(e => {
    //     let rw ={
    //       DptName : e['Discipline']['Title']
    //     }
    //     this.dtDepart.push(rw);
    //   });
    // }, err=>{
    //   console.log(err);
    //   this.srMsg.show(err, "ERROR",
    //     {status:"danger",destroyByClick:true,duration:8000,hasIcon:true,}
    //     );
    // })
  }

  grdGetData(strtDt, endDt, RptID) {

    this.srSPXLst.getTSWKDetail(RptID).subscribe(rs => {
      const obj = this.srSPXLst.getTSGrdDetail(strtDt, endDt);
      this.grdColumns = obj['col'];
      this.grdColGrp = obj['colGrp'];
      this.grdColType = obj['colType'];
      this.grdData = rs.d.results;
      if (this.grdData.length > 0) {
        if (this.grdData[0]['APP_STATUS'] = 'Submitted') {
          this.isSubmitOk = true;

        } else {
          this.isSubmitOk = true;
        }
      } else {
        this.grdData = [];
        this.isSubmitOk = false;
        this.grdColType = null;
      }
      this.source = {
                    localdata: this.grdData,
                    dataType: 'json',
                    datafields : this.grdColType,
                    pagesize: 15,
                  };
      this.dataAdapter = new jqx.dataAdapter(this.source);


    }, err => {
      console.log(err);
      this.srMsg.show(err, 'ERROR',
        {status: 'danger', destroyByClick: true, duration: 8000, hasIcon: true},
        );
    });
  }

  onSubmitTS(pSts: boolean) {
    if (this.frmGroup.valid) {
      this.jdxPrg.value(0);
      const cmt = this.frmGroup.controls['tsCmt'].value;
      let sts = 'Reject';
      if (pSts) {
        sts = 'Approve';
      }
      const filtered = this.dtWkTimesheet.filter(a => a.start_dt == this.frmGroup.get('tsName').value);
      console.log(filtered);
      if (filtered) {
        this.srDialog.open(ConfirmdialogComponent,
          {
            context: {
              IsConfirm: true,
              title: sts + ' Confirm',
              message: 'Are you sure, you want to ' + sts + ' ( ' + filtered[0].WkName + ' ) timesheet?',
            },
          })
          .onClose.subscribe(result => {
            if (result == true) {
              const iRsCnt = 0;
              this.jdxPrg.value(2);
              for (let i = 0; i < this.grdData.length; i++) {

                const el = this.grdData[i];
                this.grdTS.setcellvalue(i, 'APP_STATUS', sts);
                this.grdTS.setcellvalue(i, 'CLIENT_COMMENTS', cmt);
              }
              this.jdxPrg.value(100);
            }
          });
      }
    } else {
      this.validateAllFields(this.frmGroup);
    }
  }

}
