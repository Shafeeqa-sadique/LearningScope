// import { Injectable } from '@angular/core';
// import { environment } from '../environments/environment';
// import '@angular/platform-browser';
// import '@angular/platform-browser-dynamic';
// import '@angular/core';
// import '@angular/common';
// import '@angular/http';
// import '@angular/router';
// import pnp from "sp-pnp-js";
// import { from } from 'rxjs';
import { Injectable  } from '@angular/core';
import { from } from 'rxjs';
// import { HttpClient,HttpHeaders } from '@angular/common/http';

// import { Observable } from "rxjs/observable";
// import { map } from 'rxjs/operators/map';

import { Api } from './api.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class UserinfoService extends Api {

  // private REST_API_SERVER ="http://localhost:8080/_api/web/lists/getByTitle('PSR-Projects')/items?$top=2000";
  // private REST_API_SERVER ="http://localhost:8080";
  // constructor(private httpClient: HttpClient) { }

  lstName: string = 'MFL-Project';
  lstNameCountry: string = 'MFL-Region';
  lstNameMFL: string = 'MFL-List';
  lstEmp: string = 'MFL-HRList';

  private getConfigInfo() {
    // const mySP = pnp.sp.configure({
    //   headers: {
    //     "Accept": "application/json; odata=verbose"
    //   }
    // }, this.env.apiURL);
    let mySP;
    return mySP;
  }

  public getSiteInformation() {
    const data = from(this.getConfigInfo().web.get());
    return data;

  }




  getEmpList(vrNme) {
    // var obj =this.get("/_api/web/lists/getByTitle('"+ this.lstNameMFL +")/items?$filter=(substringof('"+ vrCntry +"',Country))").pipe(
    let fltr = '';
      if (vrNme) {
        fltr = '&$filter=(substringof(\'' + vrNme + '\',Title))';
      }
    const obj = this.get('/_api/web/lists/getByTitle(\'' + this.lstEmp + '\')/items?top=50' + fltr).pipe(
      map(res => JSON.parse(JSON.stringify(res)) ),
    );
    return obj;
  }

  getMFLList(vrCntry) {
    // var obj =this.get("/_api/web/lists/getByTitle('"+ this.lstNameMFL +")/items?$filter=(substringof('"+ vrCntry +"',Country))").pipe(
    let fltr = '';
      if (vrCntry) {
        fltr = '$filter=(substringof(\'' + vrCntry + '\',Country))';
      }
    const obj = this.get('/_api/web/lists/getByTitle(\'' + this.lstNameMFL + '\')/items?$top=50' + fltr).pipe(
      map(res => JSON.parse(JSON.stringify(res)) ),
    );
    return obj;
  }

  getProjectName(vrProjectName) {
    const obj = this.get('/_api/web/lists/getByTitle(\'MFL-Project\')/items?$select=ID,ProjName,ProjectNO&$filter=(substringof(\'' + vrProjectName + '\',ProjName))').pipe(
      map(res => JSON.parse(JSON.stringify(res)) ),
    );
    return obj;
  }

  getCountry(vrCntryName) {
    const obj = this.get('/_api/web/lists/getByTitle(\'' + this.lstNameCountry + '\')/items?$select=ID,Country&$filter=(substringof(\'' + vrCntryName + '\',Country))').pipe(
      map(res => JSON.parse(JSON.stringify(res)) ),
    );
    return obj;
  }

  getAuthCode() {
    return this.post(this.env.authURL, undefined, true).pipe(map(res => {
      const vr  = JSON.parse(JSON.stringify(res));
      const auth: string = vr.d.GetContextWebInformation.FormDigestValue;
      // auth = auth.substring(0,auth.lastIndexOf(","))
      //console.log(auth);
      return auth;
    }));
  }



  addMFL(authCode, vrMFL) {
      const itemType = this.getItemTypeForListName(this.lstNameMFL) ;

      vrMFL['__metadata'] = { 'type': itemType };

      return this.post(this.env.apiURL + '/_api/web/lists/getByTitle(\'' + this.lstNameMFL + '\')/items', authCode).pipe(
        map(res => {
          return JSON.parse(JSON.stringify(res));
          }),
      );
  }

  uptMFL(authCode, vrRwId, vrData) {
    const itemType = this.getItemTypeForListName(this.lstNameMFL) ;
    vrData['__metadata'] = { 'type': itemType };
    console.log(vrData);
    return this.post(this.env.apiURL + '/_api/web/lists/getByTitle(\'' + this.lstNameMFL + '\')/items(' + vrRwId + ')', authCode).pipe(
      map(res => {
         return JSON.parse(JSON.stringify(res));
        }),
    );
   }

   delMFL(authCode, vrRwId, vrData) {
    const itemType = this.getItemTypeForListName(this.lstNameMFL) ;
    vrData['__metadata'] = { 'type': itemType };
    console.log(vrData);
    return this.post(this.env.apiURL + '/_api/web/lists/getByTitle(\'' + this.lstNameMFL + '\')/items(' + vrRwId + ')', authCode).pipe(
      map(res => {
         return JSON.parse(JSON.stringify(res));
        }),
    );
   }
  addProject(authCode, prjDetail) {
    const itemType = this.getItemTypeForListName(this.lstName) ; // "SP.Data." + lstName + "ListItem";

    // var data = {
    //     "__metadata": { "type": itemType },
    //     "Title": prjDetail.title
    // };
    prjDetail['__metadata'] = { 'type': itemType };

    return this.post(this.env.apiURL + '/_api/web/lists/getByTitle(\'' + this.lstName + '\')/items', authCode).pipe(
      map(res => {
         return JSON.parse(JSON.stringify(res));
        }),
    );



    // this.post("/_api/web/lists/getbytitle('PSR-Projects')/items", JSON.stringify(data)).pipe(
    //   map(res => JSON.parse(JSON.stringify(res)) )
    // );
    // return obj;

  }

  // Get List Item Type metadata
 getItemTypeForListName(name) {
  return 'SP.Data.' + name.charAt(0).toUpperCase() + name.split(' ').join('').slice(1).replace('-', '') + 'ListItem';
}

}
