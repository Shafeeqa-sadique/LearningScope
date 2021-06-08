import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import {  NbToastrService, NbDialogService  } from '@nebular/theme';
import { ConfirmdialogComponent } from '../modal-overlays/confirmdialog/confirmdialog.component';
import { TsGrdButtonComponent } from '../ts-grd-button/ts-grd-button.component';
import { TsGrdDdlComponent } from '../ts-grd-ddl/ts-grd-ddl.component';
import { TsGrdTxtnumberComponent } from '../ts-grd-txtnumber/ts-grd-txtnumber.component';

import { SPXlstService } from '../../../services/SPXlst.service';
import { GlbVarService } from '../../../../src/services/glbvar.service';
import { LogininfoService } from '../../../services/logininfo.service';
import { SPXUserInfoService } from '../../../services/SPXuserinfo.service';

import { AgGridAngular } from 'ag-grid-angular';
import { EnvService } from '../../../services/env.service';
import { forkJoin, Observable } from 'rxjs';


@Component({
  selector: 'ngx-ts-create',
  templateUrl: './ts-create.component.html',
  styleUrls: ['./ts-create.component.scss'],
})
export class TsCreateComponent implements OnInit {
   // columnDefs;
  // //grdDefltColDef;
  // postProcessPopup;
  // rowData: any= [];
  // //grdColumns : any;
  // //grdColGrp : any =[];
  // grdColType : any=[];
  //  grdData : any;
  // // source : any;
  // // dataAdapter :any;


  frmGroup: FormGroup;
  frmGrp2: FormGroup;
  dtWk: any = [];
  slctStrtDt: Date;
  slctEndDt: Date;
  isSubmitOk: boolean = false;
  grdCol;
  grdRowData;
  grdApi;
  grdColApi;
  isSubmitProg: boolean = false;

  @ViewChild('grdTS') grdTS: AgGridAngular;
  grdFramewrkComp: any;
  ddlSrcAFE: any[] = [];
  ddlSrcAFEType: any[] = [];

  fileToUpload: File = null;
  flName ;
  atchLink;
  atchFlName;
  _callOffNO;

  _TSCurrStsID;
  _TSNxtStsDraftID;
  _TSNxtStsSubmitID;
  _TSNxtEmail: string;
  _TsNxtStsDesc: string;
  _PgRolID: number;

  dtBtnAction: any[] = [];

  constructor(
    private frmBuild: FormBuilder,
    private srMsg: NbToastrService,
    private srSPXLst: SPXlstService,
    private srGlbVar: GlbVarService,
    private srDialog: NbDialogService,
    public srLoginInfo: LogininfoService,
    public env: EnvService,
    private srUserInfo: SPXUserInfoService,
    ) {
      this.grdFramewrkComp = {
        btnRender: TsGrdButtonComponent,
        ddlRender: TsGrdDdlComponent,
        numericCellEditor: TsGrdTxtnumberComponent,
      };
      this.srUserInfo.getRefreshAuthToken();
     }



  ngOnInit(): void {
    this.prepareForm();

   // this.dramaticWelcome();
    const objUsr = this.srUserInfo.getLoginDtl();
    objUsr.then((rs) => {
      this.srLoginInfo.loginId = rs.loginId;
      this.getDllAFE();
      this.getDllAFEType();
      this.getPAFDtl(this.srLoginInfo.loginId);
    });

    const obj = this.srSPXLst.getMRolIDByRoleName(this.srGlbVar.rolSNTSUsr);
    obj.then((rs) => {
      this._PgRolID = rs;
    });
    const objDf = this.srSPXLst.getMStsIDByStatusCode(this.srGlbVar.TSStsCodeDraft);
    objDf.then((rs) => {
      this._TSNxtStsDraftID = rs;
    });
    const objSb = this.srSPXLst.getMStsIDByStatusCode(this.srGlbVar.TSStsCodeSubmit);
    objSb.then((rs) => {
      this._TSNxtStsSubmitID = rs;
    });
  }



  expAsJson() {
    const expParam = {
      suppressQuotes: 'true',
      columnSeparator: ',',
      // customHeader: "array",
      // customFooter: "array",
    };
    const csv = this.grdApi.getDataAsCsv(expParam);
    const json1 = this.srGlbVar.csv2json(csv);
    const obj = JSON.parse(json1);
    obj.forEach(el => {
      const fltAct = this.ddlSrcAFE.filter(a => a.DISP_VALUE == el.AFE);
      el.AFE = fltAct[0].DISP_NAME;
    });
    return obj;
    // let html = this.srGlbVar.json2Html(obj)
    // console.log(html);
  }

