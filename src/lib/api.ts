import axios from 'axios';

const VITE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export async function analyzeContractWithAI(content: string) {
  try {
    const response = await axios.post(`${VITE_API_URL}/analyze`, { content });
    return response.data;
  } catch (error) {
    console.error('Error analyzing contract with AI:', error);
    throw error;
  }
}

export async function createCheckoutSession(productId: string) {
  try {
    const response = await axios.post(`${VITE_API_URL}/create-checkout-session`, { 
      productId,
      apiKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
    });
    return response.data;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
}

export async function exportPDF(contractId: string) {
  try {
    const response = await axios.get(`${VITE_API_URL}/export/${contractId}`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw error;
  }
}