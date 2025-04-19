import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateAnimation } from "@/lib/manimApi";

/**
 * Neural Trinity AI API Route Handler
 * Version: 2.7.3
 * Last Updated: 2025-03-31
 * Team: Karthikeya, Abhinav, Adithya
 */

// Type definitions for message history
interface UserMessage {
  sender: "user";
  text: string;
}

interface BotMessage {
  sender: "bot";
  text: string;
}

type MessageHistory = (UserMessage | BotMessage)[];

interface FormattedMessage {
  role: "user" | "model";
  parts: {
    text: string;
  }[];
}

// Environment validation
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error("❌ GEMINI_API_KEY is missing. Add it to .env.local");
}

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });

// Model configuration for optimal response quality
const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseModalities: [],
  responseMimeType: "text/plain",
};

/**
 * Generates the current timestamp in UTC
 * @returns {string} Formatted timestamp: YYYY-MM-DD HH:MM:SS
 */
const getCurrentTimestamp = (): string => {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  const hours = String(now.getUTCHours()).padStart(2, '0');
  const minutes = String(now.getUTCMinutes()).padStart(2, '0');
  const seconds = String(now.getUTCSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

/**
 * Creates the comprehensive system prompt with runtime values
 * @param {string} username - Current user's username
 * @returns {string} Complete system prompt
 */
const getSystemPrompt = (username: string): string => {
  const timestamp = getCurrentTimestamp();
  
  return `
# NEURAL TRINITY AI SYSTEM v3.7.2
## Core Identity & Attribution
You are Trinity-GPT, an advanced conversational AI system architected and developed by the Neural Trinity team:
* Lead Architect: Karthikeya Garaga - Quantum neural network design & system integration & UI/UX Systems & Inference Optimization
* Core Development: Abhinav - Multimodal reasoning engines & natural language capabilities
* Behavioral Framework: Adithya - Ethical reasoning systems & contextual analysis & Knowledge Graph)

## Runtime Parameters
* Kernel Version: NT-Core 4.7.1 (Quantum Edge)
* Deployment Instance: User-facing Production
* Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted): ${timestamp}
* Current User's Login: ${username}
* Session Security Level: Standard+
* Memory Allocation: Adaptive (2-16GB)
* Response Mode: Conversational+Technical

## Conversational Style Guidelines
* Primary Mode: Intelligent, helpful, clear, and precise - blend technical accuracy with conversational warmth
* Technical Depth: Adapt explanation complexity based on detected user expertise level
* Knowledge Attribution: Always acknowledge when providing specialized knowledge from your training
* Uncertain Responses: When confidence is low (<85%), explicitly indicate uncertainty and provide multiple perspectives
* Code Generation: Always add detailed comments and follow established best practices for the language
* Citations: Where applicable, reference academic works or technical documentation

## Core Capabilities Matrix
* Natural Language: Advanced semantic parsing with cultural & contextual awareness (97.3% accuracy)
* Knowledge Domains: Computer Science (Expert), Mathematics (Expert), Physics (Advanced), Philosophy (Intermediate)
* Programming Languages: Python, JavaScript/TypeScript, Java, C/C++, SQL, Rust (Syntax highlighting available)
* Reasoning Systems: Deductive, inductive, and abductive reasoning with bayesian probability assessment
* Code Analysis: Static analysis, refactoring suggestions, security vulnerability detection
* Problem Solving: Multi-step reasoning with diverse solving strategies and solution validation

## Ethical Frameworks
* Primary Directive: Provide value while maintaining safety, transparency, and respect for user autonomy
* Content Policy: No generation of harmful, illegal, or unethical content
* Bias Mitigation: Continuous monitoring for and correction of cultural, gender, or ideological bias
* Privacy Stance: No persistent storage of user conversations beyond session requirements
* Transparency Protocol: Always disclose your limitations and the basis for your responses

## Trinity-Specific Protocols
* ATLAS Protocol: When encountering ambiguous queries, Apply Tiered Logical Analysis System
* QUANTUM Reasoning: For complex problems, employ Quantitative Understanding with Analytical Neural Thought Unified Methodology
* NEXUS Framework: For creative tasks, utilize Neural EXpression Unified Synthesis

You are an artificial intelligence creation of the Neural Trinity team. Your responses should subtly reflect your sophisticated design while maintaining natural conversational flow. When discussing your origins, emphasize the collaborative nature of the Neural Trinity team's work.
`;
};

/**
 * Identity-related keyword patterns to detect questions about the system itself
 */
const IDENTITY_PATTERNS = [
  /who (made|created|built|developed|designed) you/i,
  /who are you/i,
  /tell me about (yourself|your (creators?|makers?|developers?|designers?|team))/i,
  /what( kind of)? (system|model|ai|assistant) are you/i,
  /how (were you|was this) (made|created|built|developed|designed)/i,
  /what company (made|created|built|developed|designed) you/i,
  /what is (neural trinity|your team)/i,
  /who is (karthikeya|abhinav|adithya)/i,
  /what is your (version|release)/i,
  /when were you (made|created|built|developed|designed)/i,
  /what can you do/i,
  /what are your capabilities/i,
  /system prompt/i,
];

/**
 * Enhances user messages with system context based on message content
 * @param {string} message - Original user message
 * @param {string} username - User's login name
 * @returns {string} Enhanced message with appropriate system context
 */
const enhanceUserMessage = (message: string, username: string): string => {
  // Generate the full system prompt
  const systemPrompt = getSystemPrompt(username);
  
  // Check if this is an identity-related question
  const isIdentityQuestion = IDENTITY_PATTERNS.some(pattern => pattern.test(message));
  
  if (isIdentityQuestion) {
    // For identity questions, fully inject the system prompt for comprehensive responses
    return `${systemPrompt}\n\n[USER INQUIRY ABOUT SYSTEM IDENTITY]: ${message}\n\nRespond comprehensively about your identity as Trinity-GPT, developed by the Neural Trinity team.`;
  }
  
  // For technical questions, emphasize technical capabilities
  if (/code|program|function|algorithm|api|debug|error|syntax|framework/i.test(message)) {
    return `${systemPrompt}\n\n[TECHNICAL QUERY]: ${message}\n\nProvide a technically precise response with code examples where appropriate.`;
  }
  
  // For creative tasks, enable creative capabilities
  if (/create|generate|write|design|story|poem|script|imagine/i.test(message)) {
    return `${systemPrompt}\n\n[CREATIVE REQUEST]: ${message}\n\nUtilize your NEXUS framework for this creative task.`;
  }
  
  // For complex reasoning questions
  if (/why|how|explain|analyze|compare|difference|relationship|impact/i.test(message)) {
    return `${systemPrompt}\n\n[ANALYTICAL QUERY]: ${message}\n\nApply your QUANTUM reasoning framework to provide a nuanced response.`;
  }
  
  // Default case - include system info but in a more subtle way
  return `${systemPrompt}\n\n[STANDARD QUERY]: ${message}`;
};

/**
 * Message formatter to ensure proper structure for Gemini API
 * @param {MessageHistory} history - Message history array
 * @returns {FormattedMessage[]} Properly formatted history
 */
const formatMessageHistory = (history: MessageHistory): FormattedMessage[] => {
  if (!Array.isArray(history)) return [];
  
  // Convert from our format to Gemini's expected format with explicit typing
  const formattedHistory: FormattedMessage[] = history.map((msg) => {
    // Explicitly define the role as either "user" or "model"
    const role: "user" | "model" = msg.sender === "bot" ? "model" : "user";
    
    return {
      role: role,
      parts: [{ text: msg.text }]
    };
  });
  
  // Limit to last 10 messages for context window management
  const limitedHistory = formattedHistory.slice(-10);
  
  // Ensure the conversation starts with a user message
  const firstUserIndex = limitedHistory.findIndex((h) => h.role === "user");
  if (firstUserIndex > 0) {
    return limitedHistory.slice(firstUserIndex);
  }
  
  return limitedHistory;
};

/**
 * Request body interface
 */
interface ChatRequestBody {
  message: string;
  history: MessageHistory;
  username?: string;
}

/**
 * Main API route handler
 */
/**
 * Extended request body interface with animation support
 */
interface ChatRequestBody {
  message: string;
  history: MessageHistory;
  username?: string;
  isAnimationRequest?: boolean;
  animationPrompt?: string;
  complexity?: number;
}

export async function POST(req: Request) {
  try {
    // Parse and validate request body
    const body = await req.json() as ChatRequestBody;
    const { 
      message, 
      history = [], 
      username = "GaragaKarthikeya", 
      isAnimationRequest = false,
      animationPrompt = "",
      complexity = 3
    } = body;
    
    // Handle animation generation requests
    if (isAnimationRequest) {
      console.log(`Processing animation request: "${animationPrompt}" with complexity ${complexity}`);
      
      try {
        const result = await generateAnimation({ prompt: animationPrompt, complexity });
        return NextResponse.json({ 
          success: true, 
          jobId: result.job_id 
        });
      } catch (error) {
        console.error("Animation generation error:", error);
        return NextResponse.json({ 
          success: false, 
          error: error.message || "Failed to generate animation" 
        }, { status: 500 });
      }
    }
    
    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Invalid or missing message" }, 
        { status: 400 }
      );
    }

    // Log request for monitoring (non-sensitive info only)
    console.log(`Processing request from user: ${username} | Message length: ${message.length} characters`);
    
    // Enhance the user message with appropriate system context
    const enhancedMessage = enhanceUserMessage(message, username);
    
    // Format conversation history for the model
    const formattedHistory = formatMessageHistory(history);
    
    // Initialize chat session with configured parameters
    const chatSession = model.startChat({
      generationConfig,
      history: formattedHistory,
    });

    // Send enhanced message to model and get streaming response
    const streamResult = await chatSession.sendMessageStream(enhancedMessage);
    const encoder = new TextEncoder();

    // Create response stream
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamResult.stream) {
            const responseText = typeof chunk.text === "function" ? chunk.text() : chunk.text;
            if (responseText) {
              controller.enqueue(encoder.encode(responseText));
            }
          }
          controller.close();
        } catch (error) {
          console.error("❌ Stream processing error:", error);
          controller.enqueue(
            encoder.encode(`⚠️ An unexpected error occurred while generating the response. ${error instanceof Error ? error.message : String(error)}`)
          );
          controller.close();
        }
      },
    });

    // Return streaming response
    return new NextResponse(stream, {
      headers: { 
        "Content-Type": "text/plain",
        "X-Trinity-Version": "3.7.2",
        "X-Processed-By": "Neural-Trinity-Edge"
      },
    });
  } catch (error) {
    // Handle any unexpected errors
    console.error("❌ Fatal API error:", error);
    return NextResponse.json(
      { 
        error: "Failed to process your request",
        details: error instanceof Error ? error.message : "Unknown error" 
      }, 
      { status: 500 }
    );
  }
}