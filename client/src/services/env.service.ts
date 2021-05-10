export class EnvService {

  // The values that are defined here are the default values that can
  // be overridden by env.js

  // API url
  public baseURL = 'http://localhost:3000/';
  public apiURL = 'http://localhost:3000';
  public spxApiURL = 'http://localhost:8080';
  public authURL = '/_api/contextinfo';
  public apiReportURL = 'http://localhost:3000';
  public spxHref = '';
  public spxHrefAtchPath = '';
  public production = false;
  // Whether or not to enable debug mode
  public enableDebug = true;
  public emailURL = 'https://spl.snclavalin.com/sites/omprjbpgcmc/SiteAssets/ROOTS/Index.aspx';

  constructor() {
  }

}
