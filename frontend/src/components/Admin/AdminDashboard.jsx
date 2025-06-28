import React, { useEffect } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  logout,
  fetchAllUsers,
  updateUserStatus,
} from '../../redux/slices/authSlice';
import { fetchMarketPosts } from '../../redux/slices/marketSlice';
import { useNavigation } from '@react-navigation/native';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const { user, users, loading: userLoading, error: userError } = useSelector(
    (state) => state.auth
  );
  const {
    posts,
    loading: postLoading,
    error: postError,
  } = useSelector((state) => state.market);

  const handleLogout = () => {
    dispatch(logout());
    navigation.replace('Login');
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      dispatch(fetchAllUsers());
      dispatch(fetchMarketPosts());
    }
  }, [dispatch, user]);

  const handleToggleBan = (id, currentStatus) => {
    const newStatus = currentStatus === 'banned' ? 'active' : 'banned';

    Alert.alert(
      `Confirm ${newStatus === 'banned' ? 'Ban' : 'Unban'}`,
      `Are you sure you want to ${newStatus} this user?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes',
          onPress: () => {
            dispatch(updateUserStatus({ id, status: newStatus }));
          },
        },
      ]
    );
  };

  const renderMarketPost = ({ item }) => (
    <View style={styles.postItem}>
      <Text style={styles.postTitle}>{item.productName}</Text>
      
      {/* Display all images */}
      {item.images && item.images.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {item.images.map((image, index) => (
            <Image
              key={index}
              source={{ uri: image }}
              style={styles.postImage}
              resizeMode="cover"
            />
          ))}
        </ScrollView>
      ) : item.image ? (
        <Image 
          source={{ uri: item.image }} 
          style={styles.postImage}
          resizeMode="cover"
        />
      ) : null}
      
      <Text style={styles.postDetail}>Description: {item.description}</Text>
      <Text style={styles.postDetail}>Price: ₱{item.price}</Text>
      <Text style={styles.postDetail}>Location: {item.location}</Text>
      <Text style={styles.postDetail}>Quantity: {item.availableQuantity}</Text>
      <Text style={styles.postDetail}>Contact: {item.contactNumber}</Text>
      <Text style={styles.postDetail}>Posted by: {item.userId?.username || 'Unknown'}</Text>
      <Text style={styles.postDetail}>Date: {new Date(item.createdAt).toLocaleDateString()}</Text>
      <Text style={styles.postDetail}>Status: {item.status || 'active'}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Welcome, {user?.username}</Text>
      <Button title="Logout" onPress={handleLogout} />

      {/* User Section */}
      <Text style={styles.sectionTitle}>User Activity</Text>

      {userLoading && <ActivityIndicator size="large" color="#0000ff" />}
      {userError && <Text style={styles.error}>Error: {userError}</Text>}

      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.userItem}>
            <Text style={styles.username}>{item.username}</Text>
            <Text>Email: {item.email}</Text>
            <Text>Role: {item.role}</Text>
            <Text>Status: {item.status}</Text>
            <Text>Registered: {new Date(item.createdAt).toLocaleDateString()}</Text>
            <Text>
              Last Login:{' '}
              {item.lastLogin ? new Date(item.lastLogin).toLocaleString() : 'Never'}
            </Text>
            {item._id !== user._id && (
              <Button
                title={item.status === 'banned' ? 'Unban' : 'Ban'}
                color={item.status === 'banned' ? 'green' : 'red'}
                onPress={() => handleToggleBan(item._id, item.status)}
              />
            )}
          </View>
        )}
        ListHeaderComponent={
          <>
            <Text style={styles.sectionTitle}>All Market Posts</Text>
            {postLoading && <ActivityIndicator size="large" color="#ff6600" />}
            {postError && <Text style={styles.error}>Error: {postError}</Text>}
          </>
        }
        ListFooterComponent={
          <FlatList
            data={posts}
            keyExtractor={(item) => item._id}
            renderItem={renderMarketPost}
          />
        }
      />
    </View>
  );
};

export default AdminDashboard;

const styles = StyleSheet.create({
  container: { 
    padding: 20, 
    flex: 1, 
    backgroundColor: '#f9f9f9' 
  },
  welcome: { 
    fontSize: 24, 
    marginBottom: 10,
    fontWeight: 'bold',
    color: '#333',
  },
  sectionTitle: { 
    fontSize: 20, 
    marginTop: 20, 
    marginBottom: 10,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  userItem: {
    padding: 15,
    marginVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  postItem: {
    padding: 15,
    marginVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  username: { 
    fontSize: 18, 
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  postTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#2980b9',
    marginBottom: 10,
  },
  postDetail: {
    fontSize: 14,
    marginBottom: 5,
    color: '#34495e',
  },
  postImage: {
    width: 250,
    height: 200,
    borderRadius: 8,
    marginRight: 10,
    marginBottom: 10,
  },
  error: { 
    color: '#e74c3c', 
    marginVertical: 10,
    textAlign: 'center',
  },
});