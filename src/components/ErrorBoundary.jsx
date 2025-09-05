import React from 'react';
import { Alert, Button } from 'react-bootstrap';
import { ExclamationTriangle, ArrowClockwise } from 'react-bootstrap-icons';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Atualiza o state para mostrar a UI de erro
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log do erro
    console.error('ErrorBoundary capturou um erro:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleReload = () => {
    // Recarrega a página
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <div className="text-center">
            <Alert variant="danger" className="mb-4">
              <Alert.Heading className="d-flex align-items-center justify-content-center">
                <ExclamationTriangle size={24} className="me-2" />
                Oops! Algo deu errado
              </Alert.Heading>
              <p>
                Ocorreu um erro inesperado. Por favor, tente recarregar a página.
              </p>
              <div className="mt-3">
                <Button 
                  variant="outline-danger" 
                  onClick={this.handleReload}
                  className="d-flex align-items-center mx-auto"
                >
                  <ArrowClockwise size={16} className="me-2" />
                  Recarregar Página
                </Button>
              </div>
            </Alert>
            
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-3">
                <summary>Detalhes do erro (modo desenvolvimento)</summary>
                <pre className="mt-2 text-start" style={{ fontSize: 'var(--font-size-xs)' }}>
                  {this.state.error && this.state.error.toString()}
                  <br />
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
