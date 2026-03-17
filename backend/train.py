import os
import pandas as pd
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms
from PIL import Image
from tqdm import tqdm

from model import get_model

# Config
DATA_DIR = "./dataset"
TRAIN_CSV = os.path.join(DATA_DIR, "train_1.csv")
VAL_CSV = os.path.join(DATA_DIR, "valid.csv")
TRAIN_IMG_DIR = os.path.join(DATA_DIR, "train_images", "train_images")
VAL_IMG_DIR = os.path.join(DATA_DIR, "val_images", "val_images")

BATCH_SIZE = 16
NUM_EPOCHS = 10
LEARNING_RATE = 1e-4

class APTOSDataset(Dataset):
    def __init__(self, dataframe, image_dir, transform=None):
        self.dataframe = dataframe
        self.image_dir = image_dir
        self.transform = transform

    def __len__(self):
        return len(self.dataframe)

    def __getitem__(self, idx):
        # The id_code does not have .png extension in csv
        img_name = str(self.dataframe.iloc[idx, 0]) + '.png'
        img_path = os.path.join(self.image_dir, img_name)
        
        # Load image
        try:
            image = Image.open(img_path).convert("RGB")
        except FileNotFoundError:
            # Fallback
            print(f"Warning: {img_path} not found. Returning a blank image.")
            image = Image.new('RGB', (224, 224))
            
        label = int(self.dataframe.iloc[idx, 1])

        if self.transform:
            image = self.transform(image)

        return image, label

def train_model():
    # 1. Check if dataset exists
    if not os.path.exists(TRAIN_CSV) or not os.path.exists(VAL_CSV):
        print(f"Dataset CSVs not found properly in {DATA_DIR}!")
        return
        
    print("Loading data...")
    train_df = pd.read_csv(TRAIN_CSV)
    val_df = pd.read_csv(VAL_CSV)
    
    # Define transformations
    train_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(10),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    
    val_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])
    
    # Create datasets and dataloaders
    train_dataset = APTOSDataset(train_df, TRAIN_IMG_DIR, transform=train_transform)
    val_dataset = APTOSDataset(val_df, VAL_IMG_DIR, transform=val_transform)
    
    train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True, num_workers=0)
    val_loader = DataLoader(val_dataset, batch_size=BATCH_SIZE, shuffle=False, num_workers=0)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")
    
    # 2. Get the Model
    model = get_model(device)
    
    # 3. Loss and Optimizer
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=LEARNING_RATE)
    
    best_val_acc = 0.0
    
    # 4. Training Loop
    print(f"Starting training for {NUM_EPOCHS} epochs...")
    print(f"Train samples: {len(train_dataset)}, Val samples: {len(val_dataset)}")
    
    for epoch in range(NUM_EPOCHS):
        model.train()
        running_loss = 0.0
        correct_train = 0
        total_train = 0
        
        # Training phase
        loop = tqdm(train_loader, desc=f"Epoch [{epoch+1}/{NUM_EPOCHS}] Train")
        for images, labels in loop:
            images, labels = images.to(device), labels.to(device)
            
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            
            running_loss += loss.item() * images.size(0)
            
            _, predicted = torch.max(outputs.data, 1)
            total_train += labels.size(0)
            correct_train += (predicted == labels).sum().item()
            
            loop.set_postfix(loss=loss.item())
            
        train_acc = 100 * correct_train / total_train
        train_loss = running_loss / total_train
        
        # Validation phase
        model.eval()
        val_loss = 0.0
        correct_val = 0
        total_val = 0
        
        with torch.no_grad():
            val_loop = tqdm(val_loader, desc=f"Epoch [{epoch+1}/{NUM_EPOCHS}] Val")
            for images, labels in val_loop:
                images, labels = images.to(device), labels.to(device)
                
                outputs = model(images)
                loss = criterion(outputs, labels)
                
                val_loss += loss.item() * images.size(0)
                _, predicted = torch.max(outputs.data, 1)
                total_val += labels.size(0)
                correct_val += (predicted == labels).sum().item()
                
        val_acc = 100 * correct_val / total_val
        val_loss = val_loss / total_val
        
        print(f"Epoch [{epoch+1}/{NUM_EPOCHS}] | "
              f"Train Loss: {train_loss:.4f}, Train Acc: {train_acc:.2f}% | "
              f"Val Loss: {val_loss:.4f}, Val Acc: {val_acc:.2f}%")
              
        # Save best model
        if val_acc > best_val_acc:
            print(f"Accuracy improved from {best_val_acc:.2f}% to {val_acc:.2f}%. Saving model...")
            best_val_acc = val_acc
            torch.save(model.state_dict(), 'weights.pth')
            
    print(f"Training completed. Best Validation Accuracy: {best_val_acc:.2f}%")
    print("Model saved to 'weights.pth'")

if __name__ == '__main__':
    train_model()
