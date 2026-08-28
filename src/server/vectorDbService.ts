import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import {
  VectorRecord,
  CompanyProfile,
  VectorDatabaseStats,
  VectorSearchResult,
  VectorCategory,
} from '../types';

const DATA_DIR = path.join(process.cwd(), 'data');
const VECTOR_STORE_FILE = path.join(DATA_DIR, 'vector_store.json');
const COMPANY_PROFILE_FILE = path.join(DATA_DIR, 'company_profile.json');

// Default initial corporate seed data
const DEFAULT_COMPANY_PROFILE: CompanyProfile = {
  id: 'company-andinas-001',
  companyName: 'Industrias Manufacturas Andinas S.A.',
  industry: 'Manufactura Metalmecánica y Mobiliario Industrial',
  businessSummary:
    'Empresa líder en diseño y fabricación de escritorios ejecutivos, mesas modulares y sistemas de estanterías industriales. Operamos con 2 plantas de producción especializadas y un centro de distribución regional.',
  headquarters: 'Bogotá / Medellín',
  currency: 'USD',
  plants: [
    {
      id: 'plant-1',
      name: 'Planta Principal de Ensamble y Mecanizado',
      capacityHoursPerWeek: 160,
      laborWorkers: 24,
      operatingCostPerHour: 45,
    },
    {
      id: 'plant-2',
      name: 'Taller Especializado de Acabados y Pintura Electrostática',
      capacityHoursPerWeek: 120,
      laborWorkers: 14,
      operatingCostPerHour: 38,
    },
  ],
  products: [
    {
      id: 'prod-1',
      name: 'Escritorio Ejecutivo Premium',
      sku: 'DESK-EXEC-01',
      sellingPrice: 350,
      directCost: 190,
      netMargin: 160,
      maxWeeklyDemand: 50,
      minWeeklyCommitment: 10,
    },
    {
      id: 'prod-2',
      name: 'Mesa de Trabajo Modular',
      sku: 'TABLE-MOD-02',
      sellingPrice: 240,
      directCost: 130,
      netMargin: 110,
      maxWeeklyDemand: 80,
      minWeeklyCommitment: 15,
    },
    {
      id: 'prod-3',
      name: 'Silla Ergonómica Pro',
      sku: 'CHAIR-ERG-03',
      sellingPrice: 160,
      directCost: 95,
      netMargin: 65,
      maxWeeklyDemand: 100,
      minWeeklyCommitment: 0,
    },
  ],
  resources: [
    {
      id: 'res-1',
      name: 'Horas de Carpintería y Corte CNC',
      totalAvailableWeekly: 240,
      unit: 'horas',
      costPerUnit: 25,
      criticality: 'Alta',
    },
    {
      id: 'res-2',
      name: 'Horas de Pintura y Secado en Horno',
      totalAvailableWeekly: 180,
      unit: 'horas',
      costPerUnit: 30,
      criticality: 'Alta',
    },
    {
      id: 'res-3',
      name: 'Láminas de Acero Galvanizado 2mm',
      totalAvailableWeekly: 500,
      unit: 'láminas',
      costPerUnit: 18,
      criticality: 'Media',
    },
    {
      id: 'res-4',
      name: 'Madera Roble Seleccionada Tratada',
      totalAvailableWeekly: 350,
      unit: 'm²',
      costPerUnit: 22,
      criticality: 'Media',
    },
  ],
  strategicPriorities:
    'Maximizar el margen de contribución semanal total de la planta, garantizando el cumplimiento irrestricto de las cuotas mínimas contractuales con clientes corporativos y respetando los límites de horas máquina para evitar costos de sobretiempo no presupuestados.',
  customPolicies:
    '1. Política de Calidad: No superar la capacidad nominal de horneado en un 100%.\n2. Política Comercial: Cumplir siempre los contratos de suministro institucional antes de asignar capacidad a pedidos minoristas.\n3. Seguridad Ocupacional: Mantener un factor de holgura operativa del 5% en mantenimientos preventivos.',
  updatedAt: new Date().toISOString(),
};

// In-Memory Vector Store Cache and Embedding Cache
let vectorRecordsCache: VectorRecord[] = [];
let companyProfileCache: CompanyProfile = DEFAULT_COMPANY_PROFILE;
const embeddingCache = new Map<string, number[]>();

