# Hybrid Quantum-Classical Diabetic Retinopathy Detection System

This project is a modern medical web platform predicting Diabetic Retinopathy classes (0–4) utilizing a hybrid deep learning model approach combining a standard ResNet50 extraction with a simulated Variational Quantum Classifier (VQC) layer.

## Project Structure

- `/backend/` - FastAPI application serving the ML model, returning predictions, and making PDF reports.
- `/frontend/` - Next.js (App Router), React, Tailwind CSS full-stack frontend.

## Prerequisites

- [Node.js](https://nodejs.org/) (Required for Frontend)
- [Python 3.10+](https://www.python.org/) (Required for Backend)

## Dataset

This project uses the APTOS 2019 Blindness Detection dataset from Kaggle. Note that the dataset images are not included in this repository to keep it lightweight.

To use the dataset locally:
1. Download the dataset from [Kaggle](https://www.kaggle.com/c/aptos2019-blindness-detection/data).
2. Extract the downloaded archive.
3. Place the contents into the `backend/dataset/` directory.

## Getting Started

### 1. Setup Backend (FastAPI + PyTorch)

```bash
cd backend
# Create virtual environment (optional but recommended)
python -m venv venv
# On Windows
venv\Scripts\activate
# Install requirements
pip install -r requirements.txt

# Start local server
uvicorn main:app --reload --port 8000
```
*API interactive documentation is available at `http://localhost:8000/docs`.*

### 2. Setup Frontend (Next.js)

```bash
cd frontend
# Install dependencies
npm install
# Start local development server
npm run dev
```
*Open `http://localhost:3000` with your browser to see the result.*

## Features Implemented
- **Landing Page**: Project intro and simulated quantum mechanism explanation.
- **Upload Image Page**: Drag & drop zone supporting previews and basic validation.
- **Result Dashboard**: Displays diagnosis, probabilities via Recharts, clinical advice.
- **REST API (`/predict`)**: Base PyTorch template taking an image bytes buffer, performing resize & normalization via `torchvision.transforms`, feeding a custom Quantum-Inspired Model.
- **REST API (`/report`)**: Takes an image, gets a prediction, embeds image & configures a PDF response via `reportlab`.

## Notes
- To swap the mock simulated model for production, populate the Model Class in `model.py` and map state dictators locally. 
- Using Recharts on frontend for probabilities.
- PDF downloads require backend server running correctly. 
