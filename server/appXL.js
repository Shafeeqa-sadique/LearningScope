/* ========================================================================== */
/*                        MAIN FILE TO RUN THE NODE API                       */
/* ========================================================================== */

var express   = require('express');

var path      = require('path');
var http      = require('http');
var cors      = require('cors');

var https = require('https');
var fs = require('fs');

// console.log(options)
/*
 * Environment Variables
 */
require ('custom-env').env('dev')
var config    = require('./config');

/*-------------------  INITIALIZE OUR EXPRESS APP ------------------- */ 

var app = express();


console.log(app.req);

//app.set('uploads', path.join(__dirname, 'uploads'));
app.use(express.static(path.join(__dirname, 'dist')));

var index = require('./controllers/index.controller');
app.use(cors());

/*------------------- ADD HEADERS ------------------- */ 

app.use(function (req, res, next) {
  //console.log(req)
  /*-------------------  WEBSITE YOU WISH TO ALLOW TO CONNECT ------------------- */ 

  res.setHeader('Access-Control-Allow-Origin', config.baseurl);

  /*-------------------  REQUEST METHODS YOU WISH TO ALLOW ------------------- */ 

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  /*------------------- REQUEST HEADERS YOU WISH TO ALLOW  ------------------- */ 
  
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  /*------------------- PASS TO NEXT LAYER OF MIDDLEWARE ------------------- */ 
  
  next();
});


app.use('/', index);

app.get('/getpic/:gtId/:IOrP', function(req, res) {  
  
  var gtmaster    = require('./controllers/gtmaster.controller'); 
   gtmaster.getGoatPic(req,res);
  //console.log(file);
 // return res.send(file)
  //return res.send('test');
});

app.get('/adspic/:pid/:IOrP', function(req, res) {   
   var gtmaster    = require('./controllers/gtmaster.controller'); 
   gtmaster.getAdsPic(req,res); 
});

/**
 * IMAGE FROM UPLOAD FOLDER SERVED WITHOUT AUTHENTICATION DISABLED
 */
/*
app.get('/uploads/:goatPicture', function(req, res) {  
  res.sendFile(path.join(__dirname, 'uploads', req.params.goatPicture));
});
*/


app.get('/*', function(req, res) {    
   res.sendFile(__dirname + '/dist/index.html'); 
  //console.log('Header :' + req.headers.host +  req.url)
    // if (!req.secure) {
    //     var vrUrl = 'https://' + req.headers.host +  req.url
    //     return res.redirect(301, vrUrl);
    // } else {
    //   res.sendFile(__dirname + '/dist/index.html'); 
    // }
});

/*-------------------  SET PORT ------------------- */ 

app.set('port', process.env.RPTPORT || config.server.port);

/*-------------------  SET ENVIRONMENT DETAILES ------------------- */ 

app.set('env', process.env.NODE_ENV || 'development');
var serverHttp = http.createServer(app);

 
var options = {
  // key: fs.readFileSync("./ssl/_v2goatfarm_com_private.key"),
  // cert: fs.readFileSync("./ssl/_v2goatfarm_com.crt"),
  // ca: [
  //         fs.readFileSync('./ssl/AddTrust_External_CA_Root.crt'),
  //         fs.readFileSync('./ssl/USERTrust_RSA_Certification_Authority.crt') 
  //      ]
  key: fs.readFileSync("./ssl/_gcmc_privateKey.key"),
  cert: fs.readFileSync("./ssl/_gcmc_certificate.crt") 
};

  
var server = https.createServer(options,app);

/*-------------------  START API TO LISTION SERVER  PORT  ------------------- */ 

// set up a route to redirect http to https
// app.get('*', function(req, res) {  
//   console.redirect('Redirected')
//   res.redirect('https://' + req.headers.host + req.url);
//   // Or, if you don't want to automatically detect the domain name from the request header, you can hard code it:
//   // res.redirect('https://example.com' + req.url);
// })


// if(process.env.SSL=="TRUE")
// { 
//   server.listen(app.get('port'), function () {
//     console.log('Express server listening on httpS port ' + server.address().port + ' for ' + process.env.NODE_ENV);    
//   }); 
// }
// else
// {
//   serverHttp.listen(app.get('port'), function () {
//     console.log('Express server listening on http port ' + serverHttp.address().port + ' for ' + process.env.NODE_ENV);
//   }); 
// }

serverHttp.listen(app.get('port'), function () {
  console.log('Express server listening on http port ' + serverHttp.address().port + ' for ' + process.env.NODE_ENV);
}); 


