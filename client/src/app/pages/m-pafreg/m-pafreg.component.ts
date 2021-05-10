import { Component, OnInit, ViewChild } from '@angular/core';
import {  NbToastrService, NbDialogService  } from '@nebular/theme';
import { AgGridAngular } from 'ag-grid-angular';
import { TsGrdButtonComponent } from '../ts-grd-button/ts-grd-button.component';
import { TsGrdDdlComponent } from '../ts-grd-ddl/ts-grd-ddl.component';
import { TsGrdDtComponent } from '../ts-grd-dt/ts-grd-dt.component';
import { TsGrdTxtnumberComponent } from '../ts-grd-txtnumber/ts-grd-txtnumber.component';
import { ConfirmdialogComponent } from '../modal-overlays/confirmdialog/confirmdialog.component';

import { SPXlstService } from '../../../services/SPXlst.service';
import { GlbVarService } from '../../../../src/services/glbvar.service';
import { LogininfoService } from '../../../services/logininfo.service';


@Component({
  selector: 'ngx-m-pafreg',
  templateUrl: './m-pafreg.component.html',
  styleUrls: ['./m-pafreg.component.scss'],
})
export class MPafregComponent implements OnInit {

  @ViewChild('grdTS') grdTS: AgGridAngular;
  grdCol;
  grdRowData: any = [];
  grdDefltColDef;
  grdApi;
  grdColApi;
  grdFramewrkComp: any;
  grdClickRwIdx: number = -1;
  grdEditID: string = '';
  btnEditCss;

  editingRowIndex;

  ddlJobTitle: any[] = [] ;
  ddlTSPrj: any = [];
  ddlEmpSts: any = [];
  ddlPAFSts: any = [];


  constructor(
    private srMsg: NbToastrService,
    private srDialog: NbDialogService,
    private srSPXLst: SPXlstService,
    private srGlbVar: GlbVarService,
    private srLoginInfo: LogininfoService,
    ) {

      this.grdFramewrkComp = {
        btnRender: TsGrdButtonComponent,
        ddlRender: TsGrdDdlComponent,
        dtRender: TsGrdDtComponent,
        numericCellEditor: TsGrdTxtnumberComponent,
      };
      this.getDllInfo();
  }

  ngOnInit(): void {
  }

