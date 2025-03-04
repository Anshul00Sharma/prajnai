import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

type Params = { params: Promise<{ user_id: string }> };

// GET endpoint to retrieve user credits
export async function GET(
  request: NextRequest,
  { params }: Params
) {
  try {
    const userId = (await params).user_id;

    // Fetch credit information for the user
    const { data, error } = await supabase
      .from("credits")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch credit information" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching credit:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST endpoint to create a new credit entry for a user
export async function POST(
  request: NextRequest,
  { params }: Params
) {
  try {
    const userId = (await params).user_id;
    const requestBody = await request.json();
    const creditAmount = requestBody.credit || 50; // Default to 50 if not specified

    // Create a new credit entry
    const { data, error } = await supabase
      .from("credits")
      .insert([
        {
          user_id: userId,
          credit: creditAmount,
        },
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to create credit entry" },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error creating credit:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH endpoint to update user credits
export async function PATCH(
  request: NextRequest,
  { params }: Params
) {
  try {
    const userId = (await params).user_id;
    const requestBody = await request.json();
    const { credit } = requestBody;

    if (credit === undefined) {
      return NextResponse.json(
        { error: "Credit amount is required" },
        { status: 400 }
      );
    }

    // Update the credit entry
    const { data, error } = await supabase
      .from("credits")
      .update({ credit })
      .eq("user_id", userId)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: "Failed to update credit" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating credit:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}