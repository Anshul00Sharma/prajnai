import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

type Params = { params: Promise<{ id: string }> };

export async function GET(
  request: NextRequest,
  { params }: Params
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Exam ID is required' },
        { status: 400 }
      );
    }

    // Fetch exam data from the database
    const { data, error } = await supabase
      .from('exam')
      .select('id, title, additionalInfo, feedback, true_false, short_answer, mcq')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Exam not found' },
          { status: 404 }
        );
      }
      throw error;
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Exam not found' },
        { status: 404 }
      );
    }

    // Format the response to match the expected structure in the frontend
    const formattedResponse = {
      id: data.id,
      title: data.title,
      description: data.additionalInfo || '',
      mcq: data.mcq || [],
      short_answer: data.short_answer || [],
      true_false: data.true_false || [],
      feedback: data.feedback || '',
    };

    return NextResponse.json(formattedResponse);
  } catch (error) {
    console.error('Error fetching exam:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exam data' },
      { status: 500 }
    );
  }
}