  grdConfig() {
    this.grdDefltColDef = {
      flex: 1,
      resizable: true,
      floatingFilter: false,
      sortable: true,
      editable: true,
      filterParams: {
        buttons: ['clear', 'apply'],
        closeOnApply: true,
      },
      menuTabs: ['filterMenuTab', 'generalMenuTab'],
      autoHeight: true,
      filter: 'agTextColumnFilter',
      // cellClass: function(prm) { console.log(prm.colDef.filter =='agNumberColumFilter'); return (params.value==='something'?'my-class-1':'my-class-2'); }
    };

    this.grdCol  = [
      {
        headerName: 'ID',
        field: 'ID',
        filter: 'agNumberColumnFilter',
        hide : true,
      },
      {
        headerName: '',
        field: 'delete',
        // cellRendererFramework:TsGrdButtonComponent ,
        cellRenderer: 'btnRender',
        cellRendererParams: {
          onClick: this.onGrdDelete.bind(this),
          label: 'del',
        },
        hide : false,
        suppressSizeToFit: false,
        maxWidth: 35,
        editable: false,
        pinned: 'left',
      },
      {
        headerName: '',
        field: 'edit',
        // cellRendererFramework:TsGrdButtonComponent ,
        cellRenderer: 'btnRender',
        cellRendererParams: {
          onClick: this.onGrdEdit.bind(this),
          label: 'edt',
        },
        hide : false,
        suppressSizeToFit: false,
        maxWidth: 35,
        editable: false,
      },
      { headerName: 'PAAFNo', field: 'PAAFNo',
        // cellEditor : 'agSelectCellEditor',
        // cellEditorParams : (params) =>{
        //     return {
        //       values: ['English', 'Spanish', 'French', 'Portuguese', '(other)']
        //     }
        // }
      },
      { headerName: 'Rev', field: 'Rev'},
      { headerName: 'EmployeeID', field: 'EmployeeID'},
      { headerName: 'Date', field: 'Date', filter: 'agDateColumnFilter',
        filterParams: this.srGlbVar.agGrdDateFltParm,
         valueFormatter: this.srGlbVar.agGrdformatDate,
        // cellStyle:'textAlign:center',
        cellEditor: 'dtRender',
        // cellEditorParams:{
        //    onChange: this.onDllSlctJobTile.bind(this)
        // },
        // valueGetter: (params) => {
        //   //  We don't want to display the raw "countryId" value.. we actually want
        //   //  the "Country Name" string for that id.
        //   console.log('Gett')
        //   console.log(params)
        //   return params.data.Date;
        // },
        // valueSetter: (params) => {
        //   //  When we select a value from our drop down list, this function will make sure
        //   //  that our row's record receives the "id" (not the text value) of the chosen selection.
        //   console.log('Setter');
        //   console.log(params);
        //   params.data.Date =params.newValue;
        //   return true;
        // },
        // onCellValueChanged: params => {
        //  // params.node.setDataValue()
        //  console.log('CellVal')
        //  console.log(params)
        // },
      },
      { headerName: 'Employee Name', field: 'Name'},
      { headerName: 'PAAF Contract/Job Title', field: 'PAAFJobTitle',
        cellEditor: 'ddlRender',
        cellEditorParams: {
          onSelect: this.onDllSlctJobTile.bind(this),
          dtData: this.ddlJobTitle,
          ddlCode: 'PAF',
        },
      },
      { headerName: 'Experience Level', field: 'ExpLevel'},
      { headerName: 'Transport Allowance', field: 'TransportAllowance'},
      { headerName: 'ContractNO', field: 'ContractNO'},
      { headerName: 'CallOffNumber', field: 'CallOffNumber'},
      { headerName: 'CTR Number', field: 'CTR_x0020_Number'},
      { headerName: 'Org Chart ID No', field: 'OrgChartIDNo'},
      { headerName: 'Org Chart Position Title', field: 'OrgChartPositionTitle'},
      { headerName: 'OC Depart', field: 'OCDepart'},
      { headerName: 'OC Sub Depart', field: 'OCSubDepart'},
      { headerName: 'Timesheet Project', field: 'TSProject',
        cellEditor: 'ddlRender',
        cellEditorParams: {
          onSelect: this.onDllSlctJobTile.bind(this),
          dtData: this.ddlTSPrj,
          ddlCode: 'PAF',
        },
      },
      { headerName: 'ROO Timesheet Project Ref', field: 'ROOTSProjectRef'},
      { headerName: 'SNC Timesheet Project Ref', field: 'SNCTSProjectRef'},
      { headerName: 'Overtime Overlap Request', field: 'OvertimeOverlapReq'},
      { headerName: 'Overtime Overlap Req Ref', field: 'OvertimeOverlapReqRef'},
      { headerName: 'Direct Indirect', field: 'DirectIndirec'},
      { headerName: 'Direct Indirect AFE', field: 'DirectIndirectAFE'},
      { headerName: 'EXLN', field: 'EXLN'},
      { headerName: 'Nationality', field: 'Nationality'},
      { headerName: 'StaffAgency', field: 'StaffAgency'},
      { headerName: 'Contract Position Title', field: 'ContractPositionTitle'},
      { headerName: 'Discipline', field: 'Discipline'},
      { headerName: 'Category', field: 'Category'},
      { headerName: 'Key Personnel', field: 'KeyPersonnel'},
      { headerName: 'Project', field: 'Project'},
      { headerName: 'Services Location', field: 'ServicesLocation'},
      { headerName: 'Actual Start Date', field: 'ActualStartDate',
        filter: 'agDateColumnFilter', filterParams: this.srGlbVar.agGrdDateFltParm,
        valueFormatter: this.srGlbVar.agGrdformatDate,
        cellEditor: 'dtRender',
        cellEditorParams: {
          onSelect: this.onDllSlctJobTile.bind(this),
        },
      },
      { headerName: 'Effective Date', field: 'EffectiveDate',
       filter: 'agDateColumnFilter', filterParams: this.srGlbVar.agGrdDateFltParm,
       valueFormatter: this.srGlbVar.agGrdformatDate,
       cellEditor: 'dtRender',
       cellEditorParams: {
         onSelect: this.onDllSlctJobTile.bind(this),
       },
      },
      { headerName: 'PAAF End Date', field: 'PAAFEndDate',
       filter: 'agDateColumnFilter', filterParams: this.srGlbVar.agGrdDateFltParm,
       valueFormatter: this.srGlbVar.agGrdformatDate,
       cellEditor: 'dtRender',
       cellEditorParams: {
         onSelect: this.onDllSlctJobTile.bind(this),
       },
      },
      { headerName: 'In Country Rate', field: 'InCountryRate',
      // cellEditor: 'numericCellEditor',
       filter: 'agNumberColumnFilter',
       valueFormatter: this.srGlbVar.agGrdCrrFormat},
      { headerName: 'Out Of Country Rate', field: 'OutOfCountryRate',
       // cellEditor: 'numericCellEditor'
       filter: 'agNumberColumnFilter', valueFormatter: this.srGlbVar.agGrdCrrFormat},
      { headerName: 'In Country Min Rate', field: 'InCountryMinRate',
      // cellEditor: 'numericCellEditor'
        filter: 'agNumberColumnFilter', valueFormatter: this.srGlbVar.agGrdCrrFormat},
      { headerName: 'Out of Country Min Rate', field: 'OutofCountryMinRate',
       // cellEditor: 'numericCellEditor'
        filter: 'agNumberColumnFilter', valueFormatter: this.srGlbVar.agGrdCrrFormat},
      { headerName: 'OvertimePaid', field: 'OvertimePaid'},
      { headerName: 'DiscountRate', field: 'DiscountRate',
       // ,cellEditor: 'numericCellEditor'
        filter: 'agNumberColumnFilter', valueFormatter: this.srGlbVar.agGrdCrrFormat},
      { headerName: 'PAAF Status', field: 'PAAFStatus',
        cellEditor: 'ddlRender',
        cellEditorParams: {
          onSelect: this.onDllSlctJobTile.bind(this),
          dtData: this.ddlPAFSts,
          ddlCode: 'PAF',
        },
      },
      { headerName: 'Employee Status', field: 'EmployeeStatus',
        cellEditor: 'ddlRender',
        cellEditorParams: {
          onSelect: this.onDllSlctJobTile.bind(this),
          dtData: this.ddlEmpSts,
          ddlCode: 'PAF',
        },
      },
      { headerName: 'Date Submitted', field: 'DateSubmitted',
        filter: 'agDateColumnFilter', filterParams: this.srGlbVar.agGrdDateFltParm,
        valueFormatter: this.srGlbVar.agGrdformatDate,
        cellEditor: 'dtRender',
        cellEditorParams: {
          onSelect: this.onDllSlctJobTile.bind(this),
        },
      },
      { headerName: 'Date Approved', field: 'DateApproved',
        filter: 'agDateColumnFilter', filterParams: this.srGlbVar.agGrdDateFltParm,
        valueFormatter: this.srGlbVar.agGrdformatDate,
        cellEditor: 'dtRender',
        cellEditorParams: {
          onSelect: this.onDllSlctJobTile.bind(this),
        },
      },
      { headerName: 'RefLetterNo', field: 'RefLetterNo'},
      { headerName: 'Assignment Details', field: 'AssignmentDetails'},
      { headerName: 'CVAttached', field: 'CVAttached'},
      { headerName: 'DePAAF Expired Date', field: 'DePAAFExpDate',
        filter: 'agDateColumnFilter', filterParams: this.srGlbVar.agGrdDateFltParm,
        valueFormatter: this.srGlbVar.agGrdformatDate,
        cellEditor: 'dtRender',
        cellEditorParams: {
          onSelect: this.onDllSlctJobTile.bind(this),
        },
      },
      { headerName: 'Demobilized Date', field: 'DemobilizedDate',
        filter: 'agDateColumnFilter', filterParams: this.srGlbVar.agGrdDateFltParm,
        valueFormatter: this.srGlbVar.agGrdformatDate,
        cellEditor: 'dtRender',
        cellEditorParams: {
          onSelect: this.onDllSlctJobTile.bind(this),
        },
      },
      { headerName: 'Remarks', field: 'Remarks'},
    ];
  }
  onAddRew() {
    const rw = [{ ID: 0, PAAFNo: null}];
    const rwIdx = this.grdApi.getDisplayedRowCount();

    this.grdRowData.push(rw);
    const res = this.grdApi.applyTransaction({
      add: rw,
      addIndex: rwIdx,
    });

    this.grdApi.startEditingCell({
      rowIndex: rwIdx,
      colKey: 'PAAFNo',
    });
    this.grdApi.setFocusedCell(rwIdx, 'PAAFNo', null);
  }

