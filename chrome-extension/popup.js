document.addEventListener('DOMContentLoaded', () => {
  const analyzeButton = document.getElementById('analyzeButton');
  const highlightButton = document.getElementById('highlightButton');
  const summaryButton = document.getElementById('summaryButton');
  const riskLevel = document.getElementById('riskLevel');
  const progressIndicator = document.getElementById('progressIndicator');
  const redFlagsList = document.getElementById('redFlagsList');
  const positivePoints = document.getElementById('positivePoints');
  const neutralPoints = document.getElementById('neutralPoints');
  const wordCount = document.getElementById('wordCount');
  const redFlagCount = document.getElementById('redFlagCount');
  const websiteLink = document.getElementById('websiteLink');
  const modelStatus = document.getElementById('modelStatus');
  const modelConfidence = document.getElementById('modelConfidence');

  let isAnalyzing = false;
  let currentAnalysis = null;

  // Set API endpoint
  const API_ENDPOINT = 'http://127.0.0.1:8000';

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

  // Update model status
  function updateModelStatus(status) {
    const indicator = modelStatus.querySelector('.status-indicator');
    const text = modelStatus.querySelector('.status-text');
    
    switch (status) {
      case 'loading':
        indicator.className = 'status-indicator loading';
        text.textContent = 'Loading AI Model...';
        break;
      case 'ready':
        indicator.className = 'status-indicator';
        text.textContent = 'AI Model Ready';
        break;
      case 'error':
        indicator.className = 'status-indicator error';
        text.textContent = 'Using Fallback Analysis';
        break;
    }
  }

  analyzeButton.addEventListener('click', async () => {
    if (isAnalyzing) return;
    
    try {
      isAnalyzing = true;
      analyzeButton.disabled = true;
      highlightButton.disabled = true;
      updateUI('analyzing');
      updateModelStatus('loading');

      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      const [result] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: extractContractText
      });

      if (result?.result) {
        try {
          console.log('Sending request to backend API...');
          const response = await fetch(`${API_ENDPOINT}/api/analyze`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: result.result })
          });

          if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
          }

          const analysis = await response.json();
          currentAnalysis = analysis;
          updateUI('complete', analysis);
          highlightButton.disabled = false;
          summaryButton.disabled = false;
          updateModelStatus('ready');
          
        } catch (error) {
          console.error('Backend API error:', error);
          updateModelStatus('error');
          
          // Fall back to local analysis
          console.log('Using fallback analysis');
          const analysis = await analyzeContract(result.result);
          currentAnalysis = analysis;
          updateUI('complete', analysis);
          highlightButton.disabled = false;
          summaryButton.disabled = false;
        }
      }
    } catch (error) {
      console.error('Analysis error:', error);
      updateUI('error');
      updateModelStatus('error');
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
      console.error('Highlighting error:', error);
    }
  });

  function updateUI(state, data = null) {
    switch (state) {
      case 'analyzing':
        riskLevel.textContent = 'Analyzing...';
        progressIndicator.style.width = '50%';
        redFlagsList.innerHTML = '<p class="empty-state">Analyzing contract...</p>';
        positivePoints.innerHTML = '<p class="empty-state">Analyzing contract...</p>';
        neutralPoints.innerHTML = '<p class="empty-state">Analyzing contract...</p>';
        wordCount.textContent = '0';
        redFlagCount.textContent = '0';
        modelConfidence.textContent = '-';
        break;

      case 'complete':
        if (data) {
          riskLevel.textContent = data.risk_level.charAt(0).toUpperCase() + data.risk_level.slice(1);
          progressIndicator.style.width = '100%';
          wordCount.textContent = data.word_count;
          redFlagCount.textContent = data.red_flags.length;
          
          // Calculate average model confidence
          const avgConfidence = data.red_flags.reduce((acc, flag) => acc + flag.confidence, 0) / data.red_flags.length;
          modelConfidence.textContent = `${(avgConfidence * 100).toFixed(1)}%`;
          
          // Update red flags list
          redFlagsList.innerHTML = data.red_flags.map(flag => `
            <div class="red-flag ${flag.severity}">
              <div class="flag-header">
                <span class="flag-category">${flag.category}</span>
                <span class="flag-severity">${flag.severity}</span>
              </div>
              <p class="flag-text">${flag.text}</p>
              <div class="flag-details">
                <p class="flag-description">${flag.description}</p>
                <p class="flag-recommendation">${flag.recommendation}</p>
              </div>
            </div>
          `).join('');

          // Update key points
          updateKeyPoints(data);
          
          // Enable buttons
          highlightButton.disabled = false;
          summaryButton.disabled = false;
        }
        break;

      case 'error':
        riskLevel.textContent = 'Error';
        progressIndicator.style.width = '0%';
        redFlagsList.innerHTML = '<p class="error-state">Error analyzing contract</p>';
        wordCount.textContent = '0';
        redFlagCount.textContent = '0';
        modelConfidence.textContent = '-';
        break;
    }
  }

  function getConfidenceClass(confidence) {
    if (confidence >= 0.8) return 'high';
    if (confidence >= 0.5) return 'medium';
    return 'low';
  }

  // Update key points section
  function updateKeyPoints(analysis) {
    // Clear existing points
    positivePoints.innerHTML = '';
    neutralPoints.innerHTML = '';

    // Add positive points (no high severity flags)
    if (!analysis.red_flags.some(flag => flag.severity === 'high')) {
      const positivePoint = document.createElement('div');
      positivePoint.className = 'point-item positive';
      positivePoint.innerHTML = `
        <svg class="icon" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
          <path d="M20 6L9 17l-5-5"/>
        </svg>
        <span class="text">No high-risk red flags detected</span>
      `;
      positivePoints.appendChild(positivePoint);
    }

    // Add neutral points (standard terms)
    const neutralPoint = document.createElement('div');
    neutralPoint.className = 'point-item neutral';
    neutralPoint.innerHTML = `
      <svg class="icon" viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">
        <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
      </svg>
      <span class="text">Standard contract terms present</span>
    `;
    neutralPoints.appendChild(neutralPoint);

    // If no points were added, show empty state
    if (positivePoints.children.length === 0) {
      positivePoints.innerHTML = '<p class="empty-state">No positive points detected</p>';
    }
    if (neutralPoints.children.length === 0) {
      neutralPoints.innerHTML = '<p class="empty-state">No neutral points detected</p>';
    }
  }

  // Handle summary button click
  summaryButton.addEventListener('click', () => {
    if (!currentAnalysis) return;

    // Create summary modal
    const modal = document.createElement('div');
    modal.className = 'summary-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h2>Contract Summary</h2>
          <button class="close-button">
            <svg class="icon" viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="summary-section">
            <h3>Overview</h3>
            <p>Risk Level: <span class="${currentAnalysis.risk_level}">${currentAnalysis.risk_level}</span></p>
            <p>Words Analyzed: ${currentAnalysis.word_count}</p>
            <p>Red Flags Found: ${currentAnalysis.red_flags.length}</p>
          </div>
          <div class="summary-section">
            <h3>Key Findings</h3>
            <div class="findings-list">
              ${currentAnalysis.red_flags.map(flag => `
                <div class="finding-item ${flag.severity}">
                  <span class="severity">${flag.severity}</span>
                  <span class="category">${flag.category}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;

    // Add modal to body
    document.body.appendChild(modal);

    // Handle close button
    modal.querySelector('.close-button').addEventListener('click', () => {
      modal.remove();
    });

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  });
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

  // Define common red flag patterns with more detailed matching
  const patterns = {
    autoRenewal: {
      regex: /(auto|automatic|automatically)\s+renew|renewal|renewed|renewing/i,
      severity: 'high',
      category: 'Automatic Renewal',
      description: 'Contract automatically renews without explicit consent',
      recommendation: 'Request removal or modification of automatic renewal clause'
    },
    unclearCancellation: {
      regex: /(cancel|cancellation|terminate|termination|end|ending|expire|expiration)/i,
      severity: 'medium',
      category: 'Cancellation Terms',
      description: 'Cancellation process is not clearly defined',
      recommendation: 'Request specific cancellation procedures and timelines'
    },
    liability: {
      regex: /(liability|responsible|responsibility|obligation|obligations|indemnify|indemnification)/i,
      severity: 'low',
      category: 'Liability',
      description: 'Standard liability limitations present',
      recommendation: 'Review liability limits and consider if they are reasonable'
    },
    hiddenFees: {
      regex: /(fee|fees|charge|charges|cost|costs|payment|payments|price|pricing|rate|rates)/i,
      severity: 'medium',
      category: 'Fees and Charges',
      description: 'Possible hidden fees or charges detected',
      recommendation: 'Request detailed breakdown of all fees and charges'
    },
    dataCollection: {
      regex: /(data|information|collect|collection|share|sharing|privacy|confidential|confidentiality)/i,
      severity: 'medium',
      category: 'Data Privacy',
      description: 'Extensive data collection or sharing terms present',
      recommendation: 'Review data collection and sharing policies'
    },
    arbitration: {
      regex: /(arbitration|arbitrate|arbitrator|dispute|disputes|litigation|court|courts)/i,
      severity: 'high',
      category: 'Dispute Resolution',
      description: 'Mandatory arbitration or dispute resolution terms present',
      recommendation: 'Review dispute resolution process and consider if it favors your interests'
    },
    intellectualProperty: {
      regex: /(intellectual property|patent|patents|copyright|copyrights|trademark|trademarks|license|licenses)/i,
      severity: 'medium',
      category: 'Intellectual Property',
      description: 'Intellectual property rights and licensing terms present',
      recommendation: 'Review IP rights and licensing terms carefully'
    },
    nonCompete: {
      regex: /(non-compete|noncompete|restrict|restriction|restrictions|compete|competition)/i,
      severity: 'high',
      category: 'Non-Compete',
      description: 'Non-compete or restrictive covenants present',
      recommendation: 'Review scope and duration of non-compete provisions'
    },
    forceMajeure: {
      regex: /(force majeure|act of god|unforeseen|unforeseeable|circumstances|beyond control)/i,
      severity: 'medium',
      category: 'Force Majeure',
      description: 'Force majeure or unforeseeable circumstances clause present',
      recommendation: 'Review force majeure provisions and their implications'
    },
    assignment: {
      regex: /(assign|assignment|transfer|transfers|transferable|assignable)/i,
      severity: 'medium',
      category: 'Assignment Rights',
      description: 'Contract assignment or transfer rights present',
      recommendation: 'Review assignment rights and restrictions'
    }
  };

  // Analyze text for patterns with context
  const redFlags = [];
  for (const [key, pattern] of Object.entries(patterns)) {
    const matches = text.match(new RegExp(pattern.regex, 'gi'));
    if (matches) {
      // Get context for each match
      matches.forEach(match => {
        const index = text.toLowerCase().indexOf(match.toLowerCase());
        const start = Math.max(0, index - 50);
        const end = Math.min(text.length, index + match.length + 50);
        const context = text.substring(start, end);
        
        redFlags.push({
          ...pattern,
          text: context,
          confidence: calculateConfidence(match, context)
        });
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

function calculateConfidence(match, context) {
  // Calculate confidence based on match quality and context
  let confidence = 0.5; // Base confidence

  // Increase confidence for exact matches
  if (match.length > 10) confidence += 0.2;

  // Increase confidence for multiple occurrences
  const occurrences = (context.match(new RegExp(match, 'gi')) || []).length;
  if (occurrences > 1) confidence += 0.1;

  // Increase confidence for presence of related terms
  const relatedTerms = {
    autoRenewal: ['renew', 'renewal', 'automatically'],
    unclearCancellation: ['cancel', 'terminate', 'end'],
    liability: ['liability', 'responsible', 'obligation'],
    hiddenFees: ['fee', 'charge', 'cost', 'payment'],
    dataCollection: ['data', 'information', 'privacy'],
    arbitration: ['arbitration', 'dispute', 'court'],
    intellectualProperty: ['patent', 'copyright', 'trademark'],
    nonCompete: ['non-compete', 'restrict', 'compete'],
    forceMajeure: ['force majeure', 'unforeseen', 'circumstances'],
    assignment: ['assign', 'transfer', 'transferable']
  };

  // Check for related terms in context
  for (const terms of Object.values(relatedTerms)) {
    if (terms.some(term => context.toLowerCase().includes(term.toLowerCase()))) {
      confidence += 0.1;
    }
  }

  return Math.min(confidence, 1.0); // Cap at 1.0
}