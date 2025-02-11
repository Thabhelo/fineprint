// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'ANALYZE_PAGE') {
    const text = extractContractText();
    sendResponse({ text });
  }
});

// Ceate floating action button (FAB) container
const fabContainer = document.createElement('div');
fabContainer.id = 'fineprint-fab-container';
fabContainer.style.position = 'fixed';
fabContainer.style.bottom = '24px';
fabContainer.style.right = '24px';
fabContainer.style.zIndex = '9999';
fabContainer.style.display = 'flex';
fabContainer.style.alignItems = 'center';
fabContainer.style.justifyContent = 'center';
fabContainer.style.flexDirection = 'column';
fabContainer.style.gap = '5px'; // Space between FAB and text

// Create a close button (small X) in top-left corner of the FAB
const closeButton = document.createElement('div');
closeButton.innerHTML = '&times;';
closeButton.style.position = 'absolute';
closeButton.style.top = '-8px';
closeButton.style.left = '-8px';
closeButton.style.width = '20px';
closeButton.style.height = '20px';
closeButton.style.borderRadius = '50%';
closeButton.style.background = '#ff4d4d';
closeButton.style.color = 'white';
closeButton.style.display = 'flex';
closeButton.style.alignItems = 'center';
closeButton.style.justifyContent = 'center';
closeButton.style.cursor = 'pointer';
closeButton.style.fontSize = '14px';
closedButton.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
closedButton.style.zIndex = '10000'; // Ensure it's above the FAB

// Close FAB when the "X" is clicked
closeButton.addEventListener('click', () => {
  fabContainer.remove();
});

// Append the close button to the FAB container
fabContainer.appendChild(closeButton);
fabContainer.appendChild(fab);
document.body.appendChild(fabContainer);


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

// Prevent FAB from disappearing or resetting
fab.style.opacity = "1";
fab.style.transform = "scale(1)"; // Ensure FAB is at its original size
document.body.style.overflow = "auto"; // Ensure the page is scrollable


// When clicked, open the full popup
fab.onclick = function () {
  chrome.runtime.sendMessage({ action: "open_popup" });
};

// Add hover effects
fab.addEventListener('mouseover', () => {
  fab.style.transform = 'scale(1.1)';
});

fab.addEventListener('mouseout', () => {
  fab.style.transform = 'scale(1)';
});

// Add click effect: send a message to the background script to open the popup
fab.addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: 'OPEN_POPUP' });
});