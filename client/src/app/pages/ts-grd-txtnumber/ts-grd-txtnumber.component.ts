import { Component, OnInit } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams, IAfterGuiAttachedParams } from 'ag-grid-community';
import {  FormControl, Validators } from '@angular/forms';
import { ValidationService } from '../../validators/validation.service';

@Component({
  selector: 'ngx-ts-grd-txtnumber',
  template: `
  <input (keypress)="numberOnly($event)"
  type="number" [formControl]="txt" >
  `,
  providers: [ValidationService],
})
export class TsGrdTxtnumberComponent implements ICellRendererAngularComp {

  txt = new FormControl('');
  public params: any;
  constructor() { }

  agInit(params: ICellRendererParams): void {
    this.params = params;
    // this.txt= new FormControl(
    //   {value: this.params.value}//, [ValidationService.numberValidator]
    //   )
    this.txt.setValue(this.params.value);
  }


  afterGuiAttached?(params?: IAfterGuiAttachedParams): void {
  }


  getValue() {
    if (Number(this.txt.value) === NaN) {
      return 0;
    } else return Number(this.txt.value) ;
  }

  refresh(params: ICellRendererParams): boolean {
    // throw new Error('Method not implemented.');
    return true;
  }

  validateInput(field) {
    this.txt.patchValue(field.value);
  }

  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;

  }

}
