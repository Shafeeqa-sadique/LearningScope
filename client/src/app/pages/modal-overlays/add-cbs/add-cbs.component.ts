import { Component, OnInit, ViewChild, Input, HostListener  } from '@angular/core';
import {  NbToastrService, NbDialogService  } from '@nebular/theme';
import { CbsService } from '../../../../services/cbs.service';
import { jqxDropDownButtonComponent } from 'jqwidgets-ng/jqxdropdownbutton';
import { jqxTreeComponent } from 'jqwidgets-ng/jqxtree';
import { FormGroup, FormBuilder, FormControl} from '@angular/forms';
import { NbDialogRef } from '@nebular/theme';
import { ValidationService } from '../../../validators/validation.service';

@Component({
  selector: 'ngx-add-cbs',
  templateUrl: './add-cbs.component.html',
  styleUrls: ['./add-cbs.component.scss'],
  providers: [ValidationService],
})
export class AddCbsComponent implements OnInit {
  cbsData: any[];
  dataAdapter: any;
  source: any;
  records: any;
  parentSelectedCBS: any;
  @ViewChild('TASK_SL_NO_PARENT_TREE', { static: false }) myTree: jqxTreeComponent;
  @ViewChild('TASK_SL_NO_PARENT', { static: false }) myDropDownButton: jqxDropDownButtonComponent;
  public frmGroup: FormGroup;
  innerHeight: number = 0;
  innerWidth: number = 0;
  innerHeightPerc: number = 0.75;
  isadded: boolean = false;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    const h = window.innerHeight;
    const w = window.innerWidth;
    this.innerHeight = h * this.innerHeightPerc;
    this.innerWidth = w * this.innerHeightPerc;
    console.log(h);
    console.log(this.innerHeight);
  }

  constructor(
    private cbsSr: CbsService,
    private msgService: NbToastrService,
    private frmBuild: FormBuilder,
    protected ref: NbDialogRef<AddCbsComponent>,
    ) { }

  ngOnInit(): void {
    this.onResize(this);
    this.getCbsData();
    this.prepareForm();
  }

    /* ----------------------------- PREPARE FORM ---------------------------- */
    prepareForm() {
      this.frmGroup = this.frmBuild.group({
        TASK_CODE: [null, [ValidationService.requiredValidator]],
        TASK_DESC: [null, [ValidationService.requiredValidator]],
        TASK_SL_NO: [null, [ValidationService.requiredValidator]],
        TASK_SL_NO_PARENT: [this.parentSelectedCBS],
        TASK_CATEGORY: [null, [ValidationService.requiredValidator]],
        SORT_ORDER: [null, [ValidationService.requiredValidator, ValidationService.numberValidator]],
      }, { });
    }

  dismiss() {
    this.ref.close(this.isadded);
  }

  addCBS() {
    if (this.frmGroup.valid) {
      const data = {};
        Object.keys(this.frmGroup.controls).forEach(field => {
          const control = this.frmGroup.get(field);
          data[field] = control.value;
        });
      const value = this.myDropDownButton.getContent();
      console.log(value);
      console.log(data);
      this.cbsSr.addCBS(data).subscribe(rs => {
        if (rs && rs['code'] == 200) {
          this.prepareForm();
          this.getCbsData();
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

  getCbsData() {
    this.cbsSr.getCBS().subscribe(result => {
      this.cbsData = result['data'];
      console.log(this.cbsData);
      const row = {
        'TASK_SL_NO': null,
        'TASK_SL_NO_PARENT': null,
        'TASK_CODE': null,
        'CBS_ID': 0,
        'DISPLAY_CODE': 'ROOT',
      };
      if (this.cbsData.length <= 0)
        this.cbsData.push(row);
        // this.cbsData = [];
      this.source = {
        datatype: 'json',
        datafields: [
            { name: 'TASK_SL_NO' },
            { name: 'TASK_SL_NO_PARENT' },
            { name: 'TASK_CODE' },
            { name: 'CBS_ID' },
            { name: 'DISPLAY_CODE'},
        ],
        id: 'TASK_SL_NO',
        localdata: this.cbsData,
    };
      // create data adapter & perform Data Binding.
    this.dataAdapter = new jqx.dataAdapter(this.source, { autoBind: true });
    // get the tree items. The first parameter is the item's id. The second parameter is the parent item's id. The 'items' parameter represents
    // the sub items collection name. Each jqxTree item has a 'label' property, but in the JSON data, we have a 'text' field. The last parameter
    // specifies the mapping between the 'text' and 'label' fields.
    this.records = this.dataAdapter.getRecordsHierarchy('TASK_SL_NO', 'TASK_SL_NO_PARENT', 'items', [{ name: 'DISPLAY_CODE', map: 'label' }, { name: 'TASK_SL_NO', map: 'value' }]);
    }, err => {
      console.log(err);
      this.msgService.show(err, 'ERROR',
        {status: 'danger', destroyByClick: true, duration: 8000, hasIcon: true},
        );
    });
  }


  myTreeOnSelect(event: any): void {
    if (this.myTree && this.myDropDownButton) {
        const item = this.myTree.getItem(event.args.element);
        console.log(item);
        this.parentSelectedCBS = item.value;
        this.frmGroup.controls['TASK_SL_NO_PARENT'].setValue(this.parentSelectedCBS);
        const dropDownContent = '<div style="position: relative; margin-left: 3px; margin-top: 4px;">' + item.label + '</div>';
        this.myDropDownButton.setContent(dropDownContent);
    }
  }
}
