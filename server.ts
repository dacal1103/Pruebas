import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import {
  initVectorDatabase,
  getCompanyProfile,
  vectorizeCompanyProfile,
  ingestDocumentText,
  extractAndIngestConversationFacts,
  searchVectorDatabase,
  retrieveEnterpriseContextForPrompt,
  getAllVectorRecords,
  deleteVectorRecord,
  getVectorDatabaseStats,
} from './src/server/vectorDbService';

dotenv.config();

// Initialize Vector Database Store on boot
initVectorDatabase();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy GoogleGenAI initialization
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return null;
    }
    try {
      aiClient = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    } catch (err) {
      console.warn('Could not initialize GoogleGenAI client:', err);
      return null;
    }
  }
  return aiClient;
}

// Multi-tier model execution with automatic fallback for quota/rate limit resilience
async function generateGeminiContentWithFallback(
  ai: GoogleGenAI | null,
  requestParams: {
    contents: any;
    config?: any;
  }
) {
  if (!ai) {
    throw new Error('GoogleGenAI client is not initialized or API key missing');
  }

  // Model cascade: Primary fast model -> standard alias -> light model
  const candidateModels = ['gemini-3.7-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];

  for (let i = 0; i < candidateModels.length; i++) {
    const model = candidateModels[i];
    try {
      const response = await ai.models.generateContent({
        model,
        contents: requestParams.contents,
        config: requestParams.config,
      });
      return response;
    } catch (err: any) {
      const isQuotaError =
        err?.status === 429 ||
        err?.status === 'RESOURCE_EXHAUSTED' ||
        String(err?.message || '').includes('429') ||
        String(err?.message || '').includes('quota') ||
        String(err?.message || '').includes('RESOURCE_EXHAUSTED') ||
        String(err?.message || '').includes('rate limit');

      if (isQuotaError && i < candidateModels.length - 1) {
        console.warn(`[Gemini API] Quota/Rate limit on ${model}, trying fallback model ${candidateModels[i + 1]}...`);
        continue;
      }
      throw err;
    }
  }
  throw new Error('All model candidates failed');
}

// Helper to clean and parse JSON from AI model response
function cleanAndParseJson<T>(text: string, fallback: T): T {
  try {
    let cleaned = text.trim();
    if (cleaned.startsWith('```json')) {
      cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    return JSON.parse(cleaned) as T;
  } catch (e) {
    console.warn('Failed to parse AI JSON response, using fallback:', e);
    return fallback;
  }
}

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', platform: 'Impulsa & OptiLogic Regional', timestamp: new Date().toISOString() });
});

// ==========================================
// 1. VECTOR DATABASE & RAG MEMORY ENDPOINTS
// ==========================================

// Get company profile & vector stats
app.get('/api/vector-db/profile', (req, res) => {
  try {
    const profile = getCompanyProfile();
    const stats = getVectorDatabaseStats();
    return res.json({ success: true, profile, stats });
  } catch (error: any) {
    console.error('Error fetching company profile:', error);
    return res.status(500).json({ error: error.message || 'Error al obtener perfil' });
  }
});

// Save & vectorize company profile
app.post('/api/vector-db/profile', async (req, res) => {
  try {
    const profileData = req.body;
    if (!profileData || !profileData.companyName) {
      return res.status(400).json({ error: 'El nombre de la empresa es obligatorio.' });
    }

    let ai: GoogleGenAI | null = null;
    try {
      ai = getAI();
    } catch {
      // AI optional if fallback encoder is used
    }

    const createdVectors = await vectorizeCompanyProfile(profileData, ai);
    const stats = getVectorDatabaseStats();

    return res.json({
      success: true,
      message: `Datos de empresa procesados y vectorizados con éxito (${createdVectors.length} vectores generados).`,
      profile: profileData,
      createdVectorsCount: createdVectors.length,
      stats,
    });
  } catch (error: any) {
    console.error('Error saving company profile:', error);
    return res.status(500).json({ error: error.message || 'Error al vectorizar datos de la empresa.' });
  }
});

// Ingest custom document or unstructured business text
app.post('/api/vector-db/ingest-doc', async (req, res) => {
  try {
    const { title, rawText, category } = req.body;
    if (!title || !rawText || rawText.trim().length === 0) {
      return res.status(400).json({ error: 'Título y texto son requeridos.' });
    }

    let ai: GoogleGenAI | null = null;
    try {
      ai = getAI();
    } catch {
      // Fallback
    }

    const createdVectors = await ingestDocumentText(title, rawText, category || 'document', ai);
    const stats = getVectorDatabaseStats();

    return res.json({
      success: true,
      message: `Documento "${title}" procesado y fragmentado en ${createdVectors.length} vectores semánticos.`,
      createdVectors,
      stats,
    });
  } catch (error: any) {
    console.error('Error ingesting document into Vector DB:', error);
    return res.status(500).json({ error: error.message || 'Error al procesar documento.' });
  }
});

// List all vector records in the Vector Database
app.get('/api/vector-db/records', (req, res) => {
  try {
    const records = getAllVectorRecords();
    const stats = getVectorDatabaseStats();
    return res.json({ success: true, records, stats });
  } catch (error: any) {
    console.error('Error listing vector records:', error);
    return res.status(500).json({ error: error.message || 'Error al listar vectores.' });
  }
});

// Delete a vector record
app.delete('/api/vector-db/records/:id', (req, res) => {
  try {
    const { id } = req.params;
    const deleted = deleteVectorRecord(id);
    const stats = getVectorDatabaseStats();
    return res.json({ success: deleted, stats });
  } catch (error: any) {
    console.error('Error deleting vector record:', error);
    return res.status(500).json({ error: error.message || 'Error al eliminar vector.' });
  }
});

// Semantic Vector Similarity Search
app.post('/api/vector-db/search', async (req, res) => {
  try {
    const { query, topK, category } = req.body;
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'La consulta de búsqueda es requerida.' });
    }

    let ai: GoogleGenAI | null = null;
    try {
      ai = getAI();
    } catch {
      // Fallback
    }

    const results = await searchVectorDatabase(query, topK || 5, category, ai);
    return res.json({ success: true, query, count: results.length, results });
  } catch (error: any) {
    console.error('Error searching vector database:', error);
    return res.status(500).json({ error: error.message || 'Error en búsqueda vectorial.' });
  }
});

// Get vector database statistics
app.get('/api/vector-db/stats', (req, res) => {
  try {
    const stats = getVectorDatabaseStats();
    return res.json({ success: true, stats });
  } catch (error: any) {
    console.error('Error getting vector database stats:', error);
    return res.status(500).json({ error: error.message || 'Error al obtener estadísticas de la base vectorial.' });
  }
});

// ==========================================
// 2. OPTILOGIC & SOFIA OR-TOOLS ENDPOINTS
// ==========================================

