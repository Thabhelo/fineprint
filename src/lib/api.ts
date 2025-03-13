import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.fineprint.ai';

export async function analyzeContractWithAI(content: string) {
  try {
    const response = await axios.post(`${API_URL}/analyze`, { content });
    return response.data;
  } catch (error) {
    console.error('Error analyzing contract with AI:', error);
    throw error;
  }
}

export async function exportToPDF(contractId: string) {
  try {
    const response = await axios.get(`${API_URL}/export/${contractId}`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw error;
  }
}