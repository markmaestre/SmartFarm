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
  Dimensions,
  StatusBar,
  Platform,
  SafeAreaView,
  Animated,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { logout, editProfile } from '../../redux/slices/authSlice';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const UserDashboard = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { user, loading: authLoading, error } = useSelector(state => state.auth);

  const [showModal, setShowModal] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [drawerAnimation] = useState(new Animated.Value(-width * 0.8));
  const [overlayAnimation] = useState(new Animated.Value(0));
  
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
  }, []);

  useEffect(() => {
    // Update form data when user changes
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

  const getCurrentLocation = async () => {
    setLoading(true);
    setLocationError(null);

    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Location permission denied. Using default location.');
        await fetchWeatherByCity('Manila,PH');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      setLocation({ lat: latitude, lon: longitude });
      await fetchWeatherByCoordinates(latitude, longitude);
    } catch (error) {
      console.error('Error getting location:', error);
      setLocationError('Unable to get location. Using default location.');
      await fetchWeatherByCity('Manila,PH');
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherByCoordinates = async (lat, lon) => {
    try {
      const API_KEY = '14c7dc684b77a84d37ab9473fb19a1d5';
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
      );
      const data = await response.json();
      setWeather(data);
    } catch (error) {
      console.error('Error fetching weather:', error);
      setLocationError('Unable to fetch weather data');
    }
  };

  const fetchWeatherByCity = async (city) => {
    try {
      const API_KEY = '14c7dc684b77a84d37ab9473fb19a1d5';
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
      );
      const data = await response.json();
      setWeather(data);
    } catch (error) {
      console.error('Error fetching weather:', error);
      setLocationError('Unable to fetch weather data');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
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
        Alert.alert('Permission needed', 'Please grant camera roll permissions to change profile picture.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaType.IMAGE,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setFormData({ ...formData, profile: result.assets[0].uri });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
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
      Alert.alert('Success', 'Profile updated successfully!');
      setShowModal(false);
    } catch (error) {
      Alert.alert('Error', error || 'Failed to update profile');
    }
  };

  const openDrawer = () => {
    setShowDrawer(true);
    Animated.parallel([
      Animated.timing(drawerAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(overlayAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeDrawer = () => {
    Animated.parallel([
      Animated.timing(drawerAnimation, {
        toValue: -width * 0.8,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(overlayAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowDrawer(false);
    });
  };

  const navItems = [
    { icon: 'home', label: 'Dashboard', route: 'UserDashboard', color: '#4CAF50' },
    { icon: 'bar-chart', label: 'Crop Guide Hub', route: 'CropGuide', color: '#FF9800' },
    { icon: 'storefront', label: 'Market Link', route: 'MarketLink', color: '#2196F3' },
    { icon: 'book', label: 'Farm Diary', route: 'FarmDiary', color: '#9C27B0' },
    { icon: 'school', label: 'eLearning', route: 'ELearning', color: '#F44336' },
  ];

  const drawerItems = [
    { icon: 'home-outline', label: 'Dashboard', action: () => navigation.navigate('UserDashboard') },
    { icon: 'bar-chart-outline', label: 'Crop Guide Hub', action: () => navigation.navigate('CropGuide') },
    { icon: 'storefront-outline', label: 'Market Link', action: () => navigation.navigate('MarketLink') },
    { icon: 'book-outline', label: 'Farm Diary', action: () => navigation.navigate('FarmDiary') },
    { icon: 'school-outline', label: 'eLearning', action: () => navigation.navigate('ELearning') },
    { icon: 'person-circle-outline', label: 'Edit Profile', action: handleEditProfile },
    { icon: 'settings-outline', label: 'Settings', action: () => navigation.navigate('Settings') },
    { icon: 'help-circle-outline', label: 'Help & Support', action: () => navigation.navigate('Support') },
    { icon: 'log-out-outline', label: 'Logout', action: handleLogout, isLogout: true },
  ];

  const getWeatherIcon = (weatherMain) => {
    switch (weatherMain?.toLowerCase()) {
      case 'clear':
        return '☀️';
      case 'clouds':
        return '☁️';
      case 'rain':
        return '🌧️';
      case 'thunderstorm':
        return '⛈️';
      case 'snow':
        return '❄️';
      case 'mist':
      case 'haze':
        return '🌫️';
      default:
        return '🌤️';
    }
  };

  const getCurrentDate = () => {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date().toLocaleDateString('en-US', options);
  };

  if (!user || user.role !== 'user') return null;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={openDrawer} style={styles.menuButton}>
              <Ionicons name="menu" size={24} color="#fff" />
            </TouchableOpacity>
            
            <View style={styles.profileSection}>
              <View style={styles.profileImageContainer}>
                {user.profile ? (
                  <Image source={{ uri: user.profile }} style={styles.profileImage} />
                ) : (
                  <View style={styles.defaultAvatar}>
                    <Ionicons name="person" size={30} color="#fff" />
                  </View>
                )}
                <View style={styles.onlineIndicator} />
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.username}>{user.username}</Text>
                <Text style={styles.status}>Online</Text>
              </View>
            </View>
            
            <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={styles.notificationButton}>
              <Ionicons name="notifications-outline" size={24} color="#fff" />
              <View style={styles.notificationBadge}>
                <Text style={styles.badgeText}>3</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome back, {user.username}! 👋</Text>
          <Text style={styles.welcomeSubtitle}>Here's what's happening with your farm today</Text>
          <Text style={styles.dateTime}>{getCurrentDate()}</Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            {navItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.actionCard}
                onPress={() => navigation.navigate(item.route)}
              >
                <View style={[styles.actionIcon, { backgroundColor: item.color }]}>
                  <Ionicons name={item.icon} size={24} color="#fff" />
                </View>
                <Text style={styles.actionLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Weather Widget */}
        <View style={styles.section}>
          <View style={styles.weatherHeader}>
            <Text style={styles.sectionTitle}>
              <Ionicons name="cloud-outline" size={20} color="#2d3748" /> Weather
            </Text>
            <TouchableOpacity onPress={getCurrentLocation} style={styles.refreshButton}>
              <Ionicons name="refresh" size={20} color="#3182ce" />
            </TouchableOpacity>
          </View>

          <View style={styles.weatherWidget}>
            {locationError && (
              <View style={styles.locationAlert}>
                <Ionicons name="warning" size={16} color="#856404" />
                <Text style={styles.alertText}>{locationError}</Text>
              </View>
            )}

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3182ce" />
                <Text style={styles.loadingText}>Getting weather data...</Text>
              </View>
            ) : weather ? (
              <View style={styles.weatherContent}>
                <View style={styles.weatherMain}>
                  <Text style={styles.weatherIcon}>
                    {getWeatherIcon(weather.weather?.[0]?.main)}
                  </Text>
                  <View style={styles.weatherTemp}>
                    <Text style={styles.temperature}>
                      {Math.round(weather.main?.temp || 0)}°C
                    </Text>
                    <Text style={styles.weatherDesc}>
                      {weather.weather?.[0]?.description || 'Clear sky'}
                    </Text>
                    <Text style={styles.locationText}>
                      📍 {weather.name || 'Your Location'}
                    </Text>
                  </View>
                </View>

                <View style={styles.weatherDetails}>
                  <View style={styles.weatherItem}>
                    <Ionicons name="thermometer" size={20} color="#FF6B6B" />
                    <Text style={styles.weatherLabel}>Feels like</Text>
                    <Text style={styles.weatherValue}>
                      {Math.round(weather.main?.feels_like || 0)}°C
                    </Text>
                  </View>
                  <View style={styles.weatherItem}>
                    <Ionicons name="water" size={20} color="#4ECDC4" />
                    <Text style={styles.weatherLabel}>Humidity</Text>
                    <Text style={styles.weatherValue}>{weather.main?.humidity || 0}%</Text>
                  </View>
                  <View style={styles.weatherItem}>
                    <Ionicons name="leaf" size={20} color="#95A5A6" />
                    <Text style={styles.weatherLabel}>Wind</Text>
                    <Text style={styles.weatherValue}>
                      {Math.round((weather.wind?.speed || 0) * 3.6)} km/h
                    </Text>
                  </View>
                  <View style={styles.weatherItem}>
                    <Ionicons name="eye" size={20} color="#3498DB" />
                    <Text style={styles.weatherLabel}>Visibility</Text>
                    <Text style={styles.weatherValue}>
                      {Math.round((weather.visibility || 0) / 1000)} km
                    </Text>
                  </View>
                </View>

                <View style={styles.weatherAdvice}>
                  <Text style={styles.adviceTitle}>🌱 Farming Advice</Text>
                  <Text style={styles.adviceText}>
                    {weather.main?.temp > 30 
                      ? "🌡️ Hot day ahead! Consider watering your crops early morning or evening."
                      : weather.main?.temp < 15
                      ? "🧊 Cool weather. Perfect for cool-season crops like lettuce and spinach."
                      : "🌱 Great weather for most farming activities. Perfect day to tend your crops!"
                    }
                  </Text>
                </View>
              </View>
            ) : (
              <View style={styles.weatherError}>
                <Text style={styles.errorText}>Unable to load weather data</Text>
                <TouchableOpacity onPress={getCurrentLocation} style={styles.retryButton}>
                  <Text style={styles.retryText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Drawer Overlay */}
      {showDrawer && (
        <Animated.View 
          style={[
            styles.drawerOverlay,
            { opacity: overlayAnimation }
          ]}
        >
          <TouchableOpacity 
            style={styles.overlayTouchable}
            onPress={closeDrawer}
            activeOpacity={1}
          />
        </Animated.View>
      )}

      {/* Drawer */}
      {showDrawer && (
        <Animated.View 
          style={[
            styles.drawer,
            { transform: [{ translateX: drawerAnimation }] }
          ]}
        >
          <View style={styles.drawerHeader}>
            <View style={styles.drawerProfileSection}>
              <View style={styles.drawerProfileImageContainer}>
                {user.profile ? (
                  <Image source={{ uri: user.profile }} style={styles.drawerProfileImage} />
                ) : (
                  <View style={styles.drawerDefaultAvatar}>
                    <Ionicons name="person" size={40} color="#667eea" />
                  </View>
                )}
              </View>
              <Text style={styles.drawerUsername}>{user.username}</Text>
              <Text style={styles.drawerEmail}>{user.email}</Text>
            </View>
          </View>

          <ScrollView style={styles.drawerContent}>
            {drawerItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.drawerItem,
                  item.isLogout && styles.drawerLogoutItem
                ]}
                onPress={() => {
                  closeDrawer();
                  setTimeout(() => item.action(), 300);
                }}
              >
                <Ionicons 
                  name={item.icon} 
                  size={20} 
                  color={item.isLogout ? '#e53e3e' : '#4a5568'} 
                />
                <Text style={[
                  styles.drawerItemText,
                  item.isLogout && styles.drawerLogoutText
                ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>
      )}

      {/* Edit Profile Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Profile Image Section */}
            <View style={styles.profileImageSection}>
              <TouchableOpacity onPress={handleImagePicker} style={styles.profileImageButton}>
                {formData.profile ? (
                  <Image source={{ uri: formData.profile }} style={styles.modalProfileImage} />
                ) : (
                  <View style={styles.modalDefaultAvatar}>
                    <Ionicons name="person" size={40} color="#667eea" />
                  </View>
                )}
                <View style={styles.cameraIcon}>
                  <Ionicons name="camera" size={20} color="#fff" />
                </View>
              </TouchableOpacity>
              <Text style={styles.changePhotoText}>Tap to change photo</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Username</Text>
              <TextInput
                style={styles.input}
                value={formData.username}
                onChangeText={(value) => handleChange('username', value)}
                placeholder="Enter username"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(value) => handleChange('email', value)}
                placeholder="Enter email"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Address</Text>
              <TextInput
                style={styles.input}
                value={formData.address}
                onChangeText={(value) => handleChange('address', value)}
                placeholder="Enter address"
                multiline
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Birth Date</Text>
              <TextInput
                style={styles.input}
                value={formData.bod}
                onChangeText={(value) => handleChange('bod', value)}
                placeholder="YYYY-MM-DD"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Gender</Text>
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

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                onPress={handleSubmit} 
                style={[styles.saveButton, authLoading && styles.disabledButton]}
                disabled={authLoading}
              >
                {authLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
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
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    backgroundColor: '#667eea',
    paddingTop: Platform.OS === 'ios' ? 0 : StatusBar.currentHeight,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  menuButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 15,
  },
  profileImageContainer: {
    position: 'relative',
    marginRight: 15,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  defaultAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#fff',
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  status: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  notificationButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#e53e3e',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  welcomeSection: {
    padding: 20,
    backgroundColor: '#fff',
    margin: 20,
    marginBottom: 10,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2d3748',
    marginBottom: 5,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#718096',
    marginBottom: 10,
  },
  dateTime: {
    fontSize: 14,
    color: '#a0aec0',
    fontWeight: '500',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2d3748',
    marginBottom: 15,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: (width - 60) / 2,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2d3748',
    textAlign: 'center',
  },
  weatherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  refreshButton: {
    padding: 5,
  },
  weatherWidget: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  locationAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3cd',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  alertText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#856404',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#718096',
  },
  weatherContent: {
    flex: 1,
  },
  weatherMain: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  weatherIcon: {
    fontSize: 60,
    marginRight: 20,
  },
  weatherTemp: {
    flex: 1,
  },
  temperature: {
    fontSize: 36,
    fontWeight: '300',
    color: '#2d3748',
  },
  weatherDesc: {
    fontSize: 16,
    color: '#718096',
    textTransform: 'capitalize',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#a0aec0',
  },
  weatherDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom:20,
  },
  weatherItem: {
width: (width - 80) / 2,
backgroundColor: '#f8fafc',
borderRadius: 10,
padding: 12,
marginBottom: 10,
alignItems: 'center',
},
weatherLabel: {
fontSize: 12,
color: '#718096',
marginTop: 5,
},
weatherValue: {
fontSize: 16,
fontWeight: '600',
color: '#2d3748',
marginTop: 2,
},
weatherAdvice: {
backgroundColor: '#ebf8ff',
borderRadius: 10,
padding: 15,
marginTop: 15,
},
adviceTitle: {
fontSize: 16,
fontWeight: '600',
color: '#3182ce',
marginBottom: 8,
},
adviceText: {
fontSize: 14,
color: '#4a5568',
lineHeight: 20,
},
weatherError: {
alignItems: 'center',
padding: 40,
},
errorText: {
fontSize: 16,
color: '#e53e3e',
marginBottom: 15,
},
retryButton: {
backgroundColor: '#3182ce',
paddingHorizontal: 20,
paddingVertical: 10,
borderRadius: 8,
},
retryText: {
color: '#fff',
fontWeight: '500',
},

// Drawer Styles
drawerOverlay: {
position: 'absolute',
top: 0,
left: 0,
right: 0,
bottom: 0,
backgroundColor: 'rgba(0,0,0,0.5)',
zIndex: 100,
},
overlayTouchable: {
flex: 1,
},
drawer: {
position: 'absolute',
top: 0,
left: 0,
bottom: 0,
width: width * 0.8,
backgroundColor: '#fff',
zIndex: 101,
paddingTop: Platform.OS === 'ios' ? 40 : StatusBar.currentHeight + 20,
},
drawerHeader: {
padding: 20,
borderBottomWidth: 1,
borderBottomColor: '#edf2f7',
},
drawerProfileSection: {
alignItems: 'center',
},
drawerProfileImageContainer: {
marginBottom: 15,
},
drawerProfileImage: {
width: 80,
height: 80,
borderRadius: 40,
borderWidth: 2,
borderColor: '#667eea',
},
drawerDefaultAvatar: {
width: 80,
height: 80,
borderRadius: 40,
backgroundColor: '#ebf4ff',
justifyContent: 'center',
alignItems: 'center',
borderWidth: 2,
borderColor: '#667eea',
},
drawerUsername: {
fontSize: 18,
fontWeight: '600',
color: '#2d3748',
marginBottom: 5,
},
drawerEmail: {
fontSize: 14,
color: '#718096',
},
drawerContent: {
flex: 1,
paddingVertical: 10,
},
drawerItem: {
flexDirection: 'row',
alignItems: 'center',
paddingVertical: 15,
paddingHorizontal: 25,
borderBottomWidth: 1,
borderBottomColor: '#edf2f7',
},
drawerItemText: {
fontSize: 16,
color: '#4a5568',
marginLeft: 15,
},
drawerLogoutItem: {
marginTop: 20,
borderTopWidth: 1,
borderTopColor: '#edf2f7',
borderBottomWidth: 0,
},
drawerLogoutText: {
color: '#e53e3e',
},

// Modal Styles
modalContainer: {
flex: 1,
backgroundColor: '#fff',
},
modalHeader: {
flexDirection: 'row',
justifyContent: 'space-between',
alignItems: 'center',
padding: 20,
borderBottomWidth: 1,
borderBottomColor: '#edf2f7',
},
modalTitle: {
fontSize: 20,
fontWeight: '600',
color: '#2d3748',
},
modalContent: {
flex: 1,
padding: 20,
},
profileImageSection: {
alignItems: 'center',
marginBottom: 30,
},
profileImageButton: {
position: 'relative',
marginBottom: 10,
},
modalProfileImage: {
width: 120,
height: 120,
borderRadius: 60,
borderWidth: 3,
borderColor: '#667eea',
},
modalDefaultAvatar: {
width: 120,
height: 120,
borderRadius: 60,
backgroundColor: '#ebf4ff',
justifyContent: 'center',
alignItems: 'center',
borderWidth: 3,
borderColor: '#667eea',
},
cameraIcon: {
position: 'absolute',
bottom: 5,
right: 5,
backgroundColor: '#667eea',
width: 30,
height: 30,
borderRadius: 15,
justifyContent: 'center',
alignItems: 'center',
},
changePhotoText: {
fontSize: 14,
color: '#718096',
},
inputGroup: {
marginBottom: 20,
},
inputLabel: {
fontSize: 14,
color: '#4a5568',
marginBottom: 8,
fontWeight: '500',
},
input: {
backgroundColor: '#f8fafc',
borderWidth: 1,
borderColor: '#e2e8f0',
borderRadius: 8,
padding: 12,
fontSize: 16,
color: '#2d3748',
},
genderButtons: {
flexDirection: 'row',
justifyContent: 'space-between',
marginTop: 10,
},
genderButton: {
flex: 1,
marginHorizontal: 5,
padding: 12,
borderRadius: 8,
backgroundColor: '#f8fafc',
borderWidth: 1,
borderColor: '#e2e8f0',
alignItems: 'center',
},
genderButtonActive: {
backgroundColor: '#667eea',
borderColor: '#667eea',
},
genderButtonText: {
color: '#4a5568',
fontWeight: '500',
},
genderButtonTextActive: {
color: '#fff',
},
modalButtons: {
flexDirection: 'row',
justifyContent: 'space-between',
marginTop: 30,
},
saveButton: {
flex: 1,
backgroundColor: '#667eea',
padding: 15,
borderRadius: 8,
alignItems: 'center',
marginRight: 10,
},
disabledButton: {
opacity: 0.7,
},
saveButtonText: {
color: '#fff',
fontWeight: '600',
fontSize: 16,
},
cancelButton: {
flex: 1,
backgroundColor: '#f8fafc',
padding: 15,
borderRadius: 8,
alignItems: 'center',
borderWidth: 1,
borderColor: '#e2e8f0',
},
cancelButtonText: {
color: '#4a5568',
fontWeight: '600',
fontSize: 16,
},
});

export default UserDashboard;