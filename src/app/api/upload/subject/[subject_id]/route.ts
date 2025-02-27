import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Configure route segment config
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ subject_id: string }> };

export async function GET(
  request: NextRequest,
  { params }: Params
) {
  try {
    const { subject_id } = await params;

    // Query uploads for the given subject_id
    const { data, error } = await supabase
      .from('upload')
      .select('id, title, type, description, created_at, subject_id')
      .eq('subject_id', subject_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch uploads' },
        { status: 500 }
      );
    }

    // Return the uploads
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
