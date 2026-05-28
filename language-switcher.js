// Système de changement de langue pour index.html
// Lit les deux clés pour rester synchronisé avec strandpro.html
let currentLanguage = localStorage.getItem('selectedLanguage') || localStorage.getItem('sp_lang') || 'en';

// Fonction pour créer le sélecteur de langue
function createLanguageSwitcher() {
  const languageHTML = `
    <div id="language-switcher" style="position: fixed; top: 80px; right: 20px; z-index: 1000; background: var(--surface); border: 1px solid var(--border2); border-radius: 8px; padding: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
      <select id="language-select" onchange="changeLanguage(this.value)" style="background: var(--bg4); color: var(--text); border: 1px solid var(--border); border-radius: 6px; padding: 6px 12px; font-size: 0.85rem; cursor: pointer;">
        <option value="en" ${currentLanguage === 'en' ? 'selected' : ''}>🇺🇸 English</option>
        <option value="fr" ${currentLanguage === 'fr' ? 'selected' : ''}>🇫🇷 Français</option>
        <option value="es" ${currentLanguage === 'es' ? 'selected' : ''}>🇪🇸 Español</option>
      </select>
    </div>
  `;
  
  // Insérer le sélecteur après la navigation
  const nav = document.getElementById('mainNav');
  if (nav) {
    nav.insertAdjacentHTML('afterend', languageHTML);
  }
}

// Fonction pour changer de langue
function changeLanguage(lang) {
  currentLanguage = lang;
  // Écrire les deux clés pour rester synchronisé avec strandpro.html
  localStorage.setItem('selectedLanguage', lang);
  localStorage.setItem('sp_lang', lang);
  
  // Appliquer les traductions
  if (typeof applyTranslations === 'function') {
    applyTranslations(lang);
  } else {
    console.warn('applyTranslations function not found');
  }
  
  // Mettre à jour le sélecteur de langue
  updateLanguageSelector();
  
  // Sauvegarder la préférence
  document.documentElement.lang = lang;
  
  // Afficher un message de confirmation
  const langNames = {
    'en': 'English',
    'fr': 'Français',
    'es': 'Español'
  };
  
  // Créer un toast simple pour la confirmation
  const existingToast = document.getElementById('toast');
  if (existingToast) {
    existingToast.textContent = `Language changed to ${langNames[lang]}`;
    existingToast.style.display = 'block';
    setTimeout(() => {
      existingToast.style.display = 'none';
    }, 2000);
  }
}

// Fonction pour initialiser le sélecteur de langue
function updateLanguageSelector() {
  const selectElement = document.getElementById('language-select');
  if (selectElement) {
    selectElement.value = currentLanguage;
  }
}

// Initialiser au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
  createLanguageSwitcher();
  if (typeof applyTranslations === 'function') {
    applyTranslations(currentLanguage);
  }
  // Forcer l'application des traductions après un court délai
  setTimeout(() => {
    if (typeof applyTranslations === 'function') {
      applyTranslations(currentLanguage);
    }
  }, 100);
});

// Export pour utilisation dans d'autres fichiers
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    changeLanguage, 
    createLanguageSwitcher, 
    updateLanguageSelector,
    currentLanguage: () => currentLanguage 
  };
}
