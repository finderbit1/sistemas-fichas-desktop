import React, { useState } from 'react';
import { Form, Tabs, Tab, Container, Button, Card, FormControl, ListGroup } from 'react-bootstrap';
import FormPainel from './FormPainel';
import FormTotem from './FormTotem';
import FormLona from './FormLona';

function TypeProduction() {
    const [opcaoSelecionada, setOpcaoSelecionada] = useState('');

    const handleSelectChange = (e) => {
        setOpcaoSelecionada(e.target.value);
    };

    return (
        <>
            <Form.Select
                aria-label="Selecione o tipo de produção"
                onChange={handleSelectChange}
                value={opcaoSelecionada}
            >
                <option value="">Selecione uma opção</option>
                <option value="painel">Painel</option>
                <option value="totem">Totem</option>
                <option value="lona">Lona</option>
            </Form.Select>
            <div>
                {opcaoSelecionada === 'painel' && <FormPainel />}
                {opcaoSelecionada === 'totem' && <FormTotem />}
                {opcaoSelecionada === 'lona' && <FormLona />}
            </div>
        </>
    );
}

function FormOrder() {
    const [count, setCount] = useState(1);
    const [tabs, setTabs] = useState([{ eventKey: `tab-1`, title: `Tab 1`, content: <TypeProduction /> }]);

    const [selectedClient, setSelectedClient] = useState('');
    const [filteredClients, setFilteredClients] = useState([]);
    const [city, setCity] = useState('');
    const [phone, setPhone] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);

    const clients = [
        { id: 1, name: 'João Silva', city: 'São Paulo', phone: '(11) 99999-1111' },
        { id: 2, name: 'Maria Oliveira', city: 'Rio de Janeiro', phone: '(21) 98888-2222' },
        { id: 3, name: 'Pedro Santos', city: 'Belo Horizonte', phone: '(31) 97777-3333' },
        { id: 4, name: 'José Pereira', city: 'Curitiba', phone: '(41) 96666-4444' },
    ];

    const handleClientInputChange = (e) => {
        const value = e.target.value;
        setSelectedClient(value);

        if (value.length > 0) {
            const filtered = clients.filter(c =>
                c.name.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredClients(filtered);
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }

        setCity('');
        setPhone('');
    };

    const handleClientSelect = (client) => {
        setSelectedClient(client.name);
        setCity(client.city);
        setPhone(client.phone);
        setFilteredClients([]);
        setShowSuggestions(false);
    };

    const adTab = () => {
        const newCount = count + 1;
        setCount(newCount);
        setTabs([
            ...tabs,
            { eventKey: `tab-${newCount}`, title: `Tab ${newCount}`, content: <TypeProduction /> },
        ]);
    };

    const removeTab = (eventKey) => {
        const updatedTabs = tabs.filter((tab) => tab.eventKey !== eventKey);
        setTabs(updatedTabs);

        if (updatedTabs.length === 0) {
            setCount(1);
        }
    };

    return (
        <Container className="mt-4">
      
            <Card className="mt-3">
                <Tabs defaultActiveKey="tab-1" id="container-tabs" className="mb-3">
                    {tabs.map((tab, index) => (
                        <Tab
                            eventKey={tab.eventKey}
                            title={
                                <>
                                    {tab.title}
                                    <span
                                        onClick={() => removeTab(tab.eventKey)}
                                        style={{ cursor: 'pointer', marginLeft: '10px', color: 'red' }}
                                    >
                                        ✕
                                    </span>
                                </>
                            }
                            key={index}
                        >
                            {tab.content}
                        </Tab>
                    ))}
                </Tabs>
            </Card>

            <div className="mt-3">
                <Button onClick={adTab}>Adicionar Aba</Button>
            </div>
        </Container>
    );
}

export default FormOrder;
