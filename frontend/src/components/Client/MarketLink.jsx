import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  Button,
  Alert,
  TextInput,
  SafeAreaView,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchMarketPosts,
  deleteMarketPost,
  createMarketPost,
  updateMarketPost,
  fetchMarketPostById,
  clearSelectedPost,
} from '../../redux/slices/marketSlice';
import * as ImagePicker from 'expo-image-picker';

const MarketLink = () => {
  const dispatch = useDispatch();
  const { posts, loading, error, selectedPost } = useSelector((state) => state.market);
  const { user, token } = useSelector((state) => state.auth);

  const [form, setForm] = useState({
    productName: '',
    description: '',
    price: '',
    location: '',
    availableQuantity: '',
    contactNumber: '',
  });

  const [image, setImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPostId, setCurrentPostId] = useState(null);

  // Refs for input fields
  const productNameRef = useRef();
  const descriptionRef = useRef();
  const priceRef = useRef();
  const locationRef = useRef();
  const quantityRef = useRef();
  const contactRef = useRef();

  useEffect(() => {
    dispatch(fetchMarketPosts());
  }, [dispatch]);

  useEffect(() => {
    if (selectedPost) {
      setForm({
        productName: selectedPost.productName,
        description: selectedPost.description,
        price: selectedPost.price,
        location: selectedPost.location,
        availableQuantity: selectedPost.availableQuantity,
        contactNumber: selectedPost.contactNumber,
      });
      setCurrentPostId(selectedPost._id);
      setIsEditing(true);
    }
  }, [selectedPost]);

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const handleSubmit = async () => {
    if (!form.productName || !form.description || !form.price) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const formData = new FormData();
    formData.append('productName', form.productName);
    formData.append('description', form.description);
    formData.append('price', form.price);
    formData.append('location', form.location);
    formData.append('availableQuantity', form.availableQuantity);
    formData.append('contactNumber', form.contactNumber);

    if (image) {
      formData.append('image', {
        uri: image.uri,
        name: 'market.jpg',
        type: 'image/jpeg',
      });
    }

    try {
      if (isEditing && currentPostId) {
        await dispatch(updateMarketPost({ 
          id: currentPostId, 
          formData, 
          token 
        })).unwrap();
        Alert.alert('Success', 'Post updated successfully');
      } else {
        await dispatch(createMarketPost({ formData, token })).unwrap();
        Alert.alert('Success', 'Post created successfully');
      }
      
      resetForm();
      dispatch(fetchMarketPosts());
    } catch (err) {
      Alert.alert('Error', err.message || 'Something went wrong');
    }
  };

  const resetForm = () => {
    setForm({
      productName: '',
      description: '',
      price: '',
      location: '',
      availableQuantity: '',
      contactNumber: '',
    });
    setImage(null);
    setIsEditing(false);
    setCurrentPostId(null);
    dispatch(clearSelectedPost());
    Keyboard.dismiss();
  };

  const handleDelete = (id) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this post?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => dispatch(deleteMarketPost({ id, token })),
      },
    ]);
  };

  const handleEdit = (postId) => {
    dispatch(fetchMarketPostById(postId));
  };

  const renderItem = ({ item }) => {
    const isOwner = item.userId._id === user.id;

    return (
      <View style={styles.card}>
        {item.image && <Image source={{ uri: item.image }} style={styles.image} />}
        <Text style={styles.title}>{item.productName}</Text>
        <Text>{item.description}</Text>
        <Text>Price: ₱{item.price}</Text>
        <Text>Location: {item.location}</Text>
        <Text>Quantity: {item.availableQuantity}</Text>
        <Text>Contact: {item.contactNumber}</Text>

        {isOwner && (
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.button, styles.editButton]}
              onPress={() => handleEdit(item._id)}
            >
              <Text style={styles.buttonText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.deleteButton]}
              onPress={() => handleDelete(item._id)}
            >
              <Text style={styles.buttonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const userPosts = posts.filter((post) => post.userId._id === user.id);

  const renderHeader = () => (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.formContainer}>
        <Text style={styles.header}>
          {isEditing ? '✏️ Edit Market Post' : '🛒 Create New Market Post'}
        </Text>
        
        <TextInput
          ref={productNameRef}
          placeholder="Product Name*"
          style={styles.input}
          value={form.productName}
          onChangeText={(text) => setForm({ ...form, productName: text })}
          returnKeyType="next"
          onSubmitEditing={() => descriptionRef.current.focus()}
          blurOnSubmit={false}
        />
        
        <TextInput
          ref={descriptionRef}
          placeholder="Description*"
          style={styles.input}
          value={form.description}
          onChangeText={(text) => setForm({ ...form, description: text })}
          returnKeyType="next"
          onSubmitEditing={() => priceRef.current.focus()}
          blurOnSubmit={false}
        />
        
        <TextInput
          ref={priceRef}
          placeholder="Price*"
          keyboardType="numeric"
          style={styles.input}
          value={form.price}
          onChangeText={(text) => setForm({ ...form, price: text })}
          returnKeyType="next"
          onSubmitEditing={() => locationRef.current.focus()}
          blurOnSubmit={false}
        />
        
        <TextInput
          ref={locationRef}
          placeholder="Location"
          style={styles.input}
          value={form.location}
          onChangeText={(text) => setForm({ ...form, location: text })}
          returnKeyType="next"
          onSubmitEditing={() => quantityRef.current.focus()}
          blurOnSubmit={false}
        />
        
        <TextInput
          ref={quantityRef}
          placeholder="Quantity"
          style={styles.input}
          value={form.availableQuantity}
          onChangeText={(text) => setForm({ ...form, availableQuantity: text })}
          returnKeyType="next"
          onSubmitEditing={() => contactRef.current.focus()}
          blurOnSubmit={false}
        />
        
        <TextInput
          ref={contactRef}
          placeholder="Contact Number"
          keyboardType="phone-pad"
          style={styles.input}
          value={form.contactNumber}
          onChangeText={(text) => setForm({ ...form, contactNumber: text })}
          returnKeyType="done"
          onSubmitEditing={Keyboard.dismiss}
        />

        <Button title="Pick Image" onPress={handleImagePick} />
        {image && <Image source={{ uri: image.uri }} style={styles.previewImage} />}
        
        <View style={styles.formButtons}>
          {isEditing && (
            <Button title="Cancel" onPress={resetForm} color="#999" />
          )}
          <Button 
            title={isEditing ? "Update Post" : "Submit"} 
            onPress={handleSubmit} 
            color="#2196F3" 
          />
        </View>

        <Text style={styles.header}>📦 Your Posts</Text>
      </View>
    </TouchableWithoutFeedback>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {loading ? (
          <ActivityIndicator size="large" color="#2196F3" />
        ) : error ? (
          <Text style={styles.error}>{error}</Text>
        ) : (
          <FlatList
            data={userPosts}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            ListHeaderComponent={renderHeader}
            contentContainerStyle={{ paddingBottom: 40 }}
            keyboardShouldPersistTaps="handled"
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
  },
  formContainer: {
    padding: 15,
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 15,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
  },
  previewImage: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    marginVertical: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    elevation: 4,
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    marginBottom: 10,
    resizeMode: 'cover',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
  },
  error: {
    textAlign: 'center',
    color: 'red',
    marginTop: 20,
  },
  buttonGroup: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  button: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButton: {
    backgroundColor: '#4CAF50',
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
});

export default MarketLink;