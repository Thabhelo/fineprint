document.addEventListener('DOMContentLoaded', () => {
  const analyzeButton = document.getElementById('analyzeButton');
  const riskLevel = document.getElementById('riskLevel');
  const progressIndicator = document.getElementById('progressIndicator');
  const issuesList = document.getElementById('issuesList');

  let isAnalyzing = false;

  analyzeButton.addEventListener('click', async () => {
    if (isAnalyzing) return;
    
    try {
      isAnalyzing = true;
      analyzeButton.disabled = true;
      updateUI('analyzing');

      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      const [result] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: extractContractText
      });

      if (result?.result) {
        const analysis = await analyzeContract(result.result);
        updateUI('complete', analysis);
      }
    } catch (error) {
      console.error('Analysis error:', error);
      updateUI('error');
    } finally {
      isAnalyzing = false;
      analyzeButton.disabled = false;
    }
  });

  function updateUI(state, data = null) {
    switch (state) {
      case 'analyzing':
        riskLevel.textContent = 'Analyzing...';
        progressIndicator.style.width = '50%';
        progressIndicator.style.background = '#6b7280';
        issuesList.innerHTML = '<p class="empty-state">Analysis in progress...</p>';
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

        if (data.issues?.length > 0) {
          issuesList.innerHTML = data.issues.map(issue => `
            <div class="issue-item">
              <svg class="icon" viewBox="0 0 24 24" width="16" height="16" stroke="${riskColors[issue.severity]}" stroke-width="2" fill="none">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span>${issue.description}</span>
            </div>
          `).join('');
        } else {
          issuesList.innerHTML = '<p class="empty-state">No issues detected</p>';
        }
        break;

      case 'error':
        riskLevel.textContent = 'Error';
        progressIndicator.style.width = '100%';
        progressIndicator.style.background = '#ef4444';
        issuesList.innerHTML = '<p class="empty-state">Failed to analyze contract</p>';
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

async function analyzeContract(text) {
  // Simulate API call since we don't have a real endpoint
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Mock response
  return {
    risk_level: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
    issues: [
      {
        severity: 'high',
        description: 'Automatic renewal clause detected'
      },
      {
        severity: 'medium',
        description: 'Unclear cancellation terms'
      },
      {
        severity: 'low',
        description: 'Standard liability clause'
      }
    ]
  };
}