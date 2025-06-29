import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Dimensions,
  Modal,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
  logout,
  fetchAllUsers,
  updateUserStatus,
} from '../../redux/slices/authSlice';
import { fetchMarketPosts } from '../../redux/slices/marketSlice';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.75;

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [userManagementTab, setUserManagementTab] = useState('active');

  const { user, users, loading: userLoading, error: userError } = useSelector(
    (state) => state.auth
  );
  const {
    posts,
    loading: postLoading,
    error: postError,
  } = useSelector((state) => state.market);

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
          style: newStatus === 'banned' ? 'destructive' : 'default',
          onPress: () => {
            dispatch(updateUserStatus({ id, status: newStatus }));
          },
        },
      ]
    );
  };

  const menuItems = [
    { id: 'dashboard', title: 'Dashboard', icon: '📊' },
    { id: 'users', title: 'User Management', icon: '👥' },
    { id: 'posts', title: 'Market Posts', icon: '🛒' },
    { id: 'analytics', title: 'Analytics', icon: '📈' },
    { id: 'settings', title: 'Settings', icon: '⚙️' },
  ];

  const getStats = () => {
    const totalUsers = users?.length || 0;
    const activeUsers = users?.filter(u => u.status === 'active' && u.role !== 'admin').length || 0;
    const bannedUsers = users?.filter(u => u.status === 'banned').length || 0;
    const totalPosts = posts?.length || 0;
    const activePosts = posts?.filter(p => p.status === 'active').length || 0;

    return { totalUsers, activeUsers, bannedUsers, totalPosts, activePosts };
  };

  const getRecentActivity = () => {
    const activities = [];
    
    if (users) {
      users
        .filter(u => {
          const userDate = new Date(u.createdAt);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return userDate >= weekAgo;
        })
        .forEach(user => {
          activities.push({
            id: `user-${user._id}`,
            type: 'user_registered',
            title: 'New User Registration',
            description: `${user.username} joined the platform`,
            timestamp: new Date(user.createdAt).getTime(),
            icon: '👤',
            color: '#3498db'
          });
        });
    }

    if (posts) {
      posts
        .filter(p => {
          const postDate = new Date(p.createdAt);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return postDate >= weekAgo;
        })
        .forEach(post => {
          activities.push({
            id: `post-${post._id}`,
            type: 'post_created',
            title: 'New Market Post',
            description: `${post.productName} posted by ${post.userId?.username || 'Unknown'}`,
            timestamp: new Date(post.createdAt).getTime(),
            icon: '🛒',
            color: '#2ecc71'
          });
        });
    }

    if (users) {
      users
        .filter(u => {
          if (u.status === 'banned' && u.updatedAt) {
            const updateDate = new Date(u.updatedAt);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return updateDate >= weekAgo;
          }
          return false;
        })
        .forEach(user => {
          activities.push({
            id: `ban-${user._id}`,
            type: 'user_banned',
            title: 'User Status Changed',
            description: `${user.username} was banned`,
            timestamp: new Date(user.updatedAt).getTime(),
            icon: '🚫',
            color: '#e74c3c'
          });
        });
    }

    return activities
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5);
  };

  const filteredUsers = users?.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch && user.role !== 'admin' && user.status === 'active';
  });

  const filteredBannedUsers = users?.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch && user.status === 'banned';
  });

  const filteredPosts = posts?.filter(post => {
    const matchesSearch = post.productName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (post.userId?.username && post.userId.username.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const renderDrawer = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isDrawerOpen}
      onRequestClose={() => setIsDrawerOpen(false)}
    >
      <View style={styles.drawerOverlay}>
        <View style={styles.drawerContainer}>
          <SafeAreaView style={styles.drawerContent}>
            <View style={styles.drawerHeader}>
              <View style={styles.adminAvatar}>
                <Text style={styles.avatarText}>
                  {user?.username?.charAt(0).toUpperCase()}
                </Text>
              </View>
              <Text style={styles.adminName}>{user?.username}</Text>
              <Text style={styles.adminRole}>Administrator</Text>
            </View>

            <ScrollView style={styles.menuContainer}>
              {menuItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.menuItem,
                    activeTab === item.id && styles.activeMenuItem
                  ]}
                  onPress={() => {
                    setActiveTab(item.id);
                    setIsDrawerOpen(false);
                    setSearchQuery('');
                  }}
                >
                  <Text style={styles.menuIcon}>{item.icon}</Text>
                  <Text style={[
                    styles.menuText,
                    activeTab === item.id && styles.activeMenuText
                  ]}>
                    {item.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutIcon}>🚪</Text>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </View>
        <TouchableOpacity 
          style={styles.drawerBackdrop} 
          onPress={() => setIsDrawerOpen(false)}
        />
      </View>
    </Modal>
  );

  const renderStatsCard = (title, value, icon, color) => (
    <View style={[styles.statsCard, { borderLeftColor: color }]}>
      <View style={styles.statsHeader}>
        <Text style={styles.statsIcon}>{icon}</Text>
        <Text style={styles.statsValue}>{value}</Text>
      </View>
      <Text style={styles.statsTitle}>{title}</Text>
    </View>
  );

  const renderActivityItem = ({ item }) => (
    <View style={styles.activityItem}>
      <View style={[styles.activityIcon, { backgroundColor: item.color }]}>
        <Text style={styles.activityIconText}>{item.icon}</Text>
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityTitle}>{item.title}</Text>
        <Text style={styles.activityDescription}>{item.description}</Text>
        <Text style={styles.activityTime}>
          {new Date(item.timestamp).toLocaleString()}
        </Text>
      </View>
    </View>
  );

  const renderDashboard = () => {
    const stats = getStats();
    const recentActivity = getRecentActivity();
    
    return (
      <ScrollView style={styles.contentContainer}>
        <Text style={styles.sectionTitle}>Dashboard Overview</Text>
        
        <View style={styles.statsGrid}>
          {renderStatsCard('Total Users', stats.totalUsers, '👥', '#3498db')}
          {renderStatsCard('Active Users', stats.activeUsers, '✅', '#2ecc71')}
          {renderStatsCard('Banned Users', stats.bannedUsers, '🚫', '#e74c3c')}
          {renderStatsCard('Total Posts', stats.totalPosts, '📝', '#f39c12')}
        </View>

        <View style={styles.quickActions}>
          <Text style={styles.quickActionsTitle}>Quick Actions</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#3498db' }]}
              onPress={() => setActiveTab('users')}
            >
              <Text style={styles.actionButtonText}>Manage Users</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: '#2ecc71' }]}
              onPress={() => setActiveTab('posts')}
            >
              <Text style={styles.actionButtonText}>View Posts</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.activityContainer}>
          <Text style={styles.activityTitle}>Recent Activity</Text>
          {recentActivity.length > 0 ? (
            <FlatList
              data={recentActivity}
              keyExtractor={(item) => item.id}
              renderItem={renderActivityItem}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.noActivityContainer}>
              <Text style={styles.noActivityText}>No recent activity</Text>
            </View>
          )}
        </View>
      </ScrollView>
    );
  };

  const renderUserItem = ({ item }) => (
    <View style={styles.listItem}>
      <View style={styles.listItemHeader}>
        <View style={styles.userAvatar}>
          <Text style={styles.userAvatarText}>
            {item.username.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.listItemInfo}>
          <Text style={styles.listItemTitle}>{item.username}</Text>
          <Text style={styles.listItemSubtitle}>{item.email}</Text>
        </View>
        <View style={[
          styles.statusBadge, 
          { 
            backgroundColor: item.status === 'active' ? '#2ecc71' : '#e74c3c'
          }
        ]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      
      <View style={styles.listItemDetails}>
        <Text style={styles.detailText}>Role: {item.role}</Text>
        <Text style={styles.detailText}>
          Registered: {new Date(item.createdAt).toLocaleDateString()}
        </Text>
        <Text style={styles.detailText}>
          Last Login: {item.lastLogin ? new Date(item.lastLogin).toLocaleString() : 'Never'}
        </Text>
      </View>

      {item._id !== user._id && (
        <TouchableOpacity
          style={[
            styles.actionButtonSmall,
            { 
              backgroundColor: item.status === 'banned' ? '#2ecc71' : '#e74c3c',
            }
          ]}
          onPress={() => handleToggleBan(item._id, item.status)}
        >
          <Text style={styles.actionButtonTextSmall}>
            {item.status === 'banned' ? 'Unban User' : 'Ban User'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderMarketPost = ({ item }) => (
    <View style={styles.listItem}>
      <View style={styles.listItemHeader}>
        <View style={styles.listItemInfo}>
          <Text style={styles.listItemTitle}>{item.productName}</Text>
          <Text style={styles.listItemSubtitle}>₱{item.price}</Text>
        </View>
        <View style={[
          styles.statusBadge, 
          { backgroundColor: item.status === 'active' ? '#2ecc71' : '#f39c12' }
        ]}>
          <Text style={styles.statusText}>{item.status || 'active'}</Text>
        </View>
      </View>

      {item.images && item.images.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageContainer}>
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
          style={styles.postImageSingle}
          resizeMode="cover"
        />
      ) : null}
      
      <View style={styles.listItemDetails}>
        <Text style={styles.detailText}>Description: {item.description}</Text>
        <Text style={styles.detailText}>Location: {item.location}</Text>
        <Text style={styles.detailText}>Quantity: {item.availableQuantity}</Text>
        <Text style={styles.detailText}>Contact: {item.contactNumber}</Text>
        <Text style={styles.detailText}>
          Posted by: {item.userId?.username || 'Unknown'}
        </Text>
        <Text style={styles.detailText}>
          Date: {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );

  const renderUserManagement = () => {
    return (
      <View style={styles.contentContainer}>
        <Text style={styles.sectionTitle}>User Management</Text>
        
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              userManagementTab === 'active' && styles.activeTabButton
            ]}
            onPress={() => setUserManagementTab('active')}
          >
            <Text style={[
              styles.tabButtonText,
              userManagementTab === 'active' && styles.activeTabButtonText
            ]}>
              Active Users
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.tabButton,
              userManagementTab === 'banned' && styles.activeTabButton
            ]}
            onPress={() => setUserManagementTab('banned')}
          >
            <Text style={[
              styles.tabButtonText,
              userManagementTab === 'banned' && styles.activeTabButtonText
            ]}>
              Banned Users
            </Text>
          </TouchableOpacity>
        </View>
        
        {userLoading && <ActivityIndicator size="large" color="#3498db" />}
        {userError && <Text style={styles.error}>Error: {userError}</Text>}
        
        {userManagementTab === 'active' ? (
          <FlatList
            data={filteredUsers || []}
            keyExtractor={(item) => item._id}
            renderItem={renderUserItem}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyList}>
                <Text style={styles.emptyListText}>No active users found</Text>
              </View>
            }
          />
        ) : (
          <FlatList
            data={filteredBannedUsers || []}
            keyExtractor={(item) => item._id}
            renderItem={renderUserItem}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyList}>
                <Text style={styles.emptyListText}>No banned users found</Text>
              </View>
            }
          />
        )}
      </View>
    );
  };

  const renderContent = () => {
    if (activeTab === 'dashboard') {
      return renderDashboard();
    }

    if (activeTab === 'users') {
      return renderUserManagement();
    }

    if (activeTab === 'posts') {
      return (
        <View style={styles.contentContainer}>
          <Text style={styles.sectionTitle}>Market Posts</Text>
          
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search posts..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          
          {postLoading && <ActivityIndicator size="large" color="#3498db" />}
          {postError && <Text style={styles.error}>Error: {postError}</Text>}
          
          <FlatList
            data={filteredPosts}
            keyExtractor={(item) => item._id}
            renderItem={renderMarketPost}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyList}>
                <Text style={styles.emptyListText}>No posts found</Text>
              </View>
            }
          />
        </View>
      );
    }

    return (
      <View style={styles.contentContainer}>
        <Text style={styles.sectionTitle}>
          {menuItems.find(item => item.id === activeTab)?.title || 'Coming Soon'}
        </Text>
        <Text style={styles.comingSoon}>This feature is coming soon!</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => setIsDrawerOpen(true)}
        >
          <Text style={styles.menuButtonText}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <View style={styles.headerRight} />
      </View>

      {renderContent()}

      {renderDrawer()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuButton: {
    padding: 8,
  },
  menuButtonText: {
    fontSize: 24,
    color: '#2c3e50',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  headerRight: {
    width: 40,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statsCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    width: '48%',
    marginBottom: 15,
    borderLeftWidth: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statsIcon: {
    fontSize: 24,
  },
  statsValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statsTitle: {
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  quickActions: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 30,
  },
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  activityContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  activityIconText: {
    fontSize: 18,
  },
  activityContent: {
    flex: 1,
  },
  activityDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: '#95a5a6',
  },
  noActivityContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noActivityText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  listItem: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 15,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  listItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#3498db',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  userAvatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  listItemInfo: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  listItemSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  listItemDetails: {
    marginBottom: 15,
  },
  detailText: {
    fontSize: 14,
    color: '#34495e',
    marginBottom: 5,
  },
  actionButtonSmall: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonTextSmall: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  imageContainer: {
    marginBottom: 15,
  },
  postImage: {
    width: 120,
    height: 90,
    borderRadius: 8,
    marginRight: 10,
  },
  postImageSingle: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 15,
  },
  error: {
    color: '#e74c3c',
    textAlign: 'center',
    fontSize: 16,
    marginVertical: 20,
  },
  comingSoon: {
    fontSize: 18,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: 50,
  },
  drawerOverlay: {
    flex: 1,
    flexDirection: 'row',
  },
  drawerContainer: {
    width: DRAWER_WIDTH,
    backgroundColor: '#fff',
  },
  drawerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  drawerContent: {
    flex: 1,
  },
  drawerHeader: {
    backgroundColor: '#2c3e50',
    padding: 30,
    alignItems: 'center',
  },
  adminAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3498db',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  avatarText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  adminName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  adminRole: {
    color: '#bdc3c7',
    fontSize: 14,
  },
  menuContainer: {
    flex: 1,
    paddingTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 15,
  },
  activeMenuItem: {
    backgroundColor: '#ecf0f1',
    borderRightWidth: 4,
    borderRightColor: '#3498db',
  },
  menuIcon: {
    fontSize: 24,
    marginRight: 20,
    width: 30,
  },
  menuText: {
    fontSize: 16,
    color: '#2c3e50',
    fontWeight: '500',
  },
  activeMenuText: {
    color: '#3498db',
    fontWeight: 'bold',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
    marginTop: 'auto',
  },
  logoutIcon: {
    fontSize: 24,
    marginRight: 20,
    width: 30,
  },
  logoutText: { 
    fontSize: 16,
    color: '#e74c3c',
    fontWeight: 'bold',
  },
  searchContainer: {
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emptyList: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyListText: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    borderBottomColor: '#3498db',
  },
  tabButtonText: {
    fontSize: 16,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  activeTabButtonText: {
    color: '#3498db',
    fontWeight: 'bold',
  },
});

export default AdminDashboard;