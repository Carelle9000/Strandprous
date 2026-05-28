/**
 * StrandPro — Google Forms API
 * Déployez ce script comme Web App sur script.google.com :
 *   Déployer > Nouveau déploiement > Web app
 *   Exécuter en tant que : Moi
 *   Accès : Tout le monde (sans compte Google)
 * Copiez l'URL générée et collez-la dans le dashboard SuperAdmin > Tab "G. Forms".
 */

// ── POINT D'ENTRÉE ──────────────────────────────────────────────────────────

function doGet(e) {
  const p      = e.parameter || {};
  const action = p.action    || '';

  if (action === 'ping') {
    return htmlResp({ status: 'ok', ping: true, message: 'StrandPro Forms API v1 — OK' });
  }

  if (action === 'createForm') {
    return htmlResp(createAppointmentForm(p));
  }

  return HtmlService.createHtmlOutput(
    '<p style="font-family:sans-serif;padding:20px">StrandPro Forms API v1 — Aucune action spécifiée.</p>'
  );
}

// ── RÉPONSE HTML (postMessage vers parent + fermeture auto) ─────────────────

function htmlResp(data) {
  const json    = JSON.stringify(data);
  const emoji   = data.success === true  ? '✅' :
                  data.success === false ? '❌' : 'ℹ️';
  const message = data.success === true  ? 'Formulaire créé !' :
                  data.error             ? 'Erreur : ' + data.error :
                  data.message           || 'Réponse reçue.';

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>StrandPro API</title>
  <style>
    body { font-family: 'DM Sans', sans-serif; background: #0d0b09; color: #f0e8d8;
           display: flex; align-items: center; justify-content: center;
           height: 100vh; margin: 0; flex-direction: column; gap: 12px; }
    .icon { font-size: 3rem; }
    .msg  { font-size: 1rem; color: #b8a88a; text-align: center; padding: 0 20px; }
    .sub  { font-size: .78rem; color: #7a6e5e; }
  </style>
</head>
<body>
  <div class="icon">${emoji}</div>
  <div class="msg">${message}</div>
  <div class="sub">Fermeture automatique…</div>
  <script>
    (function () {
      var data = ${json};
      try {
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage(data, '*');
        }
      } catch (err) { console.error('postMessage error', err); }
      setTimeout(function () { window.close(); }, 1800);
    })();
  <\/script>
</body>
</html>`;

  return HtmlService.createHtmlOutput(html)
    .setTitle('StrandPro API')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ── CRÉATION DU FORMULAIRE ──────────────────────────────────────────────────

function createAppointmentForm(p) {
  try {
    var salonName  = (p.salonName  || 'Mon Salon').trim();
    var ownerEmail = (p.ownerEmail || '').trim();
    var servicesRaw = p.services ||
      'Tresses classiques,Box braids,Cornrows,Feed-in braids,Vanilles,Crochets,Nattes collées,Locks,Autre';
    var services   = servicesRaw.split(',').map(function(s){ return s.trim(); }).filter(Boolean);

    var slots = [
      '08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30',
      '12:00','12:30','13:00','13:30','14:00','14:30','15:00','15:30',
      '16:00','16:30','17:00','17:30','18:00'
    ];

    // ── Créer le formulaire ──
    var form = FormApp.create('📅 Réservation — ' + salonName);
    form.setDescription(
      'Réservez votre rendez-vous chez ' + salonName + '.\n' +
      'Nous vous confirmerons par téléphone ou WhatsApp dans les 24h.'
    );
    form.setConfirmationMessage(
      '✅ Merci ! Votre demande a bien été reçue. ' +
      salonName + ' vous contactera très bientôt pour confirmer.'
    );
    form.setCollectEmail(false);
    form.setShowLinkToRespondAgain(false);
    form.setProgressBar(false);

    // ── Champs ──
    form.addTextItem()
        .setTitle('Prénom et Nom')
        .setHelpText('Votre prénom suivi de votre nom de famille.')
        .setRequired(true);

    form.addTextItem()
        .setTitle('Numéro de téléphone / WhatsApp')
        .setHelpText('Nous vous contacterons sur ce numéro pour confirmer.')
        .setRequired(true);

    form.addListItem()
        .setTitle('Service souhaité')
        .setChoiceValues(services)
        .setRequired(true);

    form.addDateItem()
        .setTitle('Date souhaitée')
        .setRequired(true);

    form.addListItem()
        .setTitle('Heure souhaitée')
        .setChoiceValues(slots)
        .setRequired(true);

    form.addParagraphTextItem()
        .setTitle('Notes ou informations complémentaires')
        .setHelpText('Longueur des cheveux, style de référence, allergie, etc.')
        .setRequired(false);

    // ── Créer la feuille de réponses ──
    var ss = SpreadsheetApp.create('Réponses Réservations — ' + salonName);
    form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());

    // Rendre la sheet accessible en lecture publique (pour le sync CSV sans auth)
    DriveApp.getFileById(ss.getId()).setSharing(
      DriveApp.Access.ANYONE_WITH_LINK,
      DriveApp.Permission.VIEW
    );

    // Partager avec l'owner si email fourni
    if (ownerEmail.indexOf('@') > -1) {
      try {
        ss.addEditor(ownerEmail);
        DriveApp.getFileById(form.getId()).addEditor(ownerEmail);
      } catch (shareErr) {
        Logger.log('Partage impossible avec ' + ownerEmail + ' : ' + shareErr);
      }
    }

    // ── Construire les URLs ──
    var sheetId = ss.getId();
    var gid     = ss.getSheets()[0].getSheetId();
    var csvUrl  = 'https://docs.google.com/spreadsheets/d/' + sheetId +
                  '/export?format=csv&gid=' + gid;

    return {
      success:        true,
      formUrl:        form.getPublishedUrl(),
      formEditUrl:    form.getEditUrl(),
      spreadsheetUrl: ss.getUrl(),
      csvUrl:         csvUrl,
      formId:         form.getId(),
      sheetId:        sheetId,
      salonName:      salonName
    };

  } catch (err) {
    Logger.log('createAppointmentForm error: ' + err);
    return { success: false, error: err.toString() };
  }
}
