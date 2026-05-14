import { AggregatedData } from "../schemas/insights.schemas.js";

interface PromptOptions {
  analysisType:
    | "spending"
    | "inventory"
    | "procurement"
    | "financial"
    | "holistic";
  timeRange: {
    startDate: Date;
    endDate: Date;
  };
  focusAreas?: string[];
  anomalySensitivity: "low" | "medium" | "high";
  includeForecasts: boolean;
  includeTrendAnalysis: boolean;
}

/**
 * Prompt Builder Utility
 * Constructs sophisticated prompts for Gemini API
 * Ensures consistent, detailed analysis instructions
 */
export class PromptBuilder {
  /**
   * Build a spending analysis prompt
   */
  static buildSpendingAnalysisPrompt(options: PromptOptions): string {
    const sensitivityGuide = {
      low: "ignore variations under 15%",
      medium: "flag variations 5-15%",
      high: "flag all variations above 2%",
    };

    return `
You are an expert business analyst specializing in financial analysis and cost optimization.

TASK: Analyze spending patterns and provide actionable insights

ANALYSIS SCOPE:
- Time Period: ${options.timeRange.startDate.toISOString().split("T")[0]} to ${options.timeRange.endDate.toISOString().split("T")[0]}
- Focus Areas: ${options.focusAreas?.join(", ") || "All categories"}

REQUIRED ANALYSIS:
1. Spending Trends: Identify patterns, trends, and unusual movements
2. Category Analysis: Compare spending across categories and identify concentration risks
3. Supplier Performance: Evaluate supplier spending efficiency
${
  options.anomalySensitivity === "high"
    ? "4. Anomaly Detection: Identify ALL unusual spending patterns (sensitivity: HIGH)"
    : options.anomalySensitivity === "low"
      ? "4. Anomaly Detection: Identify only major unusual spending patterns (sensitivity: LOW)"
      : "4. Anomaly Detection: Identify notable unusual spending patterns (sensitivity: MEDIUM)"
}
${options.includeForecasts ? "5. Forecast: Project spending for next 3 months based on trends" : ""}
${options.includeTrendAnalysis ? "6. Trend Analysis: Decompose spending into trend, seasonal, and random components" : ""}

OUTPUT FORMAT:
Provide a JSON response with this structure:
{
  "insights": [
    {
      "type": "spending_analysis",
      "title": "Brief insight title",
      "summary": "1-2 sentence summary",
      "details": "Detailed explanation",
      "confidence": 0.0-1.0,
      "metrics": { "metric_name": value }
    }
  ],
  "anomalies": [
    {
      "type": "cost_spike|budget_overrun|unusual_pattern",
      "description": "What anomaly was detected",
      "severity": "low|medium|high|critical",
      "affectedEntity": "Category or supplier name",
      "deviation": percentage_value,
      "recommendation": "Suggested action"
    }
  ],
  ${options.includeForecasts ? '"forecasts": [...],' : ""}
  "summary": {
    "keyFindings": ["Finding 1", "Finding 2"],
    "overallHealthScore": 0-100,
    "areasOfConcern": ["Area 1"],
    "opportunitiesForOptimization": ["Opportunity 1"]
  }
}

GUIDELINES:
- Be specific with numbers and percentages
- Provide actionable recommendations
- Flag risks and opportunities clearly
- Use data to support all claims
- Consider context and seasonality
`;
  }

  /**
   * Build an inventory analysis prompt
   */
  static buildInventoryAnalysisPrompt(options: PromptOptions): string {
    return `
You are an expert inventory and supply chain analyst.

TASK: Analyze inventory levels, stock risks, and optimization opportunities

ANALYSIS SCOPE:
- Time Period: ${options.timeRange.startDate.toISOString().split("T")[0]} to ${options.timeRange.endDate.toISOString().split("T")[0]}
- Focus Areas: ${options.focusAreas?.join(", ") || "All SKUs"}

REQUIRED ANALYSIS:
1. Stock Health: Assess current stock levels vs. minimum/reorder points
2. Risk Assessment: Identify items at risk of stockout (low stock)
3. Overstock Analysis: Identify potentially overstocked items
4. SKU Distribution: Analyze concentration of inventory value
5. Inventory Turnover: Evaluate inventory movement efficiency
${options.anomalySensitivity === "high" ? "6. Critical Alerts: All items below minimum stock levels" : "6. Alerts: Items significantly below optimal levels"}
${options.includeForecasts ? "7. Forecast: Project stock depletion for next 30 days" : ""}

OUTPUT FORMAT:
Return JSON with:
{
  "insights": [...],
  "anomalies": [
    {
      "type": "low_stock_risk|unusual_inventory_level|overstock",
      "description": "What inventory issue",
      "severity": "low|medium|high|critical",
      "affectedEntity": "SKU or item name",
      "actualValue": current_stock,
      "expectedValue": optimal_stock,
      "deviation": percentage,
      "recommendation": "Action to take"
    }
  ],
  "recommendations": [
    {
      "category": "inventory_management",
      "title": "Recommendation",
      "priority": "low|medium|high|critical",
      "estimatedImpact": { "type": "cost_reduction", "amount": value },
      "implementationEffort": "easy|medium|hard"
    }
  ]
}

FOCUS ON:
- Critical stock-outs and risks
- Excess inventory driving costs
- Opportunities to improve turnover
- SKU rationalization opportunities
`;
  }

