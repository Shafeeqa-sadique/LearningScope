import { Injectable } from '@angular/core';
import { Api } from './api.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CbsService extends Api {


  getCBS() {
    const obj = this.get('/api/cbs/getdetail').pipe(
      map(res => JSON.parse(JSON.stringify(res)) ),
    );
    return obj;
  }

  uptCBS(data) {
    const dts = {};
    const objs = JSON.stringify(data);
    dts['data'] = objs;
    const obj = this.post('/api/cbs/uptdetail', dts).pipe(
      map(res => JSON.parse(JSON.stringify(res)) ),
    );
    return obj;
  }

  addCBS(data) {
    const dts = {};
    const objs = JSON.stringify(data);
    dts['data'] = objs;
    const obj = this.post('/api/cbs/adddetail', dts).pipe(
      map(res => JSON.parse(JSON.stringify(res)) ),
    );
    return obj;
  }

  delCBS(data) {
    const dts = {};
    const objs = JSON.stringify(data);
    dts['data'] = objs;
    const obj = this.post('/api/cbs/deldetail', dts).pipe(
      map(res => JSON.parse(JSON.stringify(res)) ),
    );
    return obj;
  }
}

