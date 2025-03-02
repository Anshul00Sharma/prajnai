import { z } from 'zod';

export const createTopicSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  subject_id: z.string(),
  additional_info: z.string().optional(),
});
