/* ========================================================================== */
/*                 MAIN FILE TO CALL API'S WITH AUTHORIZATION                 */
/* ========================================================================== */

import { Injectable } from '@angular/core';
import 'rxjs/add/operator/catch';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/observable';
import 'rxjs/add/operator/map';
import { environment } from '../environments/environment';
import { LogininfoService } from '../services/logininfo.service';
import { UserinfoService } from './userinfo.service';

import {
  NbToastrService,
} from '@nebular/theme';
import { EnvService } from './env.service';

@Injectable()
export class SPXapi {
  public user = {};
  public loading = false;

  constructor(public http: HttpClient,
    public router: Router,
    private toastrService: NbToastrService,
    public env: EnvService,
    public loginInfo: LogininfoService,
    public userinfoService: UserinfoService
    ) {

  }

    /* ---------------------- CREATE AUTHORIZATION FOR API ---------------------- */

    createAuthorizationHeader() {
        // console.log('ENV' + this.env)
        this.user = localStorage.getItem('currentUser') ? JSON.parse(localStorage.getItem('currentUser')) : {};
        const _token = this.user['token'] || this.user['authToken'];
        /* var header = {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Origin': '*',
            'Authorization': 'Bearer ' + _token
        }; */

        // return new HttpHeaders().set('Authorization', 'Bearer ' + _token);
        // var obj = new HttpHeaders();
        // obj.set('Accept','application/json; odata=verbose');
        // obj.set('Content-Type','application/json;odata=verbose');
        // return obj;
        // return new HttpHeaders().set('Accept','application/json; odata=verbose');

        const header = {
          'Accept': 'application/json; odata=verbose',
        };
        const vl = document.getElementById('#__REQUESTDIGEST');
        return new HttpHeaders()
        .set('Accept', 'application/json; odata=verbose')
        .set('Content-Type', 'application/json;odata=verbose');

    }

    /* ------------------------------ GET API CALLS ----------------------------- */

    get(url, data?) {
      const headers = this.createAuthorizationHeader();
      return this.http.get(this.env.spxApiURL + url, {
          headers: headers,
          params: data,
      }).map(res => res).catch((error: any) => this.handleError(this, error));

    }

    /* ----------------------------- POST API CALLS ----------------------------- */

    post(url, authCode, data, pActType: string = 'C') {
      let headers = this.createAuthorizationHeader();
      if (authCode != undefined) {
        if (pActType === 'D') {
            headers = this.createAuthorizationHeader()
            .set('X-RequestDigest', authCode)
            .set('X-HTTP-Method', 'DELETE')
            .set('IF-MATCH', '*');
        } else if (pActType === 'C') {
          headers = this.createAuthorizationHeader()
          .set('X-RequestDigest', authCode)
          // .set('X-HTTP-Method','MERGE')
          .set('IF-MATCH', '*');
        } else if (pActType === 'U') {
          headers = this.createAuthorizationHeader()
          .set('X-RequestDigest', authCode)
          .set('X-HTTP-Method', 'MERGE')
          .set('IF-MATCH', '*');
        }
      }
      return this.http.post(this.env.spxApiURL + url,
        data,
        { headers },
      ).map(res => res).catch((error: any) => this.handleError(this, error));

    }

    postFile(url, authCode, data ) {

      let headers = this.createAuthorizationHeader();
      if (authCode != undefined) {
        headers = this.createAuthorizationHeader()
        .set('X-RequestDigest', authCode)
        // .set('X-HTTP-Method','MERGE')
        // .set("IF-MATCH","*")
        // .set("content-type",undefined)
        .set('content-type', 'application/json;odata=verbose')
        // .set("content-length",data..length.toString())
        .set('Accept', 'application/json;odata=verbose');
      }
      const vurl = this.env.spxApiURL + url;

      return this.http.post(vurl,
        // {
        //   data : data,
        //   processData: false,
        // },
        data,
        { headers },
      ).map(res => res).catch((error: any) => this.handleError(this, error));

    }

    // Fetch metadata for list item
    getItemTypeForListName(name) {
      const str = 'SP.Data.' + name.charAt(0).toUpperCase() + name.split(' ').join('').slice(1) + 'ListItem';

      return str.replace(/_/g, '_x005f_');
    }


    /* ---------------------------- UPDATE API CALLS ---------------------------- */

    put(url, data) {

        const headers = this.createAuthorizationHeader();

        return this.http.put(this.env.spxApiURL + url, data, {
            headers: headers,
        }).map(res => res).catch((error: any) => this.handleError(this, error));
    }

