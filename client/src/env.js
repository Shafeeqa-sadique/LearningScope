(function (window) {
    window.__env = window.__env || {};

    //DEVELOPMENT
    window.__env.production= false;
    window.__env.enableDebug = true;
    window.__env.baseURL= "http://localhost:4210";
    window.__env.apiURL="http://localhost:3010";
    window.__env.spxApiURL="http://localhost:8090";
    window.__env.authURL="/_api/contextinfo";
    window.__env.apiReportURL="http://localhost:3020";
    window.__env.spxHref="https://atkins.sharepoint.com";
    window.__env.spxHrefAtchPath="/sites/PDOCSSC/Lists/LS_TS_WK_ATTACH/Attachments/";
    window.__env.emailURL="http://localhost:4210/Index.html";


    //TEST
    // window.__env.production= true,
    // window.__env.enableDebug = false;
    // window.__env.baseURL= "https://atkins.sharepoint.com/sites/PDOCSSC/SiteAssets/PDOTEST";
    // window.__env.apiURL="https://saalk5701879:3010";
    // window.__env.spxApiURL="https://atkins.sharepoint.com/sites/PDOCSSC";
    // window.__env.authURL="/_api/contextinfo";
    // window.__env.apiReportURL="https://saalk5701879:3011";
    // window.__env.spxHref="https://atkins.sharepoint.com";
    // window.__env.spxHrefAtchPath="/sites/PDOCSSC/Lists/LS_TS_WK_ATTACH/Attachments/";
    // window.__env.emailURL="https://atkins.sharepoint.com/sites/PDOCSSC/SiteAssets/PDOTEST/Index.aspx";


    //PRODUCTION
    // window.__env.production= true,
    // window.__env.enableDebug = false;
    // window.__env.baseURL= "https://atkins.sharepoint.com/sites/PDOCSSC/SiteAssets/PDOTEST";
    // window.__env.apiURL="https://saalk5701879:3010";
    // window.__env.spxApiURL="https://atkins.sharepoint.com/sites/PDOCSSC";
    // window.__env.authURL="/_api/contextinfo";
    // window.__env.apiReportURL="https://saalk5701879:3011";
    // window.__env.spxHref="https://atkins.sharepoint.com";
    // window.__env.spxHrefAtchPath="/sites/PDOCSSC/Lists/LS_TS_WK_ATTACH/Attachments/";
    // window.__env.emailURL="https://atkins.sharepoint.com/sites/PDOCSSC/SiteAssets/PDOTEST/Index.aspx";


}(this));