  getDllInfo() {
    this.srSPXLst.getMCode(null).subscribe(rs => {
      this.ddlJobTitle = rs.d.results.filter(a => a.CODE == 'COD_PAF_JOB_TILE');
      this.ddlTSPrj = rs.d.results.filter(a => a.CODE == 'CODE_TIMSHET_PRJ');
      this.ddlEmpSts = rs.d.results.filter(a => a.CODE == 'CODE_PF_EMP_STS');
      this.ddlPAFSts = rs.d.results.filter(a => a.CODE == 'CODE_PF_PAF_STS');
      this.grdConfig();
    }, err => {
      console.log(err);
      this.srMsg.show(err, 'ERROR',
        {status: 'danger', destroyByClick: true, duration: 8000, hasIcon: true},
        );
    });
  }

  onGrdFltrTxtChange(val: string) {
    this.grdApi.setQuickFilter(val);
  }

  onGrdRowValueChanged(e) {
    let isValid: boolean = true;
    let msg = '';
    const rw = {};
    let colName;
    // let cellDefs = this.grdApi.getEditingCells();
    for (let i = 0; i < this.grdCol.length; i++) {
      colName = this.grdCol[i].field;
      if ((colName != 'edit') && (colName != 'delete')) {
        rw[colName] = e.data[colName];
        if (
          (colName == 'PAAFNo') || (colName == 'Rev') || (colName == 'EmployeeID') || (colName == 'Date') ||
          // (colName =='Name') || (colName =='PAAFJobTitle') || (colName =='ExpLevel') || (colName =='TransportAllowance') ||
          // (colName =='ContractNO') || (colName =='CallOffNO') || (colName =='CTRNO') || (colName =='TSProject') ||
          // (colName =='OCDepart') || (colName =='TSProject') || (colName =='EXLN') || (colName =='Nationality') ||
          // (colName =='DirectIndirec') || (colName =='EffectiveDate') || (colName =='PAAFStatus') ||
          // (colName =='EmployeeStatus') || (colName =='Name') || (colName =='PAAFJobTitle') ||
          // (colName =='ExpLevel') || (colName =='TransportAllowance') ||
          (colName == 'InCountryRate')
          ) {
          if ((rw[colName] === null) || (rw[colName] === undefined) || (rw[colName] === '')) {
            msg = this.grdCol[i].headerName + ' is a mandatory field';
            isValid = false;
            break;
          }

          if (colName.includes('Date')) {
            const dt = this.srGlbVar.dateAheadFix(rw[colName]);
            rw[colName] = dt; // this.srGlbVar.dateAheadFix(rw[colName])
          }
        }
      }

    }

    if (isValid) {
      console.log(rw);
      if (e.data.ID == 0) {

          this.srSPXLst.AddPAF(this.srLoginInfo.authCode, rw).subscribe(rs => {
            this.srMsg.show(rw['PAAFNo'] + '-' + rw['Rev'] + ' PAAF Added Successfully', 'Success',
              {status: 'success', destroyByClick: true, duration: 5000, hasIcon: true},
              );
              this.grdApi.stopEditing();
        }, err => {
          this.srMsg.show('Error adding PAAF, Please contact support' + err, 'Error',
            {status: 'danger', destroyByClick: true, duration: 8000, hasIcon: false},
            );
        });
      } else {
        const id = rw['ID'];
        delete rw['ID'];
        this.srSPXLst.UptPAF(this.srLoginInfo.authCode, rw, id).subscribe(rs => {
            this.srMsg.show(rw['PAAFNo'] + '-' + rw['Rev'] + ' PAAF updated Successfully!!!!', 'Success',
              {status: 'success', destroyByClick: true, duration: 5000, hasIcon: true},
              );
          this.grdApi.stopEditing();
        }, err => {
          this.srMsg.show('Error adding PAAF, Please contact support' + err, 'Error',
            {status: 'danger', destroyByClick: true, duration: 8000, hasIcon: false},
            );
        });
      }
    } else {
       this.btnEditCss = 'save';

      this.srDialog.open(ConfirmdialogComponent,
        {
          context: {
            IsConfirm: false,
            title: 'Confirm',
            message: msg,
          },
        })
        .onClose.subscribe(result => {
          if (result == true) {

            this.grdApi.startEditingCell({
                rowIndex: e.rowIndex,
                colKey: 'PAAFNo',
              });
              this.grdApi.setFocusedCell(e.rowIndex, colName);
          }
        });
    }
 }

