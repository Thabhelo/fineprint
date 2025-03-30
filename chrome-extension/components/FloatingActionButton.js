// Create styled components using global styled-components
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

const FloatingActionButton = ({ onAnalyze }) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);

  React.useEffect(() => {
    // Check if we're on a relevant page
    const isRelevantPage = () => {
      const url = window.location.href.toLowerCase();
      const path = window.location.pathname.toLowerCase();
      
      // Legal document patterns
      const legalPatterns = [
        'terms', 'privacy', 'agreement', 'contract', 'policy',
        'legal', 'conditions', 'tos', 'eula', 'license'
      ];

      // Check URL and path
      return legalPatterns.some(pattern => 
        url.includes(pattern) || 
        path.includes(pattern) ||
        document.title.toLowerCase().includes(pattern)
      );
    };

    if (isRelevantPage()) {
      // Show the FAB after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, []);

  return (
    React.createElement(FABContainer, { isVisible },
      React.createElement(FABButton, {
        onClick: onAnalyze,
        onMouseEnter: () => setIsHovered(true),
        onMouseLeave: () => setIsHovered(false)
      },
        React.createElement(FABIcon, null,
          React.createElement('svg', {
            width: 24,
            height: 24,
            viewBox: "0 0 24 24",
            fill: "none",
            xmlns: "http://www.w3.org/2000/svg",
            stroke: "currentColor",
            strokeWidth: 2
          },
            React.createElement('path', {
              d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
            })
          )
        )
      ),
      React.createElement(FABContent, { isVisible: isHovered },
        React.createElement(FABText, null, "Analyze this contract with Fineprint")
      )
    )
  );
};

// Export to global scope
window.FloatingActionButton = FloatingActionButton; 