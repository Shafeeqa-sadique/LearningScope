import {Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, Inject, ComponentRef, ViewContainerRef, ComponentFactoryResolver  } from '@angular/core';
import {  NbThemeService, NbToastrService } from '@nebular/theme';
// import { takeWhile } from 'rxjs/operators' ;
// import { SolarData } from '../../@core/data/solar';
import { FormControl } from '@angular/forms';

//import { BiReportComponent } from '../bi-report/bi-report.component'

import {  Chart } from 'chart.js';
import { SPXlstService } from '../../../services/SPXlst.service';
import { GlbVarService } from '../../../../src/services/glbvar.service';
import { LogininfoService } from '../../../services/logininfo.service';
import { SPXUserInfoService } from '../../../services/SPXuserinfo.service';
import { XlService } from '../../../services/xl.service';



// interface CardSettings {
//   title: string;
//   iconClass: string;
//   type: string;
// }

@Component({
  selector: 'ngx-dashboard',
  styleUrls: ['./dashboard.component.scss'],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit {

  barChart = [];
  dtTSPrj: any = [];
  dtWk: any = [] = [];
  ddlTsName = new FormControl('');
  ddlTsSlctItem;
  rolIsUser;
  dtMRol: any[] = [];

  @ViewChild('myChart', { static: false }) ctx: Chart;
  @ViewChild('iframe') iframe: ElementRef;

  // doc: any;
  // compRef: ComponentRef<BiReportComponent>;
  isIframe = false;


  constructor(
    private srSPXLst: SPXlstService,
    private msgService: NbToastrService,
    private srMsg: NbToastrService,
    private srGlbVar: GlbVarService,
    public srLoginInfo: LogininfoService,
    private srUserInfo: SPXUserInfoService,

    private vcRef: ViewContainerRef,
    private resolver: ComponentFactoryResolver,
    private srXl: XlService
    ) {

    }


  ngOnInit(): void {
   this.getDllInfo('CODE_TIMSHET_PRJ');
  //  this.lodChrtCTR(['OR130002', 'OR130053', 'OR130315', 'OR130466']);
  //  this.loadUsrInfo();
    //this.getAccessToken();

  }

  expXL(dtData){
    const cols = Object.keys(dtData[0]);
    let pCol=[];
    cols.forEach(cl =>{
      let colSetting ={
        header: cl.toString(),
        key: cl.toString(),
        width: 10,
        //style: { font: { name: 'Arial Black' }, numFmt: 'dd-MMM-yyyy' }
        style: {  numFmt: 'dd-MMM-yyyy' },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E4E4E4' } }
      }
      pCol.push(colSetting);
    })
    this.srXl.FlatXL("Sample","Weekly Report",dtData,pCol);
  }
  ngAfterViewInit(): void {
    //let token='eyJ0eXAiOiJKV1QiLCJub25jZSI6InhHcHNmWXpwYmdaajlkMkhINExaMXZoYU10YUZ6RDNfMVlRcWNCWGVIbUkiLCJhbGciOiJSUzI1NiIsIng1dCI6Im5PbzNaRHJPRFhFSzFqS1doWHNsSFJfS1hFZyIsImtpZCI6Im5PbzNaRHJPRFhFSzFqS1doWHNsSFJfS1hFZyJ9.eyJhdWQiOiIwMDAwMDAwMy0wMDAwLTAwMDAtYzAwMC0wMDAwMDAwMDAwMDAiLCJpc3MiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC80NjRhYWQyYS02Yjc5LTRjMGEtYmVkNC01ZjkwZTBiNmE2MDcvIiwiaWF0IjoxNjE3Nzc3Mzc5LCJuYmYiOjE2MTc3NzczNzksImV4cCI6MTYxNzc4MTI3OSwiYWNjdCI6MCwiYWNyIjoiMSIsImFjcnMiOlsidXJuOnVzZXI6cmVnaXN0ZXJzZWN1cml0eWluZm8iLCJ1cm46bWljcm9zb2Z0OnJlcTEiLCJ1cm46bWljcm9zb2Z0OnJlcTIiLCJ1cm46bWljcm9zb2Z0OnJlcTMiLCJjMSIsImMyIiwiYzMiLCJjNCIsImM1IiwiYzYiLCJjNyIsImM4IiwiYzkiLCJjMTAiLCJjMTEiLCJjMTIiLCJjMTMiLCJjMTQiLCJjMTUiLCJjMTYiLCJjMTciLCJjMTgiLCJjMTkiLCJjMjAiLCJjMjEiLCJjMjIiLCJjMjMiLCJjMjQiLCJjMjUiXSwiYWlvIjoiQVVRQXUvOFRBQUFBVnN6bGEwbXZaQ0xzenBaMCtSVEYwZFFoOHBmcjFhYXJEVWVBWmljS2hzdzNYQStIVHBHU2oxQllFN1poTnJHVE1VRUxYK2tRWVlYdmdBejU0VlhWMmc9PSIsImFtciI6WyJwd2QiLCJtZmEiXSwiYXBwX2Rpc3BsYXluYW1lIjoiR0NNQyBUaW1lc2hlZXQiLCJhcHBpZCI6IjJkMzIzYTczLTIwNjEtNDBjZC05Mjc3LThlYWJlNjM1NDQwZCIsImFwcGlkYWNyIjoiMCIsImZhbWlseV9uYW1lIjoiS3VtYXJhdmVsdSIsImdpdmVuX25hbWUiOiJQcmFiaHUiLCJpZHR5cCI6InVzZXIiLCJpcGFkZHIiOiI5Mi45OC40OC40NiIsIm5hbWUiOiJLdW1hcmF2ZWx1LCBQcmFiaHUiLCJvaWQiOiI3YjZiNWRkNC1jODE5LTRhMDQtYjEzNi05MTE2OTEyOWQ4ZGMiLCJvbnByZW1fc2lkIjoiUy0xLTUtMjEtMTQ4MDg5NjM4NC0xNDExNjU2NzkwLTIyNDI3MjY2NzYtMTExNjkwOCIsInBsYXRmIjoiMyIsInB1aWQiOiIxMDAzMjAwMDhFNTY4MjFDIiwicmgiOiIwLkFYZ0FLcTFLUm5sckNreS0xRi1RNExhbUIzTTZNaTFoSU0xQWtuZU9xLVkxUkExNEFJNC4iLCJzY3AiOiJVc2VyLlJlYWQgcHJvZmlsZSBvcGVuaWQgZW1haWwiLCJzaWduaW5fc3RhdGUiOlsia21zaSJdLCJzdWIiOiJGWGxsV1o0el83Yl9VMWdMaFdnYzRTV2UwMXJiQWFfWUdfYnJqZTdpUlpJIiwidGVuYW50X3JlZ2lvbl9zY29wZSI6Ik5BIiwidGlkIjoiNDY0YWFkMmEtNmI3OS00YzBhLWJlZDQtNWY5MGUwYjZhNjA3IiwidW5pcXVlX25hbWUiOiJQcmFiaHUuS3VtYXJhdmVsdUBzbmNsYXZhbGluLmNvbSIsInVwbiI6IlByYWJodS5LdW1hcmF2ZWx1QHNuY2xhdmFsaW4uY29tIiwidXRpIjoiMGN2T2ZqMW92VVNBSVpCWUI5TXNBUSIsInZlciI6IjEuMCIsInhtc19zdCI6eyJzdWIiOiJ4N2NFOUR0cjhVa1NXLWZlajNxX2s0TW1xLTE0bko2TWV3a291eE1VeFRNIn0sInhtc190Y2R0IjoxNDA0Njc2NjEwfQ.QR195rE3p_qhWJkKNoUpuzrJO2evfMYJ7BnbUcdHyT4e8MF_eBK_s-CRgLbAN0aG5OssAdPEGI7V3p343oEkHywia4AVdGPIjbiTT1jsz4Tb2MDX_3hxB0eo5QnpAzrK52lFbRYww7-_2l8381_dcsBVGl4lEAM0U33IeQ1FWH-WTeqDRBFqy5sKAX4PYVWzImr2XnH-jMCqGLzQXlVFG5jjPxzLuopIMdCZHcJ9FKM98Lb1l6SKAUXCBEdbiif_5itxV-gMXAUpA3KcUpG-fMPVm2cyoMJMy9S1hL-sH0hWCVbsNsLijgc5pkWQJlKkME2BbUS4aetE7Q20sGp1ew'
    // this.biconfig.getBIToken().subscribe(rs => {
    //   console.log('GetBIToken');
    //   console.log(rs);
    //   this.showReport(rs.token);
    // })
    //this.showReport(token);
  }

  loadUsrInfo() {
    if ((this.srLoginInfo.loginId === null) ||
     (this.srLoginInfo.loginId === undefined)) {
      const objUsr = this.srUserInfo.getLoginDtl();
      objUsr.then((rs) => {
        this.srLoginInfo.loginId = rs.loginId;
        this.srLoginInfo.loginFulName = rs.loginFulName;
        this.srLoginInfo.loginUsrName = rs.loginUsrName;
        this.srLoginInfo.RoleId = rs.RoleId;
        this.getMRol();
      });
    } else {
      this.getMRol();
    }
  }

  getMRol() {
    this.srSPXLst.getMRol(null).subscribe(rs => {
      this.dtMRol = rs.d.results;
      for (let i = 0; i < this.srLoginInfo.RoleId.length; i++) {
        const flt = this.dtMRol.filter(e => e.RoleName == this.srGlbVar.rolSNTSUsr && e.Id == this.srLoginInfo.RoleId[i]);
        if (flt.length > 0)
          this.rolIsUser = true;

        this.getTsName();
      }
    });
  }

  onSelectTsName(pRptId) {
    this.getUsrData(pRptId, this.srLoginInfo.loginId);
  }

  getUsrData(pRptID, pUsrID) {
    const dtSum: any[] = [];
    this.srSPXLst.getTSGrdHrsDtl(pRptID, pUsrID).subscribe(rs => {
      const dt = rs.d.results;
      for (let i = 0; i < dt.length; i++) {
        const el = dt[i];
        const rd = this.fnNum(el['WDay0']) + this.fnNum(el['WDay1']) + this.fnNum(el['WDay2']) + this.fnNum(el['WDay3']) + this.fnNum(el['WDay4']) + this.fnNum(el['WDay5']) + this.fnNum(el['WDay6']) + this.fnNum(el['WDay7']) + this.fnNum(el['WDay8']) + this.fnNum(el['WDay9']);
        const rw = {
          cod: el['LkCBSCode']['TASK_CODE'],
          codType: el.AFEType,
          val: rd,
        };
        if (rw.cod !== this.srGlbVar.ddlCBSCodeTransport)
          dtSum.push(rw);
      }
      const arrCod = dtSum.map(a => a.cod);
      const arrval = dtSum.map(a => a.val);
      //this.lodChrtAFE(arrCod, arrval, 'chrtUsrAFE');
      const arrCodType = this.srGlbVar.getDistinct(dtSum, 'codType');
      const arrCodTypeSum = [];
      arrCodType.forEach(e => {
        let sum = 0;
        dtSum.filter(a => a.codType == e).forEach(b => { sum = sum + b.val; });
        arrCodTypeSum.push(sum);
      });
      //this.lodChrtAFEType(arrCodType, arrCodTypeSum, 'chrtUsrAFEType');
    });
  }

  fnNum(v) {
    if ( isNaN(v))
      return 0;
    else
      return v;
  }

  lodChrtAFE(pLbl, pData, pObjId) {
    const myChart = new Chart('chrtUsrAFE', {
      type: 'bar',
      data: {
          labels: pLbl,
          datasets: [{
              label: '# of Votes',
              data: pData,
              backgroundColor: this.srGlbVar.getChrtBarColor(),
              borderColor: [
                  'rgba(255, 99, 132, 1)',
                  'rgba(54, 162, 235, 1)',
                  'rgba(255, 206, 86, 1)',
                  'rgba(75, 192, 192, 1)',
                  'rgba(153, 102, 255, 1)',
                  'rgba(255, 159, 64, 1)',
              ],
              borderWidth: 1,
          }],
      },
      options: {
                  scales: {
                      yAxes: [{
                          ticks: {
                              beginAtZero: true,
                          },
                      }],
                  },
                  title: {
                    display: false,
                    text: 'Custom Chart Title',
                },
                legend: {
                  position: 'bottom',
                  display: false,
                },
                'hover': {
                  'animationDuration': 0,
                },
                animation: {
                  duration: 800,
                  onComplete: function() {
                  const chartInstance = this.chart,
                    ctx = chartInstance.ctx;

                  ctx.font = Chart.helpers.fontString(Chart.defaults.global.defaultFontSize, Chart.defaults.global.defaultFontStyle, Chart.defaults.global.defaultFontFamily);
                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'bottom';
                  this.data.datasets.forEach(function(dataset, i) {
                    const meta = chartInstance.controller.getDatasetMeta(i);
                    meta.data.forEach(function(bar, index) {
                      const data = dataset.data[index];
                      ctx.fillText(data, bar._model.x, bar._model.y - 5);
                    });
                  });
                },
              },
            },
  });
  }

  lodChrtAFEType(pLbl, pData, pObjId) {
    const myChart = new Chart('chrtUsrAFEType', {
      type: 'bar',
      data: {
          labels: pLbl,
          datasets: [{
              label: '# of Votes',
              data: pData,
              backgroundColor: this.srGlbVar.getChrtBarColor(),
              borderColor: [
                  'rgba(255, 99, 132, 1)',
                  'rgba(54, 162, 235, 1)',
                  'rgba(255, 206, 86, 1)',
                  'rgba(75, 192, 192, 1)',
                  'rgba(153, 102, 255, 1)',
                  'rgba(255, 159, 64, 1)',
              ],
              borderWidth: 1,
          }],
      },
      options: {
                  scales: {
                      yAxes: [{
                          ticks: {
                              beginAtZero: true,
                          },
                      }],
                  },
                  title: {
                    display: false,
                    text: 'Custom Chart Title',
                },
                legend: {
                  position: 'bottom',
                  display: false,
                },
                'hover': {
                  'animationDuration': 0,
                },
                animation: {
                  duration: 800,
                  onComplete: function() {
                  const chartInstance = this.chart,
                    ctx = chartInstance.ctx;

                  ctx.font = Chart.helpers.fontString(Chart.defaults.global.defaultFontSize, Chart.defaults.global.defaultFontStyle, Chart.defaults.global.defaultFontFamily);
                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'bottom';
                  this.data.datasets.forEach(function(dataset, i) {
                    const meta = chartInstance.controller.getDatasetMeta(i);
                    meta.data.forEach(function(bar, index) {
                      const data = dataset.data[index];
                      ctx.fillText(data, bar._model.x, bar._model.y - 5);
                    });
                  });
                },
              },
            },
  });
  }

  lodChrtWk(plbl) {
    const myChart = new Chart('chrtTmPrj', {
      type: 'bar',
      data: {
          labels: plbl,
          datasets: [{
              label: '# of Votes',
              data: [50, 40, 30, 10, 10, 15, 45, 38, 45, 65, 48, 54, 48, 54],
              backgroundColor: this.srGlbVar.getChrtBarColor(),
              borderColor: [
                  'rgba(255, 99, 132, 1)',
                  'rgba(54, 162, 235, 1)',
                  'rgba(255, 206, 86, 1)',
                  'rgba(75, 192, 192, 1)',
                  'rgba(153, 102, 255, 1)',
                  'rgba(255, 159, 64, 1)',
              ],
              borderWidth: 1,
          }],
      },
      options: {
                  scales: {
                      yAxes: [{
                          ticks: {
                              beginAtZero: true,
                          },
                      }],
                  },
                  title: {
                    display: false,
                    text: 'Custom Chart Title',
                },
                legend: {
                  position: 'bottom',
                  display: false,
                },
                'hover': {
                  'animationDuration': 0,
                },
                animation: {
                  duration: 800,
                  onComplete: function() {
                  const chartInstance = this.chart,
                    ctx = chartInstance.ctx;
                  ctx.font = Chart.helpers.fontString(Chart.defaults.global.defaultFontSize, Chart.defaults.global.defaultFontStyle, Chart.defaults.global.defaultFontFamily);
                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'bottom';
                  this.data.datasets.forEach(function(dataset, i) {
                    const meta = chartInstance.controller.getDatasetMeta(i);
                    meta.data.forEach(function(bar, index) {
                      const data = dataset.data[index];
                      ctx.fillText(data, bar._model.x, bar._model.y - 5);
                    });
                  });
                },
              },
            },
  });
  }

  lodChrtCTR(plbl) {
    const myChart = new Chart('chrtCTRNo', {
      type: 'bar',
      data: {
          labels: plbl,
          datasets: [{
              label: '# of Votes',
              data: [200, 300, 250, 280],
              backgroundColor: this.srGlbVar.getChrtBarColor(),
              borderColor: [
                  'rgba(255, 99, 132, 1)',
                  'rgba(54, 162, 235, 1)',
                  'rgba(255, 206, 86, 1)',
                  'rgba(75, 192, 192, 1)',
                  'rgba(153, 102, 255, 1)',
                  'rgba(255, 159, 64, 1)',
              ],
              borderWidth: 1,
          }],
      },
      options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true,
                        },
                    }],
                },
                title: {
                    display: false,
                    text: 'Custom Chart Title',
                },
                legend: {
                  position: 'bottom',
                  display: false,
                },
                'hover': {
                  'animationDuration': 0,
                },
                animation: {
                  duration: 800,
                  onComplete: function() {
                  const chartInstance = this.chart,
                    ctx = chartInstance.ctx;
                  ctx.font = Chart.helpers.fontString(Chart.defaults.global.defaultFontSize, Chart.defaults.global.defaultFontStyle, Chart.defaults.global.defaultFontFamily);
                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'bottom';
                  this.data.datasets.forEach(function(dataset, i) {
                    const meta = chartInstance.controller.getDatasetMeta(i);
                    meta.data.forEach(function(bar, index) {
                      const data = dataset.data[index];
                      ctx.fillText(data, bar._model.x, bar._model.y - 5);
                    });
                  });
                },
                },
             },
  });
  }

  getDllInfo(pCd) {
    this.srSPXLst.getMCode(pCd).subscribe(rs => {
      for (let i = 0; i < rs.d.results.length; i++) {
        this.dtTSPrj.push(rs.d.results[i]['DISP_NAME']);
      }
      this.lodChrtWk(this.dtTSPrj);
    }, err => {
      console.log(err);
      this.msgService.show(err, 'ERROR',
        {status: 'danger', destroyByClick: true, duration: 8000, hasIcon: true},
        );
    });

  }

  getTsName() {
    this.srSPXLst.getTSMaster(null).subscribe(rs => {
      this.dtWk = rs.d.results;
      if (this.dtWk.length > 0) {
        const dfDt = this.dtWk[this.dtWk.length - 1]['Id'];
        this.ddlTsSlctItem = dfDt;
        this.onSelectTsName(this.ddlTsSlctItem);
      }
    }, err => {
      console.log(err);
      this.srMsg.show(err, 'ERROR',
        {status: 'danger', destroyByClick: true, duration: 8000, hasIcon: true},
        );
    },
    );
  }

  ngOnDestroy() {
    // this.alive = false;
  }

  // createComponent() {
  //   const compFactory = this.resolver.resolveComponentFactory(BiReportComponent);
  //   this.compRef = this.vcRef.createComponent(compFactory);

  //   this.doc.body.appendChild(this.compRef.location.nativeElement);
  // }


  // onLoad() {
  //   this.doc = this.iframe.nativeElement.contentDocument ||
  //              this.iframe.nativeElement.contentWindow;
  //   this.isIframe = window !== window.parent && !window.opener;
  //   this.createComponent();
  // }

}


  // constructor(
  //   //private themeService: NbThemeService,
  //   //private solarService: SolarData,
  //   private srSPXLst: SPXlstService,
  //   private msgService: NbToastrService,
  //   private srMsg: NbToastrService
  //   ) {
  //   // this.themeService.getJsTheme()
  //   // .pipe(takeWhile(() => this.alive))
  //   // .subscribe(theme => {
  //   // this.statusCards = this.statusCardsByThemes[theme.name];
  //   // });

  //   // this.solarService.getSolarData()
  //   // .pipe(takeWhile(() => this.alive))
  //   // .subscribe((data) => {
  //   // this.solarValue = data;
  //   // });
  // }

  // private alive = true;

  // solarValue: number;
  // lightCard: CardSettings = {
  //   title: 'Light',
  //   iconClass: 'nb-lightbulb',
  //   type: 'primary',
  // };
  // rollerShadesCard: CardSettings = {
  //   title: 'Roller Shades',
  //   iconClass: 'nb-roller-shades',
  //   type: 'success',
  // };
  // wirelessAudioCard: CardSettings = {
  //   title: 'Wireless Audio',
  //   iconClass: 'nb-audio',
  //   type: 'info',
  // };
  // coffeeMakerCard: CardSettings = {
  //   title: 'Coffee Maker',
  //   iconClass: 'nb-coffee-maker',
  //   type: 'warning',
  // };

  // statusCards: string;

  // commonStatusCardsSet: CardSettings[] = [
  //   this.lightCard,
  //   this.rollerShadesCard,
  //   this.wirelessAudioCard,
  //   this.coffeeMakerCard,
  // ];

  // statusCardsByThemes: {
  //   default: CardSettings[];
  //   cosmic: CardSettings[];
  //   corporate: CardSettings[];
  //   dark: CardSettings[];
  // } = {
  //   default: this.commonStatusCardsSet,
  //   cosmic: this.commonStatusCardsSet,
  //   corporate: [
  //     {
  //       ...this.lightCard,
  //       type: 'warning',
  //     },
  //     {
  //       ...this.rollerShadesCard,
  //       type: 'primary',
  //     },
  //     {
  //       ...this.wirelessAudioCard,
  //       type: 'danger',
  //     },
  //     {
  //       ...this.coffeeMakerCard,
  //       type: 'info',
  //     },
  //   ],
  //   dark: this.commonStatusCardsSet,
  // };
