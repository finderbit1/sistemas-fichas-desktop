import React, { useState } from 'react';
import { 
  Person, 
  BoxArrowRight, 
  Gear, 
  ChevronDown,
  ShieldCheck
} from 'react-bootstrap-icons';
import { Dropdown, Button } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';

const UserProfile = ({ expanded, onToggleProfile }) => {
  const { user, logout, isAdmin } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    setShowDropdown(false);
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  if (!expanded) {
    // Versão colapsada - apenas avatar com tooltip
    return (
      <div className="user-profile-collapsed">
        <div className="user-avatar" onClick={toggleDropdown}>
          <Person size={20} />
          {isAdmin() && (
            <div className="admin-badge">
              <ShieldCheck size={12} />
            </div>
          )}
        </div>
        
        {showDropdown && (
          <div className="user-dropdown-collapsed">
            <div className="user-info-dropdown">
              <div className="user-name">{user?.name}</div>
              <div className="user-role">{user?.role}</div>
            </div>
            <div className="dropdown-divider"></div>
            <button 
              className="dropdown-item"
              onClick={handleLogout}
            >
              <BoxArrowRight size={14} />
              Sair
            </button>
          </div>
        )}
      </div>
    );
  }

  // Versão expandida
  return (
    <div className="user-profile-expanded">
      <div className="user-info" onClick={toggleDropdown}>
        <div className="user-avatar-large">
          <Person size={24} />
          {isAdmin() && (
            <div className="admin-badge-large">
              <ShieldCheck size={14} />
            </div>
          )}
        </div>
        <div className="user-details">
          <div className="user-name">{user?.name}</div>
          <div className="user-role">{user?.role}</div>
        </div>
        <ChevronDown 
          size={16} 
          className={`dropdown-chevron ${showDropdown ? 'rotated' : ''}`}
        />
      </div>

      {showDropdown && (
        <div className="user-dropdown-expanded">
          <div className="dropdown-item">
            <Person size={14} />
            <span>Meu Perfil</span>
          </div>
          {isAdmin() && (
            <div className="dropdown-item">
              <Gear size={14} />
              <span>Configurações</span>
            </div>
          )}
          <div className="dropdown-divider"></div>
          <button 
            className="dropdown-item logout-item"
            onClick={handleLogout}
          >
            <BoxArrowRight size={14} />
            <span>Sair</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
