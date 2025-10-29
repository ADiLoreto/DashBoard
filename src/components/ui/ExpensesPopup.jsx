import React, { useState, useEffect } from 'react';
import { calculateNetIncome, calculateROI } from '../../utils/calculations';

const ExpensesPopup = ({ isOpen, onClose, initialData, onSave }) => {
  const [expenses, setExpenses] = useState([{ title: '', amount: '' }]);
  const [taxRate, setTaxRate] = useState('');
  const [yearlyRent, setYearlyRent] = useState('');
  const [propertyValue, setPropertyValue] = useState('');

  useEffect(() => {
    if (initialData) {
      setExpenses(initialData.expenses?.length ? initialData.expenses : [{ title: '', amount: '' }]);
      setTaxRate(initialData.taxRate || '');
      setYearlyRent(initialData.yearlyRent || '');
      setPropertyValue(initialData.valore || '');
    }
  }, [initialData]);

  const handleAddExpense = () => {
    setExpenses([...expenses, { title: '', amount: '' }]);
  };

  const handleRemoveExpense = (index) => {
    setExpenses(expenses.filter((_, i) => i !== index));
  };

  const handleExpenseChange = (index, field, value) => {
    const newExpenses = [...expenses];
    newExpenses[index] = { ...newExpenses[index], [field]: value };
    setExpenses(newExpenses);
  };

  const handleSave = () => {
    const validExpenses = expenses.filter(e => e.title && e.amount);
    onSave({
      expenses: validExpenses,
      taxRate: Number(taxRate) || 0,
      yearlyRent: Number(yearlyRent) || 0
    });
    onClose();
  };

  const totalExpenses = expenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
  const netIncome = calculateNetIncome(yearlyRent, expenses, taxRate);
  const roi = calculateROI(yearlyRent, expenses, taxRate, propertyValue);

  return (
    isOpen && (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: 'var(--bg-medium)',
          padding: '24px',
          borderRadius: '16px',
          width: '90%',
          maxWidth: '600px',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 4px 24px rgba(0,0,0,0.25)'
        }}>
          <h2 style={{ marginTop: 0, color: 'var(--text-light)' }}>Gestione Spese e Rendita</h2>

          {/* Affitto annuo e tassazione */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-light)' }}>
                Affitto annuo (€)
              </label>
              <input
                type="number"
                value={yearlyRent}
                onChange={(e) => setYearlyRent(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '8px',
                  border: '1px solid var(--bg-light)'
                }}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-light)' }}>
                Tassazione (%)
              </label>
              <input
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '8px',
                  border: '1px solid var(--bg-light)'
                }}
              />
            </div>
          </div>

          {/* Lista spese */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ color: 'var(--text-light)' }}>Spese</h3>
            {expenses.map((expense, index) => (
              <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input
                  placeholder="Voce di spesa"
                  value={expense.title}
                  onChange={(e) => handleExpenseChange(index, 'title', e.target.value)}
                  style={{
                    flex: 2,
                    padding: '8px',
                    borderRadius: '8px',
                    border: '1px solid var(--bg-light)'
                  }}
                />
                <input
                  type="number"
                  placeholder="Importo"
                  value={expense.amount}
                  onChange={(e) => handleExpenseChange(index, 'amount', e.target.value)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '8px',
                    border: '1px solid var(--bg-light)'
                  }}
                />
                <button
                  onClick={() => handleRemoveExpense(index)}
                  style={{
                    padding: '8px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: 'var(--accent-red)',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                >
                  🗑️
                </button>
              </div>
            ))}
            <button
              onClick={handleAddExpense}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: 'var(--accent-cyan)',
                color: 'black',
                cursor: 'pointer',
                marginTop: '8px'
              }}
            >
              + Aggiungi spesa
            </button>
          </div>

          {/* Riepilogo calcoli */}
          <div style={{
                    marginBottom: '24px',
                    padding: '16px',
                    backgroundColor: 'var(--bg-light)',
                    borderRadius: '8px',
                    color: 'black'
                  }}>
            <div>Totale spese annuali: €{totalExpenses}</div>
            <div>Rendita netta: €{netIncome.toFixed(2)}</div>
            <div>ROI: {roi.toFixed(2)}%</div>
          </div>

          {/* Pulsanti azione */}
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button
              onClick={onClose}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: 'var(--bg-light)',
                color: 'black',
                cursor: 'pointer'
              }}
            >
              Annulla
            </button>
            <button
              onClick={handleSave}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: 'var(--accent-cyan)',
                color: 'black',
                cursor: 'pointer'
              }}
            >
              Salva
            </button>
          </div>
        </div>
      </div>
    )
  );
};

export default ExpensesPopup;