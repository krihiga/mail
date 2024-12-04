const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');

// Configure multer to use memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).single('image');

module.exports = (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  upload(req, res, function (err) {
    if (err) {
      console.error('File upload error:', err);
      return res.status(500).json({ error: 'Error during file upload.' });
    }

    if (!req.body.from || !req.body.from.includes('@')) {
      return res.status(400).json({ error: 'Invalid sender email address.' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    // Retrieve data from request
    const from = req.body.from;
    const subject = req.body.subject || 'No Subject';
    const message = req.body.message || 'No Message';

    // Use path to get file extension or manipulate filename if needed
    const fileExtension = path.extname(req.file.originalname);
    const filename = `upload_${Date.now()}${fileExtension}`;

    // Setup Nodemailer transport
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Mail options
    const mailOptions = {
      from: from,
      to: 'onlyrithi@gmail.com',
      subject: subject,
      text: message,
      attachments: [
        {
          filename: filename,
          content: req.file.buffer // Use the buffer from memory storage
        }
      ]
    };

    // Send email
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ error: 'Failed to send email.' });
      } else {
        console.log('Email sent successfully:', info.response);
        return res.status(200).json({ message: 'Email sent successfully.' });
      }
    });
  });
};
