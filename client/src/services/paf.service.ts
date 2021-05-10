import { Injectable } from '@angular/core';
// import { environment } from '../environments/environment';
// import { from } from 'rxjs';
import { Api } from './api.service';
import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root',
})
export class PafService extends Api {


  getPAFReg() {
    const obj = this.get('/api/paf/getpafreg').pipe(
      map(res => JSON.parse(JSON.stringify(res)) ),
    );
    return obj;
  }

  uptPAFReg(data) {
    const dt = {};
    dt['data'] = data;
    const obj = this.post('/api/paf/uptpafreg', dt).pipe(
      map(res => JSON.parse(JSON.stringify(res)) ),
    );
    return obj;
  }

  addPAFReg(data) {
    const dt = {};
    dt['data'] = JSON.stringify(data);
    console.log('Serive');
    const obj = this.post('/api/paf/addpafreg', dt).pipe(
      map(res => JSON.parse(JSON.stringify(res)) ),
    );
    return obj;
  }

  delPAFReg(data) {
    const dt = {};
    dt['data'] = JSON.stringify(data);
    const obj = this.post('/api/paf/delpafreg', dt).pipe(
      map(res => JSON.parse(JSON.stringify(res)) ),
    );
    return obj;
  }

  getPosition() {
    const obj = this.get('/api/paf/getPosition').pipe(
      map(res => JSON.parse(JSON.stringify(res)) ),
    );
    return obj;
  }

}
