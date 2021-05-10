/* ========================================================================== */
/*                        MAILER FILE TO SEND E-MAIL                          */
/* ========================================================================== */

var Q               = require('q');
var config          = require('../config');
var nodemailer      = require('nodemailer');
var handlebars      = require('handlebars');
var fs              = require('fs');
var path            = require('path');
var smtpTransport   = require('nodemailer-smtp-transport');

module.exports = {
    /**
     * @param  {} to
     * @param  {} emailSubject
     * @param  {} emailTemplate
     * @param  {} emailData
    */
    sendMail: function (to, subject, tplName, replacements) {
        var d = Q.defer();

        /* ------------------------------ READ FILE FOR SEND E-MAIL TEMPLATE ----------------------------- */

        var readHTMLFile = function(path, callback) {
            fs.readFile(path, {encoding: 'utf-8'}, function (err, html) {
                if (err) {
                    throw err;
                }
                else {
                    callback(null, html);
                }
            });
        };

        /* ------------------------------ SMTP DETAIL FOR SEND E-MAIL ----------------------------- */ 

        smtpTransport  = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: config.mailConfig.user, // Your email id
                pass: config.mailConfig.password // Your password
            }
        });
        
        var EmailTplpath = path.join('public','email-templates', tplName +'.html');
        readHTMLFile(EmailTplpath, function(err, html) {
            var template = handlebars.compile(html);
            var htmlToSend = template(replacements);
            var mailOptions = {
                from: config.mailConfig.user,
                to : to,
                subject : subject,
                html : htmlToSend
             };

            /* ------------------------------ SEND E-MAIL FUNCTION ----------------------------- */

            smtpTransport.sendMail(mailOptions, function (error, response) {
                if (response) {
                    return d.resolve(response);
                }else{
                    return d.reject(error);
                }
            });
        });
        return d.promise;
    }
};