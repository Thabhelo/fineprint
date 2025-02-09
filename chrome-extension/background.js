chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'OPEN_POPUP') {
    chrome.action.openPopup();
  }
});

// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('FinePrint extension installed');
});