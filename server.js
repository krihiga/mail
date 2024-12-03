const nodemailer = require('nodemailer');
const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const app = express();
const fs = require('fs');
const path = require('path');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Ensure the images folder exists
if (!fs.existsSync('./images')) {
    fs.mkdirSync('./images');
}

const Storage = multer.diskStorage({
    destination: function (_req, _file, callback) {
        callback(null, './images'); // Correct storage path
    },
    filename: function (_req, file, callback) {
        callback(null, file.fieldname + "__" + Date.now() + "__" + file.originalname);
    }
});

const upload = multer({
    storage: Storage
}).single('image');

app.use(express.static('public'));

app.get('/', (_req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('https://mail-ochre-chi.vercel.app/api/sendmail', (req, res) => {
    upload(req, res, function (err) {
        if (err) {
            console.error("File upload error:", err);
            return res.end("Error during file upload.");
        }

        if (!req.body.from || !req.body.from.includes('@')) {
            return res.end("Invalid sender email address.");
        }

        if (!req.file) {
            return res.end("No file uploaded.");
        }

        // Retrieve data from request
        const from = req.body.from;
        const subject = req.body.subject || 'No Subject';
        const message = req.body.message || 'No Message';
        const filePath = req.file.path;

        console.log(from, subject, message, filePath);

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'onlyrithi@gmail.com',
                pass: 'mvcz jraz ohrc ocwl'
            },
            logger: true,
            debug: true
        });

        const mailOptions = {
            from: from,
            to: 'onlyrithi@gmail.com',
            subject: subject,
            text: message,
            attachments: [
                {
                    filename: path.basename(filePath), // Keep the original file name
                    path: path.resolve(__dirname, filePath)  // Correct path handling
                }
            ]
        };

        console.log("Resolved Path:", path.resolve(__dirname, filePath));

        transporter.sendMail(mailOptions, function (err, info) {
            if (err) {
                console.error("Error sending email:", err);
                return res.end("Failed to send email.");
            } else {
                console.log("Email sent successfully:", info.response);

                // Delete the file after sending
                fs.unlink(filePath, function (err) {
                    if (err) {
                        console.error("Error deleting file:", err);
                        return res.end("Error deleting uploaded file.");
                    } else {
                        console.log("File deleted successfully.");
                        return res.redirect('/result.html');
                    }
                });
            }
        });
    });
});

app.listen(5500, () => {
    console.log("App started on port 5500");
});
