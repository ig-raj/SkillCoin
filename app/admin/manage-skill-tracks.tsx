import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Search, Filter, CreditCard as Edit3, Trash2, Plus, BookOpen, Clock, Award, Users, RefreshCw } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AuthGuard from '@/components/AuthGuard';

interface SkillTrack {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: number;
  reward: number;
  lessons: any[];
  createdAt: string;
  createdBy: string;
  status: 'active' | 'draft' | 'archived';
}

export default function ManageSkillTracksScreen() {
  const [skillTracks, setSkillTracks] = useState<SkillTrack[]>([]);
  const [filteredTracks, setFilteredTracks] = useState<SkillTrack[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState('');
  const [deleteAttempts, setDeleteAttempts] = useState(0);

  useEffect(() => {
    loadSkillTracks();
  }, []);

  useEffect(() => {
    filterTracks();
  }, [skillTracks, searchQuery, filterDifficulty]);

  const loadSkillTracks = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Loading skill tracks from AsyncStorage...');
      
      const tracksData = await AsyncStorage.getItem('skillTracks');
      const tracks = tracksData ? JSON.parse(tracksData) : [];
      
      console.log('📚 Raw tracks data:', tracksData);
      console.log('📊 Parsed tracks:', tracks);
      console.log('📈 Number of tracks loaded:', tracks.length);
      
      setSkillTracks(tracks);
      setDebugInfo(`Loaded: ${tracks.length} tracks`);
      
      // Log each track for debugging
      tracks.forEach((track: SkillTrack, index: number) => {
        console.log(`Track ${index + 1}:`, {
          id: track.id,
          title: track.title,
          lessons: track.lessons?.length || 0
        });
      });
      
    } catch (error) {
      console.error('❌ Error loading skill tracks:', error);
      setDebugInfo(`Error: ${error instanceof Error ? error.message : 'Unknown'}`);
      Alert.alert('Error', 'Failed to load skill tracks');
    } finally {
      setIsLoading(false);
    }
  };

  const filterTracks = () => {
    let filtered = skillTracks;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(track =>
        track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by difficulty
    if (filterDifficulty !== 'all') {
      filtered = filtered.filter(track => track.difficulty === filterDifficulty);
    }

    setFilteredTracks(filtered);
    console.log('🔍 Filtered tracks:', filtered.length, 'from', skillTracks.length);
  };

  // Enhanced delete with multiple confirmation methods
  const handleDeleteTrack = (track: SkillTrack) => {
    const attemptNumber = deleteAttempts + 1;
    setDeleteAttempts(attemptNumber);
    
    console.log(`🗑️ DELETE ATTEMPT #${attemptNumber}!`);
    console.log('Track to delete:', {
      id: track.id,
      title: track.title,
      lessons: track.lessons?.length || 0
    });
    
    setDebugInfo(`Delete attempt #${attemptNumber}: ${track.title}`);
    
    // Method 1: Try native confirm first (works better on web)
    if (typeof window !== 'undefined' && window.confirm) {
      console.log('🌐 Using browser confirm dialog');
      const confirmed = window.confirm(
        `🗑️ DELETE SKILL TRACK\n\n` +
        `Track: "${track.title}"\n` +
        `Lessons: ${track.lessons?.length || 0}\n` +
        `Created: ${new Date(track.createdAt).toLocaleDateString()}\n\n` +
        `⚠️ This action cannot be undone!\n\n` +
        `Click OK to DELETE or Cancel to keep the track.`
      );
      
      if (confirmed) {
        console.log('✅ Browser confirm: User confirmed delete');
        performDelete(track);
      } else {
        console.log('❌ Browser confirm: User cancelled delete');
        setDebugInfo('Browser confirm cancelled');
      }
      return;
    }
    
    // Method 2: React Native Alert with enhanced options
    console.log('📱 Using React Native Alert');
    Alert.alert(
      '🗑️ Delete Skill Track',
      `Are you sure you want to delete "${track.title}"?\n\n` +
      `• ${track.lessons?.length || 0} lessons will be removed\n` +
      `• Created: ${new Date(track.createdAt).toLocaleDateString()}\n` +
      `• This action cannot be undone\n\n` +
      `Attempt #${attemptNumber}`,
      [
        { 
          text: 'Cancel', 
          style: 'cancel',
          onPress: () => {
            console.log('❌ Alert: Delete cancelled');
            setDebugInfo(`Alert cancelled (attempt #${attemptNumber})`);
          }
        },
        {
          text: 'DELETE',
          style: 'destructive',
          onPress: () => {
            console.log('✅ Alert: User confirmed delete');
            setDebugInfo(`Alert confirmed - deleting... (attempt #${attemptNumber})`);
            performDelete(track);
          },
        },
      ],
      { 
        cancelable: true,
        onDismiss: () => {
          console.log('🚫 Alert dismissed');
          setDebugInfo(`Alert dismissed (attempt #${attemptNumber})`);
        }
      }
    );
  };

  // Force delete without confirmation (for testing)
  const forceDeleteTrack = (track: SkillTrack) => {
    console.log('💥 FORCE DELETE (NO CONFIRMATION)');
    setDebugInfo(`Force deleting: ${track.title}`);
    performDelete(track);
  };

  const performDelete = async (track: SkillTrack) => {
    console.log('🚀 STARTING DELETE PROCESS');
    console.log('Track to delete:', track.id, track.title);
    
    setIsDeleting(track.id);
    setDebugInfo(`Deleting: ${track.title}...`);
    
    try {
      // Add delay for visual feedback
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('📖 Loading current tracks from storage...');
      const tracksData = await AsyncStorage.getItem('skillTracks');
      const currentTracks: SkillTrack[] = tracksData ? JSON.parse(tracksData) : [];
      
      console.log('📊 Current tracks before delete:', currentTracks.length);
      console.log('🎯 Looking for track with ID:', track.id);
      
      // Find the track
      const trackIndex = currentTracks.findIndex(t => t.id === track.id);
      console.log('📍 Track found at index:', trackIndex);
      
      if (trackIndex === -1) {
        console.log('❌ Track not found in storage!');
        setDebugInfo('Error: Track not found');
        Alert.alert('Error', 'Track not found. It may have already been deleted.');
        return;
      }
      
      console.log('✅ Track found:', currentTracks[trackIndex].title);
      
      // Remove the track
      const updatedTracks = currentTracks.filter(t => t.id !== track.id);
      console.log('📈 Tracks after filtering:', updatedTracks.length);
      
      // Save to storage
      console.log('💾 Saving updated tracks to storage...');
      await AsyncStorage.setItem('skillTracks', JSON.stringify(updatedTracks));
      
      // Verify save
      const verifyData = await AsyncStorage.getItem('skillTracks');
      const verifyTracks = verifyData ? JSON.parse(verifyData) : [];
      console.log('✅ Verification - tracks in storage:', verifyTracks.length);
      
      // Update local state
      console.log('🔄 Updating local state...');
      setSkillTracks(updatedTracks);
      setDebugInfo(`✅ Deleted! ${updatedTracks.length} tracks remaining`);
      
      // Success feedback
      console.log('🎉 DELETE COMPLETED SUCCESSFULLY!');
      
      // Show success with multiple methods
      if (typeof window !== 'undefined' && window.alert) {
        window.alert(`✅ SUCCESS!\n\n"${track.title}" has been deleted.\n\nRemaining tracks: ${updatedTracks.length}`);
      } else {
        Alert.alert(
          '✅ Deleted Successfully!', 
          `"${track.title}" has been deleted.\n\nRemaining tracks: ${updatedTracks.length}`,
          [{ 
            text: 'OK',
            onPress: () => {
              console.log('✅ Success dialog dismissed');
              setDebugInfo(`Success: ${updatedTracks.length} tracks`);
            }
          }]
        );
      }
      
    } catch (error) {
      console.error('💥 DELETE ERROR:', error);
      setDebugInfo(`❌ Error: ${error instanceof Error ? error.message : 'Unknown'}`);
      Alert.alert('Delete Failed', `Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDeleting(null);
      console.log('🏁 Delete process finished');
    }
  };

  const handleEditTrack = (track: SkillTrack) => {
    console.log('✏️ Edit button pressed for track:', track.title);
    setDebugInfo(`Edit: ${track.title}`);
    router.push({
      pathname: '/admin/edit-skill-track',
      params: { trackId: track.id }
    });
  };

  const clearAllTracks = async () => {
    console.log('🧹 CLEAR ALL TRACKS');
    
    const confirmed = typeof window !== 'undefined' && window.confirm 
      ? window.confirm('⚠️ DELETE ALL TRACKS?\n\nThis will remove ALL skill tracks permanently!\n\nThis cannot be undone!')
      : false;
    
    if (!confirmed) {
      Alert.alert(
        '⚠️ Clear All Tracks',
        'This will permanently delete ALL skill tracks!\n\nThis action cannot be undone.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'DELETE ALL',
            style: 'destructive',
            onPress: async () => {
              try {
                await AsyncStorage.removeItem('skillTracks');
                setSkillTracks([]);
                setDebugInfo('All tracks cleared');
                Alert.alert('✅ Cleared', 'All skill tracks have been deleted.');
              } catch (error) {
                console.error('Error clearing tracks:', error);
                Alert.alert('Error', 'Failed to clear tracks');
              }
            }
          }
        ]
      );
      return;
    }
    
    // Browser confirm was used and confirmed
    try {
      await AsyncStorage.removeItem('skillTracks');
      setSkillTracks([]);
      setDebugInfo('All tracks cleared');
      if (typeof window !== 'undefined' && window.alert) {
        window.alert('✅ All skill tracks have been deleted.');
      }
    } catch (error) {
      console.error('Error clearing tracks:', error);
      Alert.alert('Error', 'Failed to clear tracks');
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return '#10B981';
      case 'Intermediate': return '#F59E0B';
      case 'Advanced': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderTrackCard = (track: SkillTrack, index: number) => (
    <Animated.View
      key={track.id}
      entering={FadeInDown.delay(index * 100)}
      style={[
        styles.trackCard,
        isDeleting === track.id && styles.trackCardDeleting
      ]}
    >
      <View style={styles.trackHeader}>
        <View style={styles.trackInfo}>
          <Text style={styles.trackTitle}>{track.title}</Text>
          <Text style={styles.trackDescription} numberOfLines={2}>
            {track.description}
          </Text>
        </View>
        <View style={styles.trackActions}>
          <TouchableOpacity
            style={[
              styles.editButton,
              isDeleting === track.id && styles.buttonDisabled
            ]}
            onPress={() => handleEditTrack(track)}
            disabled={isDeleting === track.id}
            activeOpacity={0.7}
          >
            <Edit3 color={isDeleting === track.id ? "#9CA3AF" : "#667eea"} size={20} />
          </TouchableOpacity>
          
          {/* Enhanced Delete Button */}
          <TouchableOpacity
            style={[
              styles.deleteButton,
              isDeleting === track.id && styles.deleteButtonDeleting
            ]}
            onPress={() => {
              console.log('🔥 ENHANCED DELETE BUTTON TOUCHED!');
              console.log('Track:', track.title, 'ID:', track.id);
              if (!isDeleting) {
                handleDeleteTrack(track);
              }
            }}
            onLongPress={() => {
              console.log('🔥 LONG PRESS DELETE - FORCE DELETE!');
              if (!isDeleting) {
                forceDeleteTrack(track);
              }
            }}
            disabled={isDeleting === track.id}
            activeOpacity={0.6}
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <Trash2 
              color={isDeleting === track.id ? "#9CA3AF" : "#EF4444"} 
              size={24} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Multiple Delete Options for Testing */}
      <View style={styles.testDeleteContainer}>
        <TouchableOpacity
          style={styles.testDeleteButton}
          onPress={() => {
            console.log('🧪 TEST DELETE BUTTON PRESSED!');
            handleDeleteTrack(track);
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.testDeleteText}>🗑️ Delete</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.testDeleteButton, { backgroundColor: '#DC2626' }]}
          onPress={() => {
            console.log('💥 FORCE DELETE BUTTON PRESSED!');
            forceDeleteTrack(track);
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.testDeleteText}>💥 Force</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.trackMeta}>
        <View style={styles.metaItem}>
          <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(track.difficulty) }]}>
            <Text style={styles.difficultyText}>{track.difficulty}</Text>
          </View>
        </View>
        <View style={styles.metaItem}>
          <Clock color="#6B7280" size={16} />
          <Text style={styles.metaText}>{track.duration} weeks</Text>
        </View>
        <View style={styles.metaItem}>
          <Award color="#F59E0B" size={16} />
          <Text style={styles.metaText}>{track.reward} coins</Text>
        </View>
        <View style={styles.metaItem}>
          <BookOpen color="#8B5CF6" size={16} />
          <Text style={styles.metaText}>{track.lessons?.length || 0} lessons</Text>
        </View>
      </View>

      <View style={styles.trackFooter}>
        <Text style={styles.createdDate}>Created {formatDate(track.createdAt)}</Text>
        <View style={[styles.statusBadge, { backgroundColor: track.status === 'active' ? '#10B981' : '#6B7280' }]}>
          <Text style={styles.statusText}>{track.status}</Text>
        </View>
      </View>

      {/* Delete confirmation overlay */}
      {isDeleting === track.id && (
        <View style={styles.deletingOverlay}>
          <View style={styles.deletingContent}>
            <Trash2 color="#EF4444" size={32} />
            <Text style={styles.deletingText}>Deleting...</Text>
            <Text style={styles.deletingSubtext}>Please wait</Text>
          </View>
        </View>
      )}
    </Animated.View>
  );

  const renderEmptyState = () => (
    <Animated.View entering={FadeInUp} style={styles.emptyState}>
      <BookOpen color="#9CA3AF" size={64} />
      <Text style={styles.emptyTitle}>No Skill Tracks Found</Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery || filterDifficulty !== 'all' 
          ? 'Try adjusting your search or filters'
          : 'Create your first skill track to get started'
        }
      </Text>
      {!searchQuery && filterDifficulty === 'all' && (
        <TouchableOpacity 
          style={styles.createButton}
          onPress={() => router.push('/admin/create-skill-track')}
        >
          <Plus color="white" size={20} />
          <Text style={styles.createButtonText}>Create Skill Track</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );

  return (
    <AuthGuard requireAdmin>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <Animated.View entering={FadeInDown.delay(200)} style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <ArrowLeft color="white" size={24} />
            </TouchableOpacity>
            <Text style={styles.title}>Manage Skill Tracks</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => router.push('/admin/create-skill-track')}
            >
              <Plus color="white" size={24} />
            </TouchableOpacity>
          </Animated.View>

          {/* Search and Filter */}
          <Animated.View entering={FadeInDown.delay(400)} style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Search color="#9CA3AF" size={20} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search skill tracks..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <View style={styles.filterContainer}>
              <Filter color="#667eea" size={16} />
              <Text style={styles.filterLabel}>Difficulty:</Text>
              <View style={styles.filterButtons}>
                {['all', 'Beginner', 'Intermediate', 'Advanced'].map(difficulty => (
                  <TouchableOpacity
                    key={difficulty}
                    style={[
                      styles.filterButton,
                      filterDifficulty === difficulty && styles.filterButtonActive,
                    ]}
                    onPress={() => setFilterDifficulty(difficulty)}
                  >
                    <Text style={[
                      styles.filterButtonText,
                      filterDifficulty === difficulty && styles.filterButtonTextActive,
                    ]}>
                      {difficulty === 'all' ? 'All' : difficulty}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Animated.View>

          {/* Stats */}
          <Animated.View entering={FadeInDown.delay(600)} style={styles.statsContainer}>
            <View style={styles.statCard}>
              <BookOpen color="#667eea" size={24} />
              <Text style={styles.statNumber}>{skillTracks.length}</Text>
              <Text style={styles.statLabel}>Total Tracks</Text>
            </View>
            <View style={styles.statCard}>
              <Users color="#10B981" size={24} />
              <Text style={styles.statNumber}>
                {skillTracks.filter(t => t.status === 'active').length}
              </Text>
              <Text style={styles.statLabel}>Active</Text>
            </View>
            <View style={styles.statCard}>
              <Award color="#F59E0B" size={24} />
              <Text style={styles.statNumber}>
                {skillTracks.reduce((sum, track) => sum + (track.lessons?.length || 0), 0)}
              </Text>
              <Text style={styles.statLabel}>Total Lessons</Text>
            </View>
          </Animated.View>

          {/* Enhanced Debug Info Panel */}
          <View style={styles.debugPanel}>
            <Text style={styles.debugTitle}>🐛 Debug Info:</Text>
            <Text style={styles.debugText}>{debugInfo}</Text>
            <Text style={styles.debugText}>Attempts: {deleteAttempts}</Text>
            <View style={styles.debugActions}>
              <TouchableOpacity 
                style={styles.debugButton}
                onPress={() => {
                  console.log('🔄 Manual reload triggered');
                  loadSkillTracks();
                }}
              >
                <RefreshCw color="white" size={12} />
                <Text style={styles.debugButtonText}>Reload</Text>
              </TouchableOpacity>
              
              {skillTracks.length > 0 && (
                <TouchableOpacity 
                  style={[styles.debugButton, { backgroundColor: '#DC2626' }]}
                  onPress={clearAllTracks}
                >
                  <Trash2 color="white" size={12} />
                  <Text style={styles.debugButtonText}>Clear All</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Skill Tracks List */}
          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading skill tracks...</Text>
              </View>
            ) : filteredTracks.length === 0 ? (
              renderEmptyState()
            ) : (
              <View style={styles.tracksContainer}>
                <Animated.View entering={FadeInDown.delay(800)} style={styles.tracksHeader}>
                  <Text style={styles.tracksTitle}>
                    {filteredTracks.length} Track{filteredTracks.length !== 1 ? 's' : ''} Found
                  </Text>
                  <Text style={styles.tracksSubtitle}>
                    Tap 🗑️ to delete • Long press 🗑️ for force delete • Use test buttons below each track
                  </Text>
                </Animated.View>
                {filteredTracks.map((track, index) => renderTrackCard(track, index))}
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </AuthGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    padding: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginLeft: 8,
    marginRight: 12,
  },
  filterButtons: {
    flexDirection: 'row',
    flex: 1,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#667eea',
  },
  filterButtonText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  filterButtonTextActive: {
    color: 'white',
    fontFamily: 'Inter-SemiBold',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  statNumber: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginTop: 4,
  },
  debugPanel: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    marginHorizontal: 24,
    marginBottom: 16,
    borderRadius: 12,
    padding: 12,
  },
  debugTitle: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: '#F59E0B',
    marginBottom: 4,
  },
  debugText: {
    fontSize: 11,
    fontFamily: 'Inter-Regular',
    color: 'white',
    marginBottom: 2,
  },
  debugActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  debugButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#667eea',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  debugButtonText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: 'white',
    opacity: 0.8,
  },
  tracksContainer: {
    paddingBottom: 24,
  },
  tracksHeader: {
    marginBottom: 16,
  },
  tracksTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginBottom: 4,
  },
  tracksSubtitle: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 16,
  },
  trackCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    position: 'relative',
  },
  trackCardDeleting: {
    opacity: 0.7,
  },
  trackHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  trackInfo: {
    flex: 1,
    marginRight: 16,
  },
  trackTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  trackDescription: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    lineHeight: 20,
  },
  trackActions: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(102, 126, 234, 0.2)',
  },
  deleteButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  deleteButtonDeleting: {
    backgroundColor: 'rgba(156, 163, 175, 0.1)',
    borderColor: 'rgba(156, 163, 175, 0.2)',
  },
  buttonDisabled: {
    opacity: 0.5,
    backgroundColor: 'rgba(156, 163, 175, 0.1)',
    borderColor: 'rgba(156, 163, 175, 0.2)',
  },
  testDeleteContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 12,
    gap: 12,
  },
  testDeleteButton: {
    backgroundColor: '#EF4444',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  testDeleteText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  trackMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  difficultyText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  metaText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginLeft: 4,
  },
  trackFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 12,
  },
  createdDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    textTransform: 'capitalize',
  },
  deletingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deletingContent: {
    alignItems: 'center',
  },
  deletingText: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#EF4444',
    marginTop: 8,
    marginBottom: 4,
  },
  deletingSubtext: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#DC2626',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 24,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  createButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    marginLeft: 8,
  },
});