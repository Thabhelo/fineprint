import type { Document } from "../pages/DocumentLibrary";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export interface ExtractedTerm {
  value: string;
  type: "amount" | "date" | "section" | "reference" | "percentage" | "other";
  confidence: number;
  page: number;
  position: {
    x: number;
    y: number;
  };
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

  // Extract terms using the new extractTerms function
  const terms = extractTerms(document.content, document.metadata);

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

function extractTerms(
  content: string,
  metadata: Document["metadata"]
): ExtractedTerm[] {
  const terms: ExtractedTerm[] = [];
  const seenTerms = new Set<string>();

  // Split content into pages if available
  const pages = metadata?.pageCount ? content.split("\f") : [content];

  pages.forEach((pageContent, pageIndex) => {
    // If there are any amounts, extract them
    const amountPattern = /[$€£¥]?\s*\d{1,3}(?:,\d{3})*(?:\.\d{2})?/g;
    const amounts = pageContent.match(amountPattern) || [];

    amounts.forEach((match) => {
      const cleanValue = match.replace(/[$,€£¥\s]/g, "");
      if (!seenTerms.has(cleanValue)) {
        seenTerms.add(cleanValue);
        terms.push({
          value: cleanValue,
          type: "amount",
          confidence: 92.0,
          page: pageIndex + 1,
          position: { x: 0, y: 0 },
          context: extractContext(pageContent, match),
        });
      }
    });

    // If there are any dates, extract them
    const datePatterns = [
      /\d{1,2}\/\d{1,2}\/\d{2,4}/g, // MM/DD/YYYY
      /\d{4}-\d{2}-\d{2}/g, // YYYY-MM-DD
      /\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}/gi, // 1 Jan 2024
    ];

    datePatterns.forEach((pattern) => {
      const dates = pageContent.match(pattern) || [];
      dates.forEach((match) => {
        if (!seenTerms.has(match)) {
          seenTerms.add(match);
          terms.push({
            value: match,
            type: "date",
            confidence: 92.0,
            page: pageIndex + 1,
            position: { x: 0, y: 0 },
            context: extractContext(pageContent, match),
          });
        }
      });
    });

    // If there are any section numbers, extract them
    const sectionPattern = /(?:Section|Article|Clause)\s+[\d\.]+/gi;
    const sections = pageContent.match(sectionPattern) || [];
    sections.forEach((match) => {
      const number = match.match(/\d+/)?.[0];
      if (number && !seenTerms.has(number)) {
        seenTerms.add(number);
        terms.push({
          value: number,
          type: "section",
          confidence: 92.0,
          page: pageIndex + 1,
          position: { x: 0, y: 0 },
          context: extractContext(pageContent, match),
        });
      }
    });

    // If there are any percentages, extract them
    const percentagePattern = /\d+(?:\.\d+)?%/g;
    const percentages = pageContent.match(percentagePattern) || [];
    percentages.forEach((match) => {
      const value = match.replace("%", "");
      if (!seenTerms.has(value)) {
        seenTerms.add(value);
        terms.push({
          value: value,
          type: "percentage",
          confidence: 92.0,
          page: pageIndex + 1,
          position: { x: 0, y: 0 },
          context: extractContext(pageContent, match),
        });
      }
    });

    // If there are any reference numbers, extract them (e.g., "Ref: 12345")
    const referencePattern = /(?:Ref|Reference|No\.?)\s*[:#]?\s*\d+/gi;
    const references = pageContent.match(referencePattern) || [];
    references.forEach((match) => {
      const number = match.match(/\d+/)?.[0];
      if (number && !seenTerms.has(number)) {
        seenTerms.add(number);
        terms.push({
          value: number,
          type: "reference",
          confidence: 92.0,
          page: pageIndex + 1,
          position: { x: 0, y: 0 },
          context: extractContext(pageContent, match),
        });
      }
    });

    // Extract any remaining numbers as 'other'
    const numberPattern = /\b\d+\b/g;
    const numbers = pageContent.match(numberPattern) || [];
    numbers.forEach((match) => {
      if (!seenTerms.has(match)) {
        seenTerms.add(match);
        terms.push({
          value: match,
          type: "other",
          confidence: 92.0,
          page: pageIndex + 1,
          position: { x: 0, y: 0 },
          context: extractContext(pageContent, match),
        });
      }
    });
  });

  return terms;
}

function extractContext(pageContent: string, term: string): string {
  const index = pageContent.indexOf(term);
  if (index === -1) return "";

  // Get 50 characters before and after the term
  const start = Math.max(0, index - 50);
  const end = Math.min(pageContent.length, index + term.length + 50);

  let context = pageContent.substring(start, end);

  // Clean up the context
  context = context.replace(/\s+/g, " ").trim();

  // ellipsis if we truncated the text
  if (start > 0) context = "..." + context;
  if (end < pageContent.length) context = context + "...";

  return context;
}
