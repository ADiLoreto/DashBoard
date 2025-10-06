import React, { useContext } from 'react';
import EditableCard from '../../ui/EditableCard';
import { FinanceContext } from '../../../context/FinanceContext';
import { COLORS } from '../../../config/chartConfig';
import { useFinancialCalculations } from '../../../hooks/useFinancialCalculations';
// Se usi recharts: npm install recharts
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const getPieData = (patrimonio) => [
  { name: 'TFR', value: patrimonio.tfr },
  { name: 'Conti Deposito', value: patrimonio.contiDeposito.reduce((sum, c) => sum + c.saldo, 0) },
  { name: 'Azioni', value: patrimonio.investimenti.azioni.reduce((sum, i) => sum + i.valore, 0) },
  { name: 'ETF', value: patrimonio.investimenti.etf.reduce((sum, i) => sum + i.valore, 0) },
  { name: 'Crypto', value: patrimonio.investimenti.crypto.reduce((sum, i) => sum + i.valore, 0) },
  { name: 'Oro', value: patrimonio.investimenti.oro }
];

const AssetPatrimonio = () => {
  const { state, dispatch } = useContext(FinanceContext);
  const { totalePatrimonio } = useFinancialCalculations();
  const pieData = getPieData(state.patrimonio);

  const handleAddContoDeposito = (data) => {
    dispatch({
      type: 'ADD_CONTO_DEPOSITO',
      payload: data
    });
  };

  // Esempio: aggiungi logica per altri asset

  return (
    <div style={{ margin: '24px 0' }}>
      <div className="chart-title">Totale Patrimonio: <span style={{ color: 'var(--accent-cyan)' }}>{totalePatrimonio} €</span></div>
      <div className="chart-container">
        <PieChart width={400} height={300}>
          <Pie
            data={pieData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill="var(--accent-cyan)" />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </div>
      <div className="kpi-container">
        <EditableCard
          title="Conti Deposito"
          value={pieData[1].value}
          unit="€"
          fields={["saldo"]}
          onSave={handleAddContoDeposito}
          expandable={true}
        />
        {/* Altri EditableCard per Azioni, ETF, Crypto, Oro... */}
      </div>
    </div>
  );
};

export default AssetPatrimonio;
