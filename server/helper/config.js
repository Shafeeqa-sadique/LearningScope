/* ========================================================================== */
/*                      DATABASE CONNECTION FOR WHOLE APP                     */
/* ========================================================================== */


/*------------------- DEFALUT DEVELOPMENT CONNECTION CONFIG TO DATABASE ------------------- */
console.log(process.env.NODE_ENV);
console.log(process.env.DB_PASS);

var config ={};
if((process.env.NODE_ENV == 'office') || (process.env.NODE_ENV == 'prod'))//
{
    config = {
        userName: process.env.DB_USER,
        password: process.env.DB_PASS,
        server: process.env.DB_HOST,  
        driver: 'tedious', 
        port: 1433, 
        options: {     
            database: process.env.DB_NAME,
            encrypt: false, // Use this if you're on Windows Azure 
            //IF SERVER IS MSSQLSERVER (DEFAULT INSTANCE) THEN COMMENT THE BELOW INSTANCE NAME
            //instanceName: process.env.DB_INSTANCE,
            packetSize: 524288, 
            rowCollectionOnRequestCompletion:true,
            connectionTimeout: 300000,
            requestTimeout: 300000,
        }
    }
    // config = { 
    //     authentication: {
    //         options: {
    //           userName: "v2server", // update me
    //           password: "Coimbatore!1" // update me
    //         },
    //         type: "default"
    //       },
    //       server: "v2farmserver.database.windows.net", // update me
    //       options: {
    //         database: "v2_db_frm_mng", //update me
    //         encrypt: true
    //       }
    // }
} else if((process.env.NODE_ENV == 'dev'))//
{
    config = {
        userName: process.env.DB_USER,
        password: process.env.DB_PASS,
        server: process.env.DB_HOST,  
        driver: 'tedious', 
        port: 1433, 
        options: {     
            database: process.env.DB_NAME,
            encrypt: false, // Use this if you're on Windows Azure 
            //IF SERVER IS MSSQLSERVER (DEFAULT INSTANCE) THEN COMMENT THE BELOW INSTANCE NAME
            //instanceName: process.env.DB_INSTANCE,
            packetSize: 524288, 
            rowCollectionOnRequestCompletion:true,
            connectionTimeout: 300000,
            requestTimeout: 300000
        }
    } 
}
else
{
    config = {
        userName: process.env.DB_USER,
        password: process.env.DB_PASS,
        server: process.env.DB_HOST,  
        driver: 'tedious', 
        port: 1433,   
        options: {     
            database: process.env.DB_NAME,
            encrypt: true, // Use this if you're on Windows Azure 
            //IF SERVER IS MSSQLSERVER (DEFAULT INSTANCE) THEN COMMENT THE BELOW INSTANCE NAME
            //instanceName: process.env.DB_INSTANCE,
            rowCollectionOnRequestCompletion:true,
            connectionTimeout: 300000,
            requestTimeout: 300000
        }
    }
}
  console.log(config);

// var config = {
//   userName: 'sa',
//   password: 'Petrofac@123$',
//   server: 'localhost',  
//   driver: 'tedious', 
//   port: 1433,   
//   options: {     
//       database: 'DB_TEST',
//       encrypt: true, // Use this if you're on Windows Azure 
//       instanceName: 'SQLSERVER2016'
//   }
// }

// var config = {
//   userName: 'sa', 
//   password: 'Petrofac@123$', 
//   server  : 'DT0027AAAYKPOMN',
//   options : {
//       database: 'DB_TEST',
//       encrypt : true,
//       rowCollectionOnRequestCompletion:true
//   }
// }
  
/*------------------- PRODUCTION CONNECTION CONFIG TO DATABASE ------------------- */

if(process.env.NODE_ENV == 'prod' || process.env.NODE_ENV == 'production'){
    // prduction database connection details
}

module.exports = config;
