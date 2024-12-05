const express = require('express');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');

const app = express();
app.use(express.json());

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

async function sendMail(email, subject, message) {
  try {
    const accessToken = await oAuth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: 'onlyrithi@gmail.com',
        clientId: '3883661871-07tupqme26aqj7rfluesd55vadgrptsu.apps.googleusercontent.com',
        clientSecret: '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',
        refreshToken: '1//04CpCKTdItfZJCgYIARAAGAQSNwF-L9IrG8IY81qLjKFAMLNiKQwggnMfS0wot-IQ6UM6sHqneXhuPk4a9Ig14zha2xUmDYKQ7jE',
        accessToken: accessToken.token,
          },
    });

    const mailOptions = {
      from: 'krithi onlyrithi@gmail.com',
      to: email,
      subject: subject,
      text: message,
    };

    const result = await transporter.sendMail(mailOptions);
    return result;
  } catch (error) {
    return error;
  }
}

app.post('/api/send-email', async (req, res) => {
  const { email, subject, message } = req.body;
  try {
    const result = await sendMail(email, subject, message);
    res.status(200).json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = app;
