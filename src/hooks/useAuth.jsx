import { useState, useEffect, createContext, useContext } from 'react';

// Contexto de autenticação
const AuthContext = createContext();

// Hook personalizado para usar o contexto de autenticação
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

// Provider do contexto de autenticação
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verificar se há usuário logado no localStorage
  useEffect(() => {
    const checkAuth = () => {
      try {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          setUser(userData);
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Função de login
  const login = async (credentials) => {
    try {
      setLoading(true);
      
      // Simular API call - substitua pela sua implementação real
      const response = await mockLoginAPI(credentials);
      
      if (response.success) {
        const userData = {
          id: response.user.id,
          nome: response.user.nome,
          email: response.user.email,
          role: response.user.role,
          token: response.token
        };
        
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        
        return { success: true, user: userData };
      } else {
        return { success: false, error: response.error };
      }
    } catch (error) {
      console.error('Erro no login:', error);
      return { success: false, error: 'Erro interno do sistema' };
    } finally {
      setLoading(false);
    }
  };

  // Função de logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    // Redirecionar para login se necessário
  };

  // Função para atualizar dados do usuário
  const updateUser = (newData) => {
    const updatedUser = { ...user, ...newData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // Função para verificar se o usuário tem permissão
  const hasPermission = (permission) => {
    if (!user) return false;
    
    // Implementar lógica de permissões baseada no role
    const rolePermissions = {
      admin: ['read', 'write', 'delete', 'admin'],
      manager: ['read', 'write'],
      user: ['read']
    };
    
    return rolePermissions[user.role]?.includes(permission) || false;
  };

  // Função para verificar se o usuário tem role específico
  const hasRole = (role) => {
    return user?.role === role;
  };

  // Mock da API de login - substitua pela implementação real
  const mockLoginAPI = async (credentials) => {
    // Simular delay da API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Validação simples
    if (credentials.email === 'admin@sgp.com' && credentials.senha === 'admin123') {
      return {
        success: true,
        user: {
          id: 1,
          nome: 'Administrador',
          email: 'admin@sgp.com',
          role: 'admin'
        },
        token: 'mock-jwt-token-123'
      };
    } else if (credentials.email === 'user@sgp.com' && credentials.senha === 'user123') {
      return {
        success: true,
        user: {
          id: 2,
          nome: 'Usuário Padrão',
          email: 'user@sgp.com',
          role: 'user'
        },
        token: 'mock-jwt-token-456'
      };
    } else {
      return {
        success: false,
        error: 'Credenciais inválidas'
      };
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    updateUser,
    hasPermission,
    hasRole,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Exportação padrão para compatibilidade
export default useAuth;
