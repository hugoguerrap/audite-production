import React from "react";
import { Link } from "react-router-dom";

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showSlogan?: boolean;
  className?: string;
}

const Header: React.FC<HeaderProps> = ({ 
  title, 
  subtitle, 
  showSlogan = false, 
  className = "" 
}) => {
  return (
    <header className={`section-padding bg-card border-b border-border ${className}`}>
      <div className="max-w-7xl mx-auto">
        {/* Logo y Navegación */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/dashboard" className="logo-container">
            <img 
              src="/logo primary@2x.png" 
              alt="AuditE - Conecta. Ahorra. Transforma." 
              className="logo-primary"
            />
          </Link>
        </div>

        {/* Título y Subtítulo */}
        {title && (
          <div className="text-center mb-6">
            <h1 className="text-3xl md:text-4xl font-brand font-bold text-audite-dark mb-2 animate-fade-in">
              {title}
            </h1>
            {subtitle && (
              <p className="text-lg text-audite-secondary font-body animate-fade-in">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Slogan */}
        {showSlogan && (
          <div className="text-center section-spacing">
            <h2 className="slogan animate-pulse-soft">
              Conecta. Ahorra. Transforma.
            </h2>
            <p className="text-audite-secondary font-body mt-2 max-w-2xl mx-auto">
              Optimiza el consumo energético de tu empresa con nuestras auditorías especializadas 
              y recomendaciones personalizadas para un futuro más sostenible.
            </p>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 