 getAllData() {
   const rowData = [];
   this.grdApi.forEachNode(node => rowData.push(node.data));
   return rowData;
 }

  onGrdEdit(e, css, CtrId) {
    this.btnEditCss = css;
    //
    if (css == 'save') {

      // let cellDefs = this.grdApi.getEditingCells();
      // console.log(cellDefs);
      const grdRw = this.grdApi.getRowNode(e.rowIndex);
      this.grdApi.getRowNode(e.rowIndex).setData(grdRw.data);
      this.grdApi.stopEditing();

    } else {
      this.grdApi.startEditingCell({
        rowIndex: e.rowIndex,
        colKey: 'PAAFNo',
      });
    }
  }

  onGrdDelete(e, css, CtrId) {
    if (e.rowData.ID == 0) {
      this.grdApi.applyTransaction({
        remove: [e.rowData],
      });
    } else {
      this.srDialog.open(ConfirmdialogComponent,
        {
          context: {
            IsConfirm: true,
            title: 'Confirm',
            message: 'Are you sure, you want to delete the PAAF ?',
          },
        })
        .onClose.subscribe(result => {
          if (result == true) {
            this.srSPXLst.DelPAF(this.srLoginInfo.authCode, e.rowData.ID).subscribe(rs => {

                this.grdApi.applyTransaction({
                  remove: [e.rowData],
                });
                this.srMsg.show('PAAF updated Successfully!!!!', 'Success',
                  {status: 'success', destroyByClick: true, duration: 5000, hasIcon: true},
                  );
            }, err => {
              this.srMsg.show('Error adding PAAF, Please contact support' + err, 'Warning',
                {status: 'warning', destroyByClick: true, duration: 8000, hasIcon: false},
                );
            });
          }
        });
    }
  }

  onCellClicked($event) {
    this.grdClickRwIdx = $event.rowIndex;
    if (this.editingRowIndex != $event.rowIndex) {
      this.editingRowIndex = $event.rowIndex;
    }
  }

  onDllSlctJobTile(e) {

  }

   expXL() {
    const expParam = {
      suppressQuotes: 'none',
      columnSeparator: 'none',
      customHeader: 'array',
      customFooter: 'array',
    };
    this.grdApi.exportDataAsCsv();

  }

  onGrdReady(pGrdObj) {
    this.grdApi = pGrdObj.api;
    this.grdColApi = pGrdObj.columnApi;
    this.grdApi.sizeColumnsToFit();
    this.srSPXLst.getPAFReg(null).subscribe(rs => {
      this.grdRowData = rs.d.results;
      this.autoSizeAll(false);
    });

  }

  autoSizeAll(skipHeader) {
    const allColumnIds = [];
    this.grdColApi.getAllColumns().forEach(function (column) {
      allColumnIds.push(column.colId);
    });

    this.grdColApi.autoSizeColumns(allColumnIds, skipHeader);
  }

}