// Ensure storage directory exists
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Load data from disk into memory
export function initVectorDatabase() {
  try {
    ensureDataDir();

    if (fs.existsSync(COMPANY_PROFILE_FILE)) {
      const profileData = fs.readFileSync(COMPANY_PROFILE_FILE, 'utf-8');
      companyProfileCache = JSON.parse(profileData);
    } else {
      fs.writeFileSync(
        COMPANY_PROFILE_FILE,
        JSON.stringify(DEFAULT_COMPANY_PROFILE, null, 2)
      );
      companyProfileCache = DEFAULT_COMPANY_PROFILE;
    }

    if (fs.existsSync(VECTOR_STORE_FILE)) {
      const vectorData = fs.readFileSync(VECTOR_STORE_FILE, 'utf-8');
      vectorRecordsCache = JSON.parse(vectorData);
    } else {
      vectorRecordsCache = [];
    }
  } catch (error) {
    console.error('Error initializing Vector Database:', error);
  }
}

// Save Vector Store to disk
function saveVectorStoreToDisk() {
  try {
    ensureDataDir();
    fs.writeFileSync(
      VECTOR_STORE_FILE,
      JSON.stringify(vectorRecordsCache, null, 2)
    );
  } catch (error) {
    console.error('Error saving Vector Store to disk:', error);
  }
}

// Save Company Profile to disk
function saveCompanyProfileToDisk() {
  try {
    ensureDataDir();
    fs.writeFileSync(
      COMPANY_PROFILE_FILE,
      JSON.stringify(companyProfileCache, null, 2)
    );
  } catch (error) {
    console.error('Error saving Company Profile to disk:', error);
  }
}

// Pseudo-embedding fallback for consistent offline/local mathematical vectors
function generateFallbackEmbedding(text: string, dimensions = 768): number[] {
  const vector = new Array(dimensions).fill(0);
  const normalized = text.toLowerCase().trim();

  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = (hash << 5) - hash + normalized.charCodeAt(i);
    hash |= 0;
    const pos = Math.abs(hash) % dimensions;
    vector[pos] += (normalized.charCodeAt(i) % 10) + 1;
  }

  // Add ngram semantic weights
  const words = normalized.split(/\s+/);
  words.forEach((w, wIdx) => {
    let wordHash = 5381;
    for (let j = 0; j < w.length; j++) {
      wordHash = (wordHash * 33) ^ w.charCodeAt(j);
    }
    const idx = Math.abs(wordHash) % dimensions;
    vector[idx] += 3.5 + (wIdx % 3);
  });

  // Normalize vector to unit length (L2 norm)
  const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  if (norm > 0) {
    for (let i = 0; i < dimensions; i++) {
      vector[i] /= norm;
    }
  }

  return vector;
}

// Compute high-dimensional embedding with Gemini API (with in-memory caching and fast fallback)
export async function computeEmbedding(
  text: string,
  ai?: GoogleGenAI | null
): Promise<number[]> {
  if (!text || text.trim().length === 0) {
    return new Array(768).fill(0);
  }

  const cacheKey = text.trim();
  if (embeddingCache.has(cacheKey)) {
    return embeddingCache.get(cacheKey)!;
  }

  if (ai) {
    try {
      const response = await ai.models.embedContent({
        model: 'gemini-embedding-2-preview',
        contents: text,
      });

      if (response && response.embeddings && response.embeddings.length > 0) {
        const values = response.embeddings[0].values;
        if (values && values.length > 0) {
          embeddingCache.set(cacheKey, values);
          return values;
        }
      }
    } catch (err: any) {
      // Local high-speed fallback
    }
  }

  const fallback = generateFallbackEmbedding(text, 768);
  embeddingCache.set(cacheKey, fallback);
  return fallback;
}

// Cosine similarity between two vectors
export function calculateCosineSimilarity(
  vecA: number[],
  vecB: number[]
): number {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0;
  const minLen = Math.min(vecA.length, vecB.length);

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < minLen; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;

  return dotProduct / denominator;
}

