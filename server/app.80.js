/* ========================================================================== */
/*                        MAIN FILE TO RUN THE NODE API                       */
/* ========================================================================== */

var express   = require('express');
var config    = require('./config');
var http      = require('http');
var cors      = require('cors');

// console.log(options)
/*
 * Environment Variables
 */

/*-------------------  INITIALIZE OUR EXPRESS APP ------------------- */ 

var app = express();

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




app.get('/*', function(req, res) {      
  console.log('Header :' + req.headers.host +  req.url)
  var vrUrl = 'https://' + req.headers.host +  req.url
  return res.redirect(301, vrUrl);
});

/*-------------------  SET PORT ------------------- */ 

app.set('port', process.env.PORT || config.server.port);

/*-------------------  SET ENVIRONMENT DETAILES ------------------- */ 

app.set('env', process.env.NODE_ENV || 'development');
var serverHttp = http.createServer(app);


/*-------------------  START API TO LISTION SERVER  PORT  ------------------- */ 

// set up a route to redirect http to https
// app.get('*', function(req, res) {  
//   console.redirect('Redirected')
//   res.redirect('https://' + req.headers.host + req.url);
//   // Or, if you don't want to automatically detect the domain name from the request header, you can hard code it:
//   // res.redirect('https://example.com' + req.url);
// })

serverHttp.listen('80', function () {
  console.log('Express server listening on port ' + serverHttp.address().port + ' for redirection');
});


