import { NextResponse } from "next/server";
import {
  essayReviewStrengths,
  essayReviewWeaknesses,
  essayOverallFeedback,
} from "@/lib/gemini";

// Interface for request body
interface EssayReviewRequest {
  essay: string;
  title: string;
}

// Interface for response data
export interface EssayReviewResponse {
  strengths: string[];
  weaknesses: string[];
  overallFeedback: string;
}

export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json() as EssayReviewRequest;
    const { essay, title } = body;

    // Validate request data
    if (!essay || essay.trim().length < 50) {
      return NextResponse.json(
        { error: "Essay content must be at least 50 characters long" },
        { status: 400 }
      );
    }

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: "Essay title is required" },
        { status: 400 }
      );
    }

    // Make parallel API calls to Gemini
    const [strengths, weaknesses, feedback] = await Promise.all([
      essayReviewStrengths({ essay, title }),
      essayReviewWeaknesses({ essay, title }),
      essayOverallFeedback({ essay, title }),
    ]);

    // Format response
    const response: EssayReviewResponse = {
      strengths,
      weaknesses,
      overallFeedback: feedback,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in essay review API:", error);
    
    // Return appropriate error response
    return NextResponse.json(
      { error: "Failed to generate essay feedback" },
      { status: 500 }
    );
  }
}