// Vectorize and ingest the entire structured company profile
export async function vectorizeCompanyProfile(
  profile: CompanyProfile,
  ai?: GoogleGenAI | null
): Promise<VectorRecord[]> {
  companyProfileCache = {
    ...profile,
    updatedAt: new Date().toISOString(),
  };
  saveCompanyProfileToDisk();

  const newRecords: VectorRecord[] = [];
  const companyName = profile.companyName || 'Empresa';
  const now = new Date().toISOString();

  // 1. Company Overview Record
  const overviewContent = `Perfil Corporativo de ${companyName}. Industria: ${profile.industry}. Resumen: ${profile.businessSummary}. Moneda base: ${profile.currency}. Sede: ${profile.headquarters || 'No especificada'}. Prioridades estratégicas: ${profile.strategicPriorities}`;
  const overviewEmb = await computeEmbedding(overviewContent, ai);
  newRecords.push({
    id: `vec-profile-${Date.now()}-1`,
    title: `Perfil General: ${companyName}`,
    category: 'profile',
    content: overviewContent,
    embedding: overviewEmb,
    dimensions: overviewEmb.length,
    metadata: {
      companyName,
      source: 'Perfil de Empresa',
      tags: ['empresa', 'estrategia', profile.industry.toLowerCase()],
      dateAdded: now,
    },
  });

  // 2. Plants & Capacities Records
  for (let i = 0; i < profile.plants.length; i++) {
    const plant = profile.plants[i];
    const plantContent = `Planta de Producción: ${plant.name}. Capacidad de horas disponibles: ${plant.capacityHoursPerWeek} horas/semana. Personal asignado: ${plant.laborWorkers} operarios. Costo operativo: $${plant.operatingCostPerHour}/hora.`;
    const plantEmb = await computeEmbedding(plantContent, ai);
    newRecords.push({
      id: `vec-plant-${Date.now()}-${i + 1}`,
      title: `Planta: ${plant.name}`,
      category: 'resource',
      content: plantContent,
      embedding: plantEmb,
      dimensions: plantEmb.length,
      metadata: {
        companyName,
        value: plant.capacityHoursPerWeek,
        unit: 'horas/semana',
        source: 'Capacidad de Plantas',
        tags: ['planta', 'capacidad', 'horas', 'mano de obra'],
        dateAdded: now,
      },
    });
  }

  // 3. Products & Margins Records
  for (let i = 0; i < profile.products.length; i++) {
    const prod = profile.products[i];
    const margin = prod.sellingPrice - prod.directCost;
    const prodContent = `Producto: ${prod.name} (SKU: ${prod.sku || 'N/A'}). Precio de venta unitario: $${prod.sellingPrice} ${profile.currency}. Costo directo unitario: $${prod.directCost} ${profile.currency}. Margen neto de contribución unitario: $${margin} ${profile.currency}. Demanda máxima estimada: ${prod.maxWeeklyDemand || 'Sin cota'} unidades/semana. Compromiso mínimo de entrega contractual: ${prod.minWeeklyCommitment || 0} unidades/semana.`;
    const prodEmb = await computeEmbedding(prodContent, ai);
    newRecords.push({
      id: `vec-prod-${Date.now()}-${i + 1}`,
      title: `Producto y Margen: ${prod.name}`,
      category: 'product',
      content: prodContent,
      embedding: prodEmb,
      dimensions: prodEmb.length,
      metadata: {
        companyName,
        value: margin,
        unit: profile.currency,
        source: 'Catálogo de Productos',
        tags: ['producto', 'precio', 'margen', 'demanda', prod.name.toLowerCase()],
        dateAdded: now,
      },
    });
  }

  // 4. Resources & Constraints Records
  for (let i = 0; i < profile.resources.length; i++) {
    const res = profile.resources[i];
    const resContent = `Recurso Limitante de Empresa: ${res.name}. Disponibilidad total semanal: ${res.totalAvailableWeekly} ${res.unit}. Costo por unidad de recurso: $${res.costPerUnit}. Nivel de criticidad: ${res.criticality}.`;
    const resEmb = await computeEmbedding(resContent, ai);
    newRecords.push({
      id: `vec-res-${Date.now()}-${i + 1}`,
      title: `Recurso de Taller: ${res.name}`,
      category: 'constraint',
      content: resContent,
      embedding: resEmb,
      dimensions: resEmb.length,
      metadata: {
        companyName,
        value: res.totalAvailableWeekly,
        unit: res.unit,
        source: 'Recursos de Planta',
        tags: ['recurso', 'materia prima', 'restriccion', res.name.toLowerCase()],
        dateAdded: now,
      },
    });
  }

  // 5. Strategic Policies & Rules Records
  if (profile.customPolicies && profile.customPolicies.trim().length > 0) {
    const policyContent = `Políticas Corporativas y Reglas de Negocio de ${companyName}: ${profile.customPolicies}. Prioridad estratégica: ${profile.strategicPriorities}`;
    const polEmb = await computeEmbedding(policyContent, ai);
    newRecords.push({
      id: `vec-policy-${Date.now()}`,
      title: `Políticas y Reglas Operativas`,
      category: 'policy',
      content: policyContent,
      embedding: polEmb,
      dimensions: polEmb.length,
      metadata: {
        companyName,
        source: 'Políticas Internas',
        tags: ['politicas', 'reglas', 'contratos', 'normativa'],
        dateAdded: now,
      },
    });
  }

  // Replace profile-related vectors in store while preserving custom documents
  const preservedDocuments = vectorRecordsCache.filter(
    (r) => r.category === 'document' || r.category === 'scenario'
  );
  vectorRecordsCache = [...newRecords, ...preservedDocuments];
  saveVectorStoreToDisk();

  return newRecords;
}

