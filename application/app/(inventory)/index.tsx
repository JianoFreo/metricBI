import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useInventoryStore } from '@/common/store';
import { SectionHeader, Card, ListItem, Badge } from '@/common/components';

/**
 * Inventory Screen
 */
export default function InventoryScreen() {
  const { items, isLoading, fetchInventory } = useInventoryStore();

  useEffect(() => {
    fetchInventory();
  }, []);

  const getStockStatus = (quantity: number, reorderLevel: number) => {
    if (quantity === 0) return 'danger';
    if (quantity < reorderLevel) return 'warning';
    return 'success';
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={() => fetchInventory()} />
      }
    >
      <SectionHeader title="Inventory" subtitle="Current stock levels" />

      {isLoading && !items.length ? (
        <ActivityIndicator size="large" color="#4F46E5" />
      ) : (
        <View style={styles.listContainer}>
          {items.map((item: any) => (
            <Card key={item.id} style={{ marginHorizontal: 16 }}>
              <View style={styles.itemRow}>
                <View style={{ flex: 1 }}>
                  <ListItem
                    title={item.name}
                    subtitle={`SKU: ${item.sku}`}
                    rightText={`×${item.quantity}`}
                  />
                  <View style={styles.itemDetails}>
                    <Badge
                      label={getStockStatus(item.quantity, item.reorderLevel)}
                      variant={getStockStatus(item.quantity, item.reorderLevel) as any}
                    />
                    <Text style={styles.location}>{item.location}</Text>
                    <Text style={styles.value}>${item.value}</Text>
                  </View>
                </View>
              </View>
            </Card>
          ))}
        </View>
      )}

      {!items.length && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No inventory items</Text>
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
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  location: {
    fontSize: 12,
    color: '#6B7280',
  },
  value: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4F46E5',
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
