const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const cors = require('cors');

// Initialiser Firebase Admin
admin.initializeApp();

// ── Configurer Nodemailer avec Gmail ──
// IMPORTANT : Tu dois activer les "App Passwords" dans ton compte Google
// Voir : https://myaccount.google.com/apppasswords
// Pour déployer, utilise : firebase functions:config:set gmail.user="email" gmail.password="password"
let transporter;
function getTransporter() {
  if (!transporter) {
    const gmailUser = functions.config().gmail?.user;
    const gmailPassword = functions.config().gmail?.password;

    if (!gmailUser || !gmailPassword) {
      console.warn('Gmail credentials not configured. Configure them using: firebase functions:config:set gmail.user="your-email" gmail.password="your-password"');
    }

    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPassword
      }
    });
  }
  return transporter;
}

// Configurer CORS pour permettre les requêtes depuis localhost et production
const corsHandler = cors({
  origin: ['http://localhost:8083', 'http://localhost:3000', 'http://localhost:5000', 'https://strandpro.web.app'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
});

// ── Cloud Function : Envoyer l'email OTP ──
exports.sendOtpEmail = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method === 'OPTIONS') {
      res.set('Access-Control-Allow-Origin', req.get('origin'));
      res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.set('Access-Control-Allow-Credentials', 'true');
      res.status(204).send();
      return;
    }

    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    const { email, code, username } = req.body;

    // Validation
    if (!email || !code || !username) {
      res.status(400).json({
        error: 'Missing required fields: email, code, username'
      });
      return;
    }

    try {
      // Envoyer l'email
      const gmailUser = functions.config().gmail?.user;
      await getTransporter().sendMail({
        from: `"StrandPro" <${gmailUser}>`,
        to: email,
        subject: '🔐 Your StrandPro Password Reset Code',
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; }
                .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
                h1 { color: #333; margin-bottom: 10px; }
                .subtitle { color: #666; font-size: 14px; margin-bottom: 30px; }
                .code-box { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 8px; text-align: center; margin: 30px 0; }
                .code { font-family: 'Monaco', 'Courier New', monospace; font-size: 32px; font-weight: bold; color: white; letter-spacing: 4px; margin: 0; }
                .code-label { color: rgba(255,255,255,0.8); font-size: 12px; text-transform: uppercase; margin-bottom: 10px; }
                .info { background: #f9f9f9; padding: 15px; border-radius: 6px; margin: 20px 0; font-size: 14px; color: #666; }
                .warning { color: #d9534f; font-weight: bold; }
                .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }
                a { color: #667eea; text-decoration: none; }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>🔐 Password Reset Request</h1>
                <p class="subtitle">Hi ${username || 'there'},</p>

                <p>We received a request to reset your StrandPro password. Use the code below to complete the process:</p>

                <div class="code-box">
                  <div class="code-label">Your verification code</div>
                  <div class="code">${code.replace(/(\d{3})(\d{3})/, '$1 $2')}</div>
                </div>

                <div class="info">
                  <strong>⏱️ This code expires in 10 minutes</strong><br>
                  Do not share this code with anyone.
                </div>

                <p>Enter this code on the password reset page to continue.</p>

                <div class="info">
                  <strong>🔒 Didn't request this?</strong><br>
                  If you didn't request a password reset, you can safely ignore this email. Your password won't change unless you enter the code above.
                </div>

                <div class="footer">
                  <p>© StrandPro • Professional Salon Management</p>
                  <p>This is an automated message, please do not reply to this email.</p>
                </div>
              </div>
            </body>
          </html>
        `,
        text: `Your StrandPro password reset code is: ${code}\n\nThis code expires in 10 minutes.\n\nDo not share this code with anyone.`
      });

      // ✅ Email envoyé avec succès
      res.status(200).json({ success: true, message: 'Email sent successfully' });

    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({
        error: 'Failed to send email',
        message: error.message
      });
    }
  });
});

// ── Health check ──
exports.hello = functions.https.onRequest((req, res) => {
  res.send('StrandPro Cloud Functions are running!');
});