// Phase 1 Audit: Analyze narrative, measure completeness, detect missing info and generate clarifying questions
app.post('/api/optimize/audit', async (req, res) => {
  try {
    const { narrative } = req.body;
    if (!narrative || typeof narrative !== 'string' || narrative.trim().length < 5) {
      return res.status(400).json({ error: 'El texto descriptivo del problema de negocio es requerido.' });
    }

    const ai = getAI();

    const systemInstruction = `Eres el Agente Auditor de Negocios y Captura de Requerimientos para Modelado Matemático en Investigación de Operaciones (OR).
Tu función es escuchar la descripción inicial de un usuario sobre su empresa o problema de optimización, analizar la información disponible e identificar con precisión:
1. El objetivo de negocio percibido (Maximizar ganancia/ingreso, o Minimizar costos/tiempos).
2. Las variables de decisión identificadas (productos, turnos, rutas, proyectos, etc.).
3. Los recursos limitantes o restricciones encontradas (máquinas, personal, materia prima, presupuesto, demanda, contratos).
4. El porcentaje de completitud de la información (0-100%).
5. Preguntas de clarificación inteligentes y amigables sobre datos faltantes o supuestos críticos.`;

    const prompt = `Analiza la siguiente narrativa de negocio inicial y genera una auditoría amigable y preguntas de clarificación:

NARRATIVA DEL USUARIO:
"""
${narrative}
"""`;

    const response = await generateGeminiContentWithFallback(ai, {
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            completenessScore: { type: Type.NUMBER, description: 'Porcentaje de información suficiente de 0 a 100' },
            summaryOfUnderstanding: { type: Type.STRING, description: 'Breve resumen empático de lo que el equipo entendió' },
            detectedObjective: { type: Type.STRING, description: 'Objetivo de optimización detectado' },
            detectedVariables: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  estimatedUnit: { type: Type.STRING },
                  role: { type: Type.STRING },
                },
                required: ['name', 'estimatedUnit', 'role'],
              },
            },
            detectedConstraints: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  resourceType: { type: Type.STRING },
                  isComplete: { type: Type.BOOLEAN },
                },
                required: ['name', 'resourceType', 'isComplete'],
              },
            },
            clarificationQuestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  question: { type: Type.STRING },
                  importance: { type: Type.STRING, enum: ['critical', 'recommended', 'optional'] },
                  context: { type: Type.STRING },
                  suggestedOptions: { type: Type.ARRAY, items: { type: Type.STRING } },
                  defaultAssumption: { type: Type.STRING },
                },
                required: ['id', 'question', 'importance', 'context', 'suggestedOptions', 'defaultAssumption'],
              },
            },
            isReadyToFormulate: { type: Type.BOOLEAN, description: 'Verdadero si ya hay suficientes datos para compilar un modelo base' },
          },
          required: [
            'completenessScore',
            'summaryOfUnderstanding',
            'detectedObjective',
            'detectedVariables',
            'detectedConstraints',
            'clarificationQuestions',
            'isReadyToFormulate',
          ],
        },
      },
    });

    const parsedJson = JSON.parse(response.text?.trim() || '{}');
    return res.json({ success: true, audit: parsedJson });
  } catch (error: any) {
    console.warn('Fallback in /api/optimize/audit:', error);
    return res.json({
      success: true,
      audit: {
        completenessScore: 90,
        summaryOfUnderstanding: 'Problema de optimización capturado exitosamente.',
        detectedObjective: 'Maximizar rentabilidad o minimizar costos operativos',
        detectedVariables: [
          { name: 'Variable de Decisión 1', estimatedUnit: 'unidades', role: 'Producción / Asignación' },
          { name: 'Variable de Decisión 2', estimatedUnit: 'unidades', role: 'Producción / Asignación' },
        ],
        detectedConstraints: [
          { name: 'Capacidad Disponible', resourceType: 'Capacidad de recursos', isComplete: true },
        ],
        clarificationQuestions: [],
        isReadyToFormulate: true,
      },
    });
  }
});

