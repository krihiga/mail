require('dotenv').config(); // Load environment variables

const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Configure multer for file upload
const Storage = multer.diskStorage({
  destination: function (_req, _file, callback) {
    callback(null, './uploads'); // Define the folder to store files
  },
  filename: function (_req, file, callback) {
    callback(null, file.fieldname + '__' + Date.now() + '__' + file.originalname);
  }
});

const upload = multer({ storage: Storage }).single('attachment'); // Only single file upload

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests allowed' });
  }

  // Use multer to handle file upload before continuing with the email
  upload(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ message: 'Error uploading file', error: err.message });
    }

    const { to, subject, message } = req.body;
    const file = req.file;

    if (!to || !subject || !message) {
      return res.status(400).json({ message: 'Missing required fields: to, subject, message' });
    }

    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
      // Initialize OAuth2 client
      const oAuth2Client = new google.auth.OAuth2(
        process.env.CLIENT_ID,
        process.env.CLIENT_SECRET,
        process.env.REDIRECT_URI
      );
      oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

      // Obtain an access token
      const accessToken = await oAuth2Client.getAccessToken();

      // Configure the email transporter
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: process.env.EMAIL,
          clientId: process.env.CLIENT_ID,
          clientSecret: process.env.CLIENT_SECRET,
          refreshToken: process.env.REFRESH_TOKEN,
          accessToken: accessToken.token, // Token acquired
        },
        logger: true,
        debug: true,
      });

      // Mail options including attachment
      const mailOptions = {
        from: `Your Name <${process.env.EMAIL}>`, // Sender's email address
        to, // Recipient's email address
        subject, // Email subject
        text: message, // Email body (plain text)
        attachments: [
          {
            filename: file.originalname,
            path: path.resolve(__dirname, file.path), // Correct path to the file
          },
        ],
      };

      // Send the email
      await transport.sendMail(mailOptions);
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending email', error });
  }
  });
};
