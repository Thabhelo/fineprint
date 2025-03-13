export interface PricingTier {
  name: string;
  price: string;
  description: string;
  features: string[];
  highlighted?: boolean;
}

export interface Feature {
  title: string;
  description: string;
  icon: string;
}