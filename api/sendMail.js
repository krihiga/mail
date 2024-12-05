const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const formidable = require('formidable');

module.exports = (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Parse the form data (including file uploads)
  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({ error: 'Error parsing the form data' });
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

      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: 'onlyrithi@gmail.com', // Replace with your Gmail address
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
        attachments: attachment
          ? [
              {
                filename: attachment.originalFilename,
                path: attachment.filepath,
              },
            ]
          : [],
      };

      const result = await transporter.sendMail(mailOptions);
      res.status(200).send('Email sent: ' + result.response);
    } catch (error) {
      res.status(500).send(error.toString());
    }
  });
};
