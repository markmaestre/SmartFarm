import React, { useEffect } from 'react';
import { View, Text, Button, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { logout, fetchAllUsers } from '../../redux/slices/authSlice';
import { useNavigation } from '@react-navigation/native';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { user, users, loading, error } = useSelector(state => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigation.replace('Login');
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      dispatch(fetchAllUsers());
    }
  }, [dispatch, user]);

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Welcome, {user?.username}</Text>
      {/* Removed role display */}
      <Button title="Logout" onPress={handleLogout} />

      {loading && <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 20 }} />}
      {error && <Text style={styles.error}>Error: {error}</Text>}

      <Text style={styles.sectionTitle}>User Activity</Text>
      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.userItem}>
            <Text style={styles.username}>{item.username}</Text>
            <Text>Email: {item.email}</Text>
            <Text>Role: {item.role}</Text>
            <Text>Registered: {new Date(item.createdAt).toLocaleDateString()}</Text>
            <Text>Last Login: {item.lastLogin ? new Date(item.lastLogin).toLocaleString() : 'Never'}</Text>
          </View>
        )}
      />
    </View>
  );
};

export default AdminDashboard;

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, backgroundColor: '#f0f0f0' },
  welcome: { fontSize: 24, marginBottom: 10 },
  sectionTitle: { fontSize: 20, marginTop: 20, fontWeight: 'bold' },
  userItem: { padding: 10, marginVertical: 5, backgroundColor: '#fff', borderRadius: 8, elevation: 2 },
  username: { fontSize: 16, fontWeight: 'bold' },
  error: { color: 'red', marginTop: 10 },
});
