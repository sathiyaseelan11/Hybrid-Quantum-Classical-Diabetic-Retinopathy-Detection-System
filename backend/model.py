import torch
import torch.nn as nn
from torchvision import models

class QuantumInspiredLayer(nn.Module):
    """
    Simulates a Variational Quantum Classifier (VQC) using a non-linear dense layer strategy.
    In a real quantum setting, this would represent the data embedding and parameterized quantum circuits.
    Here we use a combination of linear layers with sine/cosine activations to simulate quantum interference/phase.
    """
    def __init__(self, in_features, out_features):
        super(QuantumInspiredLayer, self).__init__()
        self.fc1 = nn.Linear(in_features, in_features * 2)
        self.fc2 = nn.Linear(in_features * 2, out_features)
        
    def forward(self, x):
        # Simulate phase encoding (non-linear)
        x = torch.sin(self.fc1(x)) * torch.cos(self.fc1(x))
        # Quantum interference/measurement simulation
        x = self.fc2(x)
        return x

class HybridDRModel(nn.Module):
    def __init__(self, num_classes=5):
        super(HybridDRModel, self).__init__()
        # Load a pretrained ResNet50
        # For production, we would use models.resnet50(weights=models.ResNet50_Weights.DEFAULT)
        # Using pretrained=True for backwards compatibility or weights=...
        self.resnet = models.resnet50(pretrained=True)
        
        # Replace the final fully connected layer with a bottleneck and quantum layer
        # ResNet50 output features is typically 2048
        in_features = self.resnet.fc.in_features
        
        # Bottleneck to reduce to 8 features (as per requirements)
        self.resnet.fc = nn.Sequential(
            nn.Linear(in_features, 512),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(512, 8),
            nn.ReLU()
        )
        
        # Quantum Inspired Layer
        self.quantum_layer = QuantumInspiredLayer(in_features=8, out_features=num_classes)
        
    def forward(self, x):
        features = self.resnet(x) # 8 abstract features
        out = self.quantum_layer(features)
        return out

def get_model(device="cpu"):
    model = HybridDRModel(num_classes=5)
    model.to(device)
    model.eval() # Set to evaluation mode
    return model
