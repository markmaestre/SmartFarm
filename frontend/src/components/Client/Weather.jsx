import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  RefreshControl,
  StatusBar,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import * as Location from 'expo-location';
import axios from 'axios';
import { WebView } from 'react-native-webview';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const Weather = () => {
  const [location, setLocation] = useState({ lat: 14.5995, lon: 120.9842, name: 'Manila' });
  const [inputLocation, setInputLocation] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [currentWeather, setCurrentWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('current');
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnimY = useRef(new Animated.Value(50)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const searchAnim = useRef(new Animated.Value(0)).current;

  // Start animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.back(1.7)),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnimY, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    // Rotation animation
    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    rotateAnimation.start();

    return () => {
      pulseAnimation.stop();
      rotateAnimation.stop();
    };
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required for accurate weather data.');
        return;
      }

      const locResult = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const { latitude, longitude } = locResult.coords;

      const place = await Location.reverseGeocodeAsync({ latitude, longitude });
      const city = place[0]?.city || place[0]?.region || place[0]?.district || 'Current Location';

      setLocation({ lat: latitude, lon: longitude, name: city });
    } catch (error) {
      console.warn('Location error:', error);
      Alert.alert('Location Error', 'Unable to fetch your current location. Using default location.');
    }
  };

  const fetchCoordsFromPlace = async (placeName) => {
    try {
      const res = await axios.get(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(placeName)}&count=1&language=en&format=json`
      );
      const result = res.data.results?.[0];
      if (!result) throw new Error('Location not found');
      
      setLocation({
        lat: result.latitude,
        lon: result.longitude,
        name: result.name + (result.country ? `, ${result.country}` : ''),
      });
      setInputLocation('');
      toggleSearch();
    } catch (err) {
      Alert.alert('Location Error', 'Could not find that location. Please try again.');
    }
  };

  const fetchWeatherData = async (lat, lon) => {
    setLoading(true);
    try {
      const [forecastRes, currentRes] = await Promise.all([
        axios.get(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weathercode,windspeed_10m_max,uv_index_max&hourly=temperature_2m,relativehumidity_2m,windspeed_10m,precipitation,weathercode&timezone=auto&current_weather=true`
        ),
        axios.get(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relativehumidity_2m,apparent_temperature,precipitation,weathercode,windspeed_10m,winddirection_10m&timezone=auto`
        )
      ]);
      
      setWeatherData(forecastRes.data);
      setCurrentWeather(currentRes.data.current);
    } catch (err) {
      console.error('Weather fetch failed:', err);
      Alert.alert('Weather Error', 'Failed to fetch weather data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchWeatherData(location.lat, location.lon);
    setRefreshing(false);
  };

  const toggleSearch = () => {
    setIsSearchVisible(!isSearchVisible);
    Animated.timing(searchAnim, {
      toValue: isSearchVisible ? 0 : 1,
      duration: 300,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    fetchWeatherData(location.lat, location.lon);
  }, [location]);

  const getWeatherIcon = (weatherCode, isLarge = false) => {
    const iconMap = {
      0: '☀️',   1: '🌤️',   2: '⛅',   3: '☁️',   45: '🌫️', 48: '🌫️',
      51: '🌦️', 53: '🌦️', 55: '🌦️', 61: '🌧️', 63: '🌧️', 65: '🌧️',
      71: '🌨️', 73: '🌨️', 75: '🌨️', 80: '🌦️', 81: '🌧️', 82: '🌧️',
      95: '⛈️', 96: '⛈️', 99: '⛈️',
    };
    return iconMap[weatherCode] || '🌤️';
  };

  const getWeatherDescription = (weatherCode) => {
    const descriptions = {
      0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
      45: 'Foggy', 48: 'Depositing rime fog', 51: 'Light drizzle', 53: 'Moderate drizzle',
      55: 'Dense drizzle', 61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
      71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow', 80: 'Slight rain showers',
      81: 'Moderate rain showers', 82: 'Violent rain showers', 95: 'Thunderstorm',
      96: 'Thunderstorm with hail', 99: 'Thunderstorm with heavy hail',
    };
    return descriptions[weatherCode] || 'Unknown';
  };

  const getWindDirection = (degrees) => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    return directions[Math.round(degrees / 22.5) % 16];
  };

  const getGradientColors = (weatherCode) => {
    if (weatherCode <= 1) return ['#FF9500', '#FF5722']; // Sunny
    if (weatherCode <= 3) return ['#4FC3F7', '#29B6F6']; // Cloudy
    if (weatherCode >= 61 && weatherCode <= 65) return ['#607D8B', '#455A64']; // Rainy
    if (weatherCode >= 71 && weatherCode <= 75) return ['#E3F2FD', '#BBDEFB']; // Snowy
    if (weatherCode >= 95) return ['#424242', '#212121']; // Stormy
    return ['#4A90E2', '#357ABD']; // Default
  };

  const leafletHtml = `
    <!DOCTYPE html>
    <html><head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />
      <style>
        html, body, #map { height: 100%; margin: 0; padding: 0; }
        .leaflet-control-attribution { display: none; }
        .custom-marker { 
          background: linear-gradient(45deg, #FF6B6B, #4ECDC4);
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
      </style>
    </head><body>
      <div id="map"></div>
      <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>
      <script>
        const map = L.map('map', {
          zoomControl: false,
          attributionControl: false
        }).setView([${location.lat}, ${location.lon}], 10);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: ''
        }).addTo(map);
        
        const marker = L.marker([${location.lat}, ${location.lon}])
          .addTo(map)
          .bindPopup('${location.name}')
          .openPopup();
        
        const circle = L.circle([${location.lat}, ${location.lon}], {
          color: '#FF6B6B',
          fillColor: '#4ECDC4',
          fillOpacity: 0.3,
          radius: 5000
        }).addTo(map);
      </script>
    </body></html>
  `;

  const renderTabBar = () => (
    <View style={styles.tabBar}>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'current' && styles.activeTab]}
        onPress={() => setActiveTab('current')}
      >
        <Text style={[styles.tabText, activeTab === 'current' && styles.activeTabText]}>
          Current
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'forecast' && styles.activeTab]}
        onPress={() => setActiveTab('forecast')}
      >
        <Text style={[styles.tabText, activeTab === 'forecast' && styles.activeTabText]}>
          7-Day
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.tab, activeTab === 'map' && styles.activeTab]}
        onPress={() => setActiveTab('map')}
      >
        <Text style={[styles.tabText, activeTab === 'map' && styles.activeTabText]}>
          Map
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderCurrentWeather = () => {
    if (!currentWeather || !weatherData) return null;
    
    const gradientColors = getGradientColors(currentWeather.weathercode);
    
    return (
      <Animated.View
        style={[
          styles.currentWeatherCard,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { translateY: slideAnimY }
            ]
          }
        ]}
      >
        <LinearGradient
          colors={gradientColors}
          style={styles.currentWeatherGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.currentWeatherHeader}>
            <View style={styles.tempContainer}>
              <Text style={styles.currentTemp}>
                {Math.round(currentWeather.temperature_2m)}°
              </Text>
              <Text style={styles.tempUnit}>C</Text>
            </View>
            <Animated.View
              style={[
                styles.weatherIconContainer,
                {
                  transform: [
                    { scale: pulseAnim },
                    {
                      rotate: rotateAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '360deg'],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.weatherIcon}>
                {getWeatherIcon(currentWeather.weathercode, true)}
              </Text>
            </Animated.View>
          </View>
          
          <Text style={styles.weatherDescription}>
            {getWeatherDescription(currentWeather.weathercode)}
          </Text>
          
          <Text style={styles.feelsLike}>
            Feels like {Math.round(currentWeather.apparent_temperature)}°C
          </Text>
          
          <View style={styles.weatherDetailsGrid}>
            <View style={styles.weatherDetail}>
              <View style={styles.detailIconContainer}>
                <Text style={styles.detailIcon}>💧</Text>
              </View>
              <Text style={styles.detailLabel}>Humidity</Text>
              <Text style={styles.detailValue}>{currentWeather.relativehumidity_2m}%</Text>
            </View>
            <View style={styles.weatherDetail}>
              <View style={styles.detailIconContainer}>
                <Text style={styles.detailIcon}>💨</Text>
              </View>
              <Text style={styles.detailLabel}>Wind</Text>
              <Text style={styles.detailValue}>
                {Math.round(currentWeather.windspeed_10m)} km/h
              </Text>
              <Text style={styles.detailSubValue}>
                {getWindDirection(currentWeather.winddirection_10m)}
              </Text>
            </View>
            <View style={styles.weatherDetail}>
              <View style={styles.detailIconContainer}>
                <Text style={styles.detailIcon}>🌧️</Text>
              </View>
              <Text style={styles.detailLabel}>Rain</Text>
              <Text style={styles.detailValue}>{currentWeather.precipitation} mm</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>
    );
  };

  const renderForecast = () => {
    if (!weatherData) return null;
    
    return (
      <Animated.View
        style={[
          styles.forecastContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnimY }]
          }
        ]}
      >
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.horizontalScroll}
          contentContainerStyle={styles.horizontalScrollContent}
        >
          {weatherData.daily.time.map((day, idx) => (
            <TouchableOpacity
              key={idx}
              style={[
                styles.forecastCard,
                idx === 0 && styles.todayCard
              ]}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={idx === 0 ? ['#FF6B6B', '#4ECDC4'] : ['rgba(255, 255, 255, 0.15)', 'rgba(255, 255, 255, 0.05)']}
                style={styles.forecastCardGradient}
              >
                <Text style={[styles.dayOfWeek, idx === 0 && styles.todayText]}>
                  {idx === 0 ? 'Today' : new Date(day).toLocaleDateString('en-US', { weekday: 'short' })}
                </Text>
                <Text style={[styles.dateText, idx === 0 && styles.todayDateText]}>
                  {new Date(day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </Text>
                <Text style={styles.forecastIcon}>
                  {getWeatherIcon(weatherData.daily.weathercode[idx])}
                </Text>
                <View style={styles.tempContainer}>
                  <Text style={[styles.tempText, idx === 0 && styles.todayTempText]}>
                    {Math.round(weatherData.daily.temperature_2m_max[idx])}°
                  </Text>
                  <Text style={[styles.tempTextMin, idx === 0 && styles.todayTempMinText]}>
                    {Math.round(weatherData.daily.temperature_2m_min[idx])}°
                  </Text>
                </View>
                <View style={styles.precipitationContainer}>
                  <Text style={styles.precipitationText}>
                    💧 {Math.round(weatherData.daily.precipitation_sum[idx])}mm
                  </Text>
                </View>
                <View style={styles.windContainer}>
                  <Text style={styles.windText}>
                    💨 {Math.round(weatherData.daily.windspeed_10m_max[idx])}km/h
                  </Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Animated.View>
    );
  };

  const renderMap = () => (
    <Animated.View
      style={[
        styles.mapContainer,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }]
        }
      ]}
    >
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
        style={styles.mapGradient}
      >
        <Text style={styles.mapTitle}> Location Map</Text>
        <WebView
          originWhitelist={['*']}
          source={{ html: leafletHtml }}
          style={styles.map}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
          renderLoading={() => (
            <View style={styles.mapLoading}>
              <ActivityIndicator size="small" color="#4ECDC4" />
              <Text style={styles.loadingText}>Loading map...</Text>
            </View>
          )}
        />
      </LinearGradient>
    </Animated.View>
  );

  const handleSearchLocation = () => {
    if (inputLocation.trim() === '') {
      Alert.alert('Input Required', 'Please enter a location name');
      return;
    }
    fetchCoordsFromPlace(inputLocation.trim());
  };

  const renderSearchBar = () => (
    <Animated.View
      style={[
        styles.searchContainer,
        {
          height: searchAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 60],
          }),
          opacity: searchAnim,
        }
      ]}
    >
      <BlurView intensity={80} style={styles.searchBlur}>
        <TextInput
          placeholder="Search location (e.g., Tokyo, London)"
          placeholderTextColor="#999"
          style={styles.searchInput}
          onChangeText={setInputLocation}
          value={inputLocation}
          onSubmitEditing={handleSearchLocation}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearchLocation}>
          <LinearGradient
            colors={['#FF6B6B', '#4ECDC4']}
            style={styles.searchButtonGradient}
          >
            <Text style={styles.searchButtonText}>🔍</Text>
          </LinearGradient>
        </TouchableOpacity>
      </BlurView>
    </Animated.View>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'current':
        return renderCurrentWeather();
      case 'forecast':
        return renderForecast();
      case 'map':
        return renderMap();
      default:
        return renderCurrentWeather();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.gradientBackground}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#4ECDC4"
              colors={['#4ECDC4', '#FF6B6B']}
            />
          }
        >
          <Animated.View
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnimY }]
              }
            ]}
          >
            <View style={styles.headerTop}>
              <View style={styles.headerLeft}>
                <Text style={styles.headerTitle}>Weather</Text>
                <Text style={styles.locationText}>📍 {location.name}</Text>
              </View>
              <TouchableOpacity 
                style={styles.searchToggle}
                onPress={toggleSearch}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#FF6B6B', '#4ECDC4']}
                  style={styles.searchToggleGradient}
                >
                  <Text style={styles.searchToggleText}>🔍</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {renderSearchBar()}
          {renderTabBar()}

          {loading ? (
            <View style={styles.loadingContainer}>
              <Animated.View
                style={[
                  styles.loadingContent,
                  {
                    transform: [{ scale: pulseAnim }]
                  }
                ]}
              >
                <ActivityIndicator size="large" color="#4ECDC4" />
                <Text style={styles.loadingText}>Loading weather data...</Text>
              </Animated.View>
            </View>
          ) : (
            renderContent()
          )}
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  gradientBackground: {
    flex: 1,
  },
  scrollContainer: {
    paddingBottom: 30,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  locationText: {
    fontSize: 16,
    color: '#4ECDC4',
    fontWeight: '500',
  },
  searchToggle: {
    borderRadius: 25,
    overflow: 'hidden',
  },
  searchToggleGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchToggleText: {
    fontSize: 20,
  },
  searchContainer: {
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 15,
    overflow: 'hidden',
  },
  searchBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  searchInput: {
    flex: 1,
    padding: 15,
    color: '#ffffff',
    fontSize: 16,
  },
  searchButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  searchButtonGradient: {
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 45,
  },
  searchButtonText: {
    fontSize: 16,
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  tabText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '600',
    fontSize: 14,
  },
  activeTabText: {
    color: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingText: {
    color: '#4ECDC4',
    marginTop: 15,
    fontSize: 16,
    fontWeight: '500',
  },
  currentWeatherCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 25,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  currentWeatherGradient: {
    padding: 25,
  },
  currentWeatherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  tempContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  currentTemp: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  tempUnit: {
    fontSize: 24,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 10,
    marginLeft: 5,
  },
  weatherIconContainer: {
    padding: 10,
  },
  weatherIcon: {
    fontSize: 80,
  },
  weatherDescription: {
    fontSize: 20,
    color: '#ffffff',
    marginBottom: 8,
    fontWeight: '600',
  },
  feelsLike: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 25,
  },
  weatherDetailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weatherDetail: {
    alignItems: 'center',
    flex: 1,
  },
  detailIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailIcon: {
    fontSize: 20,
  },
  detailLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  detailSubValue: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  forecastContainer: {
    marginHorizontal: 20,
  },
  horizontalScroll: {
    paddingVertical: 5,
  },
  horizontalScrollContent: {
    paddingHorizontal: 5,
  },
  forecastCard: {
    width: 120,
    marginHorizontal: 5,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  forecastCardGradient: {
    padding: 15,
    alignItems: 'center',
    minHeight: 200,
  },
  todayCard: {
    transform: [{ scale: 1.05 }],
  },
  dayOfWeek: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 4,
  },
  todayText: {
    color: '#ffffff',
    fontSize: 16,
  },
  dateText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
    marginBottom: 12,
  },
  todayDateText: {
    color: '#ffffff',
  },
  forecastIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  tempText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 2,
  },
  todayTempText: {
    fontSize: 20,
  },
  tempTextMin: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    marginBottom: 8,
  },
  todayTempMinText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
  },
  precipitationContainer: {
    backgroundColor: 'rgba(76, 195, 244, 0.3)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 6,
    minWidth: 60,
  },
  precipitationText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  windContainer: {
    backgroundColor: 'rgba(158, 158, 158, 0.3)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 60,
  },
  windText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  mapContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  mapGradient: {
    padding: 0,
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    padding: 20,
    paddingBottom: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    textAlign:'center',
  },
  map: {
    height: 500,
  },
  mapLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
});

export default Weather;