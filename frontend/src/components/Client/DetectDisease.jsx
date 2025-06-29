import React, { useState } from 'react';
import { View, Text, Button, Image, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

const DiseaseDetect = () => {
  const [image, setImage] = useState(null);
  const [prediction, setPrediction] = useState('');
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      base64: false,
      quality: 1,
    });

    if (!result.cancelled) {
      setImage(result.uri);
    }
  };

  const uploadImage = async () => {
    if (!image) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('image', {
      uri: image,
      name: 'photo.jpg',
      type: 'image/jpeg',
    });

    try {
      const res = await axios.post('http://192.168.1.44:5000/predict', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setPrediction(res.data.prediction);
    } catch (err) {
      alert("Prediction failed: " + err.message);
    }

    setLoading(false);
  };

  return (
    <View style={{ padding: 20 }}>
      <Button title="Pick an Image" onPress={pickImage} />
      {image && <Image source={{ uri: image }} style={{ width: 200, height: 200, marginVertical: 10 }} />}
      <Button title="Detect Disease" onPress={uploadImage} />
      {loading && <ActivityIndicator size="large" />}
      {prediction !== '' && <Text style={{ marginTop: 10, fontSize: 18 }}>Prediction: {prediction}</Text>}
    </View>
  );
};

export default DiseaseDetect;
