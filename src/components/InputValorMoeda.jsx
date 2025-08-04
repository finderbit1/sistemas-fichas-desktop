import React from 'react';
import { Form, InputGroup } from 'react-bootstrap';

export default function InputValorReal({ value, onChange, name, label, required }) {

    const handleChange = (e) => {
        const apenasNumeros = e.target.value.replace(/\D/g, '');
        const numero = Number(apenasNumeros) / 100;
        const formatado = numero.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).replace('R$', '').trim();

        // Chama o onChange do pai, simulando um event com o formato esperado
        onChange({ target: { name, value: formatado } });
    };

    return (
        <Form.Group controlId={name}>
            {label && <Form.Label>{label}</Form.Label>}
            <InputGroup>
                <InputGroup.Text>R$</InputGroup.Text>
                <Form.Control
                    type="text"
                    name={name}
                    value={value}
                    onChange={handleChange}
                    placeholder="0,00"
                    required={required}
                />
            </InputGroup>
        </Form.Group>
    );
}
