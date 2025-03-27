import { NextRequest, NextResponse } from "next/server";
import { editParagraph } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const requestData = await request.json();
    const { block, content, prompt, title } = requestData;

    // Validate required fields
    if (!content) {
      return NextResponse.json(
        { error: "Paragraph content is required" },
        { status: 400 }
      );
    }

    if (!prompt) {
      return NextResponse.json(
        { error: "Edit prompt is required" },
        { status: 400 }
      );
    }

    // Prepare data for Gemini AI
    const contextText = JSON.stringify(block);

    // Call Gemini AI to edit the paragraph
    const editedParagraph = await editParagraph({
      context: contextText,
      body: content,
      title: title || "Untitled Paragraph",
      userPrompt: prompt,
    });

    // Return edited paragraph
    return NextResponse.json({ 
      success: true, 
      editedParagraph 
    });
  } catch (error) {
    console.error("Error in paragraph editing API:", error);
    return NextResponse.json(
      { 
        error: "Failed to edit paragraph", 
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}