import { z } from 'zod';

export const createExamSchema = z.object({
  selectedTopics: z.array(z.string()),
  mcqCount: z.number().int().min(0),
  trueFalseCount: z.number().int().min(0),
  shortAnswerCount: z.number().int().min(0),
  additionalInfo: z.string().optional(),
  subject_id: z.string(),
  user_id: z.string()
});

export type CreateExamInput = z.infer<typeof createExamSchema>;
