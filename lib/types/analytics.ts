export interface AnalyticsDateRange {
  from?: string;
  to?: string;
}

export interface FunnelMetricItem {
  stage: string;
  count: number;
  rate: number;
}

export interface SourceConversionMetric {
  source: string;
  leadCount: number;
  finishedQuiz: number;
  trialBooked: number;
  enrolled: number;
  enrollRate: number;
}

export interface CourseConversionMetric {
  courseName: string;
  trialCount: number;
  attendedCount: number;
  enrolledCount: number;
  enrollRate: number;
}

export interface WeaknessConversionMetric {
  dimension: string;
  totalCount: number;
  enrolledCount: number;
  enrollRate: number;
}


