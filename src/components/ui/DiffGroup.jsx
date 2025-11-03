import React, { useState, useEffect } from 'react';

const DiffGroup = ({ title, groupKey, children, onGroupSelect, isSelected, isPartiallySelected }) => {
  return (
    <div className="diff-group" style={{ marginBottom: '16px' }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        padding: '8px',
        background: 'var(--bg-medium)',
        borderRadius: '8px',
        marginBottom: '8px'
      }}>
        <input
          type="checkbox"
          checked={isSelected}
          ref={input => {
            if (input) {
              input.indeterminate = isPartiallySelected;
            }
          }}
          onChange={(e) => onGroupSelect(groupKey, e.target.checked)}
          style={{ marginRight: '8px' }}
        />
        <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{title}</span>
      </div>
      <div style={{ marginLeft: '24px' }}>
        {children}
      </div>
    </div>
  );
};

export default DiffGroup;