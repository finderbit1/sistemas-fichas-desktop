import React, { useState } from 'react';
import { Form, Button, Card, Container } from 'react-bootstrap';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const pedidosMock = [
    { numero: 'ORD-10001', cliente: 'João Silva', entrega: '2025-06-10', envio: 'Correios' },
    { numero: 'ORD-10002', cliente: 'Maria Oliveira', entrega: '2025-06-10', envio: 'Motoboy' },
    { numero: 'ORD-10003', cliente: 'Pedro Santos', entrega: '2025-06-10', envio: 'Correios' },
    { numero: 'ORD-10004', cliente: 'Ana Lima', entrega: '2025-06-10', envio: 'Retirada' },
    { numero: 'ORD-10005', cliente: 'Carlos Souza', entrega: '2025-06-11', envio: 'Motoboy' },
];

const RelatorioPedidos = () => {
    const [dataEntrega, setDataEntrega] = useState('');

    const gerarPDF = () => {
        if (!dataEntrega) {
            alert('Escolha uma data de entrega!');
            return;
        }

        const pedidosFiltrados = pedidosMock.filter(p => p.entrega === dataEntrega);

        if (pedidosFiltrados.length === 0) {
            alert('Nenhum pedido encontrado para essa data!');
            return;
        }

        const agrupadosPorEnvio = pedidosFiltrados.reduce((acc, pedido) => {
            if (!acc[pedido.envio]) acc[pedido.envio] = [];
            acc[pedido.envio].push(pedido);
            return acc;
        }, {});

        const doc = new jsPDF();
        doc.setFontSize(16);
        doc.text(`Relatório de Pedidos - Entrega ${dataEntrega}`, 14, 20);

        let yOffset = 30;

        Object.keys(agrupadosPorEnvio).forEach(envio => {
            doc.setFontSize(12);
            doc.text(`Forma de Envio: ${envio}`, 14, yOffset);
            yOffset += 4;

            autoTable(doc, {
                head: [['Número', 'Cliente']],
                body: agrupadosPorEnvio[envio].map(p => [p.numero, p.cliente]),
                startY: yOffset,
                theme: 'grid',
                margin: { left: 14, right: 14 },
                styles: { fontSize: 10 },
            });

            yOffset = doc.previousAutoTable.finalY + 10;
        });

        doc.save(`relatorio_${dataEntrega}.pdf`);
    };

    return (
        <Container className="mt-4">
            <Card className="p-4 shadow-sm">
                <h4 className="mb-3">Gerar Relatório de Pedidos</h4>
                <Form>
                    <Form.Group controlId="dataEntrega" className="mb-3">
                        <Form.Label>Data de Entrega</Form.Label>
                        <Form.Control
                            type="date"
                            value={dataEntrega}
                            onChange={(e) => setDataEntrega(e.target.value)}
                        />
                    </Form.Group>
                    <Button variant="primary" onClick={gerarPDF}>
                        Gerar PDF
                    </Button>
                </Form>
            </Card>
        </Container>
    );
};

export default RelatorioPedidos;
