import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { X, Crown, Zap, Star } from 'lucide-react-native';
import Animated, { FadeIn, SlideInDown, ZoomIn } from 'react-native-reanimated';

interface UpgradePromptProps {
  visible: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  feature: string;
  description: string;
  tier: 'premium' | 'pro';
}

export default function UpgradePrompt({ visible, onClose, onUpgrade, feature, description, tier }: UpgradePromptProps) {
  const getTierInfo = () => {
    if (tier === 'pro') {
      return {
        name: 'Pro',
        price: '$19.99',
        color: ['#F59E0B', '#EF4444'],
        icon: Crown,
        benefits: [
          'Unlimited lessons',
          '4 mentor calls per month',
          'Custom learning paths',
          'Company partnerships',
          'Career coaching',
        ],
      };
    }
    return {
      name: 'Premium',
      price: '$9.99',
      color: ['#667eea', '#764ba2'],
      icon: Star,
      benefits: [
        'Unlimited lessons',
        'Advanced certificates',
        'Priority AI Tutor',
        'Job board access',
        'Offline learning',
      ],
    };
  };

  const tierInfo = getTierInfo();

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <Animated.View entering={FadeIn} style={styles.modalContainer}>
          <Animated.View entering={SlideInDown.delay(200)} style={styles.header}>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X color="#6B7280" size={24} />
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={ZoomIn.delay(400)} style={styles.content}>
            <LinearGradient
              colors={tierInfo.color}
              style={styles.iconContainer}
            >
              <tierInfo.icon color="white" size={32} />
            </LinearGradient>

            <Text style={styles.title}>Upgrade to {tierInfo.name}</Text>
            <Text style={styles.subtitle}>
              You need {tierInfo.name} to access {feature}
            </Text>
            <Text style={styles.description}>{description}</Text>

            <View style={styles.benefitsContainer}>
              <Text style={styles.benefitsTitle}>What you'll get:</Text>
              {tierInfo.benefits.map((benefit, index) => (
                <Animated.View
                  key={index}
                  entering={SlideInDown.delay(600 + index * 100)}
                  style={styles.benefitRow}
                >
                  <Zap color="#10B981" size={16} fill="#10B981" />
                  <Text style={styles.benefitText}>{benefit}</Text>
                </Animated.View>
              ))}
            </View>

            <View style={styles.priceContainer}>
              <Text style={styles.price}>{tierInfo.price}/month</Text>
              <Text style={styles.trialText}>7 days free trial</Text>
            </View>
          </Animated.View>

          <Animated.View entering={SlideInDown.delay(800)} style={styles.actions}>
            <TouchableOpacity style={styles.upgradeButton} onPress={onUpgrade}>
              <LinearGradient
                colors={tierInfo.color}
                style={styles.upgradeButtonGradient}
              >
                <Text style={styles.upgradeButtonText}>Start Free Trial</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Maybe Later</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  header: {
    alignItems: 'flex-end',
    padding: 16,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 24,
    paddingTop: 0,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  benefitsContainer: {
    width: '100%',
    marginBottom: 24,
  },
  benefitsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1F2937',
    marginBottom: 12,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    marginLeft: 8,
  },
  priceContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  price: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  trialText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#10B981',
  },
  actions: {
    padding: 24,
    paddingTop: 0,
  },
  upgradeButton: {
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  upgradeButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  upgradeButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#6B7280',
  },
});