   /* ----------------------------- PREPARE FORM ---------------------------- */
  prepareForm() {

    this.frmGroup = this.frmBuild.group({
      tsName: [null],
      dtFrom: [null],
      dtTo: [null],
      tsSts: [null],
      tsAppRmks: [null],
      tsCmts: [null],
    });
    this.frmGrp2 = this.frmBuild.group({
      file: [null],
      lnkAtch: [null],
      TsSubmitRmks: [null],
    });
  }
  _emailPAFInfo = [];
  _TSSumry = {};
  _PAFId =0;
  getPAFDtl(usrId) {
    this.srSPXLst.getPAFReg(usrId).subscribe(rs => {
      const dt = rs.d.results;
      if (dt.length > 0) {
        this._callOffNO = dt[dt.length - 1].CallOffNumber;
        this._PAFId = dt[dt.length - 1].ID;
        const rw = {
          'PAAF No' : dt[dt.length - 1].PAAFNo + '-' + dt[dt.length - 1].Rev,
          'Name' : dt[dt.length - 1].Name,
          'Job Title': dt[dt.length - 1].PAAFJobTitle,
          'Discipline': dt[dt.length - 1].Discipline
        };
        this._emailPAFInfo.push(rw);
        this._TSSumry = {
          Title : dt[dt.length - 1].ContractPositionTitle,
          LkUsrNameId: this.srLoginInfo.loginId,
          ServicesLocation: dt[dt.length - 1].ServicesLocation,
          PAAFNo : dt[dt.length - 1].PAAFNo + '-' + dt[dt.length - 1].Rev,
          CallOffNO : this._callOffNO,
          EmpID : dt[dt.length - 1].EmployeeID,
          Name : dt[dt.length - 1].Name,
          PAFJobTitle : dt[dt.length - 1].PAAFJobTitle,
          OrgChartPositionTitle : dt[dt.length - 1].OrgChartPositionTitle,
          OrgChartIDNo : dt[dt.length - 1].OrgChartIDNo,
          LkPAFId : this._PAFId
        };

      }
  });
  }

  _dtCrrTSSmry :any[]=[];
  getTSSts() {
    const WkId = this.frmGroup.get('tsName').value;
    //this.fnGetTSSmry(WkId,this._callOffNO,this._TSPrj,this.srLoginInfo.loginId)
    this.srSPXLst.getWkTSDaysSmry(WkId,null,null,this.srLoginInfo.loginId).subscribe(rs =>{
      const dt = rs.d.results
      this._dtCrrTSSmry = dt;
      if(dt.length >0){
        this._TSCurrStsID = dt[0].LkStatusCodeId;
        this.getNxtAction(this._TSCurrStsID);
         // GET IS ACTION ENABLED
         this.srSPXLst.getTSStsByRol(this._TSCurrStsID, this._PgRolID, null, null).subscribe(rs1 => {
          const dt1 = rs1.d.results;
          if (dt1.length > 0) {
            this.frmGroup.controls['tsSts'].setValue(dt1[0].Title);
            if (dt1[0].IsAction != undefined)
              this.isSubmitOk = dt1[0].IsAction;
          }
        });
      } else {
        this.isSubmitOk = true;
        const objSb = this.srSPXLst.getMStsIDByStatusCode(this.srGlbVar.TSStsCodeIntial);

        this.frmGroup.controls['tsAppRmks'].setValue(null);
        objSb.then((rs) => {
          console.log('rs')
          console.log(rs)
          this.getNxtAction(rs);
        });
      }
    })
    this.srSPXLst.getTSWkStsByTSPrjRol(null, null, null, null, this.srLoginInfo.loginId, WkId).subscribe(rs => {
        const dt = rs.d.results;
        if (dt.length > 0) {
          this._TSCurrStsID = dt[dt.length - 1].LkStatusCodeId;
          const cmts  = dt[dt.length - 1].Comments;

          // IF THE STATUS IS IN DRAFT
          if (dt[dt.length - 1].LkActionByUsrNameId == this.srLoginInfo.loginId)
            this.frmGrp2.controls['TsSubmitRmks'].setValue(cmts);
          else
            this.frmGroup.controls['tsAppRmks'].setValue(cmts);
        }
    });
  }




