import React, { useState } from "react";
import { Form, InputGroup } from "react-bootstrap";

function AreaCalculatorLinhaUnica() {
  const [form, setForm] = useState({
    largura: "",
    altura: "",
    area: "",
  });

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
  };

  return (
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
  );
}

export default AreaCalculatorLinhaUnica;
