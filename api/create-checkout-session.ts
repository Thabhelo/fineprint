import { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Stripe secret key is not defined');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-02-24.acacia' });

// Create a helper to set CORS headers:
const setCorsHeaders = (res: VercelResponse) => {
  const allowedOrigin = process.env.CORS_ALLOWED_ORIGIN || 'http://localhost:5173';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers for every request
  setCorsHeaders(res);

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }
  
  if (!process.env.VITE_FRONTEND_URL) {
    res.status(500).json({ error: 'Frontend URL is not defined' });
    return;
  }
  
  if (!process.env.STRIPE_YEARLY_PRICE_ID && !process.env.STRIPE_MONTHLY_PRICE_ID) {
    throw new Error('No price IDs are defined');
  }

  const { plan } = req.body;
  if (plan !== 'yearly' && plan !== 'monthly') {
    res.status(400).json({ error: 'Invalid plan type' });
    return;
  }

  try {
    const priceId = plan === 'yearly'
      ? process.env.STRIPE_YEARLY_PRICE_ID
      : process.env.STRIPE_MONTHLY_PRICE_ID;
    if (!priceId) {
      res.status(400).json({ error: 'Price ID is not defined' });
      return;
    }
    
    // Build the success and cancel URLs
    const successUrl = `${process.env.VITE_FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${process.env.VITE_FRONTEND_URL}/payment-failed`;

    // Validate the URLs
    try {
      new URL(successUrl);
      new URL(cancelUrl);
    } catch (error) {
      res.status(400).json({ error: 'Invalid URL' });
      return;
    }

    // Create the Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    res.status(200).json({ sessionId: session.id });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ error: error.message });
    } else {
      return res.status(500).json({ error: 'An unexpected error occurred' });
    }
  }
}
