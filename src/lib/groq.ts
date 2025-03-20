// src/lib/groq.ts
import { Groq } from 'groq-sdk';
import type { ChatCompletionCreateParams } from 'groq-sdk/resources/chat/chat';

if (!import.meta.env.VITE_GROQ_API_KEY) {
  console.warn('VITE_GROQ_API_KEY environment variable is not set');
}

export interface GroqMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const groq = new Groq({
  dangerouslyAllowBrowser: true,
  apiKey: import.meta.env.VITE_GROQ_API_KEY
});

export async function sendMessageToGroq(
  message: string,
  conversationHistory: GroqMessage[] = []
) {
  try {
    const messages: Groq.Chat.CompletionCreateParams['messages'] = [
      {
        role: "system",
        content: `You are an expert legal AI assistant powered by Groq's advanced language model. 
                 Provide accurate, clear, and concise legal information and analysis. 
                 Focus on helping users understand complex legal concepts and documents.
                 Always maintain professional tone and cite relevant legal precedents when applicable.`
      },
      ...conversationHistory,
      {
        role: "user",
        content: message
      }
    ];

    const params: Groq.Chat.CompletionCreateParams = {
      messages,
      model: "llama3-8b-8192",
      temperature: 0.7,
      max_tokens: 2048
    };
    
    const chatCompletion = await groq.chat.completions.create(params);
    
    return chatCompletion.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error calling Groq API:', error);
    if (error instanceof Error) {
      throw new Error(`Groq API Error: ${error.message}`);
    }
    throw new Error('An unknown error occurred while calling Groq API');
  }
}

interface ChatCompletionParams {
  model: string;
  messages: GroqMessage[];
  temperature?: number;
  max_tokens?: number;
}

export async function analyzeContractWithAI(contractText: string): Promise<string> {
  const messages: GroqMessage[] = [
    {
      role: 'system',
      content: 'You are a legal contract analysis assistant. Analyze the provided contract and highlight key points, risks, and recommendations.',
    },
    {
      role: 'user',
      content: contractText,
    },
  ];

  const params: ChatCompletionParams = {
    model: 'mixtral-8x7b-32768',
    messages,
    temperature: 0.7,
    max_tokens: 4096,
  };

  try {
    const completion = await groq.chat.completions.create(params);
    return completion.choices[0]?.message?.content || 'No analysis available.';
  } catch (error) {
    console.error('Error analyzing contract:', error);
    throw new Error('Failed to analyze contract');
  }
}

export async function generateLegalResearch(query: string): Promise<string> {
  const messages: GroqMessage[] = [
    {
      role: 'system',
      content: 'You are a legal research assistant. Provide comprehensive legal research based on the query.',
    },
    {
      role: 'user',
      content: query,
    },
  ];

  const params: ChatCompletionParams = {
    model: 'mixtral-8x7b-32768',
    messages,
    temperature: 0.7,
    max_tokens: 4096,
  };

  try {
    const completion = await groq.chat.completions.create(params);
    return completion.choices[0]?.message?.content || 'No research available.';
  } catch (error) {
    console.error('Error generating legal research:', error);
    throw new Error('Failed to generate legal research');
  }
}