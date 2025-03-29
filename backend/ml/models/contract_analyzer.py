import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from typing import List, Dict, Any, Optional
import numpy as np
import logging
import os
import re
from ..config.model_config import ModelConfig
from ..utils.web_scraper import ContractScraper

logging.basicConfig(level=logging.DEBUG)  # Set to DEBUG for more details
logger = logging.getLogger(__name__)

class ContractAnalyzer:
    def __init__(self, config: ModelConfig):
        self.config = config
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        logger.info(f"Using device: {self.device}")
        self.scraper = ContractScraper()
        
        try:
            # Initialize tokenizer and model from fine-tuned weights if available
            if os.path.exists(config.model_path):
                logger.info(f"Loading fine-tuned model from {config.model_path}")
                logger.debug(f"Model path contents: {os.listdir(config.model_path)}")
                
                # Initialize tokenizer first with specific configuration
                self.tokenizer = AutoTokenizer.from_pretrained(
                    config.model_path,
                    use_fast=False,  # Use slow tokenizer to avoid PyPreTokenizerTypeWrapper error
                    add_prefix_space=True,
                    local_files_only=True
                )
                
                # Initialize model
                self.model = AutoModelForSequenceClassification.from_pretrained(
                    config.model_path,
                    num_labels=len(config.red_flag_categories),
                    problem_type="multi_label_classification"
                ).to(self.device)
            else:
                # Initialize from base model if no fine-tuned weights
                logger.info(f"Loading base model from {config.model_name}")
                self.tokenizer = AutoTokenizer.from_pretrained(
                    config.model_name,
                    use_fast=False,  # Use slow tokenizer to avoid PyPreTokenizerTypeWrapper error
                    add_prefix_space=True
                )
                self.model = AutoModelForSequenceClassification.from_pretrained(
                    config.model_name,
                    num_labels=len(config.red_flag_categories),
                    problem_type="multi_label_classification"
                ).to(self.device)
                logger.warning(f"Fine-tuned weights not found at {config.model_path}")
            
            self.model.eval()
            logger.info("Model initialization complete")
        except Exception as e:
            logger.error(f"Error initializing model: {str(e)}")
            logger.error("Falling back to pattern matching only mode")
            self.model = None
            self.tokenizer = None
    
    def analyze_webpage(self, html_content: str) -> Optional[Dict]:
        """Analyze contract text from webpage HTML."""
        # Extract contract text from HTML
        contract_data = self.scraper.extract_contract_text(html_content)
        if not contract_data:
            return None
        
        # Analyze the extracted text
        analysis_result = self.analyze_contract(contract_data["text"])
        if analysis_result:
            analysis_result["title"] = contract_data["title"]
        
        return analysis_result

    def analyze_contract(self, text: str) -> Dict:
        """Analyze contract text for red flags."""
        try:
            logger.info("Starting contract analysis with ML model")
            # Split text into manageable chunks
            chunks = self._split_into_chunks(text)
            logger.debug(f"Split text into {len(chunks)} chunks")
            
            all_red_flags = []
            
            # Analyze each chunk
            for i, chunk in enumerate(chunks):
                logger.debug(f"Analyzing chunk {i+1}/{len(chunks)}")
                chunk_red_flags = self._analyze_chunk(chunk)
                all_red_flags.extend(chunk_red_flags)
            
            # Merge similar red flags and remove duplicates
            merged_red_flags = self._merge_red_flags(all_red_flags)
            logger.debug(f"Found {len(merged_red_flags)} unique red flags")
            
            # Calculate overall risk level
            risk_level = self._calculate_risk_level(merged_red_flags)
            logger.info(f"Analysis complete. Risk level: {risk_level}")
            
            return {
                "risk_level": risk_level,
                "red_flags": merged_red_flags,
                "word_count": len(text.split())
            }
            
        except Exception as e:
            logger.error(f"Error in ML analysis: {str(e)}")
            logger.error("Falling back to pattern matching")
            # Fallback to pattern matching
            return self._pattern_analysis(text)

    def _analyze_chunk(self, text: str) -> List[Dict]:
        """Analyze a chunk of text using the ML model."""
        # Tokenize text
        inputs = self.tokenizer(
            text,
            max_length=self.config.max_length,
            truncation=True,
            padding=True,
            return_tensors="pt"
        ).to(self.device)
        
        # Get model predictions
        with torch.no_grad():
            outputs = self.model(**inputs)
            probabilities = torch.sigmoid(outputs.logits)[0]
        
        red_flags = []
        
        # Process predictions for each category
        for idx, prob in enumerate(probabilities):
            if prob.item() >= self.config.confidence_threshold:
                category = self.config.red_flag_categories[idx]
                # Find relevant text span
                relevant_text = self._extract_relevant_text(text, category)
                severity = self._determine_severity(category, relevant_text, prob.item())
                
                red_flag = {
                    "category": category,
                    "severity": severity,
                    "confidence": prob.item(),
                    "text": relevant_text,
                    "description": self._get_description(category),
                    "recommendation": self._get_recommendation(category)
                }
                red_flags.append(red_flag)
        
        return red_flags

    def _pattern_analysis(self, text: str) -> Dict:
        """Fallback pattern-based analysis."""
        red_flags = []
        
        for category, pattern in self.config.patterns.items():
            matches = re.finditer(pattern["regex"], text, re.IGNORECASE)
            for match in matches:
                red_flag = {
                    "category": category,
                    "severity": pattern["severity"],
                    "confidence": 0.7,  # Default confidence for pattern matching
                    "text": text[max(0, match.start() - 50):match.end() + 50],
                    "description": pattern["description"],
                    "recommendation": pattern["recommendation"]
                }
                red_flags.append(red_flag)
        
        risk_level = self._calculate_risk_level(red_flags)
        
        return {
            "risk_level": risk_level,
            "red_flags": red_flags,
            "word_count": len(text.split())
        }

    def _split_into_chunks(self, text: str) -> List[str]:
        """Split text into overlapping chunks."""
        chunks = []
        start = 0
        while start < len(text):
            end = start + self.config.max_chunk_size
            if end < len(text):
                # Find the last period or newline to avoid splitting mid-sentence
                last_break = max(
                    text.rfind(". ", start, end),
                    text.rfind("\n", start, end)
                )
                if last_break > start:
                    end = last_break + 1
            
            chunks.append(text[start:end])
            start = end - self.config.overlap_size
        
        return chunks

    def _merge_red_flags(self, red_flags: List[Dict]) -> List[Dict]:
        """Merge similar red flags and remove duplicates."""
        merged = {}
        
        for flag in red_flags:
            key = (flag["category"], flag["severity"])
            if key not in merged or flag["confidence"] > merged[key]["confidence"]:
                merged[key] = flag
        
        return list(merged.values())

    def _calculate_risk_level(self, red_flags: List[Dict]) -> str:
        """Calculate overall risk level based on red flags."""
        if not red_flags:
            return "low"
        
        # Count flags by severity
        severity_counts = {"high": 0, "medium": 0, "low": 0}
        for flag in red_flags:
            severity_counts[flag["severity"]] += 1
        
        # Determine risk level
        if severity_counts["high"] > 0:
            return "high"
        elif severity_counts["medium"] > 1:
            return "high"
        elif severity_counts["medium"] > 0:
            return "medium"
        return "low"

    def _determine_severity(self, category: str, text: str, confidence: float) -> str:
        """Determine severity based on category, content, and model confidence."""
        # Check if category has predefined severity
        if category in self.config.patterns:
            base_severity = self.config.patterns[category]["severity"]
        else:
            base_severity = "medium"
        
        # Adjust severity based on confidence
        if confidence > 0.9:
            return "high" if base_severity != "low" else "medium"
        elif confidence < 0.75:
            return "low" if base_severity != "high" else "medium"
        
        return base_severity

    def _extract_relevant_text(self, text: str, category: str) -> str:
        """Extract relevant text span for a category."""
        if category in self.config.patterns:
            pattern = self.config.patterns[category]["regex"]
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                start = max(0, match.start() - 100)
                end = min(len(text), match.end() + 100)
                return text[start:end].strip()
        
        # Fallback: return a reasonable chunk around any category-related terms
        category_terms = category.replace("_", " ").split()
        for term in category_terms:
            match = re.search(r'\b' + re.escape(term) + r'\b', text, re.IGNORECASE)
            if match:
                start = max(0, match.start() - 100)
                end = min(len(text), match.end() + 100)
                return text[start:end].strip()
        
        return text[:300] + "..."  # Return first 300 chars if no specific match

    def _get_description(self, category: str) -> str:
        """Get description for a category."""
        if category in self.config.patterns:
            return self.config.patterns[category]["description"]
        return f"Important {category.replace('_', ' ')} clause detected"

    def _get_recommendation(self, category: str) -> str:
        """Get recommendation for a category."""
        if category in self.config.patterns:
            return self.config.patterns[category]["recommendation"]
        return f"Review {category.replace('_', ' ')} terms carefully" 