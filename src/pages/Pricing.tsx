import { useState } from 'react';
import { Check, Shield, Sparkles, Users, Zap } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// Load Stripe publishable key from environment variables
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface Tier {
  name: string;
  price: string;
  description: string;
  features: string[];
  highlighted?: boolean;
  icon: React.ElementType;
  iconColor: string;
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
    icon: Shield,
    iconColor: 'bg-gradient-to-r from-blue-500 to-cyan-500',
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
    icon: Sparkles,
    iconColor: 'bg-gradient-to-r from-indigo-600 to-purple-600',
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
    icon: Users,
    iconColor: 'bg-gradient-to-r from-gray-700 to-gray-900',
  },
];

export default function Pricing() {
  const [subscriptionPeriod, setSubscriptionPeriod] = useState<'monthly' | 'yearly'>('yearly');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Toggle monthly or yearly
  const handleToggle = (period: 'monthly' | 'yearly') => {
    setSubscriptionPeriod(period);
  };

  // Handle subscription logic for each tier
  const handleSubscribe = async (tierName: string) => {
    // Handle Enterprise tier
    if (tierName === 'Enterprise') {
      navigate('/contact');
      return;
    }

    // Handle Free tier
    if (tierName === 'Free') {
      navigate('/');
      return;
    }

    // Only handle Premium tier with Stripe
    if (tierName !== 'Premium') {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: subscriptionPeriod
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { sessionId } = await response.json();
      const stripe = await stripePromise;

      if (!stripe) {
        throw new Error('Failed to load Stripe');
      }

      // Redirect to Stripe checkout
      const { error } = await stripe.redirectToCheckout({
        sessionId
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to start subscription process');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="pricing" className="bg-gray-100 min-h-screen pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div 
          className="sm:text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl md:text-5xl">
            Simple, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">transparent</span> pricing
          </h2>
          <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
            Choose the plan that best fits your needs. All plans include our core features.
          </p>
        </motion.div>

        {/* Monthly / Yearly Toggle */}
        <motion.div 
          className="mt-8 flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="bg-white p-1 rounded-full shadow-md">
            <div className="relative flex">
              <button
                type="button"
                onClick={() => handleToggle('monthly')}
                className={`relative px-6 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                  subscriptionPeriod === 'monthly'
                    ? 'text-white z-10'
                    : 'text-gray-700 hover:text-indigo-600'
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => handleToggle('yearly')}
                className={`relative px-6 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                  subscriptionPeriod === 'yearly'
                    ? 'text-white z-10'
                    : 'text-gray-700 hover:text-indigo-600'
                }`}
              >
                Yearly
                <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full shadow-sm">
                  Save 34%
                </span>
              </button>
              
              <div 
                className={`absolute inset-0 h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full transition-all duration-200 transform ${
                  subscriptionPeriod === 'yearly' ? 'translate-x-full' : 'translate-x-0'
                }`}
                style={{ width: '50%' }}
              >
              </div>
            </div>
          </div>
        </motion.div>

        {/* Pricing Tiers */}
        <div className="mt-16 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-1 sm:gap-8 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:mx-0 xl:grid-cols-3">
          {tiers.map((tier, index) => {
            // Dynamic Premium price for monthly vs. yearly
            let displayPrice = tier.price;
            if (tier.name === 'Premium') {
              displayPrice = subscriptionPeriod === 'monthly' ? '$29' : '$19';
            }

            return (
              <motion.div
                key={tier.name}
                className={`rounded-2xl shadow-lg ${
                  tier.highlighted
                    ? 'border-2 border-indigo-500 relative scale-105 z-10'
                    : 'border border-gray-200'
                } bg-white hover:shadow-xl transition-all duration-300`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + (index * 0.1) }}
                whileHover={{ y: -5 }}
              >
                {tier.highlighted && (
                  <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 z-50 pointer-events-none">
                    <span className="inline-flex rounded-full shadow-md border border-white bg-gradient-to-r from-pink-500 to-purple-600 px-4 py-1 text-xs font-semibold text-white">
                      Popular
                    </span>
                  </div>
                )}
                <div className="p-8">
                  <div className={`h-12 w-12 rounded-xl ${tier.iconColor} flex items-center justify-center mb-4 shadow-md`}>
                    <tier.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl leading-6 font-bold text-gray-900">{tier.name}</h3>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-5xl font-extrabold text-gray-900">{displayPrice}</span>
                    {tier.name !== 'Enterprise' && tier.name !== 'Free' && (
                      <span className="ml-1 text-base font-medium text-gray-500">/month</span>
                    )}
                  </div>
                  <p className="mt-4 text-gray-500">{tier.description}</p>
                  <button
                    type="button"
                    onClick={async () => {
                      await handleSubscribe(tier.name);
                    }}
                    disabled={loading}
                    className={`mt-8 w-full py-3 px-6 border border-transparent rounded-full text-center font-medium text-base transition-all duration-200 ${
                      tier.highlighted
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-200'
                        : tier.name === 'Enterprise'
                        ? 'bg-gray-900 text-white hover:bg-gray-800 hover:shadow-lg'
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
                <div className="px-8 pt-6 pb-8 bg-gray-50">
                  <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">What's included</h4>
                  <ul className="mt-6 space-y-5">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start">
                        <div className="flex-shrink-0">
                          <Check className="h-5 w-5 text-green-500" aria-hidden="true" />
                        </div>
                        <p className="ml-3 text-sm text-gray-700">{feature}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <motion.div
          className="mt-24"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Frequently asked questions</h2>
            <p className="mt-3 text-lg text-gray-500 max-w-2xl mx-auto">
              Can't find the answer you're looking for? Contact our support team.
            </p>
          </div>
          
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-3xl mx-auto">
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Can I change plans later?</h3>
                <p className="mt-2 text-gray-700">Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.</p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Is there a contract or commitment?</h3>
                <p className="mt-2 text-gray-700">No, all our plans are subscription-based with no long-term commitment. You can cancel anytime.</p>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Do you offer refunds?</h3>
                <p className="mt-2 text-gray-700">We offer a 14-day money-back guarantee if you're not satisfied with our premium services.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
