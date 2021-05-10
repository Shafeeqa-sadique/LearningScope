import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { ValidationService } from '../../validators/validation.service';
import { LogininfoService } from '../../../../src/services/logininfo.service';
import { VowdService } from '../../../services/vowd.service';
import {  NbToastrService, NbDialogService  } from '@nebular/theme';
import { ConfirmdialogComponent } from '../modal-overlays/confirmdialog/confirmdialog.component';
import { isNumeric } from 'rxjs/internal-compatibility';
import { jqxTreeGridComponent } from 'jqwidgets-ng/jqxtreegrid';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'ngx-vowd-generate',
  templateUrl: './vowd-generate.component.html',
  styleUrls: ['./vowd-generate.component.scss'],
  providers: [ValidationService],
})
export class VowdGenerateComponent implements OnInit {
  public FrmGrpVowd: FormGroup;
  grdData: any[];
  source: any;
  dataAdapter: any;
  @ViewChild('grdVOWD', { static: false }) grdVOWD: jqxTreeGridComponent;
  xlLinkURL: string = '';
  isCopied1: boolean;

  constructor(
    private frmBuildVowd: FormBuilder,
    private srLoginInfo: LogininfoService,
    private srVowd: VowdService,
    private srMsg: NbToastrService,
    private srDialog: NbDialogService,
  ) { }

  ngOnInit(): void {
    this.prepareOrderForm();
  }

  grdGetWidth(): any {
    if (document.body.offsetWidth < 850) {
      return '100%';
    }
    return '100%';
  }


  grdColumns: any[] = [
    { text: '##', datafield: 'id', width: 30, cellsalign: 'center', align: 'center' , hidden: true, exportable: true },
    // { text: "Sl No", datafield: "sl_no", width:200, cellsalign: 'left', align: 'center' , columntype: 'textbox'},
    // { text: "CBS code", datafield: "parent_sl_no", width:100,cellsalign: 'left', align: 'center' , columntype: 'textbox'},
    { text: 'Code / PAF No' , datafield: 'code',   cellsalign: 'left', align: 'center', columntype: 'textbox' },
    { text: 'Name' , datafield: 'name', width: 120, cellsalign: 'left', align: 'center', columntype: 'template'},
    { text: 'Total Hours', datafield: 'tot_hrs', width: 100,  cellsalign: 'right', align: 'center' , cellsformat: 'd', columntype: 'textbox'},
    { text: 'Total Days' , datafield: 'tot_day_count', width: 100,  cellsalign: 'right', align: 'center' , cellsformat: 'd', columntype: 'textbox'},
    { text: 'Contract Rate' , datafield: 'ContractRate', width: 120,  cellsalign: 'right', align: 'center' , cellsformat: 'c', columntype: 'textbox'},
    { text: 'Transport Rate' , datafield: 'TransportRate', width: 120,  cellsalign: 'right', align: 'center' , cellsformat: 'c', columntype: 'textbox'},
    { text: 'Total Contract Rate' , datafield: 'TotalContractRate', width: 130, cellsalign: 'right', align: 'center' , cellsformat: 'c', columntype: 'textbox'},
    { text: 'Total Transport Rate' , datafield: 'TotalTransportRate', width: 130, cellsalign: 'right', align: 'center' , cellsformat: 'c', columntype: 'textbox'},
  ];

  rendered = (): void => {
    if (this.grdData.length > 0) {
      const uglyEditButtons = jqwidgets.createInstance('.editButton', 'jqxButton', { width: 60, height: 24, value: 'Edit' });
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
              flattenEditButtons[i].addEventHandler('click', (event: any): void => {
                 // this.editClick(event);
              });
          }
      }
    }

}

evtGrdExportXL() {
  this.grdVOWD.expandAll();
  this.grdVOWD.exportData('xls');
}


  /* ----------------------------- PREPARE FORM FOR CREATE ORDER ---------------------------- */

  prepareOrderForm() {
    this.FrmGrpVowd = this.frmBuildVowd.group({
      cutOfDtStrt: [null, [ValidationService.requiredValidator]],
      cutOfDtEnd: [null, [ValidationService.requiredValidator]],
    }, { validator: ValidationService.compareStrtEnd  });
  }

  getFormatDate(dt) {
    const date = dt;
    const formattedDate = date.toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric',
    }).replace(/ /g, '-');
    return formattedDate;
  }
  isForeDelete: number = 0;
  onGenerateRpt() {

    if (this.FrmGrpVowd.valid) {
      const data = {
        p_vowd_rpt_dt : this.FrmGrpVowd.controls.cutOfDtStrt.value,
        p_vowd_f_dt : this.FrmGrpVowd.controls.cutOfDtEnd.value,
        p_force_delete : this.isForeDelete,
        p_usr_id:  this.srLoginInfo.loginId,
      };

      this.xlLinkURL = environment.apiReportURL + '/api/report/RptVOWDByMonth?ReportMonth=' + this.getFormatDate(this.FrmGrpVowd.controls.cutOfDtStrt.value);
      console.log(data);
      const dt = data;
      this.srVowd.uptGenerateRpt(dt).subscribe( rs => {
        console.log(rs);
        if (rs && rs['code'] == 200) {
          this.grdData = rs['data'];
          this.prepareOrderForm();
          this.srMsg.show(rs['message'], 'Success',
            {status: 'success', destroyByClick: true, duration: 5000, hasIcon: true},
            );
        } else if (rs && rs['code'] == 300) {
          this.srDialog.open(ConfirmdialogComponent,
            {
              context: {
                IsConfirm: true,
                title: 'Confirm',
                message: rs['message'],
              },
            })
            .onClose.subscribe(result => {
              if (result == true) {
                this.isForeDelete = 1;
                this.onGenerateRpt();
              }
            });

        } else {
          console.log(rs['message']);
          this.srMsg.show(rs['message'], 'Error',
          {status: 'danger', destroyByClick: true, duration: 8000, hasIcon: false},
          );
        }
        if ((rs['code'] == 200) || (rs['code'] == 300)) {
          this.grdData = rs['data'];
          console.log(this.grdData);
          this.source = {
                        localdata: this.grdData,
                        dataType: 'json',
                        datafields: [
                          { name: 'sl_no', type: 'string' },
                          { name: 'parent_sl_no', type: 'string' },
                          { name: 'code', type: 'string' },
                          { name: 'name', type: 'string' },
                          { name: 'tot_hrs', type: 'number' },
                          { name: 'tot_day_count', type: 'number' },
                          { name: 'ContractRate', type: 'number' },
                          { name: 'TransportRate', type: 'number' },
                          { name: 'TotalContractRate', type: 'number' },
                          { name: 'TotalTransportRate', type: 'number' },
                        ],
                        hierarchy:
                        {
                            keyDataField: { name: 'sl_no' },
                            parentDataField: { name: 'parent_sl_no' },
                        },
                        id: 'id',
                        pagesize: 150,
                      };
          this.dataAdapter = new jqx.dataAdapter(this.source);

        }
      });
    } else {
      this.validateAllFields(this.FrmGrpVowd);
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


  listOnSelect(event: any): void {
      if (event.args) {
          const item = event.args.item;
          if (item) {
              const valueElement = document.createElement('div');
              valueElement.innerHTML = `Value: ${item.value}`;
              const labelElement = document.createElement('div');
              labelElement.innerHTML = `Label: ${item.label}`;
          }
      }
  }
}
