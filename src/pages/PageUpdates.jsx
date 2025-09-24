/**
 * Página de Atualizações
 * Página dedicada ao sistema de atualização automática
 */

import React from 'react';
import { Container } from 'react-bootstrap';
import UpdateSystem from '../components/UpdateSystem';

const PageUpdates = () => {
  return (
    <Container fluid className="page-updates">
      <UpdateSystem />
    </Container>
  );
};

export default PageUpdates;