  /**
   * Build a procurement analysis prompt
   */
  static buildProcurementAnalysisPrompt(options: PromptOptions): string {
    return `
You are an expert procurement and supplier management analyst.

TASK: Analyze procurement efficiency and supplier performance

ANALYSIS SCOPE:
- Time Period: ${options.timeRange.startDate.toISOString().split("T")[0]} to ${options.timeRange.endDate.toISOString().split("T")[0]}
- Focus Areas: ${options.focusAreas?.join(", ") || "All suppliers and orders"}

REQUIRED ANALYSIS:
1. Supplier Performance: Evaluate supplier delivery times, quality, and value
2. Order Patterns: Identify ordering inefficiencies or opportunities
3. Supplier Concentration: Assess dependency risks on key suppliers
4. Procurement Efficiency: Analyze order frequency and average order values
5. Cost Analysis: Evaluate unit costs and negotiation opportunities
${options.anomalySensitivity === "high" ? "6. Alert: Identify unusual procurement patterns or supplier issues" : "6. Risks: Identify significant procurement concerns"}
${options.includeForecasts ? "7. Forecast: Project procurement volume and costs" : ""}

OUTPUT FORMAT:
Return analyst-grade JSON with insights, anomalies, and recommendations for procurement optimization.

INCLUDE:
- Supplier performance scorecards
- Consolidation opportunities
- Cost reduction strategies
- Risk mitigation approaches
- Process improvements
`;
  }

  /**
   * Build a financial analysis prompt
   */
  static buildFinancialAnalysisPrompt(options: PromptOptions): string {
    return `
You are an expert financial analyst.

TASK: Analyze financial health and identify optimization opportunities

ANALYSIS SCOPE:
- Time Period: ${options.timeRange.startDate.toISOString().split("T")[0]} to ${options.timeRange.endDate.toISOString().split("T")[0]}

REQUIRED ANALYSIS:
1. Profitability: Analyze margins, profit trends, and cost structure
2. Cash Flow: Evaluate working capital and cash position
3. Budget Performance: Compare actual vs. budgeted spending
4. Financial Health: Assess liquidity and financial stability
5. Cost Structure: Break down cost drivers and optimization opportunities
${options.anomalySensitivity === "high" ? "6. Alerts: Flag all unusual financial movements" : ""}
${options.includeForecasts ? "7. Forecast: Project financial performance for next quarter" : ""}

PROVIDE:
- Key financial metrics and ratios
- Trend analysis
- Risk assessment
- Growth opportunities
- Optimization recommendations
`;
  }

  /**
   * Build a holistic business analysis prompt
   */
  static buildHolisticAnalysisPrompt(options: PromptOptions): string {
    return `
You are a Chief Operating Officer analyzing company operational performance.

TASK: Provide comprehensive business insights across spending, inventory, and procurement

ANALYSIS SCOPE:
- Time Period: ${options.timeRange.startDate.toISOString().split("T")[0]} to ${options.timeRange.endDate.toISOString().split("T")[0]}

REQUIRED ANALYSIS:
1. Operational Health: Overall assessment of operations
2. Cost Efficiency: Spending patterns, inventory costs, and procurement efficiency
3. Supply Chain Health: Inventory levels, supplier performance, order efficiency
4. Financial Impact: Revenue, expenses, margins, cash flow
5. Risk Assessment: Identify critical risks across all areas
6. Interconnections: How different areas affect each other
${options.includeForecasts ? "7. Forecast: Integrated forecast of business performance" : ""}

OUTPUT FORMAT:
Provide comprehensive, interconnected analysis:
{
  "insights": [
    "Strategic business insights combining all functional areas"
  ],
  "anomalies": ["Cross-functional anomalies and risks"],
  "recommendations": [
    "Prioritized recommendations with business impact"
  ],
  "summary": {
    "keyFindings": ["Top 3-5 findings"],
    "overallHealthScore": 0-100,
    "areasOfConcern": ["Strategic risks"],
    "opportunitiesForOptimization": ["Strategic opportunities"]
  }
}

THINK ABOUT:
- Competitive advantage and efficiency
- Cost optimization across all areas
- Risk mitigation and resilience
- Growth opportunities
- Operational excellence
`;
  }

