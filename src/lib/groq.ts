// src/lib/groq.ts
import { Groq } from "groq-sdk";

if (!import.meta.env.VITE_GROQ_API_KEY) {
  console.warn("VITE_GROQ_API_KEY environment variable is not set");
}

export interface GroqMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

const groq = new Groq({
  dangerouslyAllowBrowser: true,
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
});

export async function sendMessageToGroq(
  message: string,
  conversationHistory: GroqMessage[] = [],
  p0: { temperature: number; maxTokens: number }
) {
  try {
    // Sanitize the input message by removing null bytes and invalid Unicode escapes
    const sanitizedMessage = message
      .replace(/\u0000/g, "")
      .replace(/\\u[0-9a-fA-F]{4}/g, "");

    // Sanitize conversation history
    const sanitizedHistory = conversationHistory.map((msg) => ({
      ...msg,
      content: msg.content
        .replace(/\u0000/g, "")
        .replace(/\\u[0-9a-fA-F]{4}/g, ""),
    }));

    const messages = [
      {
        role: "system" as const,
        content: `You are an expert legal AI assistant powered by Groq's advanced language model. 
                 Provide accurate, clear, and concise legal information and analysis. 
                 Focus on helping users understand complex legal concepts and documents.
                 Always maintain professional tone and cite relevant legal precedents when applicable.`,
      },
      ...sanitizedHistory,
      {
        role: "user" as const,
        content: sanitizedMessage,
      },
    ];

    const params = {
      messages,
      model: "llama3-8b-8192",
      temperature: p0.temperature,
      max_tokens: p0.maxTokens,
    };

    const chatCompletion = await groq.chat.completions.create(params);

    return chatCompletion.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("Error calling Groq API:", error);
    if (error instanceof Error) {
      throw new Error(`Groq API Error: ${error.message}`);
    }
    throw new Error("An unknown error occurred while calling Groq API");
  }
}
