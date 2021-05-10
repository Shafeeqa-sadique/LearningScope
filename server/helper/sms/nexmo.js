 const Nexmo = require('nexmo')

const nexmo = new Nexmo({
  apiKey: '95310fa8',
  apiSecret: 'cXUl4eLchDcxofNT',
  applicationId: '2b40b1f7-45d5-4ebf-b286-cdcf9d7ef1da',
  privateKey: `./helper/sms/nexmo-private.key`
})
 


exports.send_verify_code = (mobNO, pwdCode, callback) =>
{
  nexmo.message.sendSms("V2APP", mobNO, 'V2 Code :' + pwdCode, (err, responseData) => {
    if (err) { 
        callback(err,null);
    } else {
        if(responseData.messages[0]['status'] === "0") {            
            callback(null,"Message sent successfully.");
        } else {            
            callback(`Message failed with error: ${responseData.messages[0]['error-text']}`,null);
        }
    }
  })
}
 
 

// nexmo.channel.send(
//   { "type": "sms", "number": "971559141074" },
//   { "type": "sms", "number": "V2 App" },
//   {
//     "content": {
//       "type": "text",
//       "text": "Hi how are you s"
//     }
//   },
//   (err, data) => { console.log(data); }
// );
 

// exports.send_verify_code = (mobNO, pwdCode, callback) =>
// {
//   nexmo.channel.send(
//     { "type": "sms", "number": mobNO},
//     { "type": "sms", "number": "V2 App" },
//     {
//       "content": {
//         "type": "text",
//         "text": "Code: " + pwdCode
//       }
//     },
//     (err, data) => { 
//       console.log(data); 
//       console.log(err);
//       return callback(err, data);
//     }
//   );
// }
 

/*
const from = 'V2 App'
const to = '971559141074'
const text = 'A text message sent using the Nexmo SMS APIS'
nexmo.message.sendSms(from, to, text, (err, responseData) => {
  if (err) {
      console.log(err);
      callback(err,null);
  } else {
      if(responseData.messages[0]['status'] === "0") {
          console.log("Message sent successfully.");
          callback(null,"Message sent successfully.");
      } else {
          console.log(`Message failed with error: ${responseData.messages[0]['error-text']}`);
          callback(`Message failed with error: ${responseData.messages[0]['error-text']}`,null);
      }
  }
})
*/

