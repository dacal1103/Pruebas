import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, MapPin, PhoneCall, Sparkles, HeartHandshake, Award, Coins, Compass } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setActiveTab } = useApp();

  return (
    <footer className="bg-slate-900 text-slate-400 text-xs mt-16 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-500 to-emerald-400 text-slate-950 font-black flex items-center justify-center text-sm">
                IR
              </div>
              <span className="font-extrabold text-white text-base tracking-tight">
                Impulsa <span className="text-emerald-400">&</span> OptiLogic
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Ecosistema unificado de confianza social, inteligencia de operaciones (OR), bienestar emocional, microcréditos con 6 meses de gracia y fomento productivo para Pereira, Chocó y Colombia.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">
              Módulos Clave
            </h4>
            <ul className="space-y-2 text-[11px]">
              <li>
                <button onClick={() => setActiveTab('optilogic')} className="hover:text-emerald-400 transition cursor-pointer flex items-center gap-1.5">
                  <Compass className="w-3 h-3 text-blue-400" /> OptiLogic AI (Programación Lineal)
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('vitrina')} className="hover:text-emerald-400 transition cursor-pointer">
                  Vitrina "Hecho en Chocó & Pereira"
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('habilidades')} className="hover:text-emerald-400 transition cursor-pointer flex items-center gap-1.5">
                  <Award className="w-3 h-3 text-emerald-400" /> Validador de Habilidades IA
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('creditos')} className="hover:text-emerald-400 transition cursor-pointer flex items-center gap-1.5">
                  <Coins className="w-3 h-3 text-amber-400" /> Créditos con 6 Meses de Gracia
                </button>
              </li>
              <li>
                <button onClick={() => setActiveTab('psicologia')} className="hover:text-emerald-400 transition cursor-pointer flex items-center gap-1.5">
                  <HeartHandshake className="w-3 h-3 text-rose-400" /> Apoyo Psicológico & Asistente
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">
              Entidades Aliadas & Confianza
            </h4>
            <ul className="space-y-2 text-[11px] text-slate-400">
              <li>Cámara de Comercio de Pereira por Risaralda</li>
              <li>Cámara de Comercio del Chocó</li>
              <li>SENA Regional Risaralda & Chocó</li>
              <li>Red Cooperativa Financiera Regional</li>
              <li>Google OR-Tools & Gemini Decision Engine</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px] mb-2">
              Líneas de Atención
            </h4>
            <div className="p-3 bg-slate-800/90 rounded-2xl border border-slate-700 space-y-1.5 text-[11px]">
              <div className="flex items-center gap-1.5 text-rose-400 font-bold">
                <PhoneCall className="w-3.5 h-3.5" />
                Salud Mental & Contención: Línea 106
              </div>
              <div className="text-slate-300">Asesoría Créditos & Finanzas: (606) 313 5600</div>
              <div className="text-slate-400 text-[10px]">Pereira • Quibdó • Manizales • Colombia</div>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <p>&copy; {new Date().getFullYear()} Impulsa & OptiLogic Regional. Desarrollado para el fortalecimiento del tejido socioeconómico y toma óptima de decisiones.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Datos 100% Seguros</span>
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-amber-400" /> Hecho en Pereira & Chocó</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
