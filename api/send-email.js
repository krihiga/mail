const nodemailer = require('nodemailer');
const { google } = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
    'YOUR_CLIENT_ID',
    'YOUR_CLIENT_SECRET',
    'YOUR_REDIRECT_URI'
);
oauth2Client.setCredentials({
    refresh_token: 'YOUR_REFRESH_TOKEN',
});

async function sendTestEmail() {
    try {
        const accessToken = await oauth2Client.getAccessToken();

        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: 'YOUR_EMAIL_ID',
                clientId: 'YOUR_CLIENT_ID',
                clientSecret: 'YOUR_CLIENT_SECRET',
                refreshToken: 'YOUR_REFRESH_TOKEN',
                accessToken: accessToken.token,
            },
        });

        const mailOptions = {
            from: 'YOUR_EMAIL_ID',
            to: 'test@example.com',
            subject: 'Test Email',
            text: 'This is a test email.',
        };

        const result = await transport.sendMail(mailOptions);
        console.log('Email sent:', result);
    } catch (error) {
        console.error('Error:', error);
    }
}

sendTestEmail();
