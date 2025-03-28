document.addEventListener('DOMContentLoaded', () => {
  const analyzeButton = document.getElementById('analyzeButton');
  const highlightButton = document.getElementById('highlightButton');
  const riskLevel = document.getElementById('riskLevel');
  const progressIndicator = document.getElementById('progressIndicator');
  const redFlagsList = document.getElementById('redFlagsList');
  const wordCount = document.getElementById('wordCount');
  const redFlagCount = document.getElementById('redFlagCount');
  const websiteLink = document.getElementById('websiteLink');

  let isAnalyzing = false;
  let currentAnalysis = null;

  // Set default website URL and try to detect environment
  let websiteUrl = 'https://fineprint.it.com';
  try {
    // Try to fetch localhost first
    fetch('http://localhost:3000/health')
      .then(response => {
        if (response.ok) {
          websiteUrl = 'http://localhost:3000';
        }
      })
      .catch(() => {
        // If localhost fails, use production URL
        websiteUrl = 'https://fineprint.it.com';
      })
      .finally(() => {
        websiteLink.href = websiteUrl;
      });
  } catch (error) {
    // If any error occurs, use production URL
    websiteLink.href = websiteUrl;
  }

  analyzeButton.addEventListener('click', async () => {
    if (isAnalyzing) return;
    
    try {
      isAnalyzing = true;
      analyzeButton.disabled = true;
      highlightButton.disabled = true;
      updateUI('analyzing');

      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      const [result] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: extractContractText
      });

      if (result?.result) {
        // Try to use the backend API first
        try {
          const response = await fetch(`${websiteUrl}/api/analyze`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: result.result })
          });

          if (response.ok) {
            const analysis = await response.json();
            currentAnalysis = analysis;
            updateUI('complete', analysis);
            highlightButton.disabled = false;
          } else {
            // If API fails, fall back to local analysis
            throw new Error('API request failed');
          }
        } catch (error) {
          // Fall back to local analysis
          console.log('Using fallback analysis');
          const analysis = await analyzeContract(result.result);
          currentAnalysis = analysis;
          updateUI('complete', analysis);
          highlightButton.disabled = false;
        }
      }
    } catch (error) {
      console.error('Analysis error:', error);
      updateUI('error');
    } finally {
      isAnalyzing = false;
      analyzeButton.disabled = false;
    }
  });

  highlightButton.addEventListener('click', async () => {
    if (!currentAnalysis) return;

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: highlightRedFlags,
        args: [currentAnalysis.red_flags]
      });
    } catch (error) {
      console.error('Highlight error:', error);
    }
  });

  function updateUI(state, data = null) {
    switch (state) {
      case 'analyzing':
        riskLevel.textContent = 'Analyzing...';
        progressIndicator.style.width = '50%';
        progressIndicator.style.background = '#6b7280';
        redFlagsList.innerHTML = '<p class="empty-state">Analysis in progress...</p>';
        wordCount.textContent = '0';
        redFlagCount.textContent = '0';
        break;

      case 'complete':
        const riskColors = {
          low: '#22c55e',
          medium: '#f59e0b',
          high: '#ef4444'
        };

        riskLevel.textContent = data.risk_level.toUpperCase();
        progressIndicator.style.width = '100%';
        progressIndicator.style.background = riskColors[data.risk_level];
        wordCount.textContent = data.word_count.toLocaleString();
        redFlagCount.textContent = data.red_flags.length;

        if (data.red_flags?.length > 0) {
          redFlagsList.innerHTML = data.red_flags.map(flag => `
            <div class="red-flag-item">
              <svg class="icon" viewBox="0 0 24 24" width="16" height="16" stroke="${riskColors[flag.severity]}" stroke-width="2" fill="none">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <div class="red-flag-content">
                <div class="red-flag-title">${flag.title}</div>
                <div class="red-flag-description">${flag.description}</div>
                ${flag.recommendation ? `<div class="red-flag-recommendation">${flag.recommendation}</div>` : ''}
              </div>
            </div>
          `).join('');
        } else {
          redFlagsList.innerHTML = '<p class="empty-state">No red flags detected</p>';
        }
        break;

      case 'error':
        riskLevel.textContent = 'Error';
        progressIndicator.style.width = '100%';
        progressIndicator.style.background = '#ef4444';
        redFlagsList.innerHTML = '<p class="empty-state">Failed to analyze contract</p>';
        break;
    }
  }
});

