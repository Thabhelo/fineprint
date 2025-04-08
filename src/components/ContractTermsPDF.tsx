import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { ExtractedContractTerms } from "../services/contractExtractor";

// Simplified styles to reduce memory usage
const styles = StyleSheet.create({
  page: {
    padding: 20,
    backgroundColor: "#ffffff",
  },
  section: {
    margin: 5,
    padding: 5,
  },
  title: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 12,
    marginTop: 10,
    marginBottom: 5,
  },
  text: {
    fontSize: 10,
    marginBottom: 3,
  },
  label: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 2,
  },
  confidence: {
    fontSize: 8,
    marginTop: 1,
  },
});

interface ContractTermsPDFProps {
  documentName: string;
  terms: ExtractedContractTerms;
}

export const ContractTermsPDF: React.FC<ContractTermsPDFProps> = ({
  documentName,
  terms,
}) => {
  // Helper function to format confidence score
  const formatConfidence = (score?: number) => {
    return score ? `${Math.round(score * 100)}%` : "N/A";
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.title}>Contract Terms Analysis</Text>
          <Text style={styles.text}>Document: {documentName}</Text>
          <Text style={styles.text}>
            Extracted on: {new Date(terms.extractedAt).toLocaleDateString()}
          </Text>

          <Text style={styles.subtitle}>Key Dates</Text>
          <Text style={styles.label}>Effective Date:</Text>
          <Text style={styles.text}>
            {terms.effectiveDate || "Not specified"}
          </Text>
          <Text style={styles.confidence}>
            Confidence: {formatConfidence(terms.confidence.effectiveDate)}
          </Text>

          <Text style={styles.label}>Expiration Date:</Text>
          <Text style={styles.text}>
            {terms.expirationDate || "Not specified"}
          </Text>
          <Text style={styles.confidence}>
            Confidence: {formatConfidence(terms.confidence.expirationDate)}
          </Text>

          <Text style={styles.subtitle}>Financial Information</Text>
          <Text style={styles.label}>Amount:</Text>
          <Text style={styles.text}>{terms.amount || "Not specified"}</Text>
          <Text style={styles.confidence}>
            Confidence: {formatConfidence(terms.confidence.amount)}
          </Text>

          <Text style={styles.label}>Payment Terms:</Text>
          <Text style={styles.text}>
            {terms.paymentTerms || "Not specified"}
          </Text>
          <Text style={styles.confidence}>
            Confidence: {formatConfidence(terms.confidence.paymentTerms)}
          </Text>

          <Text style={styles.subtitle}>Parties</Text>
          <Text style={styles.label}>Involved Parties:</Text>
          {terms.parties && terms.parties.length > 0 ? (
            terms.parties.map((party, index) => (
              <Text key={index} style={styles.text}>
                • {party}
              </Text>
            ))
          ) : (
            <Text style={styles.text}>No parties explicitly identified</Text>
          )}
          <Text style={styles.confidence}>
            Confidence: {formatConfidence(terms.confidence.parties)}
          </Text>

          <Text style={styles.subtitle}>Legal Terms</Text>
          <Text style={styles.label}>Governing Law:</Text>
          <Text style={styles.text}>
            {terms.governingLaw || "Not specified"}
          </Text>
          <Text style={styles.confidence}>
            Confidence: {formatConfidence(terms.confidence.governingLaw)}
          </Text>

          <Text style={styles.label}>Dispute Resolution:</Text>
          <Text style={styles.text}>
            {terms.disputeResolution || "Not specified"}
          </Text>
          <Text style={styles.confidence}>
            Confidence: {formatConfidence(terms.confidence.disputeResolution)}
          </Text>

          <Text style={styles.subtitle}>Additional Terms</Text>
          <Text style={styles.label}>Termination Clause:</Text>
          <Text style={styles.text}>
            {terms.terminationClause || "Not specified"}
          </Text>
          <Text style={styles.confidence}>
            Confidence: {formatConfidence(terms.confidence.terminationClause)}
          </Text>

          <Text style={styles.label}>Automatic Renewal:</Text>
          <Text style={styles.text}>
            {terms.automaticRenewal || "Not specified"}
          </Text>
          <Text style={styles.confidence}>
            Confidence: {formatConfidence(terms.confidence.automaticRenewal)}
          </Text>

          <Text style={styles.label}>Confidentiality:</Text>
          <Text style={styles.text}>
            {terms.confidentiality || "Not specified"}
          </Text>
          <Text style={styles.confidence}>
            Confidence: {formatConfidence(terms.confidence.confidentiality)}
          </Text>
        </View>
      </Page>
    </Document>
  );
};
