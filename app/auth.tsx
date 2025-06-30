import { Redirect } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function AuthRedirect() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null; // Or a loading screen
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/auth/login" />;
}