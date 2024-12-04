// api/sendmail.js

const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');

// Configure multer to use memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).single('image'); // 'image' corresponds to your file input field in HTML

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Multer file upload middleware
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

    // Get file extension and prepare filename
    const fileExtension = path.extname(req.file.originalname);
    const filename = `upload_${Date.now()}${fileExtension}`;

    // Setup Nodemailer transport
    const transporter = nodemailer.createTransport({
      service: 'gmail',  // You can use other email services as well
      auth: {
        user: process.env.EMAIL_USER,  // Set in environment variables on Vercel
        pass: process.env.EMAIL_PASS   // Set in environment variables on Vercel
      }
    });

    // Mail options
    const mailOptions = {
      from: from,
      to: 'onlyrithi@gmail.com',  // Replace with your recipient email
      subject: subject,
      text: message,
      attachments: [
        {
          filename: filename,
          content: req.file.buffer // Using the file buffer from memory storage
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
}
