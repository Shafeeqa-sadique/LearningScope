import { Component, OnInit } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams, IAfterGuiAttachedParams } from 'ag-grid-community';
// import { ICellRendererParams, IAfterGuiAttachedParams } from 'ag-grid-angular/ag-grid-angular';

@Component({
  selector: 'ngx-ts-grd-button',
  // templateUrl: './ts-grd-button.component.html',
  template: `
    <!-- <button type="button"  nbButton (click)="onClick($event)" size="tiny" status="danger" ghost>{{label}}</button> -->
    <!-- <button type="button" (click)="onClick($event)">{{label}}</button> -->

    <span class="grdBtn">
      <i
      [id]="CtId"
      ngClass="fas"
       [ngClass]="{'fas':1===1,'fa-trash-alt': label === 'del','fa-edit': label === 'edt','fa-save': label === 'save'}"
      (click)="onClick($event,label,CtId)"></i>
    </span>

     <!-- <button (click)="onClick($event)" class="btn btn-danger btn-xs">Delete</button> -->
    `,
  styleUrls: ['./ts-grd-button.component.scss'],
})
export class TsGrdButtonComponent implements ICellRendererAngularComp {
  public params: any;
  public label: string;
  public css: string;
  public CtId: string;

  constructor() { }

  agInit(params): void {
    this.params = params;

    this.CtId = this.label + this.params.data.ID || null;
    if ((this.params.data.ID == 0) && (this.params.label == 'edt'))
      this.label = 'save';
    else
      this.label = this.params.label || null;

    this.css = this.params.css || null;
  }

  refresh(params?: any): boolean {
    return true;
  }

  setCss() {
    if (this.label === 'del') {
      this.css = 'fas fa-trash-alt';
    } else if (this.label === 'edt') {
      this.css = 'fas fa-edit';
    } else {
      this.css = 'fas fa-save';
    }
  }

  onClick($event, clkCss, Id) {
    if (this.params.onClick instanceof Function) {
      // put anything into params u want pass into parents component
      // if(clkCss == 'fas fa-save'){
      //   this.css="fas fa-edit";
      //   document.getElementById(this.CtId).className ="fas fa-edit";
      // }
      // if(clkCss == 'fas fa-edit'){
      //   this.css="fas fa-save";
      //   document.getElementById(this.CtId).className ="fas fa-save";
      // }
      if (this.label === 'edt') {
        this.label = 'save';
      } else {
        this.label = 'edt';
      }
      const params = {
        event: $event,
        rowData: this.params.node.data,
        rowIndex: this.params.rowIndex,
        // ...something
      };
      this.params.onClick(params, clkCss, Id);
    }
  }
}
