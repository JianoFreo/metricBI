import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { reportsApi } from '@/common/api/services';
import { SectionHeader, Card, ListItem, Button, Badge } from '@/common/components';

/**
 * Reports Screen
 */
export default function ReportsScreen() {
  const [reports, setReports] = React.useState<any[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const response = await reportsApi.getReports();
      if (response.data) {
        setReports(response.data);
      }
    } catch (error: any) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusVariant = (status: string): any => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'processing':
        return 'info';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'danger';
      default:
        return 'info';
    }
  };

  const handleDownload = async (reportId: string, format: string) => {
    try {
      const url = await reportsApi.downloadReport(reportId, format);
      // Open URL or download file
    } catch (error) {
      console.error('Failed to download report:', error);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={fetchReports} />
      }
    >
      <SectionHeader title="Reports" subtitle="Generate and view reports" />

      {isLoading && !reports.length ? (
        <ActivityIndicator size="large" color="#4F46E5" />
      ) : (
        <>
          {/* Report Types */}
          <View style={styles.typeGrid}>
            {['Asset', 'Inventory', 'Procurement', 'Financial'].map((type) => (
              <TouchableOpacity key={type} style={styles.typeCard}>
                <Text style={styles.typeIcon}>📄</Text>
                <Text style={styles.typeLabel}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Generated Reports */}
          <SectionHeader title="Recent Reports" />
          <View style={styles.listContainer}>
            {reports.map((report: any) => (
              <Card key={report.id} style={{ marginHorizontal: 16 }}>
                <ListItem
                  title={report.title}
                  subtitle={new Date(report.createdAt).toLocaleDateString()}
                  rightText={report.format.toUpperCase()}
                />
                <View style={styles.reportFooter}>
                  <Badge
                    label={report.status}
                    variant={getStatusVariant(report.status)}
                  />
                  {report.status === 'completed' && (
                    <TouchableOpacity
                      onPress={() => handleDownload(report.id, report.format)}
                    >
                      <Text style={styles.downloadLink}>Download</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </Card>
            ))}
          </View>

          {!reports.length && (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No reports generated yet</Text>
            </View>
          )}
        </>
      )}

      <Button
        title="Generate New Report"
        onPress={() => {}}
        style={styles.generateButton}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  typeGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    flexWrap: 'wrap',
  },
  typeCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  typeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  typeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
  },
  listContainer: {
    paddingVertical: 12,
  },
  reportFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  downloadLink: {
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
  generateButton: {
    marginHorizontal: 16,
    marginVertical: 20,
  },
});
