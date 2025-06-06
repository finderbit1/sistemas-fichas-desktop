import React from 'react';

const MainContent = ({ sidebarExpanded }) => {
  return (
    <div className={`main-content ${sidebarExpanded ? 'sidebar-expanded' : 'sidebar-collapsed'}`}>
      <header className="main-header">
        <h1>Sgp - FibderBit</h1>
        <div className="user-controls">
          {/* <span className="user-name">Usuário</span> */}
          <i className="bi bi-person-circle"></i>
        </div>
      </header>
      <div className="content-area">
        <h2>Conteúdo Principal</h2>
        <p>Esta é a área de conteúdo principal do seu aplicativo.</p>
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">Exemplo de Card</h5>
            <p className="card-text">Este é um exemplo de como você pode estruturar o conteúdo usando Bootstrap.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainContent;