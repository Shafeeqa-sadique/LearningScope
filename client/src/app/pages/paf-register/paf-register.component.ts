import { Component, OnInit, ViewChild, ElementRef  } from '@angular/core';
import { PafService } from '../../../services/paf.service';
import { jqxGridComponent } from 'jqwidgets-ng/jqxgrid';
import {  NbToastrService, NbDialogService  } from '@nebular/theme';
import { AddPafComponent } from '../modal-overlays/add-paf/add-paf.component';
import { ConfirmdialogComponent } from '../modal-overlays/confirmdialog/confirmdialog.component';
import { SPXlstService } from '../../../services/SPXlst.service';
// import * as $ from 'jquery';

@Component({
  selector: 'ngx-paf-register',
  templateUrl: './paf-register.component.html',
  styleUrls: ['./paf-register.component.scss'],
  providers: [PafService, NbDialogService],
})
export class PafRegisterComponent implements OnInit {

  @ViewChild('grdPAF', { static: false }) grdPAF: jqxGridComponent;
  @ViewChild('idRow') myDiv: ElementRef;
  grdData: any = [] ;
  grdSelectRwId: number = -1;
  source: any;
  dataAdapter: any;

  ddlSorcPosition: any;
  ddlDaPosition: any;

  ddlSorcTmPrj: any;
  ddlDaTmPrj: any;

  ddlSorcEmpSts: any;
  ddlDaEmpSts: any;

  ddlSorcPAFSts: any;
  ddlDaTmPAFSts: any;


  constructor(
    private dialogService: NbDialogService,
    private msgService: NbToastrService,
    private pafService: PafService,
    private srSPXLst: SPXlstService,
  ) { }


  ngOnInit(): void {
    this.fetchPAFReg(false);
    // this.getPosition();
    this.getDllInfo('COD_PAF_JOB_TILE');
    this.getDllInfo('CODE_TIMSHET_PRJ');
    this.getDllInfo('CODE_PF_EMP_STS');
    this.getDllInfo('CODE_PF_PAF_STS');
  }

  getWidth(): any {
    if (document.body.offsetWidth < 850) {
      return '100%';
    }
    return '100%';
  }


  renderStatusBar: any = function(statusbar) {
    const container = $('<div style=\'margin: 5px;\'></div>');
    const leftResult = '24 Items';
    const nextToLeftResult = '0 Selected';
    const rightResult = '114.4 Size';
    const leftSpan = $(`<span style='float: left; margin-top: 5px; margin-left: 18px;'>${leftResult}</span>`);
    const nextToLeftSpan = $(`<span style='float: left; margin-top: 5px; margin-left: 18px;'>${nextToLeftResult}</span>`);
    const rightSpan = $(`<span style='float: right; margin-top: 5px; margin-right: 45px;'>${rightResult}</span>`);
    container.append(leftSpan);
    container.append(nextToLeftSpan);
    container.append(rightSpan);
    statusbar.append(container);
  };



  // ddlPAAFSource: any =
  // {
  //     datatype: 'array',
  //     datafields: [
  //         { name: 'label', type: 'string' },
  //         { name: 'value', type: 'string' }
  //     ],
  //     localdata: [
  //       { value: 'Approved', label: 'Approved' },
  //       { value: 'Inactive', label: 'Inactive' },
  //     ]
  // };
  // ddlPAAFAdapter: any = new jqx.dataAdapter(this.ddlPAAFSource, { autoBind: true });


  // ddlEmpStatusSource: any =
  // {
  //     datatype: 'array',
  //     datafields: [
  //         { name: 'label', type: 'string' },
  //         { name: 'value', type: 'string' }
  //     ],
  //     localdata: [
  //       { value: 'Active', label: 'Active' },
  //       { value: 'Demobed', label: 'Demobed' },
  //     ]
  // };
  // ddlEmpStatusAdapter: any = new jqx.dataAdapter(this.ddlEmpStatusSource, { autoBind: true });



  ddlDirect: any[] = [
    { value: 'Direct', label: 'Direct' },
    { value: 'Indirect', label: 'Indirect' },
  ];
  ddlDirectSource: any =
  {
      datatype: 'array',
      datafields: [
          { name: 'label', type: 'string' },
          { name: 'value', type: 'string' },
      ],
      localdata: this.ddlDirect,
  };
  ddlDirectAdapter: any = new jqx.dataAdapter(this.ddlDirectSource, { autoBind: true });

