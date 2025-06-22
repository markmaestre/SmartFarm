import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/slices/authSlice';
import { useNavigation } from '@react-navigation/native';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const user = useSelector(state => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    navigation.replace('Login');
  };

  if (!user) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Welcome, {user.username}</Text>
      <Text style={styles.info}>Role: {user.role}</Text>

      {/* User ID is hidden (can still be used in background logic) */}
      {/* console.log("Admin ID:", user.id); */}

      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
};

export default AdminDashboard;

const styles = StyleSheet.create({
  container: { padding: 20 },
  welcome: { fontSize: 24, marginBottom: 10 },
  info: { fontSize: 16, marginBottom: 20 },
});
