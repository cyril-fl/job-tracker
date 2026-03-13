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

// Rename a country
router.put('/countries', async (req, res) => {
  const { oldValue, newValue } = req.body as { oldValue: string; newValue: string };
  if (!oldValue || !newValue) {
    res.status(400).json({ error: 'oldValue and newValue are required' });
    return;
  }
  await db.update(locations).set({ country: newValue }).where(eq(locations.country, oldValue));
  res.status(204).end();
});

// Delete a country (nullify on all matching rows)
router.delete('/countries', async (req, res) => {
  const value = req.query.value as string | undefined;
  if (!value) {
    res.status(400).json({ error: 'value query parameter is required' });
    return;
  }
  await db
    .update(locations)
    .set({ country: null, region: null, city: null })
    .where(eq(locations.country, value));
  res.status(204).end();
});

// Rename a region
router.put('/regions', async (req, res) => {
  const { country, oldValue, newValue } = req.body as {
    country: string;
    oldValue: string;
    newValue: string;
  };
  if (!country || !oldValue || !newValue) {
    res.status(400).json({ error: 'country, oldValue and newValue are required' });
    return;
  }
  await db
    .update(locations)
    .set({ region: newValue })
    .where(and(eq(locations.country, country), eq(locations.region, oldValue)));
  res.status(204).end();
});

// Delete a region (nullify region and city on matching rows)
router.delete('/regions', async (req, res) => {
  const country = req.query.country as string | undefined;
  const value = req.query.value as string | undefined;
  if (!country || !value) {
    res.status(400).json({ error: 'country and value query parameters are required' });
    return;
  }
  await db
    .update(locations)
    .set({ region: null, city: null })
    .where(and(eq(locations.country, country), eq(locations.region, value)));
  res.status(204).end();
});

// Rename a city
router.put('/cities', async (req, res) => {
  const { country, region, oldValue, newValue } = req.body as {
    country: string;
    region?: string;
    oldValue: string;
    newValue: string;
  };
  if (!country || !oldValue || !newValue) {
    res.status(400).json({ error: 'country, oldValue and newValue are required' });
    return;
  }
  const conditions = [eq(locations.country, country), eq(locations.city, oldValue)];
  if (region) conditions.push(eq(locations.region, region));
  await db
    .update(locations)
    .set({ city: newValue })
    .where(and(...conditions));
  res.status(204).end();
});

// Delete a city (nullify city on matching rows)
router.delete('/cities', async (req, res) => {
  const country = req.query.country as string | undefined;
  const region = req.query.region as string | undefined;
  const value = req.query.value as string | undefined;
  if (!country || !value) {
    res.status(400).json({ error: 'country and value query parameters are required' });
    return;
  }
  const conditions = [eq(locations.country, country), eq(locations.city, value)];
  if (region) conditions.push(eq(locations.region, region));
  await db
    .update(locations)
    .set({ city: null })
    .where(and(...conditions));
  res.status(204).end();
});

export default router;
