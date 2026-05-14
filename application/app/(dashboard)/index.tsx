/**
 * Dashboard Screen
 * Main dashboard with KPIs, charts, insights, and quick actions
 * Uses OOP architecture with BaseScreen and ServiceFactory
 */

import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  View,
  Text,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ServiceFactory } from '@/common/api';
import { KPICard } from '@/common/components/KPICard';
import {
  SalesTrendChart,
  InventoryStatusChart,
  ProcurementOrdersChart,
  AssetCategoriesPie,
} from '@/common/components/Charts';
import { AIInsightsSummary } from '@/common/components/AIInsights';
import { QuickActions } from '@/common/components/QuickActions';
import type { Dashboard, AIInsight } from '@/common/types';
import { FormatUtils } from '@/common/utils';

interface DashboardScreenState {
  dashboard: Dashboard | null;
  insights: AIInsight[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

/**
 * Dashboard Screen Component
 */
export default function DashboardScreen() {
  const [state, setState] = useState<DashboardScreenState>({
    dashboard: null,
    insights: [],
    isLoading: true,
    error: null,
    lastUpdated: null,
  });

  const dashboardService = ServiceFactory.getDashboardService();

  /**
   * Fetch dashboard data
   */
  const fetchDashboard = async () => {
    try {
      setState((s) => ({ ...s, isLoading: true, error: null }));

      // Fetch dashboard data
      const dashboardResponse = await dashboardService.get<Dashboard>('/');

      if (!dashboardResponse.success || !dashboardResponse.data) {
        throw new Error('Failed to fetch dashboard');
      }

      const dashboard = dashboardResponse.data;

      // Fetch insights
      const insightsResponse = await dashboardService.get<AIInsight[]>(
        '/insights'
      );
      const insights = insightsResponse.data || [];

      setState((s) => ({
        ...s,
        dashboard,
        insights,
        isLoading: false,
        lastUpdated: new Date(),
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to load dashboard';
      setState((s) => ({ ...s, isLoading: false, error: errorMessage }));
      console.error('Dashboard fetch error:', error);
    }
  };

  /**
   * Fetch on mount and screen focus
   */
  useEffect(() => {
    fetchDashboard();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      // Optional: Refresh data on screen focus
      // fetchDashboard();
      return () => {};
    }, [])
  );

  /**
   * Quick action handlers
   */
  const handleQuickAction = (action: string) => {
    console.log('Quick action:', action);
    // Navigate or perform action
  };

  if (state.isLoading && !state.dashboard) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  if (state.error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Error: {state.error}</Text>
        <Text
          style={styles.retryButton}
          onPress={fetchDashboard}
        >
          Tap to retry
        </Text>
      </View>
    );
  }

  const dashboard = state.dashboard;
  if (!dashboard) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>No data available</Text>
      </View>
    );
  }

  const financial = dashboard.financialSummary;
  const assets = dashboard.assetsSummary;
  const inventory = dashboard.inventoryStatus;
  const procurement = dashboard.procurementOverview;

  const quickActions = [
    {
      id: 'create-order',
      label: 'Create Order',
      icon: 'plus-circle',
      color: '#4F46E5',
      onPress: () => handleQuickAction('create-order'),
      disabled: false,
    },
    {
      id: 'low-stock',
      label: 'Low Stock',
      icon: 'alert-circle',
      color: '#F59E0B',
      onPress: () => handleQuickAction('low-stock'),
      badge: inventory.lowStockItems,
      disabled: false,
    },
    {
      id: 'pending-orders',
      label: 'Pending',
      icon: 'clock',
      color: '#3B82F6',
      onPress: () => handleQuickAction('pending-orders'),
      badge: procurement.totalPendingOrders,
      disabled: false,
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: 'file-chart',
      color: '#10B981',
      onPress: () => handleQuickAction('reports'),
      disabled: false,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: 'cog',
      color: '#8B5CF6',
      onPress: () => handleQuickAction('settings'),
      disabled: false,
    },
    {
      id: 'export',
      label: 'Export',
      icon: 'download',
      color: '#EC4899',
      onPress: () => handleQuickAction('export'),
      disabled: false,
    },
  ];

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={state.isLoading}
            onRefresh={fetchDashboard}
            tintColor="#4F46E5"
            colors={['#4F46E5']}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good day</Text>
            <Text style={styles.subtitle}>
              Last updated:{' '}
              {state.lastUpdated
                ? FormatUtils.formatTime(state.lastUpdated)
                : 'Loading...'}
            </Text>
          </View>
        </View>

        {/* KPI Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Metrics</Text>
          <View>
            <KPICard
              title="Total Revenue"
              value={FormatUtils.formatCurrency(financial.revenue)}
              change={financial.margin}
              trend="up"
              icon="trending-up"
              color="#4F46E5"
            />
            <KPICard
              title="Total Assets"
              value={assets.assetCount}
              unit="items"
              change={15}
              trend="up"
              icon="briefcase"
              color="#10B981"
            />
            <KPICard
              title="Inventory Value"
              value={FormatUtils.formatCurrency(inventory.totalValue)}
              change={-5}
              trend="down"
              icon="package-variant"
              color="#F59E0B"
            />
            <KPICard
              title="Pending Orders"
              value={procurement.totalPendingOrders}
              unit="orders"
              change={procurement.onTimeDeliveryRate}
              trend="up"
              icon="cart"
              color="#3B82F6"
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <QuickActions
            actions={quickActions}
            layout="horizontal"
          />
        </View>

        {/* Charts Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance</Text>

          {/* Sales Trend */}
          <SalesTrendChart
            data={[
              { date: '2024-01-01', sales: 45000 },
              { date: '2024-01-02', sales: 52000 },
              { date: '2024-01-03', sales: 48000 },
              { date: '2024-01-04', sales: 61000 },
              { date: '2024-01-05', sales: 55000 },
              { date: '2024-01-06', sales: 67000 },
            ]}
          />

          {/* Inventory Status */}
          <InventoryStatusChart
            inStock={inventory.totalItems - inventory.lowStockItems - inventory.outOfStockItems}
            lowStock={inventory.lowStockItems}
            outOfStock={inventory.outOfStockItems}
          />

          {/* Procurement Orders */}
          <ProcurementOrdersChart
            pending={procurement.totalPendingOrders}
            confirmed={8}
            shipped={12}
            delivered={28}
          />

          {/* Asset Categories */}
          <AssetCategoriesPie
            categories={[
              {
                name: 'Equipment',
                value: 35,
                color: '#4F46E5',
                legendFontColor: '#7F8C8D',
                legendFontSize: 13,
              },
              {
                name: 'Machinery',
                value: 25,
                color: '#10B981',
                legendFontColor: '#7F8C8D',
                legendFontSize: 13,
              },
              {
                name: 'Vehicles',
                value: 20,
                color: '#F59E0B',
                legendFontColor: '#7F8C8D',
                legendFontSize: 13,
              },
              {
                name: 'Other',
                value: 20,
                color: '#8B5CF6',
                legendFontColor: '#7F8C8D',
                legendFontSize: 13,
              },
            ]}
          />
        </View>

        {/* AI Insights */}
        <View style={styles.section}>
          <AIInsightsSummary
            insights={state.insights}
            isLoading={state.isLoading}
            onRefresh={fetchDashboard}
          />
        </View>

        {/* Footer */}
        <View style={styles.footer} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '600',
  },
  retryButton: {
    fontSize: 14,
    color: '#4F46E5',
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4F46E5',
    marginTop: 8,
    backgroundColor: '#EEF2FF',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: '#F9FAFB',
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  footer: {
    height: 20,
  },
});
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
