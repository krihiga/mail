const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Ensure the images folder exists
if (!fs.existsSync('./images')) {
    fs.mkdirSync('./images');
}

const Storage = multer.diskStorage({
    destination: function (_req, _file, callback) {
        callback(null, './images');
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

const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];
let oAuth2Client;

// Load client secrets from a local file
fs.readFile('credentials.json', (err, content) => {
    if (err) return console.error('Error loading client secret file:', err);
    const { client_secret, client_id, redirect_uris } = JSON.parse(content).installed;
    oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    // Set the token if you have it saved
    fs.readFile('token.json', (err, token) => {
        if (err) return getNewToken(oAuth2Client);
        oAuth2Client.setCredentials(JSON.parse(token));
    });
});

// Obtain new token for OAuth2
function getNewToken(oAuth2Client) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
}

app.post('/sendmail', (req, res) => {
    upload(req, res, async function (err) {
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

        const { from, subject = 'No Subject', message = 'No Message' } = req.body;
        const filePath = req.file.path;

        try {
            const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

            const messageParts = [
                `From: ${from}`,
                `To: onlyrithi@gmail.com`,
                `Subject: ${subject}`,
                '',
                message
            ];

            const messageBody = messageParts.join('\n');

            // Encode message and attachment
            const rawMessage = Buffer.from(
                `${messageBody}\n\n--boundary\nContent-Type: application/octet-stream\nContent-Disposition: attachment; filename="${path.basename(filePath)}"\n\n${fs.readFileSync(filePath)}`
            ).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

            await gmail.users.messages.send({
                userId: 'me',
                requestBody: {
                    raw: rawMessage,
                },
            });

            console.log("Email sent successfully.");
            fs.unlink(filePath, (unlinkErr) => {
                if (unlinkErr) console.error("Error deleting file:", unlinkErr);
                return res.redirect('/result.html');
            });
        } catch (error) {
            console.error("Error sending email:", error);
            return res.end("Failed to send email.");
        }
    });
});

app.listen(5500, () => {
    console.log("App started on port 5500");
});
