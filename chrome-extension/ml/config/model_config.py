from dataclasses import dataclass
from typing import List, Dict

@dataclass
class ModelConfig:
    # Model architecture
    model_name: str = "microsoft/deberta-v3-base"  # Good for legal text
    max_length: int = 512
    batch_size: int = 8
    
    # Red flag categories
    red_flag_categories: List[str] = [
        "auto_renewal",
        "cancellation_terms",
        "liability_limitations",
        "hidden_fees",
        "data_collection",
        "arbitration",
        "jurisdiction",
        "modification_terms",
        "termination_conditions",
        "payment_terms"
    ]
    
    # Severity levels
    severity_levels: List[str] = ["low", "medium", "high"]
    
    # Confidence thresholds
    confidence_threshold: float = 0.7
    
    # Model paths
    model_path: str = "models/contract_analyzer"
    tokenizer_path: str = "models/contract_analyzer"
    
    # API settings
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    
    # Cache settings
    cache_ttl: int = 3600  # 1 hour
    
    # Analysis settings
    max_chunk_size: int = 1000  # characters
    overlap_size: int = 100  # characters
    
    # Red flag patterns (fallback)
    patterns: Dict[str, Dict] = {
        "auto_renewal": {
            "regex": r"(auto|automatic|automatically)\s+renew|renewal",
            "severity": "high",
            "title": "Automatic Renewal Clause",
            "description": "Contract automatically renews without explicit consent",
            "recommendation": "Request removal or modification of automatic renewal clause"
        },
        "cancellation_terms": {
            "regex": r"(cancel|cancellation|terminate|termination)",
            "severity": "medium",
            "title": "Unclear Cancellation Terms",
            "description": "Cancellation process is not clearly defined",
            "recommendation": "Request specific cancellation procedures and timelines"
        },
        "liability_limitations": {
            "regex": r"(liability|responsible|responsibility)",
            "severity": "low",
            "title": "Standard Liability Clause",
            "description": "Standard liability limitations present",
            "recommendation": "Review liability limits and consider if they are reasonable"
        },
        "hidden_fees": {
            "regex": r"(fee|fees|charge|charges|cost|costs)",
            "severity": "medium",
            "title": "Potential Hidden Fees",
            "description": "Possible hidden fees or charges detected",
            "recommendation": "Request detailed breakdown of all fees and charges"
        },
        "data_collection": {
            "regex": r"(data|information|collect|collection|share|sharing)",
            "severity": "medium",
            "title": "Data Collection Clause",
            "description": "Extensive data collection or sharing terms present",
            "recommendation": "Review data collection and sharing policies"
        }
    } 