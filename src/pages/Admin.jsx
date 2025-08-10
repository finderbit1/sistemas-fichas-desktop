// import React, { useState } from 'react';
// import { Card, Button, Modal, Form, Row, Col, Container } from 'react-bootstrap';
// import { MdAdminPanelSettings, MdPerson, MdBrush, MdAttachMoney, MdLocalShipping, MdAssignment } from 'react-icons/md';

// const AdminPage = () => {
//   const [showModal, setShowModal] = useState(false);
//   const [modalTitle, setModalTitle] = useState('');
//   const [formContent, setFormContent] = useState(null);

//   const handleShowModal = (title, form) => {
//     setModalTitle(title);
//     setFormContent(form);
//     setShowModal(true);
//   };

//   const handleCloseModal = () => {
//     setShowModal(false);
//     setFormContent(null);
//   };

//   const renderForm = (type) => {
//     return (
//       <Form>
//         <Form.Group className="mb-3">
//           <Form.Label>Nome</Form.Label>
//           <Form.Control type="text" placeholder={`Digite o nome do(a) ${type}`} />
//         </Form.Group>
//         <Button variant="success" onClick={() => alert(`${type} cadastrado!`)}>
//           Salvar
//         </Button>
//       </Form>
//     );
//   };

//   const sections = [
//     {
//       title: 'Vendedores',
//       icon: <MdPerson size={32} />, 
//       formType: 'vendedor'
//     },
//     {
//       title: 'Designers',
//       icon: <MdBrush size={32} />, 
//       formType: 'designer'
//     },
//     {
//       title: 'Formas de Pagamento',
//       icon: <MdAttachMoney size={32} />, 
//       formType: 'forma de pagamento'
//     },
//     {
//       title: 'Transportadoras',
//       icon: <MdLocalShipping size={32} />, 
//       formType: 'transportadora'
//     },
//     {
//       title: 'Descontos por Metro',
//       icon: <MdAttachMoney size={32} />, 
//       formType: 'desconto'
//     },
//     {
//       title: 'Tipos de Produção',
//       icon: <MdAssignment size={32} />, 
//       formType: 'tipo de produção'
//     }
//   ];

//   return (
//     <Container className="mt-4">
//       <Row>
        
//         {/* {sections.map((section, idx) => (
//           <Col key={idx} md={4} className="mb-4">
//             <Card className="shadow-sm text-center p-3">
//               <div className="mb-2">{section.icon}</div>
//               <h5>{section.title}</h5>
//               <Button
//                 variant="primary"
//                 size="sm"
//                 onClick={() => handleShowModal(`Cadastrar ${section.title}`, renderForm(section.formType))}
//               >
//                 Cadastrar
//               </Button>
//             </Card>
//           </Col>
//         ))} */}
      
//       </Row>

//       <Modal show={showModal} onHide={handleCloseModal} centered>
//         <Modal.Header closeButton>
//           <Modal.Title>{modalTitle}</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>{formContent}</Modal.Body>
//       </Modal>
//     </Container>
//   );
// };

// export default AdminPage;

import { useState } from "react";
import { Container, Row, Col, Nav, Tab, Button, Table } from "react-bootstrap";

const categorias = [
  { key: "vendedores", label: "Vendedores" },
  { key: "designers", label: "Designers" },
  { key: "precos", label: "Preços Padrões" },
  { key: "descontos", label: "Descontos" },
  { key: "transportadoras", label: "Transportadoras" }
];

export default function AdminPage() {
  const [activeKey, setActiveKey] = useState("designers");

  const renderTabela = (tipo) => (
    <>
      <div className="d-flex justify-content-between mb-3">
        <h4 className="text-capitalize">{tipo}</h4>
        <Button variant="success">+ Adicionar</Button>
      </div>
      <Table bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>Exemplo {tipo}</td>
            <td>
              <Button size="sm" variant="warning" className="me-2">Editar</Button>
              <Button size="sm" variant="danger">Excluir</Button>
            </td>
          </tr>
        </tbody>
      </Table>
    </>
  );

  return (
    <Container fluid>
      <Row>
        {/* Sidebar */}
        <Col md={2} className="bg-dark text-white p-3 min-vh-100">
          <h5 className="mb-4">Painel Admin</h5>
          <Nav variant="pills" className="flex-column" activeKey={activeKey} onSelect={setActiveKey}>
            {categorias.map((c) => (
              <Nav.Link eventKey={c.key} key={c.key}>{c.label}</Nav.Link>
            ))}
            <hr />
            <Button variant="outline-light" className="mt-2 w-100">Exportar Relatórios</Button>
          </Nav>
        </Col>

        {/* Conteúdo principal */}
        <Col md={10} className="p-4">
          <Tab.Container activeKey={activeKey}>
            <Tab.Content>
              {categorias.map((c) => (
                <Tab.Pane eventKey={c.key} key={c.key}>
                  {renderTabela(c.label)}
                </Tab.Pane>
              ))}
            </Tab.Content>
          </Tab.Container>
        </Col>
      </Row>
    </Container>
  );
}
