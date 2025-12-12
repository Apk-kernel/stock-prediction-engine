# Stock Prediction Engine 

A sophisticated robust machine learning stock prediction system featuring a modern React frontend and a FastAPI backend. This application uses an ensemble of algorithms (XGBoost, Random Forest, CatBoost) to predict stock price direction and provides reliability metrics based on historical performance.

![Stock Prediction Engine Demo](https://i.imgur.com/place_holder.png) 
*(Note: Add a screenshot of the dashboard here)*

##  Features

*   **Real-time Predictions**: Predicts whether a stock's price will go UP or DOWN.
*   **Ensemble ML Model**: Combines XGBoost, LightGBM, CatBoost, and Random Forest for improved accuracy.
*   **Confidence Score**: Provides a probability score for every prediction.
*   **Reliability Panel**: Tracks the model's performance on the specific stock over the last 30 trades (Accuracy, PnL).
*   **Interactive Charts**: Interactive price history charts using Recharts.
*   **Backtesting**: Built-in simple backtester to validate strategies.
*   **Fast API**: High-performance backend using FastAPI.
*   **Modern UI**: Sleek, responsive, and dark-themed UI built with React & Vite.

##  Tech Stack

### Backend
*   **Language**: Python 3.9+
*   **Framework**: FastAPI
*   **ML Libraries**: scikit-learn, XGBoost, CatBoost, LightGBM
*   **Data**: yfinance (Yahoo Finance API)

### Frontend
*   **Framework**: React (Vite)
*   **Language**: TypeScript
*   **Styling**: CSS Modules / Custom CSS (Glassmorphism design)
*   **Charts**: Recharts
*   **Icons**: Lucide React

##  Installation

### Prerequisites
*   Python 3.8+
*   Node.js 16+
*   npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/Apk-kernel/stock-prediction-engine.git
cd stock-prediction-engine
```

### 2. Backend Setup
Navigate to the root directory and install Python dependencies.
```bash
# It's recommended to create a virtual environment
python -m venv venv
# Windows
.\venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

Run the backend server:
```bash
uvicorn backend.main:app --reload
```
The API will be available at `http://localhost:8000`.

### 3. Frontend Setup
Open a new terminal and navigate to the `frontend` folder.
```bash
cd frontend
npm install
```

Run the development server:
```bash
npm run dev
```
The application will be accessible at `http://localhost:5173` (or the port shown in your terminal).

##  Usage

1.  Enter a stock ticker (e.g., `AAPL`, `TSLA`, `NVDA`) in the search bar.
2.  Hit **Enter** or click the prediction button.
3.  View the **Prediction** (UP/DOWN), **Confidence**, and **Price History**.
4.  Check the **Reliability Panel** to see how accurate the model has been for this specific stock recently.

##  Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

##  License

This project is licensed under the MIT License.