  getNxtAction(pCurrStsID) {
     // GET NEXT ACTION DETAILS
     this.srSPXLst.getWFNxtAction(pCurrStsID, this._PgRolID,this.srGlbVar.nxtActionGrpUser).subscribe(rs2 => {
      const dt = rs2.d.results;
      if(dt.length >0){
        this.dtBtnAction = dt;
        this.isSubmitOk = true;
      } else{
        this.dtBtnAction =[];
        this.isSubmitOk = false;
      }
      // if(dt2.length >0){
      //   this._TSNxtEmail = dt2[0].NxtStatusEmail
      //   this._TsNxtStsDesc = dt2[0].NxtStatusDesc
      // }
    });
  }
  getAttach() {
    const WkId = this.frmGroup.get('tsName').value;
    this.srSPXLst.getAttachDtl(this.srLoginInfo.loginId, WkId).subscribe(rs => {
        const dt = rs.d.results;
        if (dt.length > 0) {
           this.srSPXLst.getAttachLink(dt[dt.length - 1].ID).subscribe(rs1 => {
              const dtLk = rs1.d.results;
              if (dtLk.length > 0) {
                this.atchLink = this.env.spxHref + dtLk[dtLk.length - 1].ServerRelativeUrl;
                this.atchFlName = dtLk[dtLk.length - 1].FileName;
              }
           });
        } else
          this.atchLink = null;
    });
  }

  getDllAFEType() {
    this.srSPXLst.getMCode(this.srGlbVar.ddlCodeAFEType).subscribe(rs => {
      this.ddlSrcAFEType = rs.d.results;
      if (this.ddlSrcAFE.length > 0)
        this.getTsName();
    }, err => {
      console.log(err);
      this.srMsg.show(err, 'ERROR',
        {status: 'danger', destroyByClick: true, duration: 8000, hasIcon: true},
        );
    });
  }

  getDllAFE() {
    this.srSPXLst.getMCBS(this.srGlbVar.ddlCodeCBSAFE).subscribe(rs => {
        const dt: any[] = [];
        rs.d.results.forEach(e => {
          const rw = {
            DISP_VALUE: e.ID,
            DISP_NAME: e.TASK_CODE + '-' + e.TASK_DESC,
            ID : e.ID,
            TASK_CODE: e.TASK_CODE,
          };
          dt.push(rw);
        });
        this.ddlSrcAFE = dt;
        if (this.ddlSrcAFEType.length > 0)
          this.getTsName();
    });
  }

