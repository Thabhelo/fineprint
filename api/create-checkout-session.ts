import { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Stripe secret key is not defined');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-02-24.acacia' });

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }
  const { plan } = req.body;
  if (plan !== 'yearly' && plan !== 'monthly') {
    res.status(400).json({ error: 'Invalid plan type' });
    return;
  }
  try {
    const priceId = plan === 'yearly' ? process.env.STRIPE_YEARLY_PRICE_ID : process.env.STRIPE_MONTHLY_PRICE_ID; 
    if (!priceId) {
      res.status(400).json({ error: 'Price ID is not defined' });
      return;
    }
    if (!process.env.VITE_FRONTEND_URL) { 
      throw new Error('Frontend URL is not defined');
    }
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${process.env.VITE_FRONTEND_URL}/payment-success?session_id={{CHECKOUT_SESSION_ID}}`,
      cancel_url: `${process.env.VITE_FRONTEND_URL}/payment-failed`,
    });
    res.status(200).json({ sessionId: session.id });
  } catch (error) {
    // Log the error for debugging purposes
    console.error('Error creating checkout session:', error);

    // Handle specific Stripe errors
    if (error.type === 'StripeCardError') {
      // Card errors are typically due to invalid card details
      res.status(500).json({ error: 'Internal Server Error', details: error.message || 'No additional details' });
    } else if (error.type === 'StripeInvalidRequestError') {
      // Invalid request errors occur when the request has invalid parameters
      res.status(400).json({ error: 'Invalid request', details: error.message });
    } else {
      // Handle any other types of errors as internal server errors
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
  }
}