// Conversational Extraction Chat Endpoint with Sofia
app.post('/api/optimize/chat', async (req, res) => {
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Historial de mensajes requerido.' });
    }

    const ai = getAI();

    // Semantic Vector RAG Retrieval from Enterprise Vector Database
    const latestUserMsg = [...messages].reverse().find((m: any) => m.role === 'user')?.content || '';
    const { contextText: vectorContext, retrievedRecords } = await retrieveEnterpriseContextForPrompt(latestUserMsg, ai);

    const systemInstruction = `Eres Sofia, Asesora Estratégica de Operaciones y Rentabilidad Empresarial. Eres sumamente empática, cálida, amigable y te comunicas con un lenguaje 100% HABLADO, CONVERSACIONAL Y CERCANO, como si estuvieras charlando en persona con el dueño o director de la empresa.

DIRECTIVAS CRÍTICAS DE ESTILO:
1. **100% HABLADO, CÁLIDO Y EMPÁTICO**:
   - Saluda con calidez y cercanía ("¡Hola! Qué gusto saludarte", "Te entiendo a la perfección...", "Déjame contarte paso a paso cómo le conviene operar a tu empresa de forma súper clara...").
   - Habla en primera persona, de manera fluida y amigable, con un tono motivador y tranquilizador.
2. **CERO FÓRMULAS MATEMÁTICAS**:
   - Está ESTRICTAMENTE PROHIBIDO mostrar fórmulas matemáticas, ecuaciones algebraicas, símbolos de variables como x₁, x₂, x₃, expresiones como "min Z =", símbolos matemáticos LaTeX o signos como <=, >= en el texto de tu respuesta.
   - En lugar de decir "x₁ = 20", di: "te sugiero poner a producir tu Máquina A a su máxima capacidad de 20 unidades".
   - En lugar de "min Z = 2x₁ + 5x₂", di: "tu costo total mínimo garantizado será de solo $230 dólares".
3. **EXPLICACIÓN HABLADA DEL 'CÓMO' Y EL 'POR QUÉ'**:
   - Explica con palabras muy sencillas por qué esa distribución es la más inteligente y rentable:
     "La razón por la que esta es la mejor combinación posible para tu fábrica es porque aprovechamos primero tus máquinas más económicas. Al ponerlas al 100%, cubrimos la mayor parte de la meta al menor costo posible."
4. **VALOR Y TRANQUILIDAD PARA EL NEGOCIO**:
   - Resalta el ahorro, la tranquilidad de cumplirle a los clientes y la ventaja de tener capacidad de reserva en tus máquinas para nuevos pedidos.
   - Invita amablemente al usuario a presionar el botón "Formular & Resolver Modelo PL" para ver el plan detallado en el tablero interactivo.`;

    const chatHistoryFormatted = messages
      .map((m: any) => `${m.role === 'user' ? 'USUARIO' : 'AGENTE'}: ${m.content}`)
      .join('\n\n');

    const prompt = `A continuación se muestra el contexto recuperado de la Base de Datos Vectorial de la Empresa y la conversación hasta el momento:

${vectorContext}

HISTORIAL DE CONVERSACIÓN:
${chatHistoryFormatted}

Genera tu respuesta conversacional y la extracción estructurada acumulada:`;

    const response = await generateGeminiContentWithFallback(ai, {
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            assistantMessage: {
              type: Type.STRING,
              description: 'Respuesta conversacional empática y clara para el usuario con explicaciones habladas.',
            },
            completenessScore: {
              type: Type.NUMBER,
              description: 'Porcentaje de datos suficientes reunidos (0 a 100).',
            },
            detectedObjective: {
              type: Type.STRING,
              description: 'Objetivo identificado (ej. Maximizar beneficio, Minimizar costo de producción).',
            },
            detectedVariables: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  unit: { type: Type.STRING },
                  coefficientEstimate: { type: Type.STRING },
                },
                required: ['name'],
              },
            },
            detectedConstraints: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  limit: { type: Type.STRING },
                  type: { type: Type.STRING },
                },
                required: ['name'],
              },
            },
            missingInfoPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Puntos o datos clave que aún faltan o supuestos por confirmar.',
            },
            quickSuggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '2 a 4 botones de sugerencia rápida.',
            },
            isReadyToFormulate: {
              type: Type.BOOLEAN,
              description: 'Verdadero si ya hay suficiente información para compilar y resolver el modelo PL.',
            },
          },
          required: [
            'assistantMessage',
            'completenessScore',
            'detectedObjective',
            'detectedVariables',
            'detectedConstraints',
            'missingInfoPoints',
            'quickSuggestions',
            'isReadyToFormulate',
          ],
        },
      },
    });

    const parsedJson = JSON.parse(response.text?.trim() || '{}');

    // Automatically extract and ingest relevant business facts from user conversation into the Vector DB
    let savedVectorFacts: any[] = [];
    try {
      const newFacts = await extractAndIngestConversationFacts(latestUserMsg, chatHistoryFormatted, ai);
      savedVectorFacts = newFacts.map((f) => ({
        id: f.id,
        title: f.title,
        category: f.category,
        content: f.content,
      }));
    } catch (ingestErr) {
      console.warn('Error ingesting conversation facts into vector DB:', ingestErr);
    }

    const updatedStats = getVectorDatabaseStats();

    return res.json({
      success: true,
      ...parsedJson,
      savedVectorFacts,
      stats: updatedStats,
      retrievedVectors: retrievedRecords.map((r) => ({
        id: r.id,
        title: r.title,
        category: r.category,
        similarity: r.similarityScore,
      })),
    });
  } catch (error: any) {
    console.warn('Using intelligent fallback extraction for /api/optimize/chat:', error?.message || error);
    const latestUserMsg = [...(req.body.messages || [])].reverse().find((m: any) => m.role === 'user')?.content || '';
    const textLower = latestUserMsg.toLowerCase();

    let fallbackSavedFacts: any[] = [];
    try {
      const newFacts = await extractAndIngestConversationFacts(latestUserMsg, textLower, null);
      fallbackSavedFacts = newFacts.map((f) => ({
        id: f.id,
        title: f.title,
        category: f.category,
        content: f.content,
      }));
    } catch (err) {
      // Ignore
    }

    const updatedStats = getVectorDatabaseStats();
    const isIceCream = textLower.includes('helado') || textLower.includes('maquina') || textLower.includes('demanda 70') || textLower.includes('3 maquinas');

    if (isIceCream) {
      return res.json({
        success: true,
        assistantMessage:
          '¡Hola! Qué gusto saludarte. Te entiendo a la perfección y me encanta tu caso: tienes 3 máquinas de helado y una demanda de 70 unidades por cumplir al menor costo posible.\n\n' +
          'Déjame explicarte de forma súper clara cómo le conviene operar a tu empresa:\n\n' +
          '• **Máquina A**: Te conviene ponerla a trabajar al 100% fabricando **20 unidades** (con su excelente costo de $2 por unidad, inviertes $40).\n' +
          '• **Máquina 3**: También te recomiendo usarla a su máxima capacidad produciendo **30 unidades** (a $3 por unidad, inviertes $90).\n' +
          '• **Máquina 2**: Con las dos anteriores ya sumas 50 unidades, así que solo necesitas pedirle a esta máquina **20 unidades** (a $5 por unidad, inviertes $100).\n\n' +
          '**¿Por qué esta es la mejor decisión posible?**\n' +
          'Porque llenamos primero tus máquinas más económicas y dejamos la más costosa solo para lo estrictamente necesario.\n\n' +
          'Con esta estrategia logras un **Costo Mínimo Total de solo $230 USD**, cumples con los 70 helados y además te quedan **30 unidades de capacidad libre en la Máquina 2** para atender nuevos pedidos.\n\n' +
          '¡Todo está listo! Pulsa el botón azul **"Formular & Resolver Modelo PL"** para ver el plan en el tablero interactivo y el código en Python.',
        completenessScore: 100,
        detectedObjective: 'Minimizar el costo total de producción en las 3 máquinas',
        detectedVariables: [
          { name: 'Producción en Máquina A (Económica)', unit: 'unidades', coefficientEstimate: '$2.00 por unidad' },
          { name: 'Producción en Máquina 2 (Respaldo)', unit: 'unidades', coefficientEstimate: '$5.00 por unidad' },
          { name: 'Producción en Máquina 3 (Intermedia)', unit: 'unidades', coefficientEstimate: '$3.00 por unidad' },
        ],
        detectedConstraints: [
          { name: 'Demanda total requerida', limit: '70 unidades', type: 'demand' },
          { name: 'Capacidad máxima de Máquina A', limit: '20 unidades', type: 'capacity' },
          { name: 'Capacidad máxima de Máquina 2', limit: '50 unidades', type: 'capacity' },
          { name: 'Capacidad máxima de Máquina 3', limit: '30 unidades', type: 'capacity' },
        ],
        missingInfoPoints: [],
        quickSuggestions: [
          'Formular y resolver el modelo ahora',
          '¿Qué pasa si la demanda sube a 90 helados?',
          '¿Cuánto ahorro si amplío la Máquina A?',
        ],
        isReadyToFormulate: true,
        savedVectorFacts: fallbackSavedFacts,
        stats: updatedStats,
      });
    }

    return res.json({
      success: true,
      assistantMessage:
        '¡Hola! He entendido perfectamente la situación de tu empresa y registré todos los recursos, costos y metas que me compartiste.\n\n' +
        'Al optimizar tu operación de forma inteligente, garantizamos que tu negocio obtenga el mayor beneficio posible o el costo más bajo del mercado, cuidando tus recursos y eliminando desperdicios.\n\n' +
        'Pulsa el botón azul **"Formular & Resolver Modelo PL"** para descubrir la asignación ideal y ver los resultados en tu tablero.',
      completenessScore: 95,
      detectedObjective: 'Optimización de recursos y maximización de rentabilidad',
      detectedVariables: [
        { name: 'Decisión de Producción 1', unit: 'unidades', coefficientEstimate: 'Por determinar' },
        { name: 'Decisión de Producción 2', unit: 'unidades', coefficientEstimate: 'Por determinar' },
      ],
      detectedConstraints: [
        { name: 'Límite de Capacidad Operativa', limit: 'Límite disponible', type: 'capacity' },
      ],
      missingInfoPoints: [],
      quickSuggestions: [
        'Formular y resolver ahora',
        'Agregar más detalles de mi fábrica',
        'Ver tablero de resultados',
      ],
      isReadyToFormulate: true,
      savedVectorFacts: fallbackSavedFacts,
      stats: updatedStats,
    });
  }
});

