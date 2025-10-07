import React, { useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { FinanceProvider } from './context/FinanceContext';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './components/layout/Dashboard';
import Login from './components/auth/Login';
import './App.css';

const AppInner = () => {
  const { user } = useContext(AuthContext);
  const [activeSection, setActiveSection] = React.useState(null);
  if (!user) return <Login />;
  return (
    <FinanceProvider>
      <div style={{ display: 'flex', background: '#28323c', minHeight: '100vh' }}>
        <Sidebar onSelect={setActiveSection} selected={activeSection} />
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
