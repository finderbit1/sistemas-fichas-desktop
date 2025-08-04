// src/pages/RelatorioFechamento.js
import React, { useState } from 'react';
import { Container, Form, Button, Row, Col, Table } from 'react-bootstrap';

// Dados mocados
const mockData = [
  { id: 1, cliente: 'João Silva', vendedor: 'Andre', designer: 'Carol', valor: 120.00, data: '2025-07-20' },
  { id: 2, cliente: 'Maria Oliveira', vendedor: 'Carol', designer: 'Maicon', valor: 200.00, data: '2025-07-21' },
  { id: 3, cliente: 'Carlos Souza', vendedor: 'Andre', designer: 'Willis', valor: 150.00, data: '2025-07-25' },
];

function RelatorioFechamento() {
  const [filters, setFilters] = useState({
    cliente: '',
    vendedor: '',
    designer: '',
    dataInicio: '',
    dataFim: '',
  });
  const [resultados, setResultados] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const filtrar = () => {
    let filtrados = mockData;

    if (filters.cliente) {
      filtrados = filtrados.filter(item =>
        item.cliente.toLowerCase().includes(filters.cliente.toLowerCase())
      );
    }
    if (filters.vendedor) {
      filtrados = filtrados.filter(item => item.vendedor === filters.vendedor);
    }
    if (filters.designer) {
      filtrados = filtrados.filter(item => item.designer === filters.designer);
    }
    if (filters.dataInicio) {
      filtrados = filtrados.filter(item => item.data >= filters.dataInicio);
    }
    if (filters.dataFim) {
      filtrados = filtrados.filter(item => item.data <= filters.dataFim);
    }

    setResultados(filtrados);
  };

  const total = resultados.reduce((sum, item) => sum + item.valor, 0);

  return (
    <Container className="mt-4">
      <h3>Relatório de Fechamentos</h3>
      <Row className="mb-3">
        <Col><Form.Control type="text" placeholder="Cliente" name="cliente" onChange={handleChange} /></Col>
        <Col>
          <Form.Select name="vendedor" onChange={handleChange}>
            <option value="">Todos os Vendedores</option>
            <option value="Andre">Andre</option>
            <option value="Carol">Carol</option>
          </Form.Select>
        </Col>
        <Col>
          <Form.Select name="designer" onChange={handleChange}>
            <option value="">Todos os Designers</option>
            <option value="Carol">Carol</option>
            <option value="Maicon">Maicon</option>
            <option value="Willis">Willis</option>
          </Form.Select>
        </Col>
        <Col><Form.Control type="date" name="dataInicio" onChange={handleChange} /></Col>
        <Col><Form.Control type="date" name="dataFim" onChange={handleChange} /></Col>
        <Col><Button onClick={filtrar}>Filtrar</Button></Col>
      </Row>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Cliente</th>
            <th>Vendedor</th>
            <th>Designer</th>
            <th>Data</th>
            <th>Valor (R$)</th>
          </tr>
        </thead>
        <tbody>
          {resultados.map(item => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.cliente}</td>
              <td>{item.vendedor}</td>
              <td>{item.designer}</td>
              <td>{item.data}</td>
              <td>{item.valor.toFixed(2)}</td>
            </tr>
          ))}
          {resultados.length > 0 && (
            <tr className="fw-bold">
              <td colSpan={5}>Total</td>
              <td>R$ {total.toFixed(2)}</td>
            </tr>
          )}
        </tbody>
      </Table>
    </Container>
  );
}

export default RelatorioFechamento;