  getDllInfo(pCd) {
    this.srSPXLst.getMCode(pCd).subscribe(rs => {
      if ('COD_PAF_JOB_TILE' == pCd) {
        this.ddlSorcPosition  = {
          datatype: 'array',
          datafields: [
              { name: 'DISP_VALUE', type: 'string' },
              { name: 'DISP_NAME', type: 'string' },
          ],
          localdata : rs.d.results,
        };
        this.ddlDaPosition = new jqx.dataAdapter(this.ddlSorcPosition, { autoBind: true });
      }

      if ('CODE_TIMSHET_PRJ' == pCd) {
        this.ddlSorcTmPrj  = {
          datatype: 'array',
          datafields: [
              { name: 'DISP_VALUE', type: 'string' },
              { name: 'DISP_NAME', type: 'string' },
          ],
          localdata : rs.d.results,
        };
        this.ddlDaTmPrj = new jqx.dataAdapter(this.ddlSorcTmPrj, { autoBind: true });
      }

      if ('CODE_PF_EMP_STS' == pCd) {
        this.ddlSorcEmpSts  = {
          datatype: 'array',
          datafields: [
              { name: 'DISP_VALUE', type: 'string' },
              { name: 'DISP_NAME', type: 'string' },
          ],
          localdata : rs.d.results,
        };
        this.ddlDaEmpSts = new jqx.dataAdapter(this.ddlSorcEmpSts, { autoBind: true });
      }
      if ('CODE_PF_PAF_STS' == pCd) {
        this.ddlSorcPAFSts  = {
          datatype: 'array',
          datafields: [
              { name: 'DISP_VALUE', type: 'string' },
              { name: 'DISP_NAME', type: 'string' },
          ],
          localdata : rs.d.results,
        };
        this.ddlDaTmPAFSts = new jqx.dataAdapter(this.ddlSorcPAFSts, { autoBind: true });
      }
    }, err => {
      console.log(err);
      this.msgService.show(err, 'ERROR',
        {status: 'danger', destroyByClick: true, duration: 8000, hasIcon: true},
        );
    });


  }

  getPosition() {
    this.pafService.getPosition().subscribe(rs => {
      if (rs && rs['code'] == 200) {
        const arr = rs['data'];
        const dt = [];
        arr.forEach(e => {
          const rw = {
            'value': e.DISP_NAME,
          };
          dt.push(rw);
        });

        this.ddlSorcPosition  = {
          datatype: 'array',
          datafields: [
              { name: 'value', type: 'string' },
          ],
          localdata : dt,
        };
        this.ddlDaPosition = new jqx.dataAdapter(this.ddlSorcPosition, { autoBind: true });
      }
    });
  }

  // ddlPositionSource: any =
  // {
  //     datatype: 'array',
  //     datafields: [
  //         { name: 'value', type: 'string' }
  //     ],
  //     localdata: [
  //       { value:'Admin Manager/Coordinator' },
  //       { value:'Administrative Officer ' },
  //       { value:'Administrative Officer' },
  //       { value:'Construction Manager ' },
  //       { value:'Construction Supervisor' },
  //       { value:'Cost Controller' },
  //       { value:'E&I Engineer' },
  //       { value:'Field Engineering Coordinator' },
  //       { value:'HSE Advisor' },
  //       { value:'HSE Coordinator' },
  //       { value:'HSE Manager ' },
  //       { value:'HSE Manager' },
  //       { value:'Lead Completions & Handover Engineer ' },
  //       { value:'Lead Completions & Handover Engineer' },
  //       { value:'Lead Document Controller' },
  //       { value:'Lead Materials Coordinator ' },
  //       { value:'Lead Materials Coordinator' },
  //       { value:'Lead Planning Engineer' },
  //       { value:'Lead Projects Controls Engineer ' },
  //       { value:'Lead Surveyor' },
  //       { value:'Planning Manager' },
  //       { value:'Project Controls Manager ' },
  //       { value:'Project Controls Manager' },
  //       { value:'Project Coordinator' },
  //       { value:'Project Director' },
  //       { value:'Project Manager' },
  //       { value:'QA / QC Manager' },
  //       { value:'QA / QC Supervisor' },
  //       { value:'QA Inspector / Lead Inspector' },
  //       { value:'Security Manager ' },
  //       { value:'Security Manager' },
  //       { value:'Senior Project Director' },
  //       { value:'Senior Project Manager' },
  //       { value:'Senior Surveyor' },
  //       { value:'Survey Manager' },
  //     ]
  // };
  // ddlPositionAdapter: any = new jqx.dataAdapter(this.ddlPositionSource, { autoBind: true });

