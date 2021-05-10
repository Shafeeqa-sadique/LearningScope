/* ========================================================================== */
/*                                  USER API'S                                */
/* ========================================================================== */

const express         = require('express');
const config          = require('../config.js');
const router          = express.Router();
const common          = require('../helper/common');
const jwt             = require('jsonwebtoken');
const passwordHash    = require('password-hash');
const randomstring    = require("randomstring");
const UserModel       = require('../models/user.model');
const mailer          = require('../helper/mailer');
const users = require('../models/user.model')

/* ------------------------------ REGISTER USER ----------------------------- */

/**
 * @param  {} req
 * @param  {} res
 * @param  {} next
 */
let register = (req, res, next) => {
    var provider = req.body.provider || '';
    if(!req.body.user_email) {
        return common.sendFullResponse(req, res, 300, {}, "Please enter email.");
    }
    if((provider != 'GOOGLE' && provider != 'FACEBOOK') && !req.body.mobile_no) {
        return common.sendFullResponse(req, res, 300, {}, "Please enter mobile number.");
    }
    UserModel.select(req.body, (err, result) => {
        if(err) return common.sendFullResponse(req, res, 500, {}, err);
        if (result && result.length === 0) {
            var tempPassword = randomstring.generate(8);
            var userData = {
                USER_EMAIL: req.body.user_email,
                PASSWORD: passwordHash.generate(tempPassword),
                MOBILE_NO: req.body.mobile_no || null,
                PROVIDER: provider || null,
                PROVIDER_ID: req.body.id || ''
            }

            UserModel.insert(userData, (err, insertedData) => {
                if(err) return common.sendFullResponse(req, res, 500, {}, err);
                if(insertedData){ 
                    if(provider == 'GOOGLE' || provider == 'FACEBOOK') {
                        common.sendFullResponse(req, res, 200, insertedData, "Registered successfully.");
                    }else{
                        var recipientEmail = req.body.user_email;
                        var appLink = config.application.url;
                        var applicationName = config.application.name;
                        var replacements = {
                            name: 'User',
                            userName: recipientEmail,
                            appLink: appLink,
                            applicationName: applicationName,
                            password: tempPassword
                        };
                        mailer.sendMail(req.body.user_email, 'Registration with Cattel Farm', 'registration-email', replacements).then(function(response, error) {
                            if(response){
                                common.sendFullResponse(req, res, 200, {}, "Registered successfully. Credentials has been sent to your registered email address for login.");
                            }else{
                                common.sendFullResponse(req, res, 300, {}, "Failed to send email.");
                            }
                        });
                    }
                } else {
                    return common.sendFullResponse(req, res, 200, {}, "Fail to register.");
                }
            })
        }
        else {
            common.sendFullResponse(req, res, 300, {}, `Opps! You have already signup with ${result[0].USER_EMAIL}.`);
        }
    });
}

/* ------------------------------- LOGIN USER ------------------------------- */
 

/**
 * @param  {} req
 * @param  {} res
 * @param  {} next
 */
let login = (req, res, next) => {  
    if(!req.body.user_email) {
        return common.sendFullResponse(req, res, 300, {}, "Please provide email address or phone number to login.");
    }
    if(!req.body.password) {
        return common.sendFullResponse(req, res, 300, {}, "Please enter password.");
    }    
    var email       = req.body.user_email;
    var password    = req.body.password;
    try {
            users.login(email,password, (err, result) =>{
            if(err) return common.sendFullResponse(req, res, 500, {}, err);
            //if(result && result.length > 0) {
            if(result) {
                common.sendFullResponse(req, res, 200, result, 'Login successfully!');
            } else
            {
                common.sendFullResponse(req, res, 300, result, 'Invalid Credentials!');
            }

        });
    } catch(err) {
        var message = 'Sorry! SQL Exception occurred!';
        return common.sendFullResponse(req, res, 300, {}, message);
    }
}

/* ------------------------------- GET USER BY EMAIL ------------------------------- */

/**
 * @param  {} req
 * @param  {} res
 * @param  {} next
 */
let getUserByEmail = (req, res, next) => {
    if(!req.body.user_email){
        return common.sendFullResponse(req, res, 300, {}, "Email address required.");
    }
    UserModel.selectByEmail(req.body.user_email, (err, result) => {
        if(err) return common.sendFullResponse(req, res, 500, {}, err);
        result = result.length > 0 ?  result[0] : [];
        if(result.USER_ID){
            var tempPassword = passwordHash.generate(randomstring.generate(8));
            var token = jwt.sign({email: result.USER_EMAIL, password:tempPassword},
                config.secret,
                { expiresIn: config.jwtet }
            );
            var userData = {
                // USER_ID: result.USER_ID,
                // USER_EMAIL: result.USER_EMAIL,
                // MOBILE_NO: result.MOBILE_NO,
                // CRE_DT: result.CRE_DT,
                // CLIENT_ID: result.CLIENT_ID,
                // token: token
                UI: result.USER_ID,
                UE: result.USER_EMAIL,                        
                token: token,                        
                CI: result.CLIENT_ID
            };
            common.sendFullResponse(req, res, 200, userData, "User fetched successfully");
        }else{
            common.sendFullResponse(req, res, 300, {}, "No data found");
        }
    });
}

let getAllUsers = (req, res) => {
    var sqlQuery = "SELECT * FROM TB_M_USER";
    common.exceSelect(sqlQuery, (err, result)=> {
        if(err) return common.sendFullResponse(req, res, 500, {}, err);
        if(result){
            common.sendFullResponse(req, res, 200, result, 'User details fetched successfully!');
        }
        else{
            common.sendFullResponse(req, res, 300, {}, "No users found");
        }
    })
}


let getUserCurrency = (req, res) => {
    var sqlQuery = "select GT_STATUS_ID GID,GT_PARENT_STATUS GPS,GT_STATUS_NAME GSN from [dbo].[TB_GT_STATUS] where GT_STATUS_CODE='LOCAL_CURRENCY'";
    common.exceSelect(sqlQuery, (err, result)=> {
        if(err) return common.sendFullResponse(req, res, 500, {}, err);
        if(result){
            common.sendFullResponse(req, res, 200, result, 'D');
        }
        else{
            common.sendFullResponse(req, res, 300, {}, "No users found");
        }
    })
}

let getPAFReg = (req, res) => {
    var sqlQuery = "select * From TB_PAF_REGISTER"; 
    common.exceSelect(sqlQuery, (err, result)=> {
        if(err) return common.sendFullResponse(req, res, 500, {}, err);
        if(result){
            common.sendFullResponse(req, res, 200, result, 'D');
        }
        else{
            common.sendFullResponse(req, res, 300, {}, "No users found");
        }
    })
}


/* ------------------------- ALL USER ROUTES ------------------------ */

router.post('/register', register);
router.post('/login', login);
router.post('/fetch', getUserByEmail);
router.get('/', getAllUsers);
router.get('/getCurr', getUserCurrency);
router.get('/getpafreg', getPAFReg);

module.exports = router;
 