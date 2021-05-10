import { Component } from '@angular/core';

import { MENU_ITEMS } from './pages-menu';
import { NbMenuService, NbMenuItem, NbToastrService } from '@nebular/theme';
import { LogininfoService } from '../../../src/services/logininfo.service';
import { SPXUserInfoService } from '../../services/SPXuserinfo.service';
import { UserinfoService } from '../../../src/services/userinfo.service';



@Component({
  selector: 'ngx-pages',
  styleUrls: ['pages.component.scss'],
  template: `
    <ngx-one-column-layout>
      <nb-menu [items]="newMenuItem"></nb-menu>
      <router-outlet></router-outlet>
    </ngx-one-column-layout>
  `,
})
export class PagesComponent {
  // menu = MENU_ITEMS;
  newMenuItem: NbMenuItem[] = [];
    // [
    // {
    //   title: 'Home',
    //   icon: 'ion-home',
    //   link: 'app/home',
    //   home: true,
    // }]
  constructor(
    private nbMenuService: NbMenuService,
    private loginInfo: LogininfoService,
    private userinfoService: SPXUserInfoService,
    private toastrService: NbToastrService,
    private srAuth: UserinfoService,
    ) {
      // this.spxMenuService.loginMenu.forEach(e => {
      //   let row  ={
      //     title: e.Title,
      //     icon : e.icon,
      //     link : e.link,
      //     home : e.home
      //   }
      //   this.newMenuItem.push(row);
      // });

     this.userinfoService.getLoginInfo().subscribe(
      (rs) => {
        this.loginInfo.loginUsrName = rs.d.Email;
        this.loginInfo.loginFulName = rs.d.Title;
        this.userinfoService.getUserRole(rs.d.Email).subscribe(
          (rs1) => {
            this.loginInfo.loginId = rs1.d.results[0].LkUsrNameId;
            this.loginInfo.AlrtEmail = rs1.d.results[0]['LkUsrName']['UsrEmail'];
            rs1.d.results.forEach(el => {
              this.loginInfo.RoleId.push(el.LkRoleNameId);
              this.userinfoService.getRoleMenu(el.LkRoleNameId).subscribe(
                (rs2) => {
                  rs2.d.results.forEach(e => {
                    const itm = this.newMenuItem.filter(a => a.title == e.Menu);
                    if (itm.length <= 0) {
                      const obj = new NbMenuItem();
                      obj.title = e.Menu;
                      obj.icon = e.icon;
                      obj.link = e.link;
                      obj.home = e.home;
                      this.newMenuItem.push(obj);
                    }
                  },
                  );

                },
              );
            });

          },
          (err) => {
            this.toastrService.show(err, 'ERROR',
              { status: 'danger', destroyByClick: true, duration: 8000, hasIcon: true },
            );
          },
        );
      },
      (err) => {
        this.toastrService.show(err, 'ERROR',
          { status: 'danger', destroyByClick: true, duration: 8000, hasIcon: true },
        );
      },
      () => {
      },
    );





      this.nbMenuService.addItems(this.newMenuItem);

      this.srAuth.getAuthCode().subscribe(
        (rs) => {
          this.loginInfo.authCode = rs;
        },
        (err) => {
          this.toastrService.show(err, 'ERROR',
          {status: 'danger', destroyByClick: true, duration: 8000, hasIcon: true},
          );
        },
        () => {

        });

  }
}
