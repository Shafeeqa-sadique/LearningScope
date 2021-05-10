import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  NbButtonModule,
  NbCardModule,
  NbCheckboxModule,
  NbDialogModule,
  NbInputModule,
  NbPopoverModule,
  NbSelectModule,
  NbTabsetModule,
  NbTooltipModule,
  NbWindowModule,
  NbDatepickerModule,
} from '@nebular/theme';

// modules
import { ThemeModule } from '../../@theme/theme.module';
import { ModalOverlaysRoutingModule } from './modal-overlays-routing.module';

// components
import { ModalOverlaysComponent } from './modal-overlays.component';

// import { WindowComponent } from './window/window.component';
// import { WindowFormComponent } from './window/window-form/window-form.component';
// import { ToastrComponent } from './toastr/toastr.component';
// import { TooltipComponent } from './tooltip/tooltip.component';


import { AddPafComponent } from './add-paf/add-paf.component';
import { ValidationModule } from '../../validators/validation.module';
import { ConfirmdialogComponent } from './confirmdialog/confirmdialog.component';
import { AddCbsComponent } from './add-cbs/add-cbs.component';

import { TsCostApprovalDialogComponent } from './ts-cost-approval-dialog/ts-cost-approval-dialog.component';


// import { jqxTreeModule } from 'jqwidgets-ng/jqxtree';
// import { jqxDropDownButtonModule } from 'jqwidgets-ng/jqxDropDownButton';


const COMPONENTS = [
  ModalOverlaysComponent,
  // ToastrComponent,
  // WindowComponent,
  // WindowFormComponent,
  // TooltipComponent,
];

const ENTRY_COMPONENTS = [
  // WindowFormComponent
];

const MODULES = [
  ThemeModule,
  ModalOverlaysRoutingModule,
  NbDialogModule.forChild(),
  NbWindowModule.forChild(),
  NbCardModule,
  NbCheckboxModule,
  NbTabsetModule,
  NbPopoverModule,
  NbButtonModule,
  NbInputModule,
  NbSelectModule,
  NbTooltipModule,
];

const SERVICES = [
];

@NgModule({
  imports: [
    ...MODULES,
    FormsModule,
    NbDatepickerModule,
    ReactiveFormsModule,
    ValidationModule
    // jqxTreeModule,
    // jqxDropDownButtonModule
  ],
  declarations: [
    ...COMPONENTS,
    AddPafComponent,
    ConfirmdialogComponent,
    AddCbsComponent,
    TsCostApprovalDialogComponent
  ],
  providers: [
    ...SERVICES,
  ],
  entryComponents: [
    ...ENTRY_COMPONENTS,
  ],
})
export class ModalOverlaysModule {
}
