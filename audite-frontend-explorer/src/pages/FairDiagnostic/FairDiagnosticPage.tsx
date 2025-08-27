import React from "react";
import EnergyDiagnostic from "./EnergyDiagnostic";
import { BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

const FairDiagnosticPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto py-4 px-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <BarChart3 className="text-primary" size={24} />
            <span className="font-bold text-xl">Audite</span>
          </Link>
          
          <nav>
            <ul className="flex items-center gap-6">
              <li>
                <Link 
                  to="/" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Inicio
                </Link>
              </li>
              <li>
                <Link 
                  to="/contacto" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Contacto
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <EnergyDiagnostic />
      </main>

      {/* Footer */}
      <footer className="border-t py-6 bg-card/50">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Audite. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default FairDiagnosticPage; 