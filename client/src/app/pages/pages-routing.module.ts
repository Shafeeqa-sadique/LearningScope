import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

import { PagesComponent } from './pages.component';
import { DashboardComponent } from './dashboard/dashboard.component';
// import { ECommerceComponent } from './e-commerce/e-commerce.component';
import { NotFoundComponent } from './miscellaneous/not-found/not-found.component';
import { PafRegisterComponent } from './paf-register/paf-register.component';
import { CbsComponent } from './cbs/cbs.component';
import { XlUploadComponent } from './xl-upload/xl-upload.component';
import { VowdGenerateComponent } from './vowd-generate/vowd-generate.component';
import { TsSncApprovalComponent } from './ts-snc-approval/ts-snc-approval.component';
import { TsClntApproveComponent } from './ts-clnt-approve/ts-clnt-approve.component';
import { TsCreateComponent } from './ts-create/ts-create.component';
//import { TsCostApprovalComponent } from './ts-cost-approval/ts-cost-approval.component';
import { MPafregComponent } from './m-pafreg/m-pafreg.component';
import { TsAdminComponent } from './ts-admin/ts-admin.component';
import { TsSncMgrComponent } from './ts-snc-mgr/ts-snc-mgr.component';
import { TsRooLeadComponent } from './ts-roo-lead/ts-roo-lead.component';
import { TsRooMgrComponent } from './ts-roo-mgr/ts-roo-mgr.component';
import { TsCostCtrlComponent } from './ts-cost-ctrl/ts-cost-ctrl.component';
import { TsRooDirectorComponent } from './ts-roo-director/ts-roo-director.component';
import { TsCostRptComponent } from './ts-cost-rpt/ts-cost-rpt.component';
import { PafRnrComponent } from './paf-rnr/paf-rnr.component';
//import { MsalGuard } from '@azure/msal-angular';

const routes: Routes = [{
  path: '',
  component: PagesComponent,
  children: [
    {
      path: 'pafregister',
      component: PafRegisterComponent,
    },
    {
      path: 'dashboard',
      //canActivate: [MsalGuard],//POWER BI
      component: DashboardComponent,
    },
    {
      path: 'ApproveTS',
      component: TsClntApproveComponent,
    },
    {
      path: 'SNCLead',
      component: TsSncApprovalComponent,
    },
    {
      path: 'UploadTimesheet',
      component: XlUploadComponent,
    },
    {
      path: '',
      redirectTo: 'dashboard',
      pathMatch: 'full',
    },
    {
      path: 'CBS',
      component: CbsComponent,
    },
    {
      path: 'VOWD',
      component: VowdGenerateComponent,
    },
    {
      path: 'SubmitTS',
      component: TsCreateComponent,
    },
    {
      path: 'CostTS',
      component: TsCostCtrlComponent,
    },
    {
      path: 'CostRpt',
      component: TsCostRptComponent
    },
    {
      path: 'pafreg',
      component: MPafregComponent,
    },
    {
      path: 'TSAdmin',
      component: TsAdminComponent,
    },
    {
      path: 'SNCDirector',
      component: TsSncMgrComponent
    },
    {
      path: 'ClientLead',
      component: TsRooLeadComponent
    },
    {
      path: 'ROOMgr',
      component: TsRooMgrComponent
    },
    {
      path: 'ROODirector',
      component: TsRooDirectorComponent
    },
    {
      path: 'Rotation',
      component: PafRnrComponent
    },
    {
      path: '**',
      component: NotFoundComponent,
    },
    // {
    //   path: 'iot-dashboard',
    //   component: DashboardComponent,
    // },
    // {
    //   path: 'miscellaneous',
    //   loadChildren: () => import('./miscellaneous/miscellaneous.module')
    //     .then(m => m.MiscellaneousModule),
    // },
    // {
    //   path: 'layout',
    //   loadChildren: () => import('./layout/layout.module')
    //     .then(m => m.LayoutModule),
    // },
    // {
    //   path: 'forms',
    //   loadChildren: () => import('./forms/forms.module')
    //     .then(m => m.FormsModule),
    // },
    // {
    //   path: 'ui-features',
    //   loadChildren: () => import('./ui-features/ui-features.module')
    //     .then(m => m.UiFeaturesModule),
    // },
    // {
    //   path: 'modal-overlays',
    //   loadChildren: () => import('./modal-overlays/modal-overlays.module')
    //     .then(m => m.ModalOverlaysModule),
    // },
    // {
    //   path: 'extra-components',
    //   loadChildren: () => import('./extra-components/extra-components.module')
    //     .then(m => m.ExtraComponentsModule),
    // },
    // {
    //   path: 'maps',
    //   loadChildren: () => import('./maps/maps.module')
    //     .then(m => m.MapsModule),
    // },
    // {
    //   path: 'charts',
    //   loadChildren: () => import('./charts/charts.module')
    //     .then(m => m.ChartsModule),
    // },
    // {
    //   path: 'editors',
    //   loadChildren: () => import('./editors/editors.module')
    //     .then(m => m.EditorsModule),
    // },
    // {
    //   path: 'tables',
    //   loadChildren: () => import('./tables/tables.module')
    //     .then(m => m.TablesModule),
    // },
  ],
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PagesRoutingModule {
}