// Ingest unstructured documents, manuals, or contracts into the Vector Database
export async function ingestDocumentText(
  title: string,
  rawText: string,
  category: VectorCategory = 'document',
  ai?: GoogleGenAI | null
): Promise<VectorRecord[]> {
  if (!rawText || rawText.trim().length === 0) {
    return [];
  }

  const companyName = companyProfileCache.companyName || 'Empresa';
  const now = new Date().toISOString();

  // Split text into semantic chunks (~250-400 words or paragraphs)
  const paragraphs = rawText
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 20);

  const chunks: string[] = [];
  let currentChunk = '';

  for (const para of paragraphs) {
    if ((currentChunk + '\n' + para).length > 800) {
      if (currentChunk.trim().length > 0) chunks.push(currentChunk.trim());
      currentChunk = para;
    } else {
      currentChunk = currentChunk ? `${currentChunk}\n${para}` : para;
    }
  }
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  if (chunks.length === 0) {
    chunks.push(rawText.trim().slice(0, 1000));
  }

  const createdRecords: VectorRecord[] = [];

  for (let i = 0; i < chunks.length; i++) {
    const chunkText = chunks[i];
    const chunkTitle =
      chunks.length > 1 ? `${title} (Parte ${i + 1}/${chunks.length})` : title;

    const emb = await computeEmbedding(
      `Documento Corporativo de ${companyName}: ${chunkTitle}\n${chunkText}`,
      ai
    );

    const record: VectorRecord = {
      id: `vec-doc-${Date.now()}-${i + 1}`,
      title: chunkTitle,
      category,
      content: chunkText,
      embedding: emb,
      dimensions: emb.length,
      metadata: {
        companyName,
        source: title,
        tags: ['documento', 'ingesta', title.toLowerCase().slice(0, 20)],
        dateAdded: now,
      },
    };

    createdRecords.push(record);
  }

  vectorRecordsCache.push(...createdRecords);
  saveVectorStoreToDisk();

  return createdRecords;
}

// Semantic Search using Cosine Similarity on Vector Database
export async function searchVectorDatabase(
  query: string,
  topK = 5,
  categoryFilter?: VectorCategory,
  ai?: GoogleGenAI | null
): Promise<VectorSearchResult[]> {
  if (vectorRecordsCache.length === 0) {
    // If empty, auto-vectorize default profile
    await vectorizeCompanyProfile(companyProfileCache, ai);
  }

  const queryEmbedding = await computeEmbedding(query, ai);

  let candidates = vectorRecordsCache;
  if (categoryFilter) {
    candidates = candidates.filter((r) => r.category === categoryFilter);
  }

  const scoredResults: VectorSearchResult[] = candidates
    .map((record) => {
      const similarity = record.embedding
        ? calculateCosineSimilarity(queryEmbedding, record.embedding)
        : 0;
      return {
        record: {
          ...record,
          similarityScore: Math.round(similarity * 1000) / 1000,
        },
        similarity,
        matchedSnippet:
          record.content.length > 180
            ? record.content.slice(0, 180) + '...'
            : record.content,
      };
    })
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);

  return scoredResults;
}

