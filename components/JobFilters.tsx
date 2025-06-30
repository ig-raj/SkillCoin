import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import { X, Filter, MapPin, DollarSign, Briefcase, Building, Crown } from 'lucide-react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { JobFilters as JobFiltersType } from '@/types/jobs';

interface JobFiltersProps {
  visible: boolean;
  filters: JobFiltersType;
  onClose: () => void;
  onApplyFilters: (filters: JobFiltersType) => void;
}

const locationTypes = [
  { id: 'remote', label: 'Remote', color: '#10B981' },
  { id: 'hybrid', label: 'Hybrid', color: '#F59E0B' },
  { id: 'onsite', label: 'On-site', color: '#6B7280' },
];

const experienceLevels = [
  { id: 'entry', label: 'Entry Level', color: '#10B981' },
  { id: 'mid', label: 'Mid Level', color: '#F59E0B' },
  { id: 'senior', label: 'Senior', color: '#EF4444' },
  { id: 'lead', label: 'Lead', color: '#8B5CF6' },
];

const industries = [
  'Technology',
  'Analytics',
  'Marketing',
  'Artificial Intelligence',
  'Consulting',
  'Finance',
  'Healthcare',
  'Education',
];

const companySizes = [
  '1-10',
  '11-50',
  '51-100',
  '101-500',
  '500+',
];

const skills = [
  'Python Programming',
  'Excel Mastery',
  'Digital Marketing',
  'AI Fundamentals',
  'Data Analysis',
  'Machine Learning',
  'SEO',
  'SQL',
];

