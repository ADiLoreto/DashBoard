import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Stipendio from '../sections/EntrateAttuali/Stipendio';
import AssetPatrimonio from '../sections/AssetPatrimonio/AssetPatrimonio';

const Dashboard = () => {
  const [selected, setSelected] = useState('Entrate Attuali');

  return (
    <main style={{ flex: 1, padding: 32, background: '#28323c' }}>
      <Sidebar onSelect={setSelected} selected={selected} />
      {selected === 'Entrate Attuali' && <Stipendio />}
      {selected === 'Asset Patrimonio' && <AssetPatrimonio />}
      {/* Altri tab: Liquidità, Uscite, ProgettiExtra, LibertaGiorni */}
    </main>
  );
};

export default Dashboard;
