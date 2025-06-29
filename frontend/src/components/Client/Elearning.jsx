import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator, 
  Alert, 
  ScrollView, 
  StyleSheet,
  Dimensions 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

const { width } = Dimensions.get('window');

const DiseaseDetect = () => {
  const [image, setImage] = useState(null);
  const [prediction, setPrediction] = useState('');
  const [confidence, setConfidence] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      base64: false,
      quality: 1,
    });

    if (!result.canceled) {
      const selectedAsset = result.assets[0];
      setImage(selectedAsset.uri);
      setPrediction('');
      setConfidence(null);
    }
  };

  const uploadImage = async () => {
    if (!image) return Alert.alert('Image Required', 'Please select an image first to proceed with disease detection.');

    setLoading(true);

    const formData = new FormData();
    formData.append('image', {
      uri: image,
      name: 'photo.jpg',
      type: 'image/jpeg',
    });

    try {
      const response = await axios.post('http://192.168.1.44:5000/detect', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = response.data;
      setPrediction(data.prediction.replace(/_/g, ' '));
      setConfidence(data.confidence);
    } catch (error) {
      console.error('[UPLOAD ERROR]', error.message);
      Alert.alert('Detection Failed', error?.response?.data?.error || 'Unable to analyze the image. Please try again.');
    }

    setLoading(false);
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return '#4CAF50';
    if (confidence >= 60) return '#FF9800';
    return '#F44336';
  };

  const getConfidenceText = (confidence) => {
    if (confidence >= 80) return 'High Confidence';
    if (confidence >= 60) return 'Medium Confidence';
    return 'Low Confidence';
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>AI Disease Detection</Text>
        <Text style={styles.subtitle}>
          Upload an image to detect potential diseases using advanced AI technology
        </Text>
      </View>

      {/* Image Selection Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Select Image</Text>
        <Text style={styles.cardDescription}>
          Choose a clear, well-lit image for the most accurate results
        </Text>
        
        <TouchableOpacity style={styles.primaryButton} onPress={pickImage}>
          <Text style={styles.primaryButtonText}>📷 Pick Image from Gallery</Text>
        </TouchableOpacity>
      </View>

      {/* Image Preview */}
      {image && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Selected Image</Text>
          <View style={styles.imageContainer}>
            <Image source={{ uri: image }} style={styles.previewImage} />
          </View>
          
          <TouchableOpacity 
            style={[styles.secondaryButton, loading && styles.disabledButton]} 
            onPress={uploadImage}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text style={styles.secondaryButtonText}>🔍 Analyze Image</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Loading State */}
      {loading && (
        <View style={styles.card}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Analyzing image...</Text>
          <Text style={styles.loadingSubtext}>This may take a few moments</Text>
        </View>
      )}

      {/* Results */}
      {prediction !== '' && !loading && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Detection Results</Text>
          
          <View style={styles.resultContainer}>
            <View style={styles.predictionContainer}>
              <Text style={styles.predictionLabel}>Detected Condition:</Text>
              <Text style={styles.predictionText}>{prediction}</Text>
            </View>
            
            <View style={styles.confidenceContainer}>
              <Text style={styles.confidenceLabel}>Confidence Level:</Text>
              <View style={styles.confidenceRow}>
                <View style={[styles.confidenceBar, { backgroundColor: '#E0E0E0' }]}>
                  <View 
                    style={[
                      styles.confidenceProgress, 
                      { 
                        width: `${confidence}%`, 
                        backgroundColor: getConfidenceColor(confidence) 
                      }
                    ]} 
                  />
                </View>
                <Text style={[styles.confidenceValue, { color: getConfidenceColor(confidence) }]}>
                  {confidence}%
                </Text>
              </View>
              <Text style={[styles.confidenceText, { color: getConfidenceColor(confidence) }]}>
                {getConfidenceText(confidence)}
              </Text>
            </View>
          </View>
          
          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerText}>
              ⚠️ This is an AI prediction for informational purposes only. 
              Please consult with a medical professional for proper diagnosis and treatment.
            </Text>
          </View>
        </View>
      )}

      {/* Instructions */}
      <View style={styles.instructionsCard}>
        <Text style={styles.instructionsTitle}>How to Use:</Text>
        <Text style={styles.instructionText}>1. Tap "Pick Image" to select a photo</Text>
        <Text style={styles.instructionText}>2. Choose a clear, well-focused image</Text>
        <Text style={styles.instructionText}>3. Tap "Analyze Image" to get AI predictions</Text>
        <Text style={styles.instructionText}>4. Review results and confidence levels</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 20,
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 15,
  },
  secondaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#bdbdbd',
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 15,
  },
  previewImage: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: 15,
    resizeMode: 'cover',
  },
  loadingText: {
    fontSize: 18,
    color: '#2c3e50',
    textAlign: 'center',
    marginTop: 15,
    fontWeight: '500',
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: 5,
  },
  resultContainer: {
    marginTop: 10,
  },
  predictionContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
  },
  predictionLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  predictionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    textTransform: 'capitalize',
  },
  confidenceContainer: {
    marginBottom: 20,
  },
  confidenceLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 10,
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  confidenceBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  confidenceProgress: {
    height: '100%',
    borderRadius: 4,
  },
  confidenceValue: {
    fontSize: 16,
    fontWeight: '600',
    minWidth: 50,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  disclaimer: {
    backgroundColor: '#fff3cd',
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  disclaimerText: {
    fontSize: 12,
    color: '#856404',
    lineHeight: 18,
  },
  instructionsCard: {
    backgroundColor: '#e3f2fd',
    borderRadius: 15,
    padding: 20,
    marginTop: 10,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1976d2',
    marginBottom: 15,
  },
  instructionText: {
    fontSize: 14,
    color: '#1565c0',
    marginBottom: 8,
    lineHeight: 20,
  },
});

export default DiseaseDetect;