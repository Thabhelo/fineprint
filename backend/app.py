from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import APIKeyHeader
from pydantic import BaseModel
import re
from typing import List, Optional
from ml.models.contract_analyzer import ContractAnalyzer
from ml.config.model_config import ModelConfig
import logging
import time
import os
from datetime import datetime
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Fineprint API",
    description="API for analyzing contracts and detecting red flags",
    version="1.0.0"
)

# Security
API_KEY_NAME = "X-API-Key"
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)

# Rate limiting
RATE_LIMIT_REQUESTS = 100  # requests per minute
RATE_LIMIT_WINDOW = 60  # seconds

# Configure CORS with specific origins
ALLOWED_ORIGINS = [
    "chrome-extension://*",  # Chrome extensions
    "http://localhost:*",    # Local development
    "https://fineprint.it.com"  # Production
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for now to fix CORS issues
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],  # Explicitly allow OPTIONS
    allow_headers=["*"],
)

# Initialize ML model
config = ModelConfig()
analyzer = ContractAnalyzer(config)

class ContractRequest(BaseModel):
    text: str
    source_url: Optional[str] = None

class RedFlag(BaseModel):
    category: str
    severity: str
    text: str
    description: str
    recommendation: str
    confidence: float

class AnalysisResponse(BaseModel):
    risk_level: str
    word_count: int
    red_flags: List[RedFlag]
    analysis_timestamp: str
    model_version: str

# Rate limiting middleware
@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    client_ip = request.client.host
    current_time = time.time()
    
    # Get or create rate limit data for this IP
    if not hasattr(app.state, 'rate_limit_data'):
        app.state.rate_limit_data = {}
    
    if client_ip not in app.state.rate_limit_data:
        app.state.rate_limit_data[client_ip] = {
            'requests': [],
            'last_reset': current_time
        }
    
    # Clean old requests
    client_data = app.state.rate_limit_data[client_ip]
    client_data['requests'] = [
        req_time for req_time in client_data['requests']
        if current_time - req_time < RATE_LIMIT_WINDOW
    ]
    
    # Check rate limit
    if len(client_data['requests']) >= RATE_LIMIT_REQUESTS:
        raise HTTPException(
            status_code=429,
            detail="Too many requests. Please try again later."
        )
    
    # Add current request
    client_data['requests'].append(current_time)
    
    # Process request
    response = await call_next(request)
    return response

# Health check endpoint
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "model_loaded": analyzer.model is not None
    }

# Main analysis endpoint
@app.post("/api/analyze", response_model=AnalysisResponse)
async def analyze_contract(
    request: ContractRequest,
    api_key: Optional[str] = Depends(api_key_header)
):
    try:
        # Log request (excluding sensitive data)
        logger.info(f"Received analysis request from {request.source_url or 'unknown source'}")
        
        # Input validation
        if not request.text or len(request.text.strip()) < 10:
            raise HTTPException(
                status_code=400,
                detail="Contract text is too short or empty"
            )
        
        if len(request.text) > 1000000:  # 1MB limit
            raise HTTPException(
                status_code=400,
                detail="Contract text exceeds maximum length"
            )
        
        # Use the ML model for analysis
        analysis_result = analyzer.analyze_contract(request.text)
        
        # Add metadata
        analysis_result['analysis_timestamp'] = datetime.utcnow().isoformat()
        analysis_result['model_version'] = config.model_name
        
        return analysis_result
        
    except Exception as e:
        logger.error(f"Error analyzing contract: {str(e)}")
        
        # Fallback to pattern-based analysis if ML model fails
        try:
            analysis = analyze_red_flags(request.text)
            word_count = len(request.text.split())
            
            # Determine risk level based on red flags
            risk_level = 'low'
            if any(flag['severity'] == 'high' for flag in analysis):
                risk_level = 'high'
            elif any(flag['severity'] == 'medium' for flag in analysis):
                risk_level = 'medium'
            
            return {
                'risk_level': risk_level,
                'word_count': word_count,
                'red_flags': analysis,
                'analysis_timestamp': datetime.utcnow().isoformat(),
                'model_version': 'pattern-matching-fallback'
            }
        except Exception as fallback_error:
            logger.error(f"Fallback analysis failed: {str(fallback_error)}")
            raise HTTPException(
                status_code=500,
                detail="Failed to analyze contract"
            )

