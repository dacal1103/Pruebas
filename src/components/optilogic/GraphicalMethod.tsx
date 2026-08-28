import React, { useState, useMemo, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Compass,
  Info,
  CheckCircle2,
  Crosshair,
  HelpCircle,
  Sparkles,
  Volume2,
  VolumeX,
  Lightbulb,
} from 'lucide-react';
import { LPModel, OptimizationResult, GraphicalMethodPoint } from '../../types';
import { computeGraphicalMethod } from '../../utils/solver';
import { LatexRenderer } from '../common/LatexRenderer';

interface GraphicalMethodProps {
  model: LPModel;
  solution: OptimizationResult;
  fixedVarValues?: Record<string, number>;
}

export const GraphicalMethod: React.FC<GraphicalMethodProps> = ({
  model,
  solution,
  fixedVarValues = {},
}) => {
  const vars = model.variables;
  const [varXId, setVarXId] = useState<string>(vars[0]?.id || 'var_x1');
  const [varYId, setVarYId] = useState<string>(vars[1]?.id || vars[0]?.id || 'var_x2');

  const [hoveredPoint, setHoveredPoint] = useState<GraphicalMethodPoint | null>(null);
  const [hoveredLineId, setHoveredLineId] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showIsoLine, setShowIsoLine] = useState(true);
  const [isAnimatingIso, setIsAnimatingIso] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const animFrameRef = useRef<number | null>(null);

  // If variables change, ensure valid selection
  React.useEffect(() => {
    if (!vars.some((v) => v.id === varXId) && vars[0]) {
      setVarXId(vars[0].id);
    }
    if (!vars.some((v) => v.id === varYId) && vars[1]) {
      setVarYId(vars[1].id);
    }
  }, [vars, varXId, varYId]);

  // Compute 2D geometry
  const graphData = useMemo(() => {
    return computeGraphicalMethod(model, varXId, varYId, fixedVarValues);
  }, [model, varXId, varYId, fixedVarValues]);

  const optimalZ = graphData.optimalPoint?.zValue ?? solution.objectiveValue ?? 0;
  const [isoZValue, setIsoZValue] = useState<number>(optimalZ || 100);

  // Update iso line to optimal initially or when solution updates
  React.useEffect(() => {
    if (solution.status === 'OPTIMAL' || graphData.optimalPoint) {
      setIsoZValue(graphData.optimalPoint?.zValue ?? solution.objectiveValue ?? 100);
    }
  }, [solution.objectiveValue, solution.status, graphData.optimalPoint]);

  // Handle Iso-line animation
  const startIsoAnimation = () => {
    if (isAnimatingIso) {
      setIsAnimatingIso(false);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    setIsAnimatingIso(true);
    let currentZ = 0;
    const targetZ = optimalZ;
    const step = Math.max(1, targetZ / 80);

    const animate = () => {
      currentZ += step;
      if (currentZ >= targetZ) {
        setIsoZValue(targetZ);
        setIsAnimatingIso(false);
      } else {
        setIsoZValue(Math.round(currentZ * 10) / 10);
        animFrameRef.current = requestAnimationFrame(animate);
      }
    };
    animFrameRef.current = requestAnimationFrame(animate);
  };

  React.useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const varX = vars.find((v) => v.id === varXId) || vars[0];
  const varY = vars.find((v) => v.id === varYId) || vars[1] || vars[0];

  const optimalX = graphData.optimalPoint?.x ?? 0;
  const optimalY = graphData.optimalPoint?.y ?? 0;
  const trueOptimalZ = (graphData.optimalPoint?.zValue ?? solution.objectiveValue) || (solution.objectiveValue ?? 0);
  const isMax = model.objective.type === 'maximize';

  // Generate friendly conversational explanation
  const friendlyExplanation = useMemo(() => {
    const actionSentence = `Para tu caso '${model.problemTitle}', la decisión ideal es producir o asignar ${optimalX} ${varX.unit || 'unidades'} en ${varX.name} y ${optimalY} ${varY.unit || 'unidades'} en ${varY.name}.`;
    const resultSentence = `Con este plan logras un resultado óptimo de $${trueOptimalZ.toLocaleString()} USD (${isMax ? 'máximo beneficio posible' : 'costo operativo más bajo'}).`;
    const whySentence = `¿Por qué esta es la mejor combinación? La IA evaluó todos los límites y capacidades de tu negocio. Este punto exacto es el único que satisface al 100% tus metas sin desperdiciar dinero ni sobrecargar tus recursos.`;

    return {
      actionSentence,
      resultSentence,
      whySentence,
      fullSpokenText: `${actionSentence} ${resultSentence} ${whySentence}`,
    };
  }, [model.problemTitle, optimalX, optimalY, varX, varY, trueOptimalZ, isMax]);

  // Audio Speech Narration
  const toggleSpeechNarration = () => {
    if (!('speechSynthesis' in window)) {
      alert('Tu navegador no soporta síntesis de voz.');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    window.speechSynthesis.cancel();

    const cleanText = friendlyExplanation.fullSpokenText
      .replace(/[*#_`>]/g, '')
      .replace(/•/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'es-ES';
    utterance.rate = 1.0;
    utterance.pitch = 1.05;

    const voices = window.speechSynthesis.getVoices();
    const spanishVoice =
      voices.find(
        (v) =>
          v.lang.startsWith('es') &&
          (v.name.includes('Natural') ||
            v.name.includes('Google') ||
            v.name.includes('Paulina') ||
            v.name.includes('Mónica') ||
            v.name.includes('Helena'))
      ) || voices.find((v) => v.lang.startsWith('es'));

    if (spanishVoice) {
      utterance.voice = spanishVoice;
    }

    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    setIsPlayingAudio(true);
    window.speechSynthesis.speak(utterance);
  };

  // SVG Coordinate Transformation
  const width = 640;
  const height = 480;
  const padding = 65;

  const maxX = Math.max(10, graphData.bounds.maxX * zoomLevel);
  const maxY = Math.max(10, graphData.bounds.maxY * zoomLevel);

  const scaleX = (x: number) => padding + (x / maxX) * (width - 2 * padding);
  const scaleY = (y: number) => height - padding - (y / maxY) * (height - 2 * padding);
  const unscaleX = (svgX: number) => ((svgX - padding) / (width - 2 * padding)) * maxX;
  const unscaleY = (svgY: number) => ((height - padding - svgY) / (height - 2 * padding)) * maxY;

  // Build SVG polygon points
  const polygonPointsStr = useMemo(() => {
    if (graphData.feasiblePolygon.length < 3) return '';
    return graphData.feasiblePolygon
      .map((pt) => `${scaleX(pt.x)},${scaleY(pt.y)}`)
      .join(' ');
  }, [graphData.feasiblePolygon, maxX, maxY, zoomLevel]);

  // Compute Iso-profit / Iso-cost Line endpoints
  const cX = model.objective.coefficients[varXId] ?? 0;
  const cY = model.objective.coefficients[varYId] ?? 0;

  const isoLinePoints = useMemo(() => {
    if (Math.abs(cX) < 1e-6 && Math.abs(cY) < 1e-6) return null;
    const Z = isoZValue;

    let p1 = { x: 0, y: 0 };
    let p2 = { x: 0, y: 0 };

    if (Math.abs(cY) < 1e-6) {
      const x = Z / cX;
      p1 = { x, y: 0 };
      p2 = { x, y: maxY };
    } else if (Math.abs(cX) < 1e-6) {
      const y = Z / cY;
      p1 = { x: 0, y };
      p2 = { x: maxX, y };
    } else {
      // cX * x + cY * y = Z -> y = (Z - cX * x) / cY
      const y0 = Z / cY;
      const x0 = Z / cX;
      p1 = { x: 0, y: y0 };
      p2 = { x: maxX, y: (Z - cX * maxX) / cY };
    }

    return {
      x1: scaleX(p1.x),
      y1: scaleY(p1.y),
      x2: scaleX(p2.x),
      y2: scaleY(p2.y),
    };
  }, [cX, cY, isoZValue, maxX, maxY, zoomLevel]);

  // Axis grid ticks
  const numTicks = 6;
  const xTicks = Array.from({ length: numTicks + 1 }, (_, i) => Math.round((maxX / numTicks) * i));
  const yTicks = Array.from({ length: numTicks + 1 }, (_, i) => Math.round((maxY / numTicks) * i));

  return (
    <div className="space-y-6">
      {/* Top Header & Variable Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="h-5 w-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">
              Método Gráfico 2D & Región Factible
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Visualización geométrica de vértices extremos, restricciones activas y curva de isoutilidad.
          </p>
        </div>

        {/* Projection axis selection if >2 variables */}
        {vars.length > 2 && (
          <div className="flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-200 p-2 text-xs">
            <span className="text-slate-600 font-semibold">Proyectar Ejes:</span>
            <div className="flex items-center gap-1">
              <span className="font-mono text-blue-600 font-bold">X:</span>
              <select
                value={varXId}
                onChange={(e) => setVarXId(e.target.value)}
                className="rounded bg-white border border-slate-300 px-2 py-1 text-slate-700 text-xs focus:outline-none"
              >
                {vars.map((v) => (
                  <option key={v.id} value={v.id} disabled={v.id === varYId}>
                    {v.symbol} ({v.name})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-mono text-indigo-600 font-bold">Y:</span>
              <select
                value={varYId}
                onChange={(e) => setVarYId(e.target.value)}
                className="rounded bg-white border border-slate-300 px-2 py-1 text-slate-700 text-xs focus:outline-none"
              >
                {vars.map((v) => (
                  <option key={v.id} value={v.id} disabled={v.id === varXId}>
                    {v.symbol} ({v.name})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Main Canvas & Inspection Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left SVG Chart (8 cols) */}
        <div className="lg:col-span-8 rounded-xl border border-slate-200 bg-white p-4 sm:p-5 flex flex-col items-center relative overflow-hidden shadow-sm">
          {/* Chart Toolbars */}
          <div className="w-full flex items-center justify-between gap-2 mb-3 z-10">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-semibold text-blue-700">
                <span className="h-2 w-2 rounded-full bg-blue-600" />
                Región Factible ({graphData.vertices.length} Vértices)
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.2))}
                title="Alejar Zoom"
                className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-xs"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <button
                onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.2))}
                title="Acercar Zoom"
                className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-xs"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                title="Restablecer Vista"
                className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-xs"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* SVG Canvas */}
          <div className="w-full relative flex justify-center items-center bg-slate-50/70 rounded-xl p-2 border border-slate-100">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-auto max-h-[520px] select-none"
            >
              <defs>
                {/* Feasible Region Gradient */}
                <linearGradient id="feasibleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.22" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.12" />
                </linearGradient>
                {/* Glow Filter for Optimal Vertex */}
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Grid Lines */}
              {xTicks.map((xVal, i) => (
                <g key={`x-grid-${i}`}>
                  <line
                    x1={scaleX(xVal)}
                    y1={scaleY(0)}
                    x2={scaleX(xVal)}
                    y2={scaleY(maxY)}
                    stroke="#e2e8f0"
                    strokeDasharray="3 3"
                    strokeWidth="1"
                  />
                  <text
                    x={scaleX(xVal)}
                    y={height - padding + 18}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {xVal}
                  </text>
                </g>
              ))}

              {yTicks.map((yVal, i) => (
                <g key={`y-grid-${i}`}>
                  <line
                    x1={scaleX(0)}
                    y1={scaleY(yVal)}
                    x2={scaleX(maxX)}
                    y2={scaleY(yVal)}
                    stroke="#e2e8f0"
                    strokeDasharray="3 3"
                    strokeWidth="1"
                  />
                  <text
                    x={padding - 12}
                    y={scaleY(yVal) + 3}
                    textAnchor="end"
                    fill="#94a3b8"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {yVal}
                  </text>
                </g>
              ))}

              {/* Main Axes */}
              {/* X Axis */}
              <line
                x1={scaleX(0)}
                y1={scaleY(0)}
                x2={scaleX(maxX)}
                y2={scaleY(0)}
                stroke="#64748b"
                strokeWidth="2"
              />
              {/* Y Axis */}
              <line
                x1={scaleX(0)}
                y1={scaleY(0)}
                x2={scaleX(0)}
                y2={scaleY(maxY)}
                stroke="#64748b"
                strokeWidth="2"
              />

              {/* Axis Titles */}
              <text
                x={width - padding + 5}
                y={scaleY(0) + 4}
                fill="#2563eb"
                fontSize="12"
                fontWeight="bold"
                fontFamily="monospace"
              >
                {varX.symbol}
              </text>
              <text
                x={scaleX(0) - 10}
                y={padding - 15}
                fill="#4f46e5"
                fontSize="12"
                fontWeight="bold"
                fontFamily="monospace"
                textAnchor="middle"
              >
                {varY.symbol}
              </text>

              {/* Feasible Region Polygon */}
              {polygonPointsStr && (
                <polygon
                  points={polygonPointsStr}
                  fill="url(#feasibleGrad)"
                  stroke="#2563eb"
                  strokeWidth="2"
                  strokeDasharray="6 3"
                  className="transition-all duration-300"
                />
              )}

              {/* Constraint Boundary Lines */}
              {graphData.constraintLines.map((line) => {
                const isHovered = hoveredLineId === line.id;
                return (
                  <g
                    key={line.id}
                    onMouseEnter={() => setHoveredLineId(line.id)}
                    onMouseLeave={() => setHoveredLineId(null)}
                    className="cursor-pointer"
                  >
                    <line
                      x1={scaleX(line.p1.x)}
                      y1={scaleY(line.p1.y)}
                      x2={scaleX(line.p2.x)}
                      y2={scaleY(line.p2.y)}
                      stroke={line.color}
                      strokeWidth={isHovered ? '3.5' : '2'}
                      strokeOpacity={isHovered ? 1 : 0.85}
                    />
                  </g>
                );
              })}

              {/* Iso-Profit / Iso-Cost Line */}
              {showIsoLine && isoLinePoints && (
                <g>
                  <line
                    x1={isoLinePoints.x1}
                    y1={isoLinePoints.y1}
                    x2={isoLinePoints.x2}
                    y2={isoLinePoints.y2}
                    stroke="#d97706"
                    strokeWidth="2.5"
                    strokeDasharray="5 4"
                    className="transition-all duration-75"
                  />
                  {/* Label for Iso-Line */}
                  <text
                    x={Math.min(width - padding - 40, (isoLinePoints.x1 + isoLinePoints.x2) / 2)}
                    y={Math.max(padding + 20, (isoLinePoints.y1 + isoLinePoints.y2) / 2 - 8)}
                    fill="#b45309"
                    fontSize="11"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    Z = ${isoZValue.toLocaleString()}
                  </text>
                </g>
              )}

              {/* Feasible Region Extreme Points / Vertices */}
              {graphData.vertices.map((pt, idx) => {
                const isOpt = pt.isOptimal;
                const isHover = hoveredPoint === pt;

                return (
                  <g
                    key={`vertex-${idx}`}
                    onMouseEnter={() => setHoveredPoint(pt)}
                    onMouseLeave={() => setHoveredPoint(null)}
                    className="cursor-pointer"
                  >
                    {isOpt ? (
                      // Glowing Optimal Target
                      <g filter="url(#glow)">
                        <circle
                          cx={scaleX(pt.x)}
                          cy={scaleY(pt.y)}
                          r="9"
                          fill="#10b981"
                          fillOpacity="0.3"
                          className="animate-ping"
                        />
                        <circle
                          cx={scaleX(pt.x)}
                          cy={scaleY(pt.y)}
                          r="6"
                          fill="#16a34a"
                          stroke="#ffffff"
                          strokeWidth="2"
                        />
                        {/* Optimal text badge */}
                        <rect
                          x={scaleX(pt.x) + 10}
                          y={scaleY(pt.y) - 24}
                          width="110"
                          height="22"
                          rx="4"
                          fill="#ffffff"
                          stroke="#16a34a"
                          strokeWidth="1.5"
                        />
                        <text
                          x={scaleX(pt.x) + 16}
                          y={scaleY(pt.y) - 10}
                          fill="#15803d"
                          fontSize="10"
                          fontWeight="bold"
                          fontFamily="monospace"
                        >
                          ÓPTIMO ({pt.x}, {pt.y})
                        </text>
                      </g>
                    ) : (
                      // Regular Feasible Vertex
                      <circle
                        cx={scaleX(pt.x)}
                        cy={scaleY(pt.y)}
                        r={isHover ? 6 : 4.5}
                        fill="#0284c7"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Hover Tooltip Overlay */}
            {hoveredPoint && (
              <div className="absolute bottom-4 left-6 rounded-xl border border-slate-200 bg-white p-3 shadow-xl text-xs z-30 pointer-events-none">
                <div className="flex items-center gap-1.5 text-emerald-600 font-bold mb-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Vértice Factible {hoveredPoint.isOptimal ? '(Óptimo)' : ''}</span>
                </div>
                <div className="font-mono text-slate-800">
                  {varX.symbol} = {hoveredPoint.x} | {varY.symbol} = {hoveredPoint.y}
                </div>
                <div className="font-bold text-amber-700 mt-1">
                  Valor Z = ${hoveredPoint.zValue.toLocaleString()} USD
                </div>
              </div>
            )}
          </div>

          {/* Interactive Iso-Profit Slider & Animation Bar */}
          <div className="w-full mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3.5">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-amber-500" />
                <span className="text-xs font-bold text-slate-800">
                  Simulador de Curva de Nivel (Isoutilidad / Isocosto Z)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={startIsoAnimation}
                  className="flex items-center gap-1.5 rounded-lg bg-amber-100 border border-amber-300 px-2.5 py-1 text-xs font-semibold text-amber-900 hover:bg-amber-200 transition-colors"
                >
                  {isAnimatingIso ? (
                    <>
                      <Pause className="h-3.5 w-3.5" />
                      <span>Pausar</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5" />
                      <span>Deslizar al Óptimo</span>
                    </>
                  )}
                </button>
                <span className="font-mono text-xs font-bold text-amber-800 bg-white px-2 py-1 rounded border border-slate-300">
                  Z = ${isoZValue.toLocaleString()}
                </span>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max={Math.max(100, optimalZ * 1.5)}
              step="1"
              value={isoZValue}
              onChange={(e) => setIsoZValue(parseFloat(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
            <p className="text-[11px] text-slate-500 mt-1.5">
              Arrastra el deslizador para ver cómo la recta {model.objective.type === 'maximize' ? 'avanza hasta el último punto de contacto con la región factible (Vértice Óptimo)' : 'se reduce hasta tocar el mínimo de la región factible'}.
            </p>
          </div>
        </div>

        {/* Right: AI Executive Diagnostic & Friendly Explanations (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* PRIMARY: AI-Generated Friendly Spoken Description Card */}
          <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white shadow-2xs">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    Explicación Amigable con IA
                  </h3>
                  <span className="text-[10px] text-blue-700 font-semibold">
                    Asesora Sofia · Sin fórmulas matemáticas
                  </span>
                </div>
              </div>

              {/* Voice Narration Button */}
              <button
                type="button"
                onClick={toggleSpeechNarration}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer ${
                  isPlayingAudio
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700 animate-pulse'
                    : 'bg-white text-blue-700 border border-blue-200 hover:bg-blue-50'
                }`}
              >
                {isPlayingAudio ? (
                  <>
                    <VolumeX className="h-3.5 w-3.5" />
                    <span>Pausar</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="h-3.5 w-3.5 text-blue-600" />
                    <span>Escuchar Voz</span>
                  </>
                )}
              </button>
            </div>

            {/* Friendly Diagnostic Text Body */}
            <div className="space-y-3 bg-white p-3.5 rounded-xl border border-blue-200/80 text-xs text-slate-700 leading-relaxed shadow-2xs">
              <div className="flex items-start gap-2">
                <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="font-semibold text-slate-800">
                  {friendlyExplanation.actionSentence}
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 font-medium">
                🎯 <strong>Resultado Económico:</strong> {friendlyExplanation.resultSentence}
              </div>

              <p className="text-slate-600 font-normal">
                {friendlyExplanation.whySentence}
              </p>
            </div>
          </div>

          {/* Optimal Solution Card (Human-Friendly) */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 sm:p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Crosshair className="h-5 w-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-emerald-900">
                Plan de Producción Óptimo
              </h3>
            </div>
            {graphData.optimalPoint ? (
              <div className="space-y-2 mt-3">
                <div className="flex items-center justify-between rounded-lg bg-white p-2.5 border border-emerald-200">
                  <span className="text-xs text-slate-700 font-semibold">
                    {varX.name}:
                  </span>
                  <span className="font-mono text-sm font-bold text-blue-700">
                    {optimalX} {varX.unit}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white p-2.5 border border-emerald-200">
                  <span className="text-xs text-slate-700 font-semibold">
                    {varY.name}:
                  </span>
                  <span className="font-mono text-sm font-bold text-indigo-700">
                    {optimalY} {varY.unit}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-white p-2.5 border-2 border-emerald-400 mt-1 shadow-xs">
                  <span className="text-xs text-emerald-900 font-bold">
                    {isMax ? 'Beneficio Máximo Obtenido:' : 'Costo Mínimo Total:'}
                  </span>
                  <span className="font-mono text-base font-extrabold text-emerald-700">
                    ${trueOptimalZ.toLocaleString()} USD
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">No se encontró vértice factible.</p>
            )}
          </div>

          {/* Evaluated Options / Combinations Evaluated */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Opciones Evaluadas ({graphData.vertices.length})
              </h4>
              <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                Comparativa de Planes
              </span>
            </div>
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {graphData.vertices.map((v, i) => (
                <div
                  key={i}
                  onMouseEnter={() => setHoveredPoint(v)}
                  onMouseLeave={() => setHoveredPoint(null)}
                  className={`p-2.5 rounded-xl text-xs transition-all cursor-pointer border ${
                    v.isOptimal
                      ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 shadow-xs'
                      : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          v.isOptimal
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        Plan {i + 1}
                      </span>
                      <span className="font-bold text-slate-800 text-xs">
                        {v.isOptimal ? 'Recomendación Óptima' : `Alternativa ${i + 1}`}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-xs text-slate-900">
                        ${v.zValue.toLocaleString()} USD
                      </span>
                      {v.isOptimal && (
                        <span className="ml-1 text-[10px] text-emerald-700 font-bold uppercase">
                          ★ Mejor
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantities in human terms */}
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600 mt-1">
                    <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-medium">
                      📦 <strong>{v.x}</strong> {varX.unit || 'uds'} de {varX.name}
                    </span>
                    <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-medium">
                      📦 <strong>{v.y}</strong> {varY.unit || 'uds'} de {varY.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Friendly Constraints / Business Limits & Rules */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Límites y Condiciones de Operación
              </h4>
              <span className="text-[10px] text-slate-500 font-medium">Capacidad & Demanda</span>
            </div>
            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
              {graphData.constraintLines.map((line) => {
                const isMaxBound = line.operator === '<=';
                const isMinBound = line.operator === '>=';

                return (
                  <div
                    key={line.id}
                    onMouseEnter={() => setHoveredLineId(line.id)}
                    onMouseLeave={() => setHoveredLineId(null)}
                    className={`p-2.5 rounded-xl text-xs transition-all cursor-pointer border ${
                      hoveredLineId === line.id
                        ? 'bg-blue-50/80 border-blue-300 shadow-2xs'
                        : 'bg-slate-50/70 border-slate-200 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="h-3 w-3 rounded-full shrink-0 shadow-2xs"
                          style={{ backgroundColor: line.color }}
                        />
                        <span className="text-slate-800 font-bold text-xs truncate">
                          {line.name}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 border ${
                          isMaxBound
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : isMinBound
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : 'bg-purple-50 text-purple-800 border-purple-200'
                        }`}
                      >
                        {isMaxBound ? `Tope Máx: ${line.c}` : isMinBound ? `Mínimo: ${line.c}` : `Exacto: ${line.c}`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
