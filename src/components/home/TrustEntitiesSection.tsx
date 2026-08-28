import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TRUST_ENTITIES, TERRITORIES_DATA } from '../../data/mockData';
import { TerritoryInfo } from '../../types';
import {
  ShieldCheck,
  Award,
  HeartHandshake,
  Coins,
  Briefcase,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Users,
  MapPin,
  Building,
  GraduationCap,
  ChevronRight,
  PhoneCall,
  Store,
  Layers
} from 'lucide-react';

interface TrustEntitiesSectionProps {
  onOpenRegisterModal?: () => void;
}

export const TrustEntitiesSection: React.FC<TrustEntitiesSectionProps> = ({ onOpenRegisterModal }) => {
  const { user, setActiveTab } = useApp();
  const [selectedTerritoryId, setSelectedTerritoryId] = useState<string>('pereira');
  const [entityFilter, setEntityFilter] = useState<string>('todos');

  const selectedTerritory: TerritoryInfo = TERRITORIES_DATA.find(t => t.id === selectedTerritoryId) || TERRITORIES_DATA[0];

  const getRoleWelcome = () => {
    switch (user.role) {
      case 'desempleado':
        return {
          title: 'Bienvenido(a) a tu ruta de Empleo y Detección de Habilidades',
          subtitle: 'Valida en qué eres bueno con nuestro detector inteligente y postúlate a empleos en tu territorio o remotos internacionales.',
          primaryAction: { label: 'Validar Mis Habilidades Ahora', tab: 'habilidades' },
          secondaryAction: { label: 'Explorar Ofertas de Empleo', tab: 'empleo' }
        };
      case 'independiente':
        return {
          title: 'Impulsa tu Actividad Independiente con Microcrédito y Capacitación',
          subtitle: 'Accede a microcréditos semilla, capacítate en construcción/electricidad/tecnología y optimiza tus costos.',
          primaryAction: { label: 'Simular Microcrédito', tab: 'creditos' },
          secondaryAction: { label: 'Optimizar Mis Costos', tab: 'optimizador' }
        };
      case 'pequeno_negocio':
      case 'pyme':
      case 'gran_empresa':
        return {
          title: 'Créditos Blandos con 6 Meses de Gracia & Optimización de Procesos',
          subtitle: 'Reduce costos, diversifica tu portafolio y exhibe tus productos con sello regional de origen (Pereira, Caldas, Quindío, Cali, Chocó).',
          primaryAction: { label: 'Optimizador con IA de Negocios', tab: 'optimizador' },
          secondaryAction: { label: 'Crédito Blando (6m de Gracia)', tab: 'creditos' }
        };
      default:
        return {
          title: 'Ecosistema de Confianza, Bienestar y Crecimiento Laboral',
          subtitle: 'Encuentra apoyo psicológico virtual, valida tus competencias y accede a oportunidades territoriales, nacionales y globales.',
          primaryAction: { label: 'Validar Habilidades', tab: 'habilidades' },
          secondaryAction: { label: 'Apoyo Psicológico', tab: 'psicologico' }
        };
    }
  };

  const welcomeInfo = getRoleWelcome();

  const filteredEntities = entityFilter === 'todos'
    ? TRUST_ENTITIES
    : TRUST_ENTITIES.filter(e => e.territoryKey === entityFilter || e.territoryKey === 'eje_cafetero' || e.territoryKey === 'nacional');

  return (
    <div className="space-y-10">
      {/* Dynamic Welcome Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white p-6 sm:p-10 border border-emerald-800/30 shadow-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-8 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Entidades Aliadas de Confianza &bull; Pereira, Quindío, Caldas, Risaralda, Eje Cafetero, Cali y Chocó
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight font-display">
            {welcomeInfo.title}
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {welcomeInfo.subtitle}
          </p>

          {/* Quick Action buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              id="hero-primary-action-btn"
              onClick={() => setActiveTab(welcomeInfo.primaryAction.tab)}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-transform active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <span>{welcomeInfo.primaryAction.label}</span>
              <span className="text-lg">&rarr;</span>
            </button>

            <button
              id="hero-secondary-action-btn"
              onClick={() => setActiveTab(welcomeInfo.secondaryAction.tab)}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 backdrop-blur-xs transition cursor-pointer"
            >
              {welcomeInfo.secondaryAction.label}
            </button>

            <button
              id="hero-mental-support-btn"
              onClick={() => setActiveTab('psicologico')}
              className="px-4 py-2.5 rounded-xl bg-teal-900/40 hover:bg-teal-900/60 text-teal-200 border border-teal-500/30 text-xs font-semibold flex items-center gap-2 transition cursor-pointer"
            >
              <HeartHandshake className="w-4 h-4 text-rose-300" />
              <span>Apoyo Psicológico Gratuito 24/7</span>
            </button>
          </div>
        </div>

        {/* User Card badge overlay */}
        <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-300">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600/30 border border-emerald-400/30 flex items-center justify-center font-bold text-emerald-300">
              {user.name.charAt(0)}
            </div>
            <div>
              <span className="font-bold text-white">{user.name}</span> &bull; 
              <span className="capitalize text-emerald-400 font-semibold ml-1">{user.role.replace('_', ' ')}</span> &bull; 
              <span className="text-slate-400 ml-1">{user.city}, {user.department}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 bg-emerald-900/60 text-emerald-300 px-2.5 py-1 rounded-md border border-emerald-500/30">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Verificación Territorial Activa
            </span>
            <button
              onClick={onOpenRegisterModal}
              className="text-slate-300 hover:text-white underline text-xs cursor-pointer"
            >
              Configurar Perfil
            </button>
          </div>
        </div>
      </div>

      {/* TERRITORIES INTERACTIVE SHOWCASE (Quindío, Caldas, Pereira, Risaralda, Eje Cafetero, Cali y Municipios Aledaños, Chocó) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-900 text-xs font-bold mb-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-700" /> Cobertura Territorial Integral
            </div>
            <h2 className="text-xl font-bold text-slate-900 font-display">
              Territorios Integrados en la Plataforma
            </h2>
            <p className="text-xs text-slate-600">
              Selecciona tu territorio para conocer los municipios cubiertos, cámaras de comercio, oportunidades laborales, fondos de crédito y líneas de apoyo emocional:
            </p>
          </div>
        </div>

        {/* Territory Tabs Bar */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 pt-1">
          {TERRITORIES_DATA.map((t) => {
            const isSelected = t.id === selectedTerritoryId;
            return (
              <button
                key={t.id}
                id={`territory-tab-${t.id}`}
                onClick={() => setSelectedTerritoryId(t.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-2 border ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-emerald-500/30'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-400' : 'text-emerald-600'}`} />
                <span>{t.name}</span>
              </button>
            );
          })}
        </div>

        {/* Active Territory Detailed Card */}
        <div className={`rounded-2xl p-6 sm:p-8 text-white bg-gradient-to-br ${selectedTerritory.bannerGradient} border border-white/10 shadow-lg space-y-6 animate-in fade-in`}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300 mb-1">
                <span>Departamento / Región: {selectedTerritory.department}</span>
                <span>&bull;</span>
                <span className="bg-white/10 px-2 py-0.5 rounded text-[11px] text-white">Sede Oficial Vinculada</span>
              </div>
              <h3 className="text-2xl font-extrabold text-white font-display">
                {selectedTerritory.name}
              </h3>
              <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-3xl">
                {selectedTerritory.highlight}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <button
                onClick={() => setActiveTab('empleo')}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold text-white transition cursor-pointer flex items-center gap-1.5"
              >
                <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
                <span>{selectedTerritory.jobCount} Vacantes Activas</span>
              </button>

              <button
                onClick={() => setActiveTab('vitrina')}
                className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <Store className="w-3.5 h-3.5" />
                <span>{selectedTerritory.producerCount}+ Productores</span>
              </button>
            </div>
          </div>

          {/* Grid of details for the selected territory */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Municipalities */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs space-y-2">
              <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-400" />
                Municipios & Zonas Vinculadas ({selectedTerritory.municipalities.length})
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {selectedTerritory.municipalities.map((m, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-white/15 text-[11px] font-medium text-slate-100 border border-white/10"
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>

            {/* Chambers & Financial Fund */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs space-y-2">
              <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-amber-400" />
                Créditos Blandos (6m Gracia) & Gremio
              </div>
              <div className="space-y-1.5 text-xs text-slate-200">
                <p className="font-semibold text-white">{selectedTerritory.creditFund}</p>
                <p className="text-[11px] text-slate-300 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  {selectedTerritory.chambers}
                </p>
                <button
                  onClick={() => setActiveTab('creditos')}
                  className="mt-2 text-xs font-bold text-amber-300 hover:text-amber-200 underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Simular crédito para {selectedTerritory.shortName}</span> &rarr;
                </button>
              </div>
            </div>

            {/* Mental Health Hotline */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-xs space-y-2">
              <div className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                <HeartHandshake className="w-4 h-4 text-rose-400" />
                Salud Mental & Bienestar 24/7
              </div>
              <div className="space-y-1.5 text-xs text-slate-200">
                <p className="font-semibold text-white">{selectedTerritory.healthLine}</p>
                <p className="text-[11px] text-slate-300 flex items-center gap-1">
                  <PhoneCall className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  Teléfono directo: <strong className="text-rose-200">{selectedTerritory.healthPhone}</strong>
                </p>
                <button
                  onClick={() => setActiveTab('psicologico')}
                  className="mt-2 text-xs font-bold text-rose-300 hover:text-rose-200 underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Chat y teleconsulta en {selectedTerritory.shortName}</span> &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 8 Core Pillars Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Pilares Integrales del Ecosistema
            </h2>
            <p className="text-xs text-slate-500">
              Diseñado para generar confianza y brindar soluciones reales desde el bienestar humano hasta las finanzas de negocio.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Apoyo Psicológico */}
          <div
            onClick={() => setActiveTab('psicologico')}
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-md transition group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-3 group-hover:scale-110 transition">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm mb-1 group-hover:text-emerald-700">Apoyo Psicológico Virtual</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              Orientación de bienestar emocional, escucha activa confidencial y tele-apoyo para momentos de estrés o sobrecarga laboral.
            </p>
            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
              Ingresar a bienestar &rarr;
            </span>
          </div>

          {/* Card 2: Validador de Habilidades */}
          <div
            onClick={() => setActiveTab('habilidades')}
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-md transition group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-110 transition">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm mb-1 group-hover:text-emerald-700">Validador de Habilidades con IA</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              Herramienta interactiva para empleados, desempleados e independientes: detección de fortalezas ("en qué soy bueno").
            </p>
            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
              Hacer test y diagnóstico &rarr;
            </span>
          </div>

          {/* Card 3: Bolsa de Empleo */}
          <div
            onClick={() => setActiveTab('empleo')}
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-md transition group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition">
              <Briefcase className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm mb-1 group-hover:text-emerald-700">Bolsa Nacional & Remoto Global</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              Vacantes en Pereira, Quindío, Caldas, Risaralda, Cali y Chocó, además de empleos 100% remotos en dólares.
            </p>
            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
              Ver vacantes activas &rarr;
            </span>
          </div>

          {/* Card 4: Microcréditos y Créditos Blandos */}
          <div
            onClick={() => setActiveTab('creditos')}
            className="p-5 rounded-2xl bg-gradient-to-b from-amber-50/50 to-white border border-amber-200 hover:border-amber-400 hover:shadow-md transition group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-3 group-hover:scale-110 transition">
              <Coins className="w-5 h-5" />
            </div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-bold text-slate-800 text-sm group-hover:text-amber-800">Créditos con 6m de Gracia</h3>
              <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-200 text-amber-900 rounded">Destacado</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              Microcréditos semilla para independientes y créditos a tasa blanda con 6 meses de gracia para empezar a pagar.
            </p>
            <span className="text-xs font-bold text-amber-700 flex items-center gap-1">
              Simular cuota y plazo &rarr;
            </span>
          </div>

          {/* Card 5: Capacitaciones Virtuales */}
          <div
            onClick={() => setActiveTab('capacitacion')}
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-md transition group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-110 transition">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm mb-1 group-hover:text-emerald-700">Capacitaciones Virtuales</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              Cursos prácticos certificados en <strong>Construcción</strong>, <strong>Electricidad (RETIE)</strong> y <strong>Tecnología / IA</strong>.
            </p>
            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
              Explorar cursos gratis &rarr;
            </span>
          </div>

          {/* Card 6: Optimizador de Negocios */}
          <div
            onClick={() => setActiveTab('optimizador')}
            className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-md transition group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-110 transition">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm mb-1 group-hover:text-emerald-700">Optimizador de Costos & Procesos</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-3">
              Ingresa la información de tu negocio: te indicamos cómo reducir costos, mejorar procesos y diversificar productos.
            </p>
            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
              Diagnosticar mi negocio &rarr;
            </span>
          </div>

          {/* Card 7: Vitrina Regional */}
          <div
            onClick={() => setActiveTab('vitrina')}
            className="p-5 rounded-2xl bg-emerald-900 text-white border border-emerald-700 hover:shadow-lg transition group cursor-pointer col-span-1 sm:col-span-2"
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-white/10 text-emerald-300 flex items-center justify-center mb-3 group-hover:scale-110 transition">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="px-2.5 py-0.5 text-[11px] font-bold bg-amber-400 text-slate-950 rounded-full">
                Marcas Regionales
              </span>
            </div>
            <h3 className="font-bold text-white text-base mb-1">Vitrina de Origen Territorial</h3>
            <p className="text-xs text-emerald-100/90 leading-relaxed mb-3">
              Promueve y compra creaciones auténticas con sello "Hecho en Pereira", "Hecho en Quindío", "Hecho en Caldas", "Hecho en Cali & Valle" y "Hecho en Chocó" (café de origen, filigrana, sombreros de Aguadas, agroindustria y calzado).
            </p>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
              <span>Explorar productos regionales y registrar tu marca</span>
              <span>&rarr;</span>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Entities Directory */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-display flex items-center gap-2">
              <Building className="w-5 h-5 text-emerald-600" />
              Cámaras de Comercio & Entidades Aliadas de Confianza
            </h2>
            <p className="text-xs text-slate-500">
              Validan la identidad de usuarios, canalizan los créditos con períodos de gracia y certifican competencias laborales.
            </p>
          </div>
          <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 self-start">
            {TRUST_ENTITIES.length} Entidades Oficiales Vinculadas
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEntities.map((entity) => (
            <div
              key={entity.id}
              className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-emerald-300 hover:shadow-xs transition flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded">
                    {entity.logoBadge}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">{entity.region}</span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">{entity.name}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{entity.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-emerald-600" />
                  {entity.verifiedCount.toLocaleString()} usuarios respaldados
                </span>
                <a
                  href={entity.contactUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1"
                >
                  <span>Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Community Impact Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center">
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-display">100%</div>
          <div className="text-xs font-semibold text-slate-700 mt-1">Apoyo Psicológico</div>
          <div className="text-[11px] text-slate-400">Gratuito en todos los territorios</div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center">
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 font-display">6 Meses</div>
          <div className="text-xs font-semibold text-slate-700 mt-1">Período de Gracia</div>
          <div className="text-[11px] text-slate-400">Para créditos comerciales</div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center">
          <div className="text-2xl sm:text-3xl font-extrabold text-indigo-600 font-display">3 Ejes</div>
          <div className="text-xs font-semibold text-slate-700 mt-1">Capacitación Clave</div>
          <div className="text-[11px] text-slate-400">Construcción, Electricidad, TI</div>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center">
          <div className="text-2xl sm:text-3xl font-extrabold text-teal-600 font-display">7 Zonas</div>
          <div className="text-xs font-semibold text-slate-700 mt-1">Territorios Integrados</div>
          <div className="text-[11px] text-slate-400">Eje Cafetero, Valle y Chocó</div>
        </div>
      </div>
    </div>
  );
};

