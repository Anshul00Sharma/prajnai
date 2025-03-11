import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from 'uuid';
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Interface for the request body
interface RequestBody {
  message: string;
  noteId?: string;
}

export async function POST(req: NextRequest) {
  try {
    // Parse request body
    const body: RequestBody = await req.json();
    const { message, noteId } = body;

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    if (!noteId) {
      return NextResponse.json({ error: "Note ID is required" }, { status: 400 });
    }

    // Fetch note content from topic table to use as context
    const { data: topicData, error: topicError } = await supabase
      .from('topic')
      .select('note')
      .eq('id', noteId)
      .single();

    if (topicError) {
      console.error("Error fetching topic:", topicError);
      return NextResponse.json(
        { error: "Failed to fetch topic data" },
        { status: 500 }
      );
    }

    // Extract note content to use as context
    const noteContent = topicData?.note ? JSON.stringify(topicData.note) : "";

    // Save user message to the database
    const userMessageId = uuidv4();
    const now = new Date();
    const userMessage = {
      id: userMessageId,
      created_at: now.toISOString(),
      by: "user",
      content: message,
      "note-id": noteId || null,
      timestamp: now.toISOString(),
    };

    const { error: userMessageError } = await supabase
      .from("ai-chat-message")
      .insert(userMessage);

    if (userMessageError) {
      console.error("Error saving user message:", userMessageError);
      return NextResponse.json(
        { error: "Failed to save user message" },
        { status: 500 }
      );
    }

    // Fetch recent chat history (latest 20 messages)
    const { data: chatHistory, error: chatHistoryError } = await supabase
      .from("ai-chat-message")
      .select("*")
      .eq("note-id", noteId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (chatHistoryError) {
      console.error("Error fetching chat history:", chatHistoryError);
      return NextResponse.json(
        { error: "Failed to fetch chat history" },
        { status: 500 }
      );
    }

    // Convert chat history to format for Gemini
    const formattedChatHistory = chatHistory
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .map((msg) => ({
        role: msg.by === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      }));

    const generationConfig = {
      temperature: 0.7,
      topP: 0.8,
      topK: 40,
      maxOutputTokens: 400,
    }

    // Generate response using Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Add note content to the first message as context
    let contextMessage = "";
    if (noteContent) {
      contextMessage = `System prompt: You are a helpful AI Teacher that helps users with their notes. Here is the content of the note you're discussing:\n\n${noteContent}\n\nPlease use this information to provide relevant and helpful responses. keep the response short and concise.`;
    }
    
    // Add context as the first message if we have note content
    if (contextMessage) {
      // Insert at the beginning of the conversation
      formattedChatHistory.unshift({
        role: "model",
    parts: [{ text: "Understood!" }]
      })

      formattedChatHistory.unshift({
        role: "user",
        parts: [{ text: contextMessage }]
      });
    }
    
    const chat = model.startChat({
      history: formattedChatHistory,
      generationConfig,
    });

    const result = await chat.sendMessage(message);
    const response = await result.response;
    const aiResponse = response.text();

    // Save AI message to the database
    const aiMessageId = uuidv4();
    const aiMessage = {
      id: aiMessageId,
      created_at: new Date().toISOString(),
      by: "ai",
      content: aiResponse,
      "note-id": noteId || null,
      timestamp: new Date().toISOString(),
    };

    const { error: aiMessageError } = await supabase
      .from("ai-chat-message")
      .insert(aiMessage);

    if (aiMessageError) {
      console.error("Error saving AI message:", aiMessageError);
      return NextResponse.json(
        { error: "Failed to save AI response" },
        { status: 500 }
      );
    }

    // Return success response
    return NextResponse.json({
      id: aiMessageId,
      text: aiResponse,
      sender: "ai",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Get topic ID from the URL
    const url = new URL(req.url);
    const noteId = url.searchParams.get("noteId");
    const limit = parseInt(url.searchParams.get("limit") || "20");

    if (!noteId) {
      return NextResponse.json(
        { error: "noteId is required" },
        { status: 400 }
      );
    }

    // Build query
    let query = supabase
      .from("ai-chat-message")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    // Add filters
    if (noteId) {
      query = query.eq("note-id", noteId);
    }

    // Execute query
    const { data, error } = await query;

    if (error) {
      console.error("Error fetching chat messages:", error);
      return NextResponse.json(
        { error: "Failed to fetch chat messages" },
        { status: 500 }
      );
    }

    // Format response
    const messages = data.map((msg) => ({
      id: msg.id,
      text: msg.content,
      sender: msg.by,
      timestamp: msg.created_at,
    }));

    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}