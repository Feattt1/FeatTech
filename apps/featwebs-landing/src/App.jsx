import React, { useState, useEffect } from 'react';
import { 
  Laptop, 
  Smartphone, 
  Search, 
  Trophy, 
  Users, 
  Download, 
  ArrowRight, 
  Mail, 
  CheckCircle,
  Menu,
  X,
  Sparkles,
  Zap,
  ShieldCheck
} from 'lucide-react';
import padelMockup from './assets/torneos-padel.png';

export default function App() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      setSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => setSubmitted(false), 5000);
    }
  };

  return (
    <>
      {/* Background Glowspheres */}
      <div className="bg-glow-container">
        <div className="glow-sphere-1"></div>
        <div className="glow-sphere-2"></div>
      </div>

      {/* Navbar */}
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="container nav-container">
          <a href="#" className="logo">
            Feat<span>Webs</span>
          </a>
          
          <div className="nav-links">
            <a href="#servicios" className="nav-link">Servicios</a>
            <a href="#proyectos" className="nav-link">Showcase</a>
            <a href="#contacto" className="nav-link">Contacto</a>
            <a 
              href="https://torneos.featwebs.com" 
              className="btn btn-secondary"
              style={{ padding: '8px 20px', fontSize: '14px', borderRadius: '8px' }}
            >
              Lanzar Torneos
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-tag">
            <Sparkles size={16} /> Diseño digital & desarrollo web de alta fidelidad
          </div>
          <h1 className="hero-title">
            Creamos experiencias digitales que <span>impulsan tu negocio</span>
          </h1>
          <p className="hero-subtitle">
            En <strong>FeatWebs</strong> diseñamos interfaces de ultra-alta fidelidad, aplicaciones SaaS interactivas y sistemas web escalables optimizados para SEO y conversiones.
          </p>
          <div className="cta-group">
            <a href="https://torneos.featwebs.com" className="btn btn-primary">
              Probar App de Pádel <ArrowRight size={18} />
            </a>
            <a href="#proyectos" className="btn btn-secondary">
              Ver Showcase
            </a>
          </div>
        </div>
      </section>

      {/* Services / Specialities Section */}
      <section id="servicios" className="services">
        <div className="container">
          <div className="section-header">
            <span className="section-label">NUESTRAS CAPACIDADES</span>
            <h2 className="section-title">Qué hacemos en FeatWebs</h2>
          </div>

          <div className="services-grid">
            {/* Service 1 */}
            <div className="glass-card service-card sport-theme">
              <div className="service-icon-box">
                <Trophy size={26} />
              </div>
              <h3 className="service-title">Software para Deportes</h3>
              <p className="service-desc">
                Desarrollo de soluciones especializadas en gestión deportiva, emparejamientos y torneos interactivos en tiempo real con lógicas algorítmicas de vanguardia.
              </p>
            </div>

            {/* Service 2 */}
            <div className="glass-card service-card">
              <div className="service-icon-box">
                <Laptop size={26} />
              </div>
              <h3 className="service-title">Aplicaciones SaaS a Medida</h3>
              <p className="service-desc">
                Ideamos, maquetamos y construimos plataformas web robustas y escalables con bases de datos serverless (como Neon PostgreSQL) y despliegue distribuido de alto rendimiento.
              </p>
            </div>

            {/* Service 3 */}
            <div className="glass-card service-card">
              <div className="service-icon-box">
                <Search size={26} />
              </div>
              <h3 className="service-title">Optimización SEO y UX</h3>
              <p className="service-desc">
                Optimizamos la velocidad de carga de tus proyectos web al milisegundo y los estructuramos con las mejores prácticas SEO para dominar las búsquedas en Google de forma orgánica.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Showcase / Product Spotlight */}
      <section id="proyectos" className="portfolio">
        <div className="container">
          <div className="section-header">
            <span className="section-label">PRODUCTO DESTACADO</span>
            <h2 className="section-title">Casos de Éxito de FeatWebs</h2>
          </div>

          <div className="portfolio-hero">
            <div className="portfolio-content">
              <div className="portfolio-badge">
                <Zap size={14} style={{ marginRight: '6px' }} /> SOFTWARE DE ÉLITE
              </div>
              <h3 className="portfolio-title">Torneos Pádel UY</h3>
              <p className="portfolio-desc">
                Una plataforma web integral diseñada para la organización autónoma de campeonatos de pádel para clubes y grupos de amigos. Cuenta con sistemas automáticos de cruces y una interfaz de usuario espectacularmente reactiva.
              </p>

              <div className="portfolio-features">
                <div className="portfolio-feature-item">
                  <span className="portfolio-feature-icon"><CheckCircle size={18} /></span>
                  <span><strong>Modo Americano Individual</strong> con rotaciones de costo mínimo.</span>
                </div>
                <div className="portfolio-feature-item">
                  <span className="portfolio-feature-icon"><CheckCircle size={18} /></span>
                  <span>Clasificación y rankings en tiempo real ordenados por diferencia de games.</span>
                </div>
                <div className="portfolio-feature-item">
                  <span className="portfolio-feature-icon"><CheckCircle size={18} /></span>
                  <span>Exportación premium a archivos Excel dinámicos y responsividad móvil total.</span>
                </div>
                <div className="portfolio-feature-item">
                  <span className="portfolio-feature-icon"><CheckCircle size={18} /></span>
                  <span>Despliegue serverless conectado a base de datos segura y escalable en Neon.</span>
                </div>
              </div>

              <a href="https://torneos.featwebs.com" className="btn btn-primary" style={{ marginTop: '16px' }}>
                Lanzar Aplicación <ArrowRight size={18} />
              </a>
            </div>

            <div className="portfolio-visual">
              <div className="portfolio-glow-layer"></div>
              <div className="portfolio-frame">
                <img src={padelMockup} alt="Torneos Padel UY Mockup" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contacto" className="contact">
        <div className="container">
          <div className="glass-card contact-card">
            <h2 className="contact-title">¿Tienes una idea en mente?</h2>
            <p className="contact-desc">
              Ponte en contacto con el equipo de FeatWebs para digitalizar tu negocio o desarrollar tu próximo software a medida.
            </p>

            {submitted ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '40px 0' }}>
                <CheckCircle size={54} color="#bef264" />
                <h4 style={{ fontSize: '20px', fontWeight: '700' }}>¡Mensaje enviado con éxito!</h4>
                <p style={{ color: 'var(--text-muted)' }}>Te responderemos en menos de 24 horas hábiles.</p>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label" htmlFor="name">Nombre completo</label>
                  <input 
                    type="text" 
                    id="name" 
                    name="name" 
                    className="form-input" 
                    placeholder="Tu nombre" 
                    value={formData.name}
                    onChange={handleInputChange}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="email">Correo electrónico</label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    className="form-input" 
                    placeholder="correo@ejemplo.com" 
                    value={formData.email}
                    onChange={handleInputChange}
                    required 
                  />
                </div>
                <div className="form-group-full">
                  <label className="form-label" htmlFor="message">Cuéntanos sobre tu proyecto</label>
                  <textarea 
                    id="message" 
                    name="message" 
                    className="form-input" 
                    placeholder="Describe tu idea, requerimientos o el software que deseas construir..." 
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                  ></textarea>
                </div>
                <div className="submit-btn-box">
                  <button type="submit" className="btn btn-primary">
                    Enviar mensaje <Mail size={18} />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container footer-container">
          <div className="footer-copy">
            © {new Date().getFullYear()} <span>FeatWebs</span>. Todos los derechos reservados.
          </div>
          <div className="footer-links">
            <a href="#servicios" className="footer-link">Servicios</a>
            <a href="#proyectos" className="footer-link">Proyectos</a>
            <a href="#contacto" className="footer-link">Contacto</a>
          </div>
        </div>
      </footer>
    </>
  );
}
