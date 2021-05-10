import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root',
})
export class GlbVarService {
  // SYSTEM ROLE
  public rolSNCDisLD: string = 'COD_ROL_SN_DISC_LEAD';
  public rolSNCMGR: string = 'COD_ROL_SN_DIRECTOR';
  public rolSNTSUsr: string = 'COD_ROL_SN_PRJ_USR';

  public rolGCDisLD: string = 'COD_ROL_GC_DISC_LEAD';
  public rolGCMGR: string = 'COD_ROL_GC_CONTRACT_ADM';
  public rolGCDrct: string ='COD_ROL_GC_DIRECTOR';

  public rolTSAdm: string = 'COD_ROL_SN_TS_ADM';
  public rolTSCostCtrl: string = 'COD_ROL_SN_COST_CTRL';

  // PROJECT USER ROLE ID
  public TSStsCodeDraft: string = 'COD_STS_00';
  public TSStsCodeSubmit: string = 'COD_STS_01';
  public TSStsCodeIntial: string = 'COD_STS_START';

  // DDL CODE
  public ddlCodeEmpSts: string = 'CODE_PF_EMP_STS';
  public ddlCodeEXIN: string = 'COD_PAF_INEX';
  public ddlCodeCBSAFE: string = 'AFE';
  public ddlCodeAFEType: string = 'COD_AFE_CAT';
  public ddlCodeTransport: string = 'COD_CBS_TRANSPRT';
  public ddlCBSCodeTransport: string = 'TRANSPORT';
  public ddlCodeOT: string = 'OT'; // OVER TIME
  public ddlPAFEmpStsActive: string = 'Active';

  //ACTION TYPE
  public nxtActionGrpUser: string='ACT_GRP_USER';
  public nxtActionGrpLead: string='ACT_GRP_DISC';
  public nxtActionGrpDirector: string='ACT_GRP_ALL';

  constructor() { }

  public formatDate(date) {
    if (date !== undefined && date !== '') {
      const myDate = new Date(date);
      const month = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ][myDate.getMonth()];
      const str = myDate.getDate() + '-' + month + '-' + myDate.getFullYear().toString().slice(-2);
      return str;
    }
    return '';
  }
  public agGrdformatDate(date) {
    if (date.value !== undefined && date.value !== '' && date.value !== null) {
      const myDate = new Date(date.value);
      const month = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ][myDate.getMonth()];
      const str = myDate.getDate() + '-' + month + '-' + myDate.getFullYear().toString().slice(-2);
      return str;
    }
    return null;
  }

  public agGrdCrrFormat(pObj) {
    return '$ ' + Math.floor(pObj.value)
    .toString()
    .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
  }

  // convertUTCDateToLocalDate(date)
	// {
  //   if((date !== null) && (date !== undefined)){
  //        var newDate = new Date(date);
  //        newDate.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  //        return newDate.toUTCString();
  //   }else{
  //     return date
  //   }
  // }

  dateAheadFix(x) {
    console.log(x);
    if ((x !== null)) {
      const offsetMs = x.getTimezoneOffset() * 60000;
      return new Date(x.getTime() - offsetMs).toJSON();
    } else {
      return x;
    }

  }

  public agGrdDateFltParm = {
    comparator: function (filterLocalDateAtMidnight, cellValue) {
      const dateAsString = cellValue;
      if (dateAsString == null) return -1;
      const dateParts = dateAsString.split('-');
      console.log(dateParts);
      const cellDate = new Date(
        Number(dateParts[0]),
        Number(dateParts[1]) - 1,
        Number(dateParts[2].substr(0, 2)),
      );
      if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
        return 0;
      }
      if (cellDate < filterLocalDateAtMidnight) {
        return -1;
      }
      if (cellDate > filterLocalDateAtMidnight) {
        return 1;
      }
    },
    browserDatePicker: true,
    minValidYear: 2000,
  };

  public getDistinct(pArr, pField) {
    const rs = [];
    const map = new Map();
    for (const item of pArr) {
      if (!map.has(item[pField])) {
          map.set(item[pField], true);
          rs.push(item[pField]);
      }
    }
    return rs;
  }

  public getChrtBarColor() {
    return [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(51, 204, 51,1)',
          'rgba(0, 102, 255,1)',
          'rgb(153, 0, 255,1)',
          'rgb(204, 0, 204,1)',
          'rgb(255, 102, 255,1)',
          'rgb(0, 102, 0,1)',
          'rgb(102, 255, 51,1)',
          ];
  }

  public csv2json(csv) {

    const lines = csv.split('\n');

    const result = [];

    // NOTE: If your columns contain commas in their values, you'll need
    // to deal with those before doing the next step
    // (you might convert them to &&& or something, then covert them back later)
    // jsfiddle showing the issue https://jsfiddle.net/
    const headers = lines[0].split(',');

    for (let i = 1; i < lines.length; i++) {

        const obj = {};
        const currentline = lines[i].split(',');

        for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = currentline[j];
        }

        result.push(obj);

    }

    // return result; //JavaScript object
    return JSON.stringify(result); // JSON
  }

  public json2Html(pJson) {
    const cols = Object.keys(pJson[0]);
    // Map over columns, make headers,join into string
    const headerRow = cols
      .map(col => `<th>${col}</th>`)
      .join('');
    // map over array of json objs, for each row(obj) map over column values,
    // and return a td with the value of that object for its column
    // take that array of tds and join them
    // then return a row of the tds
    // finally join all the rows together
    const rows = pJson
      .map(row => {
        const tds = cols.map(col => `<td>${row[col]}</td>`).join('');
        return `<tr>${tds}</tr>`;
      })
      .join('');
    // build the table
    const table = `
    <table>
      <thead>
        <tr>${headerRow}</tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>`;
    return table;
  }

  public json2CSV(JSONData, ReportTitle, ShowLabel) {
    //If JSONData is not an object then JSON.parse will parse the JSON string in an Object
    var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;

    var CSV = 'sep=,' + '\r\n\n';

    //This condition will generate the Label/Header
    if (ShowLabel) {
        var row = "";

        //This loop will extract the label from 1st index of on array
        for (var index in arrData[0]) {

            //Now convert each value to string and comma-seprated
            row += index + ',';
        }

        row = row.slice(0, -1);

        //append Label row with line break
        CSV += row + '\r\n';
    }

    //1st loop is to extract each row
    for (var i = 0; i < arrData.length; i++) {
        var row = "";

        //2nd loop will extract each column and convert it in string comma-seprated
        for (var index in arrData[i]) {
            row += '"' + arrData[i][index] + '",';
        }

        row.slice(0, row.length - 1);

        //add a line break after each row
        CSV += row + '\r\n';
    }

    if (CSV == '') {
        alert("Invalid data");
        return;
    }

    //Generate a file name
    var fileName = "";
    //this will remove the blank-spaces from the title and replace it with an underscore
    fileName += ReportTitle.replace(/ /g,"_");

    //Initialize file format you want csv or xls
    var uri = 'data:text/csv;charset=utf-8,' + escape(CSV);

    // Now the little tricky part.
    // you can use either>> window.open(uri);
    // but this will not work in some browsers
    // or you will not get the correct file extension

    //this trick will generate a temp <a /> tag
    var link = document.createElement("a");
    link.href = uri;

    //set the visibility hidden so it will not effect on your web-layout
    //link.style= "visibility:hidden";
    link.download = fileName + ".csv";

    //this part will append the anchor tag and remove it after automatic click
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

}
