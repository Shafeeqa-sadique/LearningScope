import { Component, OnInit } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams, IAfterGuiAttachedParams } from 'ag-grid-community';
import { SPXlstService } from '../../../services/SPXlst.service';
import {  FormControl } from '@angular/forms';

@Component({
  selector: 'ngx-ts-grd-ddl',
  templateUrl: './ts-grd-ddl.component.html',
  styleUrls: ['./ts-grd-ddl.component.scss'],
})
export class TsGrdDdlComponent implements ICellRendererAngularComp {
  ddlSrcAFE: any;
  public params: any;
  public dtData;
  public ctlSltID: string;
  public ddlCode: string = 'CBS';
  ddlID = new FormControl('');

  constructor(private srSPXLst: SPXlstService) { }
  refresh(params: ICellRendererParams): boolean {
    // console.log('refresh');
    // console.log(params);

    return false;
    // throw new Error('Method not implemented.');
  }
  agInit(params: ICellRendererParams): void {
    this.params = params;
    // this.dtData = this.params.dtData || null;
    // this.ddlCode = this.params.ddlCode || null;
    this.dtData = this.params.dtData || null;

    if ((this.params.value !== null) && (this.params.value !== undefined)) {
      this.ctlSltID = this.params.value;
      this.ddlID.patchValue(this.ctlSltID);
    } else if (this.params.dtData.length > 0) {

      this.ctlSltID =  this.params.dtData[0].DISP_VALUE;
      this.ddlID.patchValue(this.ctlSltID);
    }


    // this.getDllAFE();
    // throw new Error('Method not implemented.');
  }

  getValue(): any {
    // SET THE GRID DATA
    return this.ddlID.value;
  }

  afterGuiAttached?(params?: IAfterGuiAttachedParams): void {
    // console.log('afterGuiAttached');
    // console.log(params);
    // throw new Error('Method not implemented.');
  }

  // ngOnInit(): void {
  //   this.getDllAFE()
  // }

  getDllCode() {
    this.srSPXLst.getMCode('COD_PAF_JOB_TILE').subscribe(rs => {
            const dt: any[] = [];
            rs.d.results.forEach(e => {
              const rw = {
                DISP_VALUE : e.DISP_VALUE,
                DISP_NAME  : e.DISP_NAME,
              };
              dt.push(rw);
            });
            console.log(dt);
            return dt;
          });
  }

  getDllAFE(pCat) {
    this.srSPXLst.getMCBS(pCat).subscribe(rs => {
        const dt: any[] = [];
        rs.d.results.forEach(e => {
          const rw = {
            cbs_id: e.ID,
            afe_desc: e.TASK_CODE + '-' + e.TASK_DESC,
          };
          dt.push(rw);
        });
        this.ddlSrcAFE = dt;
    });
  }

  onSelect($event) {
    const params = {
      event: $event,
      rowData: this.params.node.data,
      rowIndex: this.params.rowIndex,
      // ...something
    };
    this.params.onSelect(params);
  }

  onModelChange(value: string) {
    // this.filteredNgModelOptions$ = of(this.filter(value));
    console.log(value);
  }

}
