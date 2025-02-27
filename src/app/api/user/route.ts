import { NextRequest, NextResponse } from 'next/server';
import { createUserSchema } from './schema';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';

// Validation schemas

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = createUserSchema.parse(body);

    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          id,
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
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

