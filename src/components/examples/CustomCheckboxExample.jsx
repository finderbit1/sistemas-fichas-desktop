import React, { useState } from 'react';
import CustomCheckbox from '../CustomCheckbox';

const CustomCheckboxExample = () => {
  const [checkboxes, setCheckboxes] = useState({
    basic: false,
    withLabel: false,
    leftLabel: false,
    topLabel: false,
    bottomLabel: false,
    disabled: true,
    disabledWithLabel: true,
    small: false,
    medium: false,
    large: false
  });

  const handleChange = (key) => {
    setCheckboxes(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="p-4">
      <h3 className="mb-4">Exemplos de CustomCheckbox com Labels</h3>
      
      <div className="row">
        <div className="col-md-6">
          <h5 className="mb-3">Posições de Label</h5>
          
          {/* Label à direita (padrão) */}
          <div className="mb-3">
            <CustomCheckbox
              checked={checkboxes.withLabel}
              onChange={() => handleChange('withLabel')}
              label="Label à direita (padrão)"
              labelPosition="right"
            />
          </div>

          {/* Label à esquerda */}
          <div className="mb-3">
            <CustomCheckbox
              checked={checkboxes.leftLabel}
              onChange={() => handleChange('leftLabel')}
              label="Label à esquerda"
              labelPosition="left"
            />
          </div>

          {/* Label no topo */}
          <div className="mb-3">
            <CustomCheckbox
              checked={checkboxes.topLabel}
              onChange={() => handleChange('topLabel')}
              label="Label no topo"
              labelPosition="top"
            />
          </div>

          {/* Label embaixo */}
          <div className="mb-3">
            <CustomCheckbox
              checked={checkboxes.bottomLabel}
              onChange={() => handleChange('bottomLabel')}
              label="Label embaixo"
              labelPosition="bottom"
            />
          </div>
        </div>

        <div className="col-md-6">
          <h5 className="mb-3">Tamanhos</h5>
          
          {/* Tamanho pequeno */}
          <div className="mb-3">
            <CustomCheckbox
              checked={checkboxes.small}
              onChange={() => handleChange('small')}
              label="Checkbox pequeno"
              size="small"
            />
          </div>

          {/* Tamanho médio */}
          <div className="mb-3">
            <CustomCheckbox
              checked={checkboxes.medium}
              onChange={() => handleChange('medium')}
              label="Checkbox médio"
              size="medium"
            />
          </div>

          {/* Tamanho grande */}
          <div className="mb-3">
            <CustomCheckbox
              checked={checkboxes.large}
              onChange={() => handleChange('large')}
              label="Checkbox grande"
              size="large"
            />
          </div>
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-md-6">
          <h5 className="mb-3">Estados</h5>
          
          {/* Checkbox básico sem label */}
          <div className="mb-3">
            <CustomCheckbox
              checked={checkboxes.basic}
              onChange={() => handleChange('basic')}
            />
            <span className="ms-2">Checkbox básico sem label</span>
          </div>

          {/* Checkbox desabilitado */}
          <div className="mb-3">
            <CustomCheckbox
              checked={checkboxes.disabled}
              onChange={() => handleChange('disabled')}
              disabled={true}
            />
            <span className="ms-2 text-muted">Checkbox desabilitado</span>
          </div>

          {/* Checkbox desabilitado com label */}
          <div className="mb-3">
            <CustomCheckbox
              checked={checkboxes.disabledWithLabel}
              onChange={() => handleChange('disabledWithLabel')}
              disabled={true}
              label="Checkbox desabilitado com label"
            />
          </div>
        </div>

        <div className="col-md-6">
          <h5 className="mb-3">Exemplos Práticos</h5>
          
          {/* Exemplo de uso em formulário */}
          <div className="mb-3">
            <CustomCheckbox
              checked={checkboxes.withLabel}
              onChange={() => handleChange('withLabel')}
              label="Eu aceito os termos e condições"
              labelPosition="right"
              size="medium"
            />
          </div>

          {/* Exemplo com label no topo */}
          <div className="mb-3">
            <CustomCheckbox
              checked={checkboxes.topLabel}
              onChange={() => handleChange('topLabel')}
              label="Receber notificações por email"
              labelPosition="top"
              size="large"
            />
          </div>

          {/* Exemplo compacto */}
          <div className="mb-3">
            <CustomCheckbox
              checked={checkboxes.small}
              onChange={() => handleChange('small')}
              label="Salvar configurações"
              size="small"
            />
          </div>
        </div>
      </div>

      <div className="mt-4">
        <h5>Como usar:</h5>
        <pre className="bg-light p-3 rounded">
{`// Checkbox básico
<CustomCheckbox 
  checked={checked} 
  onChange={onChange} 
/>

// Com label à direita (padrão)
<CustomCheckbox 
  checked={checked} 
  onChange={onChange}
  label="Texto da label"
/>

// Com label à esquerda
<CustomCheckbox 
  checked={checked} 
  onChange={onChange}
  label="Texto da label"
  labelPosition="left"
/>

// Com label no topo
<CustomCheckbox 
  checked={checked} 
  onChange={onChange}
  label="Texto da label"
  labelPosition="top"
/>

// Com label embaixo
<CustomCheckbox 
  checked={checked} 
  onChange={onChange}
  label="Texto da label"
  labelPosition="bottom"
/>

// Diferentes tamanhos
<CustomCheckbox size="small" label="Pequeno" />
<CustomCheckbox size="medium" label="Médio" />
<CustomCheckbox size="large" label="Grande" />

// Desabilitado
<CustomCheckbox 
  checked={true} 
  disabled={true}
  label="Desabilitado"
/>

// Sem label (showLabel={false})
<CustomCheckbox 
  checked={checked} 
  onChange={onChange}
  label="Label oculta"
  showLabel={false}
/>`}
        </pre>
      </div>
    </div>
  );
};

export default CustomCheckboxExample;
