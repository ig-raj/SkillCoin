import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { MapPin, Clock, DollarSign, Users, Star, Crown } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Job } from '@/types/jobs';

interface JobCardProps {
  job: Job;
  skillMatchScore: number;
  onPress: () => void;
  index: number;
  hasApplied?: boolean;
}

export default function JobCard({ job, skillMatchScore, onPress, index, hasApplied }: JobCardProps) {
  const getLocationTypeColor = () => {
    switch (job.locationType) {
      case 'remote': return '#10B981';
      case 'hybrid': return '#F59E0B';
      case 'onsite': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const getLocationTypeText = () => {
    switch (job.locationType) {
      case 'remote': return 'Remote';
      case 'hybrid': return 'Hybrid';
      case 'onsite': return 'On-site';
      default: return job.locationType;
    }
  };

  const getExperienceLevelColor = () => {
    switch (job.experienceLevel) {
      case 'entry': return '#10B981';
      case 'mid': return '#F59E0B';
      case 'senior': return '#EF4444';
      case 'lead': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const getSkillMatchColor = () => {
    if (skillMatchScore >= 80) return '#10B981';
    if (skillMatchScore >= 60) return '#F59E0B';
    if (skillMatchScore >= 40) return '#EF4444';
    return '#6B7280';
  };

  return (
    <Animated.View entering={FadeInDown.delay(index * 100)}>
      <TouchableOpacity style={styles.container} onPress={onPress}>
        <View style={styles.header}>
          <View style={styles.companyInfo}>
            {job.companyLogo && (
              <Image source={{ uri: job.companyLogo }} style={styles.companyLogo} />
            )}
            <View style={styles.titleContainer}>
              <View style={styles.titleRow}>
                <Text style={styles.jobTitle}>{job.title}</Text>
                {job.isPartnership && (
                  <View style={styles.partnershipBadge}>
                    <Crown color="#F59E0B" size={14} />
                    <Text style={styles.partnershipText}>Partner</Text>
                  </View>
                )}
              </View>
              <Text style={styles.companyName}>{job.company}</Text>
            </View>
          </View>
          
          <View style={styles.skillMatch}>
            <View style={[styles.skillMatchCircle, { borderColor: getSkillMatchColor() }]}>
              <Text style={[styles.skillMatchText, { color: getSkillMatchColor() }]}>
                {skillMatchScore}%
              </Text>
            </View>
            <Text style={styles.skillMatchLabel}>Match</Text>
          </View>
        </View>

        <View style={styles.details}>
          <View style={styles.detailRow}>
            <MapPin color="#6B7280" size={16} />
            <Text style={styles.detailText}>{job.location}</Text>
            <View style={[styles.locationTypeBadge, { backgroundColor: getLocationTypeColor() }]}>
              <Text style={styles.locationTypeText}>{getLocationTypeText()}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <DollarSign color="#6B7280" size={16} />
            <Text style={styles.detailText}>
              ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}
            </Text>
            <View style={[styles.experienceBadge, { backgroundColor: getExperienceLevelColor() }]}>
              <Text style={styles.experienceText}>{job.experienceLevel}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Users color="#6B7280" size={16} />
            <Text style={styles.detailText}>{job.companySize} employees</Text>
            <Text style={styles.industryText}>{job.industry}</Text>
          </View>
        </View>

        <View style={styles.skills}>
          <Text style={styles.skillsLabel}>Required Skills:</Text>
          <View style={styles.skillTags}>
            {job.requiredSkills.slice(0, 3).map((skill, index) => (
              <View key={index} style={styles.skillTag}>
                <Text style={styles.skillTagText}>{skill}</Text>
              </View>
            ))}
            {job.requiredSkills.length > 3 && (
              <View style={styles.skillTag}>
                <Text style={styles.skillTagText}>+{job.requiredSkills.length - 3}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.applicationCost}>
            <Star color="#F59E0B" size={16} />
            <Text style={styles.costText}>{job.applicationCost} SkillCoins to apply</Text>
          </View>
          
          <View style={styles.timeInfo}>
            <Clock color="#6B7280" size={14} />
            <Text style={styles.timeText}>
              {Math.floor((Date.now() - new Date(job.postedDate).getTime()) / (1000 * 60 * 60 * 24))}d ago
            </Text>
          </View>
        </View>

        {hasApplied && (
          <View style={styles.appliedBanner}>
            <Text style={styles.appliedText}>✓ Applied</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  companyInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  companyLogo: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  jobTitle: {
    fontSize: 18,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    flex: 1,
  },
  partnershipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  partnershipText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: '#F59E0B',
    marginLeft: 2,
  },
  companyName: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  skillMatch: {
    alignItems: 'center',
    marginLeft: 16,
  },
  skillMatchCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  skillMatchText: {
    fontSize: 14,
    fontFamily: 'Inter-Bold',
  },
  skillMatchLabel: {
    fontSize: 10,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
  details: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    marginLeft: 8,
    flex: 1,
  },
  locationTypeBadge: {
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  locationTypeText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  experienceBadge: {
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  experienceText: {
    fontSize: 10,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
    textTransform: 'capitalize',
  },
  industryText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#8B5CF6',
  },
  skills: {
    marginBottom: 16,
  },
  skillsLabel: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#374151',
    marginBottom: 8,
  },
  skillTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skillTag: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  skillTagText: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    color: '#374151',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  applicationCost: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  costText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#F59E0B',
    marginLeft: 4,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    marginLeft: 4,
  },
  appliedBanner: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  appliedText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
});