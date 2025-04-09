// Wait for libraries to load
function waitForLibraries() {
  return new Promise((resolve) => {
    const checkLibraries = () => {
      // Check if all required libraries are loaded
      if (window.React && window.ReactDOM && window.styled && window.ReactIs) {
        resolve();
      } else {
        setTimeout(checkLibraries, 100);
      }
    };
    checkLibraries();
  });
}

// Create styled components
function createStyledComponents() {
  const styled = window.styled;

  const FABContainer = styled.div`
    position: fixed;
    right: 20px;
    bottom: 20px;
    z-index: 9999;
    transform: translateX(${props => props.isVisible ? '0' : '120%'});
    transition: transform 0.3s ease-in-out;
  `;

  const FABButton = styled.button`
    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
    color: white;
    border: none;
    border-radius: 50%;
    width: 60px;
    height: 60px;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease-in-out;
    position: relative;
    overflow: hidden;

    &:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
    }

    &:active {
      transform: scale(0.95);
    }
  `;

  const FABContent = styled.div`
    position: absolute;
    right: 70px;
    top: 50%;
    transform: translateY(-50%);
    background: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    gap: 12px;
    white-space: nowrap;
    opacity: ${props => props.isVisible ? 1 : 0};
    transition: opacity 0.2s ease-in-out;
  `;

  const FABText = styled.span`
    color: #1f2937;
    font-size: 14px;
    font-weight: 500;
  `;

  const FABIcon = styled.div`
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
  `;

  return { FABContainer, FABButton, FABContent, FABText, FABIcon };
}

// Create the FloatingActionButton component
function createFloatingActionButton(styledComponents) {
  const { FABContainer, FABButton, FABContent, FABText, FABIcon } = styledComponents;
  const { useState, useEffect } = window.React;

  return function FloatingActionButton({ onAnalyze }) {
    const [isVisible, setIsVisible] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
      const isRelevantPage = () => {
        const url = window.location.href.toLowerCase();
        const path = window.location.pathname.toLowerCase();
        const title = document.title.toLowerCase();
        
        const legalPatterns = [
          'terms', 'privacy', 'agreement', 'contract', 'policy',
          'legal', 'conditions', 'tos', 'eula', 'license'
        ];

        return legalPatterns.some(pattern => 
          url.includes(pattern) || 
          path.includes(pattern) ||
          title.includes(pattern)
        );
      };

      if (isRelevantPage()) {
        const timer = setTimeout(() => setIsVisible(true), 1000);
        return () => clearTimeout(timer);
      }
    }, []);

    return window.React.createElement(FABContainer, { isVisible },
      window.React.createElement(FABButton, {
        onClick: onAnalyze,
        onMouseEnter: () => setIsHovered(true),
        onMouseLeave: () => setIsHovered(false)
      },
        window.React.createElement(FABIcon, null,
          window.React.createElement('svg', {
            width: 24,
            height: 24,
            viewBox: "0 0 24 24",
            fill: "none",
            xmlns: "http://www.w3.org/2000/svg",
            stroke: "currentColor",
            strokeWidth: 2
          },
            window.React.createElement('path', {
              d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
            })
          )
        )
      ),
      window.React.createElement(FABContent, { isVisible: isHovered },
        window.React.createElement(FABText, null, "Analyze this contract with Fineprint")
      )
    );
  };
}

