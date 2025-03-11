import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { evaluateShortAnswer } from '@/lib/gemini';

// Interface for exam submission data
interface ExamSubmission {
  exam_id: string | string[];
  submission_time: string;
  answers: {
    mcq: {
      question: string;
      user_answer: string | null;
      correct_answer: string;
    }[];
    true_false: {
      question: string;
      user_answer: boolean | null;
      correct_answer: boolean;
    }[];
    short_answer: {
      question: string;
      user_answer: string;
      score?: number;
      modelAnswer?: string;
    }[];
  };
}

export async function POST(request: NextRequest) {
  try {
    // Parse the submission data from the request
    const submission: ExamSubmission = await request.json();
    console.log('Exam submission:', submission.answers.short_answer);
    
    if (!submission || !submission.exam_id) {
      return NextResponse.json(
        { error: 'Valid exam submission data is required' },
        { status: 400 }
      );
    }

   

    // Evaluate short answer questions using Gemini API
    for (const question of submission.answers.short_answer) {
      if (question.user_answer && question.user_answer.trim() !== '') {
        try {
          // Create context from exam data
          const ideal_answer = question.modelAnswer || '';
          
          // Evaluate the short answer using Gemini
          const evaluation = await evaluateShortAnswer({
            ideal_answer,
            question: {
              question: question.question,
              answer: question.user_answer
            }
          });
          
          // Update the question with the evaluation score
          question.score = evaluation.score;
        } catch (evalError) {
          console.error('Error evaluating short answer:', evalError);
          // If evaluation fails, default to 1 point as before
          question.score = 1;
        }
      } else {
        question.score = 0;
      }
    }

    // Calculate the score
    let totalScore = 0;
    const scoreDetails = {
      mcq: 0,
      true_false: 0,
      short_answer: 0
    };

    // Score MCQ questions (1 point for each correct answer)
    submission.answers.mcq.forEach(question => {
      if (question.user_answer === question.correct_answer) {
        totalScore += 1;
        scoreDetails.mcq += 1;
      }
    });

    // Score True/False questions (1 point for each correct answer)
    submission.answers.true_false.forEach(question => {
      if (question.user_answer === question.correct_answer) {
        totalScore += 1;
        scoreDetails.true_false += 1;
      }
    });

    // Score Short Answer questions using the Gemini evaluation scores
    submission.answers.short_answer.forEach(question => {
      if (question.score !== undefined) {
        // Add the AI-generated score (0-5 scale)
        totalScore += question.score;
        scoreDetails.short_answer += question.score;
      }
    });

    // Save the evaluation results to the database
    const { error } = await supabase
      .from('exam')
      .update({
        result: totalScore,
        evaluated: true,
        submission: submission, // Store the entire submission with scores for reference
      })
      .eq('id', submission.exam_id);

    if (error) {
      console.error('Error updating exam result:', error);
      return NextResponse.json(
        { error: 'Failed to save evaluation results' },
        { status: 500 }
      );
    }

    // Return the evaluation results
    return NextResponse.json({
      success: true,
      exam_id: submission.exam_id,
      total_score: totalScore,
      score_details: scoreDetails,
      max_possible_score: 
        submission.answers.mcq.length + 
        submission.answers.true_false.length + 
        (submission.answers.short_answer.length * 5), // Each short answer can score up to 5 points
      evaluated: true,
      message: 'Exam evaluation completed successfully'
    });
  } catch (error) {
    console.error('Error evaluating exam:', error);
    return NextResponse.json(
      { error: 'Failed to process exam evaluation' },
      { status: 500 }
    );
  }
}