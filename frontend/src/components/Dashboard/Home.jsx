import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  StyleSheet,
  StatusBar,
  TextInput,
  Animated,
  SafeAreaView,
  FlatList,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const features = [
    { icon: '🌾', title: 'Crop Guide Hub', desc: 'Comprehensive planting guides and harvest calendars' },
    { icon: '🛒', title: 'Market Linkage', desc: 'Direct connections with buyers and cooperatives' },
    { icon: '📱', title: 'Digital Farm Diary', desc: 'Track inputs, costs, and yields over time' },
    { icon: '⛈️', title: 'Weather & Pest Alerts', desc: 'Real-time, location-based notifications' },
    { icon: '🎥', title: 'Video Tutorials', desc: 'Local language how-to videos' },
    { icon: '🎓', title: 'eLearning Portal', desc: 'Courses on agribusiness and financial literacy' },
    { icon: '🤝', title: 'Community Exchange', desc: 'Share tips and success stories' },
    { icon: '📞', title: 'AgriSupport Line', desc: 'Chat with agricultural technicians' },
    { icon: '📊', title: 'Barangay Dashboard', desc: 'Track food security indicators' },
    { icon: '📱', title: 'Offline Access', desc: 'Downloadable guides for offline use' },
    { icon: '🔬', title: 'AI Disease Detection', desc: 'ML-powered crop disease identification' },
    { icon: '🗺️', title: 'Farm Mapping', desc: 'Geotagged digital farm management' }
  ];

  const testimonials = [
    { name: 'Maria Santos', location: 'Nueva Ecija', text: 'SmartFarm helped me increase my rice yield by 30%!', rating: 5 },
    { name: 'Juan Dela Cruz', location: 'Laguna', text: 'The weather alerts saved my crops from the last typhoon.', rating: 5 },
    { name: 'Rosa Mendoza', location: 'Iloilo', text: 'Market linkage feature connected me with better buyers.', rating: 5 }
  ];

  const heroSlides = [
    { icon: '🌱', text: 'Smart Crop Management' },
    { icon: '📈', text: 'Maximize Your Profits' },
    { icon: '🌦️', text: 'Weather Intelligence' }
  ];

  useEffect(() => {
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    // Auto-slide for hero features
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % 3);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: currentSlide,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, [currentSlide]);

  const handleScroll = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.y;
    setIsScrolled(scrollPosition > 50);
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const renderFeatureCard = ({ item, index }) => (
    <TouchableOpacity 
      style={[styles.featureCard, hoveredFeature === index && styles.featureCardHovered]}
      onPressIn={() => setHoveredFeature(index)}
      onPressOut={() => setHoveredFeature(null)}
    >
      <Text style={styles.featureIcon}>{item.icon}</Text>
      <Text style={styles.featureTitle}>{item.title}</Text>
      <Text style={styles.featureDesc}>{item.desc}</Text>
    </TouchableOpacity>
  );

  const renderTestimonialCard = ({ item }) => (
    <View style={styles.testimonialCard}>
      <Text style={styles.testimonialText}>"{item.text}"</Text>
      <Text style={styles.stars}>{'⭐'.repeat(item.rating)}</Text>
      <Text style={styles.testimonialAuthor}>{item.name}</Text>
      <Text style={styles.testimonialLocation}>{item.location}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2e7d32" />
      
      {/* Navigation Bar */}
      <Animated.View style={[
        styles.navbar,
        {
          backgroundColor: isScrolled ? 'rgba(46, 125, 50, 0.95)' : 'rgba(46, 125, 50, 0.1)',
          borderBottomWidth: isScrolled ? 1 : 0,
          borderBottomColor: 'rgba(255,255,255,0.1)'
        }
      ]}>
        <TouchableOpacity style={styles.logo}>
          <Text style={styles.logoText}>🌱 SmartFarm</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
          <Text style={styles.loginBtnText}>Login</Text>
        </TouchableOpacity>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?fit=crop&w=1400&q=80' }}
          style={styles.hero}
          imageStyle={styles.heroImage}
        >
          <View style={styles.heroOverlay} />
          <Animated.View style={[styles.heroContent, { opacity: fadeAnim }]}>
            <Text style={styles.heroTitle}>Empowering Farmers with Smart Technology</Text>
            <Text style={styles.heroSubtitle}>
              Transform your farming journey with intelligent crop guides, real-time market insights, 
              advanced pest alerts, and precision weather forecasting.
            </Text>
            
            <View style={styles.ctaContainer}>
              <TouchableOpacity style={styles.ctaButton} onPress={handleLogin}>
                <Text style={styles.ctaButtonText}>Start Growing Smart</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryCta}>
                <Text style={styles.secondaryCtaText}>Watch Demo</Text>
              </TouchableOpacity>
            </View>

            {/* Feature Slider */}
            <View style={styles.featuresSlider}>
              {heroSlides.map((slide, index) => (
                <Animated.View
                  key={index}
                  style={[
                    styles.slide,
                    {
                      transform: [{
                        translateX: slideAnim.interpolate({
                          inputRange: [0, 1, 2],
                          outputRange: [index * width * 0.8, (index - 1) * width * 0.8, (index - 2) * width * 0.8]
                        })
                      }],
                      opacity: currentSlide === index ? 1 : 0.3
                    }
                  ]}
                >
                  <Text style={styles.slideIcon}>{slide.icon}</Text>
                  <Text style={styles.slideText}>{slide.text}</Text>
                </Animated.View>
              ))}
            </View>
          </Animated.View>
        </ImageBackground>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About SmartFarm</Text>
          <Text style={styles.sectionSubtitle}>
            Bridging the gap between traditional farming and modern technology to create sustainable agricultural solutions.
          </Text>
          
          <View style={styles.aboutContent}>
            <View style={styles.aboutText}>
              <Text style={styles.aboutHeading}>Our Mission</Text>
              <Text style={styles.aboutDescription}>
                SmartFarm is dedicated to empowering small-scale farmers across the Philippines with cutting-edge 
                digital tools and agricultural knowledge. We believe that every farmer deserves access to modern 
                technology that can help them increase productivity, reduce crop losses, and improve their livelihoods.
              </Text>
              
              <Text style={styles.aboutHeading}>What We Do</Text>
              <Text style={styles.aboutDescription}>
                Our comprehensive platform combines traditional farming wisdom with artificial intelligence, 
                weather forecasting, market linkage, and community support to create a holistic farming experience.
              </Text>
            </View>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>50K+</Text>
              <Text style={styles.statLabel}>Active Farmers</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>95%</Text>
              <Text style={styles.statLabel}>Success Rate</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>200+</Text>
              <Text style={styles.statLabel}>Crop Varieties</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>24/7</Text>
              <Text style={styles.statLabel}>Support</Text>
            </View>
          </View>

          {/* Testimonials */}
          <View style={styles.testimonials}>
            <Text style={styles.testimonialsTitle}>What Farmers Say</Text>
            <FlatList
              data={testimonials}
              renderItem={renderTestimonialCard}
              keyExtractor={(item, index) => index.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.testimonialSlider}
            />
          </View>
        </View>

        {/* Services Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Services</Text>
          <Text style={styles.sectionSubtitle}>
            Comprehensive digital farming solutions designed to maximize your agricultural success.
          </Text>
          
          <FlatList
            data={features}
            renderItem={renderFeatureCard}
            keyExtractor={(item, index) => index.toString()}
            numColumns={2}
            scrollEnabled={false}
            contentContainerStyle={styles.featuresGrid}
          />

          <View style={styles.ctaSection}>
            <Text style={styles.ctaSectionTitle}>Ready to Transform Your Farm?</Text>
            <Text style={styles.ctaSectionSubtitle}>
              Join thousands of farmers who are already using SmartFarm to increase their yields and profits.
            </Text>
            <TouchableOpacity style={styles.ctaButton} onPress={handleLogin}>
              <Text style={styles.ctaButtonText}>Get Started Today 🌱</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Contact Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <Text style={styles.sectionSubtitle}>
            Have questions? We're here to help you grow your farming success.
          </Text>
          
          <View style={styles.contactForm}>
            <Text style={styles.formTitle}>Send us a Message</Text>
            <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor="#999" />
            <TextInput style={styles.input} placeholder="Email Address" placeholderTextColor="#999" />
            <TextInput style={styles.input} placeholder="Phone Number" placeholderTextColor="#999" />
            <TextInput style={styles.input} placeholder="Farm Location" placeholderTextColor="#999" />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Tell us about your farming needs..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <TouchableOpacity style={styles.submitBtn}>
              <Text style={styles.submitBtnText}>Send Message 📤</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.contactInfo}>
            <View style={styles.contactItem}>
              <Text style={styles.contactIcon}>📍</Text>
              <View>
                <Text style={styles.contactTitle}>Head Office</Text>
                <Text style={styles.contactText}>123 Agriculture Drive{'\n'}Quezon City, Metro Manila{'\n'}Philippines 1100</Text>
              </View>
            </View>
            
            <View style={styles.contactItem}>
              <Text style={styles.contactIcon}>📞</Text>
              <View>
                <Text style={styles.contactTitle}>Phone Support</Text>
                <Text style={styles.contactText}>+63 2 8123 4567{'\n'}Mon-Fri: 8AM-6PM{'\n'}Sat: 8AM-12PM</Text>
              </View>
            </View>
            
            <View style={styles.contactItem}>
              <Text style={styles.contactIcon}>📧</Text>
              <View>
                <Text style={styles.contactTitle}>Email Support</Text>
                <Text style={styles.contactText}>support@smartfarm.ph{'\n'}info@smartfarm.ph{'\n'}24/7 Response</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerLogo}>🌱 SmartFarm</Text>
          <Text style={styles.footerText}>
            Empowering Filipino farmers with smart technology for sustainable agriculture
          </Text>
          <Text style={styles.footerCopyright}>
            © 2025 SmartFarm Philippines. All rights reserved.{'\n'}
            Building the future of Philippine agriculture, one farm at a time. 🌾
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fffe',
  },
  navbar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: StatusBar.currentHeight || 44,
    paddingBottom: 15,
    zIndex: 1000,
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#66bb6a',
  },
  loginBtn: {
    backgroundColor: '#66bb6a',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    shadowColor: '#66bb6a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loginBtnText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  hero: {
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  heroImage: {
    opacity: 0.8,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(46, 125, 50, 0.7)',
  },
  heroContent: {
    alignItems: 'center',
    zIndex: 2,
    paddingTop: 100,
  },
  heroTitle: {
    fontSize: width > 400 ? 32 : 28,
    fontWeight: '800',
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 10,
  },
  heroSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  ctaContainer: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 40,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  ctaButton: {
    backgroundColor: '#66bb6a',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 50,
    shadowColor: '#66bb6a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 10,
  },
  ctaButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryCta: {
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 50,
  },
  secondaryCtaText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  featuresSlider: {
    width: width * 0.8,
    height: 120,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  slide: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  slideIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  slideText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 60,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    color: '#2e7d32',
    marginBottom: 10,
  },
  sectionSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 40,
    lineHeight: 24,
  },
  aboutContent: {
    marginBottom: 40,
  },
  aboutText: {
    paddingHorizontal: 10,
  },
  aboutHeading: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2e7d32',
    marginBottom: 15,
    marginTop: 20,
  },
  aboutDescription: {
    fontSize: 16,
    lineHeight: 26,
    color: '#555',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  statCard: {
    width: (width - 60) / 2,
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: '#2e7d32',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
  },
  testimonials: {
    backgroundColor: '#f1f8e9',
    padding: 30,
    borderRadius: 30,
    marginVertical: 20,
  },
  testimonialsTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2e7d32',
    textAlign: 'center',
    marginBottom: 25,
  },
  testimonialSlider: {
    paddingHorizontal: 10,
  },
  testimonialCard: {
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 20,
    alignItems: 'center',
    marginHorizontal: 10,
    width: width * 0.7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  testimonialText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 15,
  },
  stars: {
    fontSize: 16,
    color: '#ffc107',
    marginBottom: 10,
  },
  testimonialAuthor: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2e7d32',
    marginBottom: 5,
  },
  testimonialLocation: {
    fontSize: 14,
    color: '#888',
  },
  featuresGrid: {
    paddingHorizontal: 10,
  },
  featureCard: {
    flex: 1,
    backgroundColor: 'white',
    margin: 10,
    padding: 25,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  featureCardHovered: {
    transform: [{ scale: 1.05 }],
    shadowOpacity: 0.2,
  },
  featureIcon: {
    fontSize: 40,
    marginBottom: 15,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2e7d32',
    textAlign: 'center',
    marginBottom: 10,
  },
  featureDesc: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  ctaSection: {
    backgroundColor: '#e8f5e8',
    padding: 30,
    borderRadius: 20,
    alignItems: 'center',
    marginTop: 40,
  },
  ctaSectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2e7d32',
    textAlign: 'center',
    marginBottom: 15,
  },
  ctaSectionSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 25,
  },
  contactForm: {
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2e7d32',
    marginBottom: 25,
  },
  input: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: '#fafafa',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: '#66bb6a',
    padding: 15,
    borderRadius: 50,
    alignItems: 'center',
    shadowColor: '#66bb6a',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  submitBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  contactInfo: {
    gap: 20,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  contactIcon: {
    fontSize: 24,
    marginRight: 15,
    marginTop: 5,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2e7d32',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  footer: {
    backgroundColor: '#2e7d32',
    padding: 40,
    alignItems: 'center',
  },
  footerLogo: {
    fontSize: 24,
    fontWeight: '800',
    color: 'white',
    marginBottom: 15,
  },
  footerText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 25,
  },
  footerCopyright: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default HomeScreen;