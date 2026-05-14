/**
 * KPI Card Component
 * Displays key performance indicator with value, change, and trend
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export interface KPICardProps {
  title: string;
  value: string | number;
  unit?: string;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon: string;
  color?: string;
  style?: ViewStyle;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  unit,
  change,
  trend = 'neutral',
  icon,
  color = '#4F46E5',
  style,
}) => {
  const getChangeColor = () => {
    if (trend === 'up') return '#10B981';
    if (trend === 'down') return '#EF4444';
    return '#6B7280';
  };

  const getTrendIcon = () => {
    if (trend === 'up') return 'trending-up';
    if (trend === 'down') return 'trending-down';
    return 'minus';
  };

  return (
    <View style={[styles.container, { borderLeftColor: color }, style]}>
      <View style={styles.header}>
        <View
          style={[styles.iconContainer, { backgroundColor: `${color}15` }]}
        >
          <MaterialCommunityIcons name={icon} size={24} color={color} />
        </View>
        {change !== undefined && (
          <View style={styles.changeContainer}>
            <MaterialCommunityIcons
              name={getTrendIcon()}
              size={16}
              color={getChangeColor()}
            />
            <Text
              style={[styles.changeText, { color: getChangeColor() }]}
            >
              {change > 0 ? '+' : ''}{change}%
            </Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.valueContainer}>
          <Text style={styles.value}>{value}</Text>
          {unit && <Text style={styles.unit}>{unit}</Text>}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  changeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    gap: 8,
  },
  title: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  unit: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
});
