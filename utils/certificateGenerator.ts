import { Certificate, CertificateTemplate } from '@/types/certificate';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const certificateTemplates: CertificateTemplate[] = [
  {
    id: 'python',
    name: 'Python Programming',
    colors: ['#3B82F6', '#1E40AF'],
    pattern: 'gradient',
  },
  {
    id: 'excel',
    name: 'Excel Mastery',
    colors: ['#10B981', '#047857'],
    pattern: 'geometric',
  },
  {
    id: 'marketing',
    name: 'Digital Marketing',
    colors: ['#F59E0B', '#D97706'],
    pattern: 'waves',
  },
  {
    id: 'ai',
    name: 'AI Fundamentals',
    colors: ['#8B5CF6', '#6D28D9'],
    pattern: 'gradient',
  },
];

export const generateVerificationId = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result.match(/.{1,4}/g)?.join('-') || result;
};

export const generateBlockchainHash = (): string => {
  const chars = '0123456789abcdef';
  let result = '0x';
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const generateShareableLink = (certificateId: string): string => {
  return `https://skillcoin.app/verify/${certificateId}`;
};

export const createCertificate = async (
  userId: string,
  userName: string,
  skillTrackId: string,
  skillTrackTitle: string,
  lessonsCompleted: number,
  totalLessons: number,
  finalScore: number,
  timeSpent: number
): Promise<Certificate> => {
  const certificateId = `cert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const verificationId = generateVerificationId();
  const blockchainHash = generateBlockchainHash();
  const shareableLink = generateShareableLink(certificateId);

  const certificate: Certificate = {
    id: certificateId,
    userId,
    userName,
    skillTrackId,
    skillTrackTitle,
    completionDate: new Date().toISOString(),
    verificationId,
    blockchainHash,
    shareableLink,
    lessonsCompleted,
    totalLessons,
    finalScore,
    timeSpent,
  };

  // Save certificate to storage
  try {
    const existingCertificates = await AsyncStorage.getItem('certificates');
    const certificates = existingCertificates ? JSON.parse(existingCertificates) : [];
    certificates.push(certificate);
    await AsyncStorage.setItem('certificates', JSON.stringify(certificates));
  } catch (error) {
    console.error('Error saving certificate:', error);
  }

  return certificate;
};

export const getUserCertificates = async (userId: string): Promise<Certificate[]> => {
  try {
    const certificatesData = await AsyncStorage.getItem('certificates');
    if (!certificatesData) return [];
    
    const allCertificates: Certificate[] = JSON.parse(certificatesData);
    return allCertificates.filter(cert => cert.userId === userId);
  } catch (error) {
    console.error('Error loading certificates:', error);
    return [];
  }
};

export const verifyCertificate = async (verificationId: string): Promise<Certificate | null> => {
  try {
    const certificatesData = await AsyncStorage.getItem('certificates');
    if (!certificatesData) return null;
    
    const allCertificates: Certificate[] = JSON.parse(certificatesData);
    return allCertificates.find(cert => cert.verificationId === verificationId) || null;
  } catch (error) {
    console.error('Error verifying certificate:', error);
    return null;
  }
};

export const simulateNFTMinting = async (certificateId: string): Promise<string> => {
  // Simulate blockchain transaction delay
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  const tokenId = `NFT_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  
  try {
    const certificatesData = await AsyncStorage.getItem('certificates');
    if (certificatesData) {
      const certificates: Certificate[] = JSON.parse(certificatesData);
      const certIndex = certificates.findIndex(cert => cert.id === certificateId);
      if (certIndex !== -1) {
        certificates[certIndex].nftTokenId = tokenId;
        await AsyncStorage.setItem('certificates', JSON.stringify(certificates));
      }
    }
  } catch (error) {
    console.error('Error updating certificate with NFT token:', error);
  }
  
  return tokenId;
};