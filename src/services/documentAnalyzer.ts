import type { Document } from "../pages/DocumentLibrary";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export interface ExtractedTerm {
  type: "date" | "amount" | "term" | "clause";
  value: string;
  confidence: number;
  startIndex: number;
  endIndex: number;
  context?: string;
  riskFactors?: string[];
}

export interface DocumentAnalysis {
  terms: ExtractedTerm[];
  riskScore: number;
  riskLevel: "low" | "medium" | "high";
  summary: string;
  clauses: {
    type: string;
    content: string;
    riskLevel: "low" | "medium" | "high";
    riskFactors: string[];
  }[];
}

// Regular expressions for term extraction
const patterns = {
  date: /(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})|(\d{4}[-/]\d{1,2}[-/]\d{1,2})/g,
  amount: /(\$|€|£)?\s*\d{1,3}(?:,\d{3})*(?:\.\d{2})?/g,
};

// Common legal terms and clauses
const legalTerms = [
  "confidentiality",
  "indemnification",
  "termination",
  "jurisdiction",
  "governing law",
  "force majeure",
  "assignment",
  "warranty",
  "limitation of liability",
  "intellectual property",
] as const;

// Risk factors for different clause types
const riskFactors: Record<string, string[]> = {
  confidentiality: ["duration", "scope", "exceptions"],
  indemnification: ["scope", "limitations", "survival"],
  termination: ["notice period", "causes", "consequences"],
  jurisdiction: ["venue", "choice of law", "dispute resolution"],
  "force majeure": ["definition", "notice requirements", "consequences"],
  warranty: ["scope", "disclaimers", "remedies"],
  "limitation of liability": ["caps", "exclusions", "survival"],
  "intellectual property": ["ownership", "licenses", "restrictions"],
};

export async function analyzeDocument(
  document: Document
): Promise<DocumentAnalysis> {
  if (!document.content) {
    throw new Error("Document content is required for analysis");
  }

  const terms: ExtractedTerm[] = [];
  const content = document.content.toLowerCase();

  // Extract dates
  const dateMatches = content.match(patterns.date) || [];
  dateMatches.forEach((match: string) => {
    terms.push({
      type: "date",
      value: match,
      confidence: 0.95,
      startIndex: content.indexOf(match),
      endIndex: content.indexOf(match) + match.length,
    });
  });

  // Extract amounts
  const amountMatches = content.match(patterns.amount) || [];
  amountMatches.forEach((match: string) => {
    terms.push({
      type: "amount",
      value: match,
      confidence: 0.92,
      startIndex: content.indexOf(match),
      endIndex: content.indexOf(match) + match.length,
    });
  });

  // Extract legal terms
  legalTerms.forEach((term) => {
    const index = content.indexOf(term);
    if (index !== -1) {
      terms.push({
        type: "term",
        value: term,
        confidence: 0.88,
        startIndex: index,
        endIndex: index + term.length,
        riskFactors: riskFactors[term],
      });
    }
  });

  // Use LLM to analyze clauses and context
  const clauses = await analyzeClausesWithLLM(document.content);

  // Calculate risk score based on terms, clauses, and document metadata
  const riskScore = calculateRiskScore(terms, clauses, document);

  return {
    terms,
    riskScore,
    riskLevel: getRiskLevel(riskScore),
    summary: generateSummary(terms, clauses, riskScore),
    clauses,
  };
}

async function analyzeClausesWithLLM(documentContent: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a legal document analyzer. Analyze the following document and identify key clauses, their risk levels, and risk factors. 
          Return the analysis in JSON format with the following structure:
          {
            "clauses": [
              {
                "type": "string",
                "content": "string",
                "riskLevel": "low" | "medium" | "high",
                "riskFactors": string[]
              }
            ]
          }`,
        },
        {
          role: "user",
          content: documentContent,
        },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    });

    const llmContent = response.choices[0].message.content;
    if (!llmContent) {
      console.warn("No content received from LLM");
      return [];
    }

    const analysis = JSON.parse(llmContent);
    return analysis.clauses;
  } catch (error: any) {
    console.error("Error analyzing clauses with LLM:", error);

    if (error.status === 429) {
      console.warn("Rate limit reached, falling back to basic analysis");
      return performBasicAnalysis(documentContent);
    }

    return [];
  }
}

function performBasicAnalysis(content: string) {
  const clauses: DocumentAnalysis["clauses"] = [];

  const clausePatterns = [
    { type: "confidentiality", pattern: /confidentiality|non-disclosure/i },
    { type: "indemnification", pattern: /indemnification|indemnify/i },
    { type: "termination", pattern: /termination|terminate/i },
    { type: "jurisdiction", pattern: /jurisdiction|governing law/i },
    { type: "force majeure", pattern: /force majeure/i },
    { type: "warranty", pattern: /warranty|warrant/i },
    {
      type: "limitation of liability",
      pattern: /limitation of liability|liability cap/i,
    },
    {
      type: "intellectual property",
      pattern: /intellectual property|ip rights/i,
    },
  ];

  clausePatterns.forEach(({ type, pattern }) => {
    const matches = content.match(pattern);
    if (matches) {
      const matchIndex = content.indexOf(matches[0]);
      const start = Math.max(0, matchIndex - 100);
      const end = Math.min(
        content.length,
        matchIndex + matches[0].length + 100
      );
      const context = content.substring(start, end);

      clauses.push({
        type,
        content: context,
        riskLevel: "medium",
        riskFactors: riskFactors[type] || [],
      });
    }
  });

  return clauses;
}

function calculateRiskScore(
  terms: ExtractedTerm[],
  clauses: DocumentAnalysis["clauses"],
  document: Document
): number {
  let score = 0;

  // Base score from term presence
  score += terms.length * 0.1;

  // Adjust based on document metadata
  if (document.metadata?.pageCount) {
    score += Math.min(document.metadata.pageCount * 0.05, 1);
  }

  // Adjust based on clause risk levels
  clauses.forEach((clause) => {
    switch (clause.riskLevel) {
      case "high":
        score += 0.3;
        break;
      case "medium":
        score += 0.2;
        break;
      case "low":
        score += 0.1;
        break;
    }
  });

  // Normalize to 0-100 range
  return Math.min(Math.max(score * 20, 0), 100);
}

function getRiskLevel(score: number): "low" | "medium" | "high" {
  if (score < 33) return "low";
  if (score < 66) return "medium";
  return "high";
}

function generateSummary(
  terms: ExtractedTerm[],
  clauses: DocumentAnalysis["clauses"],
  riskScore: number
): string {
  const termCounts = terms.reduce((acc, term) => {
    acc[term.type] = (acc[term.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const clauseCounts = clauses.reduce(
    (acc, clause) => {
      acc[clause.riskLevel] = (acc[clause.riskLevel] || 0) + 1;
      return acc;
    },
    { low: 0, medium: 0, high: 0 } as Record<string, number>
  );

  return `Document contains ${terms.length} key terms including ${
    termCounts["date"] || 0
  } dates, ${termCounts["amount"] || 0} amounts, and ${
    termCounts["term"] || 0
  } legal terms. Found ${clauses.length} clauses with ${
    clauseCounts.high
  } high-risk, ${clauseCounts.medium} medium-risk, and ${
    clauseCounts.low
  } low-risk clauses. Overall risk level: ${getRiskLevel(riskScore)}.`;
}
