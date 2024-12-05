const { google } = require('googleapis');
const nodemailer = require('nodemailer');

require('dotenv').config();


const CLIENT_ID = process.env.GMAIL_CLIENT_ID;
const CLIENT_SECRET = process.env.GMAIL_CLIENT_SECRET;
const REDIRECT_URI = process.env.GMAIL_REDIRECT_URI;
const REFRESH_TOKEN = process.env.GMAIL_REFRESH_TOKEN;

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

async function sendMail(req, res) {
  try {
    const accessToken = await oAuth2Client.getAccessToken();

    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: 'onlyrithi@gmail.com',
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken.token,
      },
    });

    const mailOptions = {
      from: 'Your Name <your-email@gmail.com>',
      to: 'onlyrithi@gmail.com',
      subject: 'Test Email with Attachment',
      text: 'This is a test email from a Vercel backend!',
      attachments: [
        {
          filename: 'test.txt',
          content: 'Hello, this is a test file!',
        },
      ],
    };

    const result = await transport.sendMail(mailOptions);
    res.status(200).send('Email sent: ' + result.response);
  } catch (error) {
    res.status(500).send(error.toString());
  }
}

module.exports = sendMail;
