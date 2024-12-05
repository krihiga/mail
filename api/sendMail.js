// sendMail.js (Backend for Vercel)
import { google } from 'googleapis';

export default async function handler(req, res) {
  const { email, subject, message } = req.body;

  // Check if the request method is POST
  if (req.method === 'POST') {
    try {
      // OAuth2 client setup
      const oAuth2Client = new google.auth.OAuth2(
        '3883661871-07tupqme26aqj7rfluesd55vadgrptsu.apps.googleusercontent.com', // Replace with your client ID
        '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', // Replace with your client secret
        'https://mail-rose.vercel.app/api/sendMail' // Replace with your redirect URI
      );

      // Get the user's token (you must implement OAuth flow on frontend to get the token)
      oAuth2Client.setCredentials({
        access_token: req.body.access_token, // Access token you got from frontend OAuth
        refresh_token: req.body.refresh_token, // Optional, if available
      });

      // Initialize Gmail API
      const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

      // Prepare the email
      const rawMessage = [
        `From: "krithi" onlyrithi@gmail.com`,
        `To: ${email}`,
        `Subject: ${subject}`,
        `Content-Type: text/html; charset=UTF-8`,
        `MIME-Version: 1.0`,
        `\n${message}`,
      ].join('\n');

      // Send the email
      const messageResponse = await gmail.users.messages.send({
        userId: 'me', // 'me' refers to the authenticated user
        requestBody: {
          raw: Buffer.from(rawMessage).toString('base64').replace(/\+/g, '-').replace(/\//g, '_'),
        },
      });

      res.status(200).json({ message: 'Email sent!', messageResponse });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
