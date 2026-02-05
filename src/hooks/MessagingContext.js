import { createContext, useContext } from 'react';

// Export the context so the provider can use it
export const MessagingContext = createContext(null);

// Export the hook
export const useMessaging = () => {
  const context = useContext(MessagingContext);
  if (!context) {
    throw new Error('useMessaging must be used within an MessagingProvider');
  }
  return context;
};