// Retrieve relevant context formatted as structured RAG context for Agent Prompts
export async function retrieveEnterpriseContextForPrompt(
  problemNarrative: string,
  ai?: GoogleGenAI | null
): Promise<{ contextText: string; retrievedRecords: VectorRecord[] }> {
  if (vectorRecordsCache.length === 0) {
    await vectorizeCompanyProfile(companyProfileCache, ai);
  }

  const results = await searchVectorDatabase(problemNarrative, 5, undefined, ai);
  const relevantRecords = results
    .filter((r) => r.similarity > 0.15)
    .map((r) => r.record);

  if (relevantRecords.length === 0) {
    return {
      contextText: `Empresa: ${companyProfileCache.companyName}. Industria: ${companyProfileCache.industry}.`,
      retrievedRecords: [],
    };
  }

  const contextLines = relevantRecords.map(
    (r, idx) =>
      `[Vector ${idx + 1} - ${r.title} | Similitud: ${r.similarityScore || 'N/A'}]\n${r.content}`
  );

  const contextText = `=== BASE DE DATOS VECTORIAL DE LA EMPRESA (${companyProfileCache.companyName}) ===\n${contextLines.join(
    '\n\n'
  )}\n======================================================`;

  return {
    contextText,
    retrievedRecords: relevantRecords,
  };
}

// Get all vector records (with embeddings stripped for lightweight transfer)
export function getAllVectorRecords(): VectorRecord[] {
  return vectorRecordsCache.map((r) => ({
    ...r,
    embedding: undefined, // Omit heavy array to save network bandwidth
  }));
}

// Delete a single vector record
export function deleteVectorRecord(id: string): boolean {
  const initialLength = vectorRecordsCache.length;
  vectorRecordsCache = vectorRecordsCache.filter((r) => r.id !== id);
  if (vectorRecordsCache.length !== initialLength) {
    saveVectorStoreToDisk();
    return true;
  }
  return false;
}

// Get company profile
export function getCompanyProfile(): CompanyProfile {
  return companyProfileCache;
}

// Get Vector Store Statistics
export function getVectorDatabaseStats(): VectorDatabaseStats {
  const categoriesCount: Record<string, number> = {};
  vectorRecordsCache.forEach((r) => {
    categoriesCount[r.category] = (categoriesCount[r.category] || 0) + 1;
  });

  return {
    totalVectors: vectorRecordsCache.length,
    categoriesCount,
    embeddingModel: 'gemini-embedding-2-preview (768-D dense vectors)',
    dimensions: 768,
    lastSyncAt: companyProfileCache.updatedAt || new Date().toISOString(),
    companyName: companyProfileCache.companyName || 'Empresa Sin Nombre',
  };
}

