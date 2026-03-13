import { and, eq, isNotNull } from 'drizzle-orm';
import { Router } from 'express';
import { db } from '../db';
import { locations } from '../db/schema';

const router = Router();

router.get('/countries', async (_req, res) => {
  const result = await db
    .selectDistinct({ country: locations.country })
    .from(locations)
    .where(isNotNull(locations.country));
  res.json(result.map((r) => r.country).filter(Boolean));
});

router.get('/regions', async (req, res) => {
  const country = req.query.country as string | undefined;
  if (!country) {
    res.status(400).json({ error: 'country query parameter is required' });
    return;
  }
  const result = await db
    .selectDistinct({ region: locations.region })
    .from(locations)
    .where(eq(locations.country, country));
  res.json(result.map((r) => r.region).filter(Boolean));
});

router.get('/cities', async (req, res) => {
  const country = req.query.country as string | undefined;
  const region = req.query.region as string | undefined;
  if (!country) {
    res.status(400).json({ error: 'country query parameter is required' });
    return;
  }

  const conditions = [eq(locations.country, country)];
  if (region) {
    conditions.push(eq(locations.region, region));
  }

  const result = await db
    .selectDistinct({ city: locations.city })
    .from(locations)
    .where(and(...conditions));
  res.json(result.map((r) => r.city).filter(Boolean));
});

export default router;
