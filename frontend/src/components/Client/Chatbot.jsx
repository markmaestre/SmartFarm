import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  Alert, 
  Dimensions,
  StatusBar,
  Animated,
  SafeAreaView,
  Easing
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('window');

// Custom Gradient Component
const CustomGradient = ({ colors, style, children, start = { x: 0, y: 0 }, end = { x: 1, y: 0 } }) => {
  return (
    <View style={[{ backgroundColor: colors[0] }, style]}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: colors[1], opacity: 0.8 }]} />
      {children}
    </View>
  );
};

const Chatbot = ({ userId }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeChatId, setActiveChatId] = useState(null);
  const [chatList, setChatList] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const flatListRef = useRef(null);
  const sidebarAnimation = useRef(new Animated.Value(-width * 0.8)).current;
  const suggestionAnimation = useRef(new Animated.Value(0)).current;
  
  // Enhanced typing animation values
  const typingAnimations = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0)
  ]).current;

  const API_KEY = 'uOMuciSVg3xLWTIkcFzvfTyDQGZFKS2NhgWE5vm3';
  const API_URL = 'https://api.cohere.ai/v1/chat';
  const CHAT_HISTORY_KEY = `TaniMateChatHistory_${userId}`;
  const CHAT_LIST_KEY = `TaniMateChatList_${userId}`;

  // Enhanced suggested questions with better categorization
  const suggestedQuestions = [
    {
      id: 1,
      question: "Kumusta ka?",
      icon: "waving-hand",
      category: "greeting"
    },
    {
      id: 2,
      question: "Ano magandang itanim ngayon?",
      icon: "grass",
      category: "planting"
    },
    {
      id: 3,
      question: "Paano lumaban sa mga peste?",
      icon: "bug-report",
      category: "pest"
    },
    {
      id: 4,
      question: "Kelan maganda magtanim ng mais?",
      icon: "wb-sunny",
      category: "timing"
    },
    {
      id: 5,
      question: "Ano ang organic na pataba?",
      icon: "eco",
      category: "fertilizer"
    },
    {
      id: 6,
      question: "Paano malalaman kung may sakit ang halaman?",
      icon: "local-hospital",
      category: "health"
    },
    {
      id: 7,
      question: "Magkano kita sa pagtatanim?",
      icon: "attach-money",
      category: "economics"
    },
    {
      id: 8,
      question: "Paano mag-setup ng irrigation?",
      icon: "water-drop",
      category: "irrigation"
    }
  ];

  // Start typing animation
  const startTypingAnimation = () => {
    const animationSequence = (index) => {
      return Animated.sequence([
        Animated.timing(typingAnimations[index], {
          toValue: 1,
          duration: 300,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(typingAnimations[index], {
          toValue: 0,
          duration: 300,
          easing: Easing.ease,
          useNativeDriver: true,
          delay: 200,
        }),
      ]);
    };

    // Create an infinite loop for each dot
    const animateDot = (index) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 200),
          animationSequence(index)
        ])
      ).start();
    };

    // Start animations for all three dots
    typingAnimations.forEach((_, index) => {
      animateDot(index);
    });
  };

  // Stop typing animation
  const stopTypingAnimation = () => {
    typingAnimations.forEach(anim => anim.stopAnimation());
    typingAnimations.forEach(anim => anim.setValue(0));
  };

  // Enhanced animations
  const animateSidebar = (show) => {
    Animated.timing(sidebarAnimation, {
      toValue: show ? 0 : -width * 0.8,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const animateSuggestions = (show) => {
    Animated.timing(suggestionAnimation, {
      toValue: show ? 1 : 0,
      duration: 400,
      useNativeDriver: true,
    }).start();
  };

  // Load chat data
  useEffect(() => {
    const loadChatData = async () => {
      try {
        const savedChatList = await AsyncStorage.getItem(CHAT_LIST_KEY);
        if (savedChatList) {
          const parsedChatList = JSON.parse(savedChatList);
          setChatList(parsedChatList);
          
          if (parsedChatList.length > 0) {
            const lastChatId = parsedChatList[parsedChatList.length - 1].id;
            loadChatMessages(lastChatId);
            setActiveChatId(lastChatId);
          } else {
            createNewChat();
          }
        } else {
          createNewChat();
        }
      } catch (error) {
        console.error('Error loading chat data:', error);
        createNewChat();
      }
    };
    
    loadChatData();
  }, [userId]);

  // Animate suggestions when they appear
  useEffect(() => {
    if (showSuggestions) {
      animateSuggestions(true);
    }
  }, [showSuggestions]);

  // Animate sidebar
  useEffect(() => {
    animateSidebar(showSidebar);
  }, [showSidebar]);

  // Create new chat
  const createNewChat = async () => {
    const newChatId = Date.now().toString();
    const newChat = {
      id: newChatId,
      title: 'Bagong Usapan',
      createdAt: new Date().toISOString()
    };
    
    const updatedChatList = [...chatList, newChat];
    setChatList(updatedChatList);
    setActiveChatId(newChatId);
    
    const welcomeMessage = { 
      text: '👋 Kumusta! Ako si TaniMate! 🌱\n\nAko ang inyong kasama sa pagsasaka at pag-uusap! Pwede ninyong tanungin ako tungkol sa:\n\n🌾 Mga magandang itanim\n🐛 Paglaban sa mga peste\n💧 Tamang tubig at pataba\n🌤️ Panahon ng pagtatanim\n💰 Kikitain sa farming\n😊 O simpleng makipag-usap!\n\nAno ang gusto ninyong pag-usapan?', 
      isUser: false,
      timestamp: new Date().toISOString(),
      chatId: newChatId
    };
    
    setMessages([welcomeMessage]);
    setShowSuggestions(true);
    
    try {
      await AsyncStorage.setItem(CHAT_LIST_KEY, JSON.stringify(updatedChatList));
      await saveChatMessages(newChatId, [welcomeMessage]);
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  };

  // Load messages for a chat
  const loadChatMessages = async (chatId) => {
    try {
      const savedMessages = await AsyncStorage.getItem(`${CHAT_HISTORY_KEY}_${chatId}`);
      if (savedMessages) {
        const parsedMessages = JSON.parse(savedMessages);
        setMessages(parsedMessages);
        setShowSuggestions(parsedMessages.length <= 1);
      } else {
        const welcomeMessage = { 
          text: '👋 Kumusta! Ako si TaniMate! 🌱\n\nAko ang inyong kasama sa pagsasaka at pag-uusap! Pwede ninyong tanungin ako tungkol sa:\n\n🌾 Mga magandang itanim\n🐛 Paglaban sa mga peste\n💧 Tamang tubig at pataba\n🌤️ Panahon ng pagtatanim\n💰 Kikitain sa farming\n😊 O simpleng makipag-usap!\n\nAno ang gusto ninyong pag-usapan?', 
          isUser: false,
          timestamp: new Date().toISOString(),
          chatId
        };
        setMessages([welcomeMessage]);
        setShowSuggestions(true);
        await saveChatMessages(chatId, [welcomeMessage]);
      }
    } catch (error) {
      console.error('Error loading chat messages:', error);
    }
  };

  // Save messages
  const saveChatMessages = async (chatId, messagesToSave) => {
    try {
      await AsyncStorage.setItem(`${CHAT_HISTORY_KEY}_${chatId}`, JSON.stringify(messagesToSave));
    } catch (error) {
      console.error('Error saving chat messages:', error);
    }
  };

  // Save chat list
  useEffect(() => {
    const saveChatList = async () => {
      try {
        await AsyncStorage.setItem(CHAT_LIST_KEY, JSON.stringify(chatList));
      } catch (error) {
        console.error('Error saving chat list:', error);
      }
    };
    
    if (chatList.length > 0) {
      saveChatList();
    }
  }, [chatList]);

  // Save messages for active chat
  useEffect(() => {
    if (activeChatId && messages.length > 0) {
      saveChatMessages(activeChatId, messages);
    }
  }, [messages, activeChatId]);

  // Handle sending message
  const handleSend = async (messageText = null) => {
    const textToSend = messageText || inputText;
    if (!textToSend.trim()) return;

    const userMessage = { 
      text: textToSend, 
      isUser: true, 
      timestamp: new Date().toISOString(),
      chatId: activeChatId
    };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);
    startTypingAnimation();
    setShowSuggestions(false);
    animateSuggestions(false);

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          message: textToSend,
          preamble: `You are TaniMate, a friendly Filipino farming assistant chatbot. You are knowledgeable about agriculture in the Philippines and can also handle casual conversations.

CONVERSATION RULES:
- Always respond in Filipino/Tagalog
- Be warm, friendly, and conversational
- Handle greetings naturally (Kumusta, Hello, Hi, etc.)
- Answer simple questions about yourself
- For farming topics: give practical, actionable advice
- Use emojis appropriately to be engaging
- Be encouraging and supportive

FARMING EXPERTISE:
- Crop recommendations based on season/location
- Pest control methods (organic and conventional)
- Soil management and fertilizers
- Irrigation and water management
- Plant diseases and treatments  
- Market prices and profitability
- Farming techniques and best practices
- Post-harvest handling

PERSONALITY:
- Friendly neighborhood farming expert
- Patient and understanding
- Uses simple, clear language
- Encourages sustainable farming
- Supportive of small-scale farmers

SAMPLE RESPONSES:
- "Kumusta ka?" → "Ayos lang ako! Salamat sa tanong. Ikaw, kumusta ang inyong palayan/hardin?"
- "Ano magandang itanim?" → "Depende sa season at lugar mo! Ngayon [current month], maganda ang [specific crops]. Saan ka nakatira?"
- "Paano ka?" → "Mabuti naman ako! Handa akong tumulong sa inyong farming questions. May tanong ka ba?"

Always be helpful, never say you don't know - offer to help find the answer or suggest alternatives.`,
          model: 'command',
          temperature: 0.4,
        }),
      });

      const data = await response.json();
      if (data.text) {
        const botMessage = { 
          text: data.text, 
          isUser: false, 
          timestamp: new Date().toISOString(),
          chatId: activeChatId
        };
        setMessages(prev => [...prev, botMessage]);
        
        // Update chat title if this is the first user message
        if (messages.length === 1) {
          updateChatTitle(activeChatId, textToSend.substring(0, 30) + (textToSend.length > 30 ? '...' : ''));
        }
      } else {
        throw new Error('No response text');
      }
    } catch (error) {
      console.error('Error calling Cohere API:', error);
      const errorMessage = { 
        text: '🔧 Pasensya po, may problema sa pagsagot. Subukan ulit sa ilang sandali. Salamat sa inyong pasensya!', 
        isUser: false, 
        timestamp: new Date().toISOString(),
        chatId: activeChatId
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      stopTypingAnimation();
    }
  };

  // Handle suggestion press
  const handleSuggestionPress = (question) => {
    handleSend(question);
  };

  // Update chat title
  const updateChatTitle = (chatId, newTitle) => {
    setChatList(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, title: newTitle } : chat
    ));
  };

  // Start new chat
  const startNewChat = async () => {
    await createNewChat();
    setShowSidebar(false);
  };

  // Switch chat
  const switchChat = async (chatId) => {
    setActiveChatId(chatId);
    await loadChatMessages(chatId);
    setShowSidebar(false);
  };

  // Delete chat
  const deleteChat = async (chatId) => {
    Alert.alert(
      'Tanggalin ang Usapan',
      'Sigurado ka bang gusto mong tanggalin ang usapang ito?',
      [
        { text: 'Hindi', style: 'cancel' },
        { 
          text: 'Oo', 
          style: 'destructive',
          onPress: async () => {
            if (chatList.length <= 1) {
              Alert.alert('Hindi Pwede', 'Kailangan may isa kang usapan');
              return;
            }
            
            try {
              const updatedChatList = chatList.filter(chat => chat.id !== chatId);
              setChatList(updatedChatList);
              await AsyncStorage.removeItem(`${CHAT_HISTORY_KEY}_${chatId}`);
              
              if (chatId === activeChatId) {
                const newActiveChatId = updatedChatList[0].id;
                setActiveChatId(newActiveChatId);
                await loadChatMessages(newActiveChatId);
              }
            } catch (error) {
              console.error('Error deleting chat:', error);
            }
          }
        }
      ]
    );
  };

  // Auto-scroll to bottom
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  // Render message item with enhanced styling
  const renderMessage = ({ item, index }) => (
    <Animated.View 
      style={[
        styles.messageContainer, 
        item.isUser ? styles.userMessage : styles.botMessage,
        { 
          opacity: 1,
          transform: [
            {
              translateY: 0
            }
          ]
        }
      ]}
    >
      {!item.isUser && (
        <View style={styles.botHeader}>
          <View style={styles.botAvatar}>
            <Icon name="agriculture" size={16} color="white" />
          </View>
          <Text style={styles.botName}>TaniMate</Text>
        </View>
      )}
      <Text style={[styles.messageText, item.isUser ? styles.userMessageText : styles.botMessageText]}>
        {item.text}
      </Text>
      <Text style={[styles.timestamp, item.isUser ? styles.userTimestamp : styles.botTimestamp]}>
        {new Date(item.timestamp || new Date()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </Animated.View>
  );

  // Render chat list item with enhanced styling
  const renderChatItem = ({ item, index }) => (
    <TouchableOpacity 
      style={[
        styles.chatItem, 
        item.id === activeChatId && styles.activeChatItem
      ]}
      onPress={() => switchChat(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.chatItemIcon}>
        <Icon name="chat-bubble-outline" size={20} color={item.id === activeChatId ? '#2E7D32' : '#666'} />
      </View>
      <View style={styles.chatItemContent}>
        <Text style={[styles.chatItemText, item.id === activeChatId && styles.activeChatText]} numberOfLines={1}>
          {item.title || 'Bagong Usapan'}
        </Text>
        <Text style={styles.chatItemDate}>
          {new Date(item.createdAt).toLocaleDateString('tl-PH', { 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Text>
      </View>
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={() => deleteChat(item.id)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Icon name="delete-outline" size={18} color="#ff5252" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  // Enhanced suggestion item with better responsive design
  const renderSuggestion = ({ item, index }) => (
    <Animated.View
      style={[
        styles.suggestionWrapper,
        {
          opacity: suggestionAnimation,
          transform: [
            {
              translateY: suggestionAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        },
      ]}
    >
      <TouchableOpacity 
        style={styles.suggestionCard}
        onPress={() => handleSuggestionPress(item.question)}
        activeOpacity={0.8}
      >
        <View style={styles.suggestionIcon}>
          <Icon name={item.icon} size={22} color="#2E7D32" />
        </View>
        <Text style={styles.suggestionText}>{item.question}</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  // Enhanced typing indicator component
  const TypingIndicator = () => {
    return (
      <View style={[styles.messageContainer, styles.botMessage, styles.typingMessage]}>
        <View style={styles.botHeader}>
          <View style={styles.botAvatar}>
            <Icon name="agriculture" size={16} color="white" />
          </View>
          <Text style={styles.botName}>TaniMate</Text>
        </View>
        <View style={styles.typingIndicator}>
          {typingAnimations.map((anim, index) => (
            <Animated.View
              key={index}
              style={[
                styles.typingDot,
                {
                  transform: [
                    {
                      scale: anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1.2],
                      }),
                    },
                    {
                      translateY: anim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -5],
                      }),
                    },
                  ],
                  opacity: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1],
                  }),
                },
              ]}
            />
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#1B5E20" barStyle="light-content" />
      
      {/* Enhanced Header */}
      <CustomGradient
        colors={['#2E7D32', '#1B5E20']}
        style={styles.header}
      >
        <TouchableOpacity 
          onPress={() => setShowSidebar(!showSidebar)}
          style={styles.menuButton}
          activeOpacity={0.7}
        >
          <Icon name="menu" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <View style={styles.headerAvatar}>
            <Icon name="agriculture" size={20} color="white" />
          </View>
          <View>
            <Text style={styles.headerText}>TaniMate</Text>
            <Text style={styles.headerSubtext}>Farming Assistant</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          onPress={startNewChat} 
          style={styles.newChatButton}
          activeOpacity={0.7}
        >
          <Icon name="add-circle-outline" size={24} color="white" />
        </TouchableOpacity>
      </CustomGradient>
      
      {/* Enhanced Sidebar */}
      {showSidebar && (
        <View style={styles.sidebarOverlay}>
          <TouchableOpacity 
            style={styles.sidebarBackdrop}
            onPress={() => setShowSidebar(false)}
            activeOpacity={1}
          />
          <Animated.View 
            style={[
              styles.sidebar,
              {
                transform: [{ translateX: sidebarAnimation }],
              },
            ]}
          >
            <CustomGradient
              colors={['#2E7D32', '#1B5E20']}
              style={styles.sidebarHeader}
            >
              <Icon name="chat" size={24} color="white" />
              <Text style={styles.sidebarTitle}>Mga Usapan</Text>
            </CustomGradient>
            
            <FlatList
              data={chatList}
              renderItem={renderChatItem}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.chatListContent}
              showsVerticalScrollIndicator={false}
            />
          </Animated.View>
        </View>
      )}
      
      {/* Enhanced Main chat area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.chatArea}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages.filter(msg => msg.chatId === activeChatId)}
          renderItem={renderMessage}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          windowSize={10}
        />
        
        {/* Enhanced Suggested Questions */}
        {showSuggestions && messages.length <= 1 && (
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>💬 Subukan mo 'to:</Text>
            <FlatList
              data={suggestedQuestions}
              renderItem={renderSuggestion}
              keyExtractor={item => item.id.toString()}
              numColumns={2}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.suggestionsGrid}
              columnWrapperStyle={styles.suggestionRow}
            />
          </View>
        )}
        
        {/* Enhanced Typing indicator */}
        {isTyping && <TypingIndicator />}
        
        {/* Enhanced Input container */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Magtanong tungkol sa pagsasaka..."
              placeholderTextColor="#999"
              onSubmitEditing={() => handleSend()}
              multiline
              maxLength={500}
              textAlignVertical="center"
            />
            <TouchableOpacity 
              style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]} 
              onPress={() => handleSend()}
              disabled={!inputText.trim()}
              activeOpacity={0.8}
            >
              <Icon name="send" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  menuButton: {
    padding: 12,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 16,
  },
  headerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  headerText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  headerSubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  newChatButton: {
    padding: 12,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  sidebarOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    flexDirection: 'row',
  },
  sidebarBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sidebar: {
    width: Math.min(320, width * 0.85),
    height: '100%',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  sidebarHeader: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  sidebarTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  chatListContent: {
    paddingBottom: 100,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  activeChatItem: {
    backgroundColor: '#e8f5e9',
    borderRightWidth: 4,
    borderRightColor: '#2E7D32',
  },
  chatItemIcon: {
    marginRight: 12,
  },
  chatItemContent: {
    flex: 1,
  },
  chatItemText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
    fontWeight: '500',
  },
  activeChatText: {
    color: '#2E7D32',
    fontWeight: '600',
  },
  chatItemDate: {
    fontSize: 12,
    color: '#666',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
    borderRadius: 16,
  },
  chatArea: {
    flex: 1,
  },
  messagesContainer: {
    padding: 20,
    paddingBottom: 140,
  },
  messageContainer: {
    maxWidth: '85%',
    marginBottom: 16,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  botMessage: {
    alignSelf: 'flex-start',
    backgroundColor: 'white',
    borderBottomLeftRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#2E7D32',
    borderBottomRightRadius: 6,
    shadowColor: '#2E7D32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    elevation: 5,
  },
  botHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  botAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  botName: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '600',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
  },
  botMessageText: {
    color: '#333',
  },
  userMessageText: {
    color: 'white',
  },
  timestamp: {
    fontSize: 10,
    marginTop: 8,
    textAlign: 'right',
  },
  botTimestamp: {
    color: '#999',
  },
  userTimestamp: {
    color: 'rgba(255,255,255,0.7)',
  },
  typingMessage: {
    opacity: 0.8,
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    height: 30,
    justifyContent: 'center',
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2E7D32',
    marginHorizontal: 4,
  },
  inputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingBottom: 32,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 24,
    paddingHorizontal: 16,
    minHeight: 48,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    maxHeight: 120,
    paddingVertical: 12,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  suggestionsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  suggestionsTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
    fontWeight: '500',
  },
  suggestionsGrid: {
    paddingBottom: 20,
  },
  suggestionRow: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  suggestionWrapper: {
    width: '48%',
  },
  suggestionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    minHeight: 80,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  suggestionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e8f5e9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  suggestionText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
});

export default Chatbot;