// Automatically extract and ingest relevant business facts from user conversation messages into the Vector Database
export async function extractAndIngestConversationFacts(
  latestUserMessage: string,
  fullConversationText: string,
  ai?: GoogleGenAI | null
): Promise<VectorRecord[]> {
  if (!latestUserMessage || latestUserMessage.trim().length < 5) {
    return [];
  }

  const companyName = companyProfileCache.companyName || 'Empresa';
  const now = new Date().toISOString();
  const rawFacts: Array<{
    title: string;
    category: VectorCategory;
    content: string;
    value?: number;
    unit?: string;
    tags?: string[];
  }> = [];

  // Try intelligent fact extraction via Gemini if available
  if (ai) {
    try {
      const systemInstruction = `Eres un extractor de conocimiento corporativo y hechos operativos clave para una base de datos vectorial (RAG) de Investigación de Operaciones.
Tu tarea es leer el último mensaje del usuario y extraer fragmentos atómicos de conocimiento estructurado (capacidades, costos unitarios, tiempos de ciclo, demandas, metas de entrega, restricciones o políticas operativas).
Ignora saludos o frases genéricas. Solo extrae hechos concretos con datos y números. Si no hay datos nuevos, retorna un array vacío.`;

      const prompt = `Extrae los hechos o parámetros clave del siguiente mensaje de usuario para vectorizarlos en la memoria empresarial de ${companyName}:

MENSAJE DEL USUARIO:
"""
${latestUserMessage}
"""

CONTEXTO PREVIO:
"""
${fullConversationText.slice(-600)}
"""`;

      const candidateModels = ['gemini-3.7-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
      let response: any = null;

      for (const model of candidateModels) {
        try {
          response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
              systemInstruction,
              responseMimeType: 'application/json',
              responseSchema: {
                type: 'OBJECT' as any,
                properties: {
                  extractedFacts: {
                    type: 'ARRAY' as any,
                    items: {
                      type: 'OBJECT' as any,
                      properties: {
                        title: { type: 'STRING' as any, description: 'Título corto del hecho (ej: Capacidad de Máquina A, Demanda Total Semanal)' },
                        category: {
                          type: 'STRING' as any,
                          enum: ['resource', 'product', 'financial', 'constraint', 'policy', 'conversation'],
                        },
                        content: { type: 'STRING' as any, description: 'Descripción semántica completa y autocontenida del dato' },
                        value: { type: 'NUMBER' as any, description: 'Valor numérico si aplica' },
                        unit: { type: 'STRING' as any, description: 'Unidad de medida (USD, horas, unidades)' },
                        tags: { type: 'ARRAY' as any, items: { type: 'STRING' as any } },
                      },
                      required: ['title', 'category', 'content'],
                    },
                  },
                },
                required: ['extractedFacts'],
              },
            },
          });
          if (response?.text) break;
        } catch (modelErr: any) {
          // If rate limited, try next model candidate
          continue;
        }
      }

      if (response && response.text) {
        const parsed = JSON.parse(response.text.trim() || '{}');
        if (Array.isArray(parsed.extractedFacts) && parsed.extractedFacts.length > 0) {
          for (const item of parsed.extractedFacts) {
            rawFacts.push({
              title: item.title,
              category: (item.category as VectorCategory) || 'conversation',
              content: item.content,
              value: item.value,
              unit: item.unit,
              tags: item.tags || ['conversacion', 'datos_clave'],
            });
          }
        }
      }
    } catch (err) {
      // Offline fallback will run
    }
  }

  // Deterministic pattern extractor fallback for quick numbers and business parameters
  if (rawFacts.length === 0) {
    const textLower = latestUserMessage.toLowerCase();

    // Match numbers with context
    const hasNumbers = /\d+/.test(latestUserMessage);
    if (hasNumbers) {
      // Check for machines or lines
      const machineMatch = textLower.match(/(\d+)\s*(máquinas?|maquinas?|líneas?|lineas?|plantas?)/);
      if (machineMatch) {
        rawFacts.push({
          title: `Configuración de ${machineMatch[2]}`,
          category: 'resource',
          content: `La empresa ${companyName} opera con ${machineMatch[1]} ${machineMatch[2]} disponibles para optimización. Mensaje: "${latestUserMessage}".`,
          value: parseInt(machineMatch[1], 10),
          unit: machineMatch[2],
          tags: ['maquinas', 'capacidad', 'conversacion'],
        });
      }

      // Check for demand / goal
      const demandMatch = textLower.match(/(demanda|meta|pedido|entregar|total)\s*(?:de|es|=)?\s*(\d+)/);
      if (demandMatch) {
        rawFacts.push({
          title: `Requisito de ${demandMatch[1]}`,
          category: 'constraint',
          content: `Compromiso o meta de entrega: ${demandMatch[2]} unidades según indicaciones del usuario en conversación.`,
          value: parseInt(demandMatch[2], 10),
          unit: 'unidades',
          tags: ['demanda', 'meta', 'conversacion'],
        });
      }

      // Fallback single conversational insight if message has operational content
      if (rawFacts.length === 0 && latestUserMessage.length > 15) {
        rawFacts.push({
          title: `Dato Conversacional de Usuario`,
          category: 'conversation',
          content: `Parámetros aportados por el usuario para ${companyName}: "${latestUserMessage}".`,
          tags: ['conversacion', 'usuario', 'operacion'],
        });
      }
    }
  }

  const newlyIngested: VectorRecord[] = [];

  for (let i = 0; i < rawFacts.length; i++) {
    const fact = rawFacts[i];
    const semanticContent = `Dato Corporativo de ${companyName} (Origen: Conversación con Asesora Sofía):\n${fact.title}\n${fact.content}`;

    // Compute embedding for the new fact
    const embedding = await computeEmbedding(semanticContent, ai);

    // Check if an identical fact already exists to prevent duplicate spamming
    const duplicate = vectorRecordsCache.find((existing) => {
      if (existing.title.toLowerCase() === fact.title.toLowerCase()) return true;
      if (existing.embedding && calculateCosineSimilarity(existing.embedding, embedding) > 0.94) return true;
      return false;
    });

    if (!duplicate) {
      const record: VectorRecord = {
        id: `vec-chat-${Date.now()}-${i + 1}`,
        title: fact.title,
        category: fact.category || 'conversation',
        content: fact.content,
        embedding,
        dimensions: embedding.length,
        metadata: {
          companyName,
          value: fact.value,
          unit: fact.unit,
          source: 'Conversación con Asesora Sofía',
          tags: fact.tags || ['conversacion', 'memoria_viva'],
          dateAdded: now,
        },
      };

      vectorRecordsCache.push(record);
      newlyIngested.push(record);
    }
  }

  if (newlyIngested.length > 0) {
    saveVectorStoreToDisk();
  }

  return newlyIngested;
}
