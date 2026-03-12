import { createCompanySchema, updateCompanySchema } from '@Shared';
import { eq } from 'drizzle-orm';
import { Router } from 'express';
import { db } from '../db';
import { companies } from '../db/schema';

const router = Router();

router.get('/', async (_req, res) => {
  const result = await db.select().from(companies).orderBy(companies.name);
  res.json(result);
});

router.post('/', async (req, res) => {
  const parsed = createCompanySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const [created] = await db.insert(companies).values(parsed.data).returning();
  res.status(201).json(created);
});

router.put('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const parsed = updateCompanySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const [updated] = await db
    .update(companies)
    .set({ ...parsed.data, updatedAt: new Date().toISOString() })
    .where(eq(companies.id, id))
    .returning();
  if (!updated) {
    res.status(404).json({ error: 'Company not found' });
    return;
  }
  res.json(updated);
});

router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const [deleted] = await db.delete(companies).where(eq(companies.id, id)).returning();
  if (!deleted) {
    res.status(404).json({ error: 'Company not found' });
    return;
  }
  res.status(204).send();
});

export default router;
