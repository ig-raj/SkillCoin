import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert, Share } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Award, Search, Filter, Plus, ExternalLink, Share2 } from 'lucide-react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Certificate } from '@/types/certificate';
import { getUserCertificates, verifyCertificate } from '@/utils/certificateGenerator';
import CertificateCard from '@/components/CertificateCard';
import CertificateModal from '@/components/CertificateModal';

export default function CertificatesScreen() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [filteredCertificates, setFilteredCertificates] = useState<Certificate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [verificationId, setVerificationId] = useState('');
  const [showVerification, setShowVerification] = useState(false);

  useEffect(() => {
    loadCertificates();
  }, []);

  useEffect(() => {
    filterCertificates();
  }, [certificates, searchQuery]);

  const loadCertificates = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        const userCertificates = await getUserCertificates(user.name || 'user');
        setCertificates(userCertificates);
      }
    } catch (error) {
      console.error('Error loading certificates:', error);
    }
  };

  const filterCertificates = () => {
    if (!searchQuery.trim()) {
      setFilteredCertificates(certificates);
      return;
    }

    const filtered = certificates.filter(cert =>
      cert.skillTrackTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.verificationId.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredCertificates(filtered);
  };

  const handleCertificatePress = (certificate: Certificate) => {
    setSelectedCertificate(certificate);
    setModalVisible(true);
  };

  const handleShareCertificate = async (certificate: Certificate) => {
    try {
      await Share.share({
        message: `🎓 I just earned a ${certificate.skillTrackTitle} certificate from SkillCoin! Verify it here: ${certificate.shareableLink}`,
        url: certificate.shareableLink,
      });
    } catch (error) {
      console.error('Error sharing certificate:', error);
    }
  };

  const handleVerifyCertificate = async () => {
    if (!verificationId.trim()) {
      Alert.alert('Error', 'Please enter a verification ID');
      return;
    }

    try {
      const certificate = await verifyCertificate(verificationId.toUpperCase());
      if (certificate) {
        Alert.alert(
          'Certificate Verified ✅',
          `Valid certificate for ${certificate.skillTrackTitle}\nAwarded to: ${certificate.userName}\nDate: ${new Date(certificate.completionDate).toLocaleDateString()}`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Verification Failed ❌', 'Certificate not found or invalid verification ID');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to verify certificate');
    }
  };

  const renderEmptyState = () => (
    <Animated.View entering={FadeInUp.delay(400)} style={styles.emptyState}>
      <Award color="#9CA3AF" size={64} />
      <Text style={styles.emptyTitle}>No Certificates Yet</Text>
      <Text style={styles.emptySubtitle}>
        Complete skill tracks to earn your first certificate
      </Text>
      <TouchableOpacity style={styles.emptyButton}>
        <Plus color="white" size={20} />
        <Text style={styles.emptyButtonText}>Start Learning</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  const renderVerificationSection = () => (
    <Animated.View entering={FadeInDown.delay(600)} style={styles.verificationSection}>
      <TouchableOpacity 
        style={styles.verificationToggle}
        onPress={() => setShowVerification(!showVerification)}
      >
        <ExternalLink color="#667eea" size={20} />
        <Text style={styles.verificationToggleText}>Verify Certificate</Text>
      </TouchableOpacity>

      {showVerification && (
        <Animated.View entering={FadeInDown} style={styles.verificationForm}>
          <Text style={styles.verificationTitle}>Certificate Verification</Text>
          <Text style={styles.verificationSubtitle}>
            Enter a verification ID to check certificate authenticity
          </Text>
          
          <View style={styles.verificationInputContainer}>
            <TextInput
              style={styles.verificationInput}
              placeholder="Enter verification ID (e.g., ABCD-1234-EFGH)"
              value={verificationId}
              onChangeText={setVerificationId}
              autoCapitalize="characters"
            />
            <TouchableOpacity 
              style={styles.verifyButton}
              onPress={handleVerifyCertificate}
            >
              <Text style={styles.verifyButtonText}>Verify</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </Animated.View>
  );

  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.header}>
          <Text style={styles.title}>Certificates</Text>
          <Text style={styles.subtitle}>Your blockchain-verified achievements</Text>
        </Animated.View>

        {/* Search Bar */}
        <Animated.View entering={FadeInDown.delay(400)} style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search color="#9CA3AF" size={20} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search certificates..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9CA3AF"
            />
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Filter color="#667eea" size={20} />
          </TouchableOpacity>
        </Animated.View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Stats */}
          <Animated.View entering={FadeInDown.delay(600)} style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{certificates.length}</Text>
              <Text style={styles.statLabel}>Total Certificates</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{certificates.filter(c => c.nftTokenId).length}</Text>
              <Text style={styles.statLabel}>NFT Certificates</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {certificates.length > 0 
                  ? Math.round(certificates.reduce((sum, cert) => sum + cert.finalScore, 0) / certificates.length)
                  : 0}%
              </Text>
              <Text style={styles.statLabel}>Avg Score</Text>
            </View>
          </Animated.View>

          {/* Verification Section */}
          {renderVerificationSection()}

          {/* Certificates List */}
          <View style={styles.certificatesSection}>
            <Animated.View entering={FadeInDown.delay(800)} style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Certificates</Text>
              <TouchableOpacity style={styles.shareAllButton}>
                <Share2 color="white" size={16} />
                <Text style={styles.shareAllText}>Share All</Text>
              </TouchableOpacity>
            </Animated.View>

            {filteredCertificates.length === 0 ? (
              renderEmptyState()
            ) : (
              filteredCertificates.map((certificate, index) => (
                <CertificateCard
                  key={certificate.id}
                  certificate={certificate}
                  onPress={() => handleCertificatePress(certificate)}
                  onShare={() => handleShareCertificate(certificate)}
                  index={index}
                />
              ))
            )}
          </View>
        </ScrollView>

        {/* Certificate Modal */}
        <CertificateModal
          visible={modalVisible}
          certificate={selectedCertificate}
          onClose={() => setModalVisible(false)}
        />
      </SafeAreaView>
    </LinearGradient>
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
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: 'white',
    opacity: 0.8,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
  },
  filterButton: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginHorizontal: 4,
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
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  verificationSection: {
    marginBottom: 24,
  },
  verificationToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  verificationToggleText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#667eea',
    marginLeft: 12,
  },
  verificationForm: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  verificationTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  verificationSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginBottom: 16,
  },
  verificationInputContainer: {
    flexDirection: 'row',
  },
  verificationInput: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1F2937',
    marginRight: 12,
  },
  verifyButton: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  certificatesSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
  shareAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  shareAllText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    marginLeft: 6,
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
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  emptyButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    marginLeft: 8,
  },
});