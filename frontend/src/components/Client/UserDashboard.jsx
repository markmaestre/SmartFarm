import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { logout, editProfile } from '../../redux/slices/authSlice';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const UserDashboard = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { user, loading: authLoading } = useSelector(state => state.auth);

  const [showModal, setShowModal] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState(null);
  const [drawerAnimation] = useState(new Animated.Value(-width * 0.85));
  const [cardAnimations] = useState([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    address: user?.address || '',
    gender: user?.gender || '',
    bod: user?.bod ? user.bod.split('T')[0] : '',
    profile: user?.profile || null,
  });

  useEffect(() => {
    if (!user || user.role !== 'user') {
      navigation.replace('Login');
    }
  }, [user, navigation]);

  useEffect(() => {
    getCurrentLocation();
    animateCards();
    
    // Update date and time every second
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        address: user.address || '',
        gender: user.gender || '',
        bod: user.bod ? user.bod.split('T')[0] : '',
        profile: user.profile || null,
      });
    }
  }, [user]);

  const animateCards = () => {
    const animations = cardAnimations.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 600,
        delay: index * 100,
        useNativeDriver: true,
      })
    );
    Animated.stagger(100, animations).start();
  };

  const getCurrentLocation = async () => {
    setLoading(true);
    setLocationError(null);

    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Location permission denied');
        // Default to Manila coordinates
        await fetchWeatherByCoordinates(14.5995, 120.9842, 'Manila, Philippines');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      
      // Get location name using reverse geocoding
      try {
        const locationName = await getLocationName(latitude, longitude);
        await fetchWeatherByCoordinates(latitude, longitude, locationName);
      } catch (error) {
        await fetchWeatherByCoordinates(latitude, longitude, 'Your Location');
      }
    } catch (error) {
      console.error('Error getting location:', error);
      setLocationError('Unable to get location');
      // Default to Manila coordinates
      await fetchWeatherByCoordinates(14.5995, 120.9842, 'Manila, Philippines');
    } finally {
      setLoading(false);
    }
  };

  const getLocationName = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      );
      const data = await response.json();
      return data.city || data.locality || data.principalSubdivision || 'Unknown Location';
    } catch (error) {
      console.error('Error getting location name:', error);
      return 'Your Location';
    }
  };

  const fetchWeatherByCoordinates = async (lat, lon, locationName = 'Your Location') => {
    try {
      // Open-Meteo API call
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`
      );
      const data = await response.json();
      
      if (data.current) {
        const weatherData = {
          temperature: Math.round(data.current.temperature_2m),
          humidity: data.current.relative_humidity_2m,
          windSpeed: Math.round(data.current.wind_speed_10m * 3.6), // Convert m/s to km/h
          weatherCode: data.current.weather_code,
          locationName: locationName,
          description: getWeatherDescription(data.current.weather_code),
        };
        setWeather(weatherData);
      } else {
        throw new Error('Invalid weather data');
      }
    } catch (error) {
      console.error('Error fetching weather:', error);
      setLocationError('Unable to fetch weather data');
    }
  };

  // WMO Weather interpretation codes to descriptions
  const getWeatherDescription = (code) => {
    const weatherCodes = {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Foggy',
      48: 'Depositing rime fog',
      51: 'Light drizzle',
      53: 'Moderate drizzle',
      55: 'Dense drizzle',
      56: 'Light freezing drizzle',
      57: 'Dense freezing drizzle',
      61: 'Slight rain',
      63: 'Moderate rain',
      65: 'Heavy rain',
      66: 'Light freezing rain',
      67: 'Heavy freezing rain',
      71: 'Slight snow fall',
      73: 'Moderate snow fall',
      75: 'Heavy snow fall',
      77: 'Snow grains',
      80: 'Slight rain showers',
      81: 'Moderate rain showers',
      82: 'Violent rain showers',
      85: 'Slight snow showers',
      86: 'Heavy snow showers',
      95: 'Thunderstorm',
      96: 'Thunderstorm with slight hail',
      99: 'Thunderstorm with heavy hail'
    };
    
    return weatherCodes[code] || 'Unknown weather';
  };

  const getWeatherIcon = (code) => {
    if (code === 0 || code === 1) return 'sunny';
    if (code === 2 || code === 3) return 'partly-sunny';
    if (code >= 51 && code <= 67) return 'rainy';
    if (code >= 71 && code <= 86) return 'snow';
    if (code >= 95) return 'thunderstorm';
    return 'cloud';
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of your farming dashboard?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            dispatch(logout());
            navigation.replace('Login');
          },
        },
      ]
    );
  };

  const handleEditProfile = () => {
    setShowModal(true);
    closeDrawer();
  };

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleImagePicker = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera roll permissions to update your profile picture.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setFormData({ ...formData, profile: result.assets[0].uri });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const handleSubmit = async () => {
    try {
      const profileData = {
        username: formData.username,
        email: formData.email,
        address: formData.address,
        gender: formData.gender,
        bod: formData.bod,
        profile: formData.profile,
      };

      await dispatch(editProfile(profileData)).unwrap();
      Alert.alert('Success', 'Your profile has been updated successfully!');
      setShowModal(false);
    } catch (error) {
      Alert.alert('Error', error || 'Failed to update profile');
    }
  };

  const openDrawer = () => {
    setShowDrawer(true);
    Animated.timing(drawerAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeDrawer = () => {
    Animated.timing(drawerAnimation, {
      toValue: -width * 0.85,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowDrawer(false);
    });
  };

  const navItems = [
    { icon: 'cloud', label: 'Weather', route: 'Weather', color: '#FF8F00', bgColor: '#FFF3E0' },
    { icon: 'bar-chart', label: 'Prediction', route: 'Predict', color: '#FF8F00', bgColor: '#FFF3E0' },
    { icon: 'storefront', label: 'Market Connect', route: 'MarketLink', color: '#1976D2', bgColor: '#E3F2FD' },
    { icon: 'book', label: 'Farm Records', route: 'FarmDiary', color: '#7B1FA2', bgColor: '#F3E5F5' },
    { icon: 'school', label: 'Agricultural Learning', route: 'Elearning', color: '#D32F2F', bgColor: '#FFEBEE' },
    { icon: 'chatbubbles-outline', label: 'Farm Assistant', route: 'Chatbot', color: '#F57C00', bgColor: '#FFF8E1' },
    
  ];

  const drawerItems = [
    { icon: 'home-outline', label: 'Farm Dashboard', action: () => navigation.navigate('UserDashboard') },
    { icon: 'bar-chart-outline', label: 'Crop Intelligence', action: () => navigation.navigate('Weather') },
    { icon: 'storefront-outline', label: 'Market Connect', action: () => navigation.navigate('MarketLink') },
    { icon: 'book-outline', label: 'Farm Records', action: () => navigation.navigate('FarmDiary') },
    { icon: 'school-outline', label: 'Agricultural Learning', action: () => navigation.navigate('Elearning') },
    { icon: 'chatbubbles-outline', label: 'Farm Assistant', action: () => navigation.navigate('Chatbot') },
    { icon: 'person-circle-outline', label: 'Profile Settings', action: handleEditProfile },
    { icon: 'log-out-outline', label: 'Sign Out', action: handleLogout, isLogout: true },
  ];

  if (!user || user.role !== 'user') return null;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2E7D32" />
      
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#2E7D32', '#4CAF50', '#66BB6A']}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={openDrawer} style={styles.menuButton}>
            <Ionicons name="menu" size={26} color="#fff" />
          </TouchableOpacity>
          
          <View style={styles.userInfo}>
            <View style={styles.profileSection}>
              {user.profile ? (
                <Image source={{ uri: user.profile }} style={styles.profileImage} />
              ) : (
                <View style={styles.defaultAvatar}>
                  <Ionicons name="person" size={32} color="#fff" />
                </View>
              )}
              <View style={styles.profileBadge}>
                <Ionicons name="leaf" size={12} color="#4CAF50" />
              </View>
            </View>
            
            <View style={styles.userDetails}>
              <Text style={styles.welcomeText}>Welcome back,</Text>
              <Text style={styles.username}>{user.username}</Text>
              <Text style={styles.userRole}>Agricultural Professional</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Date and Time Section */}
        <View style={styles.dateTimeSection}>
          <Text style={styles.currentDate}>{formatDate(currentDateTime)}</Text>
          <Text style={styles.currentTime}>{formatTime(currentDateTime)}</Text>
        </View>

        {/* Weather Card */}
        <View style={styles.weatherSection}>
          <LinearGradient
            colors={['#1976D2', '#42A5F5']}
            style={styles.weatherCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.weatherHeader}>
              <View>
                <Text style={styles.weatherTitle}>Field Conditions</Text>
                <Text style={styles.weatherLocation}>
                  <Ionicons name="location" size={14} color="rgba(255,255,255,0.8)" />
                  {weather ? ` ${weather.locationName}` : ' Loading...'}
                </Text>
              </View>
              <TouchableOpacity onPress={getCurrentLocation} style={styles.refreshButton}>
                <Ionicons name="refresh" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            {locationError && (
              <Text style={styles.weatherError}>{locationError}</Text>
            )}

            {loading ? (
              <View style={styles.weatherLoading}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.loadingText}>Getting weather data...</Text>
              </View>
            ) : weather ? (
              <View style={styles.weatherContent}>
                <View style={styles.weatherMain}>
                  <Ionicons 
                    name={getWeatherIcon(weather.weatherCode)} 
                    size={48} 
                    color="#fff" 
                  />
                  <Text style={styles.temperature}>{weather.temperature}°C</Text>
                </View>
                
                <Text style={styles.weatherDesc}>{weather.description}</Text>
                
                <View style={styles.weatherDetails}>
                  <View style={styles.weatherDetailItem}>
                    <Ionicons name="water" size={16} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.weatherDetailText}>Humidity</Text>
                    <Text style={styles.weatherDetailValue}>{weather.humidity}%</Text>
                  </View>
                  <View style={styles.weatherDetailItem}>
                    <Ionicons name="leaf" size={16} color="rgba(255,255,255,0.8)" />
                    <Text style={styles.weatherDetailText}>Wind Speed</Text>
                    <Text style={styles.weatherDetailValue}>{weather.windSpeed} km/h</Text>
                  </View>
                </View>
              </View>
            ) : (
              <Text style={styles.weatherError}>Unable to load weather data</Text>
            )}
          </LinearGradient>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Farm Management Tools</Text>
            <Text style={styles.sectionSubtitle}>Access your agricultural resources</Text>
          </View>
          
          <View style={styles.actionGrid}>
            {navItems.map((item, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.actionCardWrapper,
                  {
                    opacity: cardAnimations[index],
                    transform: [{
                      translateY: cardAnimations[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [50, 0],
                      }),
                    }],
                  },
                ]}
              >
                <TouchableOpacity
                  style={[styles.actionCard, { backgroundColor: item.bgColor }]}
                  onPress={() => navigation.navigate(item.route)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.iconContainer, { backgroundColor: item.color }]}>
                    <Ionicons name={item.icon} size={24} color="#fff" />
                  </View>
                  <Text style={styles.actionLabel}>{item.label}</Text>
                  <Ionicons name="chevron-forward" size={16} color="#666" />
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        </View>

        {/* Farm Stats - Now using real user data */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Farm Overview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="leaf" size={24} color="#4CAF50" />
              <Text style={styles.statValue}>{user.cropCount || '0'}</Text>
              <Text style={styles.statLabel}>Active Crops</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="calendar" size={24} color="#FF9800" />
              <Text style={styles.statValue}>{user.harvestDue || '0'}</Text>
              <Text style={styles.statLabel}>Harvest Due</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="trending-up" size={24} color="#2196F3" />
              <Text style={styles.statValue}>{user.yieldEfficiency || '0%'}</Text>
              <Text style={styles.statLabel}>Yield Efficiency</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Enhanced Drawer */}
      {showDrawer && (
        <>
          <TouchableOpacity 
            style={styles.overlay} 
            onPress={closeDrawer} 
            activeOpacity={1} 
          />
          <Animated.View 
            style={[
              styles.drawer,
              { transform: [{ translateX: drawerAnimation }] }
            ]}
          >
            <LinearGradient
              colors={['#2E7D32', '#4CAF50']}
              style={styles.drawerHeaderGradient}
            >
              <View style={styles.drawerHeader}>
                {user.profile ? (
                  <Image source={{ uri: user.profile }} style={styles.drawerProfileImage} />
                ) : (
                  <View style={styles.drawerDefaultAvatar}>
                    <Ionicons name="person" size={40} color="#fff" />
                  </View>
                )}
                <Text style={styles.drawerUsername}>{user.username}</Text>
                <Text style={styles.drawerEmail}>{user.email}</Text>
                <View style={styles.drawerBadge}>
                  <Ionicons name="shield-checkmark" size={12} color="#4CAF50" />
                  <Text style={styles.drawerBadgeText}>Verified Farmer</Text>
                </View>
              </View>
            </LinearGradient>

            <ScrollView style={styles.drawerContent}>
              {drawerItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.drawerItem}
                  onPress={() => {
                    closeDrawer();
                    setTimeout(() => item.action(), 300);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.drawerIconContainer, item.isLogout && styles.logoutIconContainer]}>
                    <Ionicons 
                      name={item.icon} 
                      size={20} 
                      color={item.isLogout ? '#f44336' : '#666'} 
                    />
                  </View>
                  <Text style={[
                    styles.drawerItemText,
                    item.isLogout && styles.logoutText
                  ]}>
                    {item.label}
                  </Text>
                  <Ionicons 
                    name="chevron-forward" 
                    size={16} 
                    color={item.isLogout ? '#f44336' : '#ccc'} 
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Animated.View>
        </>
      )}

      {/* Enhanced Edit Profile Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
        presentationStyle="formSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <LinearGradient
            colors={['#2E7D32', '#4CAF50']}
            style={styles.modalHeaderGradient}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Profile Settings</Text>
              <TouchableOpacity onPress={() => setShowModal(false)} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </LinearGradient>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Profile Image Section */}
            <View style={styles.imageSection}>
              <TouchableOpacity onPress={handleImagePicker} style={styles.imageContainer}>
                {formData.profile ? (
                  <Image source={{ uri: formData.profile }} style={styles.modalProfileImage} />
                ) : (
                  <View style={styles.modalDefaultAvatar}>
                    <Ionicons name="person" size={40} color="#4CAF50" />
                  </View>
                )}
                <View style={styles.cameraButton}>
                  <Ionicons name="camera" size={16} color="#fff" />
                </View>
              </TouchableOpacity>
              <Text style={styles.changePhotoText}>Tap to update profile photo</Text>
            </View>

            {/* Form Fields */}
            <View style={styles.formSection}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  <Ionicons name="person-outline" size={16} color="#666" /> Full Name
                </Text>
                <TextInput
                  style={styles.input}
                  value={formData.username}
                  onChangeText={(value) => handleChange('username', value)}
                  placeholder="Enter your full name"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  <Ionicons name="mail-outline" size={16} color="#666" /> Email Address
                </Text>
                <TextInput
                  style={styles.input}
                  value={formData.email}
                  onChangeText={(value) => handleChange('email', value)}
                  placeholder="Enter your email address"
                  keyboardType="email-address"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  <Ionicons name="location-outline" size={16} color="#666" /> Farm Address
                </Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.address}
                  onChangeText={(value) => handleChange('address', value)}
                  placeholder="Enter your farm location"
                  multiline
                  numberOfLines={3}
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  <Ionicons name="calendar-outline" size={16} color="#666" /> Date of Birth
                </Text>
                <TextInput
                  style={styles.input}
                  value={formData.bod}
                  onChangeText={(value) => handleChange('bod', value)}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#999"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  <Ionicons name="person-outline" size={16} color="#666" /> Gender
                </Text>
                <View style={styles.genderButtons}>
                  {['Male', 'Female', 'Other'].map((gender) => (
                    <TouchableOpacity
                      key={gender}
                      style={[
                        styles.genderButton,
                        formData.gender === gender && styles.genderButtonActive
                      ]}
                      onPress={() => handleChange('gender', gender)}
                    >
                      <Text style={[
                        styles.genderButtonText,
                        formData.gender === gender && styles.genderButtonTextActive
                      ]}>
                        {gender}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                onPress={handleSubmit} 
                style={[styles.saveButton, authLoading && styles.disabledButton]}
                disabled={authLoading}
              >
                <LinearGradient
                  colors={['#2E7D32', '#4CAF50']}
                  style={styles.saveButtonGradient}
                >
                  {authLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <>
                      <Ionicons name="checkmark" size={20} color="#fff" />
                      <Text style={styles.saveButtonText}>Save Changes</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={() => setShowModal(false)} style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerGradient: {
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  menuButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 15,
  },
  profileSection: {
    position: 'relative',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: '#fff',
  },
  defaultAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  profileBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#fff',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userDetails: {
    marginLeft: 12,
    flex: 1,
  },
  welcomeText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '400',
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 1,
  },
  userRole: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    fontStyle: 'italic',
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 15,
  },
  dateTimeSection: {
    marginBottom: 15,
    alignItems: 'center',
  },
  currentDate: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  currentTime: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginTop: 5,
  },
  weatherSection: {
    marginBottom: 20,
  },
  weatherCard: {
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  weatherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  weatherTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  weatherLocation: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 3,
  },
  refreshButton: {
    padding: 5,
  },
  weatherError: {
    color: '#ffebee',
    textAlign: 'center',
    marginVertical: 10,
  },
  weatherLoading: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
  },
  weatherContent: {
    alignItems: 'center',
  },
  weatherMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  temperature: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10,
  },
  weatherDesc: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 15,
  },
  weatherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
  },
  weatherDetailItem: {
    alignItems: 'center',
  },
  weatherDetailText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5,
  },
  weatherDetailValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 3,
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 3,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCardWrapper: {
    width: '48%',
    marginBottom: 15,
  },
  actionCard: {
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '30%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 10,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: width * 0.85,
    backgroundColor: '#fff',
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  drawerHeaderGradient: {
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  drawerHeader: {
    alignItems: 'center',
  },
  drawerProfileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#fff',
  },
  drawerDefaultAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  drawerUsername: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
  },
  drawerEmail: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 5,
  },
  drawerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingVertical: 3,
    paddingHorizontal: 10,
    marginTop: 10,
  },
  drawerBadgeText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
    marginLeft: 5,
  },
  drawerContent: {
    flex: 1,
    paddingTop: 15,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  drawerIconContainer: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  logoutIconContainer: {
    backgroundColor: 'rgba(244,67,54,0.1)',
  },
  drawerItemText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  logoutText: {
    color: '#f44336',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeaderGradient: {
    paddingTop: 10,
    paddingBottom: 15,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    padding: 5,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  imageSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  imageContainer: {
    position: 'relative',
  },
  modalProfileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#4CAF50',
  },
  modalDefaultAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#4CAF50',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#4CAF50',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changePhotoText: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
  },
  formSection: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  genderButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  genderButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    marginHorizontal: 3,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  genderButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  genderButtonText: {
    color: '#666',
    fontWeight: '500',
  },
  genderButtonTextActive: {
    color: '#fff',
  },
  modalButtons: {
    marginTop: 20,
    marginBottom: 30,
  },
  saveButton: {
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 15,
  },
  saveButtonGradient: {
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  disabledButton: {
    opacity: 0.7,
  },
  cancelButton: {
    padding: 15,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default UserDashboard;