import { ProcessedDocument } from "./documentProcessor";

export interface ExtractedContractTerms {
  // Common fields found in contracts
  effectiveDate?: string;
  expirationDate?: string;
  amount?: string;
  parties?: string[];
  paymentTerms?: string;
  terminationClause?: string;
  automaticRenewal?: string;
  governingLaw?: string;
  disputeResolution?: string;
  confidentiality?: string;
  // Meta information
  source: string;
  extractedAt: string;
  confidence: {
    [key: string]: number;
  };
}

export class ContractExtractor {
  private static instance: ContractExtractor;

  private constructor() {}

  public static getInstance(): ContractExtractor {
    if (!ContractExtractor.instance) {
      ContractExtractor.instance = new ContractExtractor();
    }
    return ContractExtractor.instance;
  }

  /**
   * Extracts structured contract terms from processed document text
   */
  public extractContractTerms(
    document: ProcessedDocument
  ): ExtractedContractTerms {
    const { text, metadata } = document;

    // Start with an empty result
    const result: ExtractedContractTerms = {
      source: metadata.title,
      extractedAt: new Date().toISOString(),
      confidence: {},
    };

    // Extract each field using regex patterns
    result.effectiveDate = this.extractEffectiveDate(text);
    result.expirationDate = this.extractExpirationDate(text);
    result.amount = this.extractAmount(text);
    result.parties = this.extractParties(text);
    result.paymentTerms = this.extractPaymentTerms(text);
    result.terminationClause = this.extractTerminationClause(text);
    result.automaticRenewal = this.extractAutomaticRenewal(text);
    result.governingLaw = this.extractGoverningLaw(text);
    result.disputeResolution = this.extractDisputeResolution(text);
    result.confidentiality = this.extractConfidentiality(text);

    // Set confidence values (simplified version - in real implementation would use ML confidence scores)
    Object.keys(result).forEach((key) => {
      if (
        key !== "source" &&
        key !== "extractedAt" &&
        key !== "confidence" &&
        result[key as keyof ExtractedContractTerms]
      ) {
        result.confidence[key] = 0.85; // Placeholder confidence score
      }
    });

    // Log the extracted terms
    console.log("Extracted Contract Terms:", {
      documentTitle: metadata.title,
      extractedTerms: result,
    });

    return result;
  }

  /**
   * Converts extracted contract terms to CSV format
   */
  public convertToCSV(
    terms: ExtractedContractTerms | ExtractedContractTerms[]
  ): string {
    const termsArray = Array.isArray(terms) ? terms : [terms];

    if (termsArray.length === 0) return "";

    // Define CSV headers based on the first item
    const headers = [
      "source",
      "extractedAt",
      "effectiveDate",
      "expirationDate",
      "amount",
      "parties",
      "paymentTerms",
      "terminationClause",
      "automaticRenewal",
      "governingLaw",
      "disputeResolution",
      "confidentiality",
    ];

    // Create the CSV content
    const csvContent = [
      headers.join(","),
      ...termsArray.map((term) => {
        return headers
          .map((header) => {
            // Handle special cases like arrays
            if (header === "parties" && term.parties) {
              return `"${term.parties.join("; ")}"`;
            }

            const value = term[header as keyof ExtractedContractTerms];
            // Format values properly for CSV
            if (value === undefined || value === null) return "";
            if (typeof value === "string")
              return `"${value.replace(/"/g, '""')}"`;
            if (typeof value === "object")
              return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
            return value;
          })
          .join(",");
      }),
    ].join("\n");

    return csvContent;
  }

