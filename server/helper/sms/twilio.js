 
// Download the helper library from https://www.twilio.com/docs/node/install
// Your Account Sid and Auth Token from twilio.com/console
// DANGER! This is insecure. See http://twil.io/secure
const accountSid = 'AC3a5f14fa24ffcc2ac76aeb586f2fc4e4';
const authToken = '419145bccb2ed4a66d56acd40277c7de';
const client = require('twilio')(accountSid, authToken);

client.messages
      .create({body: 'Hi there!', from: 'TEST', to: '+971559141074'})
      .then(message => console.log(message.sid));