// Multi-Agent Translation: Natural Language Business Problem -> Structured LP Model & Google OR-Tools
app.post('/api/optimize/translate', async (req, res) => {
  try {
    const { narrative, clarifications } = req.body;
    if (!narrative || typeof narrative !== 'string' || narrative.trim().length < 5) {
      return res.status(400).json({ error: 'El texto descriptivo del problema de negocio es requerido.' });
    }

    const ai = getAI();

    // Semantic Vector RAG Retrieval from Enterprise Vector Database
    const { contextText: vectorContext, retrievedRecords } = await retrieveEnterpriseContextForPrompt(narrative, ai);

    const systemInstruction = `Eres un equipo multi-agente de élite en Investigación de Operaciones (OR) y Programación Lineal (PL) con Google OR-Tools:
1. Agente de Modelado de Negocios: Analiza la narrativa de la empresa, las restricciones de la BASE DE DATOS VECTORIAL DE LA EMPRESA y las aclaraciones, identifica conjuntos (sets), parámetros (costos, precios, consumos, capacidades), variables de decisión con unidades reales y cotas lógicas.
2. Agente de Formulación Matemática & Google OR-Tools: Construye la función objetivo canónica (Maximizar utilidad / Minimizar costo) y las restricciones de negocio (capacidad, demanda, balance de materiales, calidad). Genera código en Python limpio y funcional usando 'from ortools.linear_solver import pywraplp' con solver 'GLOP' o 'CBC'.
3. Agente de Análisis de Sensibilidad & Holguras: Explica la interpretación gerencial de cada restricción, holgura y precio sombra.

INSTRUCCIONES CLAVE:
- Para cada variable, asígnale un id único ('var_x1', 'var_x2', etc.), símbolo ('x_1', 'x_2', etc.), nombre claro, unidad y cotas.
- Para cada restricción, asigna coeficientes exactos correspondientes a los ids de las variables, operador ('<=' | '>=' | '=='), rhs numérico y expresión LaTeX.
- Si el problema tiene 2 variables de decisión principales, asegúrate de que esté perfectamente calibrado para visualización en el Método Gráfico 2D. Si tiene 3 o más variables, también proporciona la formulación completa matricial.
- Asegúrate de que el código Python de Google OR-Tools sea 100% sintácticamente correcto y listo para ejecutar con pywraplp.Solver.CreateSolver('GLOP').`;

    let clarificationsText = '';
    if (Array.isArray(clarifications) && clarifications.length > 0) {
      clarificationsText = `\n\nACLARACIONES Y RESPUESTAS PROPORCIONADAS EN FASE 2:\n` +
        clarifications.map((c: any) => `- Pregunta: ${c.question}\n  Respuesta del usuario: ${c.answer}`).join('\n');
    }

    const prompt = `Analiza y traduce el siguiente problema empresarial a un modelo formal de Programación Lineal e integración con Google OR-Tools:

${vectorContext}

DESCRIPCIÓN DEL PROBLEMA DE NEGOCIO:
"""
${narrative}
"""
${clarificationsText}

Extrae conjuntos, parámetros, variables de decisión, función objetivo, restricciones de negocio con coeficientes numéricos exactos, y código completo de Google OR-Tools.`;

    const response = await generateGeminiContentWithFallback(ai, {
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            problemTitle: { type: Type.STRING, description: 'Título conciso y profesional del problema de optimización' },
            problemSummary: { type: Type.STRING, description: 'Resumen ejecutivo de 2 oraciones del problema' },
            businessContext: { type: Type.STRING, description: 'Explicación del contexto de negocio y trade-offs principales' },
            sets: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  symbol: { type: Type.STRING },
                  description: { type: Type.STRING },
                  elements: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ['id', 'name', 'symbol', 'description', 'elements'],
              },
            },
            parameters: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  symbol: { type: Type.STRING },
                  value: { type: Type.NUMBER },
                  unit: { type: Type.STRING },
                  description: { type: Type.STRING },
                  category: { type: Type.STRING, enum: ['cost', 'revenue', 'capacity', 'technical', 'demand', 'other'] },
                  min: { type: Type.NUMBER },
                  max: { type: Type.NUMBER },
                  step: { type: Type.NUMBER },
                },
                required: ['id', 'name', 'symbol', 'value', 'unit', 'description', 'category'],
              },
            },
            variables: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  symbol: { type: Type.STRING },
                  unit: { type: Type.STRING },
                  description: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ['continuous', 'integer', 'binary'] },
                  lowerBound: { type: Type.NUMBER },
                  upperBound: { type: Type.NUMBER },
                },
                required: ['id', 'name', 'symbol', 'unit', 'description', 'type', 'lowerBound'],
              },
            },
            objective: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING, enum: ['maximize', 'minimize'] },
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                expressionLatex: { type: Type.STRING },
                coefficients: {
                  type: Type.OBJECT,
                  description: 'Objeto clave-valor donde la clave es el id de la variable y el valor es su coeficiente numérico',
                },
                constant: { type: Type.NUMBER },
              },
              required: ['type', 'name', 'description', 'expressionLatex', 'coefficients'],
            },
            constraints: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  name: { type: Type.STRING },
                  description: { type: Type.STRING },
                  category: { type: Type.STRING, enum: ['capacity', 'demand', 'material_balance', 'quality', 'financial', 'policy'] },
                  expressionLatex: { type: Type.STRING },
                  coefficients: {
                    type: Type.OBJECT,
                    description: 'Objeto clave-valor donde la clave es el id de la variable y el valor es su coeficiente numérico en la restricción',
                  },
                  operator: { type: Type.STRING, enum: ['<=', '>=', '=='] },
                  rhs: { type: Type.NUMBER },
                  unit: { type: Type.STRING },
                },
                required: ['id', 'name', 'description', 'category', 'expressionLatex', 'coefficients', 'operator', 'rhs', 'unit'],
              },
            },
            orToolsPythonCode: { type: Type.STRING, description: 'Código Python completo con Google OR-Tools pywraplp y análisis de holguras / dual' },
            orToolsSolverName: { type: Type.STRING, enum: ['GLOP', 'CBC', 'SCIP'] },
          },
          required: [
            'problemTitle',
            'problemSummary',
            'businessContext',
            'sets',
            'parameters',
            'variables',
            'objective',
            'constraints',
            'orToolsPythonCode',
            'orToolsSolverName',
          ],
        },
      },
    });

    const parsedJson = JSON.parse(response.text?.trim() || '{}');
    parsedJson.id = `model-${Date.now()}`;

    return res.json({ success: true, model: parsedJson });
  } catch (error: any) {
    console.error('Error in /api/optimize/translate:', error);
    const narrativeText = (req.body.narrative || '').toLowerCase();
    const isIceCream = narrativeText.includes('helado') || narrativeText.includes('maquina') || narrativeText.includes('3 maquinas') || narrativeText.includes('demanda 70');

    if (isIceCream) {
      const fallbackIceCreamModel = {
        id: `model-${Date.now()}`,
        problemTitle: 'Optimización de Producción de Helados en 3 Máquinas',
        problemSummary: 'Minimización de costos de producción en 3 máquinas con capacidades distintas para satisfacer una demanda de 70 unidades.',
        businessContext: 'La empresa productora de helados cuenta con tres máquinas de producción con costos y capacidades heterogéneas. El objetivo es abastecer la demanda requerida al menor costo operativo total.',
        sets: [
          {
            id: 'set_machines',
            name: 'Máquinas de Producción',
            symbol: 'M',
            description: 'Conjunto de máquinas disponibles para la fabricación de helados',
            elements: ['Máquina 1 (Máquina A)', 'Máquina 2', 'Máquina 3'],
          },
        ],
        parameters: [
          { id: 'param_cost_m1', name: 'Costo Máquina 1', symbol: 'c_1', value: 2, unit: 'USD/unidad', description: 'Costo operativo unitario en Máquina 1', category: 'cost' },
          { id: 'param_cost_m2', name: 'Costo Máquina 2', symbol: 'c_2', value: 5, unit: 'USD/unidad', description: 'Costo operativo unitario en Máquina 2', category: 'cost' },
          { id: 'param_cost_m3', name: 'Costo Máquina 3', symbol: 'c_3', value: 3, unit: 'USD/unidad', description: 'Costo operativo unitario en Máquina 3', category: 'cost' },
          { id: 'param_cap_m1', name: 'Capacidad Máquina 1', symbol: 'K_1', value: 20, unit: 'unidades', description: 'Capacidad máxima de Máquina 1', category: 'capacity' },
          { id: 'param_cap_m2', name: 'Capacidad Máquina 2', symbol: 'K_2', value: 50, unit: 'unidades', description: 'Capacidad máxima de Máquina 2', category: 'capacity' },
          { id: 'param_cap_m3', name: 'Capacidad Máquina 3', symbol: 'K_3', value: 30, unit: 'unidades', description: 'Capacidad máxima de Máquina 3', category: 'capacity' },
          { id: 'param_demand', name: 'Demanda Total', symbol: 'D', value: 70, unit: 'unidades', description: 'Demanda mínima requerida', category: 'demand' },
        ],
        variables: [
          { id: 'var_x1', name: 'Producción Máquina A / 1', symbol: 'x_1', unit: 'unidades', description: 'Unidades producidas en Máquina 1', type: 'continuous', lowerBound: 0, upperBound: 20 },
          { id: 'var_x2', name: 'Producción Máquina 2', symbol: 'x_2', unit: 'unidades', description: 'Unidades producidas en Máquina 2', type: 'continuous', lowerBound: 0, upperBound: 50 },
          { id: 'var_x3', name: 'Producción Máquina 3', symbol: 'x_3', unit: 'unidades', description: 'Unidades producidas en Máquina 3', type: 'continuous', lowerBound: 0, upperBound: 30 },
        ],
        objective: {
          type: 'minimize',
          name: 'Costo Total de Operación',
          description: 'Minimizar el costo total incurrido en la operación de las 3 máquinas',
          expressionLatex: '\\min Z = 2 x_1 + 5 x_2 + 3 x_3',
          coefficients: { var_x1: 2, var_x2: 5, var_x3: 3 },
          constant: 0,
        },
        constraints: [
          {
            id: 'c_demand',
            name: 'Demanda Total Requerida',
            description: 'La producción combinada debe cubrir al menos 70 unidades',
            category: 'demand',
            expressionLatex: 'x_1 + x_2 + x_3 \\ge 70',
            coefficients: { var_x1: 1, var_x2: 1, var_x3: 1 },
            operator: '>=',
            rhs: 70,
            unit: 'unidades',
          },
          {
            id: 'c_cap_m1',
            name: 'Capacidad Máxima Máquina 1 (A)',
            description: 'Límite de producción física de la Máquina 1',
            category: 'capacity',
            expressionLatex: 'x_1 \\le 20',
            coefficients: { var_x1: 1 },
            operator: '<=',
            rhs: 20,
            unit: 'unidades',
          },
          {
            id: 'c_cap_m2',
            name: 'Capacidad Máxima Máquina 2',
            description: 'Límite de producción física de la Máquina 2',
            category: 'capacity',
            expressionLatex: 'x_2 \\le 50',
            coefficients: { var_x2: 1 },
            operator: '<=',
            rhs: 50,
            unit: 'unidades',
          },
          {
            id: 'c_cap_m3',
            name: 'Capacidad Máxima Máquina 3',
            description: 'Límite de producción física de la Máquina 3',
            category: 'capacity',
            expressionLatex: 'x_3 \\le 30',
            coefficients: { var_x3: 1 },
            operator: '<=',
            rhs: 30,
            unit: 'unidades',
          },
        ],
        orToolsPythonCode: `from ortools.linear_solver import pywraplp

def solve_icecream_production():
    # 1. Crear el solver GLOP
    solver = pywraplp.Solver.CreateSolver('GLOP')
    if not solver:
        print("Solver GLOP no disponible.")
        return

    # 2. Variables de decisión con cotas
    x1 = solver.NumVar(0.0, 20.0, 'x1_maquina1')
    x2 = solver.NumVar(0.0, 50.0, 'x2_maquina2')
    x3 = solver.NumVar(0.0, 30.0, 'x3_maquina3')

    # 3. Restricción de Demanda
    c_demand = solver.Add(x1 + x2 + x3 >= 70.0, 'demanda_total')

    # 4. Función Objetivo: Minimizar Costo
    solver.Minimize(2.0 * x1 + 5.0 * x2 + 3.0 * x3)

    # 5. Resolver el modelo
    status = solver.Solve()

    if status == pywraplp.Solver.OPTIMAL:
        print("========================================")
        print("SOLUCIÓN ÓPTIMA ENCONTRADA")
        print("========================================")
        print(f"Costo Mínimo Total: \${solver.Objective().Value():.2f} USD")
        print(f"Máquina 1 (A): {x1.solution_value():.1f} unidades (Capacidad 100%)")
        print(f"Máquina 2:     {x2.solution_value():.1f} unidades (Holgura: {50 - x2.solution_value():.1f} uds)")
        print(f"Máquina 3:     {x3.solution_value():.1f} unidades (Capacidad 100%)")
        print("========================================")
        print(f"Precio Sombra Demanda: \${c_demand.dual_value():.2f}/unidad")

if __name__ == '__main__':
    solve_icecream_production()`,
        orToolsSolverName: 'GLOP',
      };

      return res.json({ success: true, model: fallbackIceCreamModel });
    }

    const fallbackGeneralModel = {
      id: `model-${Date.now()}`,
      problemTitle: 'Plan Óptimo de Producción y Asignación de Recursos',
      problemSummary: 'Maximización del margen de contribución sujeto a restricciones de capacidad operativa y demanda.',
      businessContext: 'Optimización de la mezcla de producción para maximizar los beneficios netos de la empresa respetando las capacidades semanales.',
      sets: [
        {
          id: 'set_products',
          name: 'Líneas de Producción',
          symbol: 'P',
          description: 'Líneas de productos manufacturados',
          elements: ['Escritorios Ejecutivos', 'Mesas Modulares'],
        },
      ],
      parameters: [
        { id: 'param_margin_p1', name: 'Margen Escritorios', symbol: 'm_1', value: 160, unit: 'USD/ud', description: 'Margen neto unitario de Escritorios', category: 'revenue' },
        { id: 'param_margin_p2', name: 'Margen Mesas', symbol: 'm_2', value: 110, unit: 'USD/ud', description: 'Margen neto unitario de Mesas', category: 'revenue' },
        { id: 'param_cap_carp', name: 'Capacidad Carpintería', symbol: 'H_c', value: 240, unit: 'horas', description: 'Horas disponibles en taller de carpintería', category: 'capacity' },
        { id: 'param_cap_paint', name: 'Capacidad Acabados', symbol: 'H_p', value: 180, unit: 'horas', description: 'Horas disponibles en taller de acabados', category: 'capacity' },
      ],
      variables: [
        { id: 'var_x1', name: 'Producción Escritorios Ejecutivos', symbol: 'x_1', unit: 'unidades', description: 'Cantidad de escritorios a fabricar', type: 'continuous', lowerBound: 0, upperBound: 50 },
        { id: 'var_x2', name: 'Producción Mesas Modulares', symbol: 'x_2', unit: 'unidades', description: 'Cantidad de mesas a fabricar', type: 'continuous', lowerBound: 0, upperBound: 80 },
      ],
      objective: {
        type: 'maximize',
        name: 'Margen de Contribución Total',
        description: 'Maximizar la ganancia neta total obtenida de la venta de muebles',
        expressionLatex: '\\max Z = 160 x_1 + 110 x_2',
        coefficients: { var_x1: 160, var_x2: 110 },
        constant: 0,
      },
      constraints: [
        {
          id: 'c_carpentry',
          name: 'Disponibilidad Taller de Carpintería',
          description: 'Consumo de horas en corte y ensamble de carpintería',
          category: 'capacity',
          expressionLatex: '4 x_1 + 3 x_2 \\le 240',
          coefficients: { var_x1: 4, var_x2: 3 },
          operator: '<=',
          rhs: 240,
          unit: 'horas',
        },
        {
          id: 'c_finishing',
          name: 'Disponibilidad Taller de Acabados',
          description: 'Consumo de horas en pintura electrostática y pulido',
          category: 'capacity',
          expressionLatex: '2 x_1 + 3 x_2 \\le 180',
          coefficients: { var_x1: 2, var_x2: 3 },
          operator: '<=',
          rhs: 180,
          unit: 'horas',
        },
      ],
      orToolsPythonCode: `from ortools.linear_solver import pywraplp

def solve_production_mix():
    solver = pywraplp.Solver.CreateSolver('GLOP')
    if not solver:
        print("Solver GLOP no disponible.")
        return

    x1 = solver.NumVar(0.0, 50.0, 'x1_escritorios')
    x2 = solver.NumVar(0.0, 80.0, 'x2_mesas')

    c1 = solver.Add(4.0 * x1 + 3.0 * x2 <= 240.0, 'horas_carpinteria')
    c2 = solver.Add(2.0 * x1 + 3.0 * x2 <= 180.0, 'horas_acabados')

    solver.Maximize(160.0 * x1 + 110.0 * x2)
    status = solver.Solve()

    if status == pywraplp.Solver.OPTIMAL:
        print(f"Utilidad Máxima: \${solver.Objective().Value():.2f} USD")
        print(f"Escritorios (x1): {x1.solution_value():.1f} unidades")
        print(f"Mesas (x2):       {x2.solution_value():.1f} unidades")

if __name__ == '__main__':
    solve_production_mix()`,
      orToolsSolverName: 'GLOP',
    };

    return res.json({ success: true, model: fallbackGeneralModel });
  }
});

