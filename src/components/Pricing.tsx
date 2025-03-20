import React from 'react';
import { Check } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';

const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

const tiers = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for individuals getting started',
    features: [
      'Basic contract analysis',
      '5 contracts per month',
      'Risk detection',
      'Email support',
      'Browser extension',
    ],
  },
  {
    name: 'Premium',
    price: '$29',
    description: 'For professionals who need more power',
    features: [
      'Advanced AI analysis',
      'Unlimited contracts',
      'Priority support',
      'Real-time alerts',
      'Automated refunds',
      'API access',
    ],
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For large organizations with custom needs',
    features: [
      'Custom AI models',
      'Dedicated support',
      'SLA guarantee',
      'Custom integrations',
      'Advanced analytics',
      'Team management',
    ],
  },
];

export default function Pricing() {
  const handleSubscribe = async (plan: 'monthly' | 'yearly') => {
    try {
      console.log('Requesting URL:', '/api/create-checkout-session');
      console.log('Request payload:', { plan });
      
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ plan }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Error response data:', errorData);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { sessionId } = await response.json();
      console.log('Received session ID:', sessionId);
      
      // Redirect to Stripe Checkout
      const stripe = await loadStripe(STRIPE_PUBLISHABLE_KEY);
      if (stripe) {
        console.log('Redirecting to Stripe Checkout...');
        await stripe.redirectToCheckout({ sessionId });
      } else {
        throw new Error('Failed to load Stripe');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      // You might want to show an error message to the user here
    }
  };

  return (
    <div id="pricing" className="bg-gray-100 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="sm:text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Choose the plan that best fits your needs. All plans include our core features.
          </p>
        </div>

        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-4">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-lg shadow-md divide-y divide-gray-200 ${
                tier.highlighted
                  ? 'border-2 border-indigo-500 relative bg-white'
                  : 'border border-gray-200 bg-white'
              }`}
            >
              {tier.highlighted && (
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2">
                  <span className="inline-flex rounded-full bg-indigo-500 px-3 py-0.5 text-sm font-semibold text-white">
                    Popular
                  </span>
                </div>
              )}
              <div className="p-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">{tier.name}</h3>
                <p className="mt-2">
                  <span className="text-3xl font-extrabold text-gray-900">{tier.price}</span>
                  {tier.price !== 'Custom' && <span className="text-base font-medium text-gray-500">/month</span>}
                </p>
                <p className="mt-2 text-sm text-gray-500">{tier.description}</p>
                <button
                  onClick={() => tier.name === 'Premium' ? handleSubscribe('monthly') : null}
                  className={`mt-4 w-full py-2 px-3 border border-transparent rounded-md text-center font-medium ${
                    tier.highlighted
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                  }`}
                >
                  {tier.name === 'Enterprise' ? 'Contact sales' : 'Get started'}
                </button>
              </div>
              <div className="px-4 pt-4 pb-6">
                <h4 className="text-sm font-medium text-gray-900 tracking-wide">What's included</h4>
                <ul className="mt-4 space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <Check className="flex-shrink-0 h-4 w-4 text-green-500 mt-0.5" />
                      <span className="ml-2 text-sm text-gray-500">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}