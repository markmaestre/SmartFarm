import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider } from 'react-redux';
import store from "../redux/store/store";

import Dashboard from '../components/Dashboard/Home';
import Login from '../components/Dashboard/Login'; 
import Register from '../components/Dashboard/Register';
import AdminDashboard from '../components/Admin/AdminDashboard';
import UserDashboard from '../components/Client/UserDashboard';
import Elearning from '../components/Client/Elearning';
import Chatbot from '../components/Client/Chatbot';
import FarmDiary from '../components/Client/FarmDiary';
import MarketLink from '../components/Client/MarketLink';
import Weather from '../components/Client/Weather';

const Stack = createStackNavigator();

const screenOptions = {
  headerStyle: {
    backgroundColor: '#2196F3',
  },
  headerTintColor: '#fff',
  headerTitleStyle: {
    fontWeight: 'bold',
  },
  headerShown: false, 
};

const Navigator = () => {
  return (
    <Provider store={store}>
      <Stack.Navigator initialRouteName="Dashboard" screenOptions={screenOptions}>
        <Stack.Screen name="Dashboard" component={Dashboard} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
        <Stack.Screen name="UserDashboard" component={UserDashboard} />
        <Stack.Screen name="Elearning" component={Elearning} />
        <Stack.Screen name="Chatbot" component={Chatbot} />
        <Stack.Screen name="FarmDiary" component={FarmDiary} />
        <Stack.Screen name="MarketLink" component={MarketLink} />
        <Stack.Screen name="Weather" component={Weather} />

      </Stack.Navigator>
    </Provider>
  );
};

export default Navigator;