def analyze_red_flags(text: str) -> List[dict]:
    # Define red flag patterns
    patterns = {
        'autoRenewal': {
            'regex': r'(auto|automatic|automatically)\s+renew|renewal|renewed|renewing',
            'severity': 'high',
            'category': 'Automatic Renewal',
            'description': 'Contract automatically renews without explicit consent',
            'recommendation': 'Request removal or modification of automatic renewal clause'
        },
        'unclearCancellation': {
            'regex': r'(cancel|cancellation|terminate|termination|end|ending|expire|expiration)',
            'severity': 'medium',
            'category': 'Cancellation Terms',
            'description': 'Cancellation process is not clearly defined',
            'recommendation': 'Request specific cancellation procedures and timelines'
        },
        'liability': {
            'regex': r'(liability|responsible|responsibility|obligation|obligations|indemnify|indemnification)',
            'severity': 'low',
            'category': 'Liability',
            'description': 'Standard liability limitations present',
            'recommendation': 'Review liability limits and consider if they are reasonable'
        },
        'hiddenFees': {
            'regex': r'(fee|fees|charge|charges|cost|costs|payment|payments|price|pricing|rate|rates)',
            'severity': 'medium',
            'category': 'Fees and Charges',
            'description': 'Possible hidden fees or charges detected',
            'recommendation': 'Request detailed breakdown of all fees and charges'
        },
        'dataCollection': {
            'regex': r'(data|information|collect|collection|share|sharing|privacy|confidential|confidentiality)',
            'severity': 'medium',
            'category': 'Data Privacy',
            'description': 'Extensive data collection or sharing terms present',
            'recommendation': 'Review data collection and sharing policies'
        },
        'arbitration': {
            'regex': r'(arbitration|arbitrate|arbitrator|dispute|disputes|litigation|court|courts)',
            'severity': 'high',
            'category': 'Dispute Resolution',
            'description': 'Mandatory arbitration or dispute resolution terms present',
            'recommendation': 'Review dispute resolution process and consider if it favors your interests'
        },
        'intellectualProperty': {
            'regex': r'(intellectual property|patent|patents|copyright|copyrights|trademark|trademarks|license|licenses)',
            'severity': 'medium',
            'category': 'Intellectual Property',
            'description': 'Intellectual property rights and licensing terms present',
            'recommendation': 'Review IP rights and licensing terms carefully'
        },
        'nonCompete': {
            'regex': r'(non-compete|noncompete|restrict|restriction|restrictions|compete|competition)',
            'severity': 'high',
            'category': 'Non-Compete',
            'description': 'Non-compete or restrictive covenants present',
            'recommendation': 'Review scope and duration of non-compete provisions'
        },
        'forceMajeure': {
            'regex': r'(force majeure|act of god|unforeseen|unforeseeable|circumstances|beyond control)',
            'severity': 'medium',
            'category': 'Force Majeure',
            'description': 'Force majeure or unforeseeable circumstances clause present',
            'recommendation': 'Review force majeure provisions and their implications'
        },
        'assignment': {
            'regex': r'(assign|assignment|transfer|transfers|transferable|assignable)',
            'severity': 'medium',
            'category': 'Assignment Rights',
            'description': 'Contract assignment or transfer rights present',
            'recommendation': 'Review assignment rights and restrictions'
        }
    }
    
    red_flags = []
    for pattern_name, pattern in patterns.items():
        matches = re.finditer(pattern['regex'], text, re.IGNORECASE)
        for match in matches:
            # Get context around the match with 90 characters on each side
            start = max(0, match.start() - 90)
            end = min(len(text), match.end() + 90)
            
            # Try to get complete sentences
            while start > 0 and text[start] not in '.!?':
                start -= 1
            while end < len(text) and text[end] not in '.!?':
                end += 1
            
            context = text[start:end].strip()
            
            # Calculate confidence based on match quality
            confidence = calculate_confidence(match.group(), context)
            
            red_flags.append({
                'category': pattern['category'],
                'severity': pattern['severity'],
                'text': context,
                'description': pattern['description'],
                'recommendation': pattern['recommendation'],
                'confidence': confidence
            })
    
    return red_flags

def calculate_confidence(match: str, context: str) -> float:
    # Calculate confidence based on match quality and context
    confidence = 0.5  # Base confidence
    
    # Increase confidence for longer matches
    if len(match) > 10:
        confidence += 0.2
    
    # Increase confidence for multiple occurrences in context
    occurrences = context.lower().count(match.lower())
    if occurrences > 1:
        confidence += 0.1
    
    return min(confidence, 1.0)

@app.get("/api/config")
async def get_config():
    """
    Provide configuration including API keys to the frontend.
    In a production environment, this would include proper authentication.
    """
    # In production, you would check authentication
    # before providing sensitive information
    
    # Load from environment variables
    import os
    
    # Load environment variables from .env file
    load_dotenv()
    
    # Get API key from environment with fallback
    groq_api_key = os.getenv("GROQ_API_KEY", "")
    
    # Only return a masked version for logging/display
    masked_key = ""
    if groq_api_key:
        masked_key = groq_api_key[:4] + "..." + groq_api_key[-4:]
    
    return {
        "groqApiKey": groq_api_key,
        "masked": masked_key,
        "configured": bool(groq_api_key)
    }

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000) 