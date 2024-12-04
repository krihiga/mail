const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'onlyrithi@gmail.com',
    pass: 'mvcz jraz ohrc ocwl',  // Use App Password if 2FA is enabled
  },
});

const mailOptions = {
  from: 'onlyrithi@gmail.com',
  to: 'rithikrishk@gmail.com',
  subject: 'Test Email',
  text: 'This is a test email.',
};

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});
