import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { SPXapi } from './SPXapi.service';
import { map, mergeMap } from 'rxjs/operators';
import { LogininfoService } from './logininfo.service';

@Injectable({
  providedIn: 'root',
})
export class SPXUserInfoService extends SPXapi {

  lstUsr: string = 'LS_M_USER';
  lstRolUsr: string = 'LS_ROLE_USR';
  lstRoleMenu: string = 'LS_ROLE_MENU';
  // lstRoleDisc : string="RoleDiscipline";


  async getLoginSync() {
    return await this.getSPX('/_api/web/currentuser').toPromise();
  }

  async getUserRoleSync(pSpxEmail) {
    return await this.getSPX('/_api/web/lists/GetByTitle(\'' + this.lstRolUsr + '\')/items?$filter=substringof(\'' + pSpxEmail + '\',LkUsrName/UsrEmail)&$select=LkUsrNameId,LkUsrName/UsrEmail,LkRoleNameId&$expand=LkUsrName').toPromise();
  }

  async getLoginDtl(): Promise<LogininfoService> {

      const cs =  await this.getLoginInfo().pipe(
        mergeMap((rs) => {
          const rs1 = JSON.parse(JSON.stringify(rs));
          this.loginInfo.loginUsrName = rs1.d.Email;
          this.loginInfo.loginFulName = rs1.d.Title;
          return this.getUserRole(rs1.d.Email).pipe(
            map(rs2 => {
              const rs3 = JSON.parse(JSON.stringify(rs2));
              this.loginInfo.loginId = rs3.d.results[0].LkUsrNameId;
              this.loginInfo.AlrtEmail = rs3.d.results[0]['LkUsrName']['UsrEmail'];
              rs3.d.results.forEach(el => {
                this.loginInfo.RoleId.push(el.LkRoleNameId);
              });
              return this.loginInfo;
            }),
          );
        }),
      ).toPromise();

    return cs;
  }

  getLoginInfo() {
    return this.getSPX('/_api/web/currentuser');
    // return ts
    // var obj =this.get("/_api/web/currentuser").pipe(
    //   map(res => JSON.parse(JSON.stringify(res)) )
    // );
    // return obj;
  }

  getUserRole(pSpxEmail) {
    return this.getSPX('/_api/web/lists/GetByTitle(\'' + this.lstRolUsr + '\')/items?$filter=substringof(\'' + pSpxEmail + '\',LkUsrName/UsrEmail)&$select=LkUsrNameId,LkUsrName/UsrEmail,LkRoleNameId&$expand=LkUsrName');
  }

  // getUserRole(pSpxEmail){
  //   return this.getSPX("/_api/web/lists/GetByTitle('"+ this.lstRolUsr +"')/items?$filter=substringof('"+ pSpxEmail +"',LkUsrName/UsrEmail)&$select=LkUsrNameId,LkUsrName/UsrEmail,LkRoleNameId&$expand=LkUsrName")
  // }

  getUsrByRolId(pRolId) {
    return this.getSPX(`/_api/web/lists/GetByTitle('${this.lstUsr}')/items?$filter=LkRole eq ${pRolId}&$select=UsrName,UsrEmail,FullName,LkRoleId`);
  }

  getRoleMenu(rolID) {
    return this.getSPX('/_api/web/lists/GetByTitle(\'' + this.lstRoleMenu + '\')/items?$filter=LkRole/Id eq ' + rolID + '&$select=Menu,icon,link,home');
  }

  // getRoleDisc(rolID){
  //   return this.getSPX("/_api/web/lists/GetByTitle('"+ this.lstRoleDisc +"')/items?$filter=Role/Id eq "+ rolID+"&$select=Role/Title,Discipline/Title&$expand=Role,Discipline")
  // }

  getSPX(pQry) {
    const obj = this.get(pQry).pipe(
      map(res => JSON.parse(JSON.stringify(res)) ),
    );
    return obj;
  }

  interval;
  getRefreshAuthToken(){
    this.interval = setInterval(() => {
      this.userinfoService.getAuthCode().subscribe(
        (rs) => {
          this.loginInfo.authCode = rs;
        },
        (err) => {
        },
        () => {

        });
    },60000) //1000 = 1 Second
  }

}


