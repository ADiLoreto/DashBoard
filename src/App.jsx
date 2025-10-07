import React, { useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { FinanceProvider } from './context/FinanceContext';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './components/layout/Dashboard';
import Login from './components/auth/Login';
import './App.css';

const AppInner = () => {
  const { user } = useContext(AuthContext);
  if (!user) return <Login />;
  return (
    <FinanceProvider>
      <div style={{ display: 'flex', background: '#28323c', minHeight: '100vh' }}>
        <Sidebar />
        <Dashboard />
      </div>
    </FinanceProvider>
  );
};

const App = () => (
  <AuthProvider>
    <AppInner />
  </AuthProvider>
);

export default App;
