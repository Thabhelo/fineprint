// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'ANALYZE_PAGE') {
    const text = extractContractText();
    sendResponse({ text });
  }
});

// Inject floating action button
const fab = document.createElement('div');
fab.innerHTML = `
  <div id="fineprint-fab" style="
    position: fixed;
    bottom: 24px;
    right: 24px;
    width: 56px;
    height: 56px;
    border-radius: 28px;
    background: #4f46e5;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    transition: transform 0.2s ease;
  ">
    <svg viewBox="0 0 24 24" width="24" height="24" stroke="white" stroke-width="2" fill="none">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  </div>
`;

document.body.appendChild(fab);

fab.addEventListener('mouseover', () => {
  fab.style.transform = 'scale(1.1)';
});

fab.addEventListener('mouseout', () => {
  fab.style.transform = 'scale(1)';
});

fab.addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'OPEN_POPUP' });
});