  columns: any[] =
  [
    { text: '##', datafield: 'PAF_ID', width: 30, cellsalign: 'center', align: 'center' , pinned: true , hidden: false, exportable: true, editable: false,
    },
    { text: 'PAAF NO#' , datafield: 'PAAFNo', width: 60 , cellsalign: 'center', align: 'center', pinned: true , columntype: 'textbox', editable: false,
      // createEverPresentRowWidget: (datafield: string, htmlElement: HTMLElement, popup: any, addCallback: any): HTMLElement => {
      // let container = document.createElement('div');
      // container.id = 'grdCDPAFNO';
      // container.style.border = 'none';
      // htmlElement[0].appendChild(container);
      // let options = {
      //     width: '100%', height: 30, decimalDigits: 0, inputMode: 'simple'
      // };
      // this.grdCDPAFNO = jqwidgets.createInstance('#grdCDPAFNO', 'jqxNumberInput', options);
      // return container;
      // },
      // initEverPresentRowWidget: (datafield: string, htmlElement: HTMLElement): void => {
      // },
      // getEverPresentRowWidgetValue: (datafield: string, htmlElement: HTMLElement, validate: any): any => {
      //     let value = this.grdCDPAFNO.val();
      //     if (value == '') value = 0;
      //     return parseInt(value);
      // },
      // resetEverPresentRowWidgetValue: (datafield: string, htmlElement: HTMLElement): void => {
      //     this.grdCDPAFNO.val('');
      // }
    },
    { text: 'Rev' , datafield: 'Rev', width: 60 , cellsalign: 'center', align: 'center', pinned: true , columntype: 'textbox', editable: false,
      // createEverPresentRowWidget: (datafield: string, htmlElement: HTMLElement, popup: any, addCallback: any): HTMLElement => {
      // let container = document.createElement('div');
      // container.id = 'grdCDRev';
      // container.style.border = 'none';
      // htmlElement[0].appendChild(container);
      // let options = {
      //     width: '100%', height: 30, decimalDigits: 0, inputMode: 'simple'
      // };
      // this.grdCDRev = jqwidgets.createInstance('#grdCDRev', 'jqxNumberInput', options);
      // return container;
      // },
      // initEverPresentRowWidget: (datafield: string, htmlElement: HTMLElement): void => {
      // },
      // getEverPresentRowWidgetValue: (datafield: string, htmlElement: HTMLElement, validate: any): any => {
      //     let value = this.grdCDRev.val();
      //     if (value == '') value = 0;
      //     return parseInt(value);
      // },
      // resetEverPresentRowWidgetValue: (datafield: string, htmlElement: HTMLElement): void => {
      //     this.grdCDRev.val('');
      // }
    },
    { text: 'Employee ID#' , datafield: 'EmpID', width: 60 , cellsalign: 'center', align: 'center', pinned: false , columntype: 'textbox', editable: true,
    // ,validateEverPresentRowWidgetValue: this.fnAddNewValidate,
    },
    { text: 'PAF Date', datafield: 'PAFDate', width: 80, cellsalign: 'center', align: 'center' , cellsformat: 'dd-MMM-yy', columntype: 'datetimeinput', editable: true,
      // createEverPresentRowWidget: (datafield: string, htmlElement: HTMLElement, popup: any, addCallback: any): HTMLElement => {
      //   let container = document.createElement('div');
      //       container.id = 'grdCDtPAF';
      //       container.style.border = 'none';
      //       htmlElement[0].appendChild(container);
      //       let options = {
      //           width: '100%', height: 30, value: null,
      //           popupZIndex: 999999, placeHolder: 'Enter Date: '
      //       };
      //       this.grdCDtPAF = jqwidgets.createInstance('#grdCDtPAF', 'jqxDateTimeInput', options);
      //       return container;
      //   },
      //   initEverPresentRowWidget: (datafield: string, htmlElement: HTMLElement): void => {
      //   },
      //   getEverPresentRowWidgetValue: (datafield: string, htmlElement: HTMLElement, validate: any): any => {
      //       let value = this.grdCDtPAF.val();
      //       return value;
      //   },
      //   resetEverPresentRowWidgetValue: (datafield: string, htmlElement: HTMLElement): void => {
      //       this.grdCDtPAF.val(null);
      //   },
    },
    { text: 'Name' , datafield: 'Name', width: 180 , cellsalign: 'left', align: 'center', pinned: false , columntype: 'textbox'
      , aggregates: [
        {
            'Total Count':
            (aggregatedValue: number, currentValue: string): number => {
                return aggregatedValue + 1;
            },
        },
      ],
      // ,validateEverPresentRowWidgetValue: this.fnAddNewValidate,
    },
    { text: 'Position' , datafield: 'Position', width: 140 , cellsalign: 'left', align: 'center'
      , columntype: 'dropdownlist'
      , createeditor: (row: number, value: any, editor: any): void => {
      editor.jqxDropDownList({ width: '140', height: 32, source: this.ddlDaPosition, displayMember: 'DISP_NAME', valueMember: 'DISP_VALUE' });
      },
    },
    { text: 'Experience Level' , datafield: 'ExpLevel', width: 120 , cellsalign: 'left', align: 'center', columntype: 'textbox' },
    { text: 'Transport Allowance' , datafield: 'TransportAllowance', width: 120 , cellsalign: 'left', align: 'center', columntype: 'textbox' },
    { text: 'Contract NO' , datafield: 'ContractNO', width: 80 , cellsalign: 'left', align: 'center', columntype: 'textbox'},
    { text: 'Call Off NO' , datafield: 'CallOffNO', width: 80 , cellsalign: 'left', align: 'center', columntype: 'textbox' },
    { text: 'CTR NO' , datafield: 'CTRNO', width: 160 , cellsalign: 'left', align: 'center', columntype: 'textbox' },
    { text: 'Org Chart ID NO' , datafield: 'OrgChartIDNo', width: 140 , cellsalign: 'left', align: 'center', columntype: 'textbox' },
    { text: 'Org Chart Position Title' , datafield: 'OrgChartPositionTitle', width: 140 , cellsalign: 'left', align: 'center', columntype: 'textbox' },
    { text: 'OC Department' , datafield: 'OCDepart', width: 140 , cellsalign: 'left', align: 'center', columntype: 'textbox' },
    { text: 'OC SubDepartment' , datafield: 'OCSubDepartment', width: 140 , cellsalign: 'left', align: 'center', columntype: 'textbox' },
    { text: 'ROO Timesheet Project' , datafield: 'TimesheetProject', width: 140 , cellsalign: 'left', align: 'center'
      , columntype: 'dropdownlist'
      , createeditor: (row: number, value: any, editor: any): void => {
      editor.jqxDropDownList({ width: '140', height: 32, source: this.ddlDaTmPrj, displayMember: 'DISP_NAME', valueMember: 'DISP_VALUE' });
      },
    },
    { text: 'ROO Timesheet Project Ref' , datafield: 'ROOTimesheetProjectRef', width: 140 , cellsalign: 'left', align: 'center', columntype: 'textbox' },
    { text: 'SNC Timesheet Project Ref', datafield: 'SNCTimesheetProject_Ref', width: 80, cellsalign: 'center', align: 'center' , columntype: 'textbox',
    },
    { text: 'Overtime Request' , datafield: 'OvertimeReq', width: 140 , cellsalign: 'left', align: 'center', columntype: 'textbox' },
    { text: 'Overtime Request Refer' , datafield: 'OvertimeReqRefer', width: 140 , cellsalign: 'left', align: 'center', columntype: 'textbox' },
    { text: 'EX/LN' , datafield: 'EX_LN', width: 60 , cellsalign: 'left', align: 'center', columntype: 'textbox' },
    { text: 'Direct / Indirect' , datafield: 'DirectIndirect', width: 140 , cellsalign: 'left', align: 'center', columntype: 'dropdownlist'
      , createeditor: (row: number, value: any, editor: any): void => {
      editor.jqxDropDownList({ width: '140', height: 32, source: this.ddlDirectAdapter, displayMember: 'label', valueMember: 'value' });
      },
    },
    { text: 'Project Assignments' , datafield: 'ProjectAssign', width: 140 , cellsalign: 'left', align: 'center', columntype: 'textbox' },
    { text: 'Nationality' , datafield: 'Nationality', width: 140 , cellsalign: 'left', align: 'center', columntype: 'textbox' },
    { text: 'Request Letter No.' , datafield: 'RequestLetterNO', width: 100 , cellsalign: 'left', align: 'center', columntype: 'textbox' },
    { text: 'Aprroval Letter No.' , datafield: 'AprrovalLetterNO', width: 100 , cellsalign: 'left', align: 'center', columntype: 'textbox' },
    { text: 'Staff / Agency' , datafield: 'StaffAgency', width: 80 , cellsalign: 'left', align: 'center', columntype: 'textbox' },
    { text: 'Contractual Position Title' , datafield: 'ContractPositionTitle', width: 160 , cellsalign: 'left', align: 'center', columntype: 'textbox' },
    { text: 'Discipline' , datafield: 'Discipline', width: 140 , cellsalign: 'left', align: 'center', columntype: 'textbox' },
    { text: 'Category' , datafield: 'Category', width: 160 , cellsalign: 'left', align: 'center', columntype: 'textbox' },
    { text: 'Project' , datafield: 'Project', width: 140 , cellsalign: 'left', align: 'center', columntype: 'textbox' },
    { text: 'Services Location' , datafield: 'ServicesLocation', width: 120 , cellsalign: 'left', align: 'center', columntype: 'textbox' },
    { text: 'Actual Start Date', datafield: 'StartDtActual', width: 80, cellsalign: 'center', align: 'center' , cellsformat: 'dd-MMM-yy', columntype: 'datetimeinput',
      // createEverPresentRowWidget: (datafield: string, htmlElement: HTMLElement, popup: any, addCallback: any): HTMLElement => {
      // let container = document.createElement('div');
      //     container.id = 'grdCDtStartDtActual';
      //     container.style.border = 'none';
      //     htmlElement[0].appendChild(container);
      //     let options = {
      //         width: '100%', height: 30, value: null,
      //         popupZIndex: 999999, placeHolder: 'Enter Date: '
      //     };
      //     this.grdCDtStartDtActual = jqwidgets.createInstance('#grdCDtStartDtActual', 'jqxDateTimeInput', options);
      //     return container;
      // },
      // initEverPresentRowWidget: (datafield: string, htmlElement: HTMLElement): void => {
      // },
      // getEverPresentRowWidgetValue: (datafield: string, htmlElement: HTMLElement, validate: any): any => {
      //     let value = this.grdCDtStartDtActual.val();
      //     return value;
      // },
      // resetEverPresentRowWidgetValue: (datafield: string, htmlElement: HTMLElement): void => {
      //     this.grdCDtStartDtActual.val(null);
      // },
    },
    { text: 'Effective Date', datafield: 'EffectiveDt', width: 80, cellsalign: 'center', align: 'center' , cellsformat: 'dd-MMM-yy', columntype: 'datetimeinput',
      // createEverPresentRowWidget: (datafield: string, htmlElement: HTMLElement, popup: any, addCallback: any): HTMLElement => {
      // let container = document.createElement('div');
      //     container.id = 'grdCDtEffectiveDt';
      //     container.style.border = 'none';
      //     htmlElement[0].appendChild(container);
      //     let options = {
      //         width: '100%', height: 30, value: null,
      //         popupZIndex: 999999, placeHolder: 'Enter Date: '
      //     };
      //     this.grdCDtEffectiveDt = jqwidgets.createInstance('#grdCDtEffectiveDt', 'jqxDateTimeInput', options);
      //     return container;
      // },
      // initEverPresentRowWidget: (datafield: string, htmlElement: HTMLElement): void => {
      // },
      // getEverPresentRowWidgetValue: (datafield: string, htmlElement: HTMLElement, validate: any): any => {
      //     let value = this.grdCDtEffectiveDt.val();
      //     return value;
      // },
      // resetEverPresentRowWidgetValue: (datafield: string, htmlElement: HTMLElement): void => {
      //     this.grdCDtEffectiveDt.val(null);
      // },
    },
    { text: 'PAAF End Date', datafield: 'PAAFEndDt', width: 80, cellsalign: 'center', align: 'center' , cellsformat: 'dd-MMM-yy', columntype: 'datetimeinput',
      // createEverPresentRowWidget: (datafield: string, htmlElement: HTMLElement, popup: any, addCallback: any): HTMLElement => {
      // let container = document.createElement('div');
      //     container.id = 'grdCDtPAAFEndDt';
      //     container.style.border = 'none';
      //     htmlElement[0].appendChild(container);
      //     let options = {
      //         width: '100%', height: 30, value: null,
      //         popupZIndex: 999999, placeHolder: 'Enter Date: '
      //     };
      //     this.grdCDtPAAFEndDt = jqwidgets.createInstance('#grdCDtPAAFEndDt', 'jqxDateTimeInput', options);
      //     return container;
      // },
      // initEverPresentRowWidget: (datafield: string, htmlElement: HTMLElement): void => {
      // },
      // getEverPresentRowWidgetValue: (datafield: string, htmlElement: HTMLElement, validate: any): any => {
      //     let value = this.grdCDtPAAFEndDt.val();
      //     return value;
      // },
      // resetEverPresentRowWidgetValue: (datafield: string, htmlElement: HTMLElement): void => {
      //     this.grdCDtPAAFEndDt.val(null);
      // },
    },
    { text: 'Rate As per Contract', datafield: 'ContractRate', width: 80, cellsalign: 'right', align: 'center' , cellsformat: 'c', columntype: 'textbox', editable: true},
    { text: 'In Country Rate (Min)', datafield: 'InCntryRateMin', width: 80, cellsalign: 'right', align: 'center' , cellsformat: 'c', columntype: 'textbox', editable: true},
    { text: 'In Country Rate', datafield: 'InCntryRate', width: 80, cellsalign: 'right', align: 'center' , cellsformat: 'c', columntype: 'textbox', editable: true},
    { text: 'Out Country Rate (Min)', datafield: 'OutCntryRateMin', width: 80, cellsalign: 'right', align: 'center' , cellsformat: 'c', columntype: 'textbox', editable: true},
    { text: 'Out Country Rate', datafield: 'OutCntryRate', width: 80, cellsalign: 'right', align: 'center' , cellsformat: 'c', columntype: 'textbox', editable: true,
     // validateEverPresentRowWidgetValue: this.fnAddNewValidate,
      // createEverPresentRowWidget: (datafield: string, htmlElement: HTMLElement, popup: any, addCallback: any): HTMLElement => {
      // let container = document.createElement('div');
      // container.id = 'grdCDtContractRate';
      // container.style.border = 'none';
      // htmlElement[0].appendChild(container);
      // let options = {
      //     width: '100%', height: 30, decimalDigits: 0, inputMode: 'simple'
      // };
      // this.grdCDtContractRate = jqwidgets.createInstance('#grdCDtContractRate', 'jqxNumberInput', options);
      // return container;
      // },
      // initEverPresentRowWidget: (datafield: string, htmlElement: HTMLElement): void => {
      // },
      // getEverPresentRowWidgetValue: (datafield: string, htmlElement: HTMLElement, validate: any): any => {
      //     let value = this.grdCDtContractRate.val();
      //     if (value == '') value = 0;
      //     return parseInt(value);
      // },
      // resetEverPresentRowWidgetValue: (datafield: string, htmlElement: HTMLElement): void => {
      //     this.grdCDtContractRate.val('');
      // }
    },
    { text: 'Monthly Rate', datafield: 'MonthlyRate', width: 80, cellsalign: 'center', align: 'center' , cellsformat: 'c',  columntype: 'textbox', editable: true,
    },
    { text: 'Overtime Paid' , datafield: 'OvertimePaid', width: 80 , cellsalign: 'left', align: 'center', columntype: 'textbox' },
    { text: 'Discounted Rate' , datafield: 'DiscountedRate', width: 80 , cellsalign: 'left', align: 'center', columntype: 'textbox',
    },
    { text: 'PAAF Status' , datafield: 'PAAFStatus', width: 80 , cellsalign: 'left', align: 'center', columntype: 'dropdownlist'
      , createeditor: (row: number, value: any, editor: any): void => {
      editor.jqxDropDownList({ width: '80', height: 32, source: this.ddlDaTmPAFSts, displayMember: 'DISP_NAME', valueMember: 'DISP_VALUE' });
      },
    },
    { text: 'Employee Status' , datafield: 'EmployeeStatus', width: 120 , cellsalign: 'left', align: 'center', columntype: 'dropdownlist'
      , createeditor: (row: number, value: any, editor: any): void => {
      editor.jqxDropDownList({ width: '120', height: 32, source: this.ddlDaEmpSts, displayMember: 'DISP_NAME', valueMember: 'DISP_VALUE' });
      },
    },
    { text: 'Submitted Date', datafield: 'SubmittedDate', width: 80, cellsalign: 'center', align: 'center' , cellsformat: 'dd-MMM-yy', columntype: 'datetimeinput',
     // validateEverPresentRowWidgetValue: this.fnAddNewValidate,
      // createEverPresentRowWidget: (datafield: string, htmlElement: HTMLElement, popup: any, addCallback: any): HTMLElement => {
      //   let container = document.createElement('div');
      //       container.id = 'grdCDtSubmittedDate';
      //       container.style.border = 'none';
      //       htmlElement[0].appendChild(container);
      //       let options = {
      //           width: '100%', height: 30, value: null,
      //           popupZIndex: 999999, placeHolder: 'Enter Date: '
      //       };
      //       this.grdCDtSubmittedDate = jqwidgets.createInstance('#grdCDtSubmittedDate', 'jqxDateTimeInput', options);
      //       return container;
      //   },
      //   initEverPresentRowWidget: (datafield: string, htmlElement: HTMLElement): void => {
      //   },
      //   getEverPresentRowWidgetValue: (datafield: string, htmlElement: HTMLElement, validate: any): any => {
      //       let value = this.grdCDtSubmittedDate.val();
      //       return value;
      //   },
      //   resetEverPresentRowWidgetValue: (datafield: string, htmlElement: HTMLElement): void => {
      //       this.grdCDtSubmittedDate.val(null);
      //   },
    },
    { text: 'Approved Date', datafield: 'ApprovedDate', width: 80, cellsalign: 'center', align: 'center' , cellsformat: 'dd-MMM-yy', columntype: 'datetimeinput',
     // validateEverPresentRowWidgetValue: this.fnAddNewValidate,
      // createEverPresentRowWidget: (datafield: string, htmlElement: HTMLElement, popup: any, addCallback: any): HTMLElement => {
      //   let container = document.createElement('div');
      //       container.id = 'grdCDtApprovedDate';
      //       container.style.border = 'none';
      //       htmlElement[0].appendChild(container);
      //       let options = {
      //           width: '100%', height: 30, value: null,
      //           popupZIndex: 999999, placeHolder: 'Enter Date: '
      //       };
      //       this.grdCDtApprovedDate = jqwidgets.createInstance('#grdCDtApprovedDate', 'jqxDateTimeInput', options);
      //       return container;
      //   },
      //   initEverPresentRowWidget: (datafield: string, htmlElement: HTMLElement): void => {
      //   },
      //   getEverPresentRowWidgetValue: (datafield: string, htmlElement: HTMLElement, validate: any): any => {
      //       let value = this.grdCDtApprovedDate.val();
      //       return value;
      //   },
      //   resetEverPresentRowWidgetValue: (datafield: string, htmlElement: HTMLElement): void => {
      //       this.grdCDtApprovedDate.val(null);
      //   },
    },
    { text: 'Assignment Details' , datafield: 'AssignDetail', width: 160 , cellsalign: 'left', align: 'center', columntype: 'textbox' },
    { text: 'CV Attached' , datafield: 'CVAttached', width: 160 , cellsalign: 'left', align: 'center', columntype: 'textbox' },
    { text: 'DePAAF Date', datafield: 'DePAAFDate', width: 80, cellsalign: 'center', align: 'center' , cellsformat: 'dd-MMM-yy', columntype: 'datetimeinput',
      // validateEverPresentRowWidgetValue: this.fnAddNewValidate,
      // createEverPresentRowWidget: (datafield: string, htmlElement: HTMLElement, popup: any, addCallback: any): HTMLElement => {
      // let container = document.createElement('div');
      //     container.id = 'grdCDtDePAAFDate';
      //     container.style.border = 'none';
      //     htmlElement[0].appendChild(container);
      //     let options = {
      //         width: '100%', height: 30, value: null,
      //         popupZIndex: 999999, placeHolder: 'Enter Date: '
      //     };
      //     this.grdCDtDePAAFDate = jqwidgets.createInstance('#grdCDtDePAAFDate', 'jqxDateTimeInput', options);
      //     return container;
      // },
      // initEverPresentRowWidget: (datafield: string, htmlElement: HTMLElement): void => {
      // },
      // getEverPresentRowWidgetValue: (datafield: string, htmlElement: HTMLElement, validate: any): any => {
      //     let value = this.grdCDtDePAAFDate.val();
      //     return value;
      // },
      // resetEverPresentRowWidgetValue: (datafield: string, htmlElement: HTMLElement): void => {
      //     this.grdCDtDePAAFDate.val(null);
      // },
    },
    { text: 'Demobilized Date', datafield: 'DemobilizedDate', width: 80, cellsalign: 'center', align: 'center' , cellsformat: 'dd-MMM-yy', columntype: 'datetimeinput',
      // validateEverPresentRowWidgetValue: this.fnAddNewValidate,
      // createEverPresentRowWidget: (datafield: string, htmlElement: HTMLElement, popup: any, addCallback: any): HTMLElement => {
      // let container = document.createElement('div');
      //     container.id = 'grdCDtDemobilizedDate';
      //     container.style.border = 'none';
      //     htmlElement[0].appendChild(container);
      //     let options = {
      //         width: '100%', height: 30, value: null,
      //         popupZIndex: 999999, placeHolder: 'Enter Date: '
      //     };
      //     this.grdCDtDemobilizedDate = jqwidgets.createInstance('#grdCDtDemobilizedDate', 'jqxDateTimeInput', options);
      //     return container;
      // },
      // initEverPresentRowWidget: (datafield: string, htmlElement: HTMLElement): void => {
      // },
      // getEverPresentRowWidgetValue: (datafield: string, htmlElement: HTMLElement, validate: any): any => {
      //     let value = this.grdCDtDemobilizedDate.val();
      //     return value;
      // },
      // resetEverPresentRowWidgetValue: (datafield: string, htmlElement: HTMLElement): void => {
      //     this.grdCDtDemobilizedDate.val(null);
      // },
    },
    { text: 'Work Hrs', datafield: 'PerDayHrs', width: 70, cellsalign: 'center', align: 'center' , hidden: false, exportable: true, editable: true, columntype: 'textbox',
    },
    { text: 'ID Code', datafield: 'IDCode', width: 70, cellsalign: 'center', align: 'center' , hidden: false, exportable: true, editable: true, columntype: 'textbox',
    },
    { text: 'Remarks' , datafield: 'ProjectRemarks', width: 160 , cellsalign: 'left', align: 'center', columntype: 'textbox' },

  ];



