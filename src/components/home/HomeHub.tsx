import React from 'react';
import { useApp } from '../../context/AppContext';
import { TrustEntitiesSection } from './TrustEntitiesSection';
import { TERRITORIES_DATA } from '../../data/mockData';
import {
  Compass,
  ShoppingBag,
  HeartHandshake,
  Award,
  Briefcase,
  Coins,
  GraduationCap,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Cpu,
  Layers,
  Database,
  Users
} from 'lucide-react';

export const HomeHub: React.FC = () => {
  const { setActiveTab, selectedTerritory, user } = useApp();

  const currentTerritory = TERRITORIES_DATA.find((t) => t.id === selectedTerritory) || TERRITORIES_DATA[0];

  const modules = [
    {
      id: 'optilogic',
      title: 'OptiLogic AI & Asesora Sofía',
      subtitle: 'Optimización de Operaciones & Modelado PL',
      description: 'Asesora virtual por voz con memoria RAG, formulación matemática automática, Método Gráfico 2D, análisis de holguras y Google OR-Tools en Python.',
      icon: Compass,
      color: 'blue',
      badge: 'Investigación de Operaciones',
      actionText: 'Optimizar decisiones con IA',
      highlight: true
    },
    {
      id: 'vitrina',
      title: 'Vitrina "Hecho en Chocó & Pereira"',
      subtitle: 'Comercio Digital & Marca Territorial',
      description: 'Compra y venta directa de café especial, filigrana de oro y plata, cestería en werregue, moda artesanal y productos emblemáticos con impacto social.',
      icon: ShoppingBag,
      color: 'emerald',
      badge: 'E-commerce Regional',
      actionText: 'Explorar productos de origen'
    },
    {
      id: 'habilidades',
      title: 'Validador de Habilidades IA',
      subtitle: 'Diagnóstico de Competencias & Certificación',
      description: 'Test vocacional adaptativo para independientes, desempleados, empleados y PYMEs. Detecta fortalezas y genera certificado con insignias verificadas.',
      icon: Award,
      color: 'teal',
      badge: 'Talento Humano IA',
      actionText: 'Validar mis habilidades'
    },
    {
      id: 'creditos',
      title: 'Microcréditos & 6 Meses de Gracia',
      subtitle: 'Financiación Blanda & Alivio Financiero',
      description: 'Simulador de microcréditos para emprendedores y líneas blandas con 6 meses sin cuotas de amortización para acelerar negocios e inversión en maquinaria.',
      icon: Coins,
      color: 'amber',
      badge: '6 Meses Sin Cuotas',
      actionText: 'Simular crédito blando'
    },
    {
      id: 'empleo',
      title: 'Bolsa de Empleo Regional & Remota',
      subtitle: 'Conexión con Empresas Aliadas',
      description: 'Vacantes locales, nacionales y remotas en Construcción, Electricidad, Tecnología, Operaciones y Comercio con postulación ágil.',
      icon: Briefcase,
      color: 'indigo',
      badge: 'Vacantes Verificadas',
      actionText: 'Buscar oportunidades laborales'
    },
    {
      id: 'capacitacion',
      title: 'Capacitaciones Técnicas Certificadas',
      subtitle: 'Cursos Gratuitos de Alta Demanda',
      description: 'Formación en Construcción, Electricidad RETIE, Desarrollo Web y Gestión de Negocios dictados por entidades aliadas con aula virtual interactiva.',
      icon: GraduationCap,
      color: 'purple',
      badge: '100% Gratuitos',
      actionText: 'Ver catálogo de cursos'
    },
    {
      id: 'psicologia',
      title: 'Apoyo Psicológico & Bienestar',
      subtitle: 'Acompañamiento Emocional & Manejo del Estrés',
      description: 'Orientación confidencial con inteligencia artificial y voz, técnicas de respiración y conexión directa con la Línea 106 de salud mental.',
      icon: HeartHandshake,
      color: 'rose',
      badge: 'Salud Mental & Contención',
      actionText: 'Acceder a orientación empática'
    },
    {
      id: 'optimizador',
      title: 'Optimizador de Costos PYME',
      subtitle: 'Diagnóstico Financiero & Diversificación',
      description: 'Herramienta de reducción de costos en materias primas, optimización de cuellos de botella y diseño de productos con sello de origen regional.',
      icon: TrendingUp,
      color: 'cyan',
      badge: 'Finanzas & Rentabilidad',
      actionText: 'Diagnosticar mi negocio'
    }
  ];

  return (
    <div className="space-y-10">
      {/* Hero Banner with Territorial Focus */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white p-6 sm:p-10 border border-slate-800 shadow-xl">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-extrabold backdrop-blur-sm">
            <MapPin className="w-3.5 h-3.5" />
            <span>Territorio Activo: {currentTerritory.name}</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-display text-white">
              Ecosistema Integral de Desarrollo, Bienestar y <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-400">Decisiones Inteligentes</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              {currentTerritory.highlight} Conectamos a ciudadanos, emprendedores, trabajadores y empresas con herramientas de Investigación de Operaciones (OR), vitrina digital, créditos blandos con 6 meses de gracia y validación de habilidades.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
              <div className="text-xs text-slate-400 font-semibold">Vacantes Disponibles</div>
              <div className="text-xl sm:text-2xl font-black text-emerald-400">
                +{currentTerritory.jobCount}
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
              <div className="text-xs text-slate-400 font-semibold">Productores & Artesanos</div>
              <div className="text-xl sm:text-2xl font-black text-amber-400">
                +{currentTerritory.producerCount}
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
              <div className="text-xs text-slate-400 font-semibold">Período de Gracia</div>
              <div className="text-xl sm:text-2xl font-black text-teal-400">
                6 Meses (0%)
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-3.5 border border-white/10">
              <div className="text-xs text-slate-400 font-semibold">Motor de Decisión</div>
              <div className="text-xl sm:text-2xl font-black text-blue-400">
                Google OR-Tools
              </div>
            </div>
          </div>

          {/* Hero CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => setActiveTab('optilogic')}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-500 hover:to-teal-400 text-white px-5 py-3 rounded-xl font-bold text-xs shadow-lg shadow-blue-500/20 transition cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>Optimizar Operaciones con Sofía</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setActiveTab('vitrina')}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-5 py-3 rounded-xl font-bold text-xs transition cursor-pointer border border-white/15"
            >
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
              <span>Explorar Vitrina Hecho en Chocó / Pereira</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modules Section Grid */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 font-display">
              Módulos Integrados de la Plataforma
            </h2>
            <p className="text-xs text-slate-500">
              Accede a todas las funcionalidades especializadas para personas, microempresas y grandes corporaciones
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {modules.map((m) => {
            const Icon = m.icon;
            const isHighlighted = m.highlight;

            return (
              <div
                key={m.id}
                onClick={() => setActiveTab(m.id)}
                className={`rounded-2xl p-5 border transition cursor-pointer flex flex-col justify-between space-y-4 group relative overflow-hidden ${
                  isHighlighted
                    ? 'bg-gradient-to-b from-blue-50/80 to-white border-blue-300 hover:border-blue-500 hover:shadow-lg shadow-sm'
                    : 'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-md'
                }`}
              >
                {isHighlighted && (
                  <div className="absolute top-0 right-0 bg-blue-600 text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-bl-xl">
                    Destacado
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:scale-110 transition flex items-center justify-center text-slate-800">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      {m.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm font-display group-hover:text-emerald-700 transition">
                      {m.title}
                    </h3>
                    <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
                      {m.subtitle}
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {m.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 text-xs font-bold text-slate-800 flex items-center justify-between group-hover:text-emerald-600 transition">
                  <span>{m.actionText}</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trust Entities & Regional Alliances */}
      <TrustEntitiesSection />
    </div>
  );
};
