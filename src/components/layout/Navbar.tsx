import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  Sparkles,
  ShoppingBag,
  HeartHandshake,
  Award,
  Briefcase,
  Coins,
  GraduationCap,
  TrendingUp,
  MapPin,
  User,
  ShieldCheck,
  Menu,
  X,
  Compass,
  Building2,
  ChevronDown
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    selectedTerritory,
    setSelectedTerritory,
    cart,
    setIsCartOpen,
    user,
    switchRole
  } = useApp();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);

  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);

  const navItems = [
    { id: 'inicio', label: 'Inicio', icon: Building2 },
    { id: 'optilogic', label: 'OptiLogic AI & Sofía', icon: Compass, badge: 'PL + RAG' },
    { id: 'vitrina', label: 'Vitrina Hecho en Chocó/Pereira', icon: ShoppingBag },
    { id: 'habilidades', label: 'Validador de Habilidades', icon: Award, badge: 'IA' },
    { id: 'empleo', label: 'Bolsa de Empleo', icon: Briefcase },
    { id: 'creditos', label: 'Microcréditos 6M', icon: Coins, badge: '0% 6 Meses' },
    { id: 'capacitacion', label: 'Capacitaciones', icon: GraduationCap },
    { id: 'psicologia', label: 'Apoyo Psicológico', icon: HeartHandshake },
    { id: 'optimizador', label: 'Costos PYME', icon: TrendingUp },
  ];

  const rolesList: Array<{ role: UserRole; label: string }> = [
    { role: 'independiente', label: 'Independiente / Emprendedor' },
    { role: 'empleado', label: 'Empleado / Profesional' },
    { role: 'desempleado', label: 'En Búsqueda de Oportunidades' },
    { role: 'pequeno_negocio', label: 'Microempresa / Taller' },
    { role: 'pyme', label: 'PYME en Expansión' },
    { role: 'gran_empresa', label: 'Corporativo / Gran Empresa' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Logo & Brand */}
          <div
            onClick={() => setActiveTab('inicio')}
            className="flex items-center gap-2.5 cursor-pointer select-none shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-emerald-600 to-teal-400 text-white font-black flex items-center justify-center text-base shadow-sm ring-2 ring-emerald-500/20">
              IR
            </div>
            <div>
              <div className="flex items-center gap-1.5 leading-tight">
                <span className="font-extrabold text-slate-900 text-base tracking-tight">
                  Impulsa <span className="text-emerald-600 font-black">&</span> OptiLogic
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-semibold tracking-wide flex items-center gap-1">
                <span>Ecosistema Regional & Decisiones IA</span>
              </p>
            </div>
          </div>

          {/* Territory Selector */}
          <div className="hidden xl:flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold border border-slate-200">
            <button
              onClick={() => setSelectedTerritory('pereira')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                selectedTerritory === 'pereira'
                  ? 'bg-white text-emerald-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ☕ Pereira & Eje
            </button>
            <button
              onClick={() => setSelectedTerritory('choco')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                selectedTerritory === 'choco'
                  ? 'bg-white text-emerald-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🌿 Chocó & Pacífico
            </button>
            <button
              onClick={() => setSelectedTerritory('colombia')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                selectedTerritory === 'colombia'
                  ? 'bg-white text-emerald-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🇨🇴 Nacional
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
            {navItems.slice(0, 6).map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-full font-extrabold ${
                        isActive
                          ? 'bg-emerald-400 text-slate-950'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons & Role Switcher */}
          <div className="flex items-center gap-2">
            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 rounded-xl text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer"
              title="Ver Carrito de Compras"
            >
              <ShoppingBag className="w-4 h-4" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                  {cartItemsCount}
                </span>
              )}
            </button>

            {/* Role dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-800 transition cursor-pointer"
              >
                <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black">
                  {user.name.charAt(0)}
                </div>
                <div className="text-left leading-tight hidden md:block">
                  <span className="text-[11px] font-bold block">{user.name.split(' ')[0]}</span>
                  <span className="text-[9px] text-slate-500 font-normal capitalize">
                    {user.role.replace('_', ' ')}
                  </span>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isRoleMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in">
                  <div className="p-2 border-b border-slate-100">
                    <div className="text-xs font-extrabold text-slate-900">{user.name}</div>
                    <div className="text-[11px] text-slate-500">{user.city}, {user.department}</div>
                    <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      <ShieldCheck className="w-3 h-3" /> Verificación Aliada
                    </div>
                  </div>

                  <div className="py-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2 py-1 block">
                      Cambiar Perfil Demo
                    </span>
                    {rolesList.map((r) => (
                      <button
                        key={r.role}
                        onClick={() => {
                          switchRole(r.role);
                          setIsRoleMenuOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium transition flex items-center justify-between cursor-pointer ${
                          user.role === r.role
                            ? 'bg-emerald-50 text-emerald-800 font-bold'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span>{r.label}</span>
                        {user.role === r.role && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 hover:bg-slate-100 lg:hidden cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Secondary Sub-Navbar on Desktop */}
        <div className="hidden lg:flex items-center justify-between py-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1">
            {navItems.slice(6).map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    isActive
                      ? 'bg-emerald-100 text-emerald-900 font-bold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
            <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              IA Multi-Agente Activa
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white p-4 space-y-3 animate-in slide-in-from-top-2">
          {/* Territory Selector Mobile */}
          <div className="flex gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setSelectedTerritory('pereira')}
              className={`flex-1 py-1.5 rounded-lg text-center ${
                selectedTerritory === 'pereira' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              Pereira
            </button>
            <button
              onClick={() => setSelectedTerritory('choco')}
              className={`flex-1 py-1.5 rounded-lg text-center ${
                selectedTerritory === 'choco' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              Chocó
            </button>
            <button
              onClick={() => setSelectedTerritory('colombia')}
              className={`flex-1 py-1.5 rounded-lg text-center ${
                selectedTerritory === 'colombia' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              Nacional
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition ${
                    isActive
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] bg-emerald-500 text-white px-1.5 py-0.5 rounded-full font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
