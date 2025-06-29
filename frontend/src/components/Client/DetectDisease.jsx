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
  Dimensions,
  SafeAreaView,
  StatusBar,
  Animated
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

const { width, height } = Dimensions.get('window');

const DiseaseDetect = () => {
  const [image, setImage] = useState(null);
  const [prediction, setPrediction] = useState('');
  const [confidence, setConfidence] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

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
      
      
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
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
    if (confidence >= 80) return '#10B981';
    if (confidence >= 60) return '#F59E0B';
    return '#EF4444';
  };

  const getConfidenceText = (confidence) => {
    if (confidence >= 80) return 'High Accuracy';
    if (confidence >= 60) return 'Medium Accuracy';
    return 'Low Accuracy';
  };

  const getConfidenceGradient = (confidence) => {
    if (confidence >= 80) return ['#10B981', '#059669'];
    if (confidence >= 60) return ['#F59E0B', '#D97706'];
    return ['#EF4444', '#DC2626'];
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
       
        <View style={styles.headerContainer}>
          <View style={styles.headerGradient}>
            <View style={styles.iconContainer}>
              <Text style={styles.headerIcon}>🔬</Text>
            </View>
            <Text style={styles.title}>AI Disease Detection</Text>
            <Text style={styles.subtitle}>
              Advanced machine learning powered medical image analysis
            </Text>
          </View>
        </View>


        <View style={styles.modernCard}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIconContainer}>
              <Text style={styles.cardIcon}>📷</Text>
            </View>
            <View style={styles.cardHeaderText}>
              <Text style={styles.cardTitle}>Select Medical Image</Text>
              <Text style={styles.cardDescription}>
                Upload a clear, high-quality image for accurate AI analysis
              </Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.glassmorphicButton} onPress={pickImage}>
            <View style={styles.buttonContent}>
              <Text style={styles.buttonIcon}>📸</Text>
              <Text style={styles.buttonText}>Choose from Gallery</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Enhanced Image Preview with Animation */}
        {image && (
          <Animated.View style={[styles.modernCard, { opacity: fadeAnim }]}>
            <View style={styles.cardHeader}>
              <View style={styles.cardIconContainer}>
                <Text style={styles.cardIcon}>🖼️</Text>
              </View>
              <View style={styles.cardHeaderText}>
                <Text style={styles.cardTitle}>Image Preview</Text>
                <Text style={styles.cardDescription}>
                  Ready for AI analysis
                </Text>
              </View>
            </View>
            
            <View style={styles.imagePreviewContainer}>
              <View style={styles.imageFrame}>
                <Image source={{ uri: image }} style={styles.previewImage} />
                <View style={styles.imageOverlay} />
              </View>
            </View>
            
            <TouchableOpacity 
              style={[styles.analyzeButton, loading && styles.disabledButton]} 
              onPress={uploadImage}
              disabled={loading}
            >
              <View style={styles.buttonContent}>
                {loading ? (
                  <>
                    <ActivityIndicator size="small" color="#ffffff" />
                    <Text style={styles.buttonText}>Analyzing...</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.buttonIcon}>🔍</Text>
                    <Text style={styles.buttonText}>Start AI Analysis</Text>
                  </>
                )}
              </View>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Enhanced Loading State */}
        {loading && (
          <View style={styles.loadingCard}>
            <View style={styles.loadingAnimation}>
              <ActivityIndicator size="large" color="#6366F1" />
              <View style={styles.loadingDots}>
                <View style={[styles.dot, styles.dot1]} />
                <View style={[styles.dot, styles.dot2]} />
                <View style={[styles.dot, styles.dot3]} />
              </View>
            </View>
            <Text style={styles.loadingTitle}>AI Processing</Text>
            <Text style={styles.loadingSubtext}>
              Our advanced neural network is analyzing your image...
            </Text>
          </View>
        )}

        {/* Enhanced Results Card */}
        {prediction !== '' && !loading && (
          <View style={styles.resultsCard}>
            <View style={styles.resultsHeader}>
              <View style={styles.resultsIconContainer}>
                <Text style={styles.resultsIcon}>🎯</Text>
              </View>
              <Text style={styles.resultsTitle}>Analysis Complete</Text>
            </View>
            
            {/* Prediction Result */}
            <View style={styles.predictionCard}>
              <Text style={styles.predictionLabel}>Detected Condition</Text>
              <View style={styles.predictionBadge}>
                <Text style={styles.predictionText}>{prediction}</Text>
              </View>
            </View>
     
            <View style={styles.confidenceCard}>
              <Text style={styles.confidenceLabel}>Accuracy</Text>
              
              <View style={styles.confidenceDisplay}>
                <View style={styles.confidenceCircle}>
                  <Text style={[styles.confidencePercentage, { color: getConfidenceColor(confidence) }]}>
                    {confidence}%
                  </Text>
                </View>
                
                <View style={styles.confidenceDetails}>
                  <View style={styles.confidenceBarContainer}>
                    <View style={styles.confidenceTrack}>
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
                  </View>
                  <Text style={[styles.confidenceStatus, { color: getConfidenceColor(confidence) }]}>
                    {getConfidenceText(confidence)}
                  </Text>
                </View>
              </View>
            </View>
            
            {/* Enhanced Disclaimer */}
            <View style={styles.disclaimerCard}>
              <View style={styles.disclaimerHeader}>
                <Text style={styles.disclaimerIcon}>⚠️</Text>
                <Text style={styles.disclaimerTitle}>Medical Disclaimer</Text>
              </View>
              <Text style={styles.disclaimerText}>
                This AI analysis is for informational purposes only and should not replace professional medical advice. 
                Please consult with a qualified healthcare provider for proper diagnosis and treatment.
              </Text>
            </View>
          </View>
        )}

        {/* Enhanced Instructions */}
        <View style={styles.instructionsCard}>
          <View style={styles.instructionsHeader}>
            <Text style={styles.instructionsIcon}>💡</Text>
            <Text style={styles.instructionsTitle}>How It Works</Text>
          </View>
          
          <View style={styles.instructionsList}>
            {[
              { step: '1', icon: '📱', text: 'Select a clear, well-lit medical image' },
              { step: '2', icon: '🤖', text: 'AI analyzes using deep learning models' },
              { step: '3', icon: '📊', text: 'Receive results with Accuracy scores' },
              { step: '4', icon: '👨‍⚕️', text: 'Consult healthcare professionals' }
            ].map((instruction, index) => (
              <View key={index} style={styles.instructionItem}>
                <View style={styles.instructionNumber}>
                  <Text style={styles.instructionNumberText}>{instruction.step}</Text>
                </View>
                <Text style={styles.instructionIcon}>{instruction.icon}</Text>
                <Text style={styles.instructionText}>{instruction.text}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  contentContainer: {
    paddingBottom: 40,
  },
  
  // Enhanced Header
  headerContainer: {
    marginBottom: 30,
  },
  headerGradient: {
    backgroundColor: '#6366F1',
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerIcon: {
    fontSize: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  
  // Modern Cards
  modernCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  cardIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#f3f4f6',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardIcon: {
    fontSize: 24,
  },
  cardHeaderText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  
  // Enhanced Buttons
  glassmorphicButton: {
    backgroundColor: '#6366F1',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  analyzeButton: {
    backgroundColor: '#10B981',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Enhanced Image Preview
  imagePreviewContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  imageFrame: {
    position: 'relative',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  previewImage: {
    width: width * 0.7,
    height: width * 0.7,
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  
  // Enhanced Loading
  loadingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 32,
    marginHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  loadingAnimation: {
    position: 'relative',
    marginBottom: 24,
  },
  loadingDots: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: -20,
    left: '50%',
    marginLeft: -15,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6366F1',
    marginHorizontal: 2,
    opacity: 0.4,
  },
  loadingTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  
  // Enhanced Results
  resultsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  resultsIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: '#dcfce7',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  resultsIcon: {
    fontSize: 24,
  },
  resultsTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1f2937',
  },
  
  predictionCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  predictionLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    fontWeight: '500',
  },
  predictionBadge: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  predictionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    textTransform: 'capitalize',
  },
  
  confidenceCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  confidenceLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    fontWeight: '500',
  },
  confidenceDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confidenceCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  confidencePercentage: {
    fontSize: 18,
    fontWeight: '700',
  },
  confidenceDetails: {
    flex: 1,
  },
  confidenceBarContainer: {
    marginBottom: 8,
  },
  confidenceTrack: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
  },
  confidenceProgress: {
    height: '100%',
    borderRadius: 4,
  },
  confidenceStatus: {
    fontSize: 14,
    fontWeight: '600',
  },
  
  disclaimerCard: {
    backgroundColor: '#fef3c7',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  disclaimerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  disclaimerIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  disclaimerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400e',
  },
  disclaimerText: {
    fontSize: 13,
    color: '#92400e',
    lineHeight: 18,
  },
  
  // Enhanced Instructions
  instructionsCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  instructionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  instructionsIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  instructionsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
  },
  instructionsList: {
    gap: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
  },
  instructionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  instructionNumberText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  instructionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
});

export default DiseaseDetect;