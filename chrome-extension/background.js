// Constants
const CONTENT_SCRIPT_PATH = 'content.js';
const POPUP_PATH = '../index.html';

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
      sendResponse({ status: 'Popup opened' });
      break;
      
    case 'INJECT_SCRIPT':
      if (sender.tab) {
        injectContentScript(sender.tab);
        sendResponse({ status: 'Script injected' });
      } else {
        sendResponse({ status: 'No tab context found' });
      }
      break;
      
    default:
      console.warn('Unhandled message action:', request.action);
      sendResponse({ status: 'Unknown action' });
  }
  return true; // Required for async sendResponse calls
});

/**
 * Opens the extension popup in a new tabb
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
    console.log('Content script injected successfully');
  } catch (error) {
    console.error('Failed to inject content script:', error);
  }
}

/**
 * Handles extension installation events
 */
chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === 'install') {
    console.log('FinePrint extension installed successfully');
    // Perform any first-time setup actions
  }
});

/**
 * Handles the extension icon click event
 */
chrome.action.onClicked.addListener(async (tab) => {
  if (tab.url.startsWith('http')) {
    await injectContentScript(tab);
  } else {
    console.warn('Cannot inject script into this page:', tab.url);
  }
});

/**
 * Automatically inject content script when a new tab is updated
 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.startsWith('http')) {
    injectContentScript(tab);
  }
});