  fetchPAFReg(isRefresh: boolean) {

    this.pafService.getPAFReg().subscribe(result => {
      this.grdData = result['data'];
      // if(!isRefresh){
        this.source  = {
          localdata: this.grdData,
          datatype: 'json',
          datafields: [
            { name: 'PAF_ID', type: 'number' },
            { name: 'PAAFNo', type: 'string' },
            { name: 'Rev', type: 'string' },
            { name: 'EmpID', type: 'string' },
            { name: 'PAFDate', type: 'date' },
            { name: 'Name', type: 'string' },
            { name: 'Position', type: 'string' },
            { name: 'ExpLevel', type: 'string' },
            { name: 'TransportAllowance', type: 'string' },
            { name: 'ContractNO', type: 'string' },
            { name: 'CallOffNO', type: 'string' },
            { name: 'CTRNO', type: 'string' },
            { name: 'OrgChartIDNo', type: 'string' },
            { name: 'OrgChartPositionTitle', type: 'string' },
            { name: 'OCDepart', type: 'string' },
            { name: 'OCSubDepartment', type: 'string' },
            { name: 'TimesheetProject', type: 'string' },
            { name: 'ROOTimesheetProjectRef', type: 'string' },
            { name: 'SNCTimesheetProject_Ref', type: 'string' },
            { name: 'OvertimeReq', type: 'string' },
            { name: 'OvertimeReqRefer', type: 'string' },
            { name: 'EX_LN', type: 'string' },
            { name: 'DirectIndirect', type: 'string' },
            { name: 'ProjectAssign', type: 'string' },
            { name: 'Nationality', type: 'string' },
            { name: 'RequestLetterNO', type: 'string' },
            { name: 'AprrovalLetterNO', type: 'string' },
            { name: 'StaffAgency', type: 'string' },
            { name: 'ContractPositionTitle', type: 'string' },
            { name: 'Discipline', type: 'string' },
            { name: 'Category', type: 'string' },
            { name: 'KeyPersonnel', type: 'string' },
            { name: 'Project', type: 'string' },
            { name: 'ServicesLocation', type: 'string' },
            { name: 'StartDtActual', type: 'date' },
            { name: 'EffectiveDt', type: 'date' },
            { name: 'PAAFEndDt', type: 'date' },
            { name: 'ContractRate', type: 'number' },
            { name: 'OvertimePaid', type: 'string' },
            { name: 'DiscountedRate', type: 'number' },
            { name: 'PAAFStatus', type: 'string' },
            { name: 'EmployeeStatus', type: 'string' },
            { name: 'SubmittedDate', type: 'date' },
            { name: 'ApprovedDate', type: 'date' },
            { name: 'DePAAFDate', type: 'date' },
            { name: 'DemobilizedDate', type: 'date' },
            { name: 'PerDayHrs', type: 'number' },
            { name: 'MonthlyRate', type: 'number' },
            { name: 'IDCode', type: 'string' },
            { name: 'Remarks', type: 'string' },
            { name: 'InCntryRateMin', type: 'number' },
            { name: 'InCntryRate', type: 'number' },
            { name: 'OutCntryRateMin', type: 'number' },
            { name: 'OutCntryRate', type: 'number' },
            { name: 'AssignDetail', type: 'string' },
            { name: 'CVAttached', type: 'string' },
          ],
          pagesize: 15,
        };
      // }else{
      //   this.grdPAF.updatebounddata();
      // }
      this.dataAdapter = new jqx.dataAdapter(this.source);
      // console.log(this.grdData);
      if (isRefresh == true) {
        this.grdPAF.updatebounddata();
      }
    }, err => {
      console.log(err);
      this.msgService.show(err, 'ERROR',
        {status: 'danger', destroyByClick: true, duration: 8000, hasIcon: true},
        );
    });
  }


