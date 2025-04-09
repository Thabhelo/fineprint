import { jsPDF } from "jspdf";
import type { DocumentAnalysis, ExtractedTerm } from "./documentAnalyzer";
import type { Document } from "../pages/DocumentLibrary";

export async function exportAnalysisToPDF(
  document: Document,
  analysis: DocumentAnalysis
): Promise<Blob> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = margin;

  // Add title
  doc.setFontSize(20);
  doc.text("Document Analysis Report", pageWidth / 2, y, { align: "center" });
  y += 20;

  // Add document title
  doc.setFontSize(16);
  doc.text("Document: " + document.title, margin, y);
  y += 15;

  // Add risk analysis
  doc.setFontSize(14);
  doc.text("Risk Analysis", margin, y);
  y += 10;
  doc.setFontSize(12);
  doc.text(`Risk Level: ${analysis.riskLevel.toUpperCase()}`, margin, y);
  y += 10;
  doc.text(`Risk Score: ${analysis.riskScore.toFixed(1)}`, margin, y);
  y += 15;

  // Add extracted terms
  doc.setFontSize(14);
  doc.text("Extracted Terms", margin, y);
  y += 10;
  doc.setFontSize(12);

  const termTypes = ["date", "amount", "term", "clause"] as const;
  termTypes.forEach((type) => {
    const terms = analysis.terms.filter((t) => t.type === type);
    if (terms.length > 0) {
      doc.text(`${type.toUpperCase()}S:`, margin, y);
      y += 10;
      terms.forEach((term) => {
        if (y > doc.internal.pageSize.getHeight() - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(
          `- ${term.value} (Confidence: ${(term.confidence * 100).toFixed(
            1
          )}%)`,
          margin + 10,
          y
        );
        y += 10;
      });
      y += 5;
    }
  });

  // Add document preview
  if (document.content) {
    doc.setFontSize(14);
    doc.text("Document Preview", margin, y);
    y += 10;
    doc.setFontSize(10);
    const preview = document.content.substring(0, 500) + "...";
    const splitText: string[] = doc.splitTextToSize(preview, pageWidth - 2 * margin);
    for (let i = 0; i < splitText.length; i++) {
      const line: string = splitText[i];
      if (y > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += 7;
    }
  }

  // Add metadata
  if (document.metadata) {
    y += 10;
    doc.setFontSize(14);
    doc.text("Metadata", margin, y);
    y += 10;
    doc.setFontSize(12);
    doc.text(`Pages: ${document.metadata.pageCount || "N/A"}`, margin, y);
    y += 10;
    doc.text(`Words: ${document.metadata.wordCount}`, margin, y);
    if (document.metadata.ocrResults) {
      y += 10;
      doc.text(
        `OCR Confidence: ${Math.round(
          document.metadata.ocrResults.confidence
        )}%`,
        margin,
        y
      );
    }
  }

  // Add summary
  y += 15;
  doc.setFontSize(14);
  doc.text("Summary", margin, y);
  y += 10;
  doc.setFontSize(12);
  const summaryLines: string[] = doc.splitTextToSize(
    analysis.summary,
    pageWidth - 2 * margin
  );
  for (let i = 0; i < summaryLines.length; i++) {
    const line: string = summaryLines[i];
    if (y > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }
    doc.text(line, margin, y);
    y += 7;
  }

  // Add footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
  }

  return doc.output("blob");
}
