import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import BrandButton from "@/components/ui/BrandButton";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Activity, Info, Users, Zap, Leaf, LineChart, CheckCircle, FileText, TrendingUp } from "lucide-react";

const Home = () => {

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header Simplificado - Sin Logo */}
      <header className="py-4 px-4 bg-card border-b border-border">
        <div className="container mx-auto">
          {/* Header limpio sin elementos */}
        </div>
      </header>

      {/* Hero Section con Logo Principal */}
      <section className="py-20 px-4 bg-gradient-to-br from-audite-light via-audite-accent-soft to-audite-accent-medium relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-audite-light/80 to-transparent z-10"></div>
        <div className="container mx-auto text-center relative z-20">
          <div className="max-w-4xl mx-auto">
            {/* Logo Principal en el Banner */}
            <div className="mb-8">
              <img 
                src="/logo primary@2x.png" 
                alt="AuditE - Conecta. Ahorra. Transforma." 
                className="mx-auto mb-6"
                style={{ maxWidth: '300px', height: 'auto' }}
              />
              <div className="slogan text-2xl md:text-3xl mb-6 animate-slide-in-right">
                Conecta. Ahorra. Transforma.
              </div>
            </div>
            
            <h2 className="text-3xl md:text-5xl font-brand font-semibold text-audite-dark mb-6 animate-fade-in">
              Auditorías Energéticas Inteligentes
            </h2>
            
            <p className="text-xl md:text-2xl text-audite-secondary max-w-3xl mx-auto mb-8 font-body leading-relaxed animate-fade-in">
              Optimiza el consumo energético de tu empresa o explotación agrícola. 
              <span className="font-brand font-semibold text-audite-dark"> Reduce costes, cumple normativas y mejora tu impacto ambiental</span> con nuestra plataforma especializada.
            </p>
            
            {/* CTA Principal - Solo Autodiagnóstico */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in">
              <BrandButton size="lg" asChild variant="primary" className="text-lg px-8 py-4">
                <Link to="/diagnostico">
                  <Zap className="mr-3 h-6 w-6" /> 
                  Realizar Autodiagnóstico
                </Link>
              </BrandButton>
            </div>
            
            <p className="text-audite-secondary font-body max-w-md mx-auto">
              Cuestionario rápido para recibir recomendaciones energéticas personalizadas
            </p>
          </div>
        </div>
        
        {/* Elementos decorativos */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-primary/10 rounded-full animate-pulse-soft"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-audite-secondary/10 rounded-full animate-pulse-soft"></div>
      </section>

      {/* Cómo Funciona */}
      <section className="py-20 px-4 bg-card">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-brand font-bold text-audite-dark mb-4">
              ¿Cómo Funciona AuditE?
            </h2>
            <p className="text-xl text-audite-secondary font-body max-w-2xl mx-auto">
              Tres simples pasos para optimizar tu eficiencia energética
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="bg-gradient-to-br from-primary to-audite-secondary p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-2xl font-brand font-semibold text-audite-dark mb-4">
                1. Introduce tus Datos
              </h3>
              <p className="text-audite-secondary font-body leading-relaxed">
                Sube o introduce fácilmente los datos de consumo y características de tu instalación energética.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="bg-gradient-to-br from-audite-secondary to-audite-tertiary p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform">
                <LineChart className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-2xl font-brand font-semibold text-audite-dark mb-4">
                2. Análisis Inteligente
              </h3>
              <p className="text-audite-secondary font-body leading-relaxed">
                Nuestra plataforma procesa la información y calcula automáticamente los KPIs energéticos más relevantes.
              </p>
            </div>
            
            <div className="text-center group">
              <div className="bg-gradient-to-br from-audite-tertiary to-primary p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center group-hover:scale-110 transition-transform">
                <CheckCircle className="h-12 w-12 text-white" />
              </div>
              <h3 className="text-2xl font-brand font-semibold text-audite-dark mb-4">
                3. Obtén Recomendaciones
              </h3>
              <p className="text-audite-secondary font-body leading-relaxed">
                Recibe un informe detallado con acciones concretas y priorizadas para optimizar tu eficiencia.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Características Principales */}
      <section className="py-20 px-4 bg-background">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-brand font-bold text-audite-dark mb-4">
              Potencia tu Eficiencia Energética
            </h2>
            <p className="text-xl text-audite-secondary font-body max-w-2xl mx-auto">
              Herramientas especializadas para cada tipo de auditoría energética
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="dashboard-card border-audite-accent-medium/20 group hover:border-primary/50 transition-colors">
              <CardContent className="p-8">
                <div className="bg-primary/10 p-4 rounded-lg w-fit mb-6 group-hover:bg-primary/20 transition-colors">
                  <Activity className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-brand font-semibold text-audite-dark mb-4">
                  Auditorías Básicas
                </h3>
                <p className="text-audite-secondary font-body leading-relaxed">
                  Realiza evaluaciones energéticas completas para identificar ahorros en cualquier tipo de empresa o instalación.
                </p>
              </CardContent>
            </Card>
            
            <Card className="dashboard-card border-audite-accent-medium/20 group hover:border-audite-secondary/50 transition-colors">
              <CardContent className="p-8">
                <div className="bg-audite-secondary/10 p-4 rounded-lg w-fit mb-6 group-hover:bg-audite-secondary/20 transition-colors">
                  <Leaf className="h-10 w-10 text-audite-secondary" />
                </div>
                <h3 className="text-xl font-brand font-semibold text-audite-dark mb-4">
                  Auditorías Agrícolas
                </h3>
                <p className="text-audite-secondary font-body leading-relaxed">
                  Optimiza el uso de energía en riego, climatización y maquinaria con soluciones adaptadas al sector agrícola.
                </p>
              </CardContent>
            </Card>
            
            <Card className="dashboard-card border-audite-accent-medium/20 group hover:border-audite-tertiary/50 transition-colors">
              <CardContent className="p-8">
                <div className="bg-audite-tertiary/10 p-4 rounded-lg w-fit mb-6 group-hover:bg-audite-tertiary/20 transition-colors">
                  <TrendingUp className="h-10 w-10 text-audite-tertiary" />
                </div>
                <h3 className="text-xl font-brand font-semibold text-audite-dark mb-4">
                  KPIs Automáticos
                </h3>
                <p className="text-audite-secondary font-body leading-relaxed">
                  Obtén indicadores clave al instante para monitorizar tu progreso y tomar decisiones basadas en datos.
                </p>
              </CardContent>
            </Card>
            
            <Card className="dashboard-card border-audite-accent-medium/20 group hover:border-primary/50 transition-colors">
              <CardContent className="p-8">
                <div className="bg-primary/10 p-4 rounded-lg w-fit mb-6 group-hover:bg-primary/20 transition-colors">
                  <Info className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-brand font-semibold text-audite-dark mb-4">
                  Recomendaciones Personalizadas
                </h3>
                <p className="text-audite-secondary font-body leading-relaxed">
                  Recibe sugerencias específicas y priorizadas para maximizar tu eficiencia y retorno de inversión.
                </p>
              </CardContent>
            </Card>
            
            <Card className="dashboard-card border-audite-accent-medium/20 group hover:border-audite-secondary/50 transition-colors">
              <CardContent className="p-8">
                <div className="bg-audite-secondary/10 p-4 rounded-lg w-fit mb-6 group-hover:bg-audite-secondary/20 transition-colors">
                  <Users className="h-10 w-10 text-audite-secondary" />
                </div>
                <h3 className="text-xl font-brand font-semibold text-audite-dark mb-4">
                  Gestión Multi-usuario
                </h3>
                <p className="text-audite-secondary font-body leading-relaxed">
                  Colabora con tu equipo y gestiona múltiples auditorías desde una única plataforma centralizada.
                </p>
              </CardContent>
            </Card>
            
            <Card className="dashboard-card border-audite-accent-medium/20 group hover:border-audite-tertiary/50 transition-colors">
              <CardContent className="p-8">
                <div className="bg-audite-tertiary/10 p-4 rounded-lg w-fit mb-6 group-hover:bg-audite-tertiary/20 transition-colors">
                  <BarChart className="h-10 w-10 text-audite-tertiary" />
                </div>
                <h3 className="text-xl font-brand font-semibold text-audite-dark mb-4">
                  Análisis Detallado
                </h3>
                <p className="text-audite-secondary font-body leading-relaxed">
                  Visualiza tus datos energéticos de forma clara para entender patrones y oportunidades de mejora.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section className="py-20 px-4 bg-gradient-to-r from-audite-accent-soft to-audite-accent-medium/50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-brand font-bold text-audite-dark mb-4">
              Lo que dicen nuestros usuarios
            </h2>
            <p className="text-xl text-audite-secondary font-body">
              Casos de éxito reales con AuditE
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-card border-audite-accent-medium/20">
              <CardContent className="p-8">
                <div className="mb-6">
                  <div className="flex text-primary mb-4">
                    {"★★★★★".split("").map((star, i) => (
                      <span key={i} className="text-2xl">{star}</span>
                    ))}
                  </div>
                  <p className="text-audite-secondary font-body italic leading-relaxed">
                    "AuditE nos ayudó a reducir nuestra factura eléctrica un 15% en solo 3 meses. 
                    La plataforma es intuitiva y las recomendaciones muy precisas."
                  </p>
                </div>
                <div>
                  <p className="font-brand font-semibold text-audite-dark">Ana García</p>
                  <p className="text-sm text-audite-secondary font-body">CEO, Tech Solutions</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card border-audite-accent-medium/20">
              <CardContent className="p-8">
                <div className="mb-6">
                  <div className="flex text-primary mb-4">
                    {"★★★★★".split("").map((star, i) => (
                      <span key={i} className="text-2xl">{star}</span>
                    ))}
                  </div>
                  <p className="text-audite-secondary font-body italic leading-relaxed">
                    "La especialización en auditorías agrícolas es increíble. Hemos optimizado 
                    el riego y reducido el consumo energético de toda la explotación."
                  </p>
                </div>
                <div>
                  <p className="font-brand font-semibold text-audite-dark">Carlos López</p>
                  <p className="text-sm text-audite-secondary font-body">Gerente, Finca Sol Verde</p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-card border-audite-accent-medium/20">
              <CardContent className="p-8">
                <div className="mb-6">
                  <div className="flex text-primary mb-4">
                    {"★★★★★".split("").map((star, i) => (
                      <span key={i} className="text-2xl">{star}</span>
                    ))}
                  </div>
                  <p className="text-audite-secondary font-body italic leading-relaxed">
                    "Tener todos los KPIs energéticos calculados automáticamente nos ahorra 
                    muchísimo tiempo y facilita enormemente los informes de sostenibilidad."
                  </p>
                </div>
                <div>
                  <p className="font-brand font-semibold text-audite-dark">Sofía Martínez</p>
                  <p className="text-sm text-audite-secondary font-body">Responsable de Sostenibilidad</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary to-audite-secondary text-white">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-brand font-bold mb-6">
              ¿Listo para Transformar tu Energía?
            </h2>
            <p className="text-xl md:text-2xl mb-8 font-body leading-relaxed opacity-90">
              Comienza tu autodiagnóstico energético ahora y descubre oportunidades de ahorro inmediatas.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <BrandButton size="lg" asChild variant="secondary" className="text-lg px-8 py-4 bg-white text-audite-dark hover:bg-audite-accent-soft">
                <Link to="/diagnostico">
                  <Zap className="mr-3 h-6 w-6" />
                  Comenzar Autodiagnóstico
                </Link>
              </BrandButton>
            </div>
            
            <div className="slogan text-2xl opacity-90">
              Conecta. Ahorra. Transforma.
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-audite-dark text-white">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <img 
                src="/logo primary@2x.png" 
                alt="AuditE" 
                className="logo-mobile mb-4 filter brightness-0 invert"
              />
              <p className="font-body text-audite-accent-medium mb-4 leading-relaxed">
                Plataforma líder en auditorías energéticas especializadas. 
                Ayudamos a empresas y explotaciones agrícolas a optimizar su consumo energético.
              </p>
              <div className="slogan text-lg text-audite-accent-soft">
                Conecta. Ahorra. Transforma.
              </div>
            </div>
            
            <div>
              <h3 className="font-brand font-semibold text-lg mb-4">Plataforma</h3>
              <ul className="space-y-2 font-body text-audite-accent-medium">
                <li><Link to="/diagnostico" className="hover:text-white transition-colors">Autodiagnóstico</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-brand font-semibold text-lg mb-4">Empresa</h3>
              <ul className="space-y-2 font-body text-audite-accent-medium">
                <li><a href="#" className="hover:text-white transition-colors">Sobre Nosotros</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contacto</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Política de Privacidad</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-audite-accent-medium/20 pt-8 text-center">
            <p className="font-body text-audite-accent-medium">
              &copy; {new Date().getFullYear()} AuditE. Todos los derechos reservados. 
              Plataforma de auditorías energéticas especializadas.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
