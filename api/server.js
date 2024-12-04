const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');

// Set up file storage with multer (memory storage to handle file directly in memory)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

module.exports = (req, res) => {
  // Handle file upload first
  upload.single('file')(req, res, async (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error uploading file');
    }

    // Create a transporter object using SMTP transport
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER, // Your Gmail username from .env
        pass: process.env.GMAIL_PASS, // Your Gmail password from .env
      },
    });

    const mailOptions = {
      from: 'your-email@gmail.com',  // Sender's email
      to: 'recipient-email@gmail.com',  // Recipient's email
      subject: 'Email with File Attachment',
      text: 'Please find the attached file.',
      attachments: [
        {
          filename: req.file.originalname,  // Name of the uploaded file
          content: req.file.buffer,         // The file content as a buffer
        },
      ],
    };

    try {
      // Send the email
      await transporter.sendMail(mailOptions);
      res.status(200).send('Email sent successfully');
    } catch (error) {
      console.error(error);
      res.status(500).send('Failed to send email');
    }
  });
};
