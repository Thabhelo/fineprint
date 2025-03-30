import torch
from torch.utils.data import Dataset, DataLoader
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from typing import List, Dict, Any
import json
import os
import logging
import numpy as np
from sklearn.model_selection import train_test_split
from tqdm import tqdm

from config.model_config import ModelConfig

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ContractDataset(Dataset):
    def __init__(self, texts: List[str], labels: List[List[float]], tokenizer, max_length: int):
        self.encodings = tokenizer(texts, truncation=True, padding=True, max_length=max_length, return_tensors='pt')
        self.labels = torch.tensor(labels)
    
    def __getitem__(self, idx):
        item = {key: val[idx] for key, val in self.encodings.items()}
        item['labels'] = self.labels[idx]
        return item
    
    def __len__(self):
        return len(self.labels)

def prepare_training_data(converted_data_path: str, config: ModelConfig) -> tuple:
    """Prepare training data from converted dataset."""
    with open(converted_data_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    texts = []
    labels = []
    
    for contract in data['contracts']:
        # Combine all clause texts for the contract
        text = "\n".join(clause['text'] for clause in contract['clauses'])
        
        # Create binary labels for each category
        contract_labels = [0.0] * len(config.red_flag_categories)
        for clause in contract['clauses']:
            if clause['category'] in config.red_flag_categories:
                idx = config.red_flag_categories.index(clause['category'])
                contract_labels[idx] = 1.0
        
        texts.append(text)
        labels.append(contract_labels)
    
    return texts, labels

def train_model():
    """Train the model on the converted dataset."""
    try:
        # Initialize configuration
        config = ModelConfig()
        
        # Set up paths
        data_dir = os.path.join(os.path.dirname(__file__), "data", "converted")
        model_dir = os.path.join(os.path.dirname(__file__), "models", "contract_analyzer")
        
        # Create model directory if it doesn't exist
        os.makedirs(model_dir, exist_ok=True)
        
        # Load and prepare data
        logger.info("Loading training data...")
        texts, labels = prepare_training_data(
            os.path.join(data_dir, "fineprint_format.json"),
            config
        )
        
        # Split data into train and validation sets
        train_texts, val_texts, train_labels, val_labels = train_test_split(
            texts, labels, test_size=0.1, random_state=42
        )
        
        # Initialize tokenizer and model
        logger.info("Initializing model and tokenizer...")
        tokenizer = AutoTokenizer.from_pretrained(config.model_name)
        model = AutoModelForSequenceClassification.from_pretrained(
            config.model_name,
            num_labels=len(config.red_flag_categories),
            problem_type="multi_label_classification"
        )
        
        # Create datasets
        train_dataset = ContractDataset(train_texts, train_labels, tokenizer, config.max_length)
        val_dataset = ContractDataset(val_texts, val_labels, tokenizer, config.max_length)
        
        # Create dataloaders
        train_loader = DataLoader(train_dataset, batch_size=config.batch_size, shuffle=True)
        val_loader = DataLoader(val_dataset, batch_size=config.batch_size)
        
        # Set up training
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        model.to(device)
        
        optimizer = torch.optim.AdamW(model.parameters(), lr=2e-5)
        criterion = torch.nn.BCEWithLogitsLoss()
        
        # Training loop
        logger.info("Starting training...")
        num_epochs = 3
        best_val_loss = float('inf')
        
        for epoch in range(num_epochs):
            model.train()
            total_train_loss = 0
            
            for batch in tqdm(train_loader, desc=f"Epoch {epoch + 1}/{num_epochs}"):
                optimizer.zero_grad()
                
                input_ids = batch['input_ids'].to(device)
                attention_mask = batch['attention_mask'].to(device)
                labels = batch['labels'].to(device)
                
                outputs = model(
                    input_ids=input_ids,
                    attention_mask=attention_mask,
                    labels=labels
                )
                
                loss = outputs.loss
                total_train_loss += loss.item()
                
                loss.backward()
                optimizer.step()
            
            # Validation
            model.eval()
            total_val_loss = 0
            
            with torch.no_grad():
                for batch in val_loader:
                    input_ids = batch['input_ids'].to(device)
                    attention_mask = batch['attention_mask'].to(device)
                    labels = batch['labels'].to(device)
                    
                    outputs = model(
                        input_ids=input_ids,
                        attention_mask=attention_mask,
                        labels=labels
                    )
                    
                    total_val_loss += outputs.loss.item()
            
            avg_train_loss = total_train_loss / len(train_loader)
            avg_val_loss = total_val_loss / len(val_loader)
            
            logger.info(f"Epoch {epoch + 1}:")
            logger.info(f"Average training loss: {avg_train_loss:.4f}")
            logger.info(f"Average validation loss: {avg_val_loss:.4f}")
            
            # Save best model
            if avg_val_loss < best_val_loss:
                best_val_loss = avg_val_loss
                model.save_pretrained(model_dir)
                tokenizer.save_pretrained(model_dir)
                logger.info(f"Saved best model to {model_dir}")
        
        logger.info("Training completed successfully")
        
    except Exception as e:
        logger.error(f"Error during training: {str(e)}")
        raise

if __name__ == "__main__":
    train_model() 