  // Date extraction - handles various date formats
  private extractEffectiveDate(text: string): string | undefined {
    const patterns = [
      /(?:effective\s+date|commencement\s+date|start\s+date|dated)(?:\s+is)?(?:\s+of)?(?:\s+on)?(?:\s+as)?(?:\s+from)?:?\s*([A-Za-z]+\s+\d{1,2},?\s+\d{4}|\d{1,2}\/\d{1,2}\/\d{4}|\d{1,2}-\d{1,2}-\d{4}|\d{4}-\d{1,2}-\d{1,2})/i,
      /(?:this\s+agreement\s+is\s+made)(?:\s+and\s+entered\s+into)?(?:\s+as\s+of|\s+on|\s+dated)?:?\s*([A-Za-z]+\s+\d{1,2},?\s+\d{4}|\d{1,2}\/\d{1,2}\/\d{4}|\d{1,2}-\d{1,2}-\d{4}|\d{4}-\d{1,2}-\d{1,2})/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return undefined;
  }

  private extractExpirationDate(text: string): string | undefined {
    const patterns = [
      /(?:expiration\s+date|termination\s+date|end\s+date|expiry\s+date)(?:\s+is)?(?:\s+of)?:?\s*([A-Za-z]+\s+\d{1,2},?\s+\d{4}|\d{1,2}\/\d{1,2}\/\d{4}|\d{1,2}-\d{1,2}-\d{4}|\d{4}-\d{1,2}-\d{1,2})/i,
      /(?:shall\s+(?:terminate|expire|end))(?:\s+on)?:?\s*([A-Za-z]+\s+\d{1,2},?\s+\d{4}|\d{1,2}\/\d{1,2}\/\d{4}|\d{1,2}-\d{1,2}-\d{4}|\d{4}-\d{1,2}-\d{1,2})/i,
      /(?:term\s+of\s+(?:this|the)\s+agreement\s+(?:shall\s+be|is)\s+(?:for)?\s+)(\d+)\s+(?:year|month|day)s?/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return undefined;
  }

  private extractAmount(text: string): string | undefined {
    const patterns = [
      /(?:total\s+(?:amount|sum|price|value|consideration))(?:\s+of)?(?:\s+is)?:?\s*(\$[\d,]+(?:\.\d{2})?|\d[\d,]*(?:\.\d{2})?\s*(?:USD|dollars|EUR|euros|GBP|pounds))/i,
      /(?:fee|payment|price)(?:\s+is)?:?\s*(\$[\d,]+(?:\.\d{2})?|\d[\d,]*(?:\.\d{2})?\s*(?:USD|dollars|EUR|euros|GBP|pounds))/i,
      /(?:agree\s+to\s+pay)(?:\s+a\s+(?:total|sum|fee|price)\s+of)?:?\s*(\$[\d,]+(?:\.\d{2})?|\d[\d,]*(?:\.\d{2})?\s*(?:USD|dollars|EUR|euros|GBP|pounds))/i,
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return undefined;
  }

  private extractParties(text: string): string[] | undefined {
    const parties: string[] = [];

    // Look for common patterns that identify parties in a contract
    const companyPatterns = [
      /(?:this\s+agreement\s+is\s+(?:made|entered\s+into)\s+(?:by\s+and\s+)?between\s+)(.+?)(?:\s+and\s+)(.+?)(?:\,|\.|;)/i,
      /(?:party|parties)(?:\s+of\s+the\s+(?:first|second)\s+part)?:?\s*([^,;\.]+)/gi,
      /(?:agreement\s+between\s+)(.+?)(?:\s+and\s+)(.+?)(?:\,|\.|;)/i,
    ];

    for (const pattern of companyPatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        if (match[1]) parties.push(match[1].trim());
        if (match[2]) parties.push(match[2].trim());
      }
    }

    return parties.length > 0 ? [...new Set(parties)] : undefined;
  }

  private extractPaymentTerms(text: string): string | undefined {
    // Look for paragraphs containing payment terms
    const paymentSectionPattern =
      /(?:payment\s+terms|payment\s+schedule|payment\s+method|fees\s+and\s+payment)[^\n.]*[.\n]([^]*?)(?:\n\s*\n|\n\s*[A-Z]|$)/i;
    const match = text.match(paymentSectionPattern);

    if (match && match[1]) {
      // Return a trimmed version of the payment terms section, limited to a reasonable length
      return match[1].trim().substring(0, 250);
    }

    return undefined;
  }

  private extractTerminationClause(text: string): string | undefined {
    // Look for paragraphs related to termination
    const terminationPattern =
      /(?:termination|term\s+and\s+termination)[^\n.]*[.\n]([^]*?)(?:\n\s*\n|\n\s*[A-Z]|$)/i;
    const match = text.match(terminationPattern);

    if (match && match[1]) {
      return match[1].trim().substring(0, 250);
    }

    return undefined;
  }

  private extractAutomaticRenewal(text: string): string | undefined {
    // Look for automatic renewal clauses
    const renewalPattern =
      /((?:this|the)\s+agreement\s+(?:shall|will)\s+(?:automatically\s+renew|be\s+automatically\s+renewed)[^.]*\.)/i;
    const match = text.match(renewalPattern);

    if (match && match[1]) {
      return match[1].trim();
    }

    return undefined;
  }

  private extractGoverningLaw(text: string): string | undefined {
    // Look for governing law clauses
    const governingLawPattern =
      /(?:governing\s+law|applicable\s+law|law\s+and\s+jurisdiction)[^\n.]*[.\n]([^]*?)(?:\n\s*\n|\n\s*[A-Z]|$)/i;
    const match = text.match(governingLawPattern);

    if (match && match[1]) {
      return match[1].trim().substring(0, 250);
    }

    return undefined;
  }

  private extractDisputeResolution(text: string): string | undefined {
    // Look for dispute resolution clauses
    const disputePattern =
      /(?:dispute\s+resolution|arbitration|mediation|dispute\s+settlement)[^\n.]*[.\n]([^]*?)(?:\n\s*\n|\n\s*[A-Z]|$)/i;
    const match = text.match(disputePattern);

    if (match && match[1]) {
      return match[1].trim().substring(0, 250);
    }

    return undefined;
  }

  private extractConfidentiality(text: string): string | undefined {
    // Look for confidentiality clauses
    const confidentialityPattern =
      /(?:confidentiality|confidential\s+information|non-disclosure)[^\n.]*[.\n]([^]*?)(?:\n\s*\n|\n\s*[A-Z]|$)/i;
    const match = text.match(confidentialityPattern);

    if (match && match[1]) {
      return match[1].trim().substring(0, 250);
    }

    return undefined;
  }
}
