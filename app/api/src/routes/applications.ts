import { createApplicationSchema, updateApplicationSchema } from '@Shared';
import { and, eq, sql } from 'drizzle-orm';
import { Router } from 'express';
import { db } from '../db';
import { applications, locations } from '../db/schema';

const router = Router();

async function upsertLocation(address: {
  city?: string;
  region?: string;
  country?: string;
}): Promise<number> {
  const country = address.country || null;
  const region = address.region || null;
  const city = address.city || null;

  const existing = await db.query.locations.findFirst({
    where: and(
      country ? eq(locations.country, country) : undefined,
      region ? eq(locations.region, region) : undefined,
      city ? eq(locations.city, city) : undefined,
    ),
  });

  if (existing) {
    const updates: Record<string, string> = {};
    if (region && !existing.region) updates.region = region;
    if (country && !existing.country) updates.country = country;
    if (Object.keys(updates).length > 0) {
      await db.update(locations).set(updates).where(eq(locations.id, existing.id));
    }
    return existing.id;
  }

  const [created] = await db.insert(locations).values({ country, region, city }).returning();
  return created.id;
}

router.get('/', async (_req, res) => {
  const result = await db.query.applications.findMany({
    with: { company: true, location: true, recruiter: true },
    orderBy: (apps, { desc }) => [
      desc(sql`CASE WHEN ${apps.status} = 'draft' THEN 1 ELSE 0 END`),
      desc(apps.appliedAt),
    ],
  });
  res.json(result);
});

router.post('/', async (req, res) => {
  const parsed = createApplicationSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { address, ...appData } = parsed.data;

  let locationId: number | undefined;
  if (address && (address.city || address.region || address.country)) {
    locationId = await upsertLocation(address);
  }

  const [application] = await db
    .insert(applications)
    .values({ ...appData, locationId })
    .returning();

  const result = await db.query.applications.findFirst({
    where: eq(applications.id, application.id),
    with: { company: true, location: true, recruiter: true },
  });

  res.status(201).json(result);
});

router.put('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const parsed = updateApplicationSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const existing = await db.query.applications.findFirst({
    where: eq(applications.id, id),
  });
  if (!existing) {
    res.status(404).json({ error: 'Application not found' });
    return;
  }

  const { address, ...appData } = parsed.data;

  let locationId = existing.locationId;
  if (address && (address.city || address.region || address.country)) {
    locationId = await upsertLocation(address);
  }

  // Auto-inject appliedAt when transitioning from draft to another status
  const updateData: Record<string, unknown> = {
    ...appData,
    locationId,
    updatedAt: new Date().toISOString(),
  };
  if (
    appData.status &&
    appData.status !== 'draft' &&
    existing.status === 'draft' &&
    !existing.appliedAt
  ) {
    updateData.appliedAt = appData.appliedAt || new Date().toISOString();
  }

  await db.update(applications).set(updateData).where(eq(applications.id, id));

  const result = await db.query.applications.findFirst({
    where: eq(applications.id, id),
    with: { company: true, location: true, recruiter: true },
  });
  res.json(result);
});

router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);

  const existing = await db.query.applications.findFirst({
    where: eq(applications.id, id),
  });
  if (!existing) {
    res.status(404).json({ error: 'Application not found' });
    return;
  }

  await db.delete(applications).where(eq(applications.id, id));
  res.status(204).send();
});

export default router;
