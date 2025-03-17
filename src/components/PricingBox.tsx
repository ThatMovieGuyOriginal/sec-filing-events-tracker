// src/components/PricingBox.tsx
import React from 'react';

interface PricingBoxProps {
  name: string;
  description: string;
  price: { monthly: string; annual: string };
  features: string[];
  cta: string;
  popular: boolean;
  billingInterval: 'monthly' | 'annual';
  onSubscribe: () => void;
}

export const PricingBox: React.FC<PricingBoxProps> = ({
  name,
  description,
  price,
  features,
  cta,
  popular,
  billingInterval,
  onSubscribe,
}) => {
  return (
    <div 
      className={`relative flex flex-col rounded-lg shadow-lg overflow-hidden ${
        popular ? 'border-2 border-blue-500' : 'border border-gray-200'
      }`}
    >
      {popular && (
        <div className="absolute top-0 right-0 bg-blue-500 text-white px-4 py-1 text-sm font-bold uppercase">
          Most Popular
        </div>
      )}
      <div className="px-6 py-8 bg-white sm:p-10 sm:pb-6">
        <div>
          <h3 className="text-xl font-extrabold text-gray-900">{name}</h3>
          <p className="mt-4 text-sm text-gray-500">{description}</p>
        </div>
        <div className="mt-6">
          <div className="flex items-baseline">
            <span className="text-4xl font-extrabold text-gray-900">
              {billingInterval === 'monthly' ? price.monthly : price.annual}
            </span>
            <span className="ml-2 text-base font-medium text-gray-500">
              /{billingInterval === 'monthly' ? 'month' : 'year'}
            </span>
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col justify-between px-6 pt-6 pb-8 bg-gray-50 space-y-6 sm:p-10 sm:pt-6">
        <ul className="space-y-4">
          {features.map((feature) => (
            <li key={feature} className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-green-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="ml-3 text-base text-gray-700">{feature}</p>
            </li>
          ))}
        </ul>
        <div>
          <button
            onClick={onSubscribe}
            className={`block w-full ${
              popular
                ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 text-white'
                : 'bg-blue-100 text-blue-700 hover:bg-blue-200 focus:ring-blue-500'
            } rounded-md py-3 px-5 text-center font-medium focus:outline-none focus:ring-2 focus:ring-offset-2`}
          >
            {cta}
          </button>
        </div>
      </div>
    </div>
  );
}
