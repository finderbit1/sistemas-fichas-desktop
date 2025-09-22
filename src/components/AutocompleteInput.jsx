import React, { useState, useEffect, useRef } from 'react';
import { Form, ListGroup, InputGroup } from 'react-bootstrap';
import './AutocompleteInput.css';

const AutocompleteInput = ({
  label,
  placeholder,
  options = [],
  value,
  onChange,
  onSelect,
  disabled = false,
  loading = false,
  className = "",
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState(options);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Filtrar opções baseado no valor do input
  useEffect(() => {
    if (!value || value.trim() === '') {
      setFilteredOptions(options);
    } else {
      const filtered = options.filter(option =>
        option.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredOptions(filtered);
    }
    setHighlightedIndex(-1);
  }, [value, options]);

  // Fechar dropdown quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);
    setIsOpen(true);
  };

  const handleOptionSelect = (option) => {
    onChange(option);
    onSelect(option);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        return;
      }
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredOptions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
          handleOptionSelect(filteredOptions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleInputFocus = () => {
    if (!disabled && !loading) {
      setIsOpen(true);
    }
  };

  const handleInputBlur = () => {
    // Delay para permitir clique nas opções
    setTimeout(() => setIsOpen(false), 150);
  };

  return (
    <div className={`autocomplete-container ${className}`} ref={inputRef}>
      <Form.Group>
        <Form.Label>
          {label}
          {loading && <span className="text-muted ms-2">(Carregando...)</span>}
        </Form.Label>
        <InputGroup>
          <Form.Control
            ref={inputRef}
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            disabled={disabled || loading}
            autoComplete="off"
            {...props}
          />
          {loading && (
            <InputGroup.Text>
              <div className="spinner-border spinner-border-sm" role="status">
                <span className="visually-hidden">Carregando...</span>
              </div>
            </InputGroup.Text>
          )}
        </InputGroup>
        
        {isOpen && filteredOptions.length > 0 && (
          <div className="autocomplete-dropdown">
            <ListGroup variant="flush">
              {filteredOptions.map((option, index) => (
                <ListGroup.Item
                  key={index}
                  ref={index === highlightedIndex ? listRef : null}
                  className={`autocomplete-option ${
                    index === highlightedIndex ? 'highlighted' : ''
                  }`}
                  onClick={() => handleOptionSelect(option)}
                  style={{ cursor: 'pointer' }}
                >
                  {option}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </div>
        )}
        
        {isOpen && filteredOptions.length === 0 && value && (
          <div className="autocomplete-dropdown">
            <ListGroup variant="flush">
              <ListGroup.Item className="text-muted text-center">
                Nenhum resultado encontrado
              </ListGroup.Item>
            </ListGroup>
          </div>
        )}
      </Form.Group>

    </div>
  );
};

export default AutocompleteInput;
