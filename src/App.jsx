import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FinanceProvider } from './context/FinanceContext';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './components/layout/Dashboard';
import Login from './components/auth/Login';
import './App.css';

const AppInner = () => {
  const { user, loading } = useAuth();
  const [activeSection, setActiveSection] = React.useState(null);
  
  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-dark)' }}>Caricamento...</div>;
  }
  
  if (!user) return <Login />;
  
  return (
    <FinanceProvider>
      <div style={{ display: 'flex', background: '#28323c', minHeight: '100vh' }}>
        <Sidebar onSelect={setActiveSection} selected={activeSection} onBack={() => setActiveSection(null)} />
        <Dashboard activeSection={activeSection} setActiveSection={setActiveSection} />
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
