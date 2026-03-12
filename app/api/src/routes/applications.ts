import { createApplicationSchema, updateApplicationSchema } from '@Shared';
import { eq } from 'drizzle-orm';
import { Router } from 'express';
import { db } from '../db';
import { addresses, applications } from '../db/schema';

const router = Router();

router.get('/', async (_req, res) => {
  const result = await db.query.applications.findMany({
    with: { company: true, address: true },
    orderBy: (apps, { desc }) => [desc(apps.appliedAt)],
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

  let addressId: number | undefined;
  if (address) {
    const [created] = await db.insert(addresses).values(address).returning();
    addressId = created.id;
  }

  const [application] = await db
    .insert(applications)
    .values({ ...appData, addressId })
    .returning();

  const result = await db.query.applications.findFirst({
    where: eq(applications.id, application.id),
    with: { company: true, address: true },
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

  if (address) {
    if (existing.addressId) {
      await db.update(addresses).set(address).where(eq(addresses.id, existing.addressId));
    } else {
      const [created] = await db.insert(addresses).values(address).returning();
      appData.companyId ??= existing.companyId;
      await db
        .update(applications)
        .set({ ...appData, addressId: created.id, updatedAt: new Date().toISOString() })
        .where(eq(applications.id, id));

      const result = await db.query.applications.findFirst({
        where: eq(applications.id, id),
        with: { company: true, address: true },
      });
      res.json(result);
      return;
    }
  }

  if (Object.keys(appData).length > 0) {
    await db
      .update(applications)
      .set({ ...appData, updatedAt: new Date().toISOString() })
      .where(eq(applications.id, id));
  }

  const result = await db.query.applications.findFirst({
    where: eq(applications.id, id),
    with: { company: true, address: true },
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

  if (existing.addressId) {
    await db.delete(addresses).where(eq(addresses.id, existing.addressId));
  }

  res.status(204).send();
});

export default router;
