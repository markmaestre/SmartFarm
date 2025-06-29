import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import * as Location from 'expo-location';
import { Picker } from '@react-native-picker/picker';
import axiosInstance from '../../Utils/axiosInstance';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const Predict = () => {
  const [locationName, setLocationName] = useState(null);
  const [loading, setLoading] = useState(true);
  const [predicting, setPredicting] = useState(false);

  const [soilType, setSoilType] = useState('');
  const [crop, setCrop] = useState('');
  const [prediction, setPrediction] = useState(null);

  const [rainfall, setRainfall] = useState(null);
  const [temperature, setTemperature] = useState(null);

  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  const scaleAnim = useState(new Animated.Value(0.9))[0];
  const resultAnim = useState(new Animated.Value(0))[0];
  const pulseAnim = useState(new Animated.Value(1))[0];

  // Soil type data with colors and icons
  const soilTypes = [
    { label: 'Loamy Soil', value: '1', color: '#8B4513', icon: 'leaf-outline' },
    { label: 'Clay Soil', value: '2', color: '#CD853F', icon: 'water-outline' },
    { label: 'Sandy Soil', value: '3', color: '#F4A460', icon: 'sunny-outline' },
    { label: 'Silty Soil', value: '4', color: '#A0522D', icon: 'flower-outline' },
    { label: 'Peaty Soil', value: '5', color: '#654321', icon: 'leaf' },
    { label: 'Saline Soil', value: '6', color: '#708090', icon: 'water' },
  ];

  const crops = [
    { label: 'Rice', value: '0', color: '#FFD700', icon: 'nutrition-outline' },
    { label: 'Corn', value: '1', color: '#FFA500', icon: 'flower' },
    { label: 'Tomato', value: '2', color: '#FF6347', icon: 'cafe-outline' },
    { label: 'Onion', value: '3', color: '#DDA0DD', icon: 'ellipse-outline' },
    { label: 'Potato', value: '4', color: '#D2691E', icon: 'nutrition' },
  ];

  useEffect(() => {
    // Start entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for loading
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Location permission is required.');
          return;
        }

        const loc = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = loc.coords;

        // Reverse geocode
        const place = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        if (place.length > 0) {
          const { city, region, country } = place[0];
          setLocationName(`${city || region}, ${country}`);
        }

        // Fetch weather
        const weatherRes = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,precipitation`
        );
        const data = await weatherRes.json();
        const temp = data.current.temperature_2m;
        const rain = data.current.precipitation;

        setTemperature(temp);
        setRainfall(rain);
      } catch (err) {
        console.error('Weather error:', err);
        Alert.alert('Error', 'Failed to fetch weather data.');
      } finally {
        setLoading(false);
        pulseAnimation.stop();
      }
    })();
  }, []);

  const handlePredict = async () => {
    if (!soilType || !crop) {
      Alert.alert('Incomplete Input', 'Please select soil type and crop.');
      return;
    }

    setPredicting(true);
    
    // Reset result animation
    resultAnim.setValue(0);

    try {
      const response = await axiosInstance.post('/predict', {
        rainfall: parseFloat(rainfall),
        temperature: parseFloat(temperature),
        soil_type: parseInt(soilType),
        crop: parseInt(crop),
      });

      setPrediction(response.data.predicted_days_until_harvest);
    
      Animated.spring(resultAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();

      Alert.alert(
        'Prediction Complete! 🎉',
        `Best to harvest in ${response.data.predicted_days_until_harvest} days.`
      );
    } catch (err) {
      console.error('Prediction error:', err.message);
      Alert.alert('Error', 'Failed to predict. Please check your input values.');
    } finally {
      setPredicting(false);
    }
  };

  const WeatherCard = ({ icon, title, value, unit, color }) => (
    <Animated.View style={[
      styles.weatherCard,
      {
        transform: [{ scale: scaleAnim }],
        opacity: fadeAnim,
      }
    ]}>
      <LinearGradient
        colors={[color, `${color}80`]}
        style={styles.weatherGradient}
      >
        <Ionicons name={icon} size={24} color="white" />
        <Text style={styles.weatherTitle}>{title}</Text>
        <Text style={styles.weatherValue}>
          {value ?? 'N/A'} {unit}
        </Text>
      </LinearGradient>
    </Animated.View>
  );

  const CustomPicker = ({ data, selectedValue, onValueChange, placeholder, type }) => (
    <View style={styles.pickerContainer}>
      <Text style={styles.pickerLabel}>{placeholder}</Text>
      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={selectedValue}
          onValueChange={onValueChange}
          style={styles.picker}
        >
          <Picker.Item label={`Select ${type}`} value="" />
          {data.map((item) => (
            <Picker.Item 
              key={item.value} 
              label={item.label} 
              value={item.value}
              color={item.color}
            />
          ))}
        </Picker>
        <View style={styles.pickerIcon}>
          <Ionicons name="chevron-down" size={20} color="#666" />
        </View>
      </View>
      {selectedValue && (
        <View style={styles.selectedItem}>
          <Ionicons 
            name={data.find(item => item.value === selectedValue)?.icon} 
            size={16} 
            color={data.find(item => item.value === selectedValue)?.color} 
          />
          <Text style={styles.selectedText}>
            {data.find(item => item.value === selectedValue)?.label}
          </Text>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <LinearGradient colors={['#4CAF50', '#45a049']} style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" />
        <Animated.View style={[
          styles.loadingContent,
          { transform: [{ scale: pulseAnim }] }
        ]}>
          <ActivityIndicator size="large" color="white" />
          <Text style={styles.loadingText}>🌍 Fetching weather and location data...</Text>
          <Text style={styles.loadingSubtext}>Preparing your harvest prediction</Text>
        </Animated.View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#E8F5E8', '#F0F8FF']} style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <Animated.View style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }
        ]}>
          <Text style={styles.title}>🌾 Harvest Prediction</Text>
          <Text style={styles.subtitle}>AI-Powered Agriculture Assistant</Text>
          
          {locationName && (
            <View style={styles.locationContainer}>
              <Ionicons name="location" size={16} color="#4CAF50" />
              <Text style={styles.location}>{locationName}</Text>
            </View>
          )}
        </Animated.View>

        <View style={styles.weatherContainer}>
          <WeatherCard
            icon="rainy"
            title="Rainfall"
            value={rainfall}
            unit="mm"
            color="#4A90E2"
          />
          <WeatherCard
            icon="thermometer"
            title="Temperature"
            value={temperature}
            unit="°C"
            color="#FF6B6B"
          />
        </View>

        <Animated.View style={[
          styles.inputSection,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }
        ]}>
          <CustomPicker
            data={soilTypes}
            selectedValue={soilType}
            onValueChange={setSoilType}
            placeholder="🌱 Soil Type"
            type="Soil"
          />

          <CustomPicker
            data={crops}
            selectedValue={crop}
            onValueChange={setCrop}
            placeholder="🌾 Crop Type"
            type="Crop"
          />
        </Animated.View>

        <Animated.View style={[
          styles.buttonContainer,
          { opacity: fadeAnim }
        ]}>
          <TouchableOpacity
            style={[
              styles.predictButton,
              (!soilType || !crop) && styles.predictButtonDisabled
            ]}
            onPress={handlePredict}
            disabled={!soilType || !crop || predicting}
          >
            <LinearGradient
              colors={(!soilType || !crop) ? ['#ccc', '#aaa'] : ['#4CAF50', '#45a049']}
              style={styles.buttonGradient}
            >
              {predicting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Ionicons name="analytics" size={20} color="white" />
              )}
              <Text style={styles.buttonText}>
                {predicting ? 'Predicting...' : 'Predict Harvest'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {prediction !== null && (
          <Animated.View style={[
            styles.resultContainer,
            {
              opacity: resultAnim,
              transform: [{ scale: resultAnim }],
            }
          ]}>
            <LinearGradient
              colors={['#4CAF50', '#45a049']}
              style={styles.resultGradient}
            >
              <Ionicons name="calendar" size={32} color="white" />
              <Text style={styles.resultTitle}>Prediction Result</Text>
              <Text style={styles.resultValue}>{prediction} Days</Text>
              <Text style={styles.resultSubtext}>Until Optimal Harvest</Text>
              <View style={styles.resultBadge}>
                <Text style={styles.badgeText}>AI Predicted</Text>
              </View>
            </LinearGradient>
          </Animated.View>
        )}
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
    marginTop: 20,
    fontWeight: '600',
  },
  loadingSubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 8,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  location: {
    fontSize: 14,
    color: '#4CAF50',
    marginLeft: 5,
    fontWeight: '500',
  },
  weatherContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  weatherCard: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  weatherGradient: {
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  weatherTitle: {
    color: 'white',
    fontSize: 12,
    marginTop: 5,
    fontWeight: '500',
  },
  weatherValue: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 5,
  },
  inputSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  pickerContainer: {
    marginBottom: 20,
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  pickerWrapper: {
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    position: 'relative',
  },
  picker: {
    height: 50,
  },
  pickerIcon: {
    position: 'absolute',
    right: 15,
    top: 15,
    pointerEvents: 'none',
  },
  selectedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 10,
  },
  selectedText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  predictButton: {
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  predictButtonDisabled: {
    elevation: 1,
    shadowOpacity: 0.1,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  resultContainer: {
    marginHorizontal: 20,
    marginBottom: 30,
    borderRadius: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  resultGradient: {
    padding: 25,
    borderRadius: 20,
    alignItems: 'center',
  },
  resultTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 10,
  },
  resultValue: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
    marginTop: 10,
  },
  resultSubtext: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    marginTop: 5,
  },
  resultBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 15,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
});

export default Predict;