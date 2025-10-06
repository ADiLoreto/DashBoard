import React from 'react';
import { FinanceProvider } from './context/FinanceContext';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './components/layout/Dashboard';
import './App.css';

const App = () => (
  <FinanceProvider>
    <div style={{ display: 'flex', background: '#28323c', minHeight: '100vh' }}>
      <Sidebar />
      <Dashboard />
    </div>
  </FinanceProvider>
);

export default App;
