import { NextRequest, NextResponse } from 'next/server';
import { createTopicSchema } from './schema';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, subject_id, additional_info } = createTopicSchema.parse(body);

    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('topic')
      .insert([
        {
          id,
          title,
          subject_id,
          additional_info: additional_info || null,
          created_at: now,
          updated_at: now
        }
      ])
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('No data returned from insert');

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating topic:', error);
    return NextResponse.json(
      { error: 'Failed to create topic' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const subjectId = searchParams.get('subjectId');

    if (!subjectId) {
      return NextResponse.json(
        { error: 'Subject ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('topic')
      .select('id, title, subject_id, additional_info, note, have_note, created_at, updated_at')
      .eq('subject_id', subjectId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching topics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch topics' },
      { status: 500 }
    );
  }
}