  /**
   * Build the appropriate prompt based on analysis type
   */
  static buildPrompt(options: PromptOptions): string {
    switch (options.analysisType) {
      case "spending":
        return this.buildSpendingAnalysisPrompt(options);
      case "inventory":
        return this.buildInventoryAnalysisPrompt(options);
      case "procurement":
        return this.buildProcurementAnalysisPrompt(options);
      case "financial":
        return this.buildFinancialAnalysisPrompt(options);
      case "holistic":
        return this.buildHolisticAnalysisPrompt(options);
      default:
        throw new Error(`Unknown analysis type: ${options.analysisType}`);
    }
  }

  /**
   * Format aggregated data into a readable context for the prompt
   */
  static formatDataContext(data: AggregatedData): string {
    const sections: string[] = [];

    sections.push(`=== DATA COLLECTION PERIOD ===`);
    sections.push(
      `Start: ${data.dataCollectionPeriod.startDate.toISOString().split("T")[0]}`
    );
    sections.push(
      `End: ${data.dataCollectionPeriod.endDate.toISOString().split("T")[0]}`
    );

    if (data.spending) {
      sections.push(`\n=== SPENDING DATA ===`);
      sections.push(`Total Spent: $${data.spending.totalSpent.toLocaleString()}`);
      sections.push(`By Category:`);
      Object.entries(data.spending.byCategory).forEach(([cat, amount]) => {
        const percentage = ((amount / data.spending!.totalSpent) * 100).toFixed(
          1
        );
        sections.push(`  - ${cat}: $${amount.toLocaleString()} (${percentage}%)`);
      });
      sections.push(`By Supplier:`);
      Object.entries(data.spending.bySupplier)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .forEach(([supplier, amount]) => {
          sections.push(
            `  - ${supplier}: $${amount.toLocaleString()} (${((amount / data.spending!.totalSpent) * 100).toFixed(1)}%)`
          );
        });
    }

    if (data.inventory) {
      sections.push(`\n=== INVENTORY DATA ===`);
      sections.push(`Total Items: ${data.inventory.totalItems}`);
      sections.push(
        `Value at Risk: $${data.inventory.valueAtRisk.toLocaleString()}`
      );
      sections.push(`Stock Levels:`);
      data.inventory.stockLevels.forEach((item) => {
        sections.push(
          `  - ${item.name}: ${item.current} (min: ${item.minimum}, reorder: ${item.reorderPoint}) [${item.riskLevel} risk]`
        );
      });
    }

    if (data.procurement) {
      sections.push(`\n=== PROCUREMENT DATA ===`);
      sections.push(`Total Orders: ${data.procurement.totalOrders}`);
      sections.push(
        `Average Order Value: $${data.procurement.averageOrderValue.toLocaleString()}`
      );
      sections.push(`Order Status Distribution:`);
      Object.entries(data.procurement.orderStatuses).forEach(
        ([status, count]) => {
          const percentage = (
            (count / data.procurement!.totalOrders) *
            100
          ).toFixed(1);
          sections.push(`  - ${status}: ${count} (${percentage}%)`);
        }
      );
      sections.push(`Top Suppliers:`);
      data.procurement.supplierMetrics
        .sort((a, b) => b.orderCount - a.orderCount)
        .slice(0, 5)
        .forEach((supplier) => {
          sections.push(
            `  - ${supplier.name}: ${supplier.orderCount} orders, ${supplier.averageDeliveryTime} days avg delivery`
          );
        });
    }

    if (data.finance) {
      sections.push(`\n=== FINANCE DATA ===`);
      if (data.finance.revenue !== undefined)
        sections.push(
          `Revenue: $${data.finance.revenue.toLocaleString()}`
        );
      sections.push(`Expenses: $${data.finance.expenses.toLocaleString()}`);
      if (data.finance.profitMargin !== undefined)
        sections.push(
          `Profit Margin: ${(data.finance.profitMargin * 100).toFixed(2)}%`
        );
      if (data.finance.cashFlow !== undefined)
        sections.push(
          `Cash Flow: $${data.finance.cashFlow.toLocaleString()}`
        );
    }

    sections.push(`\n=== DATA QUALITY ===`);
    sections.push(`Quality Level: ${data.metadata.dataQuality}`);
    sections.push(`Data Points: ${data.metadata.dataPointsIncluded}`);
    if (data.metadata.warnings?.length) {
      sections.push(`Warnings:`);
      data.metadata.warnings.forEach((w) => sections.push(`  - ${w}`));
    }

    return sections.join("\n");
  }
}

export default PromptBuilder;
