import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Dimensions,
  Platform
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  fetchDiaries,
  addDiary,
  updateDiary,
  deleteDiary
} from '../../redux/slices/farmDiarySlice';

const { width } = Dimensions.get('window');

const FarmDiary = () => {
  const dispatch = useDispatch();
  const { diaries, loading } = useSelector(state => state.farmDiary);

  const [form, setForm] = useState({
    date: new Date(),
    weather: '',
    temperature: '',
    activities: '',
    issues: '',
    expenses: 0,
    notes: ''
  });

  const [editId, setEditId] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [expenseModalVisible, setExpenseModalVisible] = useState(false);
  const [tempExpenseAmount, setTempExpenseAmount] = useState('');

  // Weather options for manual selection
  const weatherOptions = [
    { label: 'Sunny', icon: '☀️', value: 'sunny' },
    { label: 'Partly Cloudy', icon: '⛅', value: 'partly-cloudy' },
    { label: 'Cloudy', icon: '☁️', value: 'cloudy' },
    { label: 'Rainy', icon: '🌧️', value: 'rainy' },
    { label: 'Stormy', icon: '⛈️', value: 'stormy' },
    { label: 'Windy', icon: '💨', value: 'windy' }
  ];

  useEffect(() => {
    dispatch(fetchDiaries());
    // Set today's date by default
    setForm(prev => ({ ...prev, date: new Date() }));
    // Fetch current weather
    fetchCurrentWeather();
  }, [dispatch]);

  const fetchCurrentWeather = async () => {
    setWeatherLoading(true);
    try {
      // Get user's location first
      const position = await getCurrentLocation();
      
      if (position) {
        const { latitude, longitude } = position.coords;
        
        // Using OpenWeatherMap free API (you need to get API key from openweathermap.org)
        const API_KEY = 'YOUR_API_KEY_HERE'; // Replace with your actual API key
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`;
        
        const response = await fetch(weatherUrl);
        const data = await response.json();
        
        if (data.main && data.weather) {
          const temp = Math.round(data.main.temp);
          const weatherCondition = mapWeatherCondition(data.weather[0].main, data.weather[0].description);
          
          setForm(prev => ({
            ...prev,
            weather: weatherCondition,
            temperature: `${temp}°C`
          }));
        }
      } else {
        // Fallback to Philippines weather API if location is not available
        await fetchPhilippinesWeather();
      }
    } catch (error) {
      console.error('Error fetching weather:', error);
      // Fallback to Philippines weather
      await fetchPhilippinesWeather();
    } finally {
      setWeatherLoading(false);
    }
  };

  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => resolve(position),
          (error) => {
            console.log('Location access denied, using fallback');
            resolve(null);
          },
          { timeout: 10000, enableHighAccuracy: true }
        );
      } else {
        resolve(null);
      }
    });
  };

  const fetchPhilippinesWeather = async () => {
    try {
      // Using free weather API for Philippines (Quezon City coordinates)
      const lat = 14.6760;
      const lon = 121.0437;
      
      // Alternative: Use weatherapi.com (free tier available)
      const API_KEY = 'YOUR_WEATHERAPI_KEY'; // Get from weatherapi.com
      const weatherUrl = `http://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${lat},${lon}&aqi=no`;
      
      const response = await fetch(weatherUrl);
      const data = await response.json();
      
      if (data.current) {
        const temp = Math.round(data.current.temp_c);
        const weatherCondition = mapWeatherApiCondition(data.current.condition.text);
        
        setForm(prev => ({
          ...prev,
          weather: weatherCondition,
          temperature: `${temp}°C`
        }));
      }
    } catch (error) {
      console.error('Error fetching Philippines weather:', error);
      // Set default values if all APIs fail
      setForm(prev => ({
        ...prev,
        weather: 'partly-cloudy',
        temperature: 'Unable to fetch'
      }));
    }
  };

  const mapWeatherCondition = (main, description) => {
    const condition = main.toLowerCase();
    const desc = description.toLowerCase();
    
    if (condition.includes('clear')) return 'sunny';
    if (condition.includes('cloud')) {
      if (desc.includes('few') || desc.includes('scattered')) return 'partly-cloudy';
      return 'cloudy';
    }
    if (condition.includes('rain') || condition.includes('drizzle')) return 'rainy';
    if (condition.includes('thunder') || condition.includes('storm')) return 'stormy';
    if (condition.includes('wind')) return 'windy';
    
    return 'partly-cloudy'; // default
  };

  const mapWeatherApiCondition = (condition) => {
    const cond = condition.toLowerCase();
    
    if (cond.includes('sunny') || cond.includes('clear')) return 'sunny';
    if (cond.includes('partly cloudy') || cond.includes('partial')) return 'partly-cloudy';
    if (cond.includes('cloudy') || cond.includes('overcast')) return 'cloudy';
    if (cond.includes('rain') || cond.includes('drizzle') || cond.includes('shower')) return 'rainy';
    if (cond.includes('thunder') || cond.includes('storm')) return 'stormy';
    if (cond.includes('wind')) return 'windy';
    
    return 'partly-cloudy'; // default
  };

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setForm(prev => ({ ...prev, date: selectedDate }));
    }
  };

  const handleExpenseAdd = () => {
    const amount = parseFloat(tempExpenseAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid expense amount.');
      return;
    }
    
    setForm(prev => ({ ...prev, expenses: prev.expenses + amount }));
    setTempExpenseAmount('');
    setExpenseModalVisible(false);
  };

  const handleSubmit = () => {
    if (!form.date) {
      return Alert.alert("Validation", "Date is required.");
    }

    const formData = {
      ...form,
      date: form.date.toISOString()
    };

    if (editId) {
      dispatch(updateDiary({ id: editId, data: formData }));
      Alert.alert("Success", "Diary updated successfully", [
        { text: "OK", onPress: resetForm }
      ]);
    } else {
      dispatch(addDiary(formData));
      Alert.alert("Success", "Diary entry added successfully", [
        { text: "OK", onPress: resetForm }
      ]);
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this entry?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          onPress: () => {
            dispatch(deleteDiary(id));
            Alert.alert("Deleted", "Entry deleted successfully");
          },
          style: "destructive"
        }
      ]
    );
  };

  const handleEdit = (entry) => {
    setForm({
      date: new Date(entry.date),
      weather: entry.weather || '',
      temperature: entry.temperature || '',
      activities: entry.activities || '',
      issues: entry.issues || '',
      expenses: entry.expenses || 0,
      notes: entry.notes || ''
    });
    setEditId(entry._id);
  };

  const resetForm = () => {
    setForm({
      date: new Date(),
      weather: '',
      temperature: '',
      activities: '',
      issues: '',
      expenses: 0,
      notes: ''
    });
    setEditId(null);
    fetchCurrentWeather();
  };

  const getWeatherIcon = (weather) => {
    const weatherOption = weatherOptions.find(option => option.value === weather);
    return weatherOption ? weatherOption.icon : '🌤️';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
    
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {editId ? "Edit Farm Diary" : "Farm Diary"}
        </Text>
        <Text style={styles.headerSubtitle}>
          {editId ? "Update your entry" : "Record your daily farm activities"}
        </Text>
      </View>

      {/* Form Card */}
      <View style={styles.formCard}>
        {/* Date Section */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>📅 Date</Text>
          <TouchableOpacity 
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateButtonText}>
              {form.date.toLocaleDateString('en-PH', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
            <Icon name="calendar-today" size={20} color="#4A90E2" />
          </TouchableOpacity>
        </View>

        <View style={styles.inputSection}>
          <View style={styles.weatherHeader}>
            <Text style={styles.inputLabel}>🌤️ Weather</Text>
            <TouchableOpacity 
              onPress={fetchCurrentWeather}
              style={styles.refreshButton}
              disabled={weatherLoading}
            >
              {weatherLoading ? (
                <ActivityIndicator size="small" color="#4A90E2" />
              ) : (
                <Icon name="refresh" size={20} color="#4A90E2" />
              )}
            </TouchableOpacity>
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.weatherOptions}>
            {weatherOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.weatherOption,
                  form.weather === option.value && styles.weatherOptionSelected
                ]}
                onPress={() => handleChange('weather', option.value)}
              >
                <Text style={styles.weatherIcon}>{option.icon}</Text>
                <Text style={[
                  styles.weatherLabel,
                  form.weather === option.value && styles.weatherLabelSelected
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          {form.temperature && (
            <Text style={styles.temperatureText}>Temperature: {form.temperature}</Text>
          )}
        </View>

        {/* Activities Section */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>👨‍🌾 Activities</Text>
          <TextInput
            placeholder="What did you do today? (e.g., watering, harvesting, planting)"
            value={form.activities}
            onChangeText={(val) => handleChange('activities', val)}
            style={styles.textInput}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Issues Section */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>⚠️ Issues & Observations</Text>
          <TextInput
            placeholder="Any problems, pests, or observations?"
            value={form.issues}
            onChangeText={(val) => handleChange('issues', val)}
            style={styles.textInput}
            multiline
            numberOfLines={2}
          />
        </View>

        {/* Expenses Section */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>💰 Expenses</Text>
          <View style={styles.expenseContainer}>
            <View style={styles.expenseDisplay}>
              <Text style={styles.expenseAmount}>{formatCurrency(form.expenses)}</Text>
              <Text style={styles.expenseLabel}>Total Expenses</Text>
            </View>
            <TouchableOpacity
              style={styles.addExpenseButton}
              onPress={() => setExpenseModalVisible(true)}
            >
              <Icon name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          {form.expenses > 0 && (
            <TouchableOpacity
              style={styles.clearExpensesButton}
              onPress={() => handleChange('expenses', 0)}
            >
              <Text style={styles.clearExpensesText}>Clear Expenses</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Notes Section */}
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>📝 Additional Notes</Text>
          <TextInput
            placeholder="Any additional thoughts or reminders?"
            value={form.notes}
            onChangeText={(val) => handleChange('notes', val)}
            style={styles.textInput}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleSubmit}
          >
            <Icon name={editId ? "edit" : "save"} size={20} color="#fff" />
            <Text style={styles.buttonText}>
              {editId ? "Update Entry" : "Save Entry"}
            </Text>
          </TouchableOpacity>
          
          {editId && (
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={resetForm}
            >
              <Icon name="cancel" size={20} color="#666" />
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Entries List */}
      <View style={styles.entriesSection}>
        <Text style={styles.sectionTitle}>📚 Previous Entries</Text>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4A90E2" />
            <Text style={styles.loadingText}>Loading entries...</Text>
          </View>
        ) : diaries.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📝</Text>
            <Text style={styles.emptyTitle}>No entries yet</Text>
            <Text style={styles.emptySubtitle}>Start by creating your first farm diary entry!</Text>
          </View>
        ) : (
          diaries.map((entry) => (
            <View key={entry._id} style={styles.entryCard}>
              <View style={styles.entryHeader}>
                <View style={styles.entryDateContainer}>
                  <Text style={styles.entryDate}>
                    {new Date(entry.date).toLocaleDateString('en-PH', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </Text>
                  <Text style={styles.entryWeather}>
                    {getWeatherIcon(entry.weather)} {entry.temperature}
                  </Text>
                </View>
                <View style={styles.entryActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleEdit(entry)}
                  >
                    <Icon name="edit" size={18} color="#4A90E2" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDelete(entry._id)}
                  >
                    <Icon name="delete" size={18} color="#E74C3C" />
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.entryContent}>
                {entry.activities && (
                  <Text style={styles.entryText}>
                    <Text style={styles.entryLabel}>Activities: </Text>
                    {entry.activities}
                  </Text>
                )}
                {entry.issues && (
                  <Text style={styles.entryText}>
                    <Text style={styles.entryLabel}>Issues: </Text>
                    {entry.issues}
                  </Text>
                )}
                {entry.expenses > 0 && (
                  <Text style={styles.entryText}>
                    <Text style={styles.entryLabel}>Expenses: </Text>
                    {formatCurrency(entry.expenses)}
                  </Text>
                )}
                {entry.notes && (
                  <Text style={styles.entryText}>
                    <Text style={styles.entryLabel}>Notes: </Text>
                    {entry.notes}
                  </Text>
                )}
              </View>
            </View>
          ))
        )}
      </View>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={form.date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}

      {/* Expense Modal */}
      <Modal
        visible={expenseModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setExpenseModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Expense</Text>
            <TextInput
              style={styles.expenseInput}
              placeholder="Enter amount (PHP)"
              value={tempExpenseAmount}
              onChangeText={setTempExpenseAmount}
              keyboardType="numeric"
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setExpenseModalVisible(false);
                  setTempExpenseAmount('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.addButton]}
                onPress={handleExpenseAdd}
              >
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA'
  },
  header: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 20,
    paddingVertical: 30,
    paddingTop: 50
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center'
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E3F2FD',
    textAlign: 'center',
    marginTop: 5
  },
  formCard: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 15,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8
  },
  inputSection: {
    marginBottom: 20
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 8
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 15,
    backgroundColor: '#F8F9FA'
  },
  dateButtonText: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '500'
  },
  weatherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  refreshButton: {
    padding: 5
  },
  weatherOptions: {
    marginBottom: 10
  },
  weatherOption: {
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#F8F9FA',
    minWidth: 80
  },
  weatherOptionSelected: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2'
  },
  weatherIcon: {
    fontSize: 20,
    marginBottom: 4
  },
  weatherLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center'
  },
  weatherLabelSelected: {
    color: '#fff',
    fontWeight: '600'
  },
  temperatureText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic'
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#F8F9FA',
    textAlignVertical: 'top'
  },
  expenseContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  expenseDisplay: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0'
  },
  expenseAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50'
  },
  expenseLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2
  },
  addExpenseButton: {
    backgroundColor: '#27AE60',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10
  },
  clearExpensesButton: {
    marginTop: 8,
    alignSelf: 'flex-start'
  },
  clearExpensesText: {
    color: '#E74C3C',
    fontSize: 14,
    textDecorationLine: 'underline'
  },
  actionButtons: {
    marginTop: 10
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 8,
    marginBottom: 10
  },
  primaryButton: {
    backgroundColor: '#4A90E2'
  },
  secondaryButton: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E0E0E0'
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8
  },
  secondaryButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8
  },
  entriesSection: {
    margin: 20,
    marginTop: 0
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 15
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#fff',
    borderRadius: 15,
    elevation: 2
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 10
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 5
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center'
  },
  entryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0'
  },
  entryDateContainer: {
    flex: 1
  },
  entryDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50'
  },
  entryWeather: {
    fontSize: 14,
    color: '#666',
    marginTop: 2
  },
  entryActions: {
    flexDirection: 'row'
  },
  actionButton: {
    padding: 8,
    marginLeft: 5
  },
  entryContent: {
    gap: 8
  },
  entryText: {
    fontSize: 14,
    color: '#2C3E50',
    lineHeight: 20
  },
  entryLabel: {
    fontWeight: '600',
    color: '#4A90E2'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 25,
    width: width * 0.85,
    elevation: 5
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 20
  },
  expenseInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center'
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  cancelButton: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E0E0E0'
  },
  addButton: {
    backgroundColor: '#27AE60'
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600'
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600'
  }
});

export default FarmDiary;