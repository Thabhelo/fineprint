// Updated styling constants
const STYLES = {
  fab: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    background: '#4f46e5',
    color: 'white',
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    zIndex: '9999',
  },
  closeIcon: {
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: '0',
    transition: 'opacity 0.3s ease',
    background: '#ef4444',
    borderRadius: '50%',
    transform: 'scale(0.9)',
  }
};

const SHIELD_ICON = `
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
`;

const CLOSE_ICON = `
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none">
    <path d="M18 6L6 18"></path>
    <path d="M6 6l12 12"></path>
  </svg>
`;

class FinePrintFAB {
  constructor() {
    this.fab = null;
    this.isCloseMode = false;
    this.init();
  }

  init() {
    this.createFAB();
    this.attachEventListeners();
    this.injectIntoPage();
  }

  createFAB() {
    this.fab = document.createElement('div');
    this.fab.id = 'fineprint-fab';
    Object.assign(this.fab.style, STYLES.fab);
    
    // Create inner container for icons
    const iconContainer = document.createElement('div');
    iconContainer.className = 'icon-container';
    iconContainer.style.position = 'relative';
    iconContainer.style.width = '24px';
    iconContainer.style.height = '24px';
    
    // Add shield icon
    const shieldDiv = document.createElement('div');
    shieldDiv.className = 'shield-icon';
    shieldDiv.innerHTML = SHIELD_ICON;
    shieldDiv.style.transition = 'opacity 0.3s ease';
    
    // Add close icon
    const closeDiv = document.createElement('div');
    closeDiv.className = 'close-icon';
    closeDiv.innerHTML = CLOSE_ICON;
    Object.assign(closeDiv.style, STYLES.closeIcon);
    
    iconContainer.appendChild(shieldDiv);
    iconContainer.appendChild(closeDiv);
    this.fab.appendChild(iconContainer);
  }

  attachEventListeners() {
    let longPressTimer;
    let isLongPress = false;

    this.fab.addEventListener('mousedown', () => {
      longPressTimer = setTimeout(() => {
        isLongPress = true;
        this.toggleCloseMode();
      }, 500);
    });

    this.fab.addEventListener('mouseup', () => {
      clearTimeout(longPressTimer);
      if (!isLongPress) {
        if (this.isCloseMode) {
          this.remove();
        } else {
          chrome.runtime.sendMessage({ action: 'OPEN_POPUP' });
        }
      }
      isLongPress = false;
    });

    this.fab.addEventListener('mouseleave', () => {
      clearTimeout(longPressTimer);
    });

    // Hover effects
    this.fab.addEventListener('mouseover', () => {
      if (!this.isCloseMode) {
        this.fab.style.transform = 'scale(1.1)';
      }
    });

    this.fab.addEventListener('mouseout', () => {
      if (!this.isCloseMode) {
        this.fab.style.transform = 'scale(1)';
      }
    });
  }

  toggleCloseMode() {
    this.isCloseMode = !this.isCloseMode;
    const shieldIcon = this.fab.querySelector('.shield-icon');
    const closeIcon = this.fab.querySelector('.close-icon');
    
    if (this.isCloseMode) {
      shieldIcon.style.opacity = '0';
      closeIcon.style.opacity = '1';
      this.fab.style.transform = 'scale(0.9)';
      this.fab.style.background = '#ef4444';
    } else {
      shieldIcon.style.opacity = '1';
      closeIcon.style.opacity = '0';
      this.fab.style.transform = 'scale(1)';
      this.fab.style.background = '#4f46e5';
    }
  }

  injectIntoPage() {
    document.body.appendChild(this.fab);
  }

  remove() {
    this.fab.style.transform = 'scale(0)';
    this.fab.style.opacity = '0';
    setTimeout(() => {
      this.fab.remove();
    }, 300);
  }
}

// Initialize the FAB when the content script loads
const finePrintFAB = new FinePrintFAB();

// Prevent any CSS reset from affecting our elements
document.addEventListener('DOMContentLoaded', () => {
  const elements = document.querySelectorAll('#fineprint-fab, #fineprint-fab *');
  elements.forEach(el => {
    el.style.cssText = el.style.cssText;
  });
});