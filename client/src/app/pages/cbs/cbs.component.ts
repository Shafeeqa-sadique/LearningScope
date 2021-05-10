import { Component, OnInit, ViewChild } from '@angular/core';
import {  NbToastrService, NbDialogService  } from '@nebular/theme';
import { CbsService } from '../../../services/cbs.service';
import { isNumeric } from 'rxjs/internal-compatibility';
import { jqxTreeGridComponent } from 'jqwidgets-ng/jqxtreegrid';
import { AddCbsComponent } from '../modal-overlays/add-cbs/add-cbs.component';
import { ConfirmdialogComponent } from '../modal-overlays/confirmdialog/confirmdialog.component';
import * as $ from 'jquery';

@Component({
  selector: 'ngx-cbs',
  templateUrl: './cbs.component.html',
  styleUrls: ['./cbs.component.scss'],
})
export class CbsComponent implements OnInit {

  @ViewChild('grdCBS', { static: false }) grdCBS: jqxTreeGridComponent;

  grdData: any[];
  source: any;
  newRowID = null;
  theme: string = '';
  buttonsObject: any = null;
  rowKey = null;
  dataAdapter: any;
  isValid: boolean = true;
  grdSelectRwId: number = -1;

  constructor(
    private cbsSr: CbsService,
    private dialogService: NbDialogService,
    private msgSrc: NbToastrService,
  ) { }

  ngOnInit(): void {
    //this.grdGetData();
  }

  grdColumns: any[] = [
    { text: '##', datafield: 'CBS_ID', width: 30, cellsalign: 'center', align: 'center' , hidden: true, exportable: true },
    { text: 'Sl No', datafield: 'TASK_SL_NO', width: 200, cellsalign: 'left', align: 'center' , columntype: 'textbox'},
    { text: 'CBS code', datafield: 'TASK_CODE', width: 100, cellsalign: 'left', align: 'center' , columntype: 'textbox'},
    { text: 'CBS Desc' , datafield: 'TASK_DESC',   cellsalign: 'left', align: 'center', columntype: 'textbox' },
    { text: 'Category' , datafield: 'TASK_CATEGORY', width: 120, cellsalign: 'left', align: 'center', columntype: 'template',
      createEditor: (row, cellvalue, editor, cellText, width, height) => {
        // construct the editor.
        const source = ['PROJECT', 'SUB_PROJECT', 'FACILITY', 'AFE', 'TASK'];
        editor.jqxDropDownList({ autoDropDownHeight: false, source: source, width: '100%', height: '100%' });
      },
      initEditor: (row, cellvalue, editor, celltext, width, height) => {
          // set the editor's current value. The callback is called each time the editor is displayed.
          editor.jqxDropDownList('selectItem', cellvalue);
      },
      getEditorValue: (row, cellvalue, editor) => {
          // return the editor's value.
          return editor.val();
      },
    },
    { text: 'Parent Sl No', datafield: 'TASK_SL_NO_PARENT', width: 100, cellsalign: 'left', align: 'center' , columntype: 'textbox'},
    { text: 'Sort Order' , datafield: 'SORT_ORDER', width: 80, cellsalign: 'left', align: 'center', columntype: 'textbox',
      validation: (cell, value) => {
        if (!isNumeric(value.toString())) {
            return { message: 'Please provide number', result: false };
        }
        return true;
      },
    },
    {
      text: 'Edit', cellsAlign: 'center', width: 75, align: 'center', columnType: 'none', editable: false, sortable: false, dataField: null,
      cellsRenderer: (row: number, column: any, value: any): string => {
        return `<div data-row='` + row + `' class='editButton' style='margin-bottom: 1em; float: left'></div>`;
          // return `<div data-row='` + row + `' class='editButton' style='margin-left: 4em; float: left'></div>
          //         <div data-row='` + row + `' class='deleteButton' style='float: left; margin-left: 1em'></div>`;
      },
    },
  ];
  editSettings: any =
  {
      saveOnPageChange: true, saveOnBlur: true,
      saveOnSelectionChange: false, cancelOnEsc: true,
      saveOnEnter: true, editOnDoubleClick: false, editOnF2: false,
  };
  rendered = (): void => {
      if (this.grdData.length > 0) {
        const uglyEditButtons = jqwidgets.createInstance('.editButton', 'jqxButton', { width: 60, height: 24, value: 'Edit' });
        const flattenEditButtons = flatten(uglyEditButtons);
        // let uglyDeleteButtons = jqwidgets.createInstance('.deleteButton', 'jqxButton', { width: 60, height: 24, value: 'Delete' });
        // let flattenDeleteButtons = flatten(uglyDeleteButtons);
        // console.log(flattenDeleteButtons);
        // let uglyCancelButtons = jqwidgets.createInstance('.cancelButton', 'jqxButton', { width: 60, height: 24, value: 'Cancel' });
        // let flattenCancelButtons = flatten(uglyCancelButtons);
        function flatten(arr: any[]): any[] {
            if (arr.length) {
                return arr.reduce((flat: any[], toFlatten: any[]): any[] => {
                    return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
                }, []);
            }
        }
        if (flattenEditButtons) {
            for (let i = 0; i < flattenEditButtons.length; i++) {
                flattenEditButtons[i].addEventHandler('click', (event: any): void => {
                    this.editClick(event);
                });
            }
        }
        // if (flattenDeleteButtons) {
        //   for (let i = 0; i < flattenDeleteButtons.length; i++) {
        //     flattenDeleteButtons[i].addEventHandler('click', (event: any): void => {
        //           this.delClick(event);
        //       });
        //   }
        // }
        // if (flattenCancelButtons) {
        //     for (let i = 0; i < flattenCancelButtons.length; i++) {
        //         flattenCancelButtons[i].addEventHandler('click', (event: any): void => {
        //             let rowKey = event.target.getAttribute('data-row');
        //             this.grdCBS.endRowEdit(rowKey, true);
        //         });
        //     }
        // }
      }

  }

