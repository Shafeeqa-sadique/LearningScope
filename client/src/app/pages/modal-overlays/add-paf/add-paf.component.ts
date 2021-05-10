import { Component, OnInit, Input, HostListener } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, AbstractControl} from '@angular/forms';
import { ValidationService } from '../../../validators/validation.service';
import { NbToastrService } from '@nebular/theme';
import { PafService } from '../../../../services/paf.service';
import { NbDialogRef } from '@nebular/theme';
import { SPXlstService } from '../../../../services/SPXlst.service';

@Component({
  selector: 'ngx-add-paf',
  templateUrl: './add-paf.component.html',
  styleUrls: ['./add-paf.component.scss'],
  providers: [PafService, ValidationService],
})
export class AddPafComponent implements OnInit {
  public frmGroup: FormGroup;
  @Input() title: string;
  innerHeight: number = 0;
  innerWidth: number = 0;
  innerHeightPerc: number = 0.75;
  isadded: boolean = false;
  dtPosition: any = [];
  dtTsPrj: any = [];
  dtEmpSts: any ;
  dtPafSts: any;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    const h = window.innerHeight;
    const w = window.innerWidth;
    this.innerHeight = h * this.innerHeightPerc;
    this.innerWidth = w * this.innerHeightPerc;
  }

  constructor(
    private frmBuild: FormBuilder,
    private pafService: PafService,
    private msgService: NbToastrService,
    protected ref: NbDialogRef<AddPafComponent>,
    private srSPXLst: SPXlstService,
  ) { }

  ngOnInit(): void {
    this.onResize(this);
    this.prepareForm();
    this.getDllInfo('CODE_POSITION');
    this.getDllInfo('CODE_TIMSHET_PRJ');
    this.getDllInfo('CODE_PF_EMP_STS');
    this.getDllInfo('CODE_PF_PAF_STS');
  }


  /* ----------------------------- PREPARE FORM ---------------------------- */
  prepareForm() {
    this.frmGroup = this.frmBuild.group({
       PAF_ID: [null]
      , PAAFNo: [null, [ValidationService.requiredValidator]]
      , Rev: [null, [ValidationService.requiredValidator, ValidationService.numberValidator]]
      , EmpID: [null, [ValidationService.requiredValidator]]
      , PAFDate: [null, [ValidationService.requiredValidator]]
      , Name: [null, [ValidationService.requiredValidator]]
      , Position: [null, [ValidationService.requiredValidator]]
      , ExpLevel: [null, [ValidationService.requiredValidator]]
      , TransportAllowance: [null, [ValidationService.requiredValidator]]
      , ContractNO: [null, [ValidationService.requiredValidator]]
      , CallOffNO: [null, [ValidationService.requiredValidator]]
      , CTRNO: [null, [ValidationService.requiredValidator]]
      , OrgChartIDNo: [null]
      , OrgChartPositionTitle: [null]
      , OCDepart: [null, [ValidationService.requiredValidator]]
      , OCSubDepartment: [null]
      , TimesheetProject: [null, [ValidationService.requiredValidator]]
      , ROOTimesheetProjectRef: [null]
      , SNCTimesheetProject_Ref: [null]
      , OvertimeReq: [null]
      , OvertimeReqRefer: [null]
      , EX_LN: [null, [ValidationService.requiredValidator]]
      , DirectIndirect: [null, [ValidationService.requiredValidator]]
      , ProjectAssign: [null]
      , Nationality: [null, [ValidationService.requiredValidator]]
      , RequestLetterNO: [null, [ValidationService.requiredValidator]]
      , AprrovalLetterNO: [null]
      , StaffAgency: [null]
      , ContractPositionTitle: [null]
      , Discipline: [null]
      , Category: [null]
      , KeyPersonnel: [null]
      , Project: [null]
      , ServicesLocation: [null]
      , StartDtActual: [null]
      , EffectiveDt: [null, [ValidationService.requiredValidator]]
      , PAAFEndDt: [null]
      , ContractRate: [null, [ValidationService.requiredValidator, ValidationService.numberValidator]]
      , OvertimePaid: [null]
      , DiscountedRate: [null]
      , PAAFStatus: [null, [ValidationService.requiredValidator]]
      , EmployeeStatus: [null, [ValidationService.requiredValidator]]
      , SubmittedDate: [null, [ValidationService.requiredValidator]]
      , ApprovedDate: [null ]
      , DePAAFDate: [null ]
      , DemobilizedDate: [null]
      , Remarks: [null]
      , InCntryRateMin: [null, [ValidationService.numberValidator]]
      , InCntryRate: [null, [ValidationService.numberValidator]]
      , OutCntryRateMin: [null, [ValidationService.numberValidator]]
      , OutCntryRate: [null, [ValidationService.numberValidator]]
      , AssignDetail: [null]
      , CVAttached: [null],
    }, { });
  }
   /* ------------------------ VALIDATE ALL FORM FIELDS ------------------------ */

  validateAllFields(formGroup: FormGroup) {
    console.log('Validation');
    Object.keys(formGroup.controls).forEach(field => {
        const control = formGroup.get(field);
        if (control instanceof FormControl) {
            control.markAsTouched({ onlySelf: true });
        } else if (control instanceof FormGroup) {
            this.validateAllFields(control);
        }
    });
  }

  dismiss() {
    this.ref.close(this.isadded);
  }

  getDllInfo(pCd) {
    this.srSPXLst.getMCode(pCd).subscribe(rs => {
      if ('CODE_POSITION' == pCd) {
        this.dtPosition = rs.d.results;
      }
      if ('CODE_TIMSHET_PRJ' == pCd) {
        this.dtTsPrj = rs.d.results;
      }
      if ('CODE_PF_EMP_STS' == pCd) {
        this.dtEmpSts = rs.d.results;
      }
      if ('CODE_PF_PAF_STS' == pCd) {
        this.dtPafSts = rs.d.results;
      }

    }, err => {
      console.log(err);
      this.msgService.show(err, 'ERROR',
        {status: 'danger', destroyByClick: true, duration: 8000, hasIcon: true},
        );
    });
  }


  adjustDateForTimeOffset(x) {
    console.log(x);
    if ((x !== null)) {
      const offsetMs = x.getTimezoneOffset() * 60000;
      return new Date(x.getTime() - offsetMs);
    } else {
      return x;
    }

  }

  addPAAF() {
    // console.log(this.frmGroup.value);
    // console.log(this.frmGroup.value.length);
    // Object.keys(this.frmGroup.controls).forEach(field => {
    //   const control = this.frmGroup.get(field);
    //   if((String(field).includes("Dt") === true) ||
    //     (String(field).includes("Date") === true)){
    //     console.log(field);
    //     // var date = new Date(control.value);
    //     // console.log(date);
    //     // let n = date.setMinutes(date.getTimezoneOffset());
    //     // console.log(n);
    //     console.log(control.value);
    //     var date = this.adjustDateForTimeOffset(control.value);
    //     console.log(date);
    //   }
    // });
    if (this.frmGroup.valid) {
      const data = {};
        Object.keys(this.frmGroup.controls).forEach(field => {
          const control = this.frmGroup.get(field);
          console.log(field);
          if ((String(field).includes('Dt') === true) ||
           (String(field).includes('Date') === true)) {
              data[field] = this.adjustDateForTimeOffset(control.value);
           } else {
              data[field] = control.value;
           }
        });
      // console.log(data);
      this.pafService.addPAFReg(data).subscribe(rs => {
        if (rs && rs['code'] == 200) {
          this.prepareForm();
          this.isadded = true;
          this.msgService.show(rs['message'], 'Success',
            {status: 'success', destroyByClick: true, duration: 5000, hasIcon: true},
            );
        } else {
          console.log(rs['message']);
          this.msgService.show(rs['message'], 'Error',
          {status: 'danger', destroyByClick: true, duration: 8000, hasIcon: false},
          );
        }

      }, err => {
        console.log(err);
        this.msgService.show(err, 'ERROR',
          {status: 'danger', destroyByClick: true, duration: 8000, hasIcon: true},
          );
        return false;
      });
    } else {
      this.validateAllFields(this.frmGroup);
    }
  }

}
