import { z } from 'zod';

export const createSubjectSchema = z.object({
  user_id: z.string(),
  id: z.string(),
});