  evtGrdClearFilter() {
    this.grdPAF.clearfilters();
  }

  evtGrdExportXL() {
    this.grdPAF.exportdata('xls', 'PAF-Register');
  }

  evtGrdAdd() {

    this.dialogService.open(AddPafComponent,
    {
      context: {},
    }).onClose.subscribe(isadded => {
      if (isadded == true) {
        this.fetchPAFReg(true);
      }
    });
  }

  evtDelete() {

    if (this.grdSelectRwId >= 0) {
      const pafid = this.grdPAF.getcellvalue(this.grdSelectRwId, 'PAF_ID');
      this.dialogService.open(ConfirmdialogComponent,
        {
          context: {
            IsConfirm: true,
            title: 'Confirm',
            message: 'Are you sure you want to delete :' + pafid + ' ?',
          },
        })
        .onClose.subscribe(result => {
          if (result == true) {

            const delData = {'PAF_ID' : pafid};
            this.pafService.delPAFReg(delData).subscribe(rs => {
              if (rs && rs['code'] == 200) {
                this.msgService.show(rs['message'], 'Success',
                  {status: 'success', destroyByClick: true, duration: 5000, hasIcon: true},
                  );
                  this.grdPAF.deleterow(this.grdSelectRwId);
                  this.grdSelectRwId = -1;
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
          }
        });
    } else {
      this.dialogService.open(ConfirmdialogComponent,
        {
          context: {
            title: 'Alert',
            message: 'Please select a row to delete',
          },
        });
    }


  }

  evtCellBeginEdit(event: any): void {
     const args = event.args;
     // console.log(args);
    // if (args.datafield === 'firstname') {
    //     this.rowValues = '';
    // }
    // this.rowValues += args.value.toString() + '    ';
    // if (args.datafield === 'price') {
    //     this.cellBeginEditLog.nativeElement.innerHTML = 'Begin Row Edit: ' + (1 + args.rowindex) + ', Data: ' + this.rowValues;
    // }
  }

  rowValues: any;
  evtOnCellEndEdit(event: any): void {
    const args = event.args;
    const key = args.datafield;

    // console.log(args);
    if ((args.value != args.oldvalue)  && (args.oldvalue !==  undefined) && (args.oldvalue !== null)) {
      // console.log(key);
      // console.log(args);
      // console.log(colType);
      // console.log(args.oldvalue);
      // console.log(args.value);
      // console.log(dt);
      // console.log(this.grdPAF.getcolumn(key));
      const dt = {};
      const rIdxvalue = this.grdPAF.getcellvalue(args.rowindex, 'PAF_ID');
      dt['ID'] = rIdxvalue;
      dt['ctype'] = this.GetColType(key);
      dt['cname'] = key;
      let dtOld, dtNew;
      if (dt['ctype'] == 'date') {
        dtOld = this.formatDate(args.oldvalue);
        dtNew = this.formatDate(args.value);
      } else {
        dtOld =  args.oldvalue;
        dtNew = args.value;
      }
      dt['cval'] = dtNew;
      dt['cOldval'] = dtOld;
      this.pafService.uptPAFReg(dt).subscribe(result => {
        if (result['code'] != 200) {
          this.msgService.show(result['message'], 'ERROR',
          {status: 'danger', destroyByClick: true, duration: 8000, hasIcon: true},
          );
        }
      }, err => {
        this.msgService.show(err, 'ERROR',
          {status: 'danger', destroyByClick: true, duration: 8000, hasIcon: true},
          );
      });
      }

    this.rowValues += args.value;
  }

  evtGrdOnRowSelect(event: any): void {
    // console.log('RowSelect');
    // console.log(event.args.rowindex);

    this.grdSelectRwId = event.args.rowindex;
    console.log(this.grdSelectRwId);
  }

  evtGrdOnRowUnselect(event: any): void {
    // console.log('RowUnselect');
    // console.log(event.args.rowindex);
    // this.myGrid.clearselection();
  }

  formatDate(date) {
    let d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('-');
  }

  GetColType(colName) {
    return this.source['datafields'].filter(obj => obj['name'] == colName)[0]['type'];
  }

}
