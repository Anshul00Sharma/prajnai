import { NextRequest, NextResponse } from 'next/server';
import { updateSubjectSchema } from './schema';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';

type Params = { params: Promise<{ id: string }> };

export async function PUT(
  request: NextRequest,
  { params }: Params
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name } = updateSubjectSchema.parse(body);

    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('subject')
      .update({ 
        name,
        updated_at: now
      })
      .eq('id', id)
      .select('id, name, created_at, updated_at')
      .single();

    if (error) throw error;
    if (!data) {
      return NextResponse.json(
        { error: 'Subject not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error updating subject:', error);
    return NextResponse.json(
      { error: 'Failed to update subject' },
      { status: 500 }
    );
  }
}
