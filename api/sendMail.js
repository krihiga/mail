const express = require('express');
const nodemailer = require('nodemailer');
const formidable = require('formidable');
const { google } = require('googleapis');

const app = express();

// Middleware to handle form data and file uploads
app.post('/api/sendMail', (req, res) => {
    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(400).json({ error: 'Error parsing the form data', details: err });
      }
  
      const { to, subject, message } = fields;
      const attachment = files.attachment ? files.attachment[0] : null;
  
      try {
        const oAuth2Client = new google.auth.OAuth2(
          process.env.GMAIL_CLIENT_ID,
          process.env.GMAIL_CLIENT_SECRET,
          process.env.GMAIL_REDIRECT_URI
        );
  
        oAuth2Client.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });
  
        const accessToken = await oAuth2Client.getAccessToken();
if (!accessToken.token) {
  return res.status(400).json({ error: 'Unable to retrieve valid access token' });
}
console.log('Access Token:', accessToken.token);  // Log the token for verification

  
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            type: 'OAuth2',
            user: 'onlyrithi@gmail.com',  // Replace with your Gmail address
            clientId: process.env.GMAIL_CLIENT_ID,
            clientSecret: process.env.GMAIL_CLIENT_SECRET,
            refreshToken: process.env.GMAIL_REFRESH_TOKEN,
            accessToken: accessToken.token,
          },
        });
  
        const mailOptions = {
          from: 'onlyrithi@gmail.com', // Replace with your Gmail address
          to: to,
          subject: subject,
          text: message,
          
        };
  
        const result = await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, response: result.response });
      } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: error.toString(), details: error.response || error.message });
      }
    });
  });
  