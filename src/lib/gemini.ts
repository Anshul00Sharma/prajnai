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


export const editParagraph = async ({ context, body, title, userPrompt}: {context: string, body: string, title: string, userPrompt: string}) => {

  if (!process.env.GEMINI_API_KEY) {
    throw new Error('Google API key not found in environment variables');
  }
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  // Define the structured schema for essay overall feedback
  const schema: Schema = {
    type: SchemaType.OBJECT,
    properties: {
      paragraph: { type: SchemaType.STRING }
    },
    required: ["paragraph"]
  };

  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: schema,
    }, 
  });

  const prompt = `
  You are an expert writing assistant helping a student edit a paragraph in their note or essay.

  # CONTEXT
  ## Overall Context
  The following is the broader context/essay that contains the paragraph to be edited:
  """
  ${context}
  """

  ## Paragraph to Edit
  The specific paragraph you need to edit has the title/heading: "${title}"
  
  Here is the current content of this paragraph:
  """
  ${body}
  """

  ## User's Edit Request
  The user wants you to edit this paragraph in the following way:
  """
  ${userPrompt}
  """

  # INSTRUCTIONS
  1. Edit ONLY the paragraph provided, following the user's specific request
  2. Maintain coherence and consistency with the overall context/essay
  3. Preserve the original meaning unless the user specifically requests a change
  4. Keep the academic tone consistent with the rest of the essay
  5. Return ONLY the edited paragraph text without explanations, headings, or additional commentary
  6. Do not include phrases like "Here's the edited paragraph" in your response
  7. Structure the response as valid JSON with a single "paragraph" field containing the edited text

  Return a JSON object with the edited paragraph:
  { "paragraph": "your edited paragraph here" }
`;

  try {
    // Generate structured output
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Parse the JSON response
    const parsedResponse = JSON.parse(responseText);
    return parsedResponse.paragraph as string;
  } catch (error) {
    console.error("Error generating edited paragraph:", error);
    throw error;
  }
}

export const editCodeBlock = async ({ context, initialCode, initialLanguage, title, userPrompt}: {context: string, initialCode: string, initialLanguage: string, title: string, userPrompt: string}) => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('Google API key not found in environment variables');
  }
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  // Define the structured schema for essay overall feedback
  const schema: Schema = {
    type: SchemaType.OBJECT,
    properties: {
      code: { type: SchemaType.STRING }
    },
    required: ["code"]
  };

  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: schema,
    }, 
  });

  const prompt = `
  You are an expert coding assistant helping a student edit a code block in their note or documentation.

  # CONTEXT
  ## Overall Context
  The following is the broader context that contains the code block to be edited:
  """
  ${context}
  """

  ## Code Block to Edit
  The specific code block you need to edit has the title/heading: "${title}"
  
  Here is the current content of this code block in ${initialLanguage} language:
  """
  ${initialCode}
  """

  ## User's Edit Request
  The user wants you to edit this code block in the following way:
  """
  ${userPrompt}
  """

  # INSTRUCTIONS
  1. Edit ONLY the code block provided, following the user's specific request
  2. Maintain coherence and consistency with the overall context
  3. Preserve the original functionality unless the user specifically requests a change
  4. Keep the coding style consistent with the rest of the code
  5. Return ONLY the edited code without explanations, headings, or additional commentary
  6. Do not include phrases like "Here's the edited code" in your response
  7. Structure the response as valid JSON with a single "code" field containing the edited code

  Return a JSON object with the edited code:
  { "code": "your edited code here" }
`;

  try {
    // Generate structured output
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Parse the JSON response
    const parsedResponse = JSON.parse(responseText);
    return parsedResponse.code as string;
  } catch (error) {
    console.error("Error generating edited code block:", error);
    throw error;
  }
}


