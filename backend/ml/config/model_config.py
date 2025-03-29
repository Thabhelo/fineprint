from dataclasses import dataclass, field
from typing import List, Dict
import re
import os

@dataclass
class ModelConfig:
    # Model settings
    model_name: str = "microsoft/deberta-v3-base"
    max_length: int = 512
    batch_size: int = 8
    
    # Categories and patterns
    red_flag_categories: List[str] = field(default_factory=lambda: [
        "auto_renewal",
        "cancellation_terms",
        "hidden_fees",
        "data_collection",
        "liability_limitation",
        "arbitration"
    ])
    
    severity_levels: List[str] = field(default_factory=lambda: ["low", "medium", "high"])
    
    patterns: Dict = field(default_factory=lambda: {
        "auto_renewal": {
            "regex": re.compile(r"auto.*renew|automatic.*renewal|renew.*automatic", re.IGNORECASE),
            "severity": "high",
            "title": "Automatic Renewal Clause",
            "description": "Contract contains terms for automatic renewal",
            "recommendation": "Review renewal terms and set reminders for cancellation deadlines"
        },
        "hidden_fees": {
            "regex": re.compile(r"fee.*change|additional.*charge|fee.*increase", re.IGNORECASE),
            "severity": "high", 
            "title": "Hidden or Variable Fees",
            "description": "Contract contains terms about variable or additional fees",
            "recommendation": "Review all fee structures and potential increases"
        },
        "data_collection": {
            "regex": re.compile(r"data.*collect|personal.*information|privacy", re.IGNORECASE),
            "severity": "medium",
            "title": "Data Collection Terms",
            "description": "Contract includes terms about collecting personal data",
            "recommendation": "Review data collection and privacy policies"
        }
    })

    def __post_init__(self):
        # Get the absolute path to the backend directory
        backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        
        # Set absolute paths for model and tokenizer
        self.model_path = os.path.join(backend_dir, "ml", "models", "contract_analyzer")
        self.tokenizer_path = os.path.join(backend_dir, "ml", "models", "contract_analyzer")
    
    # API settings
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    
    # Cache settings
    cache_ttl: int = 3600  # 1 hour
    
    # Analysis settings
    max_chunk_size: int = 1000
    overlap_size: int = 100
    confidence_threshold: float = 0.7
    
    # Enhanced red flag categories based on CUAD
    cuad_mapping: Dict[str, str] = field(default_factory=lambda: {
        "Renewal Term": "auto_renewal",
        "Notice Period to Terminate Renewal": "cancellation_terms",
        "Non-Compete": "competition_restrictions",
        "Exclusivity": "exclusivity_terms",
        "IP Ownership Assignment": "ip_rights",
        "Uncapped Liability": "liability_limitations",
        "Revenue/Profit Sharing": "hidden_fees",
        "Governing Law": "jurisdiction"
    }) 