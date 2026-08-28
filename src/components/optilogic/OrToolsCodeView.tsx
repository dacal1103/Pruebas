import React, { useState } from 'react';
import { Terminal, Copy, Check, Download, ExternalLink, Code2, Cpu, FileCode2 } from 'lucide-react';
import { LPModel } from '../../types';

interface OrToolsCodeViewProps {
  model: LPModel;
}

export const OrToolsCodeView: React.FC<OrToolsCodeViewProps> = ({ model }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(model.orToolsPythonCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([model.orToolsPythonCode], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ortools_model_${model.id}.py`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Terminal className="h-5 w-5 text-blue-600" />
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Código Python Google OR-Tools ({model.orToolsSolverName || 'GLOP'})
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Script en Python listo para producción utilizando el backend de optimización lineal de Google.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                  <span className="text-emerald-600 font-medium">Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copiar Script</span>
                </>
              )}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-colors cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Descargar .py</span>
            </button>
          </div>
        </div>
      </div>

      {/* Code Editor Container */}
      <div className="rounded-xl border border-slate-200 bg-slate-900 overflow-hidden shadow-sm">
        {/* Terminal Title Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
            </div>
            <span className="ml-2 font-mono text-xs text-slate-400 flex items-center gap-1.5">
              <FileCode2 className="h-3.5 w-3.5 text-blue-400" />
              linear_optimization_ortools.py
            </span>
          </div>
          <span className="rounded bg-slate-800 px-2 py-0.5 font-mono text-[10px] text-slate-300">
            Python 3.10+ | ortools==9.9+
          </span>
        </div>

        {/* Code Content */}
        <div className="p-4 sm:p-5 overflow-x-auto max-h-[520px]">
          <pre className="font-mono text-xs sm:text-[13px] text-slate-100 leading-relaxed whitespace-pre font-normal">
            <code>{model.orToolsPythonCode}</code>
          </pre>
        </div>
      </div>

      {/* Quick Setup & Execution Guide */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 mb-1">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-50 text-[10px] text-blue-600 font-mono font-bold">
              1
            </span>
            <span>Instalar Google OR-Tools</span>
          </div>
          <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 font-mono text-xs text-blue-600 mt-2 font-medium">
            pip install ortools
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 mb-1">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-50 text-[10px] text-blue-600 font-mono font-bold">
              2
            </span>
            <span>Backend de Solución</span>
          </div>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            Utiliza <strong className="text-slate-900">GLOP</strong> (Google Linear Optimization Package) para problemas continuos y <strong className="text-slate-900">CBC / SCIP</strong> para enteros.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 mb-1">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-50 text-[10px] text-blue-600 font-mono font-bold">
              3
            </span>
            <span>Extracción Dual & Holgura</span>
          </div>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            El método <code className="text-blue-600 font-mono bg-blue-50 px-1 py-0.5 rounded">c.dual_value()</code> obtiene los precios sombra de cada restricción en Google OR-Tools.
          </p>
        </div>
      </div>
    </div>
  );
};
