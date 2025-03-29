// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'ANALYZE_CONTRACT') {
    analyzeContract(request.text)
      .then(sendResponse)
      .catch(error => {
        console.error('Error analyzing contract:', error);
        sendResponse({ error: error.message });
      });
    return true; // Keep the message channel open for async response
  }
});

// Function to analyze contract text
async function analyzeContract(text) {
  const response = await fetch('http://127.0.0.1:8000/api/analyze', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text })
  });

  if (!response.ok) {
    throw new Error(`Backend API response not OK: ${response.status}`);
  }

  return response.json();
}

// Listen for installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('FinePrint extension installed');
});