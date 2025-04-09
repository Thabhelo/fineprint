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

// Function to get summary from Groq API
async function generateGroqSummary(text) {
  const GROQ_API_KEY = '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';
  const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
  
  try {
    console.log('Generating summary using Groq API');
    
    // Limit text length to avoid token limits
    const trimmedText = text.substring(0, 12000);
    
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          {
            role: 'system',
            content: 'You are a contract analysis assistant. Your task is to summarize the key points of the provided text clearly and concisely.'
          },
          {
            role: 'user',
            content: `Please summarize the following contract or legal text in 3-5 bullet points, highlighting the most important terms, obligations, and potential concerns: \n\n${trimmedText}`
          }
        ],
        temperature: 0.3,
        max_tokens: 800
      })
    });
    
    if (!response.ok) {
      throw new Error(`Groq API request failed: ${response.status}`);
    }
    
    const result = await response.json();
    return result.choices[0].message.content;
  } catch (error) {
    console.error('Error generating summary:', error);
    return 'Unable to generate summary. Please try again later.';
  }
}

// Function to show analysis results
function showAnalysisResults(analysis, showSummaryTab = false) {
  // Create a modal to show results
  const modal = document.createElement('div');
  modal.className = 'fineprint-modal';
  
  // Create a shadow DOM to avoid style conflicts
  const shadowHost = document.createElement('div');
  shadowHost.id = 'fineprint-shadow-host';
  document.body.appendChild(shadowHost);
  
  // Create shadow root
  const shadowRoot = shadowHost.attachShadow({ mode: 'open' });
  
  // Add styles to shadow DOM
  const style = document.createElement('style');
  style.textContent = `
    .fineprint-modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 999999;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
    }
    
    .fineprint-modal-content {
      background: white;
      border-radius: 12px;
      max-width: 800px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    }
    
    .fineprint-modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .fineprint-modal-title {
      font-size: 24px;
      font-weight: 600;
      color: #111827;
      margin: 0;
    }
    
    .fineprint-modal-subtitle {
      margin-top: 4px;
    }
    
    .fineprint-risk-level {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 500;
    }
    
    .fineprint-risk-level.high {
      background-color: #fee2e2;
      color: #dc2626;
    }
    
    .fineprint-risk-level.medium {
      background-color: #fef3c7;
      color: #d97706;
    }
    
    .fineprint-risk-level.low {
      background-color: #ecfdf5;
      color: #059669;
    }
    
    .fineprint-modal-actions {
      display: flex;
      gap: 12px;
    }
    
    .fineprint-button {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #4f46e5;
      color: white;
      border: none;
      border-radius: 8px;
      padding: 8px 16px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    .fineprint-button:hover {
      background-color: #4338ca;
    }
    
    .fineprint-modal-close {
      background: none;
      border: none;
      font-size: 24px;
      color: #6b7280;
      cursor: pointer;
    }
    
    .fineprint-modal-close:hover {
      color: #111827;
    }
    
    .fineprint-modal-body {
      padding: 24px;
    }
    
    .fineprint-tabs {
      display: flex;
      border-bottom: 1px solid #e5e7eb;
      margin-bottom: 24px;
    }
    
    .fineprint-tab {
      padding: 12px 24px;
      font-size: 16px;
      font-weight: 500;
      color: #6b7280;
      cursor: pointer;
      border-bottom: 2px solid transparent;
    }
    
    .fineprint-tab.active {
      color: #4f46e5;
      border-bottom-color: #4f46e5;
    }
    
    .fineprint-tab-content {
      display: none;
    }
    
    .fineprint-tab-content.active {
      display: block;
    }
    
    .fineprint-summary {
      background-color: #f9fafb;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 24px;
    }
    
    .fineprint-summary-title {
      font-weight: 600;
      margin-bottom: 12px;
      color: #111827;
    }
    
    .fineprint-red-flag {
      background-color: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 16px;
    }
    
    .fineprint-red-flag.high {
      border-left: 4px solid #ef4444;
    }
    
    .fineprint-red-flag.medium {
      border-left: 4px solid #f59e0b;
    }
    
    .fineprint-red-flag.low {
      border-left: 4px solid #10b981;
    }
    
    .fineprint-red-flag-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    
    .fineprint-red-flag-title {
      font-size: 18px;
      font-weight: 600;
      color: #111827;
      margin: 0;
    }
    
    .fineprint-red-flag-severity {
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 500;
    }
    
    .fineprint-red-flag-severity.high {
      background-color: #fee2e2;
      color: #b91c1c;
    }
    
    .fineprint-red-flag-severity.medium {
      background-color: #fef3c7;
      color: #b45309;
    }
    
    .fineprint-red-flag-severity.low {
      background-color: #d1fae5;
      color: #047857;
    }
    
    .fineprint-red-flag-description {
      color: #4b5563;
      margin-bottom: 12px;
    }
    
    .fineprint-red-flag-text {
      background-color: #f3f4f6;
      padding: 12px;
      border-radius: 6px;
      font-family: monospace;
      font-size: 14px;
      margin-bottom: 12px;
      white-space: pre-wrap;
      word-break: break-word;
    }
    
    .fineprint-red-flag-recommendation {
      color: #4f46e5;
      font-style: italic;
    }
    
    .fineprint-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px;
    }
    
    .fineprint-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #e5e7eb;
      border-top: 3px solid #4f46e5;
      border-radius: 50%;
      animation: fineprint-spin 1s linear infinite;
      margin-bottom: 16px;
    }
    
    @keyframes fineprint-spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  shadowRoot.appendChild(style);
  
  // Create initial modal content
  modal.innerHTML = `
    <div class="fineprint-modal-content">
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
          <button class="fineprint-button" id="fineprint-download-report">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download Report
          </button>
          <button class="fineprint-modal-close">×</button>
        </div>
      </div>
      
      <div class="fineprint-modal-body">
        <div class="fineprint-tabs">
          <div class="fineprint-tab ${!showSummaryTab ? 'active' : ''}" data-tab="flags">Red Flags (${analysis.red_flags.length})</div>
          <div class="fineprint-tab ${showSummaryTab ? 'active' : ''}" data-tab="summary">Summary</div>
        </div>
        
        <div class="fineprint-tab-content ${!showSummaryTab ? 'active' : ''}" data-tab-content="flags">
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
        
        <div class="fineprint-tab-content ${showSummaryTab ? 'active' : ''}" data-tab-content="summary">
          <div class="fineprint-loading">
            <div class="fineprint-spinner"></div>
            <p>Generating summary...</p>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Add modal to shadow DOM
  shadowRoot.appendChild(modal);
  
  // Add event listeners
  const closeButton = shadowRoot.querySelector('.fineprint-modal-close');
  closeButton.addEventListener('click', () => {
    document.body.removeChild(shadowHost);
  });
  
  // Download report button
  const downloadButton = shadowRoot.querySelector('#fineprint-download-report');
  downloadButton.addEventListener('click', () => {
    window.open(generateReport(analysis), '_blank');
  });
  
  // Tab switching
  const tabs = shadowRoot.querySelectorAll('.fineprint-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Deactivate all tabs
      tabs.forEach(t => t.classList.remove('active'));
      shadowRoot.querySelectorAll('.fineprint-tab-content').forEach(content => {
        content.classList.remove('active');
      });
      
      // Activate clicked tab
      tab.classList.add('active');
      const tabName = tab.getAttribute('data-tab');
      shadowRoot.querySelector(`.fineprint-tab-content[data-tab-content="${tabName}"]`).classList.add('active');
      
      // If summary tab and not yet loaded, generate summary
      if (tabName === 'summary' && !tab.hasAttribute('data-loaded')) {
        const summaryContent = shadowRoot.querySelector('.fineprint-tab-content[data-tab-content="summary"]');
        
        // Extract text from the page for summarization
        const pageText = extractContractText();
        
        // Generate summary using Groq API
        generateGroqSummary(pageText).then(summary => {
          summaryContent.innerHTML = `
            <div class="fineprint-summary">
              <h3 class="fineprint-summary-title">AI-Generated Summary</h3>
              <div class="fineprint-summary-content">${formatSummary(summary)}</div>
            </div>
          `;
          
          tab.setAttribute('data-loaded', 'true');
        });
      }
    });
  });
  
  // If summary tab should be shown initially, trigger its click event
  if (showSummaryTab) {
    const summaryTab = shadowRoot.querySelector('.fineprint-tab[data-tab="summary"]');
    if (summaryTab) {
      summaryTab.click();
    }
  }
  
  // Close when clicking outside the modal content
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      document.body.removeChild(shadowHost);
    }
  });
}

