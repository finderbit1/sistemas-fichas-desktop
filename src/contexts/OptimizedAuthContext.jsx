import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const OptimizedAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Função de logout memoizada
  const logout = useCallback(() => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  // Verificar se há usuário logado ao carregar a aplicação
  useEffect(() => {
    const checkAuth = () => {
      try {
        const savedUser = localStorage.getItem('user');
        const savedToken = localStorage.getItem('token');
        
        if (savedUser && savedToken) {
          const userData = JSON.parse(savedUser);
          setUser(userData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [logout]);

  // Função de login memoizada
  const login = useCallback(async (credentials) => {
    try {
      setLoading(true);
      
      // Simular chamada de API (substitua pela sua API real)
      const response = await mockLoginAPI(credentials.email, credentials.senha);
      
      if (response.success) {
        const userData = response.user;
        
        // Salvar dados do usuário e token
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', response.token);
        
        setUser(userData);
        setIsAuthenticated(true);
        
        return { success: true, message: 'Login realizado com sucesso!' };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Erro no login:', error);
      return { 
        success: false, 
        message: 'Erro interno. Tente novamente.' 
      };
    } finally {
      setLoading(false);
    }
  }, []);

  // Verificar se o usuário é admin - memoizado
  const isAdmin = useMemo(() => {
    return user && user.role === 'admin';
  }, [user?.role]);

  // Verificar se o usuário tem permissão específica - memoizado
  const hasPermission = useCallback((permission) => {
    if (!user) return false;
    
    // Admin tem todas as permissões
    if (user.role === 'admin') return true;
    
    // Verificar permissões específicas do usuário
    return user.permissions && user.permissions.includes(permission);
  }, [user]);

  // Verificar se o usuário tem role específico - memoizado
  const hasRole = useCallback((role) => {
    return user?.role === role;
  }, [user?.role]);

  // Atualizar dados do usuário - memoizado
  const updateUser = useCallback((newData) => {
    const updatedUser = { ...user, ...newData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  }, [user]);

  // Mock da API de login (substitua pela sua API real)
  const mockLoginAPI = async (email, password) => {
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Usuários de teste
    const users = {
      'admin@admin.com': {
        id: 1,
        name: 'Administrador',
        email: 'admin@admin.com',
        role: 'admin',
        permissions: ['admin', 'create', 'read', 'update', 'delete'],
        avatar: '👨‍💼'
      },
      'user@user.com': {
        id: 2,
        name: 'Usuário Comum',
        email: 'user@user.com',
        role: 'user',
        permissions: ['create', 'read'],
        avatar: '👤'
      },
      'manager@manager.com': {
        id: 3,
        name: 'Gerente',
        email: 'manager@manager.com',
        role: 'manager',
        permissions: ['create', 'read', 'update'],
        avatar: '👔'
      }
    };
    
    const user = users[email];
    
    if (user && password === '123456') {
      return {
        success: true,
        user,
        token: `token_${user.id}_${Date.now()}`,
        message: 'Login realizado com sucesso!'
      };
    } else {
      return {
        success: false,
        message: 'Email ou senha incorretos!'
      };
    }
  };

  // Valor do contexto memoizado para evitar re-renders desnecessários
  const value = useMemo(() => ({
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    isAdmin,
    hasPermission,
    hasRole,
    updateUser
  }), [user, isAuthenticated, loading, login, logout, isAdmin, hasPermission, hasRole, updateUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
