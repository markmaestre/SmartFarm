import pandas as pd
from sklearn.ensemble import RandomForestRegressor
import joblib


data = {
    'rainfall': [100, 150, 200, 250],
    'temperature': [25, 28, 30, 32],
    'soil_type': [1, 2, 1, 2],  
    'crop': [0, 1, 0, 1],       
    'days_until_harvest': [90, 120, 85, 130]
}

df = pd.DataFrame(data)

X = df[['rainfall', 'temperature', 'soil_type', 'crop']]
y = df['days_until_harvest']

model = RandomForestRegressor()
model.fit(X, y)

joblib.dump(model, './model/harvest_predictor.pkl')
print("Model saved!")
