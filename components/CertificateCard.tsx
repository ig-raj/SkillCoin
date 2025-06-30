import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Award, Calendar, Hash, Share2, Eye } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Certificate, certificateTemplates } from '@/types/certificate';

const { width } = Dimensions.get('window');

interface CertificateCardProps {
  certificate: Certificate;
  onPress: () => void;
  onShare: () => void;
  index: number;
}

export default function CertificateCard({ certificate, onPress, onShare, index }: CertificateCardProps) {
  const template = certificateTemplates.find(t => t.id === certificate.skillTrackId) || certificateTemplates[0];
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getGradeText = (score: number) => {
    if (score >= 95) return 'Excellent';
    if (score >= 85) return 'Very Good';
    if (score >= 75) return 'Good';
    return 'Satisfactory';
  };

  return (
    <Animated.View entering={FadeInDown.delay(index * 100)}>
      <TouchableOpacity style={styles.container} onPress={onPress}>
        <LinearGradient
          colors={template.colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Award color="white" size={24} />
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.skillTitle}>{certificate.skillTrackTitle}</Text>
              <Text style={styles.certificateType}>Professional Certificate</Text>
            </View>
            {certificate.nftTokenId && (
              <View style={styles.nftBadge}>
                <Text style={styles.nftText}>NFT</Text>
              </View>
            )}
          </View>

          <View style={styles.content}>
            <Text style={styles.recipientLabel}>Awarded to</Text>
            <Text style={styles.recipientName}>{certificate.userName}</Text>
            
            <View style={styles.details}>
              <View style={styles.detailItem}>
                <Calendar color="rgba(255, 255, 255, 0.8)" size={16} />
                <Text style={styles.detailText}>{formatDate(certificate.completionDate)}</Text>
              </View>
              <View style={styles.detailItem}>
                <Hash color="rgba(255, 255, 255, 0.8)" size={16} />
                <Text style={styles.detailText}>{certificate.verificationId}</Text>
              </View>
            </View>

            <View style={styles.stats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{certificate.finalScore}%</Text>
                <Text style={styles.statLabel}>{getGradeText(certificate.finalScore)}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{certificate.lessonsCompleted}/{certificate.totalLessons}</Text>
                <Text style={styles.statLabel}>Lessons</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{Math.round(certificate.timeSpent / 60)}h</Text>
                <Text style={styles.statLabel}>Study Time</Text>
              </View>
            </View>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.actionButton} onPress={onPress}>
              <Eye color="white" size={16} />
              <Text style={styles.actionText}>View</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton} onPress={onShare}>
              <Share2 color="white" size={16} />
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  gradient: {
    borderRadius: 20,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  skillTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginBottom: 2,
  },
  certificateType: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  nftBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  nftText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
  content: {
    marginBottom: 20,
  },
  recipientLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  recipientName: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginBottom: 16,
  },
  details: {
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.9)',
    marginLeft: 8,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    paddingTop: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  actionText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    marginLeft: 6,
  },
});