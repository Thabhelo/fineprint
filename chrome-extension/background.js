// Constants
const CONTENT_SCRIPT_PATH = 'content.js';
const POPUP_PATH = 'popup.html';

/**
 * Handles all incoming messages from content scripts and popup
 * @param {Object} request - The message request object
 * @param {Object} sender - Information about the sender of the message
 * @param {Function} sendResponse - Callback to send a response
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'OPEN_POPUP':
      openPopup();
      break;
    // Add more cases as needed
  }
});

/**
 * Opens the extension popup in a new tab
 */
function openPopup() {
  chrome.tabs.create({ 
    url: chrome.runtime.getURL(POPUP_PATH),
    active: true
  });
}

/**
 * Injects the content script into the active tab
 * @param {chrome.tabs.Tab} tab - The tab to inject the script into
 */
async function injectContentScript(tab) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: [CONTENT_SCRIPT_PATH]
    });
  } catch (error) {
    console.error('Failed to inject content script:', error);
  }
}

// Extension installation handler
chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === 'install') {
    console.log('FinePrint extension installed successfully');
    // Add any installation-specific logic here
  }
});

// Extension icon click handler
chrome.action.onClicked.addListener((tab) => {
  // Only inject if we're on a permitted page
  if (tab.url.startsWith('http')) {
    injectContentScript(tab);
  }
});