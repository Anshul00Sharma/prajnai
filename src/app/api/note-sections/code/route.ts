import { NextRequest, NextResponse } from "next/server";
import { editCodeBlock } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const requestData = await request.json();
    const { block, code, language, prompt, title } = requestData;

    // Validate required fields
    if (!code) {
      return NextResponse.json(
        { error: "Code content is required" },
        { status: 400 }
      );
    }

    if (!prompt) {
      return NextResponse.json(
        { error: "Edit prompt is required" },
        { status: 400 }
      );
    }

    if (!language) {
      return NextResponse.json(
        { error: "Code language is required" },
        { status: 400 }
      );
    }

    // Prepare data for Gemini AI
    const contextText = JSON.stringify(block);

    // Call Gemini AI to edit the code block
    const editedCode = await editCodeBlock({
      context: contextText,
      initialCode: code,
      initialLanguage: language,
      title: title || "Untitled Code Block",
      userPrompt: prompt,
    });

    // Return edited code
    return NextResponse.json({ 
      success: true, 
      editedCode 
    });
  } catch (error) {
    console.error("Error in code block editing API:", error);
    return NextResponse.json(
      { 
        error: "Failed to edit code block", 
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}