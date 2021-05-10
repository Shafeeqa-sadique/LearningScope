import { Injectable } from '@angular/core';
// import { UserinfoService } from '../../src/services/userinfo.service';
// import { SPXUserInfoService } from '../../src/services/SPXuserinfo.service';

// import {List} from 'immutable';
// import {BehaviorSubject, Observable} from "rxjs/Rx";
// import { mergeMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class LogininfoService {
  public AlrtEmail: string;
  public loginId: number;
  public loginUsrName: string;
  public loginTitle: string;
  public RoleId: number[] = [];
  public loginFulName: string;
  public loginMenu: RoleMenu[] = [];
  public authCode: string;

  constructor() {

  }


  // loadData(){
  //   console.log('Login')
  //   this.srInfo.getLoginInfo().subscribe(
  //     (rs) => {
  //       this.loginUsrName = rs.d.Email;
  //       this.loginFulName = rs.d.Title;
  //        this.srInfo.getUserRole(rs.d.Email).subscribe(
  //          (rs1) =>{
  //            this.loginId = rs1.d.results[0].LkUsrNameId;
  //            this.AlrtEmail = rs1.d.results[0]['LkUsrName']['UsrEmail'];

  //          },
  //           (err) => {
  //             console.error(err);
  //           }
  //        )
  //     },
  //     (err) => {
  //       console.error(err);
  //     },
  //     () =>{
  //     }
  //     );
  //  }

}

@Injectable({
  providedIn: 'root',
})
export class RoleMenu {
  Title: string;
  icon: string;
  link: string;
  home: boolean;
  constructor() { }
  // public constructor( title: string, icon: string,  link: string, home: boolean) {
  //     this.Title = title
  //     this.icon = icon;
  //     this.link = link;
  //     this.home = home;
  //   }

}


// @Injectable({
//   providedIn: 'root'
// })
// export class Login{
//   private login :LogininfoService
//   public usersInfo$: Observable<LogininfoService>

//   constructor(private srInfo: SPXUserInfoService,) {
//     this.loadData();
//   }

//   loadData(){
//     this.srInfo.getLoginInfo().pipe(mergeMap( rs=>
//         this.srInfo.getUserRole(rs.d.Email ).pipe( rs1 => rs1.d.results)
//     ))
//     this.srInfo.getLoginInfo().subscribe(
//       (rs) => {
//         this.login.loginUsrName = rs.d.Email;
//         this.login.loginFulName = rs.d.Title;
//         this.srInfo.getUserRole(this.login.loginUsrName).subscribe(
//           (rs1) =>{
//             this.login.loginId = rs1.d.results[0].LkUsrNameId;
//             this.login.AlrtEmail = rs1.d.results[0]['LkUsrName']['UsrEmail'];
//           },
//            (err) => {
//              console.error(err);
//            },() =>{

//            }
//         )
//       },
//       (err) => {
//         console.error(err);
//       },
//       () =>{

//       }
//       );
//    }
// }
