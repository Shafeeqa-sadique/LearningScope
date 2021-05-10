import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/observable';
import { map, mergeMap } from 'rxjs/operators';

import {
  NbToastrService,
} from '@nebular/theme';
@Injectable({
  providedIn: 'root'
})
export class BiConfigService {

  authenticationMode= "serviceprincipal"
  authorityUri= "https://login.microsoftonline.com/common/v2.0"
  scope= "https://analysis.windows.net/powerbi/api"
  apiUrl= "https://api.powerbi.com/"
  clientId= "2d323a73-2061-40cd-9277-8eabe635440d"
  workspaceId= "4c5268a7-d599-4d94-9058-08e526aa3e42"
  reportId= "fcd2f82b-3c14-4a58-92f8-0d79c0939610"
  pbiUsername= "sli\\TANOS2"
  pbiPassword= "4c6DP4S$RE"
  clientSecret="2ZEG6._Z3IzS2y9_sM3plxdW2_o1JoTeT3"
  tenantId= "464aad2a-6b79-4c0a-bed4-5f90e0b6a607"

  reportBaseURL= 'https://app.powerbi.com/reportEmbed'
  qnaBaseURL= 'https://app.powerbi.com/qnaEmbed'
  tileBaseURL= 'https://app.powerbi.com/embed'

  authAADUri="https://login.microsoftonline.com/<TENANTID>/oauth2/token"

  constructor(
    public http: HttpClient,
    private toastrService: NbToastrService,
    ) { }


   /* ------------------------------ STEP 1: GET AAD TOKEN USING SERVICE PRINCIPAL ----------------------------- */
   Step1GetAADToken() {
    var formData: any = new FormData();
    formData.append("grant_type", 'client_credentials');
    formData.append("client_id", this.clientId);
    formData.append("client_secret", this.clientSecret);
    formData.append("resource", this.scope);

    let headers =  new HttpHeaders();
    headers.set('Content-Type','multipart/form-data;');
    headers.set('Content-Length',formData.length);
    headers.set('Host','login.microsoftonline.com');
    headers.set('Content-Type','application/x-www-form-urlencoded');


    const uri = this.authAADUri.replace('<TENANTID>',this.tenantId)
    console.log(uri)
    const data ={
      'grant_type':'client_credentials',
      'client_id':this.clientId,
      'client_secret':this.clientSecret,
      'resource':this.scope
    }


    return this.http.post(uri,formData, {
        headers: headers//,
       // params: data,
    }).map(res => { console.log(res); return JSON.parse(JSON.stringify(res)) }).catch((error: any) => this.handleError(this, error));
  }

  /* ------------------------------ STEP 2: GET EMBEDD TOKEN ----------------------------- */
  Step2GetEmbeddToken(pAADRs) {
    const headers =  new HttpHeaders();
    headers.set('Authorization',pAADRs.token_type + ' ' + pAADRs.access_token);
    headers.set('Content-Type','application/x-www-form-urlencoded');
    headers.set('Accept','application/json');

    const uri = this.authAADUri.replace('<TENANTID>',this.tenantId)
    const data ={
      'accesslevel':'edit'
    }
    return this.http.post(uri, data, {
      headers,
    }).map(res => JSON.parse(JSON.stringify(res))).catch((error: any) => this.handleError(this, error));
  }

  getBIToken(){
    return this.Step1GetAADToken().pipe(
      mergeMap((rs) =>{
        console.log(rs)
        return this.Step2GetEmbeddToken(rs)
      })
    )
  }

  /* ------------------- HANDLE ERROR IF ANY FROM API CALLS ------------------- */
  handleError(_parent, error: any) {
      if (error.status == 401 || error.status == 400) {
          console.log(error);
      } else if (error.status == 500) {
          // this.toastr.error('Please try later', 'Server error');
          this.toastrService.show('Please try later', 'Server error',
          {status: 'danger', destroyByClick: true, duration: 4000, hasIcon: true},
          );
          console.log('Error :\r\n' + error);
          // this.notify.showNotification('error', 'server error, please try later');
      }
      // In a real world app, you might use a remote logging infrastructure
      console.log(error)
      return Observable.throw(error);
  }



}
