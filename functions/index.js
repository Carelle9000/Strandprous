const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { Resend } = require('resend');

// Initialiser Firebase Admin SDK
admin.initializeApp();
const db = admin.firestore();

// Initialiser Resend avec la clé API depuis les config
const resendApiKey = process.env.RESEND_API_KEY || '';
const resend = resendApiKey ? new Resend(resendApiKey) : null;

/**
 * Cloud Function: Envoyer code OTP pour réinitialisation de mot de passe
 *
 * Flux:
 * 1. Génère un code OTP à 6 chiffres aléatoires
 * 2. Stocke le code dans Firestore avec expiration 5 minutes
 * 3. Envoie l'email avec le code via Resend
 * 4. Retourne succès ou erreur
 *
 * Sécurité:
 * - Rate limiting via Firestore (évite les spam)
 * - Code expire après 5 minutes
 * - Max 5 tentatives avant blocage
 */
exports.sendPasswordResetOtp = functions.https.onCall(async (data, context) => {
  const email = data.email?.toLowerCase().trim();

  // Validation basique
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Email invalide'
    );
  }

  if (!resend) {
    console.error('RESEND_API_KEY not configured');
    throw new functions.https.HttpsError(
      'internal',
      'Service email non configuré'
    );
  }

  try {
    // Vérifier s'il y a un OTP valide non expiré
    const existingOtp = await db.collection('otpResetCodes').doc(email).get();
    if (existingOtp.exists) {
      const data = existingOtp.data();
      // Si le code n'a pas expiré, on le remet à zéro et on en génère un nouveau
      if (data.expiresAt > Date.now()) {
        // Wait 30 secondes avant de permettre une nouvelle demande
        if (data.lastRequestedAt && Date.now() - data.lastRequestedAt < 30000) {
          throw new functions.https.HttpsError(
            'resource-exhausted',
            'Veuillez attendre 30 secondes avant de demander un nouveau code'
          );
        }
      }
    }

    // Générer un code OTP à 6 chiffres
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    // Sauvegarder le code dans Firestore
    await db.collection('otpResetCodes').doc(email).set({
      code,
      expiresAt,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastRequestedAt: Date.now(),
      attempts: 0,
      verified: false
    });

    // Envoyer l'email via Resend
    const emailResponse = await resend.emails.send({
      from: 'noreply@strandpro.com', // Remplacez par votre domaine Resend
      to: email,
      subject: 'StrandPro - Code de réinitialisation de mot de passe',
      html: generateOtpEmailHtml(code)
    });

    if (emailResponse.error) {
      console.error('Resend error:', emailResponse.error);
      // Supprimer le code OTP si l'email n'a pas pu être envoyé
      await db.collection('otpResetCodes').doc(email).delete();
      throw new functions.https.HttpsError(
        'internal',
        'Erreur lors de l\'envoi de l\'email'
      );
    }

    // Succès
    return {
      success: true,
      message: `Code envoyé à ${email}`,
      expiresIn: '5 minutes'
    };

  } catch (error) {
    console.error('sendPasswordResetOtp error:', error);

    // Si c'est déjà une HttpsError, la relancer
    if (error.code && error.code.startsWith('functions/')) {
      throw error;
    }

    throw new functions.https.HttpsError(
      'internal',
      'Erreur serveur: ' + error.message
    );
  }
});

/**
 * Génère le HTML de l'email OTP
 */
function generateOtpEmailHtml(code) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
          .container { max-width: 500px; margin: 0 auto; background: white; border-radius: 12px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
          .header { text-align: center; margin-bottom: 30px; }
          .title { font-size: 24px; font-weight: 600; color: #1a1a1a; margin: 0 0 8px 0; }
          .subtitle { font-size: 14px; color: #666; margin: 0; }
          .code-section { text-align: center; margin: 30px 0; }
          .code-label { font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
          .code { font-size: 32px; font-weight: 700; color: #c9922a; letter-spacing: 8px; font-family: 'Courier New', monospace; margin: 0; font-kerning: none; }
          .expiry { text-align: center; font-size: 12px; color: #999; margin-top: 20px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 12px 16px; margin: 20px 0; font-size: 13px; color: #856404; }
          .footer { text-align: center; font-size: 12px; color: #999; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="title">🔐 Réinitialisation du mot de passe</h1>
            <p class="subtitle">Utilisez le code ci-dessous</p>
          </div>

          <div class="code-section">
            <p class="code-label">Votre code OTP</p>
            <p class="code">${code}</p>
          </div>

          <div class="expiry">
            ⏱️ Ce code expire dans <strong>5 minutes</strong>
          </div>

          <div class="warning">
            <strong>⚠️ Sécurité:</strong> Ne partagez jamais ce code. StrandPro ne vous demandera jamais ce code par message.
          </div>

          <p style="font-size: 13px; color: #666; margin: 20px 0;">
            Si vous n'avez pas demandé cette réinitialisation, ignorez simplement cet email. Votre compte est sécurisé.
          </p>

          <div class="footer">
            <p>© StrandPro 2024 — Tous droits réservés</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Test endpoint pour vérifier que les Cloud Functions fonctionnent
 */
exports.hello = functions.https.onRequest((req, res) => {
  res.send('StrandPro Cloud Functions are running!');
});