  grdGetWidth(): any {
    if (document.body.offsetWidth < 850) {
      return '100%';
    }
    return '100%';
  }

  grdGetData() {
    this.cbsSr.getCBS().subscribe(result => {
      this.grdData = result['data'];
      if (this.grdData.length == 0)
      this.grdData = [];
      // console.log(this.grdData);
      this.source = {
                    localdata: this.grdData,
                    dataType: 'json',
                    datafields: [
                      { name: 'CBS_ID', type: 'number' },
                      { name: 'TASK_CODE', type: 'string' },
                      { name: 'TASK_DESC', type: 'string' },
                      { name: 'TASK_SL_NO_PARENT', type: 'string' },
                      { name: 'TASK_SL_NO', type: 'string' },
                      { name: 'TASK_CATEGORY', type: 'string' },
                      { name: 'SORT_ORDER', type: 'number' },
                    ],
                    hierarchy:
                    {
                        keyDataField: { name: 'TASK_SL_NO' },
                        parentDataField: { name: 'TASK_SL_NO_PARENT' },
                    },
                    id: 'CBS_ID',
                    pagesize: 150,
                    addRow: (rowID, rowData, position, parentID, commit) => {
                      // synchronize with the server - send insert command
                      // call commit with parameter true if the synchronization with the server is successful
                      // and with parameter false if the synchronization failed.
                      // you can pass additional argument to the commit callback which represents the new ID if it is generated from a DB.

                      this.newRowID = rowID;
                      this.grdCBS.updateBoundData();
                      this.grdCBS.selectRow(this.newRowID);
                      this.grdCBS.beginRowEdit(this.newRowID);
                      commit(true);
                    },
                    updateRow: (rowID, rowData, commit) => {
                        // synchronize with the server - send update command
                        // call commit with parameter true if the synchronization with the server is successful
                        // and with parameter false if the synchronization failed.
                        // let data ={ 'dt': 1 }
                        // console.log(rowData);
                        // this.cbsSr.uptCBS(rowData).subscribe(result =>{


                        // }, err=>{
                        //   this.toastSr.show(err, "ERROR",
                        //     {status:"danger",destroyByClick:true,duration:8000,hasIcon:true,}
                        //     );
                        // });
                        commit(true);
                    },
                    deleteRow: (rowID, commit) => {
                        // synchronize with the server - send delete command
                        // call commit with parameter true if the synchronization with the server is successful
                        // and with parameter false if the synchronization failed.
                        commit(true);
                    },
                  };

      this.dataAdapter = new jqx.dataAdapter(this.source);
    }, err => {
      console.log(err);
      this.msgSrc.show(err, 'ERROR',
        {status: 'danger', destroyByClick: true, duration: 8000, hasIcon: true},
        );
    });
  }

