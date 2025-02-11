chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'OPEN_POPUP') {
    chrome.tabs.create({ url: chrome.runtime.getURL('popup.html') });
  }
});

// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('FinePrint extension installed');
});


// When the extension icon is clicked, execute the content script 
chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"]
  });
});

// Function to inject the content script dynamically
function injectContentScript() {
  if (!document.getElementById("fineprint-fab")) {
    let script = document.createElement("script");
    script.src = chrome.runtime.getURL("content.js");
    document.body.appendChild(script);
  }
}