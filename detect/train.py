import os
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv2D, MaxPooling2D, Flatten, Dense, Dropout
from tensorflow.keras.optimizers import Adam
import json

train_path = "dataset/train"
val_path = "dataset/val"

train_gen = ImageDataGenerator(rescale=1.0/255)
val_gen = ImageDataGenerator(rescale=1.0/255)

train_data = train_gen.flow_from_directory(train_path, target_size=(128, 128), class_mode='categorical')
val_data = val_gen.flow_from_directory(val_path, target_size=(128, 128), class_mode='categorical')

class_names = list(train_data.class_indices.keys())
os.makedirs("model", exist_ok=True)
with open("model/class_names.json", "w") as f:
    json.dump(class_names, f)

model = Sequential([
    Conv2D(32, (3, 3), activation='relu', input_shape=(128, 128, 3)),
    MaxPooling2D(2, 2),
    Conv2D(64, (3, 3), activation='relu'),
    MaxPooling2D(2, 2),
    Flatten(),
    Dense(128, activation='relu'),
    Dropout(0.5),
    Dense(len(class_names), activation='softmax')
])

model.compile(optimizer=Adam(), loss='categorical_crossentropy', metrics=['accuracy'])

model.fit(train_data, epochs=10, validation_data=val_data)

model.save("model/crop_disease_model.h5")
print("Model trained and saved.")
