import { z } from 'zod';

/** Query params for listing audit logs. */
export const listAuditQuerySchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
  actorId: z.string().optional(),
  adminName: z.string().optional(),
  search: z.string().optional(),
  action: z.enum(['create', 'update', 'delete']).optional(),
  entity: z
    .enum([
      'gallery',
      'leadership',
      'content',
      'settings',
      'message',
      'donation',
      'admin',
      'auth',
    ])
    .optional(),
  category: z
    .enum(['auth', 'gallery', 'content', 'donation', 'message', 'admin'])
    .optional(),
  eventType: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(200).optional(),
});