function extractContractText() {
  // Get visible text content
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );

  let text = '';
  let node;
  
  while (node = walker.nextNode()) {
    const style = window.getComputedStyle(node.parentElement);
    if (style.display !== 'none' && style.visibility !== 'hidden') {
      text += node.textContent.trim() + ' ';
    }
  }

  return text.substring(0, 10000); // Limit to 10k characters
}

function highlightRedFlags(redFlags) {
  // Remove existing highlights
  const existingHighlights = document.querySelectorAll('.fineprint-highlight');
  existingHighlights.forEach(el => {
    const parent = el.parentNode;
    parent.replaceChild(document.createTextNode(el.textContent), el);
  });

  // Add new highlights
  redFlags.forEach(flag => {
    const text = flag.text || '';
    const regex = new RegExp(text, 'gi');
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    let node;
    while (node = walker.nextNode()) {
      if (node.parentElement.classList.contains('fineprint-highlight')) continue;
      
      const matches = node.textContent.match(regex);
      if (matches) {
        const span = document.createElement('span');
        span.className = `fineprint-highlight fineprint-${flag.severity}`;
        span.textContent = node.textContent;
        span.title = `${flag.title}\n${flag.description}`;
        node.parentNode.replaceChild(span, node);
      }
    }
  });
}

async function analyzeContract(text) {
  // Enhanced fallback analysis with more realistic patterns
  await new Promise(resolve => setTimeout(resolve, 1500));

  const words = text.split(/\s+/);
  const wordCount = words.length;

  // Define common red flag patterns
  const patterns = {
    autoRenewal: {
      regex: /(auto|automatic|automatically)\s+renew|renewal/i,
      severity: 'high',
      title: 'Automatic Renewal Clause',
      description: 'Contract automatically renews without explicit consent',
      recommendation: 'Request removal or modification of automatic renewal clause'
    },
    unclearCancellation: {
      regex: /(cancel|cancellation|terminate|termination)/i,
      severity: 'medium',
      title: 'Unclear Cancellation Terms',
      description: 'Cancellation process is not clearly defined',
      recommendation: 'Request specific cancellation procedures and timelines'
    },
    liability: {
      regex: /(liability|responsible|responsibility)/i,
      severity: 'low',
      title: 'Standard Liability Clause',
      description: 'Standard liability limitations present',
      recommendation: 'Review liability limits and consider if they are reasonable'
    },
    hiddenFees: {
      regex: /(fee|fees|charge|charges|cost|costs)/i,
      severity: 'medium',
      title: 'Potential Hidden Fees',
      description: 'Possible hidden fees or charges detected',
      recommendation: 'Request detailed breakdown of all fees and charges'
    },
    dataCollection: {
      regex: /(data|information|collect|collection|share|sharing)/i,
      severity: 'medium',
      title: 'Data Collection Clause',
      description: 'Extensive data collection or sharing terms present',
      recommendation: 'Review data collection and sharing policies'
    }
  };

  // Analyze text for patterns
  const redFlags = [];
  for (const [key, pattern] of Object.entries(patterns)) {
    if (pattern.regex.test(text)) {
      redFlags.push({
        ...pattern,
        text: text.match(pattern.regex)[0]
      });
    }
  }

  // Determine overall risk level
  let riskLevel = 'low';
  if (redFlags.some(flag => flag.severity === 'high')) {
    riskLevel = 'high';
  } else if (redFlags.some(flag => flag.severity === 'medium')) {
    riskLevel = 'medium';
  }

  return {
    risk_level: riskLevel,
    word_count: wordCount,
    red_flags: redFlags
  };
}