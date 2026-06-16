const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialiser Firebase Admin
admin.initializeApp();

// ── Health check ──
exports.hello = functions.https.onRequest((req, res) => {
  res.send('StrandPro Cloud Functions are running!');
});
