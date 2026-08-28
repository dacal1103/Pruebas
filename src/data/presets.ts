import { PresetBusinessProblem, LPModel } from '../types';

export const PRESET_PROBLEMS: PresetBusinessProblem[] = [
  {
    id: 'muebleria-premium',
    title: 'Fabricación y Mix Óptimo de Muebles Finos',
    industry: 'Manufactura & Carpintería Industrial',
    difficulty: 'Básico (2 Variables)',
    shortDescription: 'Maximización de utilidades en la producción de Mesas Ejecutivas y Sillas Ergonómicas con restricciones de Madera, Torneado y Acabado.',
    fullNarrative: `Una fábrica de muebles finos produce dos líneas principales: Mesas Ejecutivas y Sillas Ergonómicas. 
Cada Mesa genera una ganancia neta de $180 USD y requiere 4 horas de corte y torneado, 3 horas de ensamblado y 12 pies cúbicos de madera de roble.
Cada Silla genera una ganancia de $90 USD y requiere 2 horas de corte/torneado, 1.5 horas de ensamblado y 4 pies cúbicos de madera de roble.
Para la próxima semana de producción, el taller dispone de:
- 160 horas en el taller de corte y torneado.
- 120 horas en el taller de ensamblado.
- 600 pies cúbicos de madera de roble certificada.
Además, el departamento de ventas tiene contratos previos que exigen entregar al menos 10 Mesas y no más de 50 Sillas.
¿Cuántas Mesas y Sillas se deben fabricar para maximizar las ganancias totales? Queremos ver el análisis de holguras de las horas de taller y madera, y los precios sombra.`,
    tags: ['Manufactura', 'Capacidad', '2D Gráfico', 'Mix de Producto'],
  },
  {
    id: 'mezcla-combustibles',
    title: 'Mezcla y Refinación de Combustibles (Blending)',
    industry: 'Petroquímica & Energía',
    difficulty: 'Básico (2 Variables)',
    shortDescription: 'Minimización de costo de mezcla para cumplir especificaciones de octanaje y densidad requeridas.',
    fullNarrative: `Una refinería debe producir un nuevo combustible ecológico mezclando dos componentes base: Componente A (Alfa) y Componente B (Beta).
El Componente Alfa cuesta $0.80 USD por litro y aporta un índice de octanaje de 90 y un contenido de azufre del 0.05%.
El Componente Beta cuesta $1.20 USD por litro y aporta un índice de octanaje de 105 y un contenido de azufre del 0.01%.
Se requiere preparar al menos un lote de 1,000 litros diarios.
Las regulaciones ambientales y de rendimiento exigen:
1. El octanaje promedio de la mezcla final debe ser de al menos 95 puntos.
2. El contenido promedio de azufre no puede exceder el 0.035%.
3. Por disponibilidad de importación, no se pueden usar más de 700 litros del Componente Alfa.
¿Cuál es la combinación de menor costo que cumple todas las normas ambientales? Queremos analizar las holguras en las restricciones de calidad y azufre.`,
    tags: ['Petróleo', 'Blending', 'Minimización', 'Normas Ambientales'],
  },
  {
    id: 'distribucion-logistica',
    title: 'Planificación de Distribución & Cadena de Suministro',
    industry: 'Logística & Transporte',
    difficulty: 'Intermedio (3-4 Variables)',
    shortDescription: 'Asignación de envíos desde dos centros de distribución a múltiples puntos de venta minimizando costos de flete.',
    fullNarrative: `Una cadena minorista distribuye mercancía desde 2 almacenes centrales (Norte y Sur) hacia 2 zonas comerciales principales (Zona Este y Zona Oeste).
Los costos de transporte por tonelada son:
- Norte a Este: $20 USD/ton
- Norte a Oeste: $35 USD/ton
- Sur a Este: $40 USD/ton
- Sur a Oeste: $25 USD/ton
Capacidad de despacho disponible:
- Almacén Norte: 250 toneladas
- Almacén Sur: 300 toneladas
Demanda comprometida obligatoria:
- Zona Este requiere mínimo 200 toneladas
- Zona Oeste requiere mínimo 280 toneladas
Queremos determinar el plan de despacho de mínimo costo, identificando qué almacén queda con capacidad ociosa (holgura) y cuál es el impacto de aumentar la demanda.`,
    tags: ['Transporte', 'Logística', 'Redes', 'Minimización'],
  },
  {
    id: 'portafolio-inversiones',
    title: 'Optimización de Portafolio Financiero con Control de Riesgo',
    industry: 'Banca & Finanzas',
    difficulty: 'Intermedio (3-4 Variables)',
    shortDescription: 'Maximización de rendimiento anual de inversión sujeto a límites de riesgo crediticio y liquidez.',
    fullNarrative: `Un fondo de inversión dispone de $500,000 USD para colocar en 4 instrumentos: Bonos del Tesoro (Rendimiento 4.5%, Riesgo 1), Bonos Corporativos AAA (Rendimiento 7.2%, Riesgo 3), Acciones Tecnológicas (Rendimiento 14.0%, Riesgo 8), y Bienes Raíces Comerciales (Rendimiento 9.5%, Riesgo 4).
Políticas de inversión:
1. La inversión total no puede superar los $500,000 USD disponibles.
2. El índice de riesgo ponderado promedio no puede exceder 4.0.
3. Para asegurar liquidez, al menos el 25% ($125,000) debe estar en Bonos del Tesoro.
4. Por diversificación, no más del 30% ($150,000) puede invertirse en Acciones Tecnológicas.
5. La inversión en Bienes Raíces debe ser al menos el doble que la de Bonos Corporativos.
¿Cómo distribuir el capital para maximizar el retorno esperado total anual?`,
    tags: ['Finanzas', 'Riesgo', 'Portafolio', 'Presupuesto'],
  },
  {
    id: 'produccion-heladeria-3maquinas',
    title: 'Optimización de Producción de Helados en 3 Máquinas',
    industry: 'Alimentos & Bebidas (Heladería)',
    difficulty: 'Intermedio (3-4 Variables)',
    shortDescription: 'Minimización de costos de producción en 3 máquinas con capacidades distintas para satisfacer una demanda de 70 unidades.',
    fullNarrative: `Una empresa productora de helados cuenta con 3 máquinas de producción con distintas capacidades y costos unitarios de operación:
- Máquina 1 (Máquina A): Costo de $2 USD por unidad producida, con capacidad máxima de 20 unidades.
- Máquina 2: Costo de $5 USD por unidad producida, con capacidad máxima de 50 unidades.
- Máquina 3: Costo de $3 USD por unidad producida, con capacidad máxima de 30 unidades.
La empresa debe satisfacer una demanda total de 70 unidades de helado al menor costo posible.
¿Cuántas unidades debe producir cada máquina para minimizar el costo total de operación satisfaciendo toda la demanda?`,
    tags: ['Alimentos', '3 Máquinas', 'Minimización de Costos', 'Capacidades', 'Demanda'],
  },
];