export const editOrderedList = async ({ context, body, title, userPrompt}: {context: string, body: string, title: string, userPrompt: string}): Promise<string[]> => {

  if (!process.env.GEMINI_API_KEY) {
    throw new Error('Google API key not found in environment variables');
  }
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  // Define the structured schema for essay overall feedback
  const schema: Schema = {
    type: SchemaType.OBJECT,
    properties: {
      list: { 
        type: SchemaType.ARRAY,
        items: { type: SchemaType.STRING }
      }
    },
    required: ["list"]
  };

  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: schema,
    }, 
  });

  const prompt = `
  You are an expert writing assistant helping a student edit an ordered list in their note or essay.

  # CONTEXT
  ## Overall Context
  The following is the broader context/essay that contains the ordered list to be edited:
  """
  ${context}
  """

  ## Ordered List to Edit
  The specific ordered list you need to edit has the title/heading: "${title}"
  
  Here is the current content of this ordered list:
  """
  ${body}
  """

  ## User's Edit Request
  The user wants you to edit this ordered list in the following way:
  """
  ${userPrompt}
  """

  # INSTRUCTIONS
  1. Edit ONLY the ordered list provided, following the user's specific request
  2. Maintain coherence and consistency with the overall context/essay
  3. Preserve the original structure of an ordered list but return as array items
  4. Keep the academic tone consistent with the rest of the essay
  5. Return ONLY the edited list items without numbering, explanations, headings, or additional commentary
  6. Each array item should contain only the content of a single list item (without the number)
  7. Do not include phrases like "Here's the edited list" in your response
  8. Structure the response as valid JSON with a single "list" field containing an array of strings

  Return a JSON object with the edited ordered list:
  { "list": ["item 1", "item 2", "item 3"] }
`;

  try {
    // Generate structured output
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Parse the JSON response
    const parsedResponse = JSON.parse(responseText);
    return parsedResponse.list as string[];
  } catch (error) {
    console.error("Error generating edited ordered list:", error);
    throw error;
  }
}

export const editUnorderedList = async ({ context, body, title, userPrompt}: {context: string, body: string, title: string, userPrompt: string}): Promise<string[]> => {

  if (!process.env.GEMINI_API_KEY) {
    throw new Error('Google API key not found in environment variables');
  }
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  // Define the structured schema for essay overall feedback
  const schema: Schema = {
    type: SchemaType.OBJECT,
    properties: {
      list: { 
        type: SchemaType.ARRAY,
        items: { type: SchemaType.STRING }
      }
    },
    required: ["list"]
  };

  const model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: schema,
    }, 
  });

  const prompt = `
  You are an expert writing assistant helping a student edit an unordered list in their note or essay.

  # CONTEXT
  ## Overall Context
  The following is the broader context/essay that contains the unordered list to be edited:
  """
  ${context}
  """

  ## Unordered List to Edit
  The specific unordered list you need to edit has the title/heading: "${title}"
  
  Here is the current content of this unordered list:
  """
  ${body}
  """

  ## User's Edit Request
  The user wants you to edit this unordered list in the following way:
  """
  ${userPrompt}
  """

  # INSTRUCTIONS
  1. Edit ONLY the unordered list provided, following the user's specific request
  2. Maintain coherence and consistency with the overall context/essay
  3. Preserve the original structure of an unordered list but return as array items
  4. Keep the academic tone consistent with the rest of the essay
  5. Return ONLY the edited list items without numbering, explanations, headings, or additional commentary
  6. Each array item should contain only the content of a single list item (without the number)
  7. Do not include phrases like "Here's the edited list" in your response
  8. Structure the response as valid JSON with a single "list" field containing an array of strings

  Return a JSON object with the edited unordered list:
  { "list": ["item 1", "item 2", "item 3"] }
`;

  try {
    // Generate structured output
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Parse the JSON response
    const parsedResponse = JSON.parse(responseText);
    return parsedResponse.list as string[];
  } catch (error) {
    console.error("Error generating edited unordered list:", error);
    throw error;
  }
}