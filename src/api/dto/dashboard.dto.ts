import { z } from 'zod';

import { dateTimeSchema } from './common';
import { orderSummaryDtoSchema } from './order.dto';

const unknownObjectSchema = z.record(z.string(), z.unknown());

export const dashboardSnapshotDtoSchema = z.object({
  generatedAt: dateTimeSchema,
  timeZone: z.string().min(1),
  range: unknownObjectSchema,
  summary: unknownObjectSchema,
  health: unknownObjectSchema,
  revenueSeries: z.array(unknownObjectSchema),
  recentOrders: z.array(orderSummaryDtoSchema),
  paymentAlerts: z.array(unknownObjectSchema),
});

export type DashboardSnapshotDto = z.infer<typeof dashboardSnapshotDtoSchema>;
