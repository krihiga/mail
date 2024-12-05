const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',  // Gmail's SMTP server
    port: 587,               // TLS port
    secure: false,           // Use TLS
    auth: {
        user: process.env.GMAIL_USER,  // Your Gmail address
        pass: process.env.GMAIL_PASS,  // Your Gmail App password or regular password
    },
});

// API route for sending the email
module.exports = async (req, res) => {
    if (req.method === 'POST') {
        const { email, subject, message } = req.body;

        const mailOptions = {
            from: process.env.GMAIL_USER,  // Sender's email address
            to: email,                    // Recipient's email address
            subject: subject,             // Subject of the email
            text: message,                // Body of the email
        };

        try {
            const info = await transporter.sendMail(mailOptions);
            console.log('Email sent: ' + info.response);
            res.status(200).json({ message: 'Email sent successfully!' });
        } catch (error) {
            console.error('Error sending email:', error);
            res.status(500).json({ error: 'Error sending email' });
        }
    } else {
        res.status(405).json({ error: 'Method Not Allowed' });
    }
};
