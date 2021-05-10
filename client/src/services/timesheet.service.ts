import { Injectable } from '@angular/core';
import { Api } from './api.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class TimesheetService extends Api  {


  getTsList() {
    const obj = this.get('/api/wkts/getWkBookTs').pipe(
      map(res => JSON.parse(JSON.stringify(res)) ),
    );
    return obj;
  }

  getDepart() {
    const obj = this.get('/api/wkts/getDepart').pipe(
      map(res => JSON.parse(JSON.stringify(res)) ),
    );
    return obj;
  }

  getTsDetail(strtDt, endDt, TsPrj, CalOf) {
    const obj = this.get('/api/wkts/getWkBookTsDetail/' + strtDt + '/' + endDt + '/' + TsPrj + '/' + CalOf).pipe(
      map(res => JSON.parse(JSON.stringify(res)) ),
    );
    return obj;
  }

  getTsCol(strtDt, endDt) {
    const obj = this.get('/api/wkts/getWkBookTsCol/' + strtDt + '/' + endDt ).pipe(
      map(res => JSON.parse(JSON.stringify(res)) ),
    );
    return obj;
  }

  uptTsStatus(strtDt, endDt, Dpt, Sts) {
    const dts = {};
    const objs = {
      DtStrt : strtDt,
      DtEnd : endDt,
      Dpt : Dpt,
      Sts : Sts,
    };
    dts['data'] = objs;
    const obj = this.post('/api/wkts/uptTsSts', dts).pipe(
      map(res => JSON.parse(JSON.stringify(res)) ),
    );
    return obj;
  }
}
