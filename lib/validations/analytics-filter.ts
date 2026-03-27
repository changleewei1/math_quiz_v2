import { z } from 'zod';

export const analyticsFilterSchema = z.object({
  from: z.string().optional().or(z.literal('')),
  to: z.string().optional().or(z.literal('')),
});

export type AnalyticsFilterValues = z.infer<typeof analyticsFilterSchema>;


