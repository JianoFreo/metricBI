import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useDashboardStore } from '@/common/store';
import { useAuth } from '@/common/context/auth.context';
import {
  SectionHeader,
  StatCard,
  Card,
  ErrorMessage,
  Badge,
} from '@/common/components';

/**
 * Dashboard Screen - Main overview of all metrics
 */
export default function DashboardScreen() {
  const { user } = useAuth();
  const {
    dashboard,
    isLoading,
    error,
    period,
    fetchDashboard,
    setPeriod,
    clearError,
  } = useDashboardStore();

  useEffect(() => {
    fetchDashboard();
  }, [period]);

  const handleRefresh = async () => {
    await fetchDashboard();
  };

  if (isLoading && !dashboard) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good morning, {user?.name.split(' ')[0]}</Text>
          <Text style={styles.date}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>
      </View>

      {/* Error Message */}
      {error && (
        <ErrorMessage message={error} onDismiss={clearError} />
      )}

      {/* Period Selection */}
      <View style={styles.periodSelector}>
        {['today', 'week', 'month', 'quarter', 'year'].map((p: any) => (
          <Badge
            key={p}
            label={p.charAt(0).toUpperCase() + p.slice(1)}
            variant={period === p ? 'info' : 'warning'}
          />
        ))}
      </View>

      {dashboard && (
        <>
          {/* Financial Summary */}
          <SectionHeader title="Financial Overview" />
          <View style={styles.statsGrid}>
            <StatCard
              label="Revenue"
              value={`$${(dashboard.financialSummary.revenue / 1000).toFixed(1)}K`}
              color="#10B981"
            />
            <StatCard
              label="Expenses"
              value={`$${(dashboard.financialSummary.expenses / 1000).toFixed(1)}K`}
              color="#EF4444"
            />
            <StatCard
              label="Profit"
              value={`$${(dashboard.financialSummary.profit / 1000).toFixed(1)}K`}
              color="#4F46E5"
            />
          </View>

          {/* Assets Summary */}
          <SectionHeader title="Assets" action={{ title: 'View All', onPress: () => {} }} />
          <Card>
            <View style={styles.summaryRow}>
              <View>
                <Text style={styles.summaryLabel}>Total Assets</Text>
                <Text style={styles.summaryValue}>${dashboard.assetsSummary.totalAssets.toLocaleString()}</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{dashboard.assetsSummary.assetCount} items</Text>
              </View>
            </View>
          </Card>

          {/* Inventory Status */}
          <SectionHeader title="Inventory Status" />
          <View style={styles.statsGrid}>
            <StatCard
              label="Total Items"
              value={dashboard.inventoryStatus.totalItems}
              color="#3B82F6"
            />
            <StatCard
              label="Low Stock"
              value={dashboard.inventoryStatus.lowStockItems}
              color="#F59E0B"
            />
            <StatCard
              label="Out of Stock"
              value={dashboard.inventoryStatus.outOfStockItems}
              color="#EF4444"
            />
          </View>

          {/* Procurement Overview */}
          <SectionHeader title="Procurement" />
          <Card>
            <View style={styles.summaryRow}>
              <View>
                <Text style={styles.summaryLabel}>Pending Orders</Text>
                <Text style={styles.summaryValue}>
                  {dashboard.procurementOverview.totalPendingOrders}
                </Text>
              </View>
              <View>
                <Text style={styles.summaryLabel}>On-Time Rate</Text>
                <Text style={styles.summaryValue}>
                  {dashboard.procurementOverview.onTimeDeliveryRate}%
                </Text>
              </View>
            </View>
          </Card>

          {/* AI Insights */}
          {dashboard.aiInsights.length > 0 && (
            <>
              <SectionHeader title="AI Insights" />
              {dashboard.aiInsights.map((insight) => (
                <Card key={insight.id} style={styles.insightCard}>
                  <View style={styles.insightHeader}>
                    <Badge label={insight.type} variant="info" />
                    <Badge label={`${insight.impact} Impact`} variant="warning" />
                  </View>
                  <Text style={styles.insightTitle}>{insight.title}</Text>
                  <Text style={styles.insightDescription}>{insight.description}</Text>
                  <View style={styles.insightRecommendation}>
                    <Text style={styles.recommendationLabel}>Recommendation:</Text>
                    <Text style={styles.recommendationText}>{insight.recommendation}</Text>
                  </View>
                </Card>
              ))}
            </>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },
  date: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  periodSelector: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 4,
  },
  badge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0C4A6E',
  },
  insightCard: {
    marginHorizontal: 16,
  },
  insightHeader: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  insightTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  insightDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  insightRecommendation: {
    backgroundColor: '#F0F9FF',
    borderLeftWidth: 4,
    borderLeftColor: '#0C4A6E',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
  },
  recommendationLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0C4A6E',
  },
  recommendationText: {
    fontSize: 13,
    color: '#0C4A6E',
    marginTop: 4,
    lineHeight: 18,
  },
});
