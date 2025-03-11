import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { createExamSchema } from './schema';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request data
    const { 
      selectedTopics, 
      mcqCount, 
      trueFalseCount, 
      shortAnswerCount, 
      additionalInfo, 
      subject_id, 
      user_id 
    } = createExamSchema.parse(body);

    console.log(selectedTopics)

    // Check if user_id is provided
    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if subject_id is provided
    if (!subject_id) {
      return NextResponse.json(
        { error: 'Subject ID is required' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    
    // Insert exam into database
    const { data, error } = await supabase
      .from('exam')
      .insert([
        {
          topics: selectedTopics, // Store as array in database
          mcqCount,
          trueFalseCount,
          shortAnswerCount,
          additionalInfo: additionalInfo || null,
          user_id,
          subject_id,
          created_at: now,
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating exam:', error);
      return NextResponse.json(
        { error: 'Failed to create exam' },
        { status: 500 }
      );
    }

    if (!data) {
      console.error('No data returned from insert');
      return NextResponse.json(
        { error: 'Failed to create exam' },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error creating exam:', error);
      return NextResponse.json(
        { error: 'Failed to create exam' },
        { status: 500 }
      );
    } else {
      console.error('Unknown error creating exam:', error);
      return NextResponse.json(
        { error: 'Failed to create exam' },
        { status: 500 }
      );
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const subjectId = searchParams.get('subjectId');
    const userId = searchParams.get('userId');

    // Build query
    let query = supabase.from('exam').select('*');
    
    // Filter by subject if provided
    if (subjectId) {
      query = query.eq('subject_id', subjectId);
    }
    
    // Filter by user (required)
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    query = query.eq('user_id', userId);
    
    // Order by created_at descending (newest first)
    query = query.order('created_at', { ascending: false });
    
    // Execute query
    const { data, error } = await query;

    if (error) {
      console.error('Error fetching exams:', error);
      return NextResponse.json(
        { error: 'Failed to fetch exams' },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching exams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exams' },
      { status: 500 }
    );
  }
}