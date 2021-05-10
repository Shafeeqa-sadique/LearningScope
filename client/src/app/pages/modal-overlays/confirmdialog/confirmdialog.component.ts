import { Component, OnInit, Input } from '@angular/core';
import { NbDialogRef } from '@nebular/theme';

@Component({
  selector: 'ngx-confirmdialog',
  templateUrl: './confirmdialog.component.html',
  styleUrls: ['./confirmdialog.component.scss'],
})
export class ConfirmdialogComponent implements OnInit {

  constructor(protected ref: NbDialogRef<ConfirmdialogComponent>) { }
  @Input() title: string;
  @Input() message: string;
  @Input() btnOkText: string = 'Ok';
  @Input() btnCancelText: string = 'Cancel';
  @Input() IsConfirm: boolean = false;

  ngOnInit() {
  }

  decline() {
    this.ref.close();
  }

  accept(result) {
    this.ref.close(result);
  }

}