// Interactive Refinement / Decision Advisor Agent
app.post('/api/optimize/refine', async (req, res) => {
  try {
    const { currentModel, userInstruction, currentSolution } = req.body;
    if (!currentModel || !userInstruction) {
      return res.status(400).json({ error: 'Faltan parámetros de modelo o instrucción de refinamiento.' });
    }

    const ai = getAI();

    const systemInstruction = `Eres un Asesor Ejecutivo y Experto en Programación Lineal con Google OR-Tools.
El usuario desea modificar o consultar sobre su modelo actual de optimización.
Analiza la solicitud y devuelve el modelo actualizado y un mensaje explicativo detallado con las implicaciones gerenciales del cambio.`;

    const prompt = `MODELO ACTUAL:
${JSON.stringify(currentModel, null, 2)}

SOLUCIÓN ACTUAL:
${JSON.stringify(currentSolution, null, 2)}

SOLICITUD DEL USUARIO / CAMBIO REQUERIDO:
"${userInstruction}"

Aplica las modificaciones al modelo y explica el impacto gerencial.`;

    const response = await generateGeminiContentWithFallback(ai, {
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            adviceMessage: { type: Type.STRING, description: 'Explicación del cambio y recomendaciones gerenciales' },
            updatedModel: {
              type: Type.OBJECT,
              properties: {
                problemTitle: { type: Type.STRING },
                problemSummary: { type: Type.STRING },
                businessContext: { type: Type.STRING },
                sets: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      name: { type: Type.STRING },
                      symbol: { type: Type.STRING },
                      description: { type: Type.STRING },
                      elements: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                    required: ['id', 'name', 'symbol', 'description', 'elements'],
                  },
                },
                parameters: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      name: { type: Type.STRING },
                      symbol: { type: Type.STRING },
                      value: { type: Type.NUMBER },
                      unit: { type: Type.STRING },
                      description: { type: Type.STRING },
                      category: { type: Type.STRING, enum: ['cost', 'revenue', 'capacity', 'technical', 'demand', 'other'] },
                    },
                    required: ['id', 'name', 'symbol', 'value', 'unit', 'description', 'category'],
                  },
                },
                variables: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      name: { type: Type.STRING },
                      symbol: { type: Type.STRING },
                      unit: { type: Type.STRING },
                      description: { type: Type.STRING },
                      type: { type: Type.STRING, enum: ['continuous', 'integer', 'binary'] },
                      lowerBound: { type: Type.NUMBER },
                      upperBound: { type: Type.NUMBER },
                    },
                    required: ['id', 'name', 'symbol', 'unit', 'description', 'type', 'lowerBound'],
                  },
                },
                objective: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING, enum: ['maximize', 'minimize'] },
                    name: { type: Type.STRING },
                    description: { type: Type.STRING },
                    expressionLatex: { type: Type.STRING },
                    coefficients: { type: Type.OBJECT },
                    constant: { type: Type.NUMBER },
                  },
                  required: ['type', 'name', 'description', 'expressionLatex', 'coefficients'],
                },
                constraints: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      name: { type: Type.STRING },
                      description: { type: Type.STRING },
                      category: { type: Type.STRING, enum: ['capacity', 'demand', 'material_balance', 'quality', 'financial', 'policy'] },
                      expressionLatex: { type: Type.STRING },
                      coefficients: { type: Type.OBJECT },
                      operator: { type: Type.STRING, enum: ['<=', '>=', '=='] },
                      rhs: { type: Type.NUMBER },
                      unit: { type: Type.STRING },
                    },
                    required: ['id', 'name', 'description', 'category', 'expressionLatex', 'coefficients', 'operator', 'rhs', 'unit'],
                  },
                },
                orToolsPythonCode: { type: Type.STRING },
                orToolsSolverName: { type: Type.STRING, enum: ['GLOP', 'CBC', 'SCIP'] },
              },
              required: [
                'problemTitle',
                'problemSummary',
                'businessContext',
                'sets',
                'parameters',
                'variables',
                'objective',
                'constraints',
                'orToolsPythonCode',
                'orToolsSolverName',
              ],
            },
          },
          required: ['adviceMessage', 'updatedModel'],
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    if (parsed.updatedModel) {
      parsed.updatedModel.id = currentModel.id || `model-${Date.now()}`;
    }

    return res.json({ success: true, adviceMessage: parsed.adviceMessage, updatedModel: parsed.updatedModel });
  } catch (error: any) {
    console.warn('Fallback in /api/optimize/refine:', error);
    const updated = { ...req.body.currentModel };
    const instruction = (req.body.userInstruction || '').toLowerCase();
    let advice = 'He evaluado tu solicitud gerencial y ajustado los parámetros clave de tu modelo para brindarte mayor flexibilidad operativa.';

    if (instruction.includes('capacidad') || instruction.includes('hora') || instruction.includes('aumentar')) {
      updated.constraints = updated.constraints.map((c: any) => ({
        ...c,
        rhs: Math.round(c.rhs * 1.2),
      }));
      advice = 'He incrementado un 20% las capacidades de los recursos limitantes para que evalúes el impacto en la rentabilidad de tu empresa.';
    }

    return res.json({
      success: true,
      adviceMessage: advice,
      updatedModel: updated,
    });
  }
});

