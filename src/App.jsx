import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import HomePage from './pages/HomePage';
import CreateClient from './pages/CreateClient';
import CreateOrderPage from './pages/CreateOrderPage';
import RelatorioPedidos from './pages/RelatorioPedidos'
import TrelloSim from './pages/TreeloPage';
// import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  return (
    <Router>
      <div className="app-container">
        <Sidebar expanded={sidebarExpanded} toggleSidebar={toggleSidebar} />
        <div className={`main-content ${sidebarExpanded ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
          <div className="content-area">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/orders" element={<CreateOrderPage />} />
              <Route path="/clientes" element={<CreateClient />} />
              <Route path="/treelo-designer" element={<TrelloSim />} />

              <Route path="/relatorio" element={<RelatorioPedidos />} />

            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;