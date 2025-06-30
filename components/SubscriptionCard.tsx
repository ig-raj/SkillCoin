import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Check, Star, Zap } from 'lucide-react-native';
import { SubscriptionTier } from '@/types/subscription';

interface SubscriptionCardProps {
  tier: SubscriptionTier;
  isCurrentTier?: boolean;
  onSelect: () => void;
  showTrial?: boolean;
}

export default function SubscriptionCard({ tier, isCurrentTier, onSelect, showTrial }: SubscriptionCardProps) {
  const getCardColors = () => {
    switch (tier.id) {
      case 'premium':
        return ['#667eea', '#764ba2'];
      case 'pro':
        return ['#F59E0B', '#EF4444'];
      default:
        return ['#6B7280', '#4B5563'];
    }
  };

  const getButtonText = () => {
    if (isCurrentTier) return 'Current Plan';
    if (tier.id === 'free') return 'Current Plan';
    if (showTrial && tier.trialDays) return `Start ${tier.trialDays}-Day Free Trial`;
    return tier.id === 'free' ? 'Free Forever' : 'Upgrade Now';
  };

  return (
    <View style={[styles.container, tier.popular && styles.popularContainer]}>
      {tier.popular && (
        <View style={styles.popularBadge}>
          <Star color="#F59E0B" size={16} fill="#F59E0B" />
          <Text style={styles.popularText}>Most Popular</Text>
        </View>
      )}
      
      <LinearGradient
        colors={tier.id === 'free' ? ['#F9FAFB', '#F3F4F6'] : getCardColors()}
        style={styles.card}
      >
        <View style={styles.header}>
          <Text style={[styles.tierName, tier.id === 'free' && styles.freeText]}>{tier.name}</Text>
          <View style={styles.priceContainer}>
            <Text style={[styles.price, tier.id === 'free' && styles.freeText]}>
              ${tier.price}
            </Text>
            <Text style={[styles.period, tier.id === 'free' && styles.freeText]}>
              {tier.price === 0 ? 'forever' : `/${tier.period}`}
            </Text>
          </View>
          {showTrial && tier.trialDays && (
            <Text style={[styles.trialText, tier.id === 'free' && styles.freeText]}>
              {tier.trialDays} days free trial
            </Text>
          )}
        </View>

        <View style={styles.featuresContainer}>
          {tier.features.filter(f => f.included).map((feature, index) => (
            <View key={feature.id} style={styles.featureRow}>
              <View style={[styles.checkIcon, tier.id === 'free' && styles.freeCheckIcon]}>
                {feature.highlight ? (
                  <Zap color={tier.id === 'free' ? '#10B981' : 'white'} size={12} fill={tier.id === 'free' ? '#10B981' : 'white'} />
                ) : (
                  <Check color={tier.id === 'free' ? '#10B981' : 'white'} size={12} />
                )}
              </View>
              <Text style={[styles.featureText, tier.id === 'free' && styles.freeText]}>
                {feature.name}
              </Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            tier.id === 'free' && styles.freeButton,
            isCurrentTier && styles.currentButton,
          ]}
          onPress={onSelect}
          disabled={isCurrentTier && tier.id !== 'free'}
        >
          <Text style={[
            styles.buttonText,
            tier.id === 'free' && styles.freeButtonText,
            isCurrentTier && styles.currentButtonText,
          ]}>
            {getButtonText()}
          </Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  popularContainer: {
    borderWidth: 2,
    borderColor: '#F59E0B',
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    left: '50%',
    transform: [{ translateX: -60 }],
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  popularText: {
    fontSize: 12,
    fontFamily: 'Inter-SemiBold',
    color: '#F59E0B',
    marginLeft: 4,
  },
  card: {
    borderRadius: 20,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  tierName: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: 'white',
    marginBottom: 8,
  },
  freeText: {
    color: '#1F2937',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  price: {
    fontSize: 36,
    fontFamily: 'Inter-Bold',
    color: 'white',
  },
  period: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.8)',
    marginLeft: 4,
  },
  trialText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  featuresContainer: {
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  freeCheckIcon: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  featureText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: 'white',
    flex: 1,
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  freeButton: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  currentButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: 'white',
  },
  freeButtonText: {
    color: 'white',
  },
  currentButtonText: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
});