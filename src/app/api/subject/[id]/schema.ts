import { z } from 'zod';

export const updateSubjectSchema = z.object({
  name: z.string(),
});
