import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useAssetsStore } from '@/common/store';
import { SectionHeader, Card, ListItem, Button } from '@/common/components';

/**
 * Assets Screen
 */
export default function AssetsScreen() {
  const { assets, isLoading, fetchAssets } = useAssetsStore();
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    fetchAssets();
  }, []);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={() => fetchAssets()} />
      }
    >
      <SectionHeader title="Assets Inventory" subtitle="Manage your company assets" />

      {isLoading && !assets.length ? (
        <ActivityIndicator size="large" color="#4F46E5" />
      ) : (
        <>
          <View style={styles.filterContainer}>
            {['All', 'Active', 'Maintenance', 'Retired'].map((cat) => (
              <Button
                key={cat}
                title={cat}
                onPress={() => setSelectedCategory(cat)}
                variant={selectedCategory === cat ? 'primary' : 'outline'}
                size="small"
                style={styles.filterButton}
              />
            ))}
          </View>

          <View style={styles.listContainer}>
            {assets.map((asset: any) => (
              <Card key={asset.id} style={{ marginHorizontal: 16 }}>
                <ListItem
                  title={asset.name}
                  subtitle={`Category: ${asset.category}`}
                  rightText={`$${asset.value}`}
                />
                <Text style={styles.assetStatus}>{asset.status}</Text>
              </Card>
            ))}
          </View>

          {!assets.length && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No assets found</Text>
            </View>
          )}
        </>
      )}

      <Button
        title="Add New Asset"
        onPress={() => {}}
        style={styles.addButton}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  filterButton: {
    flex: 1,
  },
  listContainer: {
    paddingVertical: 12,
  },
  assetStatus: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 8,
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
  addButton: {
    marginHorizontal: 16,
    marginVertical: 20,
  },
});
