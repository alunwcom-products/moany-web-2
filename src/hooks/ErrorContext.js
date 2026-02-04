import { createContext, useContext } from 'react';

// Export the context so the provider can use it
export const ErrorContext = createContext(null);

// Export the hook
export const useError = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useAuth must be used within an ErrorProvider');
  }
  return context;
};
