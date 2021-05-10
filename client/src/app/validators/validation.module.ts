import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ControlMessagesComponent } from './control-messages.component';
import { ValidationService } from './validation.service';


@NgModule({
    imports: [
        CommonModule,
    ],
    declarations: [
        ControlMessagesComponent,
    ],
    providers: [ValidationService],
    exports: [
        // AlertComponent
        ControlMessagesComponent,
    ],
    entryComponents: [
        ControlMessagesComponent,
    ],
})
export class ValidationModule { }
