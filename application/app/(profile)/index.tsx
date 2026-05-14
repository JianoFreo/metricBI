import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '@/common/context/auth.context';
import { Card, ListItem, Button } from '@/common/components';

/**
 * Profile Screen
 */
export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>
                {user?.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.roleContainer}>
          <Text style={styles.role}>{user?.role.toUpperCase()}</Text>
        </View>
      </View>

      {/* Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <Card>
          <ListItem
            title="Email"
            subtitle={user?.email}
            icon={<Text>📧</Text>}
          />
        </Card>
        <Card>
          <ListItem
            title="Role"
            subtitle={user?.role}
            icon={<Text>👤</Text>}
          />
        </Card>
        <Card>
          <ListItem
            title="Tenant ID"
            subtitle={user?.tenantId}
            icon={<Text>🏢</Text>}
          />
        </Card>
      </View>

      {/* Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <TouchableOpacity>
          <Card>
            <ListItem
              title="Change Password"
              subtitle="Update your password"
              icon={<Text>🔒</Text>}
            />
          </Card>
        </TouchableOpacity>
        <TouchableOpacity>
          <Card>
            <ListItem
              title="Notifications"
              subtitle="Manage alerts"
              icon={<Text>🔔</Text>}
            />
          </Card>
        </TouchableOpacity>
        <TouchableOpacity>
          <Card>
            <ListItem
              title="Privacy"
              subtitle="Data & privacy settings"
              icon={<Text>🛡️</Text>}
            />
          </Card>
        </TouchableOpacity>
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <Card>
          <ListItem
            title="App Version"
            subtitle="1.0.0"
            icon={<Text>ℹ️</Text>}
          />
        </Card>
        <Card>
          <ListItem
            title="Help & Support"
            subtitle="Contact us"
            icon={<Text>❓</Text>}
          />
        </Card>
        <Card>
          <ListItem
            title="Terms of Service"
            subtitle="View terms"
            icon={<Text>📋</Text>}
          />
        </Card>
      </View>

      {/* Logout Button */}
      <Button
        title="Sign Out"
        onPress={handleLogout}
        variant="danger"
        style={styles.logoutButton}
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2026 MetricBI</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 32,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4F46E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  roleContainer: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  role: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0C4A6E',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  logoutButton: {
    marginHorizontal: 16,
    marginVertical: 24,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  footerText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});
