import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import cors from 'cors';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const app = express();
app.use(bodyParser.json());

// Enable CORS for all routes with more detailed configuration
app.use(cors({
  origin: process.env.VITE_FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept'],
  credentials: true
}));

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Request headers:', req.headers);
  console.log('Request body:', req.body);
  next();
});

app.post('/api/create-checkout-session', async (req, res) => {
  const { plan } = req.body;
  console.log('Received plan:', plan);
  
  if (plan !== 'yearly' && plan !== 'monthly') {
    console.error('Invalid plan type:', plan);
    res.status(400).json({ error: 'Invalid plan type' });
    return;
  }
  
  try {
    const priceId = plan === 'yearly' 
      ? process.env.STRIPE_YEARLY_PRICE_ID 
      : process.env.STRIPE_MONTHLY_PRICE_ID;
      
    console.log('Using price ID:', priceId);
    
    if (!priceId) {
      console.error('Price ID is not defined');
      res.status(400).json({ error: 'Price ID is not defined' });
      return;
    }
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${process.env.VITE_FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.VITE_FRONTEND_URL}/payment-failed`,
    });
    
    console.log('Created Stripe session:', session.id);
    res.status(200).json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('CORS origin:', process.env.VITE_FRONTEND_URL || 'http://localhost:5173');
});