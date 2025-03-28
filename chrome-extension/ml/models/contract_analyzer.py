import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from typing import List, Dict, Any
import numpy as np
from ..config.model_config import ModelConfig

class ContractAnalyzer:
    def __init__(self, config: ModelConfig):
        self.config = config
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        
        # Initialize tokenizer and model
        self.tokenizer = AutoTokenizer.from_pretrained(config.model_name)
        self.model = AutoModelForSequenceClassification.from_pretrained(
            config.model_name,
            num_labels=len(config.red_flag_categories)
        ).to(self.device)
        
        # Load model weights if available
        try:
            self.model.load_state_dict(torch.load(config.model_path))
            print("Loaded model weights successfully")
        except:
            print("No pre-trained weights found, using base model")
    
    def preprocess_text(self, text: str) -> List[str]:
        """Split text into chunks for analysis"""
        chunks = []
        start = 0
        while start < len(text):
            end = start + self.config.max_chunk_size
            chunk = text[start:end]
            chunks.append(chunk)
            start = end - self.config.overlap_size
        return chunks
    
    def analyze_chunk(self, chunk: str) -> Dict[str, Any]:
        """Analyze a single chunk of text"""
        # Tokenize input
        inputs = self.tokenizer(
            chunk,
            max_length=self.config.max_length,
            padding=True,
            truncation=True,
            return_tensors="pt"
        ).to(self.device)
        
        # Get model predictions
        with torch.no_grad():
            outputs = self.model(**inputs)
            predictions = torch.softmax(outputs.logits, dim=1)
            probabilities = predictions.cpu().numpy()[0]
        
        # Get top predictions above threshold
        red_flags = []
        for idx, prob in enumerate(probabilities):
            if prob > self.config.confidence_threshold:
                category = self.config.red_flag_categories[idx]
                red_flags.append({
                    "category": category,
                    "confidence": float(prob),
                    "severity": self._determine_severity(category, prob),
                    "text": self._extract_relevant_text(chunk, category)
                })
        
        return {
            "red_flags": red_flags,
            "risk_level": self._calculate_risk_level(red_flags)
        }
    
    def analyze_contract(self, text: str) -> Dict[str, Any]:
        """Analyze the entire contract"""
        chunks = self.preprocess_text(text)
        all_red_flags = []
        
        for chunk in chunks:
            result = self.analyze_chunk(chunk)
            all_red_flags.extend(result["red_flags"])
        
        # Deduplicate and merge similar red flags
        merged_red_flags = self._merge_red_flags(all_red_flags)
        
        return {
            "risk_level": self._calculate_risk_level(merged_red_flags),
            "word_count": len(text.split()),
            "red_flags": merged_red_flags
        }
    
    def _determine_severity(self, category: str, confidence: float) -> str:
        """Determine severity based on category and confidence"""
        base_severity = self.config.patterns.get(category, {}).get("severity", "medium")
        
        if confidence > 0.9:
            return "high"
        elif confidence > 0.7:
            return base_severity
        else:
            return "low"
    
    def _calculate_risk_level(self, red_flags: List[Dict]) -> str:
        """Calculate overall risk level"""
        if not red_flags:
            return "low"
        
        severities = [flag["severity"] for flag in red_flags]
        if "high" in severities:
            return "high"
        elif "medium" in severities:
            return "medium"
        return "low"
    
    def _extract_relevant_text(self, text: str, category: str) -> str:
        """Extract the relevant text for a red flag"""
        pattern = self.config.patterns.get(category, {}).get("regex")
        if pattern:
            import re
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(0)
        return ""
    
    def _merge_red_flags(self, red_flags: List[Dict]) -> List[Dict]:
        """Merge similar red flags and keep the highest confidence ones"""
        merged = {}
        for flag in red_flags:
            category = flag["category"]
            if category not in merged or flag["confidence"] > merged[category]["confidence"]:
                merged[category] = flag
        
        return list(merged.values()) 