import { Component, OnInit, Input, Output  } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NbDialogRef, NbToastrService } from '@nebular/theme';

import { SPXlstService } from '../../../../services/SPXlst.service';
import { GlbVarService } from '../../../../services/glbvar.service';
import { LogininfoService } from '../../../../services/logininfo.service';

@Component({
  selector: 'ngx-ts-cost-approval-dialog',
  templateUrl: './ts-cost-approval-dialog.component.html',
  styleUrls: ['./ts-cost-approval-dialog.component.scss'],
})
export class TsCostApprovalDialogComponent implements OnInit {

  constructor(
    protected ref: NbDialogRef<TsCostApprovalDialogComponent>,
    private srSPXLst: SPXlstService,
    private srGlbVar: GlbVarService,
    public srLoginInfo: LogininfoService,
    private srMsg: NbToastrService,
  ) { }
  @Input() inRowKey: number;
  @Input() inName: string;
  @Input() inWkId: string;
  @Input() inUsrId: string;
  @Input() inCallOff: string;
  @Input() inTSPrj: string;
  @Input() inLkStatusCodeId: number;
  @Input() inWkName: string;
  @Input() inSmryID: number =0;

  txtRmks = new FormControl('');
  txtName = new FormControl('');
  dtBtnAction: any[] = [];
  _pgRolID: number;

  ngOnInit(): void {
    this.txtName.patchValue(this.inName);
    const obj = this.srSPXLst.getMRolIDByRoleName(this.srGlbVar.rolTSCostCtrl);
    obj.then((rs) => {
      this._pgRolID = rs;
      this.getNxtAction(this.inLkStatusCodeId);
    });
    this.getPAFDtl(this.inUsrId);
  }



  dismiss() {
    const rs = {
      isSucess: null,
      stsDesc: null,
      rowKey: this.inRowKey,
      isCancel: true
    };
    this.ref.close(rs);
  }

  getNxtAction(pCurrStsID) {
    // GET NEXT ACTION DETAILS
    this.srSPXLst.getWFNxtAction(pCurrStsID, this._pgRolID, this.srGlbVar.nxtActionGrpUser).subscribe(rs2 => {
     this.dtBtnAction = rs2.d.results;
   });
  }



  _emailPAFInfo = [];
  getPAFDtl(usrId) {
    this.srSPXLst.getPAFReg(usrId).subscribe(rs => {
      const dt = rs.d.results;
      if (dt.length > 0) {
        const rw = {
          'PAAF No' : dt[dt.length - 1].PAAFNo + '-' + dt[dt.length - 1].Rev,
          'Name' : dt[dt.length - 1].Name,
          'Job Title': dt[dt.length - 1].PAAFJobTitle,
          'Discipline': dt[dt.length - 1].Discipline
        };
        this._emailPAFInfo.push(rw);
      }
  });
  }

  onSubmitTS(pNxtStsID) {
    const flt = this.dtBtnAction.filter(a => a.LkNxtStatusCodeId == pNxtStsID);
    const dtNow = this.srGlbVar.dateAheadFix(new Date());
    const rw = {
      CallOffNo: this.inCallOff,
      TSPrj: this.inTSPrj,
      SubmitDt: dtNow,
      Comments: this.txtRmks.value,
      LkStatusCodeId: pNxtStsID,
      LkWkNameId: this.inWkId,
      LkTsUsrNameId: this.inUsrId,
      LkActionByUsrNameId: this.srLoginInfo.loginId,
      LkActionByRoleNameId: this._pgRolID,
    };
    const rwSumSts ={
      LkStatusCodeId: pNxtStsID,
      LkWkNameId: this.inWkId,
      LkUsrNameId: this.inUsrId,
      LastActDt: dtNow,
      LastRmks: this.txtRmks.value,
      LkActUsrNameId: this.srLoginInfo.loginId,
      LkActRolNameId: this._pgRolID
    }
    this.fnUpdSummary(rwSumSts,this.inSmryID);
    this.srSPXLst.AddTSSts(this.srLoginInfo.authCode, rw).subscribe(rs => {
      if (rs !== null) {
        let dsNxtDesc = '';
        if (flt.length > 0) {
          dsNxtDesc = flt[0].NxtStatusDesc;
        }
        if (
          (this.inLkStatusCodeId !== pNxtStsID) &&
          (flt[0].NxtStatusEmail != null)
          ) {
          this.srSPXLst.addSendNxtStatusEmail(
            this.srLoginInfo.AlrtEmail, dsNxtDesc,
            pNxtStsID, flt[0].NxtActOnlyToUsr,
            this.inWkName, this.inWkId, this.inUsrId,
            flt[0].NxtStatusEmail,
            null,
            this._emailPAFInfo,
            this.txtRmks.value
            , null, null,
            );
        }
        const rs = {
          isSucess: true,
          stsNxtDesc: dsNxtDesc,
          rowKey: this.inRowKey,
        };
        this.ref.close(rs);
      }
    }, err => {
      this.srMsg.show('Error, Please contact support' + err, 'Error',
        {status: 'danger', destroyByClick: true, duration: 8000, hasIcon: false},
        );
    });
  }

  fnUpdSummary(pSmryUpt,pDayId){
    //UPDATE USER SUMMARY TABLE STATUS
    this.srSPXLst.UptWkTSDays(this.srLoginInfo.authCode,pSmryUpt,pDayId).subscribe(rs =>{

    })
  }
}