export default function JobFilters({ visible, filters, onClose, onApplyFilters }: JobFiltersProps) {
  const [localFilters, setLocalFilters] = useState<JobFiltersType>(filters);

  const updateFilter = (key: keyof JobFiltersType, value: any) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleArrayFilter = (key: keyof JobFiltersType, value: string) => {
    const currentArray = (localFilters[key] as string[]) || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateFilter(key, newArray.length > 0 ? newArray : undefined);
  };

  const clearFilters = () => {
    setLocalFilters({});
  };

  const applyFilters = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const getActiveFiltersCount = () => {
    return Object.values(localFilters).filter(value => 
      value !== undefined && 
      (Array.isArray(value) ? value.length > 0 : true)
    ).length;
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <Animated.View entering={FadeIn} style={styles.modalContainer}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <Animated.View entering={SlideInDown.delay(200)} style={styles.header}>
              <View style={styles.headerLeft}>
                <Filter color="#667eea" size={24} />
                <Text style={styles.title}>Filters</Text>
                {getActiveFiltersCount() > 0 && (
                  <View style={styles.filterCount}>
                    <Text style={styles.filterCountText}>{getActiveFiltersCount()}</Text>
                  </View>
                )}
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <X color="#6B7280" size={24} />
              </TouchableOpacity>
            </Animated.View>

            {/* Location Type */}
            <Animated.View entering={SlideInDown.delay(300)} style={styles.section}>
              <View style={styles.sectionHeader}>
                <MapPin color="#667eea" size={20} />
                <Text style={styles.sectionTitle}>Work Type</Text>
              </View>
              <View style={styles.optionsGrid}>
                {locationTypes.map(type => (
                  <TouchableOpacity
                    key={type.id}
                    style={[
                      styles.optionChip,
                      localFilters.locationType?.includes(type.id as any) && styles.optionChipSelected,
                    ]}
                    onPress={() => toggleArrayFilter('locationType', type.id)}
                  >
                    <Text style={[
                      styles.optionChipText,
                      localFilters.locationType?.includes(type.id as any) && styles.optionChipTextSelected,
                    ]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>

            {/* Experience Level */}
            <Animated.View entering={SlideInDown.delay(400)} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Briefcase color="#667eea" size={20} />
                <Text style={styles.sectionTitle}>Experience Level</Text>
              </View>
              <View style={styles.optionsGrid}>
                {experienceLevels.map(level => (
                  <TouchableOpacity
                    key={level.id}
                    style={[
                      styles.optionChip,
                      localFilters.experienceLevel?.includes(level.id as any) && styles.optionChipSelected,
                    ]}
                    onPress={() => toggleArrayFilter('experienceLevel', level.id)}
                  >
                    <Text style={[
                      styles.optionChipText,
                      localFilters.experienceLevel?.includes(level.id as any) && styles.optionChipTextSelected,
                    ]}>
                      {level.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>

            {/* Salary Range */}
            <Animated.View entering={SlideInDown.delay(500)} style={styles.section}>
              <View style={styles.sectionHeader}>
                <DollarSign color="#667eea" size={20} />
                <Text style={styles.sectionTitle}>Salary Range</Text>
              </View>
              <View style={styles.salaryContainer}>
                <View style={styles.salaryInputContainer}>
                  <Text style={styles.salaryLabel}>Min: $50,000</Text>
                  <View style={styles.salarySlider}>
                    <View style={styles.salaryTrack} />
                    <View style={[styles.salaryThumb, { left: '20%' }]} />
                  </View>
                </View>
                <View style={styles.salaryInputContainer}>
                  <Text style={styles.salaryLabel}>Max: $150,000</Text>
                  <View style={styles.salarySlider}>
                    <View style={styles.salaryTrack} />
                    <View style={[styles.salaryThumb, { left: '80%' }]} />
                  </View>
                </View>
              </View>
            </Animated.View>

            {/* Skills */}
            <Animated.View entering={SlideInDown.delay(600)} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Building color="#667eea" size={20} />
                <Text style={styles.sectionTitle}>Skills</Text>
              </View>
              <View style={styles.optionsGrid}>
                {skills.map(skill => (
                  <TouchableOpacity
                    key={skill}
                    style={[
                      styles.optionChip,
                      localFilters.skills?.includes(skill) && styles.optionChipSelected,
                    ]}
                    onPress={() => toggleArrayFilter('skills', skill)}
                  >
                    <Text style={[
                      styles.optionChipText,
                      localFilters.skills?.includes(skill) && styles.optionChipTextSelected,
                    ]}>
                      {skill}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>

            {/* Industry */}
            <Animated.View entering={SlideInDown.delay(700)} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Building color="#667eea" size={20} />
                <Text style={styles.sectionTitle}>Industry</Text>
              </View>
              <View style={styles.optionsGrid}>
                {industries.map(industry => (
                  <TouchableOpacity
                    key={industry}
                    style={[
                      styles.optionChip,
                      localFilters.industry?.includes(industry) && styles.optionChipSelected,
                    ]}
                    onPress={() => toggleArrayFilter('industry', industry)}
                  >
                    <Text style={[
                      styles.optionChipText,
                      localFilters.industry?.includes(industry) && styles.optionChipTextSelected,
                    ]}>
                      {industry}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Animated.View>

            {/* Partnership */}
            <Animated.View entering={SlideInDown.delay(800)} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Crown color="#667eea" size={20} />
                <Text style={styles.sectionTitle}>Company Type</Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.partnershipOption,
                  localFilters.isPartnership && styles.partnershipOptionSelected,
                ]}
                onPress={() => updateFilter('isPartnership', localFilters.isPartnership ? undefined : true)}
              >
                <Crown color={localFilters.isPartnership ? '#F59E0B' : '#6B7280'} size={20} />
                <Text style={[
                  styles.partnershipText,
                  localFilters.isPartnership && styles.partnershipTextSelected,
                ]}>
                  Premium Partners Only
                </Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Actions */}
            <Animated.View entering={SlideInDown.delay(900)} style={styles.actions}>
              <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
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
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginLeft: 12,
  },
  filterCount: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#667eea',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  filterCountText: {
    fontSize: 12,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginLeft: 8,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionChipSelected: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderColor: '#667eea',
  },
  optionChipText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
  },
  optionChipTextSelected: {
    color: '#667eea',
    fontFamily: 'Inter-SemiBold',
  },
  salaryContainer: {
    gap: 16,
  },
  salaryInputContainer: {
    flex: 1,
  },
  salaryLabel: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginBottom: 8,
  },
  salarySlider: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    position: 'relative',
  },
  salaryTrack: {
    height: '100%',
    backgroundColor: '#667eea',
    borderRadius: 3,
    width: '60%',
  },
  salaryThumb: {
    position: 'absolute',
    top: -6,
    width: 18,
    height: 18,
    backgroundColor: '#667eea',
    borderRadius: 9,
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  partnershipOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  partnershipOptionSelected: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: '#F59E0B',
  },
  partnershipText: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginLeft: 12,
  },
  partnershipTextSelected: {
    color: '#F59E0B',
    fontFamily: 'Inter-SemiBold',
  },
  actions: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  clearButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
  },
  applyButton: {
    flex: 2,
    backgroundColor: '#667eea',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
});