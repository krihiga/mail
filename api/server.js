const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-app-password' // Use app-specific password if 2FA is enabled
  }
});

const mailOptions = {
  from: 'your-email@gmail.com',
  to: 'recipient@gmail.com',
  subject: 'Test Mail',
  text: 'Hello, this is a test email!'
};

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});
transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error('Error sending mail:', error);
    res.status(500).send('Internal Server Error');
  } else {
    res.status(200).send('Email sent successfully');
  }
});
require('dotenv').config();
console.log(process.env.GMAIL_USER);
