from flask import Flask, request, jsonify
from flask_cors import CORS
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
import numpy as np
import json
import imghdr
from PIL import Image
import io

app = Flask(__name__)
CORS(app)

model = load_model("model/crop_disease_model.h5")

# Load class names
with open("model/class_names.json", "r") as f:
    class_names = json.load(f)

@app.route("/detect", methods=["POST"])
def detect():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    file = request.files["image"]

    try:
        print(f"[INFO] Received file: {file.filename}, type: {file.mimetype}")

   
        file_bytes = file.read()
        file.seek(0)  
        image_type = imghdr.what(None, h=file_bytes)

        if image_type not in ['jpeg', 'png', 'bmp', 'webp']:
            return jsonify({"error": f"Unsupported image type: {image_type}"}), 400

       
        img = Image.open(io.BytesIO(file_bytes)).convert("RGB")
        img = img.resize((128, 128))
        img_array = np.array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)

        prediction = model.predict(img_array)
        class_index = int(np.argmax(prediction[0]))
        confidence = float(np.max(prediction[0]))
        result = class_names[class_index]

        return jsonify({
            "prediction": result,
            "confidence": round(confidence * 100, 2)
        })

    except Exception as e:
        print("[ERROR]", str(e))
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
