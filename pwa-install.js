// PWA Install Helper
class PWAInstall {
  constructor() {
    this.deferredPrompt = null;
    this.installPrompt = null;
    this.isInstalled = false;
    this.userDismissed = false;
    
    this.init();
  }

  init() {
    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('[PWA] Install prompt available');
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallBanner();
    });

    // Listen for appinstalled event
    window.addEventListener('appinstalled', () => {
      console.log('[PWA] App installed successfully');
      this.isInstalled = true;
      this.hideInstallBanner();
      this.showInstallSuccess();
    });

    // Check if app is already installed
    this.checkIfInstalled();
  }

  checkIfInstalled() {
    // Check if running in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      this.isInstalled = true;
      console.log('[PWA] App is running in standalone mode');
    }
    
    // Check iOS standalone mode
    if (window.navigator.standalone === true) {
      this.isInstalled = true;
      console.log('[PWA] App is running in iOS standalone mode');
    }
  }

  showInstallBanner() {
    if (this.userDismissed || this.isInstalled) return;
    
    const banner = document.getElementById('installBanner');
    if (banner) {
      banner.classList.add('show');
      console.log('[PWA] Install banner shown');
    }
  }

  hideInstallBanner() {
    const banner = document.getElementById('installBanner');
    if (banner) {
      banner.classList.remove('show');
    }
  }

  dismissInstallBanner() {
    this.userDismissed = true;
    this.hideInstallBanner();
    
    // Store dismissal in localStorage
    localStorage.setItem('pwa-install-dismissed', 'true');
    localStorage.setItem('pwa-install-dismissed-time', Date.now().toString());
  }

  async install() {
    if (!this.deferredPrompt) {
      console.log('[PWA] No install prompt available');
      return false;
    }

    try {
      // Show the install prompt
      this.deferredPrompt.prompt();
      
      // Wait for user response
      const { outcome } = await this.deferredPrompt.userChoice;
      
      console.log('[PWA] Install outcome:', outcome);
      
      if (outcome === 'accepted') {
        console.log('[PWA] User accepted install prompt');
        this.deferredPrompt = null;
        return true;
      } else {
        console.log('[PWA] User dismissed install prompt');
        this.dismissInstallBanner();
        return false;
      }
    } catch (error) {
      console.error('[PWA] Install error:', error);
      return false;
    }
  }

  showInstallSuccess() {
    // Show success message
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = 'StrandPro installed successfully!';
    toast.style.background = 'var(--success-dim)';
    toast.style.color = '#2ecc71';
    toast.style.border = '1px solid var(--success)';
    
    const container = document.getElementById('toastContainer');
    if (container) {
      container.appendChild(toast);
      
      setTimeout(() => {
        toast.remove();
      }, 3000);
    }
  }

  canInstall() {
    return !!this.deferredPrompt && !this.isInstalled && !this.userDismissed;
  }

  // iOS install instructions
  showiOSInstallInstructions() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome|CriOS/.test(navigator.userAgent);
    
    if (isIOS && isSafari && !this.isInstalled) {
      const instructions = document.createElement('div');
      instructions.innerHTML = `
        <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 20px;" onclick="this.remove()">
          <div style="background: var(--surface); border: 1px solid var(--border2); border-radius: 16px; padding: 32px 24px; max-width: 400px; text-align: center;">
            <h3 style="color: var(--gold-light); margin-bottom: 16px; font-family: 'Cormorant Garamond', serif;">Install StrandPro</h3>
            <p style="color: var(--text2); margin-bottom: 20px; line-height: 1.6;">
              To install StrandPro on your iOS device:<br><br>
              1. Tap the Share button <span style="font-size: 1.2rem;">⬆️</span><br>
              2. Scroll down and tap "Add to Home Screen"<br>
              3. Tap "Add" to install
            </p>
            <button onclick="this.closest('div').parentElement.remove()" style="background: var(--gold); color: var(--bg); border: none; padding: 10px 20px; border-radius: 6px; font-weight: 600; cursor: pointer;">
              Got it
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(instructions);
    }
  }
}

// Initialize PWA install helper
window.pwaInstall = new PWAInstall();

// Export for global access
if (typeof window !== 'undefined') {
  window.PWAInstall = PWAInstall;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PWAInstall;
}

console.log('[PWA] Install helper loaded');
