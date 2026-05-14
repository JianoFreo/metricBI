/**
 * Chart Components
 * Reusable chart components for visualizing data
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  ScrollView,
  Dimensions,
} from 'react-native';
import { BarChart, LineChart, PieChart } from 'react-native-chart-kit';

const windowWidth = Dimensions.get('window').width;
const chartWidth = windowWidth - 32;

export interface ChartData {
  labels: string[];
  datasets: Array<{
    data: number[];
    color?: (opacity: number) => string;
  }>;
}

export interface SimpleChartProps {
  title: string;
  subtitle?: string;
  data: ChartData;
  type?: 'line' | 'bar';
  style?: ViewStyle;
}

export interface PieChartDataItem {
  name: string;
  value: number;
  color: string;
  legendFontColor: string;
  legendFontSize: number;
}

export interface PieChartComponentProps {
  title: string;
  subtitle?: string;
  data: PieChartDataItem[];
  style?: ViewStyle;
}

const chartConfig = {
  backgroundColor: '#FFFFFF',
  backgroundGradientFrom: '#FFFFFF',
  backgroundGradientTo: '#FFFFFF',
  color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.65,
  useShadowColorFromDataset: false,
  decimalPlaces: 0,
};

/**
 * Line Chart Component
 */
export const LineChartComponent: React.FC<SimpleChartProps> = ({
  title,
  subtitle,
  data,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <LineChart
          data={data}
          width={chartWidth}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chart}
        />
      </ScrollView>
    </View>
  );
};

/**
 * Bar Chart Component
 */
export const BarChartComponent: React.FC<SimpleChartProps> = ({
  title,
  subtitle,
  data,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <BarChart
          data={data}
          width={chartWidth}
          height={220}
          chartConfig={chartConfig}
          style={styles.chart}
          yAxisLabel=""
          yAxisSuffix=""
        />
      </ScrollView>
    </View>
  );
};

/**
 * Pie Chart Component
 */
export const PieChartComponent: React.FC<PieChartComponentProps> = ({
  title,
  subtitle,
  data,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      <PieChart
        data={data}
        width={chartWidth}
        height={220}
        chartConfig={chartConfig}
        accessor="value"
        backgroundColor="transparent"
        paddingLeft="15"
        style={styles.chart}
      />
    </View>
  );
};

/**
 * Sales Trend Chart (Line Chart)
 */
export const SalesTrendChart: React.FC<{ 
  data?: Array<{ date: string; sales: number }>;
}> = ({ data = [] }) => {
  const chartData: ChartData = {
    labels: data.slice(0, 6).map(d => d.date.split('-').pop() || ''),
    datasets: [
      {
        data: data.slice(0, 6).map(d => d.sales / 1000), // Convert to thousands
        color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
      },
    ],
  };

  return (
    <LineChartComponent
      title="Sales Trend"
      subtitle="Last 6 months (in thousands)"
      data={chartData}
    />
  );
};

/**
 * Inventory Status Chart (Bar Chart)
 */
export const InventoryStatusChart: React.FC<{
  inStock?: number;
  lowStock?: number;
  outOfStock?: number;
}> = ({ inStock = 150, lowStock = 45, outOfStock = 12 }) => {
  const chartData: ChartData = {
    labels: ['In Stock', 'Low Stock', 'Out'],
    datasets: [
      {
        data: [inStock, lowStock, outOfStock],
        color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
      },
    ],
  };

  return (
    <BarChartComponent
      title="Inventory Status"
      subtitle="Items by availability"
      data={chartData}
    />
  );
};

/**
 * Procurement Orders Chart (Bar Chart)
 */
export const ProcurementOrdersChart: React.FC<{
  pending?: number;
  confirmed?: number;
  shipped?: number;
  delivered?: number;
}> = ({ pending = 8, confirmed = 15, shipped = 12, delivered = 28 }) => {
  const chartData: ChartData = {
    labels: ['Pending', 'Confirmed', 'Shipped', 'Delivered'],
    datasets: [
      {
        data: [pending, confirmed, shipped, delivered],
        color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
      },
    ],
  };

  return (
    <BarChartComponent
      title="Order Status"
      subtitle="Purchase orders by status"
      data={chartData}
    />
  );
};

/**
 * Pie chart data item type
 */
interface PieChartDataItem {
  name: string;
  value: number;
  color: string;
  legendFontColor: string;
  legendFontSize: number;
}

/**
 * Asset Categories Pie Chart
 */
export const AssetCategoriesPie: React.FC<{
  categories?: PieChartDataItem[];
}> = ({
  categories = [
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
  ],
}) => {
  return (
    <PieChartComponent
      title="Asset Categories"
      subtitle="Distribution by type"
      data={categories}
    />
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
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 12,
  },
});