  getTsName() {
    this.srSPXLst.getTSMaster(null).subscribe(rs => {
      this.dtWk = rs.d.results;

      if (this.dtWk.length > 0) {
        const dfDt = this.dtWk[this.dtWk.length - 1]['Id'];
        this.frmGroup.controls['tsName'].setValue(dfDt);
        this.setStrtEndDt(dfDt);
        // this.grdGetData(this.slctStrtDt,this.slctEndDt,dfDt);
        this.onPrdSelect(this.slctStrtDt, this.slctEndDt, null);
        this.getAttach();
        this.getTSSts();
        this.getTSData();
      }
    }, err => {
      console.log(err);
      this.srMsg.show(err, 'ERROR',
        {status: 'danger', destroyByClick: true, duration: 8000, hasIcon: true},
        );
    },
    );
  }
  setStrtEndDt(RptID) {
    const flt = this.dtWk.filter(a => a.Id == RptID);
    this.slctStrtDt = flt[0].start_dt;
    this.slctEndDt = flt[0].end_dt;
    this.frmGroup.controls['dtFrom'].setValue(this.srGlbVar.formatDate(this.slctStrtDt));
    this.frmGroup.controls['dtTo'].setValue(this.srGlbVar.formatDate(this.slctEndDt));
  }
  onSelectTsName(value) {
    this.setStrtEndDt(value);
    // let obj = this.srSPXLst.getTSGrdHrsCol(this.slctStrtDt,this.slctEndDt)
    // this.grdColumns = obj['col'];
    // this.grdColGrp = obj['colGrp'];
    // this.grdGetData(this.slctStrtDt,this.slctEndDt,value);
    this.frmReset();
    this.onPrdSelect(this.slctStrtDt, this.slctEndDt, value);
    this.getAttach();
    this.getTSSts();
    this.getTSData();
  }
  frmReset() {
    this.grdRowData = null;
    this.atchLink = null;
    this.isSubmitOk = false;
    this.frmGroup.controls['tsSts'].setValue(null);
    this.frmGroup.controls['tsAppRmks'].setValue(null);
    this.frmGrp2.controls['TsSubmitRmks'].setValue(null);

  }
  grdDefltColDef = {
    flex: 1,
    minWidth: 90,
    resizable: true,
    floatingFilter: false,
    sortable: true,
    editable: true,
    filterParams: {
      buttons: ['clear', 'apply'],
      closeOnApply: true,
    },
    menuTabs: ['filterMenuTab', 'generalMenuTab'],
    // cellClass: 'agGrdCssCell'
    autoHeight: true,
  };
  onPrdSelect(dtStrt: Date, dtEnd: Date, dll) {

    this.grdCol  = [
      {
        headerName: 'ID', custattr: 'TXT',
        field: 'ID',
        filter: 'agNumberColumnFilter',
        hide : true,
      },
      {
        headerName: 'LkUsrNameId', custattr: 'TXT',
        field: 'LkUsrNameId',
        filter: 'agNumberColumnFilter',
        hide : true,
      },
      {
        headerName: 'LkCBSCodeId', custattr: 'TXT',
        field: 'LkCBSCodeId',
        filter: 'agNumberColumnFilter',
        hide : true,
      },
      {
        headerName: 'LkWkNameId',
        field: 'LkWkNameId',
        filter: 'agNumberColumnFilter',
        hide : true,
      },
      {
        headerName: '',
        field: 'delete', custattr: 'NA',
        cellRenderer: 'btnRender',
        cellRendererParams: {
          onClick: this.evtGrdDelete.bind(this),
          label: 'del',
        },
        hide : false,
        suppressSizeToFit: false,
        maxWidth: 35,
        editable: false,
        pinned: 'left',
      },
      {
        headerName: 'CTR Project Code', field: 'LkCBSCodeId', custattr: 'TXT', hide : false,
        cellRenderer: (e) => {
          return this.ddlSrcAFE.find(refData => refData.DISP_VALUE == e.data.LkCBSCodeId)?.DISP_NAME;
        },
        cellEditor: 'ddlRender',
        cellEditorParams: {
          onSelect: (e) => { // console.log('On Select'); // console.log(e);
          },
          dtData: this.ddlSrcAFE,
        },
      },
      {
        headerName: 'Category',  field: 'AFEType', custattr: 'TXT', hide : false,
        cellRenderer: (e) => {
          return this.ddlSrcAFEType.find(refData => refData.DISP_VALUE == e.data.AFEType)?.DISP_NAME;
        },
        cellEditor : 'ddlRender',
        cellEditorParams: {
          onSelect: (e) => { // console.log('On Select'); // console.log(e);
          },
          dtData: this.ddlSrcAFEType,
        },
      },
    ];
    const dyColPrefix = 'WDay';
    const vDtEnd = new Date(dtEnd);
    const vDtSrt = new Date(dtStrt);
    const diffTime = Math.abs(vDtEnd.getTime() - vDtSrt.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const wkday = new Array(7);
    wkday[0] = 'Sun';
    wkday[1] = 'Mon';
    wkday[2] = 'Tue';
    wkday[3] = 'Wed';
    wkday[4] = 'Thu';
    wkday[5] = 'Fri';
    wkday[6] = 'Sat';
    for (let idx = 0; idx <= diffDays; idx++) {
      const dtWk = new Date(vDtSrt);
      dtWk.setDate(vDtSrt.getDate() + idx);
      const WkID = dyColPrefix + idx.toString();
      const flName = this.srGlbVar.formatDate(dtWk);
      const rw = {
        headerName: wkday[dtWk.getDay()], filter: false, custattr: 'DT', hide : false,
        children: [
          {
            headerName: flName, field: WkID, filter: 'agNumberColumnFilter', // agNumberColumnFilter agDateColumnFilter
            cellStyle: function(params) {
              // if (params.value=='Police') {
              //     //mark police cells as red
              //     return {'justify-content': 'center !important','text-align':'center'} ;
              // }
              // return null;
              return { 'text-align': 'center'} ;
          },
          maxWidth: 100,
          cellEditor: 'numericCellEditor',
          },

        ],
      };
      this.grdCol.push(rw);
    }
  }
  onGrdReady(pGrdObj) {
    this.grdApi = pGrdObj.api;
    this.grdColApi = pGrdObj.columnApi;
  }
  getTSData() {
    const vRptID = this.frmGroup.controls['tsName'].value;
    this.srSPXLst.getTSGrdHrsDtl(vRptID, this.srLoginInfo.loginId).subscribe(rs => {
      this.grdRowData = rs.d.results;
      this.grdApi.setRowData(this.grdRowData);
      this.grdApi.sizeColumnsToFit();
    });
  }
  evtGrdSelect(e) {
     console.log(e);
  }

  evtGrdDelete(e) {

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
            message: 'Are you sure, you want to delete the TASK ?',
          },
        })
        .onClose.subscribe(result => {
          if (result == true) {
            this.srSPXLst.DelTS(this.srLoginInfo.authCode, e.rowData.ID).subscribe(rs => {

                this.grdApi.applyTransaction({
                  remove: [e.rowData],
                });
                this.srMsg.show('Task Deleted Successfully!!!!', 'Success',
                  {status: 'success', destroyByClick: true, duration: 5000, hasIcon: true},
                  );
            }, err => {
              this.srMsg.show('Error deleting PAAF, Please contact support' + err, 'Warning',
                {status: 'warning', destroyByClick: true, duration: 8000, hasIcon: false},
                );
            });
          }
        });
    }
  }

  evtGrdAdd() {
    const rwIdx = this.grdApi.getDisplayedRowCount();
    const rw = {
      ID: 0,
    };
    this.grdRowData.push(rw);
    this.grdApi.applyTransaction({
      add: [rw],
         });
    this.grdApi.startEditingCell({
    rowIndex: rwIdx,
    colKey: 'LkCBSCodeId',
    });
    this.grdApi.setFocusedCell(rwIdx, 'LkCBSCodeId', null);
  }

  handleFileInputRMXL(files: FileList) {
    this.fileToUpload = files.item(0);
    this.flName = this.fileToUpload.name;
    //this.frmGrp2.controls['file'].setValue(this.flName);
    console.log(this.flName);
    const reader = new FileReader();
    reader.readAsArrayBuffer(this.fileToUpload );
    reader.onload = () => {
      this.frmGrp2.patchValue({
        file: reader.result,
      });
    };
    const vRptID = this.frmGroup.controls['tsName'].value;

    if (this.flName) {
      if(this.flName.includes('..')){
        this.srMsg.show('Please remove two dots (..) in file name and then try to upload again', 'ERROR',
        {status: 'danger', destroyByClick: true, duration: 10000, hasIcon: true},
        );
        this.flName = null;
      } else if(this.flName.includes('&')){
        this.srMsg.show('Please remove "&" from file name and then try to upload again', 'ERROR',
        {status: 'danger', destroyByClick: true, duration: 10000, hasIcon: true},
        );
        this.flName = null;
      } else{
        const data = {
          Title : this.flName,
          FL_NME: this.flName,
          LkWkNameId: vRptID,
          LkUsrNameId: this.srLoginInfo.loginId,
        };
        this.isSubmitProg = true;
        this.srSPXLst.AddFileMetadata(this.srLoginInfo.authCode, data).subscribe(rs1 => {
          const dtF = rs1.d;
          const fl = this.frmGrp2.get('file').value;
          this.srSPXLst.AddFile(this.srLoginInfo.authCode, fl, this.flName, dtF.ID, true).subscribe(rs => {
            const dt = rs.d;
            this.flName = null;
            this.getAttach();
            this.isSubmitProg = false;
          }, err => {
            this.srMsg.show(err, 'ERROR',
            {status: 'danger', destroyByClick: true, duration: 10000, hasIcon: true},
            );
            this.isSubmitProg = false;
          });
        });
      }
    }
  }

  public onFileChange(event) {
      const fileList: FileList = event.target.files;
      this.flName = event.target.files[0].name;
      // if (fileList.length != 0) {
      //   const files = fileList[0]
      //   this.frmGrp2.patchValue({
      //           file:  files
      //   });
      // }
      const reader = new FileReader();
      if (event.target.files && event.target.files.length) {
        // console.log(event.target.files);
        const FileList: FileList = event.target.files;
        reader.readAsArrayBuffer(FileList.item(0));
        reader.onload = () => {
          this.frmGrp2.patchValue({
            file: reader.result,
          });
        };
      }
    }

    // fnGetTSSmry(pRptId,pCallOf,pTSPrj,pUsrId){
    //   console.log(pCallOf)
    //   console.log(pTSPrj)
    //   this.srSPXLst.getWkTSDaysSmry(pRptId, pCallOf, pTSPrj, pUsrId)
    //   .subscribe(rs => {
    //     this._dtCrrTSSmry = rs.d.results;
    //   })
    // }

    fnTSCnvrtDays(pStsId) {
      const dtNow = this.srGlbVar.dateAheadFix(new Date());
      this._TSSumry['LkWkNameId'] = this.frmGroup.controls['tsName'].value,
      this._TSSumry['LkStatusCodeId'] = pStsId,
      this._TSSumry['WDay0'] = 0;
      this._TSSumry['WDay1'] = 0;
      this._TSSumry['WDay2'] = 0;
      this._TSSumry['WDay3'] = 0;
      this._TSSumry['WDay4'] = 0;
      this._TSSumry['WDay5'] = 0;
      this._TSSumry['WDay6'] = 0;
      this._TSSumry['WDay7'] = 0;
      this._TSSumry['WDay8'] = 0;
      this._TSSumry['WDay9'] = 0;
      this._TSSumry['LastActDt']= dtNow;
      this._TSSumry['LastRmks']=this.frmGrp2.get('TsSubmitRmks').value;
      this._TSSumry['LkActUsrNameId']=this.srLoginInfo.loginId;
      this._TSSumry['LkActRolNameId']=this._PgRolID;
      this._TSSumry['LkPAFId']=this._PAFId;
      this._TSSumry['CallOffNO']='Call';
      this._TSSumry['TSPrj']='TS';

      this.grdApi.forEachNode(node => {
        const dt = node.data;
        const tsCode  = this.ddlSrcAFE.filter( el =>  el.ID == dt['LkCBSCodeId']);
        if (
          (tsCode[0].TASK_CODE !== this.srGlbVar.ddlCBSCodeTransport) &&
           (dt['AFEType']  !== this.srGlbVar.ddlCodeOT)
        ) {
          if (dt['WDay0']) {  this._TSSumry['WDay0'] = (dt['WDay0'] !== 0) ? 1 : null; }
          if (dt['WDay1']) {  this._TSSumry['WDay1'] = (dt['WDay1'] !== 0) ? 1 : null; }
          if (dt['WDay2']) {  this._TSSumry['WDay2'] = (dt['WDay2'] !== 0) ? 1 : null; }
          if (dt['WDay3']) {  this._TSSumry['WDay3'] = (dt['WDay3'] !== 0) ? 1 : null; }
          if (dt['WDay4']) {  this._TSSumry['WDay4'] = (dt['WDay4'] !== 0) ? 1 : null; }
          if (dt['WDay5']) {  this._TSSumry['WDay5'] = (dt['WDay5'] !== 0) ? 1 : null; }
          if (dt['WDay6']) {  this._TSSumry['WDay6'] = (dt['WDay6'] !== 0) ? 1 : null; }
          if (dt['WDay7']) {  this._TSSumry['WDay7'] = (dt['WDay7'] !== 0) ? 1 : null; }
          if (dt['WDay8']) {  this._TSSumry['WDay8'] = (dt['WDay8'] !== 0) ? 1 : null; }
          if (dt['WDay9']) {  this._TSSumry['WDay9'] = (dt['WDay9'] !== 0) ? 1 : null; }
        } else if (dt['AFEType']  === this.srGlbVar.ddlCodeOT) {
          if (dt['WDay0']) {
            this._TSSumry['WDay0'] = this._TSSumry['WDay0'] + this.fnGetOT(dt['WDay0']);
          }
          if (dt['WDay1']) {
            this._TSSumry['WDay1'] = this._TSSumry['WDay1'] + this.fnGetOT(dt['WDay1']);  }
          if (dt['WDay2']) {
            this._TSSumry['WDay2'] = this._TSSumry['WDay2'] + this.fnGetOT(dt['WDay2']);  }
          if (dt['WDay3']) {
            this._TSSumry['WDay3'] = this._TSSumry['WDay3'] + this.fnGetOT(dt['WDay3']);  }
          if (dt['WDay4']) {
            this._TSSumry['WDay4'] = this._TSSumry['WDay4'] + this.fnGetOT(dt['WDay4']); }
          if (dt['WDay5']) {
            this._TSSumry['WDay5'] = this._TSSumry['WDay5'] + this.fnGetOT(dt['WDay5']); }
          if (dt['WDay6']) {
            this._TSSumry['WDay6'] = this._TSSumry['WDay6'] + this.fnGetOT(dt['WDay6']); }
          if (dt['WDay7']) {
            this._TSSumry['WDay7'] = this._TSSumry['WDay7'] + this.fnGetOT(dt['WDay7']); }
          if (dt['WDay8']) {
            this._TSSumry['WDay8'] = this._TSSumry['WDay8'] + this.fnGetOT(dt['WDay8']); }
          if (dt['WDay9']) {
            this._TSSumry['WDay9'] = this._TSSumry['WDay9'] + this.fnGetOT(dt['WDay9']); }
        }
      });
      this.srSPXLst.getWkTSDaysSmry(this._TSSumry['LkWkNameId'], null, null, this.srLoginInfo.loginId)
      .subscribe(rs => {
       const dt = rs.d.results;
      //  const dt = this._dtCrrTSSmry
      console.log('GET sUMMARY')
      console.log(dt)
        if (dt.length > 0) {
          console.log('this._TSSumry')
          console.log(this._TSSumry)
          this.srSPXLst.UptWkTSDays(this.srLoginInfo.authCode, this._TSSumry, dt[0].ID).subscribe( rs => {
            console.log('Summary Update');
            // console.log(rs)
          }, err => {
            this.srMsg.show('Issue in summarizing the timesheet' + err, 'Error',
            {status: 'danger', destroyByClick: true, duration: 8000, hasIcon: false},
            );
          });
        } else {
          this.srSPXLst.AddWkTSDays(this.srLoginInfo.authCode, this._TSSumry).subscribe(rs => {
            console.log('Summary Added');
            // console.log(rs)
          }, err => {
            this.srMsg.show('Issue in summarizing the timesheet' + err, 'Error',
            {status: 'danger', destroyByClick: true, duration: 8000, hasIcon: false},
            );
          });

        }
     });
    }

    fnGetOT(vHrs){
      return (vHrs == 8 ? 1 : ((vHrs > 8) ?  (1+ ((vHrs % 8) * 0.1)) : (vHrs * 0.1)))
    }

    fnDelZero(obj) {
      for (const [key, value] of Object.entries(obj)) {
        if ((key.includes('WDay') && value == 0)) {
          obj[key] = null;
        }
      }
      return obj;
    }

   onSubmitTS(pNxtStsID) {
    const fltr = this.dtWk.filter(a => a.Id == this.frmGroup.get('tsName').value);
    const fltAct = this.dtBtnAction.filter(a => a.LkNxtStatusCodeId == pNxtStsID);
    if (fltr) {

      this.srDialog.open(ConfirmdialogComponent,
        {
          context: {
            IsConfirm: true,
            title: 'Confirm',
            message: 'Are you sure, you want to ' + fltAct[0].CurrStatusDesc + ' ( ' + fltr[0].WkName + ' ) ?',
          },
        })
        .onClose.subscribe(result => {
          if (result == true) {



            let isValid = true;
            let msg = '';
            let rwIdx = 0;
            let rowCnt = 1;
            // validation
            this.grdApi.forEachNode(node => {
              if (isValid) {
                if ((node.data.LkCBSCodeId === undefined) || (node.data.LkCBSCodeId === null)) {
                  isValid = false;
                  msg = 'CTR Project Code is mandatory, please choose the CTR for Task ' + (Number(rowCnt)).toString();
                  rwIdx = node.rowIndex;
                }
                if (isValid) {
                  if ((node.data.AFEType === undefined) || (node.data.AFEType === null)) {
                    isValid = false;
                    msg = 'Category is mandatory, please choose the Category for Task ' + (Number(rowCnt)).toString();
                    rwIdx = node.rowIndex;
                  }
                }
                for (let i = 0; i < this.grdCol.length; i++) {
                  const elCol = this.grdCol[i];
                  if (elCol.custattr == 'DT') {

                  }
                }
              }
              rowCnt = rowCnt + 1;
            });
            const isRowAvail = this.grdApi.getDisplayedRowCount();
            if(isRowAvail <= 0){
              isValid = false;
              msg ='Please add task to submit'
            }
            if (isValid) {
              this.isSubmitProg = true;
              // SUMMARIZE TIMESHEET
              this.fnTSCnvrtDays(pNxtStsID);
              // SUBCRIBE WAIT FOR ALL REQUEST
              let observables: Observable<any>[] =<any>[];
              this.grdApi.forEachNode(node => {
                const dt = node.data;
                const dtID = dt.ID;
                dt['LkWkNameId'] = fltr[0].Id;
                dt['LkUsrNameId'] = this.srLoginInfo.loginId;
                dt['CallOffNo'] = this._callOffNO;
                dt['LkPAFId'] = this._PAFId

                delete dt.LkCBSCode;
                delete dt.Id;
                delete dt.ID;
                delete dt.LkUsrName;
                delete dt.LkWkName;
                console.log(dtID);
                if (dtID == 0) {
                  observables.push(this.srSPXLst.AddTS(this.srLoginInfo.authCode, dt))
                } else{
                  observables.push(this.srSPXLst.UptTS(this.srLoginInfo.authCode, dt, dtID))
                }
              })

              forkJoin(observables).subscribe(rsArr => {
                  // All observables in `observables` array have resolved and `dataArray` is an array of result of each observable
                  console.log('rsArr');
                  //this.uptChangeSts(fltr[0].WkName, pNxtStsID);
                  this.fnSendEmail(fltr[0].WkName, pNxtStsID);
              });

            } else {

              this.srDialog.open(ConfirmdialogComponent,
                {
                  context: {
                    IsConfirm: false,
                    title: 'Info',
                    message: msg,
                  },
                })
                .onClose.subscribe(result => {
                    this.grdApi.startEditingCell({
                      rowIndex: rwIdx,
                      colKey: 'LkCBSCodeId',
                    });
                    this.grdApi.setFocusedCell(rwIdx, 'LkCBSCodeId');
                });
            }
          }
        });
    }
  }

  fnSendEmail(pTSName, pNxtStsID){
    const flt = this.dtBtnAction.filter(a => a.LkNxtStatusCodeId == pNxtStsID);
    let dsNxtDesc = '';
    if (flt.length > 0) {
      dsNxtDesc = flt[0].NxtStatusDesc;
    }
    if (
      (this._TSCurrStsID !== pNxtStsID) &&
      (flt[0].NxtStatusEmail != null)
      ) {

        this.srSPXLst.addSendNxtStatusEmail(
        this.srLoginInfo.loginUsrName, dsNxtDesc,
        pNxtStsID, flt[0].NxtActionOnlyToUsr,
        pTSName, this.frmGroup.get('tsName').value, this.srLoginInfo.loginId,
        flt[0].NxtStatusEmail,
        this.expAsJson(),
        this._emailPAFInfo,
        this.frmGrp2.controls['TsSubmitRmks'].value,
        null, null
        );
    }
    this.isSubmitProg = false;
    this.srMsg.show(pTSName + ' - ' + dsNxtDesc + ' Successfully', 'Success',
        {status: 'success', destroyByClick: true, duration: 5000, hasIcon: true},
        );
    this.getTSSts();
  }

  isStsCalled = false;
  uptChangeSts(pTSName, pNxtStsID) {
    const dtNow = this.srGlbVar.dateAheadFix(new Date());
    const rw = {
      CallOffNo: this._callOffNO,
      SubmitDt: dtNow,
      Comments: this.frmGrp2.get('TsSubmitRmks').value,
      LkStatusCodeId: pNxtStsID,
      LkWkNameId: this.frmGroup.get('tsName').value,
      LkTsUsrNameId: this.srLoginInfo.loginId,
      LkActionByUsrNameId: this.srLoginInfo.loginId,
      LkActionByRoleNameId: this._PgRolID,
    };
    const flt = this.dtBtnAction.filter(a => a.LkNxtStatusCodeId == pNxtStsID);
    this.srSPXLst.AddTSSts(this.srLoginInfo.authCode, rw).subscribe(rs => {
      if (rs !== null) {
        this.isSubmitProg = false;
        let dsNxtDesc = '';
        if (flt.length > 0) {
          dsNxtDesc = flt[0].NxtStatusDesc;
        }
        if (
          (this._TSCurrStsID !== pNxtStsID) &&
          (flt[0].NxtStatusEmail != null)
          ) {
          this.srSPXLst.addSendNxtStatusEmail(
            this.srLoginInfo.loginUsrName, dsNxtDesc,
            pNxtStsID, flt[0].NxtActionOnlyToUsr,
            pTSName, this.frmGroup.get('tsName').value, this.srLoginInfo.loginId,
            flt[0].NxtStatusEmail,
            this.expAsJson(),
            this._emailPAFInfo,
            this.frmGrp2.controls['TsSubmitRmks'].value,
            null, null
            );
        }
        this.srMsg.show(pTSName + ' - ' + dsNxtDesc + ' Successfully', 'Success',
            {status: 'success', destroyByClick: true, duration: 5000, hasIcon: true},
            );
        this.getTSSts();
      }
    }, err => {
      this.srMsg.show('Error adding PAAF, Please contact support' + err, 'Error',
        {status: 'danger', destroyByClick: true, duration: 8000, hasIcon: false},
        );
    });
  }

  getAllRows() {
    const rowData = [];
    this.grdApi.forEachNode(node => rowData.push(node.data));
    return rowData;
  }

  evtRefresh() {
    console.log('ref');
  }


  delay(milliseconds: number, count: number): Promise<number> {
    return new Promise<number>(resolve => {
            setTimeout(() => {
                resolve(count);
            }, milliseconds);
        });
}


// async function always returns a Promise
async  dramaticWelcome(): Promise<void> {
    console.log('Hello');
    for (let i = 0; i < 5; i++) {
        // await is converting Promise<number> into number
        const count: number = await this.delay(500, i);
        console.log(count);
    }
    console.log('World!');
}



}
