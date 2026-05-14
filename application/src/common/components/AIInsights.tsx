/**
 * AI Insights Component
 * Displays AI-generated insights and recommendations
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ViewStyle,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export interface AIInsight {
  id: string;
  type: 'opportunity' | 'warning' | 'info';
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  recommendation?: string;
  timestamp: string;
  actionable?: boolean;
  actionLabel?: string;
  onAction?: () => void;
}

interface AIInsightsSectionProps {
  insights: AIInsight[];
  isLoading?: boolean;
  onRefresh?: () => void;
  style?: ViewStyle;
}

const getInsightColor = (type: 'opportunity' | 'warning' | 'info') => {
  switch (type) {
    case 'opportunity':
      return { bg: '#D1FAE5', border: '#10B981', icon: 'lightbulb-on', text: '#065F46' };
    case 'warning':
      return { bg: '#FEF3C7', border: '#F59E0B', icon: 'alert-circle', text: '#78350F' };
    case 'info':
      return { bg: '#DBEAFE', border: '#3B82F6', icon: 'information', text: '#1E40AF' };
  }
};

const getImpactColor = (impact: 'high' | 'medium' | 'low') => {
  switch (impact) {
    case 'high':
      return '#EF4444';
    case 'medium':
      return '#F59E0B';
    case 'low':
      return '#10B981';
  }
};

export const InsightCard: React.FC<{
  insight: AIInsight;
  onAction?: () => void;
}> = ({ insight, onAction }) => {
  const colors = getInsightColor(insight.type);
  const impactColor = getImpactColor(insight.impact);

  return (
    <View
      style={[
        styles.insightCard,
        { backgroundColor: colors.bg, borderLeftColor: colors.border },
      ]}
    >
      <View style={styles.insightHeader}>
        <View style={styles.iconAndTitle}>
          <MaterialCommunityIcons
            name={colors.icon}
            size={20}
            color={colors.border}
          />
          <View style={{ flex: 1 }}>
            <Text style={[styles.insightTitle, { color: colors.text }]}>
              {insight.title}
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.impactBadge,
            { backgroundColor: impactColor + '20', borderColor: impactColor },
          ]}
        >
          <Text style={[styles.impactText, { color: impactColor }]}>
            {insight.impact}
          </Text>
        </View>
      </View>

      <Text style={[styles.insightDescription, { color: colors.text }]}>
        {insight.description}
      </Text>

      {insight.recommendation && (
        <View style={styles.recommendationBox}>
          <MaterialCommunityIcons
            name="check-circle"
            size={16}
            color="#10B981"
          />
          <Text style={styles.recommendationText}>
            {insight.recommendation}
          </Text>
        </View>
      )}

      {insight.actionable && insight.actionLabel && (
        <TouchableOpacity
          style={[styles.actionButton, { borderColor: colors.border }]}
          onPress={onAction}
        >
          <Text style={[styles.actionButtonText, { color: colors.border }]}>
            {insight.actionLabel}
          </Text>
          <MaterialCommunityIcons
            name="arrow-right"
            size={16}
            color={colors.border}
          />
        </TouchableOpacity>
      )}

      <Text style={styles.timestamp}>
        {new Date(insight.timestamp).toLocaleDateString()}
      </Text>
    </View>
  );
};

export const AIInsightsSummary: React.FC<AIInsightsSectionProps> = ({
  insights,
  isLoading = false,
  onRefresh,
  style,
}) => {
  const displayInsights = insights.slice(0, 3);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.sectionTitle}>AI Insights</Text>
          <Text style={styles.sectionSubtitle}>
            {insights.length} recommendations available
          </Text>
        </View>
        {onRefresh && (
          <TouchableOpacity
            onPress={onRefresh}
            disabled={isLoading}
            style={styles.refreshButton}
          >
            <MaterialCommunityIcons
              name="refresh"
              size={20}
              color="#4F46E5"
              style={isLoading ? { opacity: 0.5 } : {}}
            />
          </TouchableOpacity>
        )}
      </View>

      {displayInsights.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons
            name="lightbulb-off"
            size={40}
            color="#D1D5DB"
          />
          <Text style={styles.emptyStateText}>
            No insights available yet
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.insightsScroll}
          showsVerticalScrollIndicator={false}
        >
          {displayInsights.map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  refreshButton: {
    padding: 8,
  },
  insightsScroll: {
    maxHeight: 300,
  },
  insightCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderLeftWidth: 4,
    padding: 12,
    marginBottom: 12,
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  iconAndTitle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  insightTitle: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  impactBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  impactText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  insightDescription: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 8,
  },
  recommendationBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 6,
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 11,
    color: '#065F46',
    flex: 1,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 6,
    paddingVertical: 6,
    marginBottom: 8,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 10,
    color: '#9CA3AF',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 8,
  },
  emptyStateText: {
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
  },
});
