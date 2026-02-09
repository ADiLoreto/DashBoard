import React, { useState, useMemo, useEffect } from 'react';
import { ASSET_FIELD_CONFIG } from '../../config/assetFields';

const AssetManagementPopup = ({
  isOpen,
  assetType,
  initialData = null,
  onSave,
  onDelete,
  onClose
}) => {
  if (!isOpen || !assetType) return null;

  const config = ASSET_FIELD_CONFIG[assetType];
  if (!config) return null;

  const [formData, setFormData] = useState(initialData || {});
  const [activeSection, setActiveSection] = useState(config.sections?.[0] || 'base');
  const [errors, setErrors] = useState({});

  // Handle ESC key to close popup
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Get fields for active section
  const fieldsInSection = useMemo(() => {
    if (!config.fields) return [];
    return Object.entries(config.fields).filter(([_, field]) => field.section === activeSection);
  }, [config, activeSection]);

  // Calculate automatically based on config
  const calculations = useMemo(() => {
    const result = {};
    if (!config.calculations) return result;

    Object.entries(config.calculations).forEach(([key, fn]) => {
      try {
        result[key] = fn(formData, result);
      } catch (e) {
        result[key] = null;
      }
    });
    return result;
  }, [formData, config]);

  // Validate field
  const validateField = (fieldName, value) => {
    const field = config.fields?.[fieldName];
    if (!field) return null;

    if (field.required && (value === '' || value === null || value === undefined)) {
      return 'Campo obbligatorio';
    }

    if (field.min !== undefined && Number(value) < field.min) {
      return `Minimo: ${field.min}`;
    }

    if (field.max !== undefined && Number(value) > field.max) {
      return `Massimo: ${field.max}`;
    }

    return null;
  };

  // Handle field change
  const handleFieldChange = (fieldName, value) => {
    const error = validateField(fieldName, value);
    if (error) {
      setErrors(prev => ({ ...prev, [fieldName]: error }));
    } else {
      setErrors(prev => ({ ...prev, [fieldName]: null }));
    }
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  // Strategia robusta: costruire finalData sincrono con coercizione numerica
  const buildFinalData = (data) => {
    const finalData = { ...data };
    Object.entries(config.fields || {}).forEach(([fieldName, field]) => {
      let v = finalData[fieldName];
      if (v === undefined || v === null || v === '') {
        if (field.default !== undefined) v = field.default;
        else if (field.type === 'number') v = 0;
      }
      // Coercizione numerica per garantire valori validi
      if (field.type === 'number') finalData[fieldName] = Number(v);
      else finalData[fieldName] = v;
    });
    return finalData;
  };

  // Validazione completa di tutti i campi
  const validateData = (data, onlyActiveSection = false) => {
    const newErrors = {};
    Object.entries(config.fields || {}).forEach(([fieldName, field]) => {
      if (onlyActiveSection && field.section !== activeSection) return;
      
      const value = data[fieldName];
      const error = validateField(fieldName, value);
      if (error) newErrors[fieldName] = error;
    });
    return newErrors;
  };

  // Handle save con strategia robusta
  const handleSave = () => {
    const finalData = buildFinalData(formData);
    const errs = validateData(finalData, false); // Validazione completa
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      setFormData(finalData);
      return;
    }
    setFormData(finalData);
    console.log('Payload inviato a onSave:', finalData); // Debug
    onSave && onSave(finalData);
  };

  // Handle delete
  const handleDelete = () => {
    if (window.confirm('Sei sicuro di voler eliminare questo asset?')) {
      onDelete && onDelete();
    }
  };

  // Render field based on type
  const renderField = (fieldName, field) => {
    const value = formData[fieldName] || '';
    const error = errors[fieldName];

    const fieldStyle = {
      marginBottom: 16,
    };

    const labelStyle = {
      display: 'block',
      fontSize: 12,
      fontWeight: 600,
      color: 'var(--text-muted)',
      marginBottom: 6,
      textTransform: 'uppercase',
      letterSpacing: 0.5
    };

    const inputStyle = {
      width: '100%',
      padding: '10px 12px',
      fontSize: 14,
      border: error ? '1px solid #ff6b6b' : '1px solid var(--bg-medium)',
      borderRadius: 8,
      background: 'var(--bg-light)',
      color: 'var(--bg-dark)',
      fontFamily: 'inherit',
      boxSizing: 'border-box'
    };

    const errorStyle = {
      fontSize: 11,
      color: '#ff6b6b',
      marginTop: 4
    };

    switch (field.type) {
      case 'text':
      case 'email':
        return (
          <div key={fieldName} style={fieldStyle}>
            <label style={labelStyle}>{field.label}</label>
            <input
              type={field.type}
              value={value}
              onChange={e => handleFieldChange(fieldName, e.target.value)}
              placeholder={field.label}
              style={inputStyle}
            />
            {error && <div style={errorStyle}>{error}</div>}
          </div>
        );

      case 'number':
        return (
          <div key={fieldName} style={fieldStyle}>
            <label style={labelStyle}>{field.label}</label>
            <input
              type="number"
              value={value}
              onChange={e => handleFieldChange(fieldName, e.target.value)}
              placeholder={field.label}
              step={field.step || 0.01}
              style={inputStyle}
            />
            {error && <div style={errorStyle}>{error}</div>}
          </div>
        );

      case 'date':
        return (
          <div key={fieldName} style={fieldStyle}>
            <label style={labelStyle}>{field.label}</label>
            <input
              type="date"
              value={value}
              onChange={e => handleFieldChange(fieldName, e.target.value)}
              style={inputStyle}
            />
            {error && <div style={errorStyle}>{error}</div>}
          </div>
        );

      case 'select':
        return (
          <div key={fieldName} style={fieldStyle}>
            <label style={labelStyle}>{field.label}</label>
            <select
              value={value}
              onChange={e => handleFieldChange(fieldName, e.target.value)}
              style={{ ...inputStyle, cursor: 'pointer' }}
            >
              <option value="">-- Seleziona --</option>
              {field.options?.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            {error && <div style={errorStyle}>{error}</div>}
          </div>
        );

      case 'checkbox':
        return (
          <div key={fieldName} style={{ ...fieldStyle, display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="checkbox"
              checked={value === true || value === 'true'}
              onChange={e => handleFieldChange(fieldName, e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <label style={{ ...labelStyle, margin: 0 }}>{field.label}</label>
          </div>
        );

      case 'textarea':
        return (
          <div key={fieldName} style={fieldStyle}>
            <label style={labelStyle}>{field.label}</label>
            <textarea
              value={value}
              onChange={e => handleFieldChange(fieldName, e.target.value)}
              placeholder={field.label}
              style={{ ...inputStyle, minHeight: 80, resize: 'vertical' }}
            />
            {error && <div style={errorStyle}>{error}</div>}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(48, 57, 67, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(2px)'
    }}>
      <div style={{
        background: 'var(--bg-light)',
        borderRadius: 16,
        boxShadow: '0 8px 48px rgba(0,0,0,0.35)',
        width: 'calc(100% - 32px)',
        maxWidth: 800,
        maxHeight: 'calc(100vh - 60px)',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--bg-medium)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: 20,
            fontWeight: 700,
            color: 'var(--bg-dark)'
          }}>
            {initialData ? `Modifica ${config.label}` : `Nuovo ${config.label}`}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 24,
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '4px 8px'
            }}
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        {config.sections && config.sections.length > 1 && (
          <div style={{
            display: 'flex',
            gap: 0,
            borderBottom: '1px solid var(--bg-medium)',
            padding: '0 24px'
          }}>
            {config.sections.map(section => (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                style={{
                  background: activeSection === section ? 'var(--bg-medium)' : 'transparent',
                  border: 'none',
                  padding: '12px 16px',
                  fontSize: 12,
                  fontWeight: activeSection === section ? 600 : 400,
                  color: activeSection === section ? 'var(--accent-cyan)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  borderBottom: activeSection === section ? '2px solid var(--accent-cyan)' : 'none',
                  transition: 'all 200ms ease'
                }}
              >
                {section.charAt(0).toUpperCase() + section.slice(1)}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div style={{
          flex: 1,
          padding: '24px',
          overflow: 'auto'
        }}>
          {/* Show form fields for current section */}
          {activeSection !== 'performance' && (
            <div>
              {fieldsInSection.map(([fieldName, field]) => renderField(fieldName, field))}
            </div>
          )}

          {/* Show calculations in performance tab */}
          {activeSection === 'performance' && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 16
            }}>
              {Object.entries(calculations).map(([key, value]) => (
                <div key={key} style={{
                  background: 'var(--bg-medium)',
                  padding: 16,
                  borderRadius: 12,
                  textAlign: 'center'
                }}>
                  <div style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    marginBottom: 8,
                    letterSpacing: 0.5
                  }}>
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                  <div style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: 'var(--accent-cyan)'
                  }}>
                    {typeof value === 'number' ? value.toFixed(2) : value || '-'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--bg-medium)',
          display: 'flex',
          justifyContent: 'space-between',
          gap: 12,
          background: 'var(--bg-medium)'
        }}>
          <button
            onClick={handleDelete}
            style={{
              background: '#ff6b6b',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              padding: '10px 16px',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 200ms',
              display: initialData ? 'block' : 'none'
            }}
            onMouseOver={e => e.target.style.background = '#ff5252'}
            onMouseOut={e => e.target.style.background = '#ff6b6b'}
          >
            Elimina
          </button>

          <div style={{ display: 'flex', gap: 12, marginLeft: 'auto' }}>
            <button
              onClick={onClose}
              style={{
                background: 'var(--bg-light)',
                color: 'var(--text-primary)',
                border: '1px solid var(--bg-medium)',
                borderRadius: 8,
                padding: '10px 16px',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 200ms'
              }}
              onMouseOver={e => e.target.style.background = 'var(--bg-darker)'}
              onMouseOut={e => e.target.style.background = 'var(--bg-light)'}
            >
              Annulla
            </button>

            <button
              onClick={handleSave}
              style={{
                background: 'var(--accent-cyan)',
                color: 'var(--bg-dark)',
                border: 'none',
                borderRadius: 8,
                padding: '10px 16px',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'opacity 200ms'
              }}
              onMouseOver={e => e.target.style.opacity = '0.9'}
              onMouseOut={e => e.target.style.opacity = '1'}
            >
              Salva
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssetManagementPopup;
