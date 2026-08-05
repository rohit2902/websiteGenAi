import React, { useEffect } from 'react';
import AppRoute from './app/AppRoute';
import useAuth from './hook/useAuth';

const App = () => {
  const { handleGetMe } = useAuth();

  useEffect(() => {
    handleGetMe(true);
  }, []); // Run ONLY ONCE on mount

  return <AppRoute />;
};

export default App;
