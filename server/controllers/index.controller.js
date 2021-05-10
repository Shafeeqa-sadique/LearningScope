/* ========================================================================== */
/*                 MAIN FILE FOR ALL THE ROUTING AND API CALLS                */
/* ========================================================================== */

const express     = require('express');
const app         = express();
const bodyParser  = require('body-parser');
const expressJwt  = require('express-jwt');
const config      = require('../config');
const logger      = require('logger').createLogger('development.log'); // logs to a file


/* ------------------------------- ROUTERS  ------------------------------- */
const users       = require('./users.controller'); 
const gtmaster    = require('./gtmaster.controller'); 
const rtActivity  = require('./activity.controller'); 
const rtExpense   = require('./expense.controller'); 
const pfRegister  = require('./pafregister.controller'); 
const pfUpload  = require('./pafupload.controller'); 
const cbs  = require('./cbs.controller'); 
const ads = require('./ads.controller');
const pafrpt = require('./report.controller');
const vowdc = require('./vowd.controller');
const timesh = require('./timesheet.controller');
const rtServeFile    = require('./serve-file.controller'); 
const BIReport = require('./bi.controller');

/* ------------------------------- REQUEST TYPE JSON  ------------------------------- */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

/* ------------------------------- LOGGER GENERATE ERROR FILE  ------------------------------- */

/* if (app.get('env') === 'development') {
    process.on('uncaughtException', (err) => {
        logger.log('Sorry! There was an uncaught error', err);
        process.exit(1);
    });
}  */

/* ------------------------- JWT TOKEN AUTHORIZATION ------------------------ */

app.use('/api/anonymous/*',expressJwt({
        secret: config.secret,
        getToken: function(req) {
            if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
                return req.headers.authorization.split(' ')[1];
            } else if (req.query && req.query.token) {
                return req.query.token;
            }
            return null;
        }
    }).unless({
    path: [ 
            '/api/users/register',
            '/api/users/login',
            '/api/users/fetch',            
            '/api/ads/register',
            '/api/ads/verify',
            '/api/ads/login',
            '/api/ads/getads', 
            // '/api/paf/getpafreg',
            // '/api/paf/uptpafreg',
            // '/api/paf/xl/uploadxl',
        ]
    })
);

/* ------------------------- JWT TOKEN AUTHORIZATION ERROR ------------------------ */

app.use(function(err, req, res, next) {
    if(err.name === 'UnauthorizedError') {
      res.status(err.status).send({message:err.message});
      return;
    }
    next();
});

/* ------------------------------- ALL ROUTES ------------------------------- */

app.use('/api/users', users);
app.use('/api/gtmaster', gtmaster);
app.use('/api/activity', rtActivity);
app.use('/api/expense',rtExpense);
app.use('/api/report',pafrpt);
app.use('/api/ads',ads);
app.use('/api/paf',pfRegister);
app.use('/api/paf/xl', pfUpload);
app.use('/api/cbs', cbs);
app.use('/api/vowd', vowdc);
app.use('/api/wkts',timesh)
app.use('/api/bi', BIReport);
//app.use('/api/uploads',rtServeFile)

module.exports = app;