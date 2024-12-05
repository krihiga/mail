const { google } = require('googleapis');
const nodemailer = require('nodemailer');
const formidable = require('formidable');
const fs = require('fs');

const CLIENT_ID = 'YOUR_CLIENT_ID';
const CLIENT_SECRET = 'YOUR_CLIENT_SECRET';
const REDIRECT_URI = 'YOUR_REDIRECT_URI';
const REFRESH_TOKEN = 'YOUR_REFRESH_TOKEN';

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send({ message: 'Only POST requests allowed' });
  }

  const form = new formidable.IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(500).json({ message: 'Form Parsing Error' });
    }

    try {
      const accessToken = await oauth2Client.getAccessToken();

      const transport = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: EMAIL,
          clientId: CLIENT_ID,
          clientSecret: CLIENT_SECRET,
          refreshToken: REFRESH_TOKEN,
          accessToken: accessToken.token,
        },
      });

      const fileContent = fs.readFileSync(files.file.filepath);
      
      const mailOptions = {
        from: 'Krithiga onlyrithi@gmail.com',
        to: fields.to,
        subject: fields.subject,
        text: fields.message,
        attachments: [
          {
            filename: files.file.originalFilename,
            content: fileContent,
          },
        ],
      };

      const result = await transport.sendMail(mailOptions);
      res.status(200).json({ message: 'Email sent', result });
    } catch (error) {
      res.status(500).json({ message: 'Email sending failed', error });
    }
  });
};
