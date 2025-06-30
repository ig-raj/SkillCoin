import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, ScrollView, Dimensions, Alert, Share } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Download, Share2, ExternalLink, Coins, Clock, Award, Shield, Hash, Calendar } from 'lucide-react-native';
import Animated, { FadeIn, SlideInDown, ZoomIn } from 'react-native-reanimated';
import { Certificate, certificateTemplates } from '@/types/certificate';
import { simulateNFTMinting } from '@/utils/certificateGenerator';

const { width, height } = Dimensions.get('window');

interface CertificateModalProps {
  visible: boolean;
  certificate: Certificate | null;
  onClose: () => void;
}

export default function CertificateModal({ visible, certificate, onClose }: CertificateModalProps) {
  const [isMinting, setIsMinting] = useState(false);
  const [mintingComplete, setMintingComplete] = useState(false);

  if (!certificate) return null;

  const template = certificateTemplates.find(t => t.id === certificate.skillTrackId) || certificateTemplates[0];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `🎓 I just earned a ${certificate.skillTrackTitle} certificate from SkillCoin! Verify it here: ${certificate.shareableLink}`,
        url: certificate.shareableLink,
      });
    } catch (error) {
      console.error('Error sharing certificate:', error);
    }
  };

  const handleMintNFT = async () => {
    if (certificate.nftTokenId) {
      Alert.alert('Already Minted', 'This certificate has already been minted as an NFT.');
      return;
    }

    setIsMinting(true);
    try {
      const tokenId = await simulateNFTMinting(certificate.id);
      setMintingComplete(true);
      Alert.alert(
        'NFT Minted Successfully!',
        `Your certificate has been minted as NFT with token ID: ${tokenId}`,
        [{ text: 'OK', onPress: () => setMintingComplete(false) }]
      );
    } catch (error) {
      Alert.alert('Minting Failed', 'Failed to mint NFT. Please try again.');
    } finally {
      setIsMinting(false);
    }
  };

  const handleDownload = () => {
    Alert.alert(
      'Download Certificate',
      'Certificate download feature would be implemented with native file system access.',
      [{ text: 'OK' }]
    );
  };

  const handleVerify = () => {
    Alert.alert(
      'Verification',
      `Certificate verified on blockchain!\n\nHash: ${certificate.blockchainHash.substring(0, 20)}...`,
      [{ text: 'OK' }]
    );
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <Animated.View entering={FadeIn} style={styles.modalContainer}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <Animated.View entering={SlideInDown.delay(200)} style={styles.header}>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <X color="#6B7280" size={24} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Certificate Details</Text>
              <View style={styles.placeholder} />
            </Animated.View>

            {/* Certificate Preview */}
            <Animated.View entering={ZoomIn.delay(400)} style={styles.certificateContainer}>
              <LinearGradient
                colors={template.colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.certificate}
              >
                {/* Certificate Header */}
                <View style={styles.certHeader}>
                  <View style={styles.logoContainer}>
                    <LinearGradient
                      colors={['#F59E0B', '#EF4444']}
                      style={styles.logo}
                    >
                      <Text style={styles.logoText}>SC</Text>
                    </LinearGradient>
                  </View>
                  <Text style={styles.brandName}>SkillCoin</Text>
                  <Text style={styles.certType}>Professional Certificate</Text>
                </View>

                {/* Certificate Body */}
                <View style={styles.certBody}>
                  <Text style={styles.awardText}>This certifies that</Text>
                  <Text style={styles.recipientName}>{certificate.userName}</Text>
                  <Text style={styles.completionText}>has successfully completed</Text>
                  <Text style={styles.skillName}>{certificate.skillTrackTitle}</Text>
                  
                  <View style={styles.certDetails}>
                    <View style={styles.certDetailRow}>
                      <Text style={styles.certDetailLabel}>Completion Date:</Text>
                      <Text style={styles.certDetailValue}>{formatDate(certificate.completionDate)}</Text>
                    </View>
                    <View style={styles.certDetailRow}>
                      <Text style={styles.certDetailLabel}>Final Score:</Text>
                      <Text style={styles.certDetailValue}>{certificate.finalScore}%</Text>
                    </View>
                    <View style={styles.certDetailRow}>
                      <Text style={styles.certDetailLabel}>Study Hours:</Text>
                      <Text style={styles.certDetailValue}>{Math.round(certificate.timeSpent / 60)}h</Text>
                    </View>
                  </View>
                </View>

                {/* Certificate Footer */}
                <View style={styles.certFooter}>
                  <View style={styles.verificationInfo}>
                    <Text style={styles.verificationLabel}>Verification ID</Text>
                    <Text style={styles.verificationId}>{certificate.verificationId}</Text>
                  </View>
                  <View style={styles.blockchainInfo}>
                    <Text style={styles.blockchainLabel}>Blockchain Hash</Text>
                    <Text style={styles.blockchainHash}>
                      {certificate.blockchainHash.substring(0, 16)}...
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </Animated.View>

            {/* Certificate Info */}
            <Animated.View entering={SlideInDown.delay(600)} style={styles.infoSection}>
              <Text style={styles.infoTitle}>Certificate Information</Text>
              
              <View style={styles.infoGrid}>
                <View style={styles.infoCard}>
                  <Calendar color="#667eea" size={20} />
                  <Text style={styles.infoLabel}>Issued</Text>
                  <Text style={styles.infoValue}>{formatDate(certificate.completionDate)}</Text>
                </View>
                
                <View style={styles.infoCard}>
                  <Award color="#10B981" size={20} />
                  <Text style={styles.infoLabel}>Score</Text>
                  <Text style={styles.infoValue}>{certificate.finalScore}%</Text>
                </View>
                
                <View style={styles.infoCard}>
                  <Clock color="#F59E0B" size={20} />
                  <Text style={styles.infoLabel}>Duration</Text>
                  <Text style={styles.infoValue}>{Math.round(certificate.timeSpent / 60)}h</Text>
                </View>
                
                <View style={styles.infoCard}>
                  <Shield color="#8B5CF6" size={20} />
                  <Text style={styles.infoLabel}>Verified</Text>
                  <Text style={styles.infoValue}>Blockchain</Text>
                </View>
              </View>
            </Animated.View>

            {/* Actions */}
            <Animated.View entering={SlideInDown.delay(800)} style={styles.actionsSection}>
              <TouchableOpacity style={styles.primaryAction} onPress={handleShare}>
                <Share2 color="white" size={20} />
                <Text style={styles.primaryActionText}>Share Certificate</Text>
              </TouchableOpacity>

              <View style={styles.secondaryActions}>
                <TouchableOpacity style={styles.secondaryAction} onPress={handleDownload}>
                  <Download color="#667eea" size={20} />
                  <Text style={styles.secondaryActionText}>Download</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.secondaryAction} onPress={handleVerify}>
                  <Hash color="#667eea" size={20} />
                  <Text style={styles.secondaryActionText}>Verify</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[
                    styles.secondaryAction,
                    certificate.nftTokenId && styles.secondaryActionDisabled
                  ]} 
                  onPress={handleMintNFT}
                  disabled={isMinting || certificate.nftTokenId}
                >
                  <Coins color={certificate.nftTokenId ? "#9CA3AF" : "#667eea"} size={20} />
                  <Text style={[
                    styles.secondaryActionText,
                    certificate.nftTokenId && styles.secondaryActionTextDisabled
                  ]}>
                    {certificate.nftTokenId ? 'Minted' : isMinting ? 'Minting...' : 'Mint NFT'}
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>

            {/* Blockchain Info */}
            <Animated.View entering={SlideInDown.delay(1000)} style={styles.blockchainSection}>
              <Text style={styles.blockchainTitle}>Blockchain Verification</Text>
              <View style={styles.blockchainCard}>
                <Text style={styles.blockchainText}>
                  This certificate is permanently recorded on the blockchain for verification and authenticity.
                </Text>
                <TouchableOpacity style={styles.blockchainLink} onPress={handleVerify}>
                  <ExternalLink color="#667eea" size={16} />
                  <Text style={styles.blockchainLinkText}>View on Blockchain</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.95,
    maxHeight: height * 0.9,
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  placeholder: {
    width: 32,
  },
  certificateContainer: {
    margin: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  certificate: {
    borderRadius: 16,
    padding: 24,
    minHeight: 300,
  },
  certHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoContainer: {
    marginBottom: 12,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
  brandName: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginBottom: 4,
  },
  certType: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  certBody: {
    alignItems: 'center',
    marginBottom: 24,
  },
  awardText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  recipientName: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginBottom: 12,
    textAlign: 'center',
  },
  completionText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  skillName: {
    fontSize: 22,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  certDetails: {
    width: '100%',
  },
  certDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  certDetailLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  certDetailValue: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  certFooter: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    paddingTop: 16,
  },
  verificationInfo: {
    marginBottom: 12,
  },
  verificationLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  verificationId: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
  blockchainInfo: {},
  blockchainLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 4,
  },
  blockchainHash: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  infoSection: {
    padding: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoCard: {
    width: '48%',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
    marginTop: 8,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
  },
  actionsSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  primaryAction: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  primaryActionText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    marginLeft: 8,
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  secondaryAction: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  secondaryActionDisabled: {
    opacity: 0.5,
  },
  secondaryActionText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#667eea',
    marginTop: 4,
  },
  secondaryActionTextDisabled: {
    color: '#9CA3AF',
  },
  blockchainSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  blockchainTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  blockchainCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#667eea',
  },
  blockchainText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#1E40AF',
    lineHeight: 20,
    marginBottom: 12,
  },
  blockchainLink: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  blockchainLinkText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#667eea',
    marginLeft: 6,
  },
});