import AsyncStorage from '@react-native-async-storage/async-storage';
import { createCertificate } from './certificateGenerator';
import { getTrackLessons } from '@/data/lessons';

interface TrackProgress {
  trackId: string;
  completedLessons: string[];
  totalScore: number;
  totalTimeSpent: number;
}

export const updateTrackProgress = async (
  userId: string,
  userName: string,
  trackId: string,
  lessonId: string,
  score: number,
  timeSpent: number
) => {
  try {
    const progressKey = `trackProgress_${userId}`;
    const existingProgress = await AsyncStorage.getItem(progressKey);
    const allProgress: Record<string, TrackProgress> = existingProgress ? JSON.parse(existingProgress) : {};

    if (!allProgress[trackId]) {
      allProgress[trackId] = {
        trackId,
        completedLessons: [],
        totalScore: 0,
        totalTimeSpent: 0,
      };
    }

    const trackProgress = allProgress[trackId];
    
    // Add lesson if not already completed
    if (!trackProgress.completedLessons.includes(lessonId)) {
      trackProgress.completedLessons.push(lessonId);
      trackProgress.totalScore += score;
      trackProgress.totalTimeSpent += timeSpent;
    }

    // Check if track is complete
    const trackLessons = getTrackLessons(trackId);
    const isTrackComplete = trackProgress.completedLessons.length === trackLessons.length;

    if (isTrackComplete) {
      // Generate certificate
      const skillTrackTitles: Record<string, string> = {
        'python-programming': 'Python Programming',
        'excel-mastery': 'Excel Mastery',
        'digital-marketing': 'Digital Marketing',
        'ai-fundamentals': 'AI Fundamentals',
      };

      const skillTrackTitle = skillTrackTitles[trackId] || 'Unknown Skill';
      const averageScore = Math.round(trackProgress.totalScore / trackProgress.completedLessons.length);

      await createCertificate(
        userId,
        userName,
        trackId,
        skillTrackTitle,
        trackProgress.completedLessons.length,
        trackLessons.length,
        averageScore,
        trackProgress.totalTimeSpent
      );

      // Award bonus coins for track completion
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        const bonusCoins = 100; // Bonus for completing entire track
        const updatedUser = {
          ...user,
          skillCoins: user.skillCoins + bonusCoins,
        };
        await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
      }
    }

    // Save updated progress
    await AsyncStorage.setItem(progressKey, JSON.stringify(allProgress));

    return { isTrackComplete, trackProgress };
  } catch (error) {
    console.error('Error updating track progress:', error);
    return { isTrackComplete: false, trackProgress: null };
  }
};

export const getTrackProgress = async (userId: string, trackId: string): Promise<TrackProgress | null> => {
  try {
    const progressKey = `trackProgress_${userId}`;
    const existingProgress = await AsyncStorage.getItem(progressKey);
    if (!existingProgress) return null;

    const allProgress: Record<string, TrackProgress> = JSON.parse(existingProgress);
    return allProgress[trackId] || null;
  } catch (error) {
    console.error('Error getting track progress:', error);
    return null;
  }
};