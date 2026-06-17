const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialiser Firebase Admin SDK
admin.initializeApp();

/**
 * Test endpoint pour vérifier que les Cloud Functions fonctionnent
 */
exports.hello = functions.https.onRequest((req, res) => {
  res.send('StrandPro Cloud Functions are running!');
});
