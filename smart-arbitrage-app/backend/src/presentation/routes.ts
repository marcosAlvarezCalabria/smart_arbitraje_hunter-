import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { ListOpportunities } from '../application/ListOpportunities.js';

const requestSchema = z.object({
  asins: z.array(z.string()).min(1),
  marketplace: z.literal('ES'),
  options: z
    .object({
      historyDays: z.number().int().positive().max(365).optional(),
      forceUpdateHours: z.number().int().positive().max(168).optional()
    })
    .optional()
});

export const registerRoutes = (app: FastifyInstance, listOpportunities: ListOpportunities): void => {
  app.get('/health', async () => ({ status: 'ok' }));

  app.post('/opportunities', async (request, reply) => {
    const parsed = requestSchema.safeParse(request.body);
    if (!parsed.success) {
      reply.status(400);
      return { message: 'Invalid request payload', issues: parsed.error.issues };
    }

    try {
      const result = await listOpportunities.execute(parsed.data);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected error';
      reply.status(502);
      return {
        message: 'Failed to retrieve opportunities from upstream provider.',
        warnings: [message],
        opportunities: []
      };
    }
  });
};
