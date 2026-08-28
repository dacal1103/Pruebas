import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CREDIT_PROGRAMS } from '../../data/mockData';
import { CreditOption } from '../../types';
import {
  Coins,
  ShieldCheck,
  Calendar,
  Percent,
  Calculator,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sparkles,
  ArrowRight,
  Send,
  Building2
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const CreditsSection: React.FC = () => {
  const { user, addSimulation } = useApp();
  const [selectedProgramId, setSelectedProgramId] = useState<string>('cred-blando-1');
  const [amount, setAmount] = useState<number>(15000000);
  const [termMonths, setTermMonths] = useState<number>(36);
  const [showSchedule, setShowSchedule] = useState(false);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);
  const [applicantPurpose, setApplicantPurpose] = useState('');

  const selectedProgram = CREDIT_PROGRAMS.find(p => p.id === selectedProgramId) || CREDIT_PROGRAMS[1];

  // Financial simulation math
  const monthlyRate = selectedProgram.interestRateMonthly / 100;
  const gracePeriod = selectedProgram.gracePeriodMonths; // e.g. 6 months
  const repaymentMonths = Math.max(1, termMonths - gracePeriod);

  // Amortization installment after grace period (French amortization system)
  const monthlyInstallment = Math.round(
    (amount * monthlyRate * Math.pow(1 + monthlyRate, repaymentMonths)) /
    (Math.pow(1 + monthlyRate, repaymentMonths) - 1)
  );

  const totalPayment = monthlyInstallment * repaymentMonths;
  const totalInterest = Math.max(0, totalPayment - amount);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    setApplicationSubmitted(true);
    addSimulation({
      program: selectedProgram.name,
      amount,
      termMonths,
      gracePeriod,
      monthlyInstallment,
      date: new Date().toLocaleDateString('es-CO')
    });
    try {
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
    } catch (_) {}
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-emerald-950 text-white rounded-2xl p-6 sm:p-8 border border-amber-800/40 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-semibold">
              <Coins className="w-3.5 h-3.5" />
              Microfinanzas & Créditos de Fomento Regional
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display">
              Microcréditos y Créditos Blandos con 6 Meses de Gracia
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Financiamiento a tu medida respaldado por cooperativas financieras y entidades gremiales. Si vas a emprender como independiente o tienes un negocio constituido, accede a tasas preferenciales y hasta 6 meses de gracia para empezar a pagar.
            </p>
          </div>

          <div className="bg-amber-900/40 backdrop-blur-md rounded-xl p-4 border border-amber-500/30 text-xs space-y-1 shrink-0 text-amber-200">
            <div className="font-bold text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Alivio Financiero Real
            </div>
            <p className="text-[11px]">0 cuotas de capital durante los primeros 6 meses para que tu negocio madure.</p>
          </div>
        </div>
      </div>

      {/* Program Selector Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {CREDIT_PROGRAMS.map((prog) => {
          const isSelected = prog.id === selectedProgramId;
          return (
            <button
              key={prog.id}
              id={`select-credit-${prog.id}`}
              onClick={() => {
                setSelectedProgramId(prog.id);
                setAmount(prog.minAmount + (prog.maxAmount - prog.minAmount) * 0.25);
                setTermMonths(prog.termMonthsOptions[1] || prog.termMonthsOptions[0]);
                setApplicationSubmitted(false);
              }}
              className={`p-5 rounded-2xl text-left border transition cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-amber-50/80 border-amber-500 shadow-md ring-2 ring-amber-400/20'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {prog.targetRole}
                  </span>
                  {prog.gracePeriodMonths > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-200 text-amber-900 rounded-full">
                      {prog.gracePeriodMonths} Meses de Gracia
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-slate-900 text-sm leading-snug font-display">
                  {prog.name}
                </h3>

                <div className="text-xs text-slate-600">
                  Monto: ${prog.minAmount.toLocaleString('es-CO')} - ${prog.maxAmount.toLocaleString('es-CO')} COP
                </div>
                <div className="text-xs font-bold text-emerald-700">
                  Tasa blanda desde {prog.interestRateMonthly}% mes vencido
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] text-slate-500 flex items-center justify-between">
                <span>{prog.backedBy}</span>
                <span className={`font-bold ${isSelected ? 'text-amber-800' : 'text-slate-400'}`}>
                  {isSelected ? '✓ Seleccionado' : 'Elegir'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Interactive Simulator & Application Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Financial Simulator Controls (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="font-bold text-slate-900 text-base font-display flex items-center gap-2">
              <Calculator className="w-5 h-5 text-amber-600" />
              Simulador de Cuota y Cronograma con Período de Gracia
            </h3>
            <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded">
              Tasa: {selectedProgram.interestRateMonthly}% M.V.
            </span>
          </div>

          {/* Amount Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">Monto del Crédito a Solicitar:</label>
              <span className="text-base font-extrabold text-slate-900 font-display">
                ${amount.toLocaleString('es-CO')} COP
              </span>
            </div>
            <input
              id="credit-amount-slider"
              type="range"
              min={selectedProgram.minAmount}
              max={selectedProgram.maxAmount}
              step={selectedProgram.id === 'cred-micro-1' ? 200000 : 1000000}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>Mín: ${selectedProgram.minAmount.toLocaleString('es-CO')}</span>
              <span>Máx: ${selectedProgram.maxAmount.toLocaleString('es-CO')}</span>
            </div>
          </div>

          {/* Term Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">Plazo Total de Financiamiento:</label>
            <div className="grid grid-cols-5 gap-2">
              {selectedProgram.termMonthsOptions.map((months) => (
                <button
                  key={months}
                  id={`term-btn-${months}`}
                  onClick={() => setTermMonths(months)}
                  className={`py-2 text-xs font-bold rounded-xl border transition cursor-pointer ${
                    termMonths === months
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {months} Meses
                </button>
              ))}
            </div>
          </div>

          {/* Grace Period Highlight Box */}
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-300/80 space-y-2">
            <div className="flex items-center justify-between">
              <div className="font-bold text-amber-950 text-xs flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-700" />
                Período de Gracia: {gracePeriod} Meses
              </div>
              <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
                Garantizado por convenio
              </span>
            </div>
            <p className="text-xs text-amber-900 leading-relaxed">
              Durante los meses <strong>1 al {gracePeriod}</strong> tu cuota de amortización es <strong>$0 COP</strong>. Empiezas a pagar tu primera cuota regular en el <strong>Mes {gracePeriod + 1}</strong>.
            </p>
          </div>

          {/* Financial Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-[11px] text-slate-500 font-medium">Cuota Mes 1 a {gracePeriod}</div>
              <div className="text-base font-extrabold text-emerald-600 font-display mt-0.5">$0 COP</div>
              <div className="text-[10px] text-slate-400">Gracia total</div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-[11px] text-slate-500 font-medium">Cuota Mensual (Mes {gracePeriod + 1} en adelante)</div>
              <div className="text-base font-extrabold text-slate-900 font-display mt-0.5">
                ${monthlyInstallment.toLocaleString('es-CO')}
              </div>
              <div className="text-[10px] text-slate-400">{repaymentMonths} cuotas fijas</div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 col-span-2 sm:col-span-1">
              <div className="text-[11px] text-slate-500 font-medium">Total a Financiar</div>
              <div className="text-base font-extrabold text-slate-900 font-display mt-0.5">
                ${totalPayment.toLocaleString('es-CO')}
              </div>
              <div className="text-[10px] text-slate-400">Capital + Interés blando</div>
            </div>
          </div>

          {/* Toggle Schedule View */}
          <div className="pt-2">
            <button
              onClick={() => setShowSchedule(!showSchedule)}
              className="text-xs font-bold text-amber-800 hover:text-amber-900 underline flex items-center gap-1 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>{showSchedule ? 'Ocultar tabla de amortización' : 'Ver tabla de pagos mes a mes'}</span>
            </button>

            {showSchedule && (
              <div className="mt-3 max-h-48 overflow-y-auto border border-slate-200 rounded-xl text-xs">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0">
                    <tr>
                      <th className="p-2 border-b border-slate-200">Mes</th>
                      <th className="p-2 border-b border-slate-200">Estado</th>
                      <th className="p-2 border-b border-slate-200 text-right">Valor Cuota</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600 text-[11px]">
                    {Array.from({ length: termMonths }).map((_, idx) => {
                      const monthNum = idx + 1;
                      const isGrace = monthNum <= gracePeriod;
                      return (
                        <tr key={idx} className={isGrace ? 'bg-amber-50/50 font-medium' : ''}>
                          <td className="p-2">Mes {monthNum}</td>
                          <td className="p-2">
                            {isGrace ? (
                              <span className="text-amber-700 font-bold">✨ Período de Gracia (Sin pago)</span>
                            ) : (
                              <span className="text-slate-600">Amortización normal</span>
                            )}
                          </td>
                          <td className="p-2 text-right font-bold">
                            {isGrace ? '$0 COP' : `$${monthlyInstallment.toLocaleString('es-CO')} COP`}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right: Instant Pre-Approval Application Form (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base font-display flex items-center gap-2">
                <Send className="w-4 h-4 text-emerald-600" />
                Pre-Aprobación en Línea
              </h3>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                Respuesta en 24h
              </span>
            </div>

            {applicationSubmitted ? (
              <div className="p-5 bg-emerald-50 border border-emerald-300 text-emerald-950 rounded-2xl space-y-3 animate-in zoom-in-95">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                  ✓
                </div>
                <h4 className="font-bold text-slate-900 text-sm">
                  ¡Solicitud de Crédito Pre-Aprobada!
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  Estimado(a) <strong>{user.name}</strong>, tu solicitud por <strong>${amount.toLocaleString('es-CO')} COP</strong> con <strong>{gracePeriod} meses de gracia</strong> ha sido recibida satisfactoriamente por nuestro comité financiero aliado.
                </p>
                <div className="p-3 bg-white rounded-xl border border-emerald-200 text-[11px] text-slate-600 space-y-1">
                  <div>📞 Teléfono de contacto: {user.phone}</div>
                  <div>🏢 Entidad operadora: {selectedProgram.backedBy}</div>
                  <div>📅 Inicio de cuota 1: Mes {gracePeriod + 1}</div>
                </div>
                <button
                  onClick={() => setApplicationSubmitted(false)}
                  className="w-full py-2 text-xs font-bold text-emerald-800 bg-emerald-200/70 hover:bg-emerald-200 rounded-xl"
                >
                  Nueva Simulación
                </button>
              </div>
            ) : (
              <form onSubmit={handleApply} className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Nombre del Titular o Razón Social:</label>
                  <input
                    type="text"
                    defaultValue={user.name}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Cédula o NIT:</label>
                  <input
                    type="text"
                    defaultValue="1088234901"
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Destino de los Recursos:</label>
                  <textarea
                    rows={3}
                    value={applicantPurpose}
                    onChange={(e) => setApplicantPurpose(e.target.value)}
                    required
                    placeholder="Ej: Compra de maquinaria para confección en Pereira, capital de trabajo para insumos eléctricos..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:outline-hidden focus:border-amber-500"
                  />
                </div>

                <div className="space-y-2 pt-1">
                  <div className="text-[11px] font-semibold text-slate-700">Requisitos indispensables:</div>
                  <ul className="space-y-1 text-[11px] text-slate-500">
                    {selectedProgram.requirements.map((req, rIdx) => (
                      <li key={rIdx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  id="submit-credit-app-btn"
                  type="submit"
                  className="w-full mt-2 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Enviar Solicitud con 6 Meses de Gracia</span>
                </button>
              </form>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Operación respaldada por la Red de Fomento y Cooperativas Aliadas.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
