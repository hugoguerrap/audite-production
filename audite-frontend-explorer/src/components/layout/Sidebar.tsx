import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  BarChart3, 
  ClipboardList, 
  Home, 
  Info, 
  Leaf, 
  LogOut, 
  Menu, 
  Settings, 
  X 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Sidebar = () => {
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navItems = [
    { path: "/dashboard", name: "Dashboard", icon: <Home size={20} /> },
    { path: "/auditoria-basica", name: "Auditorías Básicas", icon: <ClipboardList size={20} /> },
    { path: "/auditoria-agro", name: "Auditorías Agrícolas", icon: <Leaf size={20} /> },
    { path: "/admin", name: "Administración", icon: <Settings size={20} /> },
  ];

  return (
    <aside className={cn(isCollapsed ? "sidebar-collapsed" : "sidebar", "transition-all duration-300")}>
      <div className="h-full flex flex-col">
        {/* Header con Logo */}
        <div className="section-padding border-b border-border flex items-center justify-between">
          {!isCollapsed && (
            <Link to="/dashboard" className="logo-container">
              <img 
                src="/logo primary@2x.png" 
                alt="AuditE - Conecta. Ahorra. Transforma." 
                className="logo-primary"
              />
            </Link>
          )}
          
          {isCollapsed && (
            <Link to="/dashboard" className="flex items-center justify-center w-full">
              <img 
                src="/logo primary@2x.png" 
                alt="AuditE" 
                className="logo-mobile"
              />
            </Link>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto hover:bg-audite-accent-medium/20 text-audite-dark"
            onClick={toggleSidebar}
          >
            {isCollapsed ? <Menu size={20} /> : <X size={20} />}
          </Button>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 py-6">
          <ul className="space-y-2 px-3">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-brand font-medium",
                    location.pathname === item.path
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "hover:bg-audite-accent-soft text-audite-dark hover:text-audite-dark"
                  )}
                >
                  <span className={cn(
                    "flex-shrink-0",
                    location.pathname === item.path ? "text-primary-foreground" : "text-audite-secondary"
                  )}>
                    {item.icon}
                  </span>
                  {!isCollapsed && <span className="animate-slide-in-right">{item.name}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        
        {/* Footer con Slogan */}
        {!isCollapsed && (
          <div className="px-4 py-2 border-t border-border/50">
            <p className="text-xs text-audite-secondary font-brand font-medium text-center">
              Conecta. Ahorra. Transforma.
            </p>
          </div>
        )}
        
        {/* Botón de Cerrar Sesión */}
        <div className="section-padding border-t border-border">
          <Button
            variant="ghost"
            className={cn(
              "w-full flex items-center gap-3 text-audite-dark hover:bg-destructive/10 hover:text-destructive font-brand font-medium",
              isCollapsed ? "justify-center px-2" : "justify-start px-4"
            )}
            onClick={handleLogout}
          >
            <LogOut size={20} />
            {!isCollapsed && <span className="animate-slide-in-right">Cerrar sesión</span>}
          </Button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
