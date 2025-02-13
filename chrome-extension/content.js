// Constants for styling and configuration
const STYLES = {
  fab: {
    width: '56px',
    height: '56px',
    borderRadius: '28px',
    background: '#4f46e5',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    color: 'white',
    zIndex: '9999',
  },
  container: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    zIndex: '9999',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: '5px',
    transition: 'transform 0.3s ease-in-out',
  },
  closeButton: {
    position: 'absolute',
    top: '-8px',
    left: '-8px',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    background: '#ff4d4d',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '14px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    zIndex: '10000',
  }
};

// SVG icon for the FAB
const SHIELD_ICON = `
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="white" stroke-width="2" fill="none">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
`;

class FinePrintFAB {
  constructor() {
    this.container = null;
    this.fab = null;
    this.closeButton = null;
    this.isVisible = true;
    this.init();
  }

  init() {
    this.createContainer();
    this.createFAB();
    this.createCloseButton();
    this.attachEventListeners();
    this.injectIntoPage();
  }

  createContainer() {
    this.container = document.createElement('div');
    this.container.id = 'fineprint-fab-container';
    Object.assign(this.container.style, STYLES.container);
  }

  createFAB() {
    this.fab = document.createElement('div');
    this.fab.id = 'fineprint-fab';
    Object.assign(this.fab.style, STYLES.fab);
    this.fab.innerHTML = SHIELD_ICON;
  }

  createCloseButton() {
    this.closeButton = document.createElement('div');
    this.closeButton.innerHTML = '&times;';
    Object.assign(this.closeButton.style, STYLES.closeButton);
  }

  attachEventListeners() {
    // FAB click handler
    this.fab.addEventListener('click', () => {
      chrome.runtime.sendMessage({ action: 'OPEN_POPUP' });
    });

    // Hover effects
    this.fab.addEventListener('mouseover', () => {
      this.fab.style.transform = 'scale(1.1)';
      this.fab.style.filter = 'brightness(1.1)';
    });

    this.fab.addEventListener('mouseout', () => {
      this.fab.style.transform = 'scale(1)';
      this.fab.style.filter = 'brightness(1)';
    });

    // Close button handler
    this.closeButton.addEventListener('click', () => {
      this.hide();
    });
  }

  injectIntoPage() {
    this.container.appendChild(this.closeButton);
    this.container.appendChild(this.fab);
    document.body.appendChild(this.container);
  }

  hide() {
    this.container.style.transform = 'translateX(calc(100% + 24px))';
    this.isVisible = false;
    
    // Create show button after hiding
    setTimeout(() => this.createShowButton(), 300);
  }

  show() {
    this.container.style.transform = 'translateX(0)';
    this.isVisible = true;
  }

  createShowButton() {
    const showButton = document.createElement('div');
    Object.assign(showButton.style, {
      ...STYLES.fab,
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      transform: 'scale(0.7)',
      opacity: '0.7',
      cursor: 'pointer'
    });
    
    showButton.innerHTML = SHIELD_ICON;
    document.body.appendChild(showButton);

    showButton.addEventListener('click', () => {
      this.show();
      showButton.remove();
    });

    showButton.addEventListener('mouseover', () => {
      showButton.style.transform = 'scale(0.8)';
      showButton.style.opacity = '1';
    });

    showButton.addEventListener('mouseout', () => {
      showButton.style.transform = 'scale(0.7)';
      showButton.style.opacity = '0.7';
    });
  }
}

// Message listener for page analysis
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'ANALYZE_PAGE') {
    const text = extractContractText();
    sendResponse({ text });
  }
});

// Initialize the FAB when the content script loads
const finePrintFAB = new FinePrintFAB();

// Prevent any CSS reset from affecting our elements
document.addEventListener('DOMContentLoaded', () => {
  const elements = document.querySelectorAll('#fineprint-fab-container, #fineprint-fab, #fineprint-fab *');
  elements.forEach(el => {
    el.style.cssText = el.style.cssText;
  });
});