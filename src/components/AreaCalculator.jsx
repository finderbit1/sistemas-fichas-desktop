import React, { useState, useEffect } from "react";
import { Form, InputGroup } from "react-bootstrap";

function AreaCalculatorLinhaUnica({ formData, onChange }) {
  const [form, setForm] = useState({
    largura: formData?.largura || "",
    altura: formData?.altura || "",
    area: "",
  });

  useEffect(() => {
    if (formData) {
      setForm(prev => ({
        ...prev,
        largura: formData.largura || "",
        altura: formData.altura || "",
      }));
    }
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    const updated = { ...form, [name]: value };

    const largura = parseFloat(updated.largura.replace(",", "."));
    const altura = parseFloat(updated.altura.replace(",", "."));

    if (!isNaN(largura) && !isNaN(altura)) {
      updated.area = (largura * altura).toFixed(2).replace(".", ",");
    } else {
      updated.area = "";
    }

    setForm(updated);
    
    // Notificar o componente pai sobre as mudanças
    if (onChange) {
      onChange({
        largura: updated.largura,
        altura: updated.altura,
        area: updated.area
      });
    }
  };

  return (
      <div className="form-group mb-3">
        <label className="form-label">Medidas (L × A = m²)</label>
        <InputGroup>
          <Form.Control
            name="largura"
            value={form.largura}
            onChange={handleChange}
            placeholder="Largura"
          />
          <InputGroup.Text>x</InputGroup.Text>
          <Form.Control
            name="altura"
            value={form.altura}
            onChange={handleChange}
            placeholder="Altura"
          />
          <InputGroup.Text>=</InputGroup.Text>
          <Form.Control
            name="area"
            value={form.area}
            readOnly
            placeholder="Área (m²)"
          />
          <InputGroup.Text>m²</InputGroup.Text>
        </InputGroup>
      </div>
  );
}

export default AreaCalculatorLinhaUnica;
