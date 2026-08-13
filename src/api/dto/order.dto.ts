import { z } from 'zod';

import { fulfillmentStatuses, paymentMethods, paymentStatuses } from '@/types/order';

import { dateTimeSchema, identifierSchema, moneySchema } from './common';

const orderSummaryShape = {
  id: identifierSchema,
  orderCode: z.string().min(1).optional(),
  code: z.string().min(1).optional(),
  paymentMethod: z.enum(paymentMethods).nullish(),
  paymentStatus: z.enum(paymentStatuses),
  fulfillmentStatus: z.enum(fulfillmentStatuses),
  totalAmount: moneySchema,
  createdByUserId: identifierSchema,
  assignedBaristaId: identifierSchema.nullish(),
  createdAt: dateTimeSchema,
} as const;

export const orderSummaryDtoSchema = z
  .object(orderSummaryShape)
  .refine((order) => order.orderCode !== undefined || order.code !== undefined, {
    message: 'Expected orderCode or code',
    path: ['orderCode'],
  });

export const orderItemDtoSchema = z
  .object({
    id: identifierSchema,
    menuItemId: identifierSchema,
    itemName: z.string().min(1).optional(),
    name: z.string().min(1).optional(),
    unitPrice: moneySchema,
    quantity: z.number().int().positive(),
    note: z.string().nullish(),
  })
  .refine((item) => item.itemName !== undefined || item.name !== undefined, {
    message: 'Expected itemName or name',
    path: ['itemName'],
  });

export const orderTimelineEventDtoSchema = z
  .object({
    id: identifierSchema.nullish(),
    status: z.string().nullish(),
    label: z.string().nullish(),
    note: z.string().nullish(),
    createdAt: dateTimeSchema.optional(),
    timestamp: dateTimeSchema.optional(),
  })
  .refine((event) => event.createdAt !== undefined || event.timestamp !== undefined, {
    message: 'Expected createdAt or timestamp',
    path: ['createdAt'],
  });

export const orderDetailDtoSchema = z
  .object({
    ...orderSummaryShape,
    customerNote: z.string().nullish(),
    cancellationReason: z.string().nullish(),
    paidAt: dateTimeSchema.nullish(),
    items: z.array(orderItemDtoSchema),
    timeline: z.array(orderTimelineEventDtoSchema),
    updatedAt: dateTimeSchema,
  })
  .refine((order) => order.orderCode !== undefined || order.code !== undefined, {
    message: 'Expected orderCode or code',
    path: ['orderCode'],
  });

export type OrderSummaryDto = z.infer<typeof orderSummaryDtoSchema>;
export type OrderItemDto = z.infer<typeof orderItemDtoSchema>;
export type OrderTimelineEventDto = z.infer<typeof orderTimelineEventDtoSchema>;
export type OrderDetailDto = z.infer<typeof orderDetailDtoSchema>;
