const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path'); // To use path for file name manipulation

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer to use memory storage (no file system interaction on Vercel)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).single('image');

// Mail handler
app.post('https://mail-ochre-chi.vercel.app/api/sendmail', (req, res) => {
  upload(req, res, function (err) {
    if (err) {
      console.error("File upload error:", err);
      return res.status(500).send("Error during file upload.");
    }

    if (!req.body.from || !req.body.from.includes('@')) {
      return res.status(400).send("Invalid sender email address.");
    }

    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }

    // Retrieve data from request
    const from = req.body.from;
    const subject = req.body.subject || 'No Subject';
    const message = req.body.message || 'No Message';

    // Use path to get file extension or manipulate filename (if needed)
    const fileExtension = path.extname(req.file.originalname); // Get file extension
    const filename = `upload_${Date.now()}${fileExtension}`;  // Create a unique filename

    // Setup Nodemailer transport
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      logger: true,
      debug: true
    });

    // Mail options
    const mailOptions = {
      from: from,
      to: 'onlyrithi@gmail.com',
      subject: subject,
      text: message,
      attachments: [
        {
          filename: filename, // Use the manipulated filename
          content: req.file.buffer // Use the buffer from memory storage
        }
      ]
    };

    // Send email
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).send("Failed to send email.");
      } else {
        console.log("Email sent successfully:", info.response);
        return res.status(200).send("Email sent successfully.");
      }
    });
  });
});

// Start server
const port = process.env.PORT || 5500; // Use port 5500 if PORT is not set
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
