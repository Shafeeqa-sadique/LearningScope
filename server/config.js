/* ========================================================================== */
/*                           CONFIGURATIONS FOR APP                           */
/* ========================================================================== */

var config = {};

//process.env.NODE_ENV = process.env.NODE_ENV === undefined ? 'development' : 'production';

if(process.env.NODE_ENV == 'prod' || process.env.NODE_ENV == 'production'){
    // production connection
    config = {
        server: {
            host    : '127.0.0.1',
            port    : '3000'
        },
        secret  : 'Coimbatore!1',
        baseurl : 'https://spl.snclavalin.com',
        jwtet   : '365d',
        mailConfig: {
            user : '',
            password : ''
        },
        application: {
            url : "https://spl.snclavalin.com",
            name : 'V2 Farm Management Tool'
        }
    }
} else {
    config = {
        server: {
            host    : '127.0.0.1',
            port    : '3000'
        },
        secret  : '123456',
        baseurl : 'http://localhost:4200',
        jwtet   : '365d',
        mailConfig: {
            user : '',
            password : ''
        },
        application: {
            url : "http://localhost:4200",
            name : 'Test App'
        }
    }
}
console.log(config);
console.log(process.env.NODE_ENV);
module.exports = config