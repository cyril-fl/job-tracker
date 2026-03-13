import { createRecruiterSchema } from '@Shared';
import { eq } from 'drizzle-orm';
import { Router } from 'express';
import { db } from '../db';
import { recruiters } from '../db/schema';

const router = Router();

router.get('/', async (req, res) => {
  const companyId = Number(req.query.companyId);
  if (!companyId) {
    res.status(400).json({ error: 'companyId query parameter is required' });
    return;
  }
  const result = await db
    .select()
    .from(recruiters)
    .where(eq(recruiters.companyId, companyId))
    .orderBy(recruiters.lastName);
  res.json(result);
});

router.post('/', async (req, res) => {
  const parsed = createRecruiterSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  const [created] = await db.insert(recruiters).values(parsed.data).returning();
  res.status(201).json(created);
});

export default router;