// Format the summary text with proper HTML
function formatSummary(text) {
  // Convert bullet points to HTML list items
  text = text.replace(/•\s?(.*?)(?=(?:\n•|\n\n|$))/gs, '<li>$1</li>');
  
  // Wrap list items in a ul
  if (text.includes('<li>')) {
    text = `<ul>${text}</ul>`;
  }
  
  // Convert line breaks to paragraphs
  text = text.replace(/\n\n/g, '</p><p>');
  
  // If no paragraphs were created, wrap the whole text
  if (!text.includes('</p>')) {
    text = `<p>${text}</p>`;
  }
  
  return text;
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
        transition: all 0.3s ease;
        border-radius: 3px;
        position: relative;
      }
      
      .fineprint-high {
        background-color: rgba(239, 68, 68, 0.15);
        box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.15);
        text-decoration: underline wavy rgba(239, 68, 68, 0.5);
        text-decoration-skip-ink: none;
      }
      
      .fineprint-medium {
        background-color: rgba(245, 158, 11, 0.15);
        box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.15);
        text-decoration: underline wavy rgba(245, 158, 11, 0.5);
        text-decoration-skip-ink: none;
      }
      
      .fineprint-low {
        background-color: rgba(34, 197, 94, 0.15);
        box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.15);
        text-decoration: underline wavy rgba(34, 197, 94, 0.5);
        text-decoration-skip-ink: none;
      }
      
      .fineprint-highlight:hover {
        transition: all 0.2s ease;
      }
      
      .fineprint-high:hover {
        background-color: rgba(239, 68, 68, 0.25);
      }
      
      .fineprint-medium:hover {
        background-color: rgba(245, 158, 11, 0.25);
      }
      
      .fineprint-low:hover {
        background-color: rgba(34, 197, 94, 0.25);
      }
      
      /* Tooltip styles */
      .fineprint-tooltip {
        position: absolute;
        z-index: 10000;
        width: 300px;
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        overflow: hidden;
        animation: fineprint-tooltip-appear 0.2s ease forwards;
        pointer-events: none;
      }
      
      @keyframes fineprint-tooltip-appear {
        from { opacity: 0; transform: translateY(5px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      .fineprint-tooltip-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 15px;
        background-color: #f8f9fa;
        border-bottom: 1px solid #eee;
      }
      
      .fineprint-tooltip-title {
        font-weight: 600;
        color: #333;
      }
      
      .fineprint-tooltip-severity {
        font-size: 12px;
        font-weight: 600;
        padding: 2px 8px;
        border-radius: 12px;
        text-transform: capitalize;
      }
      
      .fineprint-tooltip-high .fineprint-tooltip-severity {
        background-color: #fee2e2;
        color: #b91c1c;
      }
      
      .fineprint-tooltip-medium .fineprint-tooltip-severity {
        background-color: #ffedd5;
        color: #c2410c;
      }
      
      .fineprint-tooltip-low .fineprint-tooltip-severity {
        background-color: #dcfce7;
        color: #166534;
      }
      
      .fineprint-tooltip-body {
        padding: 12px 15px;
        color: #4b5563;
        line-height: 1.5;
      }
      
      .fineprint-tooltip-body p {
        margin: 0;
      }
      
      .fineprint-tooltip-top:after {
        content: '';
        position: absolute;
        bottom: -10px;
        left: 50%;
        margin-left: -10px;
        border-width: 10px 10px 0;
        border-style: solid;
        border-color: white transparent transparent;
      }
      
      .fineprint-tooltip-bottom:after {
        content: '';
        position: absolute;
        top: -10px;
        left: 50%;
        margin-left: -10px;
        border-width: 0 10px 10px;
        border-style: solid;
        border-color: transparent transparent white;
      }
    `;
    document.head.appendChild(style);
  }
}

function highlightRedFlags(redFlags) {
  console.log('Highlighting red flags:', redFlags);
  
  // Add highlight styles if not already present
  addHighlightStyles();
  
  // Remove existing highlights
  const existingHighlights = document.querySelectorAll('.fineprint-highlight');
  existingHighlights.forEach(el => {
    const parent = el.parentNode;
    if (parent) {
      // Create a text node with the original content
      parent.replaceChild(document.createTextNode(el.textContent), el);
      // Normalize to combine adjacent text nodes
      parent.normalize();
    }
  });
  
  // If no flags to highlight, return early
  if (!redFlags || !Array.isArray(redFlags) || redFlags.length === 0) {
    console.log('No red flags to highlight');
    return;
  }
  
  // Process each flag
  redFlags.forEach((flag, index) => {
    try {
      // Skip if no text to highlight
      if (!flag || !flag.text) {
        console.log('Skipping flag with no text:', flag);
        return;
      }
      
      // Clean the text for better matching
      const text = flag.text.trim();
      if (text.length < 10) {
        console.log('Text too short to highlight reliably:', text);
        return;
      }
      
      // Try to find paragraphs containing the text
      console.log('Looking for text:', text.substring(0, 50) + '...');
      
      // Find relevant elements (e.g., paragraphs, divs) likely to contain the text
      // Using a broader set of text-containing block/inline elements
      const elementsToSearch = document.querySelectorAll('p, div, span, li, td, blockquote, article, section');

      elementsToSearch.forEach(element => {
        // *** Added checks for element type and existence of 'closest' ***
        if (!element || typeof element.closest !== 'function' || element.tagName === 'SVG' || element.closest('svg')) {
            return; // Skip SVG elements and non-standard elements
        }

        // Avoid highlighting elements that are already part of our UI or invisible
        if (element.closest('.fineprint-modal') || element.closest('#fineprint-shadow-host') || !element.offsetParent) {
            return; // Skip elements within our modal or hidden elements
        }
        
        // Check if the element contains the search term (case-insensitive)
        if (element.textContent.toLowerCase().includes(text.toLowerCase())) {
            // Highlight occurrences within this element
            highlightElement(element, flag, text);
        }
      });
    } catch (error) {
      console.error('Error highlighting flag:', error);
    }
  });
  
  // Add click handlers to scroll to elements when clicked
  document.querySelectorAll('.fineprint-highlight').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Flash effect
      const originalBg = window.getComputedStyle(el).backgroundColor;
      el.style.transition = 'background-color 0.3s ease';
      el.style.backgroundColor = 'rgba(79, 70, 229, 0.2)';
      setTimeout(() => {
        el.style.backgroundColor = originalBg;
      }, 800);
    });
  });
}

// Highlight occurrences within a specific element
function highlightElement(element, flag, searchTerm) {
    const treeWalker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT, // Only consider text nodes
        { // Custom filter to accept only nodes containing the searchTerm
            acceptNode: function(node) {
                // *** Added check for SVG parentage and closest method ***
                const parent = node.parentElement;
                if (!parent || typeof parent.closest !== 'function' || parent.closest('script, style, svg, .fineprint-highlight')) {
                    return NodeFilter.FILTER_REJECT;
                }
                // Check if the node's text contains the search term (case-insensitive)
                if (node.nodeValue.toLowerCase().includes(searchTerm.toLowerCase())) {
                    return NodeFilter.FILTER_ACCEPT;
                }
                return NodeFilter.FILTER_SKIP; // Skip nodes that don't contain the term
            }
        },
        false
    );
    
    // ... rest of highlightElement function ...
}

// Make the function available to the window object
window.highlightRedFlags = highlightRedFlags;