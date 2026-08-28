import React, { useState, useEffect } from 'react';
import {
  Database,
  Building2,
  FileText,
  Search,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Layers,
  Cpu,
  RefreshCw,
  X,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Percent,
  MessageSquare,
  Bot,
} from 'lucide-react';
import {
  CompanyProfile,
  VectorRecord,
  VectorDatabaseStats,
  VectorSearchResult,
  CompanyPlant,
  CompanyProduct,
  CompanyResource,
} from '../../types';

interface VectorDbManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdated?: (profile: CompanyProfile) => void;
}

export const VectorDbManagerModal: React.FC<VectorDbManagerModalProps> = ({
  isOpen,
  onClose,
  onProfileUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'ingest' | 'explorer'>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Company Profile Form State
  const [profile, setProfile] = useState<CompanyProfile>({
    id: 'comp_1',
    companyName: '',
    industry: '',
    businessSummary: '',
    headquarters: '',
    currency: 'USD',
    plants: [],
    products: [],
    resources: [],
    strategicPriorities: '',
    customPolicies: '',
    updatedAt: '',
  });

  // Vector DB Stats & Records
  const [stats, setStats] = useState<VectorDatabaseStats | null>(null);
  const [records, setRecords] = useState<VectorRecord[]>([]);

  // Document Ingestion Form
  const [docTitle, setDocTitle] = useState('');
  const [docText, setDocText] = useState('');
  const [docCategory, setDocCategory] = useState<'document' | 'policy' | 'constraint'>('document');
  const [isIngesting, setIsIngesting] = useState(false);

  // Semantic Search Tester
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<VectorSearchResult[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Fetch initial profile & stats when modal opens
  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const [profileRes, recordsRes] = await Promise.all([
        fetch('/api/vector-db/profile').then((r) => r.json()),
        fetch('/api/vector-db/records').then((r) => r.json()),
      ]);

      if (profileRes.success) {
        setProfile(profileRes.profile);
        setStats(profileRes.stats);
      }
      if (recordsRes.success) {
        setRecords(recordsRes.records);
      }
    } catch (err: any) {
      console.error('Error loading vector DB data:', err);
      setStatusMessage({ type: 'error', text: 'Error al conectar con la base de datos vectorial.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Save Company Profile & Auto-Vectorize
  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!profile.companyName.trim()) {
      setStatusMessage({ type: 'error', text: 'El nombre de la empresa es obligatorio.' });
      return;
    }

    setIsSaving(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/vector-db/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al guardar');
      }

      setStats(data.stats);
      setStatusMessage({
        type: 'success',
        text: `¡Empresa guardada y vectorizada con éxito! Se generaron ${data.createdVectorsCount} vectores semánticos (768-D).`,
      });

      if (onProfileUpdated) {
        onProfileUpdated(profile);
      }

      // Refresh records
      const recRes = await fetch('/api/vector-db/records').then((r) => r.json());
      if (recRes.success) setRecords(recRes.records);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Error al vectorizar los datos.' });
    } finally {
      setIsSaving(false);
    }
  };

  // Ingest Document
  const handleIngestDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim() || !docText.trim()) return;

    setIsIngesting(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/vector-db/ingest-doc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: docTitle,
          rawText: docText,
          category: docCategory,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al procesar documento');
      }

      setStatusMessage({
        type: 'success',
        text: data.message || 'Documento vectorizado exitosamente.',
      });
      setDocTitle('');
      setDocText('');
      setStats(data.stats);

      // Refresh records
      const recRes = await fetch('/api/vector-db/records').then((r) => r.json());
      if (recRes.success) setRecords(recRes.records);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Error al procesar documento.' });
    } finally {
      setIsIngesting(false);
    }
  };

  // Run Semantic Vector Search Test
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch('/api/vector-db/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, topK: 5 }),
      });
      const data = await res.json();
      if (data.success) {
        setSearchResults(data.results);
      }
    } catch (err: any) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // Delete a Vector Record
  const handleDeleteRecord = async (id: string) => {
    try {
      const res = await fetch(`/api/vector-db/records/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setRecords((prev) => prev.filter((r) => r.id !== id));
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error('Error deleting vector record:', err);
    }
  };

  // Add sub-items helpers
  const handleAddPlant = () => {
    const newPlant: CompanyPlant = {
      id: `plant-${Date.now()}`,
      name: 'Nueva Planta de Producción',
      capacityHoursPerWeek: 160,
      laborWorkers: 10,
      operatingCostPerHour: 40,
    };
    setProfile({ ...profile, plants: [...profile.plants, newPlant] });
  };

  const handleAddProduct = () => {
    const newProd: CompanyProduct = {
      id: `prod-${Date.now()}`,
      name: 'Nuevo Producto',
      sku: 'SKU-00',
      sellingPrice: 100,
      directCost: 60,
      netMargin: 40,
      maxWeeklyDemand: 50,
      minWeeklyCommitment: 0,
    };
    setProfile({ ...profile, products: [...profile.products, newProd] });
  };

  const handleAddResource = () => {
    const newRes: CompanyResource = {
      id: `res-${Date.now()}`,
      name: 'Nuevo Recurso / Material',
      totalAvailableWeekly: 200,
      unit: 'horas',
      costPerUnit: 20,
      criticality: 'Alta',
    };
    setProfile({ ...profile, resources: [...profile.resources, newRes] });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  Base de Datos Vectorial de la Empresa
                </h2>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-3xs font-semibold text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="h-3 w-3" />
                  RAG Activo
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Almacena parámetros corporativos, recursos y documentos con embeddings densos (768-D) para alimentar a los agentes OR.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Global Vector Database Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-blue-50/50 border-b border-blue-100/80 px-6 py-3 text-xs">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-blue-600 shrink-0" />
            <div>
              <span className="text-3xs text-slate-500 font-medium block">Empresa</span>
              <strong className="text-slate-800 font-semibold truncate block max-w-[140px]">
                {profile.companyName || 'Sin configurar'}
              </strong>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-emerald-600 shrink-0" />
            <div>
              <span className="text-3xs text-slate-500 font-medium block">Vectores Almacenados</span>
              <strong className="text-emerald-700 font-bold">
                {stats?.totalVectors ?? records.length} vectores
              </strong>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-indigo-600 shrink-0" />
            <div>
              <span className="text-3xs text-slate-500 font-medium block">Espacio Vectorial</span>
              <strong className="text-indigo-700 font-semibold">768 Dimensiones</strong>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-600 shrink-0" />
            <div>
              <span className="text-3xs text-slate-500 font-medium block">Modelo Embedding</span>
              <strong className="text-amber-800 font-semibold">gemini-embedding-2</strong>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 px-6 pt-3 bg-white">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="h-4 w-4" />
            <span>Datos y Parámetros de la Empresa</span>
          </button>

          <button
            onClick={() => setActiveTab('ingest')}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'ingest'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Ingesta de Documentos / Texto Libre</span>
          </button>

          <button
            onClick={() => setActiveTab('explorer')}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'explorer'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Search className="h-4 w-4" />
            <span>Explorador y Búsqueda Semántica</span>
            <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-3xs font-bold text-slate-600">
              {records.length}
            </span>
          </button>
        </div>

        {/* Status Alert Banner if any */}
        {statusMessage && (
          <div
            className={`mx-6 mt-4 flex items-center justify-between rounded-xl p-3 text-xs shadow-xs ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
            <button
              onClick={() => setStatusMessage(null)}
              className="text-slate-400 hover:text-slate-700 cursor-pointer ml-2"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-3" />
              <p className="text-xs font-medium">Cargando base de datos vectorial...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: Structured Company Profile Form */}
              {activeTab === 'profile' && (
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  {/* General Info */}
                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-blue-600" />
                      1. Identidad y Perfil General
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Nombre de la Empresa *
                        </label>
                        <input
                          type="text"
                          required
                          value={profile.companyName}
                          onChange={(e) => setProfile({ ...profile, companyName: e.target.value })}
                          placeholder="Ej: Industrias Manufacturas Andinas S.A."
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-800 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Industria / Sector
                        </label>
                        <input
                          type="text"
                          value={profile.industry}
                          onChange={(e) => setProfile({ ...profile, industry: e.target.value })}
                          placeholder="Ej: Metalmecánica, Alimentos, Logística"
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-800 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-hidden"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Resumen Ejecutivo y Operativo
                        </label>
                        <textarea
                          rows={2}
                          value={profile.businessSummary}
                          onChange={(e) => setProfile({ ...profile, businessSummary: e.target.value })}
                          placeholder="Describe brevemente la actividad principal, clientes y centros de distribución..."
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-800 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Products & Unit Margins */}
                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                          <Layers className="h-4 w-4 text-emerald-600" />
                          2. Catálogo de Productos y Márgenes de Contribución
                        </h3>
                        <p className="text-3xs text-slate-500">
                          Estos precios y costos alimentarán automáticamente la función objetivo de los modelos PL.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddProduct}
                        className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-200 cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Añadir Producto</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {profile.products.map((prod, idx) => {
                        const margin = prod.sellingPrice - prod.directCost;
                        return (
                          <div
                            key={prod.id || idx}
                            className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-6 gap-3 items-center"
                          >
                            <div className="sm:col-span-2">
                              <label className="block text-3xs font-semibold text-slate-500 mb-0.5">
                                Nombre del Producto
                              </label>
                              <input
                                type="text"
                                value={prod.name}
                                onChange={(e) => {
                                  const updated = [...profile.products];
                                  updated[idx].name = e.target.value;
                                  setProfile({ ...profile, products: updated });
                                }}
                                className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800"
                              />
                            </div>

                            <div>
                              <label className="block text-3xs font-semibold text-slate-500 mb-0.5">
                                Precio Venta ($)
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={prod.sellingPrice}
                                onChange={(e) => {
                                  const updated = [...profile.products];
                                  updated[idx].sellingPrice = Number(e.target.value);
                                  updated[idx].netMargin = updated[idx].sellingPrice - updated[idx].directCost;
                                  setProfile({ ...profile, products: updated });
                                }}
                                className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800"
                              />
                            </div>

                            <div>
                              <label className="block text-3xs font-semibold text-slate-500 mb-0.5">
                                Costo Directo ($)
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={prod.directCost}
                                onChange={(e) => {
                                  const updated = [...profile.products];
                                  updated[idx].directCost = Number(e.target.value);
                                  updated[idx].netMargin = updated[idx].sellingPrice - updated[idx].directCost;
                                  setProfile({ ...profile, products: updated });
                                }}
                                className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800"
                              />
                            </div>

                            <div className="bg-emerald-50 border border-emerald-200 rounded-md p-1.5 text-center">
                              <span className="block text-3xs font-medium text-emerald-700">Margen Neto</span>
                              <strong className="text-xs font-bold text-emerald-800">${margin}</strong>
                            </div>

                            <div className="flex justify-end">
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = profile.products.filter((_, i) => i !== idx);
                                  setProfile({ ...profile, products: updated });
                                }}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md cursor-pointer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Limiting Resources & Capacities */}
                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                          <Cpu className="h-4 w-4 text-indigo-600" />
                          3. Recursos Limitantes de Taller y Fábrica
                        </h3>
                        <p className="text-3xs text-slate-500">
                          Horas de máquina, mano de obra o materias primas que operan como cotas $\le$ en el solver.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddResource}
                        className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-200 cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Añadir Recurso</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {profile.resources.map((res, idx) => (
                        <div
                          key={res.id || idx}
                          className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-5 gap-3 items-center"
                        >
                          <div className="sm:col-span-2">
                            <label className="block text-3xs font-semibold text-slate-500 mb-0.5">
                              Nombre del Recurso / Máquina
                            </label>
                            <input
                              type="text"
                              value={res.name}
                              onChange={(e) => {
                                const updated = [...profile.resources];
                                updated[idx].name = e.target.value;
                                setProfile({ ...profile, resources: updated });
                              }}
                              className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800"
                            />
                          </div>

                          <div>
                            <label className="block text-3xs font-semibold text-slate-500 mb-0.5">
                              Disponibilidad Semanal
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={res.totalAvailableWeekly}
                              onChange={(e) => {
                                const updated = [...profile.resources];
                                updated[idx].totalAvailableWeekly = Number(e.target.value);
                                setProfile({ ...profile, resources: updated });
                              }}
                              className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800"
                            />
                          </div>

                          <div>
                            <label className="block text-3xs font-semibold text-slate-500 mb-0.5">Unidad</label>
                            <input
                              type="text"
                              value={res.unit}
                              onChange={(e) => {
                                const updated = [...profile.resources];
                                updated[idx].unit = e.target.value;
                                setProfile({ ...profile, resources: updated });
                              }}
                              placeholder="horas, kg, láminas"
                              className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-800"
                            />
                          </div>

                          <div className="flex justify-end">
                            <button
                              type="button"
                              onClick={() => {
                                const updated = profile.resources.filter((_, i) => i !== idx);
                                setProfile({ ...profile, resources: updated });
                              }}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Strategic Priorities & Operational Policies */}
                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-amber-600" />
                      4. Políticas Corporativas, Contratos y Normativa
                    </h3>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Reglas y Políticas de Negocio
                      </label>
                      <textarea
                        rows={3}
                        value={profile.customPolicies}
                        onChange={(e) => setProfile({ ...profile, customPolicies: e.target.value })}
                        placeholder="Ej: Contratos con cuotas mínimas obligatorias, restricciones de horas extra, cuotas ambientales..."
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-800 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Action Save Button */}
                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 active:scale-95 transition-all cursor-pointer disabled:opacity-60"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Calculando Embeddings (768-D)...</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          <span>Guardar y Vectorizar en Base de Datos</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 2: Unstructured Text / Document Ingestion */}
              {activeTab === 'ingest' && (
                <div className="space-y-6">
                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-600" />
                        Ingesta Semántica de Documentos Corporativos
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Pega manuales de taller, contratos con clientes, fichas técnicas de maquinaria o tablas de costos. El motor fragmentará el texto y generará embeddings densos para recuperación semántica (RAG).
                      </p>
                    </div>

                    <form onSubmit={handleIngestDocument} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Título del Documento *
                          </label>
                          <input
                            type="text"
                            required
                            value={docTitle}
                            onChange={(e) => setDocTitle(e.target.value)}
                            placeholder="Ej: Contrato Marco de Suministro Industrial 2026"
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800 focus:border-blue-600 focus:outline-hidden"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">Categoría</label>
                          <select
                            value={docCategory}
                            onChange={(e) => setDocCategory(e.target.value as any)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-800 focus:border-blue-600 focus:outline-hidden bg-white"
                          >
                            <option value="document">Documento / Manual</option>
                            <option value="policy">Política / Contrato</option>
                            <option value="constraint">Restricción Técnica</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Contenido del Documento / Texto *
                        </label>
                        <textarea
                          rows={6}
                          required
                          value={docText}
                          onChange={(e) => setDocText(e.target.value)}
                          placeholder="Pega el contenido completo del manual, contrato o descripción detallada de operaciones..."
                          className="w-full rounded-lg border border-slate-300 p-3 text-xs font-mono text-slate-800 focus:border-blue-600 focus:outline-hidden"
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={isIngesting}
                          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 active:scale-95 transition-all cursor-pointer disabled:opacity-60"
                        >
                          {isIngesting ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>Fragmentando y Vectorizando...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4" />
                              <span>Procesar e Indexar en Base Vectorial</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* TAB 3: Vector Store Explorer & Live Semantic Search */}
              {activeTab === 'explorer' && (
                <div className="space-y-6">
                  {/* Semantic Search Tester Bar */}
                  <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 shadow-2xs space-y-3">
                    <h3 className="text-xs font-bold text-blue-900 flex items-center gap-2">
                      <Search className="h-4 w-4 text-blue-600" />
                      Probador de Búsqueda Semántica por Similitud Coseno
                    </h3>
                    <p className="text-3xs text-blue-700">
                      Escribe una pregunta o término en lenguaje natural para verificar cómo el motor vectorial recupera y califica la información corporativa.
                    </p>

                    <form onSubmit={handleSearch} className="flex gap-2">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Ej: ¿Cuáles son las horas de corte disponibles o el margen del escritorio?"
                        className="flex-1 rounded-lg border border-blue-300 bg-white px-3 py-2 text-xs text-slate-800 focus:border-blue-600 focus:outline-hidden"
                      />
                      <button
                        type="submit"
                        disabled={isSearching}
                        className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors cursor-pointer"
                      >
                        {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                        <span>Buscar</span>
                      </button>
                    </form>

                    {/* Search Results Display */}
                    {searchResults.length > 0 && (
                      <div className="space-y-2 mt-3 pt-3 border-t border-blue-200/60">
                        <span className="text-3xs font-bold uppercase tracking-wider text-blue-800 block">
                          Top {searchResults.length} Resultados Más Relevantes:
                        </span>
                        {searchResults.map((res, i) => (
                          <div
                            key={i}
                            className="bg-white p-3 rounded-lg border border-blue-100 shadow-2xs text-xs space-y-1.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900">{res.record.title}</span>
                              <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-3xs font-bold text-blue-800">
                                Similitud: {Math.round(res.similarity * 100)}%
                              </span>
                            </div>
                            <p className="text-slate-600 text-3xs font-mono bg-slate-50 p-2 rounded border border-slate-100">
                              {res.record.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* All Vector Records Table */}
                  <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                          <Database className="h-4 w-4 text-emerald-600" />
                          Registro de Vectores Almacenados ({records.length})
                        </h3>
                        <p className="text-3xs text-slate-500 mt-0.5">
                          Incluye el perfil corporativo, documentos ingesta y memoria viva de tus conversaciones con Sofía.
                        </p>
                      </div>
                      <button
                        onClick={loadData}
                        className="flex items-center gap-1 text-3xs font-semibold text-slate-500 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer self-start sm:self-auto"
                      >
                        <RefreshCw className="h-3 w-3" />
                        <span>Actualizar</span>
                      </button>
                    </div>

                    {/* Category Filter Pills */}
                    <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-100">
                      {[
                        { id: 'all', label: 'Todos', count: records.length },
                        {
                          id: 'conversation',
                          label: 'Memoria de Conversación',
                          count: records.filter((r) => r.category === 'conversation' || r.metadata?.source?.includes('Conversación')).length,
                        },
                        { id: 'resource', label: 'Recursos', count: records.filter((r) => r.category === 'resource').length },
                        { id: 'product', label: 'Productos', count: records.filter((r) => r.category === 'product').length },
                        { id: 'constraint', label: 'Restricciones', count: records.filter((r) => r.category === 'constraint').length },
                        { id: 'policy', label: 'Políticas', count: records.filter((r) => r.category === 'policy').length },
                        { id: 'document', label: 'Documentos', count: records.filter((r) => r.category === 'document').length },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setCategoryFilter(tab.id)}
                          className={`px-2.5 py-1 rounded-lg text-3xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                            categoryFilter === tab.id
                              ? 'bg-slate-900 text-white'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          <span>{tab.label}</span>
                          <span
                            className={`rounded-full px-1.5 py-0.2 text-3xs font-mono ${
                              categoryFilter === tab.id
                                ? 'bg-white/20 text-white'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {tab.count}
                          </span>
                        </button>
                      ))}
                    </div>

                    {records.length === 0 ? (
                      <div className="text-center py-8 text-slate-400 text-xs">
                        No hay vectores registrados. Guarda los datos de tu empresa en la primera pestaña o charla con Sofía.
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">
                        {records
                          .filter((rec) => {
                            if (categoryFilter === 'all') return true;
                            if (categoryFilter === 'conversation') {
                              return rec.category === 'conversation' || rec.metadata?.source?.includes('Conversación');
                            }
                            return rec.category === categoryFilter;
                          })
                          .map((rec) => {
                            const isConversationFact =
                              rec.category === 'conversation' ||
                              rec.metadata?.source?.includes('Conversación') ||
                              rec.metadata?.tags?.includes('conversacion');

                            return (
                              <div key={rec.id} className="py-3 flex items-start justify-between gap-4 group">
                                <div className="space-y-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-xs font-bold text-slate-800">{rec.title}</span>
                                    {isConversationFact ? (
                                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 border border-emerald-300 px-2 py-0.5 text-3xs font-bold text-emerald-800 uppercase">
                                        <MessageSquare className="h-2.5 w-2.5" />
                                        Memoria de Conversación
                                      </span>
                                    ) : (
                                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-3xs font-semibold text-slate-600 uppercase">
                                        {rec.category}
                                      </span>
                                    )}
                                    <span className="text-3xs text-slate-400 font-mono">
                                      {rec.dimensions}D
                                    </span>
                                    {rec.metadata?.source && (
                                      <span className="text-3xs text-slate-500 font-medium italic">
                                        · {rec.metadata.source}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-3xs text-slate-600 line-clamp-2 max-w-2xl">{rec.content}</p>
                                </div>

                                <button
                                  onClick={() => handleDeleteRecord(rec.id)}
                                  title="Eliminar vector"
                                  className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-opacity cursor-pointer shrink-0"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-500 text-3xs">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Los vectores se conservan persistentemente en el servidor y alimentan los modelos de optimización.</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg bg-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-300 transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
