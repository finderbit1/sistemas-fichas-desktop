import React from 'react';

const mockData = [
    {
        title: 'A Fazer',
        cards: ['Criar layout', 'Instalar dependências', 'Configurar rotas']
    },
    {
        title: 'Em Progresso',
        cards: ['Desenvolver componente Trello', 'Estilizar colunas']
    },
    {
        title: 'Concluído',
        cards: ['Criar repositório Git', 'Configurar Tauri']
    }
];

const TrelloSim = () => {
    return (
        <div className="container-fluid bg-light py-4" style={{ minHeight: '100vh' }}>
            <div className="row flex-nowrap overflow-auto">
                {mockData.map((list, idx) => (
                    <div className="col-12 col-sm-6 col-md-4 col-lg-3 mb-3" key={idx}>
                        <div className="bg-secondary bg-opacity-10 rounded p-3 h-100">
                            <h5 className="fw-bold mb-3">{list.title}</h5>
                            <div className="d-flex flex-column gap-2">
                                {list.cards.map((card, i) => (
                                    <div className="card shadow-sm" key={i}>
                                        <div className="card-body p-2">
                                            <p className="mb-0">{card}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TrelloSim;