    /* ---------------------------- REMOVE API CALLS ---------------------------- */

    delete(url, data?) {
        const headers = this.createAuthorizationHeader();

        return this.http.put(this.env.spxApiURL + url, data, {
            headers: headers,
        }).map(res => res).catch((error: any) => this.handleError(this, error));
    }

    /* ---------------------------- BATCH API CALLS ---------------------------- */

    batch(authCode, arrData, pLsName, updColKey, pActType: string = 'C') {
      console.log(authCode);
      const batchGUID = this.fnGenerateGUID();
      const pChangeSetGUID = this.fnGenerateGUID();

      let cnt = new Array();
      if (pActType === 'C') {
        cnt = this.fnFrmtBtchAdd(arrData, pLsName, pChangeSetGUID);
      }
      // END changeset to create data
      cnt.push('--changeset_' + batchGUID + '--');
      // batch body
      let btchBody = cnt.join('\r\n');
      // console.log(btchBody)

      cnt = [];
      // create a batch for creating items
      cnt.push('--batch_' + batchGUID);
      cnt.push('Content-Type: multipart/mixed; boundary="changeset_' + pChangeSetGUID + '"');
      cnt.push('Content-Length: ' + btchBody.length);
      cnt.push('Content-Transfer-Encoding: binary');
      cnt.push('');
      cnt.push(btchBody);
      cnt.push('');

      cnt.push('--batch_' + batchGUID + '--');
      btchBody = cnt.join('\r\n');
      console.log(btchBody);

      const headers = new HttpHeaders()
      .set('X-RequestDigest', authCode)
      .set('Accept', 'application/json; odata=verbose')
      .set('Content-Type', 'multipart/mixed; boundary="batch_' + batchGUID + '"');


      const url = this.env.spxApiURL + '/_api/$batch';
      console.log(url);
      console.log(headers);

      return this.http.post(url,
        btchBody,
        { headers },
      ).map(res => res).catch((error: any) => this.handleError(this, error));
    }

    fnFrmtBtchAdd(arrData: any[], pLstName, pChangeSetID) {
      const btchCnt: any[] = [];
      for (let i = 0; i < arrData.length; i++) {
        const endpoint = this.env.spxApiURL
        + '/_api/web/lists/getbytitle(\'' + pLstName + '\')'
        + '/items';
        const itemType = this.getItemTypeForListName(pLstName) ;
        arrData[i]['__metadata'] = { 'type': itemType };

        // create the changeset
        btchCnt.push('--changeset_' + pChangeSetID);
        btchCnt.push('Content-Type: application/http');
        btchCnt.push('Content-Transfer-Encoding: binary');
        btchCnt.push('');
        btchCnt.push('POST ' + endpoint + ' HTTP/1.1');
        btchCnt.push('Content-Type: application/json;odata=verbose');
        btchCnt.push('');
        btchCnt.push(JSON.stringify(arrData[i]));
        btchCnt.push('');
      }
      return btchCnt;
    }

    // This function is used to generate GUIDs for Batch and Changeset
    fnGenerateGUID() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
          const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
      });
    }

    /* ---------------------------- BATCH API CALLS ---------------------------- */

    /* ------------------- HANDLE ERROR IF ANY FROM API CALLS ------------------- */

    handleError(_parent, error: any) {
        if (error.status == 401 || error.status == 400) {
            console.log(error);
            this.toastrService.show(error, 'Server error',
            {status: 'danger', destroyByClick: true, duration: 4000, hasIcon: true},
            );
        } else if (error.status == 500) {
            this.loading = false;
            // this.toastr.error('Please try later', 'Server error');
            this.toastrService.show('Please try later', 'Server error',
            {status: 'danger', destroyByClick: true, duration: 4000, hasIcon: true},
            );
            console.log('Error :\r\n' + error);
            // this.notify.showNotification('error', 'server error, please try later');
        }
        // In a real world app, you might use a remote logging infrastructure

        return Observable.throw(error);
    }

    uploadData(url, data, file) {
        const headers = this.createAuthorizationHeader();
        const formData = new FormData();
        if (file) {
            formData.append('file', file, file.name);
        } else {
            formData.append('file', null);
        }
        formData.append('data', JSON.stringify(data));

        return this.http.post(this.env.apiURL + url, formData, {
            headers,
        }).map(res => res).catch((error: any) => this.handleError(this, error));
    }





}