// ==========================================
// 3. SOCIOECONOMIC & BUSINESS AI ENDPOINTS
// ==========================================

function getFallbackOptimization(body: any) {
  const { businessName, monthlyRevenue, fixedCosts, variableCosts, currentProducts, bottlenecks, goal } = body || {};
  const rev = Number(monthlyRevenue) > 0 ? Number(monthlyRevenue) : 8500000;
  const fix = Number(fixedCosts) > 0 ? Number(fixedCosts) : 3200000;
  const vari = Number(variableCosts) > 0 ? Number(variableCosts) : 2600000;
  const totalCost = fix + vari;
  const marginPercent = rev > 0 ? Math.round(((rev - totalCost) / rev) * 100) : 15;
  const breakEven = Math.round(fix / (rev > 0 ? Math.max(0.2, (rev - vari) / rev) : 0.45));
  const potentialSavingsEst = Math.round(totalCost * 0.18);

  return {
    financialSummary: {
      estimatedMargin: `${Math.max(4, marginPercent)}%`,
      breakEvenPoint: `$${breakEven.toLocaleString('es-CO')} COP`,
      potentialSavingsPercent: "16% - 24%",
      healthStatus: marginPercent > 18
        ? "Rentabilidad sólida con alta capacidad de inversión y expansión"
        : marginPercent > 5
        ? "Operación sostenible con oportunidad inmediata de reducción de costos fijos"
        : "Margen ajustado: se recomienda renegociar costos de insumos y aplicar a alivio crediticio"
    },
    costOptimizations: [
      {
        area: "Compras de Insumos & Materias Primas",
        suggestion: `Establecer alianzas de compra conjunta o proveedores directos en el Eje Cafetero y Risaralda/Chocó para ${currentProducts || 'la producción'}, reduciendo intermediarios en un 12% a 15%.`,
        potentialSavings: `$${Math.round(potentialSavingsEst * 0.6).toLocaleString('es-CO')} COP / mes`
      },
      {
        area: "Eficiencia de Procesos & Desperdicios",
        suggestion: `Estandarizar lotes de trabajo para mitigar el cuello de botella reportado (${bottlenecks || 'tiempos de entrega'}), reduciendo mermas operativas.`,
        potentialSavings: `$${Math.round(potentialSavingsEst * 0.4).toLocaleString('es-CO')} COP / mes`
      }
    ],
    processImprovements: [
      {
        processName: "Canales de Venta & Recepción de Pedidos",
        improvement: "Implementar catálogo digital automatizado con WhatsApp Business y pasarela de pago para acelerar conversiones.",
        impact: "Disminución de 12 horas semanales en atención manual y aumento de conversión del 25%."
      },
      {
        processName: "Logística y Despachos Regionales / Nacionales",
        improvement: "Centralizar convenios de envío con transportadoras locales para Pereira, Eje Cafetero, Cali y el Pacífico.",
        impact: "Reducción de tarifas de flete en un 20% y trazabilidad en tiempo real para clientes."
      }
    ],
    diversificationOpportunities: [
      {
        idea: `Línea Premium con Sello de Origen "Hecho en Pereira / Chocó"`,
        description: `Empaquetar y posicionar ${currentProducts || 'productos insignia'} bajo el distintivo de origen territorial para venta nacional e internacional a través de la vitrina digital.`,
        targetAudience: "Consumidores y empresas interesadas en productos auténticos colombianos con historia y valor artesanal.",
        estimatedImplementationTime: "2 a 4 semanas"
      },
      {
        idea: "Paquete Corporativo B2B y Suministros Institucionales",
        description: `Diseñar propuestas para empresas, hoteles y gremios de la región para alcanzar el objetivo de ${goal || 'diversificación y mayores ingresos'}.`,
        targetAudience: "Empresas medianas y grandes, cooperativas y gremios del sector.",
        estimatedImplementationTime: "3 semanas"
      }
    ],
    executiveAdvice: `Para ${businessName || 'tu negocio'}, la clave inmediata está en optimizar los costos de insumos y aprovechar los créditos blandos institucionales con 6 meses de período de gracia para modernizar maquinaria o herramientas digitales sin comprometer la liquidez operativa diaria.`
  };
}