export const INITIAL_DEFAULT_MODEL: LPModel = {
  id: 'model-muebles-01',
  problemTitle: 'Fabricación y Mix Óptimo de Muebles Finos',
  problemSummary: 'Maximizar el beneficio semanal de producción de mesas y sillas respetando capacidades de corte, ensamble, madera y contratos mínimos.',
  businessContext: 'Taller de manufactura de muebles de alta gama que busca balancear la carga de trabajo entre departamentos y optimizar el uso de madera de roble.',
  sets: [
    {
      id: 'set_products',
      name: 'Productos',
      symbol: 'P',
      description: 'Línea de artículos de mobiliario que se fabrican en la planta',
      elements: ['Mesas Ejecutivas (x1)', 'Sillas Ergonómicas (x2)'],
    },
    {
      id: 'set_departments',
      name: 'Recursos / Talleres',
      symbol: 'R',
      description: 'Estaciones de trabajo y materiales limitados en la fábrica',
      elements: ['Corte y Torneado', 'Ensamblado', 'Madera de Roble'],
    },
  ],
  parameters: [
    {
      id: 'p_profit_table',
      name: 'Margen de Ganancia por Mesa',
      symbol: 'c_1',
      value: 180,
      unit: 'USD/unidad',
      description: 'Beneficio neto aportado por cada Mesa Ejecutiva vendida',
      category: 'revenue',
      min: 50,
      max: 400,
      step: 10,
    },
    {
      id: 'p_profit_chair',
      name: 'Margen de Ganancia por Silla',
      symbol: 'c_2',
      value: 90,
      unit: 'USD/unidad',
      description: 'Beneficio neto aportado por cada Silla Ergonómica vendida',
      category: 'revenue',
      min: 20,
      max: 250,
      step: 5,
    },
    {
      id: 'p_cap_cutting',
      name: 'Capacidad Horas Corte/Torneado',
      symbol: 'b_1',
      value: 160,
      unit: 'horas/semana',
      description: 'Disponibilidad de tiempo en el centro de maquinado y corte',
      category: 'capacity',
      min: 80,
      max: 300,
      step: 5,
    },
    {
      id: 'p_cap_assembly',
      name: 'Capacidad Horas Ensamblado',
      symbol: 'b_2',
      value: 120,
      unit: 'horas/semana',
      description: 'Disponibilidad de operarios en el área de ensamblaje manual',
      category: 'capacity',
      min: 60,
      max: 250,
      step: 5,
    },
    {
      id: 'p_cap_wood',
      name: 'Disponibilidad Madera de Roble',
      symbol: 'b_3',
      value: 600,
      unit: 'pies cúbicos',
      description: 'Inventario disponible de madera certificada de roble',
      category: 'capacity',
      min: 200,
      max: 1200,
      step: 25,
    },
    {
      id: 'p_min_tables',
      name: 'Contrato Mínimo Mesas',
      symbol: 'd_1',
      value: 10,
      unit: 'mesas',
      description: 'Demanda mínima comprometida por contrato previo',
      category: 'demand',
      min: 0,
      max: 35,
      step: 1,
    },
  ],
  variables: [
    {
      id: 'var_x1',
      name: 'Mesas Ejecutivas a Fabricar',
      symbol: 'x_1',
      unit: 'mesas/semana',
      description: 'Cantidad de mesas ejecutivas a producir semanalmente',
      type: 'continuous',
      lowerBound: 10,
      upperBound: 50,
    },
    {
      id: 'var_x2',
      name: 'Sillas Ergonómicas a Fabricar',
      symbol: 'x_2',
      unit: 'sillas/semana',
      description: 'Cantidad de sillas ergonómicas a producir semanalmente',
      type: 'continuous',
      lowerBound: 0,
      upperBound: 70,
    },
  ],
  objective: {
    type: 'maximize',
    name: 'Beneficio Total Semanal (Z)',
    description: 'Maximizar el margen de contribución bruto de la planta de producción',
    expressionLatex: '\\max Z = 180 x_1 + 90 x_2',
    coefficients: {
      var_x1: 180,
      var_x2: 90,
    },
  },
  constraints: [
    {
      id: 'cons_corte',
      name: 'Capacidad de Corte y Torneado',
      description: 'Tiempo total de corte de mesas (4h) y sillas (2h) no debe exceder 160h',
      category: 'capacity',
      expressionLatex: '4 x_1 + 2 x_2 \\le 160',
      coefficients: {
        var_x1: 4,
        var_x2: 2,
      },
      operator: '<=',
      rhs: 160,
      unit: 'horas',
    },
    {
      id: 'cons_ensamble',
      name: 'Capacidad de Ensamblado',
      description: 'Tiempo de ensamblado de mesas (3h) y sillas (1.5h) no debe exceder 120h',
      category: 'capacity',
      expressionLatex: '3 x_1 + 1.5 x_2 \\le 120',
      coefficients: {
        var_x1: 3,
        var_x2: 1.5,
      },
      operator: '<=',
      rhs: 120,
      unit: 'horas',
    },
    {
      id: 'cons_madera',
      name: 'Inventario de Madera de Roble',
      description: 'Uso de roble por mesas (12 ft³) y sillas (4 ft³) limitado a 600 ft³',
      category: 'capacity',
      expressionLatex: '12 x_1 + 4 x_2 \\le 600',
      coefficients: {
        var_x1: 12,
        var_x2: 4,
      },
      operator: '<=',
      rhs: 600,
      unit: 'pies cúbicos',
    },
    {
      id: 'cons_min_mesas',
      name: 'Demanda Mínima de Mesas (Contrato)',
      description: 'Compromiso comercial de entregar al menos 10 mesas ejecutivas',
      category: 'demand',
      expressionLatex: 'x_1 \\ge 10',
      coefficients: {
        var_x1: 1,
        var_x2: 0,
      },
      operator: '>=',
      rhs: 10,
      unit: 'mesas',
    },
  ],
  orToolsPythonCode: `from ortools.linear_solver import pywraplp

def solve_muebles_problem():
    # 1. Crear el solver con el backend GLOP de Google OR-Tools (Google Linear Optimization Package)
    solver = pywraplp.Solver.CreateSolver('GLOP')
    if not solver:
        print("Error: No se pudo crear el solver GLOP.")
        return

    # 2. Definir Variables de Decisión
    # x1: Mesas Ejecutivas (min 10, max 50)
    # x2: Sillas Ergonómicas (min 0, max 70)
    x1 = solver.NumVar(10.0, 50.0, 'x1_Mesas')
    x2 = solver.NumVar(0.0, 70.0, 'x2_Sillas')

    print(f"Número de variables = {solver.NumVariables()}")

    # 3. Restricciones de Negocio
    # Restricción 1: Horas de Corte y Torneado (4 x1 + 2 x2 <= 160)
    c1 = solver.Add(4 * x1 + 2 * x2 <= 160.0, 'Capacidad_Corte')

    # Restricción 2: Horas de Ensamblado (3 x1 + 1.5 x2 <= 120)
    c2 = solver.Add(3 * x1 + 1.5 * x2 <= 120.0, 'Capacidad_Ensamble')

    # Restricción 3: Madera de Roble (12 x1 + 4 x2 <= 600)
    c3 = solver.Add(12 * x1 + 4 * x2 <= 600.0, 'Disponibilidad_Madera')

    # Restricción 4: Demanda mínima de Mesas (x1 >= 10)
    c4 = solver.Add(x1 >= 10.0, 'Demanda_Min_Mesas')

    print(f"Número de restricciones = {solver.NumConstraints()}")

    # 4. Función Objetivo: Maximizar Beneficio Total
    # Maximize Z = 180 * x1 + 90 * x2
    solver.Maximize(180 * x1 + 90 * x2)

    # 5. Invocar el Solver de Google OR-Tools
    status = solver.Solve()

    # 6. Analizar Resultados, Holguras y Precios Sombra
    if status == pywraplp.Solver.OPTIMAL:
        print("\\n=== SOLUCIÓN ÓPTIMA ENCONTRADA (Google OR-Tools) ===")
        print(f"Valor Óptimo Z (Beneficio) = $\${solver.Objective().Value():,.2f} USD")
        print(f"Mesas Ejecutivas (x1)      = {x1.solution_value():.2f} unidades")
        print(f"Sillas Ergonómicas (x2)    = {x2.solution_value():.2f} unidades")
        
        print("\\n--- ANÁLISIS DE HOLGURAS & PRECIOS SOMBRA (DUAL) ---")
        constraints = [
            ('Corte y Torneado', c1, 160.0),
            ('Ensamblado', c2, 120.0),
            ('Madera de Roble', c3, 600.0),
            ('Demanda Mín Mesas', c4, 10.0),
        ]
        for name, c_obj, rhs in constraints:
            slack = c_obj.ub() - (c_obj.GetRow().Evaluate(solver) if hasattr(c_obj, 'GetRow') else 0)
            dual_price = c_obj.dual_value()
            status_str = "ACTIVA (Cuello de Botella)" if abs(slack) < 1e-4 else f"HOLGURA = {slack:.2f}"
            print(f"- {name:<20}: Dual (Precio Sombra) = $\${dual_price:.2f} | Estado: {status_str}")
    else:
        print("El problema no tiene solución óptima finita.")

if __name__ == '__main__':
    solve_muebles_problem()
`,
  orToolsSolverName: 'GLOP',
};
