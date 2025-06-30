import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { getAdminPermissions } from '@/types/auth';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  fallback?: React.ReactNode;
}

export default function AuthGuard({ children, requireAdmin = false, fallback }: AuthGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return fallback || (
      <View style={styles.container}>
        <Text style={styles.errorText}>Please log in to access this feature</Text>
      </View>
    );
  }

  if (requireAdmin) {
    const permissions = getAdminPermissions(user);
    const hasAdminAccess = user?.role === 'admin' && (
      permissions.canCreateSkillTracks || 
      permissions.canCreateJobPosts || 
      permissions.canManageUsers
    );

    if (!hasAdminAccess) {
      return fallback || (
        <View style={styles.container}>
          <Text style={styles.errorText}>Admin access required</Text>
        </View>
      );
    }
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#EF4444',
    textAlign: 'center',
  },
});