import io
import torch
from PIL import Image
from torchvision import transforms
import torch.nn.functional as F

from model import get_model

# 0 - No DR, 1 - Mild, 2 - Moderate, 3 - Severe, 4 - Proliferative
DR_CLASSES = {
    0: {"label": "No DR", "color": "green", "description": "No signs of diabetic retinopathy."},
    1: {"label": "Mild", "color": "yellow", "description": "Microaneurysms only. Recommend 1-year follow up."},
    2: {"label": "Moderate", "color": "yellow", "description": "More than just microaneurysms but less than severe. Recommend 6-month follow up."},
    3: {"label": "Severe", "color": "red", "description": "Any of the following: >20 intraretinal hemorrhages in each of 4 quadrants, definite venous beading in 2+ quadrants, prominent IRMA in 1+ quadrant."},
    4: {"label": "Proliferative", "color": "red", "description": "Neovascularization or vitreous/preretinal hemorrhage. Urgent referral to ophthalmologist."}
}

class DRInference:
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = get_model(self.device)
        
        # Load weights model trained on APTOS dataset
        try:
            # map_location ensures it works even if trained on GPU and running on CPU
            self.model.load_state_dict(torch.load('weights.pth', map_location=self.device))
            print("Successfully loaded trained weights.pth")
        except FileNotFoundError:
            print("Warning: weights.pth not found. Using untrained pretrained model. Run train.py first.")
        
        # Image Preprocessing Pipeline
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            # Normalization typically used for ImageNet pretrained models
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])

    def predict(self, image_bytes: bytes):
        try:
            image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        except Exception as e:
            raise ValueError("Invalid image format.")
            
        tensor = self.transform(image).unsqueeze(0).to(self.device)
        
        with torch.no_grad():
            logits = self.model(tensor)
            probabilities = F.softmax(logits, dim=1).squeeze()
            
            # Extract top prediction and confidence
            confidence_score, predicted_idx = torch.max(probabilities, 0)
            
            # Convert probabilities to a Python list
            prob_list = probabilities.tolist()
            
        class_idx = predicted_idx.item()
        confidence = confidence_score.item() * 100
        
        # Get metadata
        meta = DR_CLASSES[class_idx]
        
        return {
            "class_id": class_idx,
            "label": meta["label"],
            "confidence": round(confidence, 2),
            "color": meta["color"],
            "description": meta["description"],
            "probabilities": prob_list
        }

# Singleton instance
inference_engine = DRInference()
