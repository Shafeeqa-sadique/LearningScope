import { Component, OnDestroy, OnInit } from '@angular/core';
import { NbMediaBreakpointsService, NbMenuService, NbSidebarService, NbThemeService } from '@nebular/theme';

import { UserData } from '../../../@core/data/users';
import { LayoutService } from '../../../@core/utils';
import { map, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { SPXUserInfoService } from '../../../../../src/services/SPXuserinfo.service';
import { LogininfoService } from '../../../../../src/services/logininfo.service';
import { UserinfoService } from '../../../../../src/services/userinfo.service';
import {  NbToastrService  } from '@nebular/theme';
// import { letProto } from 'rxjs-compat/operator/let';
// import { Title } from '@angular/platform-browser';
// import { title } from 'process';

@Component({
  selector: 'ngx-header',
  styleUrls: ['./header.component.scss'],
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, OnDestroy {

  private destroy$: Subject<void> = new Subject<void>();
  userPictureOnly: boolean = false;
  user: any;

  themes = [
    {
      value: 'default',
      name: 'Light',
    },
    {
      value: 'dark',
      name: 'Dark',
    },
    {
      value: 'cosmic',
      name: 'Cosmic',
    },
    {
      value: 'corporate',
      name: 'Corporate',
    },
  ];

  currentTheme = 'default';

  userMenuTp = [ { title: 'Profile' }, { title: 'Log out' } ];

  constructor(private sidebarService: NbSidebarService,
              private menuService: NbMenuService,
              private themeService: NbThemeService,
              private userService: UserData,
              private layoutService: LayoutService,
              private breakpointService: NbMediaBreakpointsService,
              private toastrService: NbToastrService,
              private userinfoService: SPXUserInfoService,
              private srLoginInfo: LogininfoService,
              private srAuth: UserinfoService,
              ) {
  }

  email: any;
  ngOnInit() {
    this.currentTheme = this.themeService.currentTheme;

    this.userinfoService.getLoginInfo().subscribe(
    (rs) => {
      this.user = rs.d.Title;
    },
    (err) => {
              this.toastrService.show(err, 'ERROR',
              {status: 'danger', destroyByClick: true, duration: 8000, hasIcon: true},
              );
    });


    // this.userinfoService.getLoginInfo().subscribe(
    //   (rs) => {
    //      this.user = rs.d.Title;
    //      this.email = rs.d.Email;
    //      this.loginInfo.loginUsrName = this.email;
    //      this.loginInfo.loginFulName = this.user;
    //      this.loginInfo.loginId = rs.d.Id;
    //      this.userinfoService.getUserRole(this.email).subscribe(
    //        (rs1) =>{
    //          this.loginInfo.loginRoleId = rs1.d.results[0].LkRoleId;
    //          this.loginInfo.AlrtEmail = rs1.d.results[0].UsrEmail;
    //          //this.loginInfo.loginFulName = rs1.d.results[0].FullName;
    //          this.userinfoService.getRoleMenu(this.loginInfo.loginRoleId).subscribe(
    //            (rs2) =>{
    //               rs2.d.results.forEach(e => {
    //                   let obj = new RoleMenu();
    //                   obj.Title = e.Menu;
    //                   obj.icon = e.icon;
    //                   obj.link = e.link;
    //                   obj.home = e.home;
    //                   this.loginInfo.loginMenu.push(obj);
    //                 }
    //               )
    //                //console.log(this.loginInfo);
    //            }
    //          )
    //        },
    //         (err) => {
    //           this.toastrService.show(err, "ERROR",
    //           {status:"danger",destroyByClick:true,duration:8000,hasIcon:true,}
    //           );
    //         }
    //      )
    //   },
    //   (err) => {
    //     this.toastrService.show(err, "ERROR",
    //     {status:"danger",destroyByClick:true,duration:8000,hasIcon:true,}
    //     );
    //   },
    //   () =>{
    //   }
    //   );


    // this.srAuth.getAuthCode().subscribe(
    //   (rs) => {
    //     this.loginInfo.authCode = rs;
    //   },
    //   (err) => {
    //     this.toastrService.show(err, "ERROR",
    //     {status:"danger",destroyByClick:true,duration:8000,hasIcon:true,}
    //     );
    //   },
    //   () => {

    //   });


    // this.userService.getUsers()
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe((users: any) => this.user = users.nick);

     this.user = this.srLoginInfo.loginFulName;
    const { xl } = this.breakpointService.getBreakpointsMap();
    this.themeService.onMediaQueryChange()
      .pipe(
        map(([, currentBreakpoint]) => currentBreakpoint.width < xl),
        takeUntil(this.destroy$),
      )
      .subscribe((isLessThanXl: boolean) => this.userPictureOnly = isLessThanXl);

    this.themeService.onThemeChange()
      .pipe(
        map(({ name }) => name),
        takeUntil(this.destroy$),
      )
      .subscribe(themeName => this.currentTheme = themeName);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  changeTheme(themeName: string) {
    this.themeService.changeTheme(themeName);
  }

  toggleSidebar(): boolean {
    this.sidebarService.toggle(true, 'menu-sidebar');
    this.layoutService.changeLayoutSize();

    return false;
  }

  navigateHome() {
    this.menuService.navigateHome();
    return false;
  }
}
