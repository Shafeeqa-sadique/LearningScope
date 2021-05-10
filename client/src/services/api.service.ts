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
import { LogininfoService } from '../../src/services/logininfo.service';

import {
  NbToastrService,
} from '@nebular/theme';
import { EnvService } from './env.service';

@Injectable()
// @Injectable({
//   providedIn: 'root'
// })
export class Api {
  public user = {};
  public loading = false;

  constructor(public http: HttpClient,
    public router: Router,
    private toastrService: NbToastrService,
    public env: EnvService) {

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
        return new HttpHeaders();
        // .set('Accept','application/json; odata=verbose')
        // .set('Content-Type','application/json;odata=verbose');

    }

    /* ------------------------------ GET API CALLS ----------------------------- */

    get(url, data?) {
      const headers = this.createAuthorizationHeader();
      return this.http.get(this.env.apiURL + url, {
          headers: headers,
          params: data,
      }).map(res => res).catch((error: any) => this.handleError(this, error));

    }

    /* ----------------------------- POST API CALLS ----------------------------- */

    post(url, data, isSPX: boolean = false) {
      let headers = this.createAuthorizationHeader();
      let rsUrl: string;
      if (isSPX == true) {
        headers = this.createAuthorizationHeader()
        .set('Accept', 'application/json;odata=verbose')
        .set('Content-Type', 'application/json;odata=verbose');
        rsUrl = this.env.spxApiURL + url;
      } else {
        rsUrl = this.env.apiURL + url;
      }
      return this.http.post(rsUrl, data, {
        headers,
      }).map(res => res).catch((error: any) => this.handleError(this, error));

    }

    // post(url, data) {
    //   let headers = this.createAuthorizationHeader();

    //   return this.http.post(this.env.apiURL + url, data, {
    //       headers
    //     }).map(res => res).catch((error: any) => this.handleError(this, error));
    // }

    // post(url,authCode, data,isdelete: boolean) {

    //   let headers = this.createAuthorizationHeader();
    //   if(authCode != undefined)
    //   {
    //     if(isdelete === true){
    //         headers = this.createAuthorizationHeader()
    //         .set('X-RequestDigest',authCode)
    //         .set('X-HTTP-Method','DELETE')
    //         .set("IF-MATCH","*");
    //       }
    //       else
    //       {
    //         headers = this.createAuthorizationHeader()
    //         .set('X-RequestDigest',authCode)
    //         .set('X-HTTP-Method','MERGE')
    //         .set("IF-MATCH","*");
    //       }
    //   }
    //   // console.log(headers);
    //   // console.log(data);
    //   return this.http.post(url,
    //     data,
    //     { headers }
    //   ).map(res => res).catch((error: any) => this.handleError(this, error));

    //   // let hdrss = {
    //   //   'Accept' :'application/json;odata=verbose',
    //   //   'content-type':'application/json;odata=verbose',
    //   //   'X-HTTP-Method': 'POST'
    //   // };


    //   // return this.http.post(this.env.authURL,
    //   //   {},
    //   //   { headers }
    //   //   ).subscribe((res) =>
    //   //     {
    //   //        let vrAuthCode= JSON.parse(JSON.stringify(res));
    //   //        console.log(vrAuthCode.d.GetContextWebInformation.FormDigestValue) ;
    //   //        let headers = this.createAuthorizationHeader().set('X-RequestDigest',vrAuthCode.d.GetContextWebInformation.FormDigestValue);
    //   //        return this.http.post(urls+'sd',  data, {headers}).subscribe(result => {
    //   //             // Handle result
    //   //             console.log(result);
    //   //           },
    //   //           error => {
    //   //             this.handleError(this,error);
    //   //           },
    //   //           () => {
    //   //             // 'onCompleted' callback.
    //   //             // No errors, route to new page here
    //   //           }
    //   //        );

    //   //       //  return this.http.post(urls,
    //   //       //   data,
    //   //       //   {headers}).map(res => res).catch((error: any) => this.handleError(this, error));
    //   //     } );


    //     // var urls = this.env.apiURL + url;
    //     // this.getFormDigest(this.env.authURL).then(function (datas) {

    //     //   var vl =  datas.d.GetContextWebInformation.FormDigestValue;
    //     //   console.log(vl);
    //     //   var hdr = {
    //     //     'Accept' :'application/json;odata=verbose',
    //     //     'X-RequestDigest':vl,
    //     //     'content-type':'application/json;odata=verbose',
    //     //     'X-HTTP-Method': 'POST'
    //     //   };
    //     //     $.ajax({
    //     //       url: urls,
    //     //       type: 'POST',
    //     //       contentType: 'application/json;odata=verbose',
    //     //       data: JSON.stringify(data),
    //     //       headers: hdr,
    //     //       success: function (data) {
    //     //           //success(data.d);
    //     //           var resp ={
    //     //             code: 200,
    //     //             data: data.d
    //     //           }
    //     //           return resp;

    //     //       },
    //     //       error: function (data) {
    //     //         console.log('failed');
    //     //         var resp ={
    //     //           code: 300,
    //     //           data: data
    //     //         }
    //     //         console.log(resp);
    //     //         return resp;
    //     //       }
    //     //     });
    //     // })


    //     //let headers = this.createAuthorizationHeader().set('X-RequestDigest',vl.innerText);

    //     // return this.http.post(this.env.apiURL + url,  itemProperties, this.httpOptions)
    //     // .pipe(
    //     //   retry(1),
    //     //   catchError(this.handleError)
    //     // )


    //     // return this.http.post(this.env.apiURL+ url, data, {
    //     //     headers
    //     // }).map(res => res).catch((error: any) => this.handleError(this, error));

    //     // return this.http.post(this.env.apiURL+ url, data, {
    //     //     headers
    //     // }).map(res => res).catch((error: any) => this.handleError(this, error));
    // }

    // Fetch metadata for list item



    /* ---------------------------- UPDATE API CALLS ---------------------------- */

    put(url, data) {

        const headers = this.createAuthorizationHeader();

        return this.http.put(this.env.apiURL + url, data, {
            headers: headers,
        }).map(res => res).catch((error: any) => this.handleError(this, error));
    }

    /* ---------------------------- REMOVE API CALLS ---------------------------- */

    delete(url, data?) {
        const headers = this.createAuthorizationHeader();

        return this.http.put(this.env.apiURL + url, data, {
            headers: headers,
        }).map(res => res).catch((error: any) => this.handleError(this, error));
    }

    /* ------------------- HANDLE ERROR IF ANY FROM API CALLS ------------------- */

    handleError(_parent, error: any) {
        if (error.status == 401 || error.status == 400) {
            console.log(error);
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
            formData.append('file', file, file.name + '|' + data.template);
        } else {
            formData.append('file', null);
        }
        formData.append('data', JSON.stringify(data));
        return this.http.post(this.env.apiURL + url, formData, {
            headers,
        }).map(res => res).catch((error: any) => this.handleError(this, error));
    }


}
