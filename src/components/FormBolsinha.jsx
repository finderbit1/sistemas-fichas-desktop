import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import ImageDropZone from './ImageDropZone';
import InputValorReal from './InputValorMoeda';
import AreaCalculatorLinhaUnica from './AreaCalculator';
import ValidationModal from './ValidationModal';
import { useVendedoresDesigners } from '../hooks/useVendedoresDesigners';
import { getAllTecidos } from '../services/api';
import CustomCheckbox from './CustomCheckbox';

function FormBolsinha({ onAdicionarItem }) {
    const { vendedores, designers, loading, error } = useVendedoresDesigners();
    
    const [formData, setFormData] = useState({
        descricao: '',
        tipo: 'necessaire',
        tamanho: '',
        cor: '',
        tecido: '',
        fecho: 'zíper',
        alcaAjustavel: false,
        observacao: '',
        valorBolsinha: '',
        largura: '',
        altura: '',
        area: '',
        valorAdicionais: '',
    });

    const [images, setImages] = useState([]);
    const [showValidationModal, setShowValidationModal] = useState(false);
    const [validationErrors, setValidationErrors] = useState([]);
    const [isSuccess, setIsSuccess] = useState(false);
    const [tecidos, setTecidos] = useState([]);
    const [tecidosLoading, setTecidosLoading] = useState(true);
    const [tecidosError, setTecidosError] = useState(null);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleAreaChange = (areaData) => {
        setFormData(prev => ({
            ...prev,
            largura: areaData.largura,
            altura: areaData.altura,
            area: areaData.area,
        }));
    };

    useEffect(() => {
        getAllTecidos()
            .then((res) => {
                const ativos = (res.data || []).filter((t) => t.active);
                setTecidos(ativos);
            })
            .catch((e) => {
                console.error('Erro ao carregar tecidos:', e);
                setTecidosError('Não foi possível carregar a lista de tecidos');
            })
            .finally(() => setTecidosLoading(false));
    }, []);

    const saveOrder = (e) => {
        e.preventDefault();

        if (!formData.descricao || !formData.valorBolsinha) {
            // Validação removida - será feita no componente pai
            return;
        }

        const parseBR = (v) => {
            if (!v) return 0;
            if (typeof v === 'number') return v;
            const normalized = String(v).replace(/\./g, '').replace(',', '.');
            const num = parseFloat(normalized);
            return isNaN(num) ? 0 : num;
        };

        const item = {
            ...formData,
            tipoProducao: 'bolsinha',
            tipo: 'bolsinha',
            valor: parseBR(formData.valorBolsinha) + parseBR(formData.valorAdicionais),
            imagem: images.length > 0 ? images[0] : null,
        };

        if (onAdicionarItem) {
            onAdicionarItem(item);
        }

        resetForm();
    };

    const resetForm = () => {
        setFormData({
            descricao: '',
            tipo: 'necessaire',
            tamanho: '',
            cor: '',
            tecido: '',
            fecho: 'zíper',
            alcaAjustavel: false,
            observacao: '',
            valorBolsinha: '',
        });
        setImages([]);
        setValidationErrors([]);
        setShowValidationModal(false);
        setIsSuccess(false);
    }

    return (
        <Container className="mt-4">
            <Form onSubmit={saveOrder}>
                <Row>
                    <Col md={6}>
                        <Form.Group controlId="descricao">
                            <Form.Label>Descrição</Form.Label>
                            <Form.Control
                                placeholder="Descrição da bolsinha"
                                type="text"
                                name="descricao"
                                value={formData.descricao}
                                onChange={handleChange}
                                required
                            />
                        </Form.Group>
                    </Col>

                    <Col md={6}>
                        <Form.Group controlId="tipo">
                            <Form.Label>Tipo de Bolsinha</Form.Label>
                            <Form.Select name="tipo" value={formData.tipo} onChange={handleChange}>
                                <option value="necessaire">Necessaire</option>
                                <option value="transversal">Transversal</option>
                                <option value="estojo">Estojo</option>
                                <option value="pochete">Pochete</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>
                </Row>

                <Row className="mt-3">
                    <Col md={4}>
                        <AreaCalculatorLinhaUnica 
                            formData={formData}
                            onChange={handleAreaChange}
                        />
                    </Col>
                    <Col md={4}>
                        <Form.Group controlId="tamanho">
                            <Form.Label>Tamanho (cm)</Form.Label>
                            <Form.Control
                                placeholder="Ex: 20x15"
                                type="text"
                                name="tamanho"
                                value={formData.tamanho}
                                onChange={handleChange}
                            />
                        </Form.Group>
                    </Col>

                    <Col md={4}>
                        <Form.Group controlId="cor">
                            <Form.Label>Cor</Form.Label>
                            <Form.Control
                                placeholder="Cor principal"
                                type="text"
                                name="cor"
                                value={formData.cor}
                                onChange={handleChange}
                            />
                        </Form.Group>
                    </Col>

                    <Col md={4}>
                        <Form.Group controlId="tecido">
                            <Form.Label>Tecido</Form.Label>
                            {tecidosLoading ? (
                                <div className="d-flex align-items-center"><Spinner size="sm" className="me-2" />Carregando tecidos...</div>
                            ) : tecidosError ? (
                                <Alert variant="warning" className="mb-0">{tecidosError}</Alert>
                            ) : (
                                <Form.Select name="tecido" value={formData.tecido} onChange={handleChange}>
                                    <option value="">Selecione o tecido</option>
                                    {tecidos.map((t) => (
                                        <option key={t.id} value={t.name}>{t.name}</option>
                                    ))}
                                </Form.Select>
                            )}
                        </Form.Group>
                    </Col>
                </Row>

                <Row className="mt-3">
                    <Col md={6}>
                        <Form.Group controlId="fecho">
                            <Form.Label>Fecho</Form.Label>
                            <Form.Select name="fecho" value={formData.fecho} onChange={handleChange}>
                                <option value="zíper">Zíper</option>
                                <option value="botão">Botão</option>
                                <option value="velcro">Velcro</option>
                            </Form.Select>
                        </Form.Group>
                    </Col>

                    <Col md={6}>
                        <Form.Group controlId="alcaAjustavel" className="mt-4">
                            <CustomCheckbox
                                id="bolsinha-alca-ajustavel"
                                label="Alça Ajustável"
                                name="alcaAjustavel"
                                checked={formData.alcaAjustavel}
                                onChange={handleChange}
                            />
                        </Form.Group>
                    </Col>
                </Row>

                <Row className="mt-3">
                    <Col>
                        <Form.Group controlId="observacao">
                            <Form.Label>Observações</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                name="observacao"
                                value={formData.observacao}
                                onChange={handleChange}
                            />
                        </Form.Group>
                    </Col>
                </Row>

                <Row className="mt-3">
                    <Col>
                        <ImageDropZone images={images} setImages={setImages} />
                    </Col>
                </Row>

                <Row className="mt-4 align-items-center mb-4">
                    <Col md={8}>
                        <InputValorReal
                            name="valorBolsinha"
                            label="Valor da Bolsinha"
                            value={formData.valorBolsinha}
                            onChange={handleChange}
                            required
                        />
                    </Col>
                    <Col md={4}>
                        <Form.Group controlId="valorAdicionais">
                            <Form.Label>Valores adicionais (opcional)</Form.Label>
                            <Form.Control
                                type="text"
                                name="valorAdicionais"
                                value={formData.valorAdicionais}
                                onChange={handleChange}
                                placeholder="Ex.: 10,00"
                            />
                        </Form.Group>
                    </Col>
                    <Col md={4} className="d-flex justify-content-end gap-2">
                        <Button variant="danger" type="button" onClick={resetForm} size="md">Limpar</Button>
                        <Button variant="success" type="submit" size="md">Salvar</Button>
                    </Col>
                </Row>
            </Form>
        </Container>
    );
}

export default FormBolsinha;
