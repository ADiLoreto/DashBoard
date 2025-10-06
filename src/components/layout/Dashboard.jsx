import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Stipendio from '../sections/EntrateAttuali/Stipendio';
import AssetPatrimonio from '../sections/AssetPatrimonio/AssetPatrimonio';

const Dashboard = () => {
  const [selected, setSelected] = useState('Entrate Attuali');
  const [dateRange, setDateRange] = useState({
    start: new Date().toISOString().slice(0, 10),
    end: new Date().toISOString().slice(0, 10)
  });

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };

  return (
    <main style={{ flex: 1, background: 'var(--bg-dark)' }}>
      <div className="topbar">
        <h1>FINANCIAL STATUS DASHBOARD</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <label htmlFor="start-date" style={{ color: 'var(--text-gray)', fontSize: 14 }}>Start Date:</label>
          <input
            type="date"
            id="start-date"
            name="start"
            value={dateRange.start}
            onChange={handleDateChange}
            style={{ background: 'var(--bg-darker)', color: 'var(--text-light)', border: 'none', borderRadius: 4, padding: '4px 8px' }}
          />
          <label htmlFor="end-date" style={{ color: 'var(--text-gray)', fontSize: 14 }}>End Date:</label>
          <input
            type="date"
            id="end-date"
            name="end"
            value={dateRange.end}
            onChange={handleDateChange}
            style={{ background: 'var(--bg-darker)', color: 'var(--text-light)', border: 'none', borderRadius: 4, padding: '4px 8px' }}
          />
        </div>
      </div>
      <div style={{ display: 'flex' }}>
        <Sidebar onSelect={setSelected} selected={selected} />
        <div style={{ flex: 1, padding: 32 }}>
          {selected === 'Entrate Attuali' && <Stipendio dateRange={dateRange} />}
          {selected === 'Asset Patrimonio' && <AssetPatrimonio dateRange={dateRange} />}
          {/* Altri tab: Liquidità, Uscite, ProgettiExtra, LibertaGiorni */}
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
