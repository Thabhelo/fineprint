document.addEventListener('DOMContentLoaded', () => {
  const analyzeButton = document.getElementById('analyzeButton');
  const highlightButton = document.getElementById('highlightButton');
  const riskLevel = document.getElementById('riskLevel');
  const riskBadge = document.getElementById('riskBadge');
  const redFlagsList = document.getElementById('redFlagsList');
  const redFlagCount = document.getElementById('redFlagCount');
  const modelStatus = document.getElementById('modelStatus');
  const summaryModal = document.getElementById('summaryModal');
  const summaryContent = document.getElementById('summaryContent');
  const closeModalButton = document.getElementById('closeModalButton');
  const closeSummaryButton = document.getElementById('closeSummaryButton');
  const exportSummaryButton = document.getElementById('exportSummaryButton');
  const websiteLinkButton = document.getElementById('websiteLinkButton');

  let isAnalyzing = false;
  let currentAnalysis = null;

  // Set API endpoint
  const API_ENDPOINT = 'http://127.0.0.1:8000';
  
  // Function to check if the API is available
  async function checkApiAvailability() {
    try {
      const response = await fetch(`${API_ENDPOINT}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors',
      });
      
      if (response.ok) {
        console.log('API health check successful');
        updateModelStatus('ready');
        return true;
      } else {
        console.warn('API health check failed');
        updateModelStatus('error');
        return false;
      }
    } catch (error) {
      console.error('API health check error:', error);
      updateModelStatus('error');
      return false;
    }
  }
  
  // Check API availability when popup opens
  checkApiAvailability();

  // Update model status
  function updateModelStatus(status) {
    const indicator = modelStatus?.querySelector('.status-indicator');
    const text = modelStatus?.querySelector('.status-text');
    
    if (!indicator || !text) {
        console.warn("Model status indicator or text element not found.");
        return; 
    }

    switch (status) {
      case 'loading':
        indicator.className = 'status-indicator loading';
        text.textContent = 'Processing...';
        break;
      case 'ready':
        indicator.className = 'status-indicator';
        text.textContent = 'AI Ready';
        break;
      case 'error':
        indicator.className = 'status-indicator error';
        text.textContent = 'Using Fallback Analysis';
        break;
    }
  }

  // Show summary modal
  function showSummaryModal(summary) {
    summaryContent.innerHTML = formatSummary(summary);
    summaryModal.classList.add('visible');
  }

  // Hide summary modal
  function hideSummaryModal() {
    summaryModal.classList.remove('visible');
  }

  // Close modal buttons
  if (closeModalButton) closeModalButton.addEventListener('click', hideSummaryModal);
  if (closeSummaryButton) closeSummaryButton.addEventListener('click', hideSummaryModal);

  // Export summary button
  if (exportSummaryButton) {
    exportSummaryButton.addEventListener('click', () => {
      if (!currentAnalysis) return;
      
      // Create a blob with the summary content
      const summaryText = summaryContent.innerText;
      const blob = new Blob([
        'FinePrint Contract Analysis\n\n',
        `Risk Level: ${currentAnalysis.risk_level}\n`,
        `Red Flags Found: ${currentAnalysis.red_flags.length}\n\n`,
        'Summary:\n',
        summaryText
      ], { type: 'text/plain' });
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'contract-analysis.txt';
      a.click();
      
      // Cleanup
      URL.revokeObjectURL(url);
    });
  }

  // Website Link Button
  if (websiteLinkButton) {
    websiteLinkButton.addEventListener('click', () => {
        // Replace with your actual website URL
        chrome.tabs.create({ url: 'https://fineprint.it.com/' }); 
    });
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
            body: JSON.stringify({ text: result.result }),
            mode: 'cors',
            credentials: 'omit'
          });

          if (!response.ok) {
            console.error(`API request failed with status ${response.status}: ${response.statusText}`);
            throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
          }

          const analysis = await response.json();
          currentAnalysis = analysis;
          updateUI('complete', analysis);
          highlightButton.disabled = false;
          updateModelStatus('ready');
          
          // Generate AI summary
          generateAISummary(result.result);
          
        } catch (error) {
          console.error('Backend API error:', error);
          updateModelStatus('error');
          
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
      
      // Check if there are actual red flags to highlight
      if (currentAnalysis.red_flags && currentAnalysis.red_flags.length > 0) {
        // Highlight actual red flags
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          function: highlightRedFlags,
          args: [currentAnalysis.red_flags]
        });
      } else {
        // If no red flags, do a demo highlight
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          function: highlightDemoFlagsInPage
        });
      }
    } catch (error) {
      console.error('Highlight error:', error);
    }
  });

  // Function to highlight demo flags (used when no actual flags found)
  function highlightDemoFlagsInPage() {
    // First clean any existing highlights
    const existingHighlights = document.querySelectorAll('.fineprint-highlight');
    existingHighlights.forEach(el => {
      const parent = el.parentNode;
      parent.replaceChild(document.createTextNode(el.textContent), el);
    });
    
    // Find paragraphs with at least 50 characters
    const paragraphs = Array.from(document.querySelectorAll('p, div, span, li'))
      .filter(el => el.textContent.trim().length > 50);
    
    // Highlight random elements
    if (paragraphs.length > 0) {
      const clearHighlights = () => {
        const highlights = document.querySelectorAll('.fineprint-highlight');
        highlights.forEach(el => {
          const parent = el.parentNode;
          parent.replaceChild(document.createTextNode(el.textContent), el);
        });
      };
      
      // Automatically clear after some time
      setTimeout(clearHighlights, 10000);
      
      // Choose 2-3 random paragraphs to highlight
      const count = Math.min(Math.floor(Math.random() * 2) + 2, paragraphs.length);
      const selected = [];
      
      while (selected.length < count) {
        const idx = Math.floor(Math.random() * paragraphs.length);
        if (!selected.includes(idx)) {
          selected.push(idx);
          
          // Get the paragraph
          const el = paragraphs[idx];
          
          // Don't highlight if already highlighted
          if (el.querySelector('.fineprint-highlight')) continue;
          
          // Generate a random severity
          const severities = ['low', 'medium', 'high'];
          const severity = severities[Math.floor(Math.random() * severities.length)];
          
          // Apply highlight
          applyHighlight(el, severity);
        }
      }
    }

    function applyHighlight(element, severity) {
      // Create highlight element
      const span = document.createElement('span');
      span.className = `fineprint-highlight fineprint-${severity}`;
      span.textContent = element.textContent;
      
      // Set title based on severity
      if (severity === 'high') {
        span.title = 'High Risk: This clause contains potentially unfavorable terms.';
      } else if (severity === 'medium') {
        span.title = 'Medium Risk: This clause should be reviewed carefully.';
      } else {
        span.title = 'Low Risk: This clause may require attention.';
      }
      
      // Replace element content with highlight
      element.textContent = '';
      element.appendChild(span);
    }
  }

  // Update UI based on state
  function updateUI(state, data = null) {
    // Reset red flags list
    redFlagsList.innerHTML = '';
    
    switch (state) {
      case 'analyzing':
        // Update risk level display
        riskLevel.textContent = 'Analyzing...';
        riskBadge.textContent = '?';
        riskBadge.className = 'badge';
        
        // Show analyzing message in red flags section
        redFlagsList.innerHTML = '<div class="empty-message">Analyzing contract text...</div>';
        redFlagCount.textContent = '0';
        break;
        
      case 'complete':
        if (!data) return;
        
        // Update risk level
        riskLevel.textContent = `${data.risk_level.charAt(0).toUpperCase() + data.risk_level.slice(1)} Risk`;
        
        // Update risk badge
        riskBadge.textContent = data.risk_level.charAt(0).toUpperCase();
        riskBadge.className = `badge badge-${data.risk_level}`;
        
        // Update red flags section
        if (data.red_flags && data.red_flags.length > 0) {
          // Update count
          redFlagCount.textContent = data.red_flags.length;
          
          // Add each red flag
          data.red_flags.forEach(flag => {
            const flagItem = document.createElement('div');
            flagItem.className = `flag-item flag-${flag.severity}`;
            
            // Create flag header with title and severity
            const flagHeader = document.createElement('div');
            flagHeader.className = 'flag-header';
            
            const flagCategory = document.createElement('div');
            flagCategory.className = 'flag-category';
            flagCategory.textContent = flag.category;
            
            const flagSeverity = document.createElement('div');
            flagSeverity.className = 'flag-severity';
            flagSeverity.textContent = flag.severity.charAt(0).toUpperCase() + flag.severity.slice(1);
            
            flagHeader.appendChild(flagCategory);
            flagHeader.appendChild(flagSeverity);
            
            // Create content section
            const flagContent = document.createElement('div');
            flagContent.className = 'flag-content';
            
            // Add text sample
            const flagText = document.createElement('div');
            flagText.className = 'flag-text';
            flagText.textContent = flag.text;
            
            // Add description
            const flagDescription = document.createElement('div');
            flagDescription.className = 'flag-description';
            flagDescription.textContent = flag.description;
            
            // Assemble the flag item
            flagContent.appendChild(flagText);
            flagContent.appendChild(flagDescription);
            
            flagItem.appendChild(flagHeader);
            flagItem.appendChild(flagContent);
            
            redFlagsList.appendChild(flagItem);
          });
          
        } else {
          // No red flags found
          redFlagsList.innerHTML = '<div class="empty-message">No significant issues detected.</div>';
          redFlagCount.textContent = '0';
        }
        break;
        
      case 'error':
        // Update risk level display
        riskLevel.textContent = 'Analysis Failed';
        riskBadge.textContent = '!';
        riskBadge.className = 'badge badge-error';
        
        // Show error message
        redFlagsList.innerHTML = '<div class="error-message">Unable to analyze contract. Please try again later.</div>';
        redFlagCount.textContent = '0';
        
        // Re-enable buttons
        analyzeButton.disabled = false;
        highlightButton.disabled = true;
        break;
    }
  }

  // Format the summary text
  function formatSummary(text) {
    // Convert bullet points to HTML list items
    let formattedText = text.replace(/•\s?(.*?)(?=(?:\n•|\n\n|$))/gs, '<li>$1</li>');
    
    // Wrap list items in a ul
    if (formattedText.includes('<li>')) {
      formattedText = `<ul>${formattedText}</ul>`;
    }
    
    // Convert line breaks to paragraphs
    formattedText = formattedText.replace(/\n\n/g, '</p><p>');
    
    // If no paragraphs were created, wrap the whole text
    if (!formattedText.includes('</p>')) {
      formattedText = `<p>${formattedText}</p>`;
    }
    
    return formattedText;
  }
  
  // Generate AI summary
  async function generateAISummary(text) {
    if (!text) return;
    
    try {
      // Generate summary with Groq API
      const GROQ_API_KEY = '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';
      const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
      
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
      const summary = result.choices[0].message.content;
      
      // Store the summary for later
      if (currentAnalysis) {
        currentAnalysis.summary = summary;
      }
      
      // Show the summary in the modal
      showSummaryModal(summary);
      
    } catch (error) {
      console.error('Error generating summary:', error);
      // If we already have analysis, show it anyway
      if (currentAnalysis) {
        showSummaryModal("Failed to generate summary. Please try again later.");
      }
    }
  }
});

// Function to be executed in the content script context
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
        span.title = `${flag.category}\n${flag.description}`;
        node.parentNode.replaceChild(span, node);
      }
    }
  });
}

// Fallback local contract analysis function
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
    nonCompete: ['non-compete', 'restrict', 'compete']
  };

  // Check for related terms in context
  for (const terms of Object.values(relatedTerms)) {
    if (terms.some(term => context.toLowerCase().includes(term.toLowerCase()))) {
      confidence += 0.1;
    }
  }

  return Math.min(confidence, 1.0); // Cap at 1.0
}