import dotenv from 'dotenv';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { KeepaClient } from './infra/keepa/KeepaClient.js';
import { KeepaProductAdapter } from './infra/keepa/KeepaProductAdapter.js';
import { ListOpportunities } from './application/ListOpportunities.js';
import { registerRoutes } from './presentation/routes.js';

dotenv.config();

const port = Number(process.env.PORT ?? 3001);
const keepaApiKey = process.env.KEEPA_API_KEY;

const app = Fastify({ logger: true });
await app.register(cors, {
  origin: 'http://localhost:5173'
});

if (!keepaApiKey) {
  app.log.warn('KEEPA_API_KEY is not set. /opportunities will fail until configured.');
}

const keepaClient = new KeepaClient(keepaApiKey ?? '');
const keepaAdapter = new KeepaProductAdapter(keepaClient);
const listOpportunities = new ListOpportunities(keepaAdapter);

registerRoutes(app, listOpportunities);

app.listen({ port, host: '0.0.0.0' }).catch((error) => {
  app.log.error(error);
  process.exit(1);
});