// Function to analyze the current page
async function analyzePage() {
  try {
    console.log('Starting page analysis');
    const text = extractContractText();
    
    if (!text || text.trim().length < 10) {
      console.error('Extracted text is too short or empty');
      alert('Could not find enough text to analyze on this page.');
      return;
    }
    
    console.log(`Extracted ${text.length} characters of text`);
    
    // Show a loading indicator
    const loadingIndicator = document.createElement('div');
    loadingIndicator.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(255, 255, 255, 0.9);
      border-radius: 8px;
      padding: 12px 20px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      z-index: 99999;
      font-family: system-ui, -apple-system, sans-serif;
      display: flex;
      align-items: center;
      gap: 12px;
    `;
    loadingIndicator.innerHTML = `
      <div style="width: 20px; height: 20px; border: 2px solid #4f46e5; border-radius: 50%; border-top-color: transparent; animation: fineprint-spin 1s linear infinite;"></div>
      <span>Analyzing contract...</span>
    `;
    document.body.appendChild(loadingIndicator);
    
    // Add animation keyframes
    const animationStyle = document.createElement('style');
    animationStyle.textContent = `
      @keyframes fineprint-spin {
        to { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(animationStyle);
    
    try {
      console.log('Sending request to API...');
      const response = await fetch('http://127.0.0.1:8000/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
        mode: 'cors',
        credentials: 'omit'
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
      }

      const analysis = await response.json();
      console.log('Analysis received:', analysis);
      
      // Remove loading indicator
      document.body.removeChild(loadingIndicator);
      
      // Show analysis results
      showAnalysisResults(analysis);
    } catch (error) {
      console.error('Error calling API:', error);
      
      // Remove loading indicator
      document.body.removeChild(loadingIndicator);
      
      // Show error message
      const errorMessage = document.createElement('div');
      errorMessage.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        border-radius: 8px;
        padding: 16px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        z-index: 99999;
        font-family: system-ui, -apple-system, sans-serif;
        max-width: 300px;
      `;
      errorMessage.innerHTML = `
        <h3 style="margin: 0 0 8px 0; color: #ef4444;">Analysis Failed</h3>
        <p style="margin: 0 0 12px 0;">Could not connect to the Fineprint API. Try again or check your connection.</p>
        <button style="background: #4f46e5; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer;">Dismiss</button>
      `;
      document.body.appendChild(errorMessage);
      
      // Close error message when button is clicked
      errorMessage.querySelector('button').addEventListener('click', () => {
        document.body.removeChild(errorMessage);
      });
      
      // Auto-dismiss after 10 seconds
      setTimeout(() => {
        if (document.body.contains(errorMessage)) {
          document.body.removeChild(errorMessage);
        }
      }, 10000);
    }
  } catch (error) {
    console.error('Error analyzing page:', error);
  }
}

// Function to extract contract text
function extractContractText() {
  // Priority selectors for common content areas
  const selectors = [
    'main', 'article', '.content', '#content', '.main-content', '#main-content',
    '.terms', '#terms', '.agreement', '#agreement', '.contract', '#contract',
    '.privacy-policy', '#privacy-policy', '.legal', '#legal'
  ];
  
  // Try each selector in order until we find content
  let mainContent = null;
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element && element.innerText.trim().length > 200) {
      console.log(`Found content with selector: ${selector}`);
      mainContent = element;
      break;
    }
  }
  
  // If no specific content area found, use body
  if (!mainContent) {
    console.log('No specific content area found, using body');
    mainContent = document.body;
  }
  
  const textNodes = [];
  
  // Function to recursively get text from elements, filtering out irrelevant elements
  function getTextFromElement(element) {
    // Skip hidden elements, navigation, footer, etc.
    if (!element || !element.tagName) return;
    
    const tag = element.tagName.toLowerCase();
    const className = (element.className || '').toLowerCase();
    const id = (element.id || '').toLowerCase();
    
    // Skip irrelevant elements
    if (
      tag === 'script' || tag === 'style' || tag === 'noscript' || 
      tag === 'nav' || tag === 'footer' || tag === 'header' ||
      className.includes('nav') || className.includes('menu') || 
      className.includes('footer') || className.includes('header') ||
      id.includes('nav') || id.includes('menu') || 
      id.includes('footer') || id.includes('header')
    ) {
      return;
    }
    
    // If it's a text node with content, add it
    if (element.nodeType === Node.TEXT_NODE) {
      const text = element.textContent.trim();
      if (text) {
        textNodes.push(text);
      }
      return;
    }
    
    // Process child nodes
    for (const child of element.childNodes) {
      getTextFromElement(child);
    }
  }
  
  getTextFromElement(mainContent);
  
  // Join the text nodes, maintaining paragraph structure
  return textNodes.join('\n');
}

// Function to generate PDF report
function generateReport(analysis) {
  const doc = document.createElement('div');
  doc.innerHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, sans-serif;
          line-height: 1.5;
          max-width: 800px;
          margin: 40px auto;
          padding: 20px;
          color: #1f2937;
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
        }
        .risk-level {
          display: inline-block;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: 500;
          margin: 20px 0;
        }
        .high { background: #fee2e2; color: #dc2626; }
        .medium { background: #fef3c7; color: #f59e0b; }
        .low { background: #f3f4f6; color: #6b7280; }
        .flag {
          margin: 24px 0;
          padding: 20px;
          border-radius: 12px;
          border: 1px solid #e5e7eb;
        }
        .flag-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }
        .severity {
          padding: 4px 12px;
          border-radius: 16px;
          font-size: 14px;
          font-weight: 500;
          color: white;
        }
        .text-block {
          background: #f9fafb;
          padding: 16px;
          border-radius: 8px;
          font-family: monospace;
          margin: 16px 0;
          white-space: pre-wrap;
        }
        .recommendation {
          color: #2563eb;
          font-weight: 500;
          margin-top: 16px;
        }
        .summary {
          margin: 32px 0;
          padding: 24px;
          background: #f9fafb;
          border-radius: 12px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>FinePrint Analysis Report</h1>
        <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
      </div>

      <div class="summary">
        <h2>Summary</h2>
        <p><strong>URL:</strong> ${window.location.href}</p>
        <p><strong>Document Title:</strong> ${document.title}</p>
        <p><strong>Analysis Date:</strong> ${new Date().toLocaleString()}</p>
        <div class="risk-level ${analysis.risk_level}">
          Overall Risk Level: ${analysis.risk_level.toUpperCase()}
        </div>
        <p><strong>Total Red Flags:</strong> ${analysis.red_flags.length}</p>
      </div>

      <h2>Detailed Analysis</h2>
      ${analysis.red_flags.map(flag => `
        <div class="flag">
          <div class="flag-header">
            <h3>${flag.category}</h3>
            <span class="severity" style="background: ${
              flag.severity === 'high' ? '#dc2626' :
              flag.severity === 'medium' ? '#f59e0b' : '#6b7280'
            }">
              ${flag.severity.toUpperCase()}
            </span>
          </div>
          <p>${flag.description}</p>
          <div class="text-block">${flag.text}</div>
          <p class="recommendation">💡 ${flag.recommendation}</p>
        </div>
      `).join('')}
    </body>
    </html>
  `;

  // Convert to Blob
  const blob = new Blob([doc.innerHTML], { type: 'text/html' });
  return URL.createObjectURL(blob);
}

// Function to show analysis results
function showAnalysisResults(analysis) {
  // Create a modal to show results
  const modal = document.createElement('div');
  modal.className = 'fineprint-modal';
  
  // Add modal content
  modal.innerHTML = `
    <div class="fineprint-modal-header">
      <div>
        <h2 class="fineprint-modal-title">Contract Analysis Results</h2>
        <div class="fineprint-modal-subtitle">
          <span class="fineprint-risk-level ${analysis.risk_level}">
            Risk Level: ${analysis.risk_level.charAt(0).toUpperCase() + analysis.risk_level.slice(1)}
          </span>
        </div>
      </div>
      <div class="fineprint-modal-actions">
        <button class="fineprint-button" onclick="window.open('${generateReport(analysis)}', '_blank')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
          Download Report
        </button>
        <button class="fineprint-modal-close" onclick="this.closest('.fineprint-modal').remove()">×</button>
      </div>
    </div>
    
    <div class="fineprint-modal-content">
      ${analysis.red_flags.map(flag => `
        <div class="fineprint-red-flag ${flag.severity}">
          <div class="fineprint-red-flag-header">
            <h4 class="fineprint-red-flag-title">${flag.category}</h4>
            <span class="fineprint-red-flag-severity ${flag.severity}">
              ${flag.severity.charAt(0).toUpperCase() + flag.severity.slice(1)}
            </span>
          </div>
          <p class="fineprint-red-flag-description">${flag.description}</p>
          <div class="fineprint-red-flag-text">${flag.text}</div>
          <p class="fineprint-red-flag-recommendation">${flag.recommendation}</p>
        </div>
      `).join('')}
  </div>
`;

  shadowRoot.appendChild(modal);
}

function createFallbackStyleElements() {
  console.log("Using fallback styling mechanism");
  
  // Add fallback styles
  const style = document.createElement('style');
  style.textContent = `
    #fineprint-fab {
      position: fixed;
      right: 20px;
      bottom: 20px;
      z-index: 9999;
    }
    
    #fineprint-button {
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
      color: white;
      border: none;
      border-radius: 50%;
      width: 60px;
      height: 60px;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease-in-out;
    }
    
    #fineprint-button:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
    }
    
    #fineprint-tooltip {
      position: absolute;
      right: 70px;
      top: 50%;
      transform: translateY(-50%);
      background: white;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      display: none;
      align-items: center;
      gap: 12px;
      white-space: nowrap;
    }
    
    #fineprint-button:hover + #fineprint-tooltip {
      display: flex;
    }
  `;
  document.head.appendChild(style);
  
  return true;
}

async function initializeApp() {
  try {
    // Try to initialize with styled-components
    try {
      await waitForLibraries();
      console.log("Libraries loaded, initializing app...");
      
      // Make sure styled is properly initialized
      if (!window.styled) {
        throw new Error("styled-components not properly loaded");
      }
      
      addHighlightStyles();
      
      const appContainer = document.createElement('div');
      appContainer.id = 'fineprint-extension-container';
      document.body.appendChild(appContainer);
      
      const styledComponents = createStyledComponents();
      const FloatingActionButton = createFloatingActionButton(styledComponents);
      
      const App = () => {
        return window.React.createElement(FloatingActionButton, {
          onAnalyze: analyzePage
        });
      };
      
      window.ReactDOM.render(
        window.React.createElement(App),
        document.getElementById('fineprint-extension-container')
      );
    } catch (styledError) {
      // Fallback to basic HTML/CSS if styled-components fails
      console.error("Error initializing with styled-components:", styledError);
      console.log("Attempting fallback initialization...");
      
      createFallbackStyleElements();
      addHighlightStyles();
      
      // Create basic elements
      const fabContainer = document.createElement('div');
      fabContainer.id = 'fineprint-fab';
      document.body.appendChild(fabContainer);
      
      const fabButton = document.createElement('button');
      fabButton.id = 'fineprint-button';
      fabButton.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        </svg>
      `;
      fabButton.addEventListener('click', analyzePage);
      fabContainer.appendChild(fabButton);
      
      const fabTooltip = document.createElement('div');
      fabTooltip.id = 'fineprint-tooltip';
      fabTooltip.textContent = 'Analyze this contract with Fineprint';
      fabContainer.appendChild(fabTooltip);
    }
  } catch (error) {
    console.error("Error initializing Fineprint extension:", error);
  }
}

// Initialize the app
initializeApp();

// Add CSS for highlights
function addHighlightStyles() {
  if (!document.querySelector('#fineprint-highlight-styles')) {
    const style = document.createElement('style');
    style.id = 'fineprint-highlight-styles';
    style.textContent = `
      .fineprint-highlight {
        cursor: pointer;
        transition: background-color 0.3s;
        padding: 2px 0;
        border-radius: 2px;
      }
      .fineprint-high {
        background-color: rgba(239, 68, 68, 0.2) !important;
        box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.2);
      }
      .fineprint-medium {
        background-color: rgba(245, 158, 11, 0.2) !important;
        box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.2);
      }
      .fineprint-low {
        background-color: rgba(34, 197, 94, 0.2) !important;
        box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.2);
      }
    `;
    document.head.appendChild(style);
  }
}

function highlightRedFlags(redFlags) {
  console.log('Highlighting red flags:', redFlags);
  
  // Add highlight styles
  addHighlightStyles();
  
  // Remove existing highlights
  const existingHighlights = document.querySelectorAll('.fineprint-highlight');
  existingHighlights.forEach(el => {
    const parent = el.parentNode;
    parent.replaceChild(document.createTextNode(el.textContent), el);
  });
  
  // No flags to highlight
  if (!redFlags || redFlags.length === 0) {
    console.log('No red flags to highlight');
    return;
  }

  // Create shadow root for tooltip if it doesn't exist
  if (!document.getElementById('fineprint-tooltip-container')) {
    const tooltipContainer = document.createElement('div');
    tooltipContainer.id = 'fineprint-tooltip-container';
    document.body.appendChild(tooltipContainer);
    
    // Add tooltip styles
    const tooltipStyle = document.createElement('style');
    tooltipStyle.textContent = `
      .fineprint-tooltip {
        position: fixed;
        z-index: 999999;
        background: white;
        border-radius: 8px;
        padding: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        max-width: 300px;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 14px;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.2s;
      }
      .fineprint-tooltip.visible {
        opacity: 1;
      }
      .fineprint-tooltip-title {
        font-weight: 600;
        margin: 0 0 8px 0;
      }
      .fineprint-tooltip-description {
        margin: 0 0 8px 0;
        color: #555;
      }
      .fineprint-tooltip-severity {
        display: inline-block;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
      }
      .fineprint-tooltip-severity.high {
        background-color: rgba(239, 68, 68, 0.2);
        color: #b91c1c;
      }
      .fineprint-tooltip-severity.medium {
        background-color: rgba(245, 158, 11, 0.2);
        color: #b45309;
      }
      .fineprint-tooltip-severity.low {
        background-color: rgba(34, 197, 94, 0.2);
        color: #15803d;
      }
    `;
    document.head.appendChild(tooltipStyle);
    
    // Create tooltip element
    const tooltip = document.createElement('div');
    tooltip.className = 'fineprint-tooltip';
    tooltip.innerHTML = `
      <div class="fineprint-tooltip-title"></div>
      <div class="fineprint-tooltip-description"></div>
      <span class="fineprint-tooltip-severity"></span>
    `;
    tooltipContainer.appendChild(tooltip);
  }
  
  // Get tooltip elements
  const tooltip = document.querySelector('.fineprint-tooltip');
  const tooltipTitle = tooltip.querySelector('.fineprint-tooltip-title');
  const tooltipDescription = tooltip.querySelector('.fineprint-tooltip-description');
  const tooltipSeverity = tooltip.querySelector('.fineprint-tooltip-severity');

  // Process each flag
  redFlags.forEach(flag => {
    try {
      // Skip empty text
      if (!flag.text) return;
      
      // Clean up the text for matching
      let flagText = flag.text.replace(/^\.\.\./, '').replace(/\.\.\.$/, '').trim();
      
      // For short text snippets, we need to be careful with regex special characters
      flagText = flagText.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      
      // For very long text, use a more focused approach
      if (flagText.length > 100) {
        const words = flagText.split(/\s+/);
        if (words.length > 10) {
          // Use the middle portion of the text to avoid issues with ellipses
          flagText = words.slice(5, 15).join(' ');
          flagText = flagText.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        }
      }
      
      // Skip if no usable text
      if (flagText.length < 5) {
        console.log('Flag text too short to highlight:', flag.text);
        return;
      }
      
      console.log('Looking for text to highlight:', flagText);
      
      // Use XPath to find text nodes containing the flag text
      const xpathResult = document.evaluate(
        `//*[contains(text(), '${flagText}')]`,
        document.body,
        null,
        XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
        null
      );
      
      // Track if highlight was applied
      let highlightApplied = false;
      
      // Process found nodes
      for (let i = 0; i < xpathResult.snapshotLength; i++) {
        const element = xpathResult.snapshotItem(i);
        
        // Skip already highlighted elements
        if (element.classList && element.classList.contains('fineprint-highlight')) {
          continue;
        }
        
        // Skip navigation, headers, etc.
        const tag = element.tagName?.toLowerCase();
        const className = (element.className || '').toLowerCase();
        if (
          tag === 'nav' || tag === 'header' || tag === 'footer' ||
          className.includes('nav') || className.includes('header') || className.includes('footer')
        ) {
          continue;
        }
        
        // Create a wrapper span for the highlight
        const highlightSpan = document.createElement('span');
        highlightSpan.className = `fineprint-highlight fineprint-${flag.severity}`;
        highlightSpan.dataset.category = flag.category;
        highlightSpan.dataset.severity = flag.severity;
        highlightSpan.dataset.description = flag.description;
        highlightSpan.innerHTML = element.innerHTML;
        
        // Replace the element with our highlight
        if (element.parentNode) {
          element.parentNode.replaceChild(highlightSpan, element);
          highlightApplied = true;
          
          // Add event listeners for tooltip
          highlightSpan.addEventListener('mouseenter', (e) => {
            tooltipTitle.textContent = flag.category;
            tooltipDescription.textContent = flag.description;
            tooltipSeverity.textContent = flag.severity.charAt(0).toUpperCase() + flag.severity.slice(1) + ' Risk';
            tooltipSeverity.className = `fineprint-tooltip-severity ${flag.severity}`;
            
            // Position the tooltip
            const rect = highlightSpan.getBoundingClientRect();
            tooltip.style.left = `${rect.left}px`;
            tooltip.style.top = `${rect.bottom + 10}px`;
            
            // Show the tooltip
            tooltip.classList.add('visible');
          });
          
          highlightSpan.addEventListener('mouseleave', () => {
            tooltip.classList.remove('visible');
          });
          
          // Only highlight one occurrence per flag
          break;
        }
      }
      
      if (!highlightApplied) {
        console.log('Could not find text to highlight for:', flag.category);
      }
    } catch (error) {
      console.error('Error highlighting flag:', error, flag);
    }
  });
  
  console.log('Highlighting complete');
}