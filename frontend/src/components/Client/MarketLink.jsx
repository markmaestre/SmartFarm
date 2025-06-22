import React, { useState } from 'react';
import { View, TextInput, Button, Text, Image } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { createMarketPost } from '../../redux/slices/marketSlice';
import * as ImagePicker from 'expo-image-picker';

const MarketPost = () => {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);

  const [form, setForm] = useState({
    productName: '',
    description: '',
    price: '',
    location: '',
    availableQuantity: '',
    contactNumber: '',
  });

  const [image, setImage] = useState(null);

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      base64: false,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value);
    });

    if (image) {
      formData.append('image', {
        uri: image.uri,
        name: 'photo.jpg',
        type: 'image/jpeg',
      });
    }

    dispatch(createMarketPost({ formData, token }));
  };

  return (
    <View>
      <TextInput placeholder="Product Name" onChangeText={(text) => setForm({ ...form, productName: text })} />
      <TextInput placeholder="Description" onChangeText={(text) => setForm({ ...form, description: text })} />
      <TextInput placeholder="Price" keyboardType="numeric" onChangeText={(text) => setForm({ ...form, price: text })} />
      <TextInput placeholder="Location" onChangeText={(text) => setForm({ ...form, location: text })} />
      <TextInput placeholder="Quantity" onChangeText={(text) => setForm({ ...form, availableQuantity: text })} />
      <TextInput placeholder="Contact No." keyboardType="phone-pad" onChangeText={(text) => setForm({ ...form, contactNumber: text })} />

      <Button title="Choose Image" onPress={handleImagePick} />
      {image && <Image source={{ uri: image.uri }} style={{ width: 100, height: 100 }} />}

      <Button title="Submit Post" onPress={handleSubmit} />
    </View>
  );
};

export default MarketPost;
