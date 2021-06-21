import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild, ViewEncapsulation  } from '@angular/core';
import {  NbToastrService, NbDialogService, NbWindowRef, NbWindowService  } from '@nebular/theme';
import { FormGroup, FormBuilder } from '@angular/forms';

import { AgGridAngular } from 'ag-grid-angular';
import { TsGrdButtonComponent } from '../ts-grd-button/ts-grd-button.component';
import { TsGrdDdlComponent } from '../ts-grd-ddl/ts-grd-ddl.component';
import { TsGrdTxtnumberComponent } from '../ts-grd-txtnumber/ts-grd-txtnumber.component';
import { ConfirmdialogComponent } from '../modal-overlays/confirmdialog/confirmdialog.component';

import { SPXlstService } from '../../../services/SPXlst.service';
import { GlbVarService } from '../../../../src/services/glbvar.service';
import { LogininfoService } from '../../../services/logininfo.service';
import { EnvService } from '../../../services/env.service';
import { forkJoin, Observable } from 'rxjs';

@Component({
  selector: 'ngx-ts-uc-tsview',
  templateUrl: './ts-uc-tsview.component.html',
  styleUrls: ['./ts-uc-tsview.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TsUcTsviewComponent implements OnInit, OnChanges {

  @Input() inWeekID: number;
  @Input() inUserID: number;
  @Input() inRolID: number;
  @Output() onReloadTree = new EventEmitter<any>();

  constructor(
    private srSPXLst: SPXlstService,
    private srMsg: NbToastrService,
    private srGlbVar: GlbVarService,
    private srDialog: NbDialogService,
    public srLoginInfo: LogininfoService,
    private frmBuild: FormBuilder,
    public env: EnvService,
    protected ref: NbWindowRef
  ) {
    this.grdFramewrkComp = {
      btnRender: TsGrdButtonComponent,
      ddlRender: TsGrdDdlComponent,
      numericCellEditor: TsGrdTxtnumberComponent,
    };
  }

  frmGrp: FormGroup;
  cmAtchLink = null;
  cmAtchName = null;
  cmWkID = null;
  cmUsrID = null;
  isSubmitProg: boolean = false;
  isSubmitOk: boolean = false;

  _callOffNO;
  _TSPrj;
  _WkName;
  _TSCurrStsID;

  dtWk: any = [];
  ddlSrcAFE: any[] = [];
  ddlSrcAFEType: any[] = [];
  ddlSrcTransType: any[] = [];
  dtNxtActionBtn: any[] = [];


  grdCol;
  grdRowData;
  grdApi;
  grdColApi;

  @ViewChild('grdTS') grdTS: AgGridAngular;
  grdFramewrkComp: any;

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


  ngOnChanges(changes: SimpleChanges): void {
    if ((changes.inWeekID !== undefined) &&
       (changes.inWeekID !== null)) {
        const wkID = changes.inWeekID.currentValue;
        this.cmWkID = wkID;
       }
    if (
       (changes.inUserID !== undefined) &&
       (changes.inUserID !== null)
      ) {
        const usrID = changes.inUserID.currentValue;
        this.cmUsrID = usrID;
    }
    // this.fnResetForm();

    console.log(changes)

    this.loadTS(this.cmWkID, this.cmUsrID);
  }

  public loadTS(pWkId, pUsrId) {
    // if (this.grdApi != null)
    //   this.grdApi.setRowData([]);

    this.getPAF(pUsrId);
    this.getTsName(pWkId);
    this.getAttach(pUsrId, pWkId);
  }

  ngOnInit(): void {
    // this.getDllAFEType();
    // this.getDllAFE();

    this.prepareForm();
    this.cmWkID = this.inWeekID;
    this.cmUsrID = this.inUserID;
    //this.getTsName(this.cmWkID);
    this.loadTS(this.cmWkID, this.cmUsrID);

  }

   /* ----------------------------- PREPARE FORM ---------------------------- */
   prepareForm() {
    this.frmGrp = this.frmBuild.group({
      ctName: [null],
      ctPAF: [null],
      ctJobTitle: [null],
      ctDt: [null],
      ctRmks: [null],
      TsSubmitRmks: [null],
      file: [null]
    });
  }

  fnResetForm() {
    this.prepareForm();
    this.cmAtchLink = null;
    this.grdRowData = null;
    this.grdCol = null;
  }

  getTSData(pRptID, pUsrID) {
    this.isSubmitProg = true;
    this.srSPXLst.getTSGrdHrsDtl(pRptID, pUsrID).subscribe(rs => {
      this.grdRowData = rs.d.results;
      const trsID = this.ddlSrcAFE.filter(el => el.TASK_CODE == this.srGlbVar.ddlCBSCodeTransport)[0].DISP_VALUE;
      // CHECK FOR TRANSPORT ALLOWANCE RECORD ALREADY ADDED IF NOT ADD IT
      const rwFlt = this.grdRowData.filter(el => el.LkCBSCodeId == trsID);

      if ((rwFlt.length <= 0) && (this.grdRowData.length > 0)) {
        const rw = {
          ID: 0,
          LkWkNameId: this.cmWkID,
          LkUsrNameId: this.cmUsrID,
          LkCBSCodeId: trsID,
          WDay0: 1,
          WDay1: 1,
          WDay2: 1,
          WDay3: 1,
          WDay4: 1,
          WDay5: 1,
          WDay6: 1,
          WDay7: 1,
          WDay8: 1,
          WDay9: 1,
        };
        this.grdRowData.push(rw);
      }
      this.grdApi.setRowData(this.grdRowData);
      this.grdApi.sizeColumnsToFit();
      this.isSubmitProg = false;
    });
    // this.srSPXLst.getTSWkStsByTSPrjRol(null, null, null, true, pUsrID, pRptID).subscribe(rs => {
    //   const dt = rs.d.results;
    //   if (dt.length > 0) {
    //     this.frmGrp.controls['ctRmks'].setValue(dt[0].Comments);
    //     this.frmGrp.controls['ctDt'].setValue(this.srGlbVar.formatDate(dt[0].SubmitDt));
    //     this._TSCurrStsID = dt[dt.length - 1].LkStatusCodeId;
    //     this.getNxtAction(this._TSCurrStsID);
    //   }
    // });
    this.getTSSmry(this.cmWkID,this.cmUsrID,null,null);
  }

  getNxtAction(pCurrStsID) {
    // GET NEXT ACTION DETAILS
    this.srSPXLst.getWFNxtAction(pCurrStsID, this.inRolID,this.srGlbVar.nxtActionGrpUser).subscribe(rs2 => {
     this.dtNxtActionBtn = rs2.d.results;
     if (this.dtNxtActionBtn.length > 0)
        this.isSubmitOk = true;
      else
        this.isSubmitOk = false;
   });
  }

  onActionSubmit(pNxtStsID) {
    const fltAct = this.dtNxtActionBtn.filter(a => a.LkNxtStatusCodeId == pNxtStsID);
    this.srDialog.open(ConfirmdialogComponent,
      {
        context: {
          IsConfirm: true,
          title: 'Confirm',
          message: 'Are you sure, you want to ' + fltAct[0].CurrStatusDesc + ' ( ' + this.frmGrp.controls['ctName'].value + ' ) Timesheet ?',
        },
      })
      .onClose.subscribe(result => {
        if (result == true) {
          const dtNow = this.srGlbVar.dateAheadFix(new Date());
          const rwSumSts ={
            LkStatusCodeId: pNxtStsID,
            LkWkNameId: this.cmWkID,
            LkUsrNameId: this.cmUsrID,
            LastActDt: dtNow,
            LastRmks: this.frmGrp.get('TsSubmitRmks').value,
            LkActUsrNameId: this.srLoginInfo.loginId,
            LkActRolNameId: this.inRolID
          }
          this.isSubmitProg = true;
          this.fnUpdSummary(rwSumSts,this._smryID)
          // SUBCRIBE WAIT FOR ALL REQUEST
          let observables: Observable<any>[] =<any>[];
          this.grdApi.forEachNode(node => {
            const dt = node.data;
            const dtID = dt.ID;
            dt['LkWkNameId'] = this.cmWkID;
            dt['LkUsrNameId'] = this.cmUsrID;
            dt['CallOffNo'] = this._callOffNO;
            dt['TSPrj'] = this._TSPrj;
            delete dt.LkCBSCode;
            delete dt.Id;
            delete dt.ID;
            delete dt.LkUsrName;
            delete dt.LkWkName;
            if (dtID == 0) {
              observables.push(this.srSPXLst.AddTS(this.srLoginInfo.authCode, dt))
            } else {
              observables.push(this.srSPXLst.UptTS(this.srLoginInfo.authCode, dt, dtID))
            }
          });
          forkJoin(observables).subscribe(rsArr => {
            this.isSubmitProg = false;
            this.uptChangeSts(this._WkName, pNxtStsID);
          });

          /**##**/
          /*
          this.grdApi.forEachNode(node => {
            const dt = node.data;
            const dtID = dt.ID;
            dt['LkWkNameId'] = this.cmWkID;
            dt['LkUsrNameId'] = this.cmUsrID;
            dt['CallOffNo'] = this._callOffNO;
            dt['TSPrj'] = this._TSPrj;
            delete dt.LkCBSCode;
            delete dt.Id;
            delete dt.ID;
            delete dt.LkUsrName;
            delete dt.LkWkName;
            let uptRowCnt = 1;
            if (dtID == 0) {

              this.srSPXLst.AddTS(this.srLoginInfo.authCode, dt).subscribe(rs => {
                    this.uptChangeSts(this._WkName, pNxtStsID);
                }, err => {
                  this.srMsg.show('Error adding PAAF, Please contact support' + err, 'Error',
                    {status: 'danger', destroyByClick: true, duration: 8000, hasIcon: false},
                    );
                });
            } else {
              this.srSPXLst.UptTS(this.srLoginInfo.authCode, dt, dtID).subscribe(rs => {
                    this.uptChangeSts(this._WkName, pNxtStsID);
                }, err => {
                  this.srMsg.show('Error adding PAAF, Please contact support' + err, 'Error',
                    {status: 'danger', destroyByClick: true, duration: 8000, hasIcon: false},
                    );
                });
            }
            uptRowCnt = uptRowCnt + 1;
          });
          */
          /**##**/
        }
      });
  }

  fnUpdSummary(pSmryUpt,pDayId){
    //UPDATE USER SUMMARY TABLE STATUS
    this.srSPXLst.UptWkTSDays(this.srLoginInfo.authCode,pSmryUpt,pDayId).subscribe(rs =>{

    }, err => {
      this.srMsg.show('Issue in summarizing the timesheet' + err, 'Error',
      {status: 'danger', destroyByClick: true, duration: 8000, hasIcon: false},
      );
    });

  }

  _smryID =0;
  getTSSmry(pWkID,pUsrID,pCalOf,pTSPrj){
    this.srSPXLst.getWkTSDaysSmry(pWkID, pCalOf, pTSPrj, pUsrID)
      .subscribe(rs => {
        const dt = rs.d.results;
        if (dt.length > 0) {
          this._smryID =dt[0].ID;
          this.frmGrp.controls['ctRmks'].setValue(dt[0].LastRmks);
          this.frmGrp.controls['ctDt'].setValue(this.srGlbVar.formatDate(dt[0].LastActDt));
          this._TSCurrStsID = dt[dt.length - 1].LkStatusCodeId;
          this.getNxtAction(this._TSCurrStsID);
        }
    })
  }

  uptChangeSts(pTSName, pNxtStsID) {
    this.isSubmitProg = true;
    const dtNow = this.srGlbVar.dateAheadFix(new Date());
    const rw = {
      CallOffNo: this._callOffNO,
      TSPrj: this._TSPrj,
      SubmitDt: dtNow,
      Comments: this.frmGrp.get('TsSubmitRmks').value,
      LkStatusCodeId: pNxtStsID,
      LkWkNameId: this.cmWkID,
      LkTsUsrNameId: this.cmUsrID,
      LkActionByUsrNameId: this.srLoginInfo.loginId,
      LkActionByRoleNameId: this.inRolID,
    };
      const flt = this.dtNxtActionBtn.filter(a => a.LkNxtStatusCodeId == pNxtStsID);
      this.srSPXLst.AddTSSts(this.srLoginInfo.authCode, rw).subscribe(rs => {
        this.isSubmitProg = true;
        if (rs !== null) {

          let dsNxtDesc = '';
          if (flt.length > 0) {
            dsNxtDesc = flt[0].NxtStatusDesc;
          }
          if (
            (this._TSCurrStsID !== pNxtStsID) &&
            (flt[0].NxtStatusEmail != null)
            ) {
            this.srSPXLst.addSendNxtStatusEmail(
              this.srLoginInfo.loginUsrName, dsNxtDesc, pNxtStsID,
              flt[0].NxtActOnlyToUsr,
              pTSName, this.cmWkID, this.cmUsrID,
              flt[0].NxtStatusEmail,
              this.expGrdAsJson(), this._emailPAFInfo,
              this.frmGrp.controls['TsSubmitRmks'].value
              , null, null,
              );
          }
          this.fnReset();
          this.loadTS(this.cmWkID,this.cmUsrID)
          this.onReloadTree.next(this.cmWkID);
          this.srMsg.show(pTSName + ' - ' + dsNxtDesc + ' Successfully', 'Success',
              {status: 'success', destroyByClick: true, duration: 5000, hasIcon: true},
              );

        }
      }, err => {
        this.srMsg.show('Error adding PAAF, Please contact support' + err, 'Error',
          {status: 'danger', destroyByClick: true, duration: 8000, hasIcon: false},
          );
      });
  }

  fnReset() {
    this.frmGrp.controls['TsSubmitRmks'].setValue('');
    this.isSubmitProg = false;
  }

  expGrdAsJson() {
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
      const fltAct = this.ddlSrcAFE.filter(a => a.DISP_VALUE == el['CTR Project Code']);
      el['CTR Project Code'] = fltAct[0].DISP_NAME;
    });
    return obj;
  }

  fnConvertCBS(dtIn) {
    const dt: any[] = [];
    dtIn.forEach(e => {
      const rw = {
        DISP_VALUE: e.ID,
        DISP_NAME: e.TASK_CODE + '-' + e.TASK_DESC,
        TASK_CODE: e.TASK_CODE,
      };
      dt.push(rw);
    });
    return dt;
  }

  getTsName(pWkId) {
    this.srSPXLst.getTSMaster(null).subscribe(rs => {
      this.dtWk = rs.d.results;
      if (this.dtWk.length > 0) {
        const flt = this.dtWk.filter(a => a.Id == pWkId);
        this._WkName = flt[0].WkName;
        this.srSPXLst.getTSAdminCode().subscribe(rsType => {
          this.ddlSrcAFEType = rsType[0].d.results;
          this.ddlSrcAFE = this.fnConvertCBS(rsType[1].d.results);
          this.ddlSrcTransType = rsType[2].d.results;
          this.onPrdSelect(flt[0].start_dt, flt[0].end_dt);
        });
      }
    }, err => {
      console.log(err);
      this.srMsg.show(err, 'ERROR',
        {status: 'danger', destroyByClick: true, duration: 8000, hasIcon: true},
        );
    },
    );
  }

  onPrdSelect(dtStrt: Date, dtEnd: Date) {

    const trsID = this.ddlSrcAFE.filter(el => el.TASK_CODE == this.srGlbVar.ddlCBSCodeTransport)[0].DISP_VALUE;
    this.grdCol  = [
      {
        headerName: 'ID',
        field: 'ID',
        filter: 'agNumberColumnFilter',
        hide : true,
      },
      {
        headerName: 'LkUsrNameId',
        field: 'LkUsrNameId',
        filter: 'agNumberColumnFilter',
        hide : true,
      },
      {
        headerName: 'LkCBSCodeId',
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
      // {
      //   headerName: '',
      //   field: 'delete',
      //   cellRenderer: 'btnRender',
      //   cellRendererParams: {
      //     onClick: this.evtGrdDelete.bind(this),
      //     label: 'del'
      //   },
      //   hide : false,
      //   suppressSizeToFit: false,
      //   maxWidth:35,
      //   editable: false,
      //   pinned: 'left'
      // },
      {
        headerName: 'AFE', field: 'LkCBSCodeId', hide : false,
        cellRenderer: (e) => {
          return this.ddlSrcAFE.find(refData => refData.DISP_VALUE == e.data.LkCBSCodeId)?.DISP_NAME;
        },
        editable: false,
        // cellEditor: 'ddlRender',
        // cellEditorParams:{
        //   onSelect: (e)=>{ // console.log('On Select'); // console.log(e);
        //   },
        //   dtData: this.ddlSrcAFE
        // },
      },
      {
        headerName: 'Category',  field: 'AFEType', hide : false,
        cellRenderer: (e) => {
          return this.ddlSrcAFEType.find(refData => refData.DISP_VALUE == e.data.AFEType)?.DISP_NAME;
        },
        editable: false,
        // cellEditor : 'ddlRender',
        // cellEditorParams:{
        //   onSelect: (e)=>{ // console.log('On Select'); // console.log(e);
        //   },
        //   dtData: this.ddlSrcAFEType
        // },
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
        headerName: wkday[dtWk.getDay()], filter: false, hide : false,
        children: [
          {
              headerName: flName, field: WkID, filter: 'agNumberColumnFilter', // agNumberColumnFilter agDateColumnFilter
              cellStyle: function(params) {
                return { 'text-align': 'center'} ;
            },
            maxWidth: 100,
            // cellEditor: 'numericCellEditor',
            // cellEditor: 'agSelectCellEditor',
            cellRenderer: (params) => {
              if (params.data.LkCBSCodeId === trsID) {
                return this.ddlSrcTransType.find(refData => refData.DISP_VALUE == params.data['WDay' + idx.toString()])?.DISP_NAME;
              } else {
                // console.log(params.data["WDay"+dtWk.getDay()])
                return params.data['WDay' + idx.toString()];
              }
            },
            cellEditorParams: {
              onSelect: (e) => { // console.log('On Select'); // console.log(e);
              },
              dtData: this.ddlSrcTransType,
            },
            cellEditorSelector: function(params) {
                if (params.data.LkCBSCodeId === trsID) {
                    return {
                        component: 'ddlRender',
                        params: {
                            // values: ['POC Pass', 'Owned / Rented', 'Contractor / Sharing', 'SNC Rent', 'Off Site']
                            // dtData: this.ddlSrcTransType
                        },
                    };
                }
                return null;
            },
            editable: (params) => {
              // return params.data["id"]>0
              if (params.data.LkCBSCodeId === trsID) {
               return true;
              } else {
                return false;
              }
            },
               // cellEditorParams:{
        //   onSelect: (e)=>{ // console.log('On Select'); // console.log(e);
        //   },
        //   dtData: this.ddlSrcAFEType
        // },
          },

        ],
      };
      this.grdCol.push(rw);
    }
    this.onGrdReady(null);

  }

  _emailPAFInfo = [];
  getPAF(pUsrID) {
    this.srSPXLst.getPAFReg(pUsrID).subscribe(rs => {
      this._emailPAFInfo =[];
      const dt = rs.d.results;
      if (dt.length > 0) {
        this.frmGrp.controls['ctName'].setValue(dt[0].Name);
        this.frmGrp.controls['ctPAF'].setValue(dt[0].PAAFNo + '-' + dt[0].Rev);
        this.frmGrp.controls['ctJobTitle'].setValue(dt[0].PAAFJobTitle);
        this._callOffNO = dt[dt.length - 1].CallOffNumber;
        this._TSPrj = dt[dt.length - 1].TSProject;
        const rw = {
          'PAAF No' : this.frmGrp.controls['ctPAF'].value,
          'Name' : this.frmGrp.controls['ctName'].value,
          'Job Title': this.frmGrp.controls['ctJobTitle'].value,
          'Call Off No': this._callOffNO,
          'Timesheet Project': this._TSPrj,
        };
        this._emailPAFInfo.push(rw);
      }
    }, err => {
      console.log(err);
      this.srMsg.show(err, 'ERROR',
        {status: 'danger', destroyByClick: true, duration: 8000, hasIcon: true},
        );
    },
    );
  }

  getAttach(pUsrId, pWkId) {
    this.isSubmitProg = true;
    this.srSPXLst.getAttachDtl(pUsrId, pWkId).subscribe(rs => {
        const dt = rs.d.results;
        if (dt.length > 0) {
           this.srSPXLst.getAttachLink(dt[dt.length - 1].ID).subscribe(rs1 => {
              const dtLk = rs1.d.results;
              if (dtLk.length > 0) {
                this.cmAtchLink = this.env.spxHref + dtLk[dtLk.length - 1].ServerRelativeUrl;
                this.cmAtchName = dtLk[dtLk.length - 1].FileName;
              }
              this.isSubmitProg = false;
           });
        } else
          this.cmAtchLink = null;
    });
  }

  onGrdReady(pGrdObj) {
    if (pGrdObj != null) {
      this.grdApi = pGrdObj.api;
      this.grdColApi = pGrdObj.columnApi;
    }
    this.getTSData(this.inWeekID, this.inUserID);
  }

  fileToUpload: File = null;
  flName ;
  handleFileInputRMXL(files: FileList) {
    this.fileToUpload = files.item(0);
    this.flName = this.fileToUpload.name;
    //this.frmGrp2.controls['file'].setValue(this.flName);
    console.log(this.flName);
    const reader = new FileReader();
    reader.readAsArrayBuffer(this.fileToUpload );
    reader.onload = () => {
      this.frmGrp.patchValue({
        file: reader.result,
      });
    };
  }

  onUpload(){
    if (this.flName) {
      const data = {
        Title : this.flName,
        FL_NME: this.flName,
        LkWkNameId: this.cmWkID,
        LkUsrNameId: this.cmUsrID,
      };
      this.isSubmitProg = true;
      this.srSPXLst.AddFileMetadata(this.srLoginInfo.authCode, data).subscribe(rs1 => {
        const dtF = rs1.d;
        const fl = this.frmGrp.get('file').value;
        console.log(fl);
        this.srSPXLst.AddFile(this.srLoginInfo.authCode, fl, this.flName, dtF.ID, true).subscribe(rs => {
          const dt = rs.d;
          console.log(dt);
          this.flName = null;
          this.getAttach(this.cmUsrID,this.cmWkID);
        }, err => {
          this.srMsg.show(err, 'ERROR',
          {status: 'danger', destroyByClick: true, duration: 8000, hasIcon: true},
          );
        });
      });
    } else{
      this.srMsg.show('Please choose a file to upload', 'WARNING',
      {status: 'warning', destroyByClick: true, duration: 8000, hasIcon: true},
      );
    }
  }


}
