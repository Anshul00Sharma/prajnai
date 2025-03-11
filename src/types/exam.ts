export interface Exam {
  id: string;
  topics: string[];
  mcqCount: number;
  trueFalseCount: number;
  shortAnswerCount: number;
  additionalInfo?: string;
  user_id: string;
  subject_id: string;
  created_at: string;
  exam_ready: boolean;
}
