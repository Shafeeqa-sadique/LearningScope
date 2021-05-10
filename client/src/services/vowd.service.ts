import { Injectable } from '@angular/core';
import { Api } from './api.service';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class VowdService extends Api  {

  public getVOWDDts() {
    const obj = this.get('/api/paf/getVOWD').pipe(
      map(res => JSON.parse(JSON.stringify(res)) ),
    );
    return obj;
  }


  public uptGenerateRpt(data: any) {
    const dt = {};
    dt['data'] = data;
    return this.post('/api/vowd/uptGenerateVOWD', dt).pipe(map(rs => {
        return rs;
    }));
  }

}
