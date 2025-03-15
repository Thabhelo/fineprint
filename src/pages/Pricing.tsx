import { useState } from 'react';
import { Check } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';

// Load Stripe publishable key from environment variables
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface Tier {
  name: string;
  price: string;
  description: string;
  features: string[];
  highlighted?: boolean;
}

const tiers: Tier[] = [
  {
    name: 'Free',
    price: '$0',
    description: 'Perfect for individuals getting started',
    features: [
      'Basic contract analysis',
      '10 contracts per month',
      'Risk detection',
      'Email support',
      'Browser extension',
    ],
  },
  {
    name: 'Premium',
    price: '$29', // Placeholder for monthly; discounted for yearly
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
  const [subscriptionPeriod, setSubscriptionPeriod] = useState<'monthly' | 'yearly'>('yearly');
  const [loading, setLoading] = useState(false);

  // Toggle monthly or yearly
  const handleToggle = (period: 'monthly' | 'yearly') => {
    setSubscriptionPeriod(period);
  };

  // Handle subscription logic for each tier
  const handleSubscribe = async (tierName: string) => {
    // Free tier: redirect to /features
    if (tierName === 'Free') {
      window.location.href = '/features';
      return;
    }

    // Enterprise tier: redirect to /contact
    if (tierName === 'Enterprise') {
      window.location.href = '/contact';
      return;
    }

    // Otherwise, handle Premium checkout via Stripe
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/create-checkout-session', { // Ensure the URL matches your server's address and port
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: subscriptionPeriod, tier: tierName }),
      });

      if (!response.ok) {
        // If the API call fails, show an error or handle gracefully
        const errorData = await response.json();
        console.error(`Error: ${response.status} ${response.statusText}`, errorData);
        setLoading(false);
        return;
      }

      const { sessionId } = await response.json();

      // Load Stripe
      const stripe = await stripePromise;
      if (!stripe) {
        console.error('Stripe could not be loaded.');
        setLoading(false);
        return;
      }

      // Redirect to Stripe Checkout
      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) {
        console.error('Stripe Checkout error:', error);
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="pricing" className="bg-gray-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="sm:text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Choose the plan that best fits your needs. All plans include our core features.
          </p>
        </div>

        {/* Monthly / Yearly Toggle */}
        <div className="mt-8 flex justify-center">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              type="button"
              onClick={() => handleToggle('monthly')}
              className={`px-4 py-2 text-sm font-medium border border-gray-200 ${
                subscriptionPeriod === 'monthly'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => handleToggle('yearly')}
              className={`px-4 py-2 text-sm font-medium border border-gray-200 ${
                subscriptionPeriod === 'yearly'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Yearly
            </button>
          </div>
        </div>

        {/* Pricing Tiers */}
        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-3">
          {tiers.map((tier) => {
            // Dynamic Premium price for monthly vs. yearly
            let displayPrice = tier.price;
            if (tier.name === 'Premium') {
              displayPrice = subscriptionPeriod === 'monthly' ? '$29' : '$19';
            }

            return (
              <div
                key={tier.name}
                className={`rounded-lg shadow-lg divide-y divide-gray-200 ${
                  tier.highlighted
                    ? 'border-2 border-indigo-500 relative'
                    : 'border border-gray-200'
                } bg-white`}
              >
                {tier.highlighted && (
                  <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 pointer-events-none">
                    <span className="inline-flex rounded-full bg-indigo-500 px-4 py-1 text-sm font-semibold text-white">
                      Popular
                    </span>
                  </div>
                )}
                <div className="p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">{tier.name}</h3>
                  <p className="mt-4">
                    <span className="text-4xl font-extrabold text-gray-900">{displayPrice}</span>
                    {tier.name !== 'Enterprise' && tier.name !== 'Free' && (
                      <span className="text-base font-medium text-gray-500">/month</span>
                    )}
                  </p>
                  <p className="mt-4 text-sm text-gray-500">{tier.description}</p>
                    <button
                    type="button"
                    onClick={async () => {
                      await handleSubscribe(tier.name);
                    }}
                    disabled={loading}
                    className={`mt-8 block w-full py-2 px-4 border border-transparent rounded-md text-center font-medium ${
                      tier.highlighted
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                    }`}
                    >
                    {tier.name === 'Enterprise'
                      ? 'Contact sales'
                      : tier.name === 'Free'
                      ? 'Get started'
                      : loading
                      ? 'Processing...'
                      : 'Get started'}
                    </button>
                </div>
                <div className="px-6 pt-6 pb-8">
                  <h4 className="text-sm font-medium text-gray-900 tracking-wide">What's included</h4>
                  <ul className="mt-6 space-y-4">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex space-x-3">
                        <Check className="flex-shrink-0 h-5 w-5 text-green-500" aria-hidden="true" />
                        <span className="text-sm text-gray-500">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
