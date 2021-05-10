import { AfterViewInit, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';

import { BiConfigService } from '../../../services/bi.config.service'
import * as pbi from 'powerbi-client'
import { Location } from "@angular/common";
import { MsalService, MsalBroadcastService, MSAL_GUARD_CONFIG, MsalGuardConfiguration, MsalCustomNavigationClient } from '@azure/msal-angular';
import { AuthenticationResult, InteractionType, InteractionStatus, PopupRequest, RedirectRequest, EventMessage, EventType } from '@azure/msal-browser';
import { of, Subject } from 'rxjs';
import { concatMap, filter, last, takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'ngx-bi-report',
  templateUrl: './bi-report.component.html',
  styleUrls: ['./bi-report.component.scss']
})
export class BiReportComponent implements OnInit,AfterViewInit {
  loginDisplay = false;
  private readonly _destroying$ = new Subject<void>();
  report: pbi.Embed;
  @ViewChild('embedContainer') embedContainer: ElementRef;
  isIframe = false;

  constructor(
    private biconfig: BiConfigService,
    @Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration,
    private http: HttpClient,
    private authService: MsalService,
    private msalBroadcastService: MsalBroadcastService,
    private router: Router,
    private location: Location
  ) {
    const customNavigationClient = new MsalCustomNavigationClient(authService, this.router, this.location);
    this.authService.instance.setNavigationClient(customNavigationClient);
  }

  ngOnInit(): void {
    this.isIframe = window !== window.parent && !window.opener;

    // this.msalBroadcastService.inProgress$
    //   .pipe(
    //     filter((status: InteractionStatus) => status === InteractionStatus.None),
    //     takeUntil(this._destroying$)
    //   )
    //   .subscribe(() => {
    //     console.log('ngOn')
    //     this.setLoginDisplay();
    //   })

  }

  ngAfterViewInit(): void {
    this.msalBroadcastService.msalSubject$
    .pipe(
      filter((msg: EventMessage) => msg.eventType === EventType.LOGIN_SUCCESS),
    )
    .subscribe((result: EventMessage) => {
      console.log('ngAfter');
      console.log(result);
      const payload = result.payload as AuthenticationResult;
      this.authService.instance.setActiveAccount(payload.account);
    });
  }

  showReport(Token) {
    // Embed URL
    let embedUrl = this.biconfig.reportBaseURL;
    let embedReportId = this.biconfig.reportId;
    console.log(embedReportId)
    console.log(this.embedContainer)
    let settings: pbi.IEmbedSettings = {
      filterPaneEnabled: false,
      navContentPaneEnabled: false,
    };let config: pbi.IEmbedConfiguration = {
      type: 'report',
      tokenType: pbi.models.TokenType.Embed,
      accessToken: Token,
      embedUrl: embedUrl,
      id: embedReportId,
      filters: [],
      settings: settings
    };let reportContainer = this.embedContainer.nativeElement;
    let powerbi = new pbi.service.Service(pbi.factories.hpmFactory, pbi.factories.wpmpFactory, pbi.factories.routerFactory);
    this.report = powerbi.embed(reportContainer, config);
    this.report.off("loaded");
    this.report.on("loaded", () => {
      console.log("Loaded");
      //this.setTokenExpirationListener(Token.expiration, 2);
    });this.report.on("error", () => {
      console.log("Error");
    });
  }


  BICheckAuth(){
    this.msalBroadcastService.inProgress$
      .pipe(
        filter((status: InteractionStatus) => status === InteractionStatus.None),
        takeUntil(this._destroying$)
      )
      .subscribe(() => {
        //GET LOGIN ACCOUNT DETAILS
        this.setLoginDisplay();
      })

  }

  setLoginDisplay() {
    this.loginDisplay = this.authService.instance.getAllAccounts().length > 0;
    console.log(this.authService.instance.getAllAccounts())
    // if(this.loginDisplay){
    //   this.getAccessTokenAndCallGraphAPI()
    // }else{
    //   this.BILogin()
    // }
  }

  BILogin() {
     if (this.msalGuardConfig.authRequest){
        this.authService.loginRedirect({...this.msalGuardConfig.authRequest} as RedirectRequest);
      } else {
        this.authService.loginRedirect();
      }

    // this.authService.loginPopup()
    // .subscribe((response: AuthenticationResult) => {
    //   this.authService.instance.setActiveAccount(response.account);
    // });

    // if (this.msalGuardConfig.interactionType === InteractionType.Popup) {
    //   if (this.msalGuardConfig.authRequest){
    //     this.authService.loginPopup({...this.msalGuardConfig.authRequest} as PopupRequest)
    //       .subscribe((response: AuthenticationResult) => {
    //         this.authService.instance.setActiveAccount(response.account);
    //       });
    //     } else {
    //       this.authService.loginPopup()
    //         .subscribe((response: AuthenticationResult) => {
    //           this.authService.instance.setActiveAccount(response.account);
    //         });
    //   }
    // } else {
    //   if (this.msalGuardConfig.authRequest){
    //     this.authService.loginRedirect({...this.msalGuardConfig.authRequest} as RedirectRequest);
    //   } else {
    //     this.authService.loginRedirect();
    //   }
    // }
  }

  login() {
    if (this.msalGuardConfig.interactionType === InteractionType.Popup) {
      if (this.msalGuardConfig.authRequest){
        this.authService.loginPopup({...this.msalGuardConfig.authRequest} as PopupRequest)
          .subscribe((response: AuthenticationResult) => {
            this.authService.instance.setActiveAccount(response.account);
          });
        } else {
          this.authService.loginPopup()
            .subscribe((response: AuthenticationResult) => {
              this.authService.instance.setActiveAccount(response.account);
            });
      }
    } else {
      if (this.msalGuardConfig.authRequest){
        this.authService.loginRedirect({...this.msalGuardConfig.authRequest} as RedirectRequest);
      } else {
        this.authService.loginRedirect();
      }
    }
  }

  isLogin() {
    this.loginDisplay = this.authService.instance.getAllAccounts().length > 0;
    return this.loginDisplay
  }

  getAccessTokenAndCallGraphAPI(){

    const requestObj = {
      scopes: ['https://analysis.windows.net/powerbi/api/Report.Read.All']
    }

    this.authService.acquireTokenSilent(requestObj).subscribe(function (tokenResponse) {
      // Callback code here
      console.log(tokenResponse.accessToken);
    }, err =>{
      console.log(err);
    });

    // this.authService.acquireTokenPopup({
    //   scopes: ['https://analysis.windows.net/powerbi/api/Report.Read.All']
    // }).subscribe(result=>{
    //   console.log("access token: "+ result.accessToken)
    //   const httpOptions = {
    //     headers: new HttpHeaders({
    //       'Content-Type':  'application/json',
    //       Authorization: 'Bearer '+result.accessToken
    //     })}

    //   const reqBody = {
    //     "securityEnabledOnly": true
    //   }
    //   //this.http.post("https://graph.microsoft.com/v1.0/users/<user you want to query>/getMemberGroups",reqBody,httpOptions).toPromise().then(result=>{console.log(result)});
    // })
  }

  GRAPH_ENDPOINT = 'https://graph.microsoft.com/v1.0/me';
  getProfile() {
    this.http.get(this.GRAPH_ENDPOINT)
      .subscribe(profile => {
        console.log(profile)
      });
  }

  logout() {
    if (this.msalGuardConfig.interactionType === InteractionType.Popup) {
      this.authService.logoutPopup({
        mainWindowRedirectUri: "/"
      });
    } else {
      this.authService.logoutRedirect();
    }
  }
}
