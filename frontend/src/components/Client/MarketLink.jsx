import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
  SafeAreaView,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Dimensions,
  Animated,
  Modal,
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
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

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
  const [showForm, setShowForm] = useState(false);
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCard, setExpandedCard] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // Refs for input fields
  const productNameRef = useRef();
  const descriptionRef = useRef();
  const priceRef = useRef();
  const locationRef = useRef();
  const quantityRef = useRef();
  const contactRef = useRef();

  useEffect(() => {
    dispatch(fetchMarketPosts());
    animateEntry();
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
      setShowForm(true);
    }
  }, [selectedPost]);

  const animateEntry = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await dispatch(fetchMarketPosts());
    setRefreshing(false);
  };

  const handleImagePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant camera roll permissions to add photos.');
      return;
    }

    Alert.alert(
      'Select Image',
      'Choose from where you want to select an image',
      [
        { text: 'Camera', onPress: () => openCamera() },
        { text: 'Gallery', onPress: () => openGallery() },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const openCamera = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const openGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const validateForm = () => {
    const errors = [];
    
    if (!form.productName.trim()) errors.push('Product name is required');
    if (!form.description.trim()) errors.push('Description is required');
    if (!form.price.trim()) errors.push('Price is required');
    if (form.price && isNaN(parseFloat(form.price))) errors.push('Price must be a valid number');
    if (form.contactNumber && !/^09\d{9}$/.test(form.contactNumber.replace(/[-\s]/g, ''))) {
      errors.push('Contact number must be a valid Philippine mobile number');
    }

    return errors;
  };

  const handleSubmit = async () => {
    const validationErrors = validateForm();
    
    if (validationErrors.length > 0) {
      Alert.alert('Validation Error', validationErrors.join('\n'));
      return;
    }

    const formData = new FormData();
    formData.append('productName', form.productName.trim());
    formData.append('description', form.description.trim());
    formData.append('price', parseFloat(form.price).toString());
    formData.append('location', form.location.trim());
    formData.append('availableQuantity', form.availableQuantity.trim());
    formData.append('contactNumber', form.contactNumber.trim());

    if (image) {
      formData.append('image', {
        uri: image.uri,
        name: `product_${Date.now()}.jpg`,
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
        Alert.alert('Success! 🎉', 'Product updated successfully');
      } else {
        await dispatch(createMarketPost({ formData, token })).unwrap();
        Alert.alert('Success! 🎉', 'Product listed successfully');
      }
      
      resetForm();
      dispatch(fetchMarketPosts());
    } catch (err) {
      Alert.alert('Error ❌', err.message || 'Something went wrong. Please try again.');
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
    setShowForm(false);
    dispatch(clearSelectedPost());
    Keyboard.dismiss();
  };

  const handleDelete = (id, productName) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to remove "${productName}" from your listings?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteMarketPost({ id, token })).unwrap();
              Alert.alert('Deleted! 🗑️', 'Product removed successfully');
              dispatch(fetchMarketPosts());
            } catch (err) {
              Alert.alert('Error', 'Failed to delete product');
            }
          },
        },
      ]
    );
  };

  const handleEdit = (postId) => {
    dispatch(fetchMarketPostById(postId));
  };

  const toggleCardExpansion = (cardId) => {
    setExpandedCard(expandedCard === cardId ? null : cardId);
  };

  const filteredPosts = posts
    .filter((post) => post.userId._id === user.id)
    .filter((post) => {
      if (searchQuery) {
        return post.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
               post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
               post.location.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    });

  const renderFilterChips = () => {
    const filters = [
      { key: 'all', label: 'All Products', icon: '🌾' },
      { key: 'vegetables', label: 'Vegetables', icon: '🥬' },
      { key: 'fruits', label: 'Fruits', icon: '🍎' },
      { key: 'grains', label: 'Grains', icon: '🌾' },
    ];

    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterChip,
              filterType === filter.key && styles.filterChipActive
            ]}
            onPress={() => setFilterType(filter.key)}
          >
            <Text style={styles.filterIcon}>{filter.icon}</Text>
            <Text style={[
              styles.filterText,
              filterType === filter.key && styles.filterTextActive
            ]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  const renderItem = ({ item, index }) => {
    const isOwner = item.userId._id === user.id;
    const isExpanded = expandedCard === item._id;
    
    const animatedStyle = {
      opacity: fadeAnim,
      transform: [
        {
          translateY: slideAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [50, 0],
          }),
        },
        { scale: scaleAnim },
      ],
    };

    return (
      <Animated.View style={[animatedStyle, { marginBottom: 16 }]}>
        <TouchableOpacity
          style={[styles.productCard, isExpanded && styles.productCardExpanded]}
          onPress={() => toggleCardExpansion(item._id)}
          activeOpacity={0.95}
        >
          <View style={styles.imageContainer}>
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.productImage} />
            ) : (
              <LinearGradient
                colors={['#E8F5E8', '#C8E6C9']}
                style={styles.placeholderImage}
              >
                <Text style={styles.placeholderText}>🌾</Text>
              </LinearGradient>
            )}
            
            <LinearGradient
              colors={['rgba(255,107,53,0.9)', 'rgba(255,107,53,1)']}
              style={styles.priceTag}
            >
              <Text style={styles.priceText}>₱{parseFloat(item.price).toFixed(2)}</Text>
            </LinearGradient>

            {item.availableQuantity && (
              <View style={styles.quantityBadge}>
                <Text style={styles.quantityText}>{item.availableQuantity}</Text>
              </View>
            )}
          </View>
          
          <View style={styles.productInfo}>
            <View style={styles.productHeader}>
              <Text style={styles.productTitle} numberOfLines={isExpanded ? undefined : 1}>
                {item.productName}
              </Text>
              <View style={styles.statusIndicator}>
                <View style={[styles.statusDot, { backgroundColor: '#4CAF50' }]} />
                <Text style={styles.statusText}>Available</Text>
              </View>
            </View>
            
            <Text 
              style={styles.productDescription} 
              numberOfLines={isExpanded ? undefined : 2}
            >
              {item.description}
            </Text>
            
            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <View style={styles.detailIconContainer}>
                  <Text style={styles.detailIcon}>📍</Text>
                </View>
                <Text style={styles.detailText}>{item.location || 'Location not specified'}</Text>
              </View>
              
              {item.contactNumber && (
                <View style={styles.detailRow}>
                  <View style={styles.detailIconContainer}>
                    <Text style={styles.detailIcon}>📞</Text>
                  </View>
                  <Text style={styles.detailText}>
                    {item.contactNumber}
                  </Text>
                  <TouchableOpacity style={styles.callButton}>
                    <Text style={styles.callButtonText}>Call</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {isOwner && (
              <View style={styles.ownerActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleEdit(item._id)}
                >
                  <LinearGradient
                    colors={['#4CAF50', '#45A049']}
                    style={styles.actionButtonGradient}
                  >
                    <Text style={styles.actionButtonIcon}>✏️</Text>
                    <Text style={styles.actionButtonText}>Edit</Text>
                  </LinearGradient>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDelete(item._id, item.productName)}
                >
                  <LinearGradient
                    colors={['#F44336', '#D32F2F']}
                    style={styles.actionButtonGradient}
                  >
                    <Text style={styles.actionButtonIcon}>🗑️</Text>
                    <Text style={styles.actionButtonText}>Remove</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderFormModal = () => {
    return (
      <Modal
        visible={showForm}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={resetForm}
      >
        <SafeAreaView style={styles.modalContainer}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContent}
          >
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={resetForm} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
              
              <View style={styles.modalTitleContainer}>
                <Text style={styles.modalTitle}>
                  {isEditing ? '✏️ Edit Product' : '➕ List New Product'}
                </Text>
                <Text style={styles.modalSubtitle}>
                  {isEditing ? 'Update your product information' : 'Share your harvest with the community'}
                </Text>
              </View>
              
              <TouchableOpacity 
                style={styles.saveButton} 
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.saveButtonText}>
                    {isEditing ? 'Update' : 'List'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.formScrollView}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Product Photo Section */}
              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>📷 Product Photo</Text>
                <TouchableOpacity 
                  style={styles.imagePickerContainer} 
                  onPress={handleImagePick}
                >
                  {image ? (
                    <View style={styles.selectedImageContainer}>
                      <Image source={{ uri: image.uri }} style={styles.selectedImage} />
                      <View style={styles.imageOverlay}>
                        <Text style={styles.changePhotoText}>Tap to change photo</Text>
                      </View>
                    </View>
                  ) : (
                    <LinearGradient
                      colors={['#E8F5E8', '#F1F8E9']}
                      style={styles.imagePickerPlaceholder}
                    >
                      <Text style={styles.imagePickerIcon}>📷</Text>
                      <Text style={styles.imagePickerText}>Add Product Photo</Text>
                      <Text style={styles.imagePickerSubtext}>Tap to select from camera or gallery</Text>
                    </LinearGradient>
                  )}
                </TouchableOpacity>
              </View>

              {/* Product Information */}
              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>📝 Product Information</Text>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Product Name *</Text>
                  <TextInput
                    ref={productNameRef}
                    placeholder="e.g., Fresh Organic Tomatoes"
                    style={[styles.formInput, form.productName && styles.formInputFilled]}
                    value={form.productName}
                    onChangeText={(text) => setForm({ ...form, productName: text })}
                    returnKeyType="next"
                    onSubmitEditing={() => descriptionRef.current?.focus()}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Description *</Text>
                  <TextInput
                    ref={descriptionRef}
                    placeholder="Describe your product quality, harvest date, farming methods..."
                    style={[styles.formInput, styles.textArea, form.description && styles.formInputFilled]}
                    value={form.description}
                    onChangeText={(text) => setForm({ ...form, description: text })}
                    multiline
                    numberOfLines={4}
                    returnKeyType="next"
                    onSubmitEditing={() => priceRef.current?.focus()}
                  />
                </View>

                <View style={styles.row}>
                  <View style={styles.halfInputContainer}>
                    <Text style={styles.inputLabel}>Price per kg/unit *</Text>
                    <TextInput
                      ref={priceRef}
                      placeholder="0.00"
                      keyboardType="decimal-pad"
                      style={[styles.formInput, form.price && styles.formInputFilled]}
                      value={form.price}
                      onChangeText={(text) => setForm({ ...form, price: text })}
                      returnKeyType="next"
                      onSubmitEditing={() => quantityRef.current?.focus()}
                    />
                  </View>

                  <View style={styles.halfInputContainer}>
                    <Text style={styles.inputLabel}>Available Quantity</Text>
                    <TextInput
                      ref={quantityRef}
                      placeholder="e.g., 50 kg"
                      style={[styles.formInput, form.availableQuantity && styles.formInputFilled]}
                      value={form.availableQuantity}
                      onChangeText={(text) => setForm({ ...form, availableQuantity: text })}
                      returnKeyType="next"
                      onSubmitEditing={() => locationRef.current?.focus()}
                    />
                  </View>
                </View>
              </View>

              {/* Contact Information */}
              <View style={styles.formSection}>
                <Text style={styles.sectionTitle}>📍 Contact & Location</Text>
                
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Location</Text>
                  <TextInput
                    ref={locationRef}
                    placeholder="e.g., Cabanatuan City, Nueva Ecija"
                    style={[styles.formInput, form.location && styles.formInputFilled]}
                    value={form.location}
                    onChangeText={(text) => setForm({ ...form, location: text })}
                    returnKeyType="next"
                    onSubmitEditing={() => contactRef.current?.focus()}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Contact Number</Text>
                  <TextInput
                    ref={contactRef}
                    placeholder="09XX-XXX-XXXX"
                    keyboardType="phone-pad"
                    style={[styles.formInput, form.contactNumber && styles.formInputFilled]}
                    value={form.contactNumber}
                    onChangeText={(text) => setForm({ ...form, contactNumber: text })}
                    returnKeyType="done"
                  />
                </View>
              </View>

              <View style={styles.formFooter} />
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1B5E20" />
      
      {/* Enhanced Header */}
      <LinearGradient
        colors={['#1B5E20', '#2E7D32', '#4CAF50']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>🌾 Farmer's Marketplace</Text>
          <Text style={styles.headerSubtitle}>Your Agricultural Products Hub</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{filteredPosts.length}</Text>
              <Text style={styles.statLabel}>Your Products</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{posts.length}</Text>
              <Text style={styles.statLabel}>Total Listings</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Search and Filter Section */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search products, location..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearSearchIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {renderFilterChips()}
      </View>

      {/* Add Product Button */}
      <TouchableOpacity
        style={styles.addProductButton}
        onPress={() => setShowForm(true)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#4CAF50', '#45A049']}
          style={styles.addProductGradient}
        >
          <Text style={styles.addProductIcon}>➕</Text>
          <Text style={styles.addProductText}>List New Product</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Content */}
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading your marketplace...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>❌</Text>
          <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => dispatch(fetchMarketPosts())}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : filteredPosts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🌾</Text>
          <Text style={styles.emptyTitle}>No Products Listed Yet</Text>
          <Text style={styles.emptyText}>
            {searchQuery ? 
              'No products match your search. Try different keywords.' :
              'Start by listing your first agricultural product!'
            }
          </Text>
          {!searchQuery && (
            <TouchableOpacity 
              style={styles.emptyActionButton}
              onPress={() => setShowForm(true)}
            >
              <Text style={styles.emptyActionText}>List Your First Product</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredPosts}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ItemSeparatorComponent={() => <View style={styles.listSeparator} />}
        />
      )}

      {/* Form Modal */}
      {renderFormModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 25,
  },
  headerContent: {
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 15,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginHorizontal: 20,
  },
  searchSection: {
    backgroundColor: 'white',
    paddingVertical: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    marginHorizontal: 20,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  clearSearchIcon: {
    fontSize: 18,
    color: '#999',
    paddingLeft: 10,
  },
  filterContainer: {
    paddingHorizontal: 20,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterChipActive: {
    backgroundColor: '#E8F5E8',
    borderColor: '#4CAF50',
  },
  filterIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  filterText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#2E7D32',
    fontWeight: '600',
  },
  addProductButton: {
    margin: 20,
    borderRadius: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  addProductGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 15,
  },
  addProductIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  addProductText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  productCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  productCardExpanded: {
    elevation: 8,
    shadowOpacity: 0.16,
  },
  imageContainer: {
    position: 'relative',
    height: 220,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 48,
    opacity: 0.6,
  },
  priceTag: {
    position: 'absolute',
    top: 15,
    right: 15,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  priceText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  quantityBadge: {
    position: 'absolute',
    top: 15,
    left: 15,
    backgroundColor: 'rgba(46, 125, 50, 0.9)',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  quantityText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  productInfo: {
    padding: 20,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  productTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1B5E20',
    flex: 1,
    marginRight: 10,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusText: {
    fontSize: 11,
    color: '#2E7D32',
    fontWeight: '600',
  },
  productDescription: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
    marginBottom: 16,
  },
  detailsContainer: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailIcon: {
    fontSize: 16,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  callButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  callButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  ownerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  actionButtonIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#F44336',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20,
    opacity: 0.8,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  emptyActionButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 15,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  emptyActionText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  listContainer: {
    paddingTop: 10,
    paddingBottom: 30,
  },
  listSeparator: {
    height: 8,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  modalContent: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
    fontWeight: '600',
  },
  modalTitleContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1B5E20',
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 10,
    minWidth: 70,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  formScrollView: {
    flex: 1,
  },
  formSection: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginVertical: 8,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1B5E20',
    marginBottom: 16,
  },
  imagePickerContainer: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  imagePickerPlaceholder: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    borderRadius: 16,
  },
  imagePickerIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  imagePickerText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 4,
  },
  imagePickerSubtext: {
    fontSize: 14,
    color: '#666',
  },
  selectedImageContainer: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
  },
  selectedImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 12,
    alignItems: 'center',
  },
  changePhotoText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
    color: '#333',
  },
  formInputFilled: {
    borderColor: '#4CAF50',
    backgroundColor: '#F8FFF8',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInputContainer: {
    width: '48%',
  },
  formFooter: {
    height: 100,
  },
  blurContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurContent: {
    width: '90%',
    borderRadius: 20,
    overflow: 'hidden',
  },
});

export default MarketLink;