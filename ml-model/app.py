from flask import Flask, request, jsonify
import joblib
import numpy as np
from flask_cors import CORS

model = joblib.load('./model/harvest_predictor.pkl')

app = Flask(__name__)
CORS(app)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    features = np.array([[data['rainfall'], data['temperature'], data['soil_type'], data['crop']]])
    prediction = model.predict(features)
    return jsonify({'predicted_days_until_harvest': int(prediction[0])})

if __name__ == '__main__':
    app.run(port=5000)
