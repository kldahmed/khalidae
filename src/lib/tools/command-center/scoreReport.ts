export function scoreReport(pageData: any, executiveBrief: any, strategicAnalysis: any, contentConversion: any, seo: any, actionPlan: any) {
  // Simple scoring logic for demonstration
  return {
    clarity: Math.min(100, (pageData.bodyText?.length || 0) > 100 ? 90 : 60),
    strategic: 80,
    viral: 75,
    conversion: 70,
    brand: 85,
  };
}
