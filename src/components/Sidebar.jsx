import React from 'react';
import { Link } from 'react-router-dom';
import { Nav } from 'react-bootstrap';
import {
  HouseDoorFill,
  ClipboardData,
  PeopleFill,
  FileTextFill,
  BrushFill,
  ChevronDoubleLeft,
  ChevronDoubleRight
} from 'react-bootstrap-icons';

const Sidebar = ({ expanded, toggleSidebar }) => {
  return (
    <div className={`sidebar bg-dark text-white vh-100 ${expanded ? 'expanded px-3' : 'collapsed px-2'}`} style={{ width: expanded ? '220px' : '60px', transition: 'width 0.3s' }}>
      <div className="sidebar-header d-flex align-items-center justify-content-between py-3 border-bottom">
        <h5 className="mb-0">{expanded ? 'Painel' : ''}</h5>
        <button className="btn btn-sm btn-outline-light" onClick={toggleSidebar}>
          {expanded ? <ChevronDoubleLeft /> : <ChevronDoubleRight />}
        </button>
      </div>
      <Nav className="flex-column mt-3">
        <Nav.Item className="mb-2">
          <Link to="/" className="nav-link d-flex align-items-center text-white">
            <HouseDoorFill />
            {expanded && <span className="ms-2">Início</span>}
          </Link>
        </Nav.Item>
        <Nav.Item className="mb-2">
          <Link to="/orders" className="nav-link d-flex align-items-center text-white">
            <ClipboardData />
            {expanded && <span className="ms-2">Pedidos</span>}
          </Link>
        </Nav.Item>
        <Nav.Item className="mb-2">
          <Link to="/clientes" className="nav-link d-flex align-items-center text-white">
            <PeopleFill />
            {expanded && <span className="ms-2">Cadastro</span>}
          </Link>
        </Nav.Item>
        <Nav.Item className="mb-2">
          <Link to="/relatorio" className="nav-link d-flex align-items-center text-white">
            <FileTextFill />
            {expanded && <span className="ms-2">Relatórios</span>}
          </Link>
        </Nav.Item>
        <Nav.Item className="mb-2">
          <Link to="/admin" className="nav-link d-flex align-items-center text-white">
            <FileTextFill />
            {expanded && <span className="ms-2">Admin</span>}
          </Link>
        </Nav.Item>
      </Nav>
    </div>
  );
};

export default Sidebar;
