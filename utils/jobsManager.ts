import AsyncStorage from '@react-native-async-storage/async-storage';
import { JobApplication, JobFilters, Job } from '@/types/jobs';
import { mockJobs, calculateSkillMatch } from '@/data/jobs';

export const getUserApplications = async (userId: string): Promise<JobApplication[]> => {
  try {
    const applications = await AsyncStorage.getItem('jobApplications');
    if (!applications) return [];
    
    const allApplications: JobApplication[] = JSON.parse(applications);
    return allApplications.filter(app => app.userId === userId);
  } catch (error) {
    console.error('Error loading applications:', error);
    return [];
  }
};

export const applyToJob = async (
  jobId: string,
  userId: string,
  coverLetter?: string,
  userSkills: string[] = []
): Promise<JobApplication> => {
  const job = mockJobs.find(j => j.id === jobId);
  if (!job) throw new Error('Job not found');

  const skillMatchScore = calculateSkillMatch(job, userSkills);
  
  const application: JobApplication = {
    id: `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    jobId,
    userId,
    appliedDate: new Date().toISOString(),
    status: 'pending',
    coverLetter,
    skillMatchScore,
  };

  try {
    const existingApplications = await AsyncStorage.getItem('jobApplications');
    const applications = existingApplications ? JSON.parse(existingApplications) : [];
    applications.push(application);
    await AsyncStorage.setItem('jobApplications', JSON.stringify(applications));

    // Deduct SkillCoins
    const userData = await AsyncStorage.getItem('userData');
    if (userData) {
      const user = JSON.parse(userData);
      const updatedUser = {
        ...user,
        skillCoins: user.skillCoins - job.applicationCost,
      };
      await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
    }

    return application;
  } catch (error) {
    console.error('Error saving application:', error);
    throw error;
  }
};

export const hasAppliedToJob = async (jobId: string, userId: string): Promise<boolean> => {
  const applications = await getUserApplications(userId);
  return applications.some(app => app.jobId === jobId);
};

export const filterJobs = (jobs: Job[], filters: JobFilters): Job[] => {
  return jobs.filter(job => {
    if (filters.location && !job.location.toLowerCase().includes(filters.location.toLowerCase())) {
      return false;
    }
    
    if (filters.locationType && !filters.locationType.includes(job.locationType)) {
      return false;
    }
    
    if (filters.salaryMin && job.salaryMax < filters.salaryMin) {
      return false;
    }
    
    if (filters.salaryMax && job.salaryMin > filters.salaryMax) {
      return false;
    }
    
    if (filters.experienceLevel && !filters.experienceLevel.includes(job.experienceLevel)) {
      return false;
    }
    
    if (filters.skills && filters.skills.length > 0) {
      const hasMatchingSkill = filters.skills.some(skill => 
        job.requiredSkills.includes(skill) || job.preferredSkills?.includes(skill)
      );
      if (!hasMatchingSkill) return false;
    }
    
    if (filters.industry && filters.industry.length > 0 && !filters.industry.includes(job.industry)) {
      return false;
    }
    
    if (filters.companySize && filters.companySize.length > 0 && !filters.companySize.includes(job.companySize)) {
      return false;
    }
    
    if (filters.isPartnership !== undefined && job.isPartnership !== filters.isPartnership) {
      return false;
    }
    
    return true;
  });
};

export const getUserSkills = async (userId: string): Promise<string[]> => {
  try {
    const progressKey = `trackProgress_${userId}`;
    const progress = await AsyncStorage.getItem(progressKey);
    if (!progress) return [];

    const trackProgress = JSON.parse(progress);
    const skills: string[] = [];

    // Map track IDs to skill names
    const trackSkillMap: Record<string, string> = {
      'python-programming': 'Python Programming',
      'excel-mastery': 'Excel Mastery',
      'digital-marketing': 'Digital Marketing',
      'ai-fundamentals': 'AI Fundamentals',
    };

    Object.keys(trackProgress).forEach(trackId => {
      const track = trackProgress[trackId];
      if (track.completedLessons && track.completedLessons.length > 0) {
        const skillName = trackSkillMap[trackId];
        if (skillName) skills.push(skillName);
      }
    });

    return skills;
  } catch (error) {
    console.error('Error getting user skills:', error);
    return [];
  }
};