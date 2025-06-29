import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  SafeAreaView,
  FlatList,
  StatusBar,
  Dimensions,
  ScrollView,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('window');

function SmartFarmAcademy() {
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [contentType, setContentType] = useState('all');

  const articles = [
    {
      id: 1,
      title: 'Introduction to Modern Farming Techniques',
      category: 'basics',
      difficulty: 'Beginner',
      readTime: '8 min read',
      rating: 4.8,
      author: 'Dr. Maria Santos',
      type: 'article',
      excerpt: 'Discover the fundamentals of modern agriculture and sustainable farming practices that are revolutionizing food production worldwide.',
      content: `The Evolution of Modern Farming\n\nModern farming has undergone tremendous transformation over the past century. Today's agricultural practices combine traditional wisdom with cutting-edge technology to create sustainable, efficient, and productive farming systems.`
    },
    {
      id: 2,
      title: 'Organic Fertilizer Production and Application',
      category: 'organic',
      difficulty: 'Intermediate',
      readTime: '12 min read',
      rating: 4.9,
      author: 'Prof. Juan Dela Cruz',
      type: 'article',
      excerpt: 'Learn how to create and effectively use organic fertilizers to improve soil health and boost crop productivity naturally.',
      content: `Understanding Organic Fertilizers\n\nOrganic fertilizers are derived from natural sources and provide essential nutrients to plants while improving soil structure and promoting beneficial microbial activity.`
    },
    {
      id: 3,
      title: 'Smart Irrigation Systems for Water Conservation',
      category: 'technology',
      difficulty: 'Advanced',
      readTime: '15 min read',
      rating: 4.7,
      author: 'Eng. Lisa Chen',
      type: 'article',
      excerpt: 'Explore cutting-edge irrigation technologies that maximize water efficiency while maintaining optimal crop growth conditions.',
      content: `The Future of Water Management in Agriculture\n\nSmart irrigation systems represent a revolutionary approach to water management, combining sensors, automation, and data analytics to optimize water usage in agriculture.`
    }
  ];

  const videos = [
    {
      id: 1,
      title: 'Complete Guide to Soil Preparation',
      category: 'basics',
      difficulty: 'Beginner',
      duration: '18:32',
      rating: 4.9,
      author: 'Farm Master Pro',
      type: 'video',
      views: '125K',
      thumbnail: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500&h=300&fit=crop',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      excerpt: 'Master the essential techniques of soil preparation, from testing pH levels to creating the perfect growing environment for your crops.',
      description: 'In this comprehensive video tutorial, you\'ll learn everything about soil preparation including soil testing, pH adjustment, organic matter incorporation, and creating optimal growing conditions for different crops.'
    },
    {
      id: 2,
      title: 'Organic Composting: From Waste to Gold',
      category: 'organic',
      difficulty: 'Beginner',
      duration: '22:15',
      rating: 4.8,
      author: 'Green Thumb Academy',
      type: 'video',
      views: '89K',
      thumbnail: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500&h=300&fit=crop',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      excerpt: 'Transform your kitchen scraps and yard waste into nutrient-rich compost with this step-by-step video guide.',
      description: 'Learn the art and science of composting with detailed demonstrations of layering techniques, moisture management, turning schedules, and troubleshooting common problems.'
    },
    {
      id: 3,
      title: 'Smart Farming with IoT Sensors',
      category: 'technology',
      difficulty: 'Advanced',
      duration: '35:47',
      rating: 4.7,
      author: 'AgriTech Solutions',
      type: 'video',
      views: '67K',
      thumbnail: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=500&h=300&fit=crop',
      videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      excerpt: 'Discover how IoT sensors and smart technology are revolutionizing modern agriculture with real-time data and automation.',
      description: 'Explore the latest in agricultural technology with demonstrations of sensor installation, data collection, automation systems, and how to interpret sensor data for optimal farming decisions.'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Courses', icon: '📚' },
    { id: 'basics', name: 'Farming Basics', icon: '🌱' },
    { id: 'organic', name: 'Organic Methods', icon: '🌿' },
    { id: 'technology', name: 'Technology', icon: '🤖' },
    { id: 'pest-control', name: 'Pest Control', icon: '🐛' },
  ];

  const contentTypes = [
    { id: 'all', name: 'All Content', icon: '📚' },
    { id: 'articles', name: 'Articles', icon: '📄' },
    { id: 'videos', name: 'Videos', icon: '🎥' },
  ];

  const allContent = [...articles, ...videos];

  const filteredContent = useMemo(() => {
    return allContent.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.author.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesType = contentType === 'all' || item.type === contentType.slice(0, -1);
      return matchesSearch && matchesCategory && matchesType;
    });
  }, [searchTerm, selectedCategory, contentType, allContent]);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return '#4CAF50';
      case 'Intermediate': return '#FFC107';
      case 'Advanced': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const StatItem = ({ icon, number, label }) => (
    <View style={styles.statItem}>
      <Icon name={icon} size={24} color="#2E7D32" />
      <Text style={styles.statNumber}>{number}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const FilterButton = ({ item, isActive, onPress }) => (
    <TouchableOpacity
      style={[styles.filterBtn, isActive && styles.filterBtnActive]}
      onPress={onPress}
    >
      <Text style={[styles.filterIcon, isActive && styles.filterTextActive]}>{item.icon}</Text>
      <Text style={[styles.filterName, isActive && styles.filterTextActive]}>{item.name}</Text>
    </TouchableOpacity>
  );

  const ContentCard = ({ item, onPress }) => (
    <TouchableOpacity style={styles.contentCard} onPress={onPress}>
      {item.type === 'video' && (
        <View style={styles.videoThumbnail}>
          <Image source={{ uri: item.thumbnail }} style={styles.thumbnailImage} />
          <View style={styles.playOverlay}>
            <Icon name="play-arrow" size={30} color="#fff" />
          </View>
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>{item.duration}</Text>
          </View>
        </View>
      )}
      
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={styles.cardMeta}>
            <View style={styles.contentTypeBadge}>
              <Icon name={item.type === 'article' ? 'article' : 'play-circle-filled'} size={12} color="#374151" />
              <Text style={styles.badgeText}>{item.type === 'article' ? 'Article' : 'Video'}</Text>
            </View>
            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(item.difficulty) }]}>
              <Text style={styles.difficultyText}>{item.difficulty}</Text>
            </View>
            <View style={styles.rating}>
              <Icon name="star" size={16} color="#FFC107" />
              <Text style={styles.ratingText}>{item.rating}</Text>
            </View>
          </View>
        </View>
        
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardExcerpt}>{item.excerpt}</Text>
        
        <View style={styles.cardFooter}>
          <Text style={styles.cardAuthor}>By {item.author}</Text>
          <View style={styles.cardStats}>
            <Icon name="schedule" size={14} color="#757575" />
            <Text style={styles.statsText}>
              {item.type === 'article' ? item.readTime : item.duration}
            </Text>
            {item.type === 'video' && (
              <Text style={styles.viewsText}>{item.views} views</Text>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const HeroSection = () => (
    <View style={styles.heroContainer}>
      <View style={styles.heroContent}>
        <Text style={styles.heroTitle}>SmartFarm Academy</Text>
        <Text style={styles.heroSubtitle}>Master Modern Agriculture</Text>
        <Text style={styles.heroDescription}>
          Discover cutting-edge farming techniques through expert articles and video tutorials.
          Transform your agricultural journey with comprehensive learning resources.
        </Text>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statRow}>
          <StatItem icon="article" number={articles.length} label="Expert Articles" />
          <StatItem icon="play-circle" number={videos.length} label="Video Tutorials" />
        </View>
        <View style={styles.statRow}>
          <StatItem icon="people" number="15k+" label="Active Learners" />
          <StatItem icon="star" number="4.8" label="Avg Rating" />
        </View>
      </View>
    </View>
  );

  const SearchSection = () => (
    <View style={styles.searchContainer}>
      <Icon name="search" size={20} color="#757575" style={styles.searchIcon} />
      <TextInput
        style={styles.searchInput}
        placeholder="Search articles, videos, topics, or authors..."
        placeholderTextColor="#9E9E9E"
        value={searchTerm}
        onChangeText={setSearchTerm}
      />
    </View>
  );

  const FilterSection = () => (
    <View style={styles.filterSection}>
      <View style={styles.filterGroup}>
        <Text style={styles.filterTitle}>Content Type</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {contentTypes.map((type) => (
            <FilterButton
              key={type.id}
              item={type}
              isActive={contentType === type.id}
              onPress={() => setContentType(type.id)}
            />
          ))}
        </ScrollView>
      </View>

      <View style={styles.filterGroup}>
        <Text style={styles.filterTitle}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {categories.map((category) => (
            <FilterButton
              key={category.id}
              item={category}
              isActive={selectedCategory === category.id}
              onPress={() => setSelectedCategory(category.id)}
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );

  const ArticleView = () => (
    <ScrollView style={styles.articleView}>
      <SafeAreaView>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => setSelectedArticle(null)}
        >
          <Icon name="arrow-back" size={20} color="#2E7D32" />
          <Text style={styles.backBtnText}>Back to Content</Text>
        </TouchableOpacity>
        
        <View style={styles.articleContent}>
          <View style={styles.articleHero}>
            <View style={styles.articleMetaHeader}>
              <View style={styles.contentTypeBadge}>
                <Icon name="article" size={16} color="#374151" />
                <Text style={styles.badgeText}>Article</Text>
              </View>
              <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(selectedArticle.difficulty) }]}>
                <Text style={styles.difficultyText}>{selectedArticle.difficulty}</Text>
              </View>
              <View style={styles.rating}>
                <Icon name="star" size={20} color="#FFC107" />
                <Text style={styles.ratingText}>{selectedArticle.rating}</Text>
              </View>
            </View>
            
            <Text style={styles.articleMainTitle}>{selectedArticle.title}</Text>
            
            <View style={styles.articleDetails}>
              <Text style={styles.articleAuthor}>By {selectedArticle.author}</Text>
              <Text style={styles.articleDivider}>•</Text>
              <View style={styles.articleTime}>
                <Icon name="schedule" size={16} color="#757575" />
                <Text style={styles.timeText}>{selectedArticle.readTime}</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.articleBody}>
            <Text style={styles.articleBodyText}>{selectedArticle.content}</Text>
          </View>
        </View>
      </SafeAreaView>
    </ScrollView>
  );

  const VideoView = () => (
    <ScrollView style={styles.videoView}>
      <SafeAreaView>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => setSelectedVideo(null)}
        >
          <Icon name="arrow-back" size={20} color="#2E7D32" />
          <Text style={styles.backBtnText}>Back to Content</Text>
        </TouchableOpacity>
        
        <View style={styles.videoContent}>
          <View style={styles.videoHero}>
            <View style={styles.videoMetaHeader}>
              <View style={styles.contentTypeBadge}>
                <Icon name="play-circle-filled" size={16} color="#374151" />
                <Text style={styles.badgeText}>Video</Text>
              </View>
              <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(selectedVideo.difficulty) }]}>
                <Text style={styles.difficultyText}>{selectedVideo.difficulty}</Text>
              </View>
              <View style={styles.rating}>
                <Icon name="star" size={20} color="#FFC107" />
                <Text style={styles.ratingText}>{selectedVideo.rating}</Text>
              </View>
            </View>
            
            <Text style={styles.videoMainTitle}>{selectedVideo.title}</Text>
            
            <View style={styles.videoDetails}>
              <Text style={styles.videoAuthor}>By {selectedVideo.author}</Text>
              <Text style={styles.videoDivider}>•</Text>
              <View style={styles.videoDuration}>
                <Icon name="schedule" size={16} color="#757575" />
                <Text style={styles.durationDetailText}>{selectedVideo.duration}</Text>
              </View>
              <Text style={styles.videoDivider}>•</Text>
              <Text style={styles.videoViews}>{selectedVideo.views} views</Text>
            </View>
          </View>
          
          <View style={styles.videoPlayer}>
            <WebView
              source={{ uri: selectedVideo.videoUrl }}
              style={styles.webView}
              allowsFullscreenVideo={true}
            />
          </View>
          
          <View style={styles.videoDescription}>
            <Text style={styles.videoDescriptionTitle}>About This Video</Text>
            <Text style={styles.videoDescriptionText}>{selectedVideo.description}</Text>
          </View>
        </View>
      </SafeAreaView>
    </ScrollView>
  );

  const MainContent = () => (
    <FlatList
      data={filteredContent}
      keyExtractor={(item) => `${item.type}-${item.id}`}
      renderItem={({ item }) => (
        <ContentCard
          item={item}
          onPress={() => item.type === 'article' ? setSelectedArticle(item) : setSelectedVideo(item)}
        />
      )}
      ListHeaderComponent={
        <>
          <HeroSection />
          <SearchSection />
          <FilterSection />
          <Text style={styles.sectionTitle}>
            {searchTerm || selectedCategory !== 'all' || contentType !== 'all'
              ? `${filteredContent.length} Results Found` 
              : 'Featured Learning Content'}
          </Text>
        </>
      }
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {!selectedArticle && !selectedVideo ? (
        <MainContent />
      ) : selectedArticle ? (
        <ArticleView />
      ) : (
        <VideoView />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    paddingBottom: 20,
  },
  heroContainer: {
    backgroundColor: '#E8F5E9',
    padding: 20,
    paddingTop: 10,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    marginBottom: 16,
  },
  heroContent: {
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2E7D32',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 12,
  },
  heroDescription: {
    fontSize: 16,
    color: '#616161',
    lineHeight: 24,
  },
  statsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2E7D32',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#757575',
    marginTop: 4,
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#212121',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212121',
    marginHorizontal: 24,
    marginBottom: 16,
  },
  filterSection: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginBottom: 16,
  },
  filterGroup: {
    marginBottom: 16,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 8,
    marginLeft: 8,
  },
  filterScroll: {
    paddingLeft: 8,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 20,
    backgroundColor: '#FAFAFA',
    marginRight: 8,
  },
  filterBtnActive: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  filterIcon: {
    fontSize: 16,
    marginRight: 8,
    color: '#424242',
  },
  filterName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#424242',
  },
  filterTextActive: {
    color: '#2E7D32',
  },
  contentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 24,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  videoThumbnail: {
    position: 'relative',
    height: 200,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -30,
    marginLeft: -30,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 30,
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  durationText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    marginBottom: 12,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  contentTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#424242',
    marginLeft: 4,
    textTransform: 'uppercase',
  },
  difficultyBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginRight: 8,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'uppercase',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFC107',
    marginLeft: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
    lineHeight: 24,
    marginBottom: 8,
  },
  cardExcerpt: {
    fontSize: 14,
    color: '#616161',
    lineHeight: 20,
    marginBottom: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  cardAuthor: {
    fontSize: 14,
    color: '#757575',
  },
  cardStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsText: {
    fontSize: 14,
    color: '#757575',
    marginLeft: 4,
  },
  viewsText: {
    fontSize: 14,
    color: '#757575',
    marginLeft: 8,
  },
  articleView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  videoView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignSelf: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  backBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
    marginLeft: 8,
  },
  articleContent: {
    padding: 20,
  },
  articleHero: {
    marginBottom: 30,
  },
  articleMetaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  articleMainTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#212121',
    lineHeight: 36,
    marginBottom: 16,
  },
  articleDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  articleAuthor: {
    fontSize: 16,
    fontWeight: '600',
    color: '#424242',
  },
  articleDivider: {
    fontSize: 16,
    color: '#BDBDBD',
    marginHorizontal: 8,
  },
  articleTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 16,
    color: '#757575',
    marginLeft: 4,
  },
  articleBody: {
    marginBottom: 40,
  },
  articleBodyText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#424242',
  },
  videoContent: {
    padding: 20,
  },
  videoHero: {
    marginBottom: 20,
  },
  videoMetaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  videoMainTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#212121',
    lineHeight: 36,
    marginBottom: 16,
  },
  videoDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  videoAuthor: {
    fontSize: 16,
    fontWeight: '600',
    color: '#424242',
  },
  videoDivider: {
    fontSize: 16,
    color: '#BDBDBD',
    marginHorizontal: 8,
  },
  videoDuration: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationDetailText: {
    fontSize: 16,
    color: '#757575',
    marginLeft: 4,
  },
  videoViews: {
    fontSize: 16,
    color: '#757575',
  },
  videoPlayer: {
    height: 220,
    marginBottom: 30,
  },
  webView: {
    flex: 1,
  },
  videoDescription: {
    marginBottom: 40,
  },
  videoDescriptionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 16,
  },
  videoDescriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#424242',
  },
});

export default SmartFarmAcademy;