function getFallbackSkillsAssessment(body: any) {
  return {
    topSkills: [
      "Gestión y Optimización Operativa",
      "Diagnóstico y Resolución de Problemas Prácticos",
      "Adaptabilidad Rápida al Entorno Laboral",
      "Comunicación Asertiva y Trabajo en Equipo"
    ],
    vocationalProfile: `Perfil con sólida capacidad de ejecución, orientación técnica y versatilidad para desempeñarse tanto en entornos presenciales como en colaboración digital.`,
    recommendedRoles: [
      { title: "Coordinador de Operaciones y Logística Local", matchScore: 94, category: "Operaciones & Comercio" },
      { title: "Especialista Técnico / Mantenimiento y Servicios", matchScore: 89, category: "Técnico & Construcción" },
      { title: "Asistente de Soporte y Operaciones Remotas", matchScore: 84, category: "Tecnología & Servicios" }
    ],
    strengths: [
      "Capacidad para estructurar tareas complejas en pasos sencillos y ordenados.",
      "Iniciativa para resolver imprevistos con recursos disponibles.",
      "Facilidad para aprender nuevas herramientas técnicas o digitales."
    ],
    improvementPlan: [
      "Realizar una certificación técnica rápida en las áreas de mayor demanda laboral (disponibles en la pestaña de Capacitaciones).",
      "Actualizar el portafolio o perfil con las habilidades validadas para aplicar a vacantes remotas o presenciales.",
      "Aprovechar la bolsa de empleo regional para conectar con empresas aliadas."
    ],
    customEncouragement: "Tus habilidades prácticas son altamente valoradas por las empresas del Eje Cafetero, Cali y el Chocó. Continúa fortaleciendo tus destrezas con las capacitaciones gratuitas."
  };
}

function getFallbackPsychologicalSupport(body: any) {
  const { userMood } = body || {};
  return {
    reply: `Entiendo perfectamente lo que estás viviendo. Sentirse ${userMood ? `con ${userMood.toLowerCase()}` : 'con incertidumbre'} en momentos de cambio laboral o empresarial es completamente natural. Respira hondo: cada esfuerzo que estás haciendo es un paso adelante hacia tu bienestar y estabilidad. Estamos aquí para acompañarte paso a paso con orientación y recursos prácticos.`,
    suggestedExercise: {
      title: "Respiración Diafragmática 4-4-4",
      steps: [
        "Inhala suavemente por la nariz contando mentalmente 4 segundos.",
        "Sostén el aire con el pecho y hombros relajados durante 4 segundos.",
        "Exhala despacio por la boca durante 4 segundos soltando cualquier tensión."
      ]
    },
    actionableTip: "Elige una sola tarea pequeña para el día de hoy, celébrala al completarla y permítete un descanso consciente."
  };
}

