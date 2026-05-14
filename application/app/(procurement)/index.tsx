import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useProcurementStore } from '@/common/store';
import { SectionHeader, Card, ListItem, Badge } from '@/common/components';

/**
 * Procurement Screen
 */
export default function ProcurementScreen() {
  const { orders, isLoading, fetchOrders } = useProcurementStore();

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusVariant = (status: string): any => {
    switch (status) {
      case 'delivered':
        return 'success';
      case 'shipped':
        return 'info';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'danger';
      default:
        return 'info';
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={() => fetchOrders()} />
      }
    >
      <SectionHeader title="Procurement Orders" subtitle="Purchase orders & status" />

      {isLoading && !orders.length ? (
        <ActivityIndicator size="large" color="#4F46E5" />
      ) : (
        <View style={styles.listContainer}>
          {orders.map((order: any) => (
            <Card key={order.id} style={{ marginHorizontal: 16 }}>
              <ListItem
                title={`Order #${order.orderNumber}`}
                subtitle={`From: ${order.supplier}`}
                rightText={`$${order.totalValue}`}
              />
              <View style={styles.orderDetails}>
                <Badge
                  label={order.status.toUpperCase()}
                  variant={getStatusVariant(order.status)}
                />
                <Text style={styles.date}>{new Date(order.orderDate).toLocaleDateString()}</Text>
                <Text style={styles.expectedDate}>
                  Expected: {new Date(order.expectedDelivery).toLocaleDateString()}
                </Text>
              </View>
              {order.items && (
                <View style={styles.itemsList}>
                  {order.items.slice(0, 2).map((item: any, idx: number) => (
                    <Text key={idx} style={styles.itemText}>
                      • {item.name} (×{item.quantity})
                    </Text>
                  ))}
                </View>
              )}
            </Card>
          ))}
        </View>
      )}

      {!orders.length && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No procurement orders</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  listContainer: {
    paddingVertical: 12,
  },
  orderDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  date: {
    fontSize: 12,
    color: '#6B7280',
  },
  expectedDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  itemsList: {
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  itemText: {
    fontSize: 12,
    color: '#6B7280',
    marginVertical: 2,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
});
