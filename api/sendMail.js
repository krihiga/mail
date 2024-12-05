const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const app = express();
require('dotenv').config();

const port = process.env.PORT || 5500;

app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',  // Gmail SMTP server
    port: 587,               // Port for TLS
    secure: false,           // Use TLS
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
    },
});



// Endpoint to send email
app.post('api/sendMail', (req, res) => {
    const { email, subject, message } = req.body;

    const mailOptions = {
        from: process.env.GMAIL_USER,  // Sender's email
        to: email,                    // Recipient email
        subject: subject,             // Subject of the email
        text: message,                // Email body content
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);  // Log the detailed error
            return res.status(500).json({ error: error.message });  // Send the error message in the response
        }
        console.log('Email sent: ' + info.response);
        return res.status(200).json({ message: 'Email sent successfully!' });
    });
    
    
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
