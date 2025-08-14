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

import Nav from 'react-bootstrap/Nav';



function AdminPage() {
  return (
    <Nav variant="tabs" defaultActiveKey="/home">
      <Nav.Item>
        <Nav.Link href="/home">Cadatros</Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link eventKey="link-1">Option 2</Nav.Link>
      </Nav.Item>
      <Nav.Item>
        <Nav.Link eventKey="disabled" disabled>
          Disabled
        </Nav.Link>
      </Nav.Item>
    </Nav>
  );
}

export default AdminPage;