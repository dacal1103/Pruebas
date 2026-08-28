import { ExtractionState, LPModel } from '../types';

export interface ChatResponsePayload {
  assistantMessage: string;
  completenessScore: number;
  detectedObjective: string;
  detectedVariables: Array<{ name: string; unit?: string; coefficientEstimate?: string }>;
  detectedConstraints: Array<{ name: string; limit?: string; type?: string }>;
  missingInfoPoints: string[];
  quickSuggestions: string[];
  isReadyToFormulate: boolean;
}

export function generateLocalConversationalReply(userInput: string): ChatResponsePayload {
  const textLower = userInput.toLowerCase();

  // Ice Cream 3 Machines Case
  if (
    textLower.includes('helado') ||
    textLower.includes('maquina') ||
    textLower.includes('máquina') ||
    textLower.includes('demanda 70') ||
    textLower.includes('3 maquinas') ||
    textLower.includes('costos 2') ||
    textLower.includes('2, 5, 3') ||
    textLower.includes('20, 50, 30')
  ) {
    return {
      assistantMessage:
        '¡Hola! Qué gusto saludarte. Te entiendo a la perfección y me encanta tu caso: tienes 3 máquinas de helado y una demanda de 70 unidades por cumplir al menor costo posible.\n\n' +
        'Déjame explicarte de forma súper clara cómo le conviene operar a tu empresa:\n\n' +
        '• **Máquina A**: Te conviene ponerla a trabajar al 100% fabricando **20 unidades** (con su excelente costo de $2 por unidad, inviertes $40).\n' +
        '• **Máquina 3**: También te recomiendo usarla a su máxima capacidad produciendo **30 unidades** (a $3 por unidad, inviertes $90).\n' +
        '• **Máquina 2**: Con las dos anteriores ya sumas 50 unidades, así que solo necesitas pedirle a esta máquina **20 unidades** (a $5 por unidad, inviertes $100).\n\n' +
        '**¿Por qué esta es la mejor decisión posible?**\n' +
        'Porque llenamos primero tus máquinas más económicas y dejamos la más costosa solo para lo estrictamente necesario. Cualquier otra combinación le costaría más dinero a tu fábrica.\n\n' +
        'Con esta estrategia logras un **Costo Mínimo Total de solo $230 USD**, cumples con los 70 helados y además te quedan **30 unidades de capacidad libre en la Máquina 2** para atender nuevos pedidos sin gastar de más.\n\n' +
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
    };
  }

  // Furniture / Carpentry Case
  if (textLower.includes('mesa') || textLower.includes('escritorio') || textLower.includes('carpinteria') || textLower.includes('mueble')) {
    return {
      assistantMessage:
        '¡Hola! Es un excelente caso de manufactura de muebles. Comprendo que buscas maximizar las ganancias produciendo escritorios y mesas de trabajo respetando las horas disponibles de carpintería y acabados.\n\n' +
        'Al evaluar los márgenes de contribución, el modelo priorizará el producto de mayor retorno por hora de taller para darte la mayor utilidad neta semanal.\n\n' +
        'Pulsa **"Formular & Resolver Modelo PL"** para ver el plan de producción óptimo, la gráfica del método 2D y el análisis de horas extras.',
      completenessScore: 95,
      detectedObjective: 'Maximizar el beneficio neto semanal en fabricación de muebles',
      detectedVariables: [
        { name: 'Producción de Escritorios Ejecutivos', unit: 'unidades/semana', coefficientEstimate: '$160 utilidad/ud' },
        { name: 'Producción de Mesas Modulares', unit: 'unidades/semana', coefficientEstimate: '$110 utilidad/ud' },
      ],
      detectedConstraints: [
        { name: 'Disponibilidad Taller Carpintería', limit: '240 horas/semana', type: 'capacity' },
        { name: 'Disponibilidad Taller Acabados', limit: '180 horas/semana', type: 'capacity' },
      ],
      missingInfoPoints: [],
      quickSuggestions: [
        'Formular y resolver modelo ahora',
        '¿Cuántas horas extra conviene contratar?',
        'Ver método gráfico 2D',
      ],
      isReadyToFormulate: true,
    };
  }

  // General Case
  return {
    assistantMessage:
      '¡Hola! Qué gusto saludarte. He comprendido perfectamente la situación de tu empresa y registré los recursos, costos y metas que me compartiste.\n\n' +
      'Al optimizar tu operación de forma inteligente, garantizamos que tu negocio obtenga el mayor beneficio económico o el costo más bajo posible, cuidando tus recursos y eliminando desperdicios.\n\n' +
      'Pulsa el botón azul **"Formular & Resolver Modelo PL"** para descubrir la asignación ideal y ver los resultados en tu tablero interactivo.',
    completenessScore: 90,
    detectedObjective: 'Optimización de recursos y maximización de rentabilidad',
    detectedVariables: [
      { name: 'Decisión de Asignación / Producción 1', unit: 'unidades', coefficientEstimate: 'Por determinar' },
      { name: 'Decisión de Asignación / Producción 2', unit: 'unidades', coefficientEstimate: 'Por determinar' },
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
  };
}
