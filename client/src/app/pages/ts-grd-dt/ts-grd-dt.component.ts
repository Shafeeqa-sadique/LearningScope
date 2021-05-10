import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams, IAfterGuiAttachedParams } from 'ag-grid-community';
import { DatePipe } from '@angular/common';
import {  FormControl } from '@angular/forms';

@Component({
  selector: 'ngx-ts-grd-dt',
  templateUrl: './ts-grd-dt.component.html',
  styleUrls: ['./ts-grd-dt.component.scss'],
})
export class TsGrdDtComponent implements ICellRendererAngularComp  {

  dtInput;
  public params: any;
  public dtValue;
  public id;
  // frmGrp: FormGroup;
  CtrDt = new FormControl('');

  constructor(
    public datepipe: DatePipe,
    // private frmBld: FormBuilder,
    ) { }

  refresh(params: ICellRendererParams): boolean {
    // throw new Error('Method not implemented.');
    return true;
  }
  agInit(params: ICellRendererParams): void {
    this.params = params;
    this.dtValue = this.params.value; // this.datepipe.transform(this.params.value, 'dd-MMM-yy') ;
    this.id = this.params.column.colId + this.params.rowIndex;
    // document.getElementById(this.id).nodeValue = this.dtValue
    // this.CtrDt = new FormControl(this.dtValue);
    // this.CtrDt.setValue(this.dtValue);
    if ((this.dtValue !== null) && (this.dtValue !== undefined))
      this.CtrDt.patchValue(new Date(this.dtValue));
  }


  afterGuiAttached?(params?: IAfterGuiAttachedParams): void {
    // throw new Error('Method not implemented.');
   // document.getElementById(this.id).nodeValue = this.dtValue
  }

  onChange($event) {
    // console.log('Child onChange')
    const params = {
      event: $event,
      rowData: this.params.node.data,
      rowIndex: this.params.rowIndex,
      newValue: this.CtrDt.value,
      // ...something
    };
    // this.params.onChange(params);
  }

  getValue(): any {
    // SET THE GRID DATA
    if (Date.parse(this.CtrDt.value))
      return this.CtrDt.value;
    else return null;
  }

  ngOnInit(): void {
  }

}
