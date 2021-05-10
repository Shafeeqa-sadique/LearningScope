import { Injectable } from '@angular/core';

import { Api } from './api.service';
import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root',
})
export class PafXlService extends Api {

  update(data: any, file: any) {
    return this.uploadData('/api/paf/xl/uploadxl', data, file).pipe(map(rs => {
        return rs;
    }));
  }



}
