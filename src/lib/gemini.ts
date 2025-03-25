import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

// Import the Schema type from the Gemini API
import type { Schema } from "@google/generative-ai";

type ShortAnswerQuestion = {
  question: string;
  answer: string;
}
type responseFormat = {
  explanation: string;
  score: number;
}

export const evaluateShortAnswer = async ({ ideal_answer, question}: {ideal_answer: string, question: ShortAnswerQuestion}) => {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('Google API key not found in environment variables');
    }
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
    // Define the structured schema for short answer evaluation
    const schema: Schema = {
      type: SchemaType.OBJECT,
      properties: {
        evaluation: {
          type: SchemaType.OBJECT,
          properties: {
            explanation: { type: SchemaType.STRING },
            score: { type: SchemaType.NUMBER },
          },
          required: ["explanation", "score"]
        }
      },
      required: ["evaluation"]
    };
  
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
      }, 
    });
  
    const prompt = `
  You are an expert educational evaluator. Your task is to evaluate a student's short answer response.
  
  ideal Answer :
  ${ideal_answer}
  
  QUESTION: ${question.question}
  
  STUDENT'S ANSWER: ${question.answer}
  
  IMPORTANT GUIDELINES:
  1. Carefully analyze the student's answer in relation to the question and the provided context.
  2. Evaluate the accuracy, completeness, and relevance of the answer.
  3. Score the answer on a scale of 0-5, where:
     - 0: Completely incorrect or irrelevant
     - 1: Mostly incorrect with minimal relevant content
     - 2: Partially correct but missing key information
     - 3: Mostly correct with some minor inaccuracies
     - 4: Correct and comprehensive
     - 5: Excellent, demonstrating deep understanding
  4. Provide a concise explanation (2-3 sentences) justifying your score and highlighting strengths and weaknesses.
  `;
  
    try {
      // Generate structured output
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      // Parse the JSON response
      const parsedResponse = JSON.parse(responseText);
      return parsedResponse.evaluation as responseFormat;
    } catch (error) {
      console.error("Error evaluating short answer:", error);
      throw error;
    }
  
}

export const essayReviewStrengths = async ({ essay, title}: {essay: string, title: string}) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('Google API key not found in environment variables');
  }
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  // Define the structured schema for essay strengths evaluation
  const schema: Schema = {
    type: SchemaType.OBJECT,
    properties: {
      strengths: {
        type: SchemaType.ARRAY,
        items: { type: SchemaType.STRING }
      }
    },
    required: ["strengths"]
  };

  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: schema,
    }, 
  });

  const prompt = `
You are a world-class expert essay evaluator. You have evaluated many essays from top business schools applications.

Given the essay titled "${title}", carefully analyze it and identify its strengths.

OUTPUT REQUIREMENTS:
- Return an array of 3-5 specific bullet points highlighting the essay's strengths
- Each bullet point should be concise (20-30 words) but specific
- Quote specific parts of the essay when relevant to support your analysis
- If you cannot find any strengths, just return "I did not find any strengths"

Here is the essay to evaluate:
"${essay}"
`;

  try {
    // Generate structured output
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Parse the JSON response
    const parsedResponse = JSON.parse(responseText);
    return parsedResponse.strengths as string[];
  } catch (error) {
    console.error("Error evaluating essay strengths:", error);
    throw error;
  }
}

export const essayReviewWeaknesses = async ({ essay, title}: {essay: string, title: string}) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('Google API key not found in environment variables');
  }
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  // Define the structured schema for essay weaknesses evaluation
  const schema: Schema = {
    type: SchemaType.OBJECT,
    properties: {
      weaknesses: {
        type: SchemaType.ARRAY,
        items: { type: SchemaType.STRING }
      }
    },
    required: ["weaknesses"]
  };

  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: schema,
    }, 
  });

  const prompt = `
You are a world-class expert essay evaluator. You have evaluated many essays from top business schools applications.

Given the essay titled "${title}", carefully analyze it and identify areas for improvement.

OUTPUT REQUIREMENTS:
- Return an array of 3-5 specific bullet points highlighting the essay's weaknesses or areas for improvement
- Each bullet point should be concise (20-30 words) but specific
- Quote specific parts of the essay when relevant to support your analysis
- Focus on constructive criticism that would help the writer improve the essay

Here is the essay to evaluate:
"${essay}"
`;

  try {
    // Generate structured output
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Parse the JSON response
    const parsedResponse = JSON.parse(responseText);
    return parsedResponse.weaknesses as string[];
  } catch (error) {
    console.error("Error evaluating essay weaknesses:", error);
    throw error;
  }
}

export const essayOverallFeedback = async ({ essay, title}: {essay: string, title: string}) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('Google API key not found in environment variables');
  }
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  // Define the structured schema for essay overall feedback
  const schema: Schema = {
    type: SchemaType.OBJECT,
    properties: {
      overallFeedback: { type: SchemaType.STRING }
    },
    required: ["overallFeedback"]
  };

  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: schema,
    }, 
  });

  const prompt = `
You are a world-class expert essay evaluator. You have evaluated many essays from top business schools applications.

Given the essay titled "${title}", provide an overall assessment of its quality and effectiveness.

OUTPUT REQUIREMENTS:
- Provide a comprehensive paragraph (150-200 words) assessing the essay's overall quality
- Include balanced feedback covering both strengths and weaknesses
- Suggest specific steps for improving the essay
- Consider factors like structure, argumentation, evidence, originality, and clarity

Here is the essay to evaluate:
"${essay}"
`;

  try {
    // Generate structured output
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Parse the JSON response
    const parsedResponse = JSON.parse(responseText);
    return parsedResponse.overallFeedback as string;
  } catch (error) {
    console.error("Error generating overall essay feedback:", error);
    throw error;
  }
}
