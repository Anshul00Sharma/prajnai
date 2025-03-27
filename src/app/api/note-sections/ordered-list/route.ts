import { NextRequest, NextResponse } from "next/server";
import { editOrderedList } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const requestData = await request.json();
    const { block, items, prompt, title } = requestData;

    // Validate required fields
    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: "List items are required and must be an array" },
        { status: 400 }
      );
    }

    if (!prompt) {
      return NextResponse.json(
        { error: "Edit prompt is required" },
        { status: 400 }
      );
    }

    // Convert ListItem array to a string representation for the AI
    const itemsText = items.map(item => item.content).join("\n");

    // Prepare data for Gemini AI
    const contextText = JSON.stringify(block);

    // Call Gemini AI to edit the ordered list
    const editedItems = await editOrderedList({
      context: contextText,
      body: itemsText,
      title: title || "Untitled List",
      userPrompt: prompt,
    });

    // Convert the edited strings back to ListItem format with IDs
    const formattedItems = editedItems.map((content, index) => ({
      id: `edited-item-${Date.now()}-${index}`,
      content
    }));

    // Return edited list items
    return NextResponse.json({ 
      success: true, 
      editedItems: formattedItems
    });
  } catch (error) {
    console.error("Error in ordered list editing API:", error);
    return NextResponse.json(
      { 
        error: "Failed to edit ordered list", 
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}