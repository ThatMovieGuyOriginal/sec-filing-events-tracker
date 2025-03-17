// src/contexts/AdContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface AdContextType {
  showAds: boolean;
  isLoading: boolean;
}

const AdContext = createContext<AdContextType>({
  showAds: true,
  isLoading: true,
});

export const useAdContext = () => useContext(AdContext);

export const AdProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [showAds, setShowAds] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      try {
        const { data } = await axios.get('/api/user/subscription');
        // Hide ads for paid subscribers
        setShowAds(data.subscriptionTier === 'free');
      } catch (error) {
        // If error, assume free tier and show ads
        setShowAds(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkSubscriptionStatus();
  }, []);

  return (
    <AdContext.Provider value={{ showAds, isLoading }}>
      {children}
    </AdContext.Provider>
  );
};
