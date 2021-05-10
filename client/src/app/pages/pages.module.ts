import { NgModule } from '@angular/core';
import {
  NbMenuModule,
  NbButtonModule,
  NbCardModule,
  NbDatepickerModule,
  NbInputModule,
  NbAutocompleteModule,
  NbSpinnerModule,
  NbSelectModule,
  NbAccordionModule,
  NbIconModule,
  NbTabsetModule,
  NbDialogModule,
  NbAlertModule
} from '@nebular/theme';

import { ThemeModule } from '../@theme/theme.module';
import { PagesComponent } from './pages.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { DashboardModule } from './dashboard/dashboard.module';
// import { ECommerceModule } from './e-commerce/e-commerce.module';
import { PagesRoutingModule } from './pages-routing.module';
import { MiscellaneousModule } from './miscellaneous/miscellaneous.module';
import { jqxGridModule } from 'jqwidgets-ng/jqxgrid';
import { jqxTreeGridModule } from 'jqwidgets-ng/jqxtreegrid';
import { jqxButtonModule } from 'jqwidgets-ng/jqxbuttons';
import { jqxSplitterModule } from 'jqwidgets-ng/jqxsplitter';
import { jqxTreeModule } from 'jqwidgets-ng/jqxTree';
import { jqxDropDownButtonModule } from 'jqwidgets-ng/jqxdropdownbutton';

import { PafRegisterComponent } from './paf-register/paf-register.component';
import { CbsComponent } from './cbs/cbs.component';
import { XlUploadComponent } from './xl-upload/xl-upload.component';
import { ValidationModule } from '../validators/validation.module';
import { VowdGenerateComponent } from './vowd-generate/vowd-generate.component';
import { jqxDropDownListModule } from 'jqwidgets-ng/jqxdropdownlist';
import { ClipboardModule } from 'ngx-clipboard';
import { TsSncApprovalComponent } from './ts-snc-approval/ts-snc-approval.component';
import { jqxProgressBarModule } from 'jqwidgets-ng/jqxprogressbar';
import { TsClntApproveComponent } from './ts-clnt-approve/ts-clnt-approve.component';

import { ChartsModule } from 'ng2-charts';
import { TsCreateComponent } from './ts-create/ts-create.component';
import { AgGridModule } from 'ag-grid-angular';
import { TsGrdButtonComponent } from './ts-grd-button/ts-grd-button.component';
import { TsGrdDdlComponent } from './ts-grd-ddl/ts-grd-ddl.component';
import { MPafregComponent } from './m-pafreg/m-pafreg.component';
import { TsGrdDtComponent } from './ts-grd-dt/ts-grd-dt.component';
import { TsGrdTxtnumberComponent } from './ts-grd-txtnumber/ts-grd-txtnumber.component';
import { TsAdminComponent } from './ts-admin/ts-admin.component';
import { TsUcTsviewComponent } from './ts-uc-tsview/ts-uc-tsview.component';

import { DashboardComponent } from './dashboard/dashboard.component';
import { TsUcDiscviewComponent } from './ts-uc-discview/ts-uc-discview.component';
import { TsUcDirectorComponent } from './ts-uc-director/ts-uc-director.component';
import { TsSncMgrComponent } from './ts-snc-mgr/ts-snc-mgr.component';
import { TsUcStsComponent } from './ts-uc-sts/ts-uc-sts.component';
import { TsRooLeadComponent } from './ts-roo-lead/ts-roo-lead.component';
import { TsRooMgrComponent } from './ts-roo-mgr/ts-roo-mgr.component';
import { TsCostCtrlComponent } from './ts-cost-ctrl/ts-cost-ctrl.component';
import { TsRooDirectorComponent } from './ts-roo-director/ts-roo-director.component';
import { TsCostRptComponent } from './ts-cost-rpt/ts-cost-rpt.component';
import { PafRnrComponent } from './paf-rnr/paf-rnr.component';
//import { BiReportComponent } from './bi-report/bi-report.component';


@NgModule({
  imports: [
    PagesRoutingModule,
    ThemeModule,
    NbMenuModule,
    NbButtonModule,
    NbInputModule,
    NbDialogModule.forChild(),
    // DashboardModule,
    // ECommerceModule,
    MiscellaneousModule,
    jqxGridModule,
    jqxTreeGridModule,
    jqxButtonModule,
    jqxProgressBarModule,
    jqxSplitterModule,
    jqxTreeModule,
    jqxDropDownButtonModule,

    NbSelectModule,
    NbDatepickerModule,
    NbCardModule,
    FormsModule, ReactiveFormsModule,
    ValidationModule,
    jqxDropDownListModule,
    ClipboardModule,
    ChartsModule,
    AgGridModule.withComponents([TsGrdButtonComponent, TsGrdDdlComponent, TsGrdDtComponent, TsGrdTxtnumberComponent]),
    NbAutocompleteModule,
    NbSpinnerModule,
    NbAccordionModule,
    NbIconModule,
    NbTabsetModule,
    NbAlertModule
  ],
  declarations: [
    PagesComponent,
    PafRegisterComponent,
    CbsComponent,
    XlUploadComponent,
    VowdGenerateComponent,
    TsSncApprovalComponent,
    TsClntApproveComponent,
    TsCreateComponent,
    TsGrdButtonComponent,
    TsGrdDdlComponent,
    MPafregComponent,
    TsGrdDtComponent,
    TsGrdTxtnumberComponent,
    TsAdminComponent,
    TsUcTsviewComponent,
    DashboardComponent,
    TsUcDiscviewComponent,
    TsUcDirectorComponent,
    TsSncMgrComponent,
    TsUcStsComponent,
    TsRooLeadComponent,
    TsRooMgrComponent,
    TsCostCtrlComponent,
    TsRooDirectorComponent,
    TsCostRptComponent,
    PafRnrComponent,
    //BiReportComponent,
    // BpPafRegisterComponent,
    // BpXlUploadComponent
  ],
})
export class PagesModule {
}
