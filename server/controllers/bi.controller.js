const express         = require('express');
const config          = require('../helper/BIConfig.js');
const router          = express.Router();
const common          = require('../helper/common.js'); 

let urlAuth="https://login.microsoftonline.com/464aad2a-6b79-4c0a-bed4-5f90e0b6a607/oauth2/token";
//let urlAuth ="https://login.microsoftonline.com/464aad2a-6b79-4c0a-bed4-5f90e0b6a607/"
let urlGetBIRpt="https://api.powerbi.com/v1.0/myorg/reports/aff768f9-29b0-4150-826b-c0712fc70509";
const qs = require('qs')
var axios = require("axios");

let getAADToken = (req, res) => {
    //console.log(config.username);
    
    axios({
    url: urlAuth,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    data: qs.stringify(       
        {
            username:config.username, 
            password:config.password,
            client_id:config.client_id,
            client_secret:config.client_secret,
            grant_type: config.grant_type 
        }
    )
    })
    .then(function(response) {
        console.log(response)
        common.sendFullResponse(req, res, 200, response.data, 'D');
        //getBIReport(req,res, response.data.access_token)
    })
    .catch(function(error) {
        console.log(error)
    })
}

let getBIReport = (req, res, authToken) => {
    console.log('assdf');
    // const qs = require('qs')
    // var axios = require("axios");
    axios({
    method: 'get',
    url: urlGetBIRpt,
    headers: { 
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization' :'Bearer ' + authToken
             }//,
    // data: qs.stringify(       
    //     {
    //         reportId:config.username, 
    //         password:config.password,
    //         client_id:config.client_id,
    //         client_secret:config.client_secret,
    //         grant_type: config.grant_type 
    //     }
    // )
    })
    .then(function(response) {
        common.sendFullResponse(req, res, 200, response, 'D');
        console.log(response)
    })
    .catch(function(error) {
        console.log(error)
    })
}

//router.post('/getBIURL', getAADToken);
router.get('/getBIURL', getAADToken);
module.exports = router;