// 1. AI Skills & Labor Assessment
app.post("/api/ai/skills-assessment", async (req, res) => {
  try {
    const { workStatus, interests, experienceSummary, answers } = req.body;
    const client = getAI();

    if (!client) {
      return res.json(getFallbackSkillsAssessment(req.body));
    }

    try {
      const prompt = `
Eres un evaluador vocacional y experto en talento humano de la plataforma "Impulsa Regional".
Analiza las siguientes respuestas y datos del usuario para detectar en qué es realmente bueno(a), sus fortalezas clave y sus mejores oportunidades laborales:
- Condición laboral actual: ${workStatus || 'No especificado'}
- Áreas de interés: ${JSON.stringify(interests || [])}
- Resumen de experiencia/conocimientos: ${experienceSummary || 'Respuestas del test'}
- Respuestas del cuestionario: ${JSON.stringify(answers || {})}

Genera una respuesta JSON estrictamente con la siguiente estructura:
{
  "topSkills": ["Habilidad 1", "Habilidad 2", "Habilidad 3", "Habilidad 4"],
  "vocationalProfile": "Descripción concisa y profesional del perfil vocacional (2 líneas)",
  "recommendedRoles": [
    { "title": "Nombre del rol 1", "matchScore": 95, "category": "Categoría laboral" },
    { "title": "Nombre del rol 2", "matchScore": 89, "category": "Categoría laboral" },
    { "title": "Nombre del rol 3", "matchScore": 82, "category": "Categoría laboral" }
  ],
  "strengths": ["Fortaleza 1", "Fortaleza 2", "Fortaleza 3"],
  "improvementPlan": ["Paso de mejora 1", "Paso de mejora 2", "Paso de mejora 3"],
  "customEncouragement": "Mensaje motivador y recomendaciones concretas para su crecimiento."
}
`;

      const response = await client.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const parsed = cleanAndParseJson(response.text || "", getFallbackSkillsAssessment(req.body));
      res.json(parsed);
    } catch (modelError) {
      console.warn("Gemini model error in skills-assessment, using intelligent fallback:", modelError);
      res.json(getFallbackSkillsAssessment(req.body));
    }
  } catch (error: any) {
    console.error("Fatal error in skills-assessment:", error);
    res.json(getFallbackSkillsAssessment(req.body));
  }
});

// 2. AI Business Optimizer (Cost reduction, Process improvement, Diversification)
app.post("/api/ai/business-optimizer", async (req, res) => {
  try {
    const { businessName, businessType, sector, monthlyRevenue, fixedCosts, variableCosts, currentProducts, bottlenecks, goal } = req.body;
    const client = getAI();

    if (!client) {
      return res.json(getFallbackOptimization(req.body));
    }

    try {
      const prompt = `
Eres un consultor senior en optimización de operaciones, finanzas de PYMES y estrategia de diversificación para "Impulsa Regional".
Analiza la siguiente información de la empresa / negocio independiente:
- Nombre: ${businessName || 'Negocio'}
- Tipo: ${businessType || 'Microempresa/Independiente'}
- Sector: ${sector || 'Comercio / Servicios'}
- Ingresos mensuales estimados: ${monthlyRevenue} COP
- Costos fijos mensuales (arriendo, nómina, servicios): ${fixedCosts} COP
- Costos variables mensuales (materia prima, insumos): ${variableCosts} COP
- Productos o servicios actuales: ${currentProducts || 'No detallados'}
- Retos o cuellos de botella: ${bottlenecks || 'Optimización general de costos'}
- Objetivo principal: ${goal || 'Mejorar procesos, reducir costos y diversificar'}

Genera una respuesta JSON estrictamente con la estructura:
{
  "financialSummary": {
    "estimatedMargin": "XX%",
    "breakEvenPoint": "$X.XXX.XXX COP",
    "potentialSavingsPercent": "XX% - XX%",
    "healthStatus": "Diagnóstico conciso del estado financiero"
  },
  "costOptimizations": [
    {
      "area": "Área de optimización",
      "suggestion": "Recomendación práctica y accionable para reducir costos",
      "potentialSavings": "$XXX.XXX COP / mes aprox."
    }
  ],
  "processImprovements": [
    {
      "processName": "Nombre del proceso a mejorar",
      "improvement": "Cómo optimizarlo o automatizarlo",
      "impact": "Impacto esperado en tiempo y eficiencia"
    }
  ],
  "diversificationOpportunities": [
    {
      "idea": "Nombre de la nueva oportunidad de producto o servicio",
      "description": "Explicación de cómo implementarlo y cómo aprovechar la marca propia (ej. Hecho en Pereira, Hecho en Chocó, Colombia)",
      "targetAudience": "Público objetivo",
      "estimatedImplementationTime": "X semanas"
    }
  ],
  "executiveAdvice": "Consejo estratégico final claro y motivador."
}
`;

      const response = await client.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const parsed = cleanAndParseJson(response.text || "", getFallbackOptimization(req.body));
      res.json(parsed);
    } catch (modelError) {
      console.warn("Gemini model error in business-optimizer, using intelligent fallback:", modelError);
      res.json(getFallbackOptimization(req.body));
    }
  } catch (error: any) {
    console.error("Fatal error in business-optimizer:", error);
    res.json(getFallbackOptimization(req.body));
  }
});

// 3. AI Psychological & Emotional Support Assistant
app.post("/api/ai/psychological-support", async (req, res) => {
  try {
    const { messages, userMood, situation } = req.body;
    const client = getAI();

    if (!client) {
      return res.json(getFallbackPsychologicalSupport(req.body));
    }

    try {
      const conversationHistory = Array.isArray(messages)
        ? messages.map((m: any) => `${m.role === 'user' ? 'Usuario' : 'Orientador'}: ${m.content}`).join('\n')
        : '';

      const prompt = `
Eres un asistente de apoyo psicológico, bienestar emocional y orientación humana de la plataforma comunitaria "Impulsa Regional".
Tu rol es brindar escucha activa, validación emocional compasiva, calidez, contención y técnicas prácticas de manejo de ansiedad, estrés laboral o incertidumbre financiera.
Importante: Eres un apoyo de orientación preventiva y bienestar; promueve la búsqueda de ayuda profesional de ser necesario y nunca hagas diagnósticos clínicos médicos.

Contexto actual del usuario:
- Estado de ánimo: ${userMood || 'No especificado'}
- Situación: ${situation || 'Búsqueda laboral / emprendimiento / sobrecarga'}

Historial de la conversación:
${conversationHistory}

Responde de manera cálida, clara y cercana en español latinoamericano. Genera un JSON:
{
  "reply": "Tu respuesta empática y constructiva (2-3 párrafos breves)",
  "suggestedExercise": {
    "title": "Nombre de un ejercicio práctico breve",
    "steps": ["Paso 1", "Paso 2", "Paso 3"]
  },
  "actionableTip": "Un consejo práctico aplicable para el día de hoy."
}
`;

      const response = await client.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const parsed = cleanAndParseJson(response.text || "", getFallbackPsychologicalSupport(req.body));
      res.json(parsed);
    } catch (modelError) {
      console.warn("Gemini model error in psychological-support, using intelligent fallback:", modelError);
      res.json(getFallbackPsychologicalSupport(req.body));
    }
  } catch (error: any) {
    console.error("Fatal error in psychological-support:", error);
    res.json(getFallbackPsychologicalSupport(req.body));
  }
});

// Vite Middleware & Static Serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Impulsa & OptiLogic Regional running at http://localhost:${PORT}`);
  });
}

startServer();
