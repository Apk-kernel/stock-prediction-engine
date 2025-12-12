from sklearn.tree import DecisionTreeClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, StackingClassifier, VotingClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, confusion_matrix, classification_report, f1_score, precision_score
import pandas as pd
import numpy as np

# Optional imports for boosting libraries
try:
    from xgboost import XGBClassifier
except ImportError:
    XGBClassifier = None

try:
    from lightgbm import LGBMClassifier
except ImportError:
    LGBMClassifier = None

try:
    from catboost import CatBoostClassifier
except ImportError:
    CatBoostClassifier = None

class StockPredictor:
    def __init__(self, model_type='decision_tree'):
        self.model_type = model_type
        self.features = [
            'MA5', 'MA10', 'MA20', 'MA50',
            'Daily_Return', 'Volatility_5', 
            'Close_to_Open', 'High_to_Low',
            'RSI', 'MACD', 'MACD_Signal', 'MACD_Hist',
            'BB_Upper', 'BB_Lower', 'BB_Position'
        ]
        
        if model_type == 'logistic_regression':
            self.model = LogisticRegression()
        elif model_type == 'random_forest':
            self.model = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)
        elif model_type == 'xgboost':
            if XGBClassifier:
                self.model = XGBClassifier(use_label_encoder=False, eval_metric='logloss', random_state=42)
            else:
                raise ImportError("XGBoost not installed")
        elif model_type == 'lightgbm':
            if LGBMClassifier:
                self.model = LGBMClassifier(random_state=42)
            else:
                raise ImportError("LightGBM not installed")
        elif model_type == 'catboost':
            if CatBoostClassifier:
                self.model = CatBoostClassifier(verbose=0, random_state=42)
            else:
                raise ImportError("CatBoost not installed")
        elif model_type == 'stacking':
            self.model = self._build_stacking_model()
        elif model_type == 'hybrid_model_xg_rf':
            self.model = self._build_hybrid_model()
        else:
            # Default to Decision Tree
            self.model = DecisionTreeClassifier(max_depth=5, random_state=42)

    def _build_hybrid_model(self):
        """
        Combines XGBoost (Accuracy) and Random Forest (F1 Score) using Soft Voting.
        """
        if not XGBClassifier:
            raise ImportError("XGBoost is required for this hybrid model")
            
        estimators = [
            ('xgb', XGBClassifier(use_label_encoder=False, eval_metric='logloss', random_state=42)),
            ('rf', RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42))
        ]
        
        return VotingClassifier(estimators=estimators, voting='soft')
            
    def _build_stacking_model(self):
        estimators = [
            ('rf', RandomForestClassifier(n_estimators=50, random_state=42)),
            ('dt', DecisionTreeClassifier(max_depth=5, random_state=42))
        ]
        
        if XGBClassifier:
            estimators.append(('xgb', XGBClassifier(use_label_encoder=False, eval_metric='logloss', random_state=42, n_estimators=50)))
        if LGBMClassifier:
            estimators.append(('lgbm', LGBMClassifier(random_state=42, n_estimators=50)))
        if CatBoostClassifier:
            estimators.append(('cat', CatBoostClassifier(verbose=0, random_state=42, n_estimators=50)))
            
        # Meta-learner
        final_estimator = LogisticRegression()
        
        return StackingClassifier(estimators=estimators, final_estimator=final_estimator)

    def train(self, df: pd.DataFrame):
        X = df[self.features]
        y = df['Target']
        
        # shuffle=False for time series split
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, shuffle=False)
        
        self.model.fit(X_train, y_train)
        
        predictions = self.model.predict(X_test)
        if hasattr(self.model, "predict_proba"):
            probs = self.model.predict_proba(X_test)[:, 1]
        else:
            probs = predictions

        accuracy = accuracy_score(y_test, predictions)
        f1 = f1_score(y_test, predictions)
        precision = precision_score(y_test, predictions)
        conf_matrix = confusion_matrix(y_test, predictions)
        
        return {
            "accuracy": accuracy,
            "f1_score": f1,
            "precision": precision,
            "confusion_matrix": conf_matrix.tolist(),
            "y_true": y_test.tolist(),
            "y_prob": probs.tolist()
        }
    
    def predict_next(self, current_data: pd.DataFrame) -> int:
        """
        Predicts for the latest available data point provided in DataFrame format.
        Expects the row to have the engineered features.
        """
        X_new = current_data[self.features].iloc[[-1]] 
        return int(self.model.predict(X_new)[0])

    def predict_proba(self, current_data: pd.DataFrame) -> float:
        """
        Returns the probability of the 'UP' class (Target=1).
        """
        X_new = current_data[self.features].iloc[[-1]]
        if hasattr(self.model, "predict_proba"):
            return float(self.model.predict_proba(X_new)[0][1])
        else:
            return float(self.model.predict(X_new)[0])
