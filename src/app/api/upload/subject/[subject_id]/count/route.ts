import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

type Params = { params: Promise<{ subject_id: string }> };

export async function GET(
  request: NextRequest,
  { params }: Params
) {
  try {
    const { subject_id } = await params;

    const { count, error } = await supabase
      .from('upload')
      .select('*', { count: 'exact', head: true })
      .eq('subject_id', subject_id);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to get upload count' },
        { status: 500 }
      );
    }

    return NextResponse.json({ count }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
