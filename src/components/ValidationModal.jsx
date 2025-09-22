import React from 'react';
import { Modal, Button, Alert, ListGroup } from 'react-bootstrap';
import { ExclamationTriangle, XCircle, CheckCircle } from 'react-bootstrap-icons';

function ValidationModal({ show, onHide, errors, title = "Campos Obrigatórios" }) {
  return (
    <Modal show={show} onHide={onHide} centered size="md">
      <Modal.Header closeButton className="bg-warning text-dark">
        <Modal.Title className="d-flex align-items-center">
          <ExclamationTriangle size={20} className="me-2" />
          {title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Alert variant="warning" className="mb-3">
          <strong>Por favor, preencha os seguintes campos obrigatórios:</strong>
        </Alert>
        
        <ListGroup variant="flush">
          {errors.map((error, index) => (
            <ListGroup.Item 
              key={index} 
              className="d-flex align-items-center py-2 border-0"
              style={{ backgroundColor: 'var(--color-warning-50)' }}
            >
              <XCircle size={16} className="text-danger me-2" />
              <span className="text-dark">{error}</span>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Modal.Body>
      <Modal.Footer>
        <Button 
          variant="primary" 
          onClick={onHide}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <CheckCircle size={16} />
          Entendi
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ValidationModal;













