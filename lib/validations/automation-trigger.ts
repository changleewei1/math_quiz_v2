import { z } from 'zod';

export const automationTriggerSchema = z.object({
  job: z.enum(['follow_ups', 'trial_reminders', 'conversion_metrics']),
});

export type AutomationTriggerValues = z.infer<typeof automationTriggerSchema>;


