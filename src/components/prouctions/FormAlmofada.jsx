import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Card, Spinner } from 'react-bootstrap';
import ImageDropZone from '../ImageDropZone';
import InputValorReal from '../InputValorMoeda';
import AreaCalculatorLinhaUnica from '../AreaCalculator';
import ValidationModal from '../ValidationModal';
import { useVendedoresDesigners } from '../../hooks/useVendedoresDesigners';
import { getAllTecidos } from '../../services/api';
import CustomRadio from '../CustomRadio';
import useCustomAlert from '../../hooks/useCustomAlert';
import CustomAlertModal from '../CustomAlertModal';

function FormAlmofada({ onAdicionarItem }) {
  const { vendedores, designers, loading, error } = useVendedoresDesigners();

  const [formData, setFormData] = useState({
    descricao: '',
    largura: '',
    altura: '',
    area: '',
    quantidade: '1',
    tecido: '',
    legenda: '',
    vendedor: '',
    designer: '',
    enchimento: 'com', // com | sem
    observacao: '',
    valorAlmofada: '',
    valorAdicionais: '',
  });

  const [imagem, setImagem] = useState(null);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [tecidos, setTecidos] = useState([]);
  const [tecidosLoading, setTecidosLoading] = useState(true);
  const [tecidosError, setTecidosError] = useState(null);
  const customAlert = useCustomAlert();

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'number' ? String(value) : value }));
  };

  const handleAreaChange = (areaData) => {
    setFormData((prev) => ({
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

  useEffect(() => {
    if (error) {
      customAlert.showWarning('Atenção', `${error}. Os campos de vendedor e designer podem não estar disponíveis.`);
    }
  }, [error]);

  useEffect(() => {
    if (tecidosError) {
      customAlert.showWarning('Atenção', tecidosError);
    }
  }, [tecidosError]);

  const resetForm = () => {
    setFormData({
      descricao: '',
      largura: '',
      altura: '',
      area: '',
      quantidade: '1',
      tecido: '',
      legenda: '',
      vendedor: '',
      designer: '',
      enchimento: 'com',
      observacao: '',
      valorAlmofada: '',
      valorAdicionais: '',
    });
    setImagem(null);
  };

  const parseBR = (v) => {
    if (!v) return 0;
    if (typeof v === 'number') return v;
    const normalized = String(v).replace(/\./g, '').replace(',', '.');
    const num = parseFloat(normalized);
    return isNaN(num) ? 0 : num;
  };

  const validarCampos = () => {
    const erros = [];
    if (!formData.descricao?.trim()) erros.push('Descrição');
    if (!formData.largura?.trim()) erros.push('Largura');
    if (!formData.altura?.trim()) erros.push('Altura');
    if (!formData.quantidade?.trim()) erros.push('Quantidade');
    if (!formData.tecido?.trim()) erros.push('Tecido');
    if (!formData.valorAlmofada?.trim()) erros.push('Valor da Almofada');

    if (formData.largura && (isNaN(parseFloat(formData.largura.replace(',', '.'))) || parseFloat(formData.largura.replace(',', '.')) <= 0)) {
      erros.push('Largura deve ser um número maior que zero');
    }
    if (formData.altura && (isNaN(parseFloat(formData.altura.replace(',', '.'))) || parseFloat(formData.altura.replace(',', '.')) <= 0)) {
      erros.push('Altura deve ser um número maior que zero');
    }
    if (formData.quantidade && (isNaN(parseInt(formData.quantidade)) || parseInt(formData.quantidade) <= 0)) {
      erros.push('Quantidade deve ser um número inteiro maior que zero');
    }
    if (formData.valorAlmofada && parseBR(formData.valorAlmofada) <= 0) {
      erros.push('Valor da Almofada deve ser maior que zero');
    }
    if (formData.valorAdicionais && parseBR(formData.valorAdicionais) < 0) {
      erros.push('Valores adicionais não podem ser negativos');
    }
    return erros;
  };

  const salvar = (e) => {
    e.preventDefault();
    const erros = validarCampos();
    if (erros.length > 0) {
      setValidationErrors(erros);
      setShowValidationModal(true);
      return;
    }

    const valorBase = parseBR(formData.valorAlmofada);
    const valorExtra = parseBR(formData.valorAdicionais);
    const valorTotal = (valorBase + valorExtra).toFixed(2).replace('.', ',');

    const item = {
      tipoProducao: 'almofada',
      tipo: 'almofada',
      descricao: formData.descricao,
      largura: formData.largura,
      altura: formData.altura,
      area: formData.area,
      quantidade: formData.quantidade,
      tecido: formData.tecido,
      legenda: formData.legenda,
      vendedor: formData.vendedor,
      designer: formData.designer,
      enchimento: formData.enchimento, // com | sem
      observacao: formData.observacao,
      valorAlmofada: formData.valorAlmofada,
      valorAdicionais: formData.valorAdicionais,
      valor: valorTotal,
      imagem: imagem,
    };

    setIsSuccess(true);
    onAdicionarItem && onAdicionarItem(item);

    setTimeout(() => setIsSuccess(false), 3000);
  };

  const totalPreview = (() => {
    const base = parseBR(formData.valorAlmofada);
    const extra = parseBR(formData.valorAdicionais);
    if (!base && !extra) return '';
    const total = (base + extra).toFixed(2).replace('.', ',');
    return `Prévia do total: R$ ${total}`;
  })();

  return (
    <Form className={`${isSuccess ? 'form-success form-success-animation' : ''} form-compact`}>
      

      <Row className="mb-3">
        <Col md={8}>
          <div className="form-group mb-3">
            <label className="form-label">Descrição</label>
            <Form.Control
              type="text"
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              placeholder="Ex.: Almofada decorativa 40×40"
              className="form-control"
            />
          </div>
        </Col>
        <Col md={4}>
          <AreaCalculatorLinhaUnica formData={formData} onChange={handleAreaChange} />
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={3}>
          <div className="form-group mb-3">
            <label className="form-label">Quantidade</label>
            <Form.Control
              type="number"
              min="1"
              name="quantidade"
              value={formData.quantidade}
              onChange={handleChange}
              className="form-control"
            />
          </div>
        </Col>
        <Col md={9}>
          <div className="form-group mb-3">
            <label className="form-label">Tecido</label>
            {tecidosLoading ? (
              <div className="d-flex align-items-center"><Spinner size="sm" className="me-2" />Carregando tecidos...</div>
            ) : tecidosError ? (
              <div className="form-text text-warning">{tecidosError}</div>
            ) : (
              <Form.Select name="tecido" value={formData.tecido} onChange={handleChange} className="form-control">
                <option value="">Selecione o tecido</option>
                {tecidos.map((t) => (
                  <option key={t.id} value={t.name}>{t.name}</option>
                ))}
              </Form.Select>
            )}
          </div>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={6}>
          <div className="form-group mb-3">
            <label className="form-label d-block">Acabamentos</label>
            <div className="form-check mb-2">
              <CustomRadio
                id="almofada-ench-com"
                label="Com enchimento"
                name="enchimento"
                value="com"
                checked={formData.enchimento === 'com'}
                onChange={handleChange}
              />
            </div>
            <div className="form-check mb-2">
              <CustomRadio
                id="almofada-ench-sem"
                label="Sem enchimento"
                name="enchimento"
                value="sem"
                checked={formData.enchimento === 'sem'}
                onChange={handleChange}
              />
            </div>
            <Row className="mt-2">
              <Col md={6}>
                <div className="form-group mb-2">
                  <label className="form-label">Vendedor</label>
                  {loading ? (
                    <div className="d-flex align-items-center"><Spinner size="sm" className="me-2" />Carregando...</div>
                  ) : (
                    <Form.Select name="vendedor" value={formData.vendedor} onChange={handleChange} className="form-control">
                      <option value="">Selecione</option>
                      {vendedores.map((v) => (
                        <option key={v.id} value={v.name}>{v.name}</option>
                      ))}
                    </Form.Select>
                  )}
                </div>
              </Col>
              <Col md={6}>
                <div className="form-group mb-2">
                  <label className="form-label">Designer</label>
                  {loading ? (
                    <div className="d-flex align-items-center"><Spinner size="sm" className="me-2" />Carregando...</div>
                  ) : (
                    <Form.Select name="designer" value={formData.designer} onChange={handleChange} className="form-control">
                      <option value="">Selecione</option>
                      {designers.map((d) => (
                        <option key={d.id} value={d.name}>{d.name}</option>
                      ))}
                    </Form.Select>
                  )}
                </div>
              </Col>
            </Row>
          </div>
        </Col>
        <Col md={6}>
          <ImageDropZone onImageChange={setImagem} />
          <div className="form-group mt-2">
            <label className="form-label">Legenda da Imagem</label>
            <Form.Control
              type="text"
              name="legenda"
              value={formData.legenda}
              onChange={handleChange}
              placeholder="Ex.: Frente da almofada"
              className="form-control"
            />
          </div>
        </Col>
      </Row>

      <Row className="align-items-end mb-3">
        <Col md={6}>
          <InputValorReal
            name="valorAlmofada"
            label="Valor da Almofada"
            value={formData.valorAlmofada}
            onChange={handleChange}
            required
          />
        </Col>
        <Col md={6}>
          <div className="form-group mb-2">
            <label className="form-label">Valores adicionais (opcional)</label>
            <Form.Control
              type="text"
              name="valorAdicionais"
              value={formData.valorAdicionais}
              onChange={handleChange}
              placeholder="Ex.: 10,00"
              className="form-control"
            />
          </div>
        </Col>
      </Row>
      {totalPreview && (
        <div className="text-muted mt-1 mb-2" style={{ fontSize: '0.9rem' }}>{totalPreview}</div>
      )}
      <div className="d-flex justify-content-end gap-2 mb-3">
        <Button variant="danger" type="button" onClick={resetForm} className="btn btn-error">Limpar</Button>
        <Button variant="success" type="button" onClick={salvar} className="btn btn-success">Salvar</Button>
      </div>

      <Row className="mb-3">
        <Col>
          <div className="form-group">
            <label className="form-label">Observações</label>
            <Form.Control
              as="textarea"
              rows={2}
              name="observacao"
              value={formData.observacao}
              onChange={handleChange}
              className="form-control form-textarea"
              placeholder="Observações adicionais..."
            />
          </div>
        </Col>
      </Row>

      <ValidationModal
        show={showValidationModal}
        onHide={() => setShowValidationModal(false)}
        errors={validationErrors}
        title="Validação do Formulário - Almofada"
      />
      <CustomAlertModal
        isOpen={customAlert.alertState.isOpen}
        onClose={customAlert.hideAlert}
        type={customAlert.alertState.type}
        title={customAlert.alertState.title}
        message={customAlert.alertState.message}
        confirmText={customAlert.alertState.confirmText}
        onConfirm={customAlert.alertState.onConfirm}
        showCancel={customAlert.alertState.showCancel}
        cancelText={customAlert.alertState.cancelText}
      />
    </Form>
  );
}

export default FormAlmofada;


