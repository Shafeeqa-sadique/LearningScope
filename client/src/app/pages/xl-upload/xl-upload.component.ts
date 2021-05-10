import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { ValidationService } from '../../validators/validation.service';
import { PafXlService } from '../../../services/paf-xl.service';
import {  NbToastrService  } from '@nebular/theme';
import { jqxGridComponent } from 'jqwidgets-ng/jqxgrid';
import { LogininfoService } from '../../../../src/services/logininfo.service';
import { GlbVarService } from '../../../../src/services/glbvar.service';
import { SPXlstService } from '../../../services/SPXlst.service';

@Component({
  selector: 'ngx-xl-upload',
  templateUrl: './xl-upload.component.html',
  styleUrls: ['./xl-upload.component.scss'],
  providers: [ValidationService],
})
export class XlUploadComponent implements OnInit {

  fileToUpload: File = null;
  public uploadFrm: FormGroup;
  @ViewChild('grdPAF', { static: false }) grdPAF: jqxGridComponent;
  grdData: any;
  public dataAdapter: any;
  source: any;

  frmGroup: FormGroup;
  dtWk: any = [];
  slctStrtDt: Date;
  slctEndDt: Date;
  isSubmitProg: boolean = false;
  flName: string = '';

  constructor(
    private frmBuild: FormBuilder,
    private pafXLservice: PafXlService,
    private loginInfo: LogininfoService,
    private toastrService: NbToastrService,
    private srGlbVar: GlbVarService,
    private srMsg: NbToastrService,
    private srSPXLst: SPXlstService,
    ) { }

    ngOnInit(): void {
      this.prepareOrderForm();
      this.getTsName();
    }

    /* ----------------------------- PREPARE FORM FOR CREATE ORDER ---------------------------- */

    prepareOrderForm() {
      this.uploadFrm = this.frmBuild.group({
        cutOfDtStrt: [null, [ValidationService.requiredValidator]],
        cutOfDtEnd: [null, [ValidationService.requiredValidator]],
        XlTemplate: [null, [ValidationService.requiredValidator]],
        XlFile: [null, [ValidationService.requiredValidator]],
      }, { validator: ValidationService.compareStrtEnd  });

      this.frmGroup = this.frmBuild.group({
        tsName: [null],
        dtFrom: [null],
        dtTo: [null],
        XlTemplate: ['ORC', [ValidationService.requiredValidator]],
        XlFile: [null, [ValidationService.requiredValidator]],
      });
    }

    handleFileInputRMXL(files: FileList) {
      this.fileToUpload = files.item(0);
      this.flName = this.fileToUpload.name;
      this.frmGroup.controls['XlFile'].setValue(this.flName);
      console.log(this.flName);
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

  onSubmitRMXl() {
    // this.fileUploadService.postFile(this.fileToUpload).subscribe(data => {
    //   // do something, if upload success
    //   }, error => {
    //     console.log(error);
    //   });
    this.grdPAF.clear();
    if (this.frmGroup.valid) {
      // console.log(this.uploadFrm);
      const data = {
        spl_wk_id : this.frmGroup.controls.tsName.value,
        cutoff_start_dt : this.frmGroup.controls.dtFrom.value,
        cutoff_end_dt : this.frmGroup.controls.dtTo.value,
        file_name : this.fileToUpload.name,
        template:  this.frmGroup.controls.XlTemplate.value,
        user_name:  this.loginInfo.loginUsrName,
        usr_id : this.loginInfo.loginId,
        // file : this.uploadFrm.controls.
      };
      this.isSubmitProg = true;

      this.pafXLservice.update(data, this.fileToUpload).subscribe( rs => {
        this.isSubmitProg = false;
        if (rs && rs['code'] == 200) {

          this.flName = null;
          this.frmGroup.controls['XlFile'].patchValue(null);
          this.toastrService.show(rs['message'], 'Success',
            {status: 'success', destroyByClick: true, duration: 5000, hasIcon: true},
            );
        } else {
          console.log(rs['message']);
          this.grdGetData(rs['data']);
          this.toastrService.show(rs['message'], 'Error',
          {status: 'danger', destroyByClick: true, duration: 8000, hasIcon: false},
          );
        }
      });
    } else {
      this.validateAllFields(this.frmGroup);
    }

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

  grdGetData(result) {
     console.log(result);
      this.grdData = result;
      this.source  = {
        localdata: this.grdData,
        datatype: 'local',
        datafields: [
          { name: 'XL_ROW_NO', type: 'string' },
          { name: 'EMP_NO', type: 'string' },
          { name: 'UPLOAD_REMARKS', type: 'string' },
        ],
        pagesize: 15,
      };
      this.dataAdapter = new jqx.dataAdapter(this.source);

  }

  grdGetWidth(): any {
    if (document.body.offsetWidth < 850) {
      return '100%';
    }
    return '100%';
  }

  cellsrenderer = (row: number, columnfield: string, value: string | number, defaulthtml: string, columnproperties: any, rowdata: any): string => {
    // return '<span style="margin: 4px; float: ' + columnproperties.cellsalign + '; color: #ff0000;">' + this.formatMoney(value,1,".",",") + '</span>';
    return '<span style="margin: 7px; float: ' + columnproperties.cellsalign + '; color: #ff0000;">' + value  + '</span>';
  }

  grdColumns: any[] = [
    { text: 'XL Row NO', datafield: 'XL_ROW_NO', width: 80, cellsalign: 'center', align: 'center' , columntype: 'textbox'},
    { text: 'Employee NO' , datafield: 'EMP_NO', width: 180 , cellsalign: 'left', align: 'center', columntype: 'textbox'   },
    { text: 'Error Remarks' , datafield: 'UPLOAD_REMARKS',  cellsalign: 'left', align: 'center', columntype: 'textbox' , cellsrenderer: this.cellsrenderer },
  ];


  onSelectTsName(value) {
    this.setStrtEndDt(value);
    // this.frmReset();
    // this.onPrdSelect(this.slctStrtDt,this.slctEndDt,value);
    // this.getTSData();
  }

  setStrtEndDt(RptID) {
    const flt = this.dtWk.filter(a => a.Id == RptID);
    this.slctStrtDt = flt[0].start_dt;
    this.slctEndDt = flt[0].end_dt;
    this.frmGroup.controls['dtFrom'].setValue(this.srGlbVar.formatDate(this.slctStrtDt));
    this.frmGroup.controls['dtTo'].setValue(this.srGlbVar.formatDate(this.slctEndDt));
  }

}
