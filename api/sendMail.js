require('dotenv').config(); // Load environment variables

const { google } = require('googleapis');
const nodemailer = require('nodemailer');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests allowed' });
  }

  const { to, subject, message } = req.body;

  if (!to || !subject || !message) {
    return res.status(400).json({ message: 'Missing required fields: to, subject, message' });
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
    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: process.env.EMAIL,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken: accessToken.token, // Token acquired
      },
    });

    // Mail options
    const mailOptions = {
      from: `Your Name <${process.env.EMAIL}>`, // Sender's email address
      to,                                      // Recipient's email address
      subject,                                 // Email subject
      text: message,                           // Email body (plain text)
    };

    // Send the email
    await transport.sendMail(mailOptions);
    res.status(200).json({ message: 'Email sent successfully!' });

  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({
      message: 'Failed to send email',
      error: error.message || 'Unknown error',
    });
  }
};