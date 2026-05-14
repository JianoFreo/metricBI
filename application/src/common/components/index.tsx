/**
 * Components Module Exports
 * Includes base component classes and UI components
 */

import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TextInput,
  TextInputProps,
  Text,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from 'react-native';

// Export base component classes
export {
  BaseComponent,
  BaseComponentProps,
  BaseStateComponent,
  BaseStateComponentProps,
  BaseScreen,
  BaseScreenProps,
  BaseListComponent,
  BaseFormComponent,
} from './base.component';

// Export Button component
export { Button } from './Button';

// Export standalone UI components
export { ErrorMessage } from './ErrorMessage';
export { Loading } from './Loading';

// Card Component
interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, style, onPress }) => (
  <View
    style={[
      styles.card,
      style,
      onPress && { borderWidth: 1, borderColor: '#E5E7EB' },
    ]}
  >
    {children}
  </View>
);

// Input Component
interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  ...props
}) => (
  <View style={containerStyle}>
    {label && <Text style={styles.label}>{label}</Text>}
    <TextInput
      {...props}
      style={[
        styles.input,
        { borderColor: error ? '#EF4444' : '#D1D5DB' },
        props.style,
      ]}
      placeholderTextColor="#9CA3AF"
    />
    {error && <Text style={styles.errorText}>{error}</Text>}
  </View>
);

// Section Header
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: { title: string; onPress: () => void };
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  action,
}) => (
  <View style={styles.sectionHeader}>
    <View>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
    </View>
    {action && (
      <Text style={styles.actionText} onPress={action.onPress}>
        {action.title}
      </Text>
    )}
  </View>
);

// Stat Card
interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  color?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  unit,
  icon,
  color = '#4F46E5',
}) => (
  <Card style={styles.statCard}>
    {icon && <View style={{ marginBottom: 8 }}>{icon}</View>}
    <Text style={styles.statValue}>
      {value}
      {unit && <Text style={styles.statUnit}>{unit}</Text>}
    </Text>
    <Text style={styles.statLabel}>{label}</Text>
  </Card>
);

// Refresh List
interface RefreshListProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  isLoading?: boolean;
}

export const RefreshList: React.FC<RefreshListProps> = ({
  children,
  onRefresh,
  isLoading = false,
}) => (
  <ScrollView
    refreshControl={
      <RefreshControl
        refreshing={isLoading}
        onRefresh={onRefresh}
        colors={['#4F46E5']}
      />
    }
  >
    {children}
  </ScrollView>
);

// List Item
interface ListItemProps {
  title: string;
  subtitle?: string;
  rightText?: string;
  onPress?: () => void;
  icon?: React.ReactNode;
}

export const ListItem: React.FC<ListItemProps> = ({
  title,
  subtitle,
  rightText,
  onPress,
  icon,
}) => (
  <View style={[styles.listItem, onPress && { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' }]}>
    {icon && <View style={{ marginRight: 12 }}>{icon}</View>}
    <View style={{ flex: 1 }}>
      <Text style={styles.listItemTitle}>{title}</Text>
      {subtitle && <Text style={styles.listItemSubtitle}>{subtitle}</Text>}
    </View>
    {rightText && <Text style={styles.listItemRight}>{rightText}</Text>}
  </View>
);

// Badge
interface BadgeProps {
  label: string;
  variant?: 'success' | 'warning' | 'danger' | 'info';
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'info' }) => {
  const variants = {
    success: { backgroundColor: '#DCFCE7', color: '#166534' },
    warning: { backgroundColor: '#FEF3C7', color: '#92400E' },
    danger: { backgroundColor: '#FEE2E2', color: '#991B1B' },
    info: { backgroundColor: '#DBEAFE', color: '#0C4A6E' },
  };

  const bgColor = variants[variant].backgroundColor;
  const color = variants[variant].color;

  return (
    <View style={[styles.badge, { backgroundColor: bgColor }]}>
      <Text style={[styles.badgeText, { color }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#1F2937',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  statUnit: {
    fontSize: 12,
    color: '#6B7280',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  listItemSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  listItemRight: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4F46E5',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});