  evtDelete() {
    if (this.grdSelectRwId >= 0) {
      const value = this.grdCBS.getCellValue(this.grdSelectRwId, 'CBS_ID');
      const SlNo = this.grdCBS.getCellValue(this.grdSelectRwId, 'TASK_SL_NO');
      this.dialogService.open(ConfirmdialogComponent,
        {
          context: {
            IsConfirm: true,
            title: 'Confirm',
            message: 'Are you sure you want to delete :' + SlNo + ' ?',
          },
        })
        .onClose.subscribe(result => {
          if (result == true) {
            const delData = {'CBS_ID' : value};
            this.cbsSr.delCBS(delData).subscribe(rs => {
              if (rs && rs['code'] == 200) {
                this.msgSrc.show(rs['message'], 'Success',
                  {status: 'success', destroyByClick: true, duration: 5000, hasIcon: true},
                  );
                  this.grdCBS.deleteRow(this.grdSelectRwId.toString());
                  this.grdSelectRwId = -1;
              } else {
                // console.log(rs['message']);
                this.msgSrc.show(rs['message'], 'Error',
                {status: 'danger', destroyByClick: true, duration: 8000, hasIcon: false},
                );
              }

            }, err => {
              console.log(err);
              this.msgSrc.show(err, 'ERROR',
                {status: 'danger', destroyByClick: true, duration: 8000, hasIcon: true},
                );
              return false;
            });
          }
        });
    } else {
      this.dialogService.open(ConfirmdialogComponent,
        {
          context: {
            title: 'Alert',
            message: 'Please select a row to delete',
          },
        });
    }
  }



  renderToolbar = (toolBar) => {

    const toTheme = (className) => {
      if (this.theme == '') return className;
      return className + ' ' + className + '-' + this.theme;
    };
    // appends buttons to the status bar.
    const container: any = $('<div style="overflow: hidden; position: relative; height: 100%; width: 100%;"></div>');
    const buttonTemplate: any = '<div style="float: left; padding: 3px; margin: 2px;"><div style="margin: 4px; width: 16px; height: 16px;"></div></div>';
    const addButton: any = $(buttonTemplate);
    const editButton: any = $(buttonTemplate);
    const deleteButton: any = $(buttonTemplate);
    const cancelButton: any = $(buttonTemplate);
    const updateButton: any = $(buttonTemplate);

    const buttonContainer6 = document.createElement('div');
    buttonContainer6.id = 'btnAdd';
    buttonContainer6.style.cssText = 'float: left; margin-left: 5px';
    container.append(buttonContainer6);

    container.append(addButton);
    container.append(editButton);
    container.append(deleteButton);
    container.append(cancelButton);
    container.append(updateButton);
    toolBar.append(container);

    let addButtons: any;
    addButtons = jqwidgets.createInstance(
    '#btnAdd',
    'jqxButton',
    { theme: 'material', width: 145, value: '<div class=\'jqx-icon-plus\' style=\'float: left; padding: 3px; margin-right: 2px;\'><div style=\'margin: 4px; width: 16px; height: 16px;\'></div></div> Add New CBS'},
    );

    addButtons.addEventHandler('click', () => {

      // this.grdCBS.exportData('xls');
      // add new empty row.
      this.grdCBS.addRow(null, {}, 'first', this.rowKey);

      // // select the first row and clear the selection.
      this.grdCBS.clearSelection();
      // console.log(this.newRowID);
      this.grdCBS.selectRow(this.newRowID);
      // edit the new row.
      this.grdCBS.beginRowEdit(this.newRowID);
      // this.jqxWindow.setTitle('Edit Row: ' + this.newRowID);
      //   this.jqxWindow.open();
    });

  }

