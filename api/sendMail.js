const express = require('express');
const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const multer = require('multer');
const fs = require('fs');
require('dotenv').config();

const app = express();
const upload = multer({ dest: 'uploads/' });
const port = process.env.PORT || 3000;

// Gmail OAuth2 setup
const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URI
);

oauth2Client.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN,
});

const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

// Send email function
async function sendMail(subject, body, to, attachment) {
  const accessToken = await oauth2Client.getAccessToken();
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.EMAIL,  // Replace with your email
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN,
      accessToken: accessToken.token,
    },
  });

  const mailOptions = {
    from: 'onlyrithi@gmail.com',
    to: to,
    subject: subject,
    text: body,
    attachments: [
      {
        filename: attachment.originalname,
        path: attachment.path,
        contentType: attachment.mimetype,
      },
    ],
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

// Endpoint to send email
app.post('api/sendMail', upload.single('file'), async (req, res) => {
  const { subject, body, to } = req.body;
  const attachment = req.file;

  await sendMail(subject, body, to, attachment);

  // Cleanup the uploaded file after sending
  fs.unlinkSync(attachment.path);

  res.send('Email sent successfully!');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
