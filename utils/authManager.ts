import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, LoginCredentials, RegisterCredentials, ADMIN_EMAIL } from '@/types/auth';

// Mock user database - in production, this would be a real database
const MOCK_USERS: User[] = [
  {
    id: 'admin-001',
    email: ADMIN_EMAIL,
    name: 'Admin User',
    role: 'admin',
    createdAt: '2024-01-01T00:00:00Z',
    isVerified: true,
  }
];

export const authenticateUser = async (credentials: LoginCredentials): Promise<User | null> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Check if user exists in mock database
  let user = MOCK_USERS.find(u => u.email.toLowerCase() === credentials.email.toLowerCase());
  
  // If user doesn't exist and it's the admin email, create admin user
  if (!user && credentials.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
    user = {
      id: 'admin-001',
      email: ADMIN_EMAIL,
      name: 'Admin User',
      role: 'admin',
      createdAt: new Date().toISOString(),
      isVerified: true,
    };
    MOCK_USERS.push(user);
  }
  
  // For demo purposes, accept any password for existing users
  if (user) {
    const updatedUser = {
      ...user,
      lastLoginAt: new Date().toISOString(),
    };
    
    // Update user in mock database
    const userIndex = MOCK_USERS.findIndex(u => u.id === user!.id);
    if (userIndex !== -1) {
      MOCK_USERS[userIndex] = updatedUser;
    }
    
    return updatedUser;
  }
  
  return null;
};

export const registerUser = async (credentials: RegisterCredentials): Promise<User> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Check if user already exists
  const existingUser = MOCK_USERS.find(u => u.email.toLowerCase() === credentials.email.toLowerCase());
  if (existingUser) {
    throw new Error('User already exists with this email');
  }
  
  // Determine role based on email
  const role = credentials.email.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? 'admin' : 'user';
  
  const newUser: User = {
    id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    email: credentials.email,
    name: credentials.name,
    role,
    createdAt: new Date().toISOString(),
    isVerified: true, // Auto-verify for demo
  };
  
  MOCK_USERS.push(newUser);
  return newUser;
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const userData = await AsyncStorage.getItem('currentUser');
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export const saveCurrentUser = async (user: User): Promise<void> => {
  try {
    await AsyncStorage.setItem('currentUser', JSON.stringify(user));
  } catch (error) {
    console.error('Error saving current user:', error);
  }
};

export const clearCurrentUser = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('currentUser');
  } catch (error) {
    console.error('Error clearing current user:', error);
  }
};

export const updateUserProfile = async (userId: string, updates: Partial<User>): Promise<User> => {
  const userIndex = MOCK_USERS.findIndex(u => u.id === userId);
  if (userIndex === -1) {
    throw new Error('User not found');
  }
  
  const updatedUser = { ...MOCK_USERS[userIndex], ...updates };
  MOCK_USERS[userIndex] = updatedUser;
  
  // Update stored user if it's the current user
  const currentUser = await getCurrentUser();
  if (currentUser?.id === userId) {
    await saveCurrentUser(updatedUser);
  }
  
  return updatedUser;
};

export const getAllUsers = async (): Promise<User[]> => {
  // Only return users for admin
  return MOCK_USERS;
};

export const deleteUser = async (userId: string): Promise<void> => {
  const userIndex = MOCK_USERS.findIndex(u => u.id === userId);
  if (userIndex !== -1) {
    MOCK_USERS.splice(userIndex, 1);
  }
};