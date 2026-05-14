/**
 * Quick Actions Component
 * Displays quick action buttons for common tasks
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  color: string;
  onPress: () => void;
  badge?: number;
  disabled?: boolean;
}

interface QuickActionsProps {
  actions: QuickAction[];
  style?: ViewStyle;
  layout?: 'grid' | 'horizontal';
  columns?: number;
}

export const QuickActionButton: React.FC<{
  action: QuickAction;
  style?: ViewStyle;
}> = ({ action, style }) => {
  return (
    <TouchableOpacity
      style={[
        styles.actionButton,
        { backgroundColor: `${action.color}15`, borderColor: action.color },
        action.disabled && styles.disabled,
        style,
      ]}
      onPress={action.onPress}
      disabled={action.disabled}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: action.color }]}>
        <MaterialCommunityIcons name={action.icon} size={24} color="#FFFFFF" />
        {action.badge && action.badge > 0 && (
          <View style={[styles.badge, { backgroundColor: action.color }]}>
            <Text style={styles.badgeText}>
              {action.badge > 99 ? '99+' : action.badge}
            </Text>
          </View>
        )}
      </View>
      <Text
        style={[styles.actionLabel, action.disabled && styles.disabledText]}
        numberOfLines={2}
      >
        {action.label}
      </Text>
    </TouchableOpacity>
  );
};

export const QuickActions: React.FC<QuickActionsProps> = ({
  actions,
  style,
  layout = 'horizontal',
  columns = 3,
}) => {
  if (layout === 'horizontal') {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalScroll}
        >
          {actions.map((action) => (
            <QuickActionButton
              key={action.id}
              action={action}
              style={styles.horizontalButton}
            />
          ))}
        </ScrollView>
      </View>
    );
  }

  // Grid layout
  const gridItems: Array<QuickAction[]> = [];
  for (let i = 0; i < actions.length; i += columns) {
    gridItems.push(actions.slice(i, i + columns));
  }

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      {gridItems.map((row, rowIdx) => (
        <View key={rowIdx} style={styles.gridRow}>
          {row.map((action) => (
            <QuickActionButton
              key={action.id}
              action={action}
              style={{ flex: 1 / columns }}
            />
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  horizontalScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  horizontalButton: {
    marginRight: 12,
    width: 90,
  },
  actionButton: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 6,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    color: '#9CA3AF',
  },
});