  rowSelect(event: any): void {
    const args = event.args;
    this.rowKey = args.key;
    // console.log(this.rowKey);
    // console.log(args);
  }
  rowUnselect(event: any): void {
  }
  rowEndEdit(event: any): void {
    const data = this.grdCBS.getRow(this.rowKey.toString());
    // console.log(data);
  }
  rowBeginEdit(event: any): void {
  }

  rowClick(event: any): void {
    // console.log(this.rowKey);
    this.rowKey = event.args.key;
    this.grdSelectRwId = this.rowKey;
  }

  addCbsClick(event: any): void {
    this.dialogService.open(AddCbsComponent,
      {
        context: {},
      }).onClose.subscribe(isadded => {
        if (isadded == true) {
          this.grdGetData();
        }
      });
  }
  delClick(event: any): void {

    const obj = $(event);
    // console.log(event);
    // let rowKey = $(event.target).attr('data-row');
    // console.log(obj);
  }
  editClick(event: any): void {
    const editButtonsContainers = document.getElementsByClassName('editButton');
    const cancelButtonsContainers = document.getElementsByClassName('cancelButton');
    // console.log($(event.target).text());
    // let value = event.target.innerText;
    const value = $(event.target).text();
    console.log('value');
    let editID = this.rowKey;
    if (editID == null) {
      editID = this.newRowID;
    }
    if (value === 'Edit') {
      this.grdCBS.beginRowEdit(editID.toString());
    } else {
      // this.grdCBS.updateRow(1,{TASK_CODE: '123', TASK_DESC: '123213',});
      this.grdCBS.endRowEdit(editID.toString());
      const grdData = this.grdCBS.getRow(editID.toString());
      const data = {};
      // data["CBS_ID"]=grdData['CBS_ID'];
      // Object.keys(grdData).length.forEach(function(key) {
      //   data[key] = grdData[key]
      // })
      for (let index = 0; index < Object.keys(grdData).length; index++) {
        const element = Object.keys(grdData)[index];
        if ((element != 'records') &&
        (element !== null) &&
        (element != 'null') &&
        (element !== undefined) &&
        (element != 'parent')
        ) {
            data[element] = grdData[element];
        }
      }
      // console.log(data);
      this.cbsSr.uptCBS(data).subscribe(rs => {
        if (rs['code'] == 200) {
          this.grdCBS.endRowEdit(this.rowKey.toString());
        } else {
          this.msgSrc.show(rs['message'], 'ERROR',
          {status: 'danger', destroyByClick: true, duration: 8000, hasIcon: true},
          );
        }
      }, err => {
        console.log(err);
        this.msgSrc.show(err, 'ERROR',
          {status: 'danger', destroyByClick: true, duration: 8000, hasIcon: true},
          );
      });

    }
    $(event.target).text(function(i, oldText) {
      return oldText === 'Edit' ? 'Save' : oldText;
    });
    // if (value === 'Edit') {
    //     this.grdCBS.beginRowEdit(this.rowKey.toString());
    //     for (let i = 0; i < editButtonsContainers.length; i++) {
    //         (<HTMLElement>editButtonsContainers[i]).style.marginLeft = '4em';
    //         (<HTMLElement>cancelButtonsContainers[i]).style.display = 'none';
    //     }
    //     let obj = editButtonsContainers[this.rowKey - 1];
    //     console.log($(obj));
    //     $(obj).text("Hello world!");
    //     $(event.target).text(function(i, oldText) {
    //       return oldText === 'Edit' ? 'Save' : oldText;
    //     });
    //     //(<HTMLElement>editButtonsContainers[this.rowKey - 1]).innerText = 'Save';
    //     // (<HTMLElement>editButtonsContainers[this.rowKey - 1]).style.marginLeft = '1em';
    //     // (<HTMLElement>cancelButtonsContainers[this.rowKey - 1]).style.display = 'inline-block';
    // } else {
    //     (<HTMLElement>editButtonsContainers[this.rowKey - 1]).innerText = 'Edit';
    //     (<HTMLElement>editButtonsContainers[this.rowKey - 1]).style.marginLeft = '4em';
    //     (<HTMLElement>cancelButtonsContainers[this.rowKey - 1]).style.display = 'none';
    //     this.grdCBS.endRowEdit(this.rowKey.toString());
    // }
  }


}
