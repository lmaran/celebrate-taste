'use strict';

var config = require('../config/environment');
var nodemailer = require('nodemailer');
var Mailgun = require('mailgun-js');

var factory = {};

factory.sendEmail = function(to, subject, body){

    var mailOptions = {
        from: '"Celebrate Taste" <support@celebrate-taste.ro>',
        to: to,
        subject: subject,
        html: body
    };

    // Zoho
    var transporter = nodemailer.createTransport({
        host: 'smtp.zoho.com',
        port: 465,
        secure: true, // use SSL
        auth: {         
            user: config.zoho.user,
            pass: config.zoho.psw            
        }
    });

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) return console.log(error);
        console.log('Message sent: ' + info.response);
    });     
    
    
//     // Mailgun    
//     var mailgun = new Mailgun({ apiKey: config.mailgun.api_key, domain: 'mg.celebrate-taste.ro' });
// 
//     mailgun.messages().send(emailOptions, function (err, body) {
//         if (err) {
//             console.log("got an error: ", err);
//         } else {
//             console.log('ok');
//         }
//     });  
};
    	
	
module.exports = factory;