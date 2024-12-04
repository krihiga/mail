// api/server.js

const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');

// Configure multer to use memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).single('image'); // 'image' corresponds to your file input field in HTML

export default function handler(req, res) {
  // Check for POST request
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Use multer to handle file upload
  upload(req, res, function (err) {
    if (err) {
      console.error('File upload error:', err);
      return res.status(500).json({ error: 'Error during file upload.' });
    }

    // Validate the email address from the request
    const from = req.body.from;
    if (!from || !from.includes('@')) {
      return res.status(400).json({ error: 'Invalid sender email address.' });
    }

    // Ensure a file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    // Retrieve other fields from the request body
    const subject = req.body.subject || 'No Subject';
    const message = req.body.message || 'No Message';

    // Get file extension and prepare filename
    const fileExtension = path.extname(req.file.originalname);
    const filename = `upload_${Date.now()}${fileExtension}`;

    // Set up the transporter for nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',  // Gmail service, you can use other services too
      auth: {
        user: process.env.EMAIL_USER,  // These should be set in Vercel environment variables
        pass: process.env.EMAIL_PASS   // Set EMAIL_PASS as environment variable
      }
    });

    // Email options with attachment
    const mailOptions = {
      from: from,
      to: 'onlyrithi@gmail.com',  // Replace with your recipient email address
      subject: subject,
      text: message,
      attachments: [
        {
          filename: filename,
          content: req.file.buffer  // Using buffer for in-memory file storage
        }
      ]
    };

    // Send the email
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
