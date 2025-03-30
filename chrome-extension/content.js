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
    const text = extractContractText();
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

    const analysis = await response.json();
    showAnalysisResults(analysis);
  } catch (error) {
    console.error('Error analyzing page:', error);
  }
}

// Function to extract contract text
function extractContractText() {
  const mainContent = document.querySelector('main, article, .content, #content, .main-content, #main-content');
  if (!mainContent) return document.body.innerText;
  
  const textNodes = [];
  const walk = document.createTreeWalker(
    mainContent,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );
  
  let node;
  while (node = walk.nextNode()) {
    if (node.textContent.trim()) {
      textNodes.push(node.textContent.trim());
    }
  }
  
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

  // Process each flag
  redFlags.forEach(flag => {
    try {
      // Skip empty text
      if (!flag.text) return;
      
      // Clean up the text for matching (remove ellipses and trim)
      let cleanText = flag.text.replace(/^\.\.\./, '').replace(/\.\.\.$/, '').trim();
      
      // For very short texts, try to find more precise matches
      if (cleanText.length < 20) {
        cleanText = cleanText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      } else {
        // For longer texts, use a substring approach for better matching
        // Take a reasonable chunk from the middle to avoid ellipses issues
        const words = cleanText.split(/\s+/);
        if (words.length > 5) {
          cleanText = words.slice(1, Math.min(8, words.length - 1)).join(' ');
        }
        cleanText = cleanText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      }
      
      // Use a text walker to find matches in visible text
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: (node) => {
            // Skip if already highlighted or hidden
            if (node.parentElement && (
                node.parentElement.classList.contains('fineprint-highlight') ||
                node.parentElement.closest('.fineprint-highlight')
            )) {
              return NodeFilter.FILTER_REJECT;
            }
            
            // Skip if empty or just whitespace
            if (!node.textContent.trim()) {
              return NodeFilter.FILTER_REJECT;
            }
            
            // Skip if hidden
            const style = window.getComputedStyle(node.parentElement);
            if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
              return NodeFilter.FILTER_REJECT;
            }
            
            return NodeFilter.FILTER_ACCEPT;
          }
        },
        false
      );
      
      let node;
      let regex = new RegExp(cleanText, 'i');
      
      while (node = walker.nextNode()) {
        if (node.textContent && regex.test(node.textContent)) {
          // Create a highlight span
          const span = document.createElement('span');
          span.className = `fineprint-highlight fineprint-${flag.severity}`;
          span.textContent = node.textContent;
          span.title = `${flag.category}: ${flag.description}`;
          span.dataset.flagId = flag.category.toLowerCase().replace(/\s+/g, '-');
          
          // Replace the text node with our highlight span
          node.parentNode.replaceChild(span, node);
          
          // Add click handler to flash and show details
          span.addEventListener('click', () => {
            span.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            // Flash effect
            const originalBackground = span.style.backgroundColor;
            span.style.backgroundColor = span.classList.contains('fineprint-high') 
              ? 'rgba(239, 68, 68, 0.4)' 
              : span.classList.contains('fineprint-medium')
                ? 'rgba(245, 158, 11, 0.4)'
                : 'rgba(34, 197, 94, 0.4)';
            
            setTimeout(() => {
              span.style.backgroundColor = originalBackground;
            }, 600);
          });
          
          break; // Only highlight one instance per flag
        }
      }
    } catch (error) {
      console.error('Error highlighting flag:', error, flag);
    }
  });
  
  console.log('Highlighting complete');
}