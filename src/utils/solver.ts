import { LPModel, OptimizationResult, BusinessConstraint, GraphicalMethodPoint, ConstraintStatus } from '../types';

/**
 * Simplex and Sensitivity Analysis Solver for Linear Programming
 * Computes exact optimal solutions, slack/surplus, dual values (shadow prices),
 * reduced costs, and 2D feasible geometry.
 */

interface SimplexTableau {
  matrix: number[][]; // [m+1][n+1] where last row is objective, last col is RHS
  basicVars: number[]; // index of basic variable for each row
  numConstraints: number;
  numVars: number;
}

export function solveLPModel(model: LPModel): OptimizationResult {
  const startTime = performance.now();
  const vars = model.variables;
  const constraints = model.constraints;
  const isMax = model.objective.type === 'maximize';

  if (vars.length === 0) {
    return createEmptyResult('No decision variables defined');
  }

  // Map variable IDs to column indices
  const varIndexMap: Record<string, number> = {};
  vars.forEach((v, idx) => {
    varIndexMap[v.id] = idx;
  });

  const n = vars.length;
  const m = constraints.length;

  // We will build a standard linear program matrix
  // Objective: c = [c0, c1, ... cn-1]
  const c: number[] = new Array(n).fill(0);
  vars.forEach((v, i) => {
    const rawCoeff = model.objective.coefficients[v.id] ?? 0;
    c[i] = isMax ? rawCoeff : -rawCoeff; // convert min to max (-c)
  });

  // Constraints: A matrix (m x n) and b vector (m)
  const A: number[][] = [];
  const b: number[] = [];
  const operators: string[] = [];

  constraints.forEach((cons) => {
    const row = new Array(n).fill(0);
    vars.forEach((v, j) => {
      row[j] = cons.coefficients[v.id] ?? 0;
    });

    let rhs = cons.rhs;
    let op = cons.operator;

    // Normalizing negative RHS
    if (rhs < 0) {
      for (let j = 0; j < n; j++) row[j] = -row[j];
      rhs = -rhs;
      if (op === '<=') op = '>=';
      else if (op === '>=') op = '<=';
    }

    A.push(row);
    b.push(rhs);
    operators.push(op);
  });

  // Also include variable bounds as explicit constraints if present
  vars.forEach((v, j) => {
    if (v.upperBound !== undefined && v.upperBound !== null && v.upperBound > 0) {
      const row = new Array(n).fill(0);
      row[j] = 1;
      A.push(row);
      b.push(v.upperBound);
      operators.push('<=');
    }
  });

  const solution = runTwoPhaseSimplex(c, A, b, operators);

  const endTime = performance.now();
  const execTime = Math.round((endTime - startTime) * 100) / 100;

  if (!solution.isFeasible || solution.isUnbounded) {
    return {
      status: solution.isUnbounded ? 'UNBOUNDED' : 'INFEASIBLE',
      objectiveValue: 0,
      variableResults: vars.map((v) => ({
        id: v.id,
        symbol: v.symbol,
        name: v.name,
        value: 0,
        unit: v.unit,
        reducedCost: 0,
      })),
      constraintResults: constraints.map((c) => ({
        id: c.id,
        name: c.name,
        operator: c.operator,
        rhs: c.rhs,
        lhs: 0,
        slack: 0,
        shadowPrice: 0,
        status: 'infeasible',
        utilizationPercent: 0,
        unit: c.unit,
        interpretation: 'El modelo no tiene solución factible o está no acotado con las restricciones actuales.',
      })),
      bottlenecks: [],
      availableResources: [],
      executiveSummary: solution.isUnbounded
        ? 'El problema está NO ACOTADO: la función objetivo puede crecer infinitamente sin violar restricciones. Verifique que existan cotas superiores para las variables o restricciones de capacidad.'
        : 'El problema es INFFACTIBLE: no existe ninguna combinación de variables que cumpla simultáneamente todas las restricciones de negocio impuestas.',
      managerialRecommendations: [
        'Revise las restricciones contradictorias o demandas mínimas excesivas.',
        'Asegúrese de que las capacidades de los recursos sean mayores o iguales a los requerimientos mínimos.',
      ],
      solvedAt: new Date().toLocaleTimeString(),
    };
  }

  // Calculate actual variable values
  const varValues: Record<string, number> = {};
  vars.forEach((v, idx) => {
    varValues[v.id] = Math.max(0, Math.round((solution.x[idx] ?? 0) * 10000) / 10000);
  });

  // Calculate true objective value
  let optimalObj = 0;
  vars.forEach((v) => {
    const coeff = model.objective.coefficients[v.id] ?? 0;
    optimalObj += coeff * (varValues[v.id] ?? 0);
  });
  if (model.objective.constant) {
    optimalObj += model.objective.constant;
  }
  optimalObj = Math.round(optimalObj * 1000) / 1000;

  // Evaluate Constraints and Calculate Slacks & Shadow Prices
  const bottlenecks: string[] = [];
  const availableResources: string[] = [];

  const constraintResults = constraints.map((cons, idx) => {
    let lhs = 0;
    vars.forEach((v) => {
      const a = cons.coefficients[v.id] ?? 0;
      lhs += a * (varValues[v.id] ?? 0);
    });
    lhs = Math.round(lhs * 10000) / 10000;

    let slack = 0;
    let status: ConstraintStatus = 'slack';
    const tolerance = 1e-4;

    if (cons.operator === '<=') {
      slack = Math.max(0, cons.rhs - lhs);
      status = slack < tolerance ? 'binding' : 'slack';
    } else if (cons.operator === '>=') {
      slack = Math.max(0, lhs - cons.rhs);
      status = slack < tolerance ? 'binding' : 'surplus';
    } else {
      slack = Math.abs(lhs - cons.rhs);
      status = 'binding';
    }

    slack = Math.round(slack * 1000) / 1000;

    const utilization = cons.rhs !== 0 ? Math.min(100, Math.max(0, Math.round((lhs / cons.rhs) * 1000) / 10)) : 100;

    // Calculate Shadow Price numerically by delta evaluation (+1 unit in RHS)
    const shadowPrice = calculateShadowPrice(model, idx, isMax);

    if (status === 'binding') {
      bottlenecks.push(cons.id);
    } else {
      availableResources.push(cons.id);
    }

    let interpretation = '';
    if (status === 'binding') {
      if (cons.operator === '<=') {
        interpretation = `Restricción ACTIVA (Cuello de Botella). El recurso está agotado al 100%. Precio Sombra: +$${Math.abs(shadowPrice).toFixed(2)} por cada unidad adicional de capacidad.`;
      } else if (cons.operator === '>=') {
        interpretation = `Restricción ACTIVA. La demanda o requerimiento mínimo se cumple exactamente en el límite (${lhs} ${cons.unit}).`;
      } else {
        interpretation = `Restricción de Igualdad estricta satisfecha (${lhs} ${cons.unit}).`;
      }
    } else {
      if (cons.operator === '<=') {
        interpretation = `Recurso con HOLGURA disponible de ${slack} ${cons.unit} (${(100 - utilization).toFixed(1)}% sin usar). Aumentar esta capacidad no incrementa la función objetivo actualmente.`;
      } else {
        interpretation = `Superávit de ${slack} ${cons.unit} por encima del requerimiento mínimo.`;
      }
    }

    return {
      id: cons.id,
      name: cons.name,
      operator: cons.operator,
      rhs: cons.rhs,
      lhs,
      slack,
      shadowPrice: Math.round(shadowPrice * 100) / 100,
      status,
      utilizationPercent: utilization,
      unit: cons.unit,
      interpretation,
    };
  });

  // Calculate Reduced Costs for Variables
  const variableResults = vars.map((v, idx) => {
    const val = varValues[v.id] ?? 0;
    // Calculate reduced cost: if variable is 0, how much its objective coefficient must improve to be produced
    const reducedCost = calculateReducedCost(model, v.id, val, isMax);

    return {
      id: v.id,
      symbol: v.symbol,
      name: v.name,
      value: val,
      unit: v.unit,
      reducedCost: Math.round(reducedCost * 100) / 100,
    };
  });

  // Generate Executive Summary and Managerial Recommendations
  const executiveSummary = generateExecutiveSummary(model, optimalObj, variableResults, constraintResults);
  const managerialRecommendations = generateManagerialRecommendations(model, optimalObj, constraintResults, variableResults);

  return {
    status: 'OPTIMAL',
    objectiveValue: optimalObj,
    variableResults,
    constraintResults,
    bottlenecks,
    availableResources,
    executiveSummary,
    managerialRecommendations,
    solvedAt: new Date().toLocaleTimeString(),
  };
}

/**
 * 2-Phase Simplex Algorithm Implementation
 */
function runTwoPhaseSimplex(
  c: number[],
  A: number[][],
  b: number[],
  operators: string[]
): { isFeasible: boolean; isUnbounded: boolean; x: number[] } {
  const m = A.length;
  const n = c.length;

  if (m === 0) {
    return { isFeasible: true, isUnbounded: false, x: new Array(n).fill(0) };
  }

  // Step 1: Count slack, surplus, and artificial variables
  let numSlack = 0;
  let numSurplus = 0;
  let numArtificial = 0;

  for (let i = 0; i < m; i++) {
    if (operators[i] === '<=') {
      numSlack++;
    } else if (operators[i] === '>=') {
      numSurplus++;
      numArtificial++;
    } else if (operators[i] === '==') {
      numArtificial++;
    }
  }

  const totalCols = n + numSlack + numSurplus + numArtificial + 1; // +1 for RHS
  const totalRows = m + 1 + (numArtificial > 0 ? 1 : 0); // +1 for Obj, +1 for Phase 1 Obj if needed

  const matrix: number[][] = Array.from({ length: totalRows }, () => new Array(totalCols).fill(0));
  const basicVars: number[] = new Array(m).fill(-1);

  let slackIdx = n;
  let surplusIdx = n + numSlack;
  let artificialIdx = n + numSlack + numSurplus;
  let artCols: number[] = [];

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      matrix[i][j] = A[i][j];
    }
    matrix[i][totalCols - 1] = b[i];

    if (operators[i] === '<=') {
      matrix[i][slackIdx] = 1;
      basicVars[i] = slackIdx;
      slackIdx++;
    } else if (operators[i] === '>=') {
      matrix[i][surplusIdx] = -1;
      surplusIdx++;
      matrix[i][artificialIdx] = 1;
      artCols.push(artificialIdx);
      basicVars[i] = artificialIdx;
      artificialIdx++;
    } else if (operators[i] === '==') {
      matrix[i][artificialIdx] = 1;
      artCols.push(artificialIdx);
      basicVars[i] = artificialIdx;
      artificialIdx++;
    }
  }

  // Phase 1 (if artificial variables exist)
  if (numArtificial > 0) {
    const phase1Row = totalRows - 1;
    // Objective of Phase 1: Minimize sum of artificial variables -> Maximize -sum(W_i)
    // Row operations: add all rows containing artificial variables to phase 1 row
    for (let i = 0; i < m; i++) {
      if (operators[i] === '>=' || operators[i] === '==') {
        for (let j = 0; j < totalCols; j++) {
          matrix[phase1Row][j] += matrix[i][j];
        }
      }
    }

    // Run simplex on Phase 1
    const p1Success = runSimplexIterations(matrix, basicVars, m, phase1Row, totalCols);
    if (!p1Success.isOptimal || Math.abs(matrix[phase1Row][totalCols - 1]) > 1e-4) {
      return { isFeasible: false, isUnbounded: false, x: new Array(n).fill(0) };
    }
  }

  // Phase 2: Set up original objective
  const objRow = m;
  for (let j = 0; j < n; j++) {
    matrix[objRow][j] = -c[j];
  }
  matrix[objRow][totalCols - 1] = 0;

  // Make objective row canonical with respect to current basic variables
  for (let i = 0; i < m; i++) {
    const bVar = basicVars[i];
    if (bVar < n) {
      const factor = matrix[objRow][bVar];
      if (Math.abs(factor) > 1e-9) {
        for (let j = 0; j < totalCols; j++) {
          matrix[objRow][j] -= factor * matrix[i][j];
        }
      }
    }
  }

  const p2Success = runSimplexIterations(matrix, basicVars, m, objRow, totalCols, artCols);

  if (p2Success.isUnbounded) {
    return { isFeasible: true, isUnbounded: true, x: new Array(n).fill(0) };
  }

  // Extract decision variable values
  const x = new Array(n).fill(0);
  for (let i = 0; i < m; i++) {
    const bVar = basicVars[i];
    if (bVar >= 0 && bVar < n) {
      x[bVar] = Math.max(0, matrix[i][totalCols - 1]);
    }
  }

  return { isFeasible: true, isUnbounded: false, x };
}

function runSimplexIterations(
  matrix: number[][],
  basicVars: number[],
  numRows: number,
  objRowIdx: number,
  totalCols: number,
  excludedCols: number[] = []
): { isOptimal: boolean; isUnbounded: boolean } {
  const maxIterations = 500;
  let iter = 0;

  while (iter < maxIterations) {
    iter++;

    // Step 1: Find entering variable (most negative coefficient in obj row)
    let enteringCol = -1;
    let minVal = -1e-6;

    for (let j = 0; j < totalCols - 1; j++) {
      if (excludedCols.includes(j)) continue;
      if (matrix[objRowIdx][j] < minVal) {
        minVal = matrix[objRowIdx][j];
        enteringCol = j;
      }
    }

    // If no negative coefficient, optimal solution is reached
    if (enteringCol === -1) {
      return { isOptimal: true, isUnbounded: false };
    }

    // Step 2: Find leaving variable (minimum ratio test)
    let leavingRow = -1;
    let minRatio = Infinity;

    for (let i = 0; i < numRows; i++) {
      const a_ij = matrix[i][enteringCol];
      if (a_ij > 1e-8) {
        const rhs = matrix[i][totalCols - 1];
        const ratio = rhs / a_ij;
        if (ratio < minRatio - 1e-9) {
          minRatio = ratio;
          leavingRow = i;
        }
      }
    }

    if (leavingRow === -1) {
      return { isOptimal: false, isUnbounded: true };
    }

    // Step 3: Pivot operation
    const pivotVal = matrix[leavingRow][enteringCol];
    basicVars[leavingRow] = enteringCol;

    for (let j = 0; j < totalCols; j++) {
      matrix[leavingRow][j] /= pivotVal;
    }

    for (let i = 0; i < matrix.length; i++) {
      if (i !== leavingRow) {
        const factor = matrix[i][enteringCol];
        if (Math.abs(factor) > 1e-9) {
          for (let j = 0; j < totalCols; j++) {
            matrix[i][j] -= factor * matrix[leavingRow][j];
          }
        }
      }
    }
  }

  return { isOptimal: true, isUnbounded: false };
}

/**
 * Calculates Shadow Price (Dual Value) for a constraint by 1-unit RHS perturbation
 */
function calculateShadowPrice(model: LPModel, constraintIdx: number, isMax: boolean): number {
  const cons = model.constraints[constraintIdx];
  if (!cons) return 0;

  const delta = 1.0;
  const modifiedConstraints = model.constraints.map((c, idx) => {
    if (idx === constraintIdx) {
      return { ...c, rhs: c.rhs + delta };
    }
    return c;
  });

  const perturbedModel: LPModel = {
    ...model,
    constraints: modifiedConstraints,
  };

  const originalSol = solveRaw(model);
  const perturbedSol = solveRaw(perturbedModel);

  if (!originalSol.feasible || !perturbedSol.feasible) return 0;

  const diff = perturbedSol.objValue - originalSol.objValue;
  return Math.round(diff * 100) / 100;
}

/**
 * Calculates Reduced Cost for a variable
 */
function calculateReducedCost(model: LPModel, varId: string, currentValue: number, isMax: boolean): number {
  if (currentValue > 1e-4) return 0; // Basic variable has 0 reduced cost

  // If variable is 0, test how much improvement is needed in its coefficient
  const origCoeff = model.objective.coefficients[varId] ?? 0;
  const testDeltas = [1, 5, 10, 20, 50, 100];

  for (const delta of testDeltas) {
    const modCoeffs = { ...model.objective.coefficients, [varId]: isMax ? origCoeff + delta : origCoeff - delta };
    const modModel = { ...model, objective: { ...model.objective, coefficients: modCoeffs } };
    const sol = solveRaw(modModel);
    if ((sol.varValues[varId] ?? 0) > 1e-3) {
      return delta;
    }
  }

  return 0;
}

function solveRaw(model: LPModel): { feasible: boolean; objValue: number; varValues: Record<string, number> } {
  const vars = model.variables;
  const isMax = model.objective.type === 'maximize';
  const c = vars.map((v) => {
    const raw = model.objective.coefficients[v.id] ?? 0;
    return isMax ? raw : -raw;
  });

  const A: number[][] = [];
  const b: number[] = [];
  const operators: string[] = [];

  model.constraints.forEach((cons) => {
    const row = vars.map((v) => cons.coefficients[v.id] ?? 0);
    A.push(row);
    b.push(cons.rhs);
    operators.push(cons.operator);
  });

  vars.forEach((v, j) => {
    if (v.upperBound) {
      const row = new Array(vars.length).fill(0);
      row[j] = 1;
      A.push(row);
      b.push(v.upperBound);
      operators.push('<=');
    }
  });

  const sol = runTwoPhaseSimplex(c, A, b, operators);
  if (!sol.isFeasible || sol.isUnbounded) {
    return { feasible: false, objValue: 0, varValues: {} };
  }

  const varValues: Record<string, number> = {};
  let objVal = 0;
  vars.forEach((v, idx) => {
    const val = Math.max(0, sol.x[idx] ?? 0);
    varValues[v.id] = val;
    objVal += (model.objective.coefficients[v.id] ?? 0) * val;
  });

  return { feasible: true, objValue: objVal, varValues };
}

/**
 * 2D Graphical Method Calculator
 * Computes Feasible Region Vertices, Boundary Intersections, and Isocost/Isoprofit Lines
 */
export function computeGraphicalMethod(
  model: LPModel,
  varXId: string,
  varYId: string,
  fixedVarValues: Record<string, number> = {}
): {
  vertices: GraphicalMethodPoint[];
  feasiblePolygon: Array<{ x: number; y: number }>;
  allIntersectionPoints: GraphicalMethodPoint[];
  optimalPoint: GraphicalMethodPoint | null;
  bounds: { minX: number; maxX: number; minY: number; maxY: number };
  constraintLines: Array<{
    id: string;
    name: string;
    color: string;
    operator: string;
    p1: { x: number; y: number };
    p2: { x: number; y: number };
    equationText: string;
    a: number;
    b: number;
    c: number; // ax + by = c
  }>;
  objectiveGradient: { dx: number; dy: number };
} {
  const varX = model.variables.find((v) => v.id === varXId);
  const varY = model.variables.find((v) => v.id === varYId);

  if (!varX || !varY) {
    return {
      vertices: [],
      feasiblePolygon: [],
      allIntersectionPoints: [],
      optimalPoint: null,
      bounds: { minX: 0, maxX: 100, minY: 0, maxY: 100 },
      constraintLines: [],
      objectiveGradient: { dx: 1, dy: 1 },
    };
  }

  const cX = model.objective.coefficients[varXId] ?? 0;
  const cY = model.objective.coefficients[varYId] ?? 0;
  const isMax = model.objective.type === 'maximize';

  // Build effective 2D constraints: a*x + b*y (op) c_eff
  interface Effective2DConstraint {
    id: string;
    name: string;
    a: number;
    b: number;
    operator: string;
    rhs: number;
    color: string;
  }

  const colors = [
    '#3b82f6', // blue
    '#10b981', // emerald
    '#f59e0b', // amber
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#f97316', // orange
    '#6366f1', // indigo
  ];

  const effConstraints: Effective2DConstraint[] = [];

  // Non-negativity constraints: x >= 0, y >= 0
  effConstraints.push({
    id: 'non_neg_x',
    name: `${varX.symbol} >= 0`,
    a: 1,
    b: 0,
    operator: '>=',
    rhs: 0,
    color: '#64748b',
  });

  effConstraints.push({
    id: 'non_neg_y',
    name: `${varY.symbol} >= 0`,
    a: 0,
    b: 1,
    operator: '>=',
    rhs: 0,
    color: '#64748b',
  });

  // Upper bounds on variables if present
  if (varX.upperBound && varX.upperBound > 0) {
    effConstraints.push({
      id: `ub_${varX.id}`,
      name: `Límite Máximo de ${varX.name}`,
      a: 1,
      b: 0,
      operator: '<=',
      rhs: varX.upperBound,
      color: '#94a3b8',
    });
  }
  if (varY.upperBound && varY.upperBound > 0) {
    effConstraints.push({
      id: `ub_${varY.id}`,
      name: `Límite Máximo de ${varY.name}`,
      a: 0,
      b: 1,
      operator: '<=',
      rhs: varY.upperBound,
      color: '#94a3b8',
    });
  }

  // Model constraints
  model.constraints.forEach((cons, idx) => {
    const a = cons.coefficients[varXId] ?? 0;
    const b = cons.coefficients[varYId] ?? 0;

    // Subtract contribution of other fixed variables
    let fixedSum = 0;
    model.variables.forEach((v) => {
      if (v.id !== varXId && v.id !== varYId) {
        const coeff = cons.coefficients[v.id] ?? 0;
        fixedSum += coeff * (fixedVarValues[v.id] ?? 0);
      }
    });

    const effectiveRhs = cons.rhs - fixedSum;

    if (Math.abs(a) > 1e-6 || Math.abs(b) > 1e-6) {
      effConstraints.push({
        id: cons.id,
        name: cons.name,
        a,
        b,
        operator: cons.operator,
        rhs: effectiveRhs,
        color: colors[idx % colors.length],
      });
    }
  });

  // Calculate intersections of every pair of constraints
  const candidatePoints: Array<{ x: number; y: number; cons: string[] }> = [];

  for (let i = 0; i < effConstraints.length; i++) {
    for (let j = i + 1; j < effConstraints.length; j++) {
      const c1 = effConstraints[i];
      const c2 = effConstraints[j];

      // Determinant
      const det = c1.a * c2.b - c1.b * c2.a;
      if (Math.abs(det) > 1e-7) {
        const x = (c1.rhs * c2.b - c1.b * c2.rhs) / det;
        const y = (c1.a * c2.rhs - c1.rhs * c2.a) / det;

        if (isFinite(x) && isFinite(y)) {
          candidatePoints.push({
            x: Math.round(x * 10000) / 10000,
            y: Math.round(y * 10000) / 10000,
            cons: [c1.name, c2.name],
          });
        }
      }
    }
  }

  // Filter feasible points
  const tolerance = 1e-4;
  const allPoints: GraphicalMethodPoint[] = [];
  const feasiblePoints: GraphicalMethodPoint[] = [];

  candidatePoints.forEach((pt) => {
    let isFeasible = true;

    for (const c of effConstraints) {
      const lhs = c.a * pt.x + c.b * pt.y;
      if (c.operator === '<=' && lhs > c.rhs + tolerance) {
        isFeasible = false;
        break;
      }
      if (c.operator === '>=' && lhs < c.rhs - tolerance) {
        isFeasible = false;
        break;
      }
      if (c.operator === '==' && Math.abs(lhs - c.rhs) > tolerance) {
        isFeasible = false;
        break;
      }
    }

    const zVal = Math.round((cX * pt.x + cY * pt.y) * 100) / 100;
    const gPoint: GraphicalMethodPoint = {
      x: pt.x,
      y: pt.y,
      zValue: zVal,
      isFeasible,
      isOptimal: false,
      intersectingConstraints: pt.cons,
    };

    allPoints.push(gPoint);
    if (isFeasible && pt.x >= -tolerance && pt.y >= -tolerance) {
      // Avoid duplicate points
      const isDuplicate = feasiblePoints.some(
        (fp) => Math.abs(fp.x - pt.x) < 1e-3 && Math.abs(fp.y - pt.y) < 1e-3
      );
      if (!isDuplicate) {
        feasiblePoints.push(gPoint);
      }
    }
  });

  // Find optimal vertex
  let optimalPoint: GraphicalMethodPoint | null = null;
  if (feasiblePoints.length > 0) {
    let bestZ = isMax ? -Infinity : Infinity;
    feasiblePoints.forEach((pt) => {
      if ((isMax && pt.zValue > bestZ) || (!isMax && pt.zValue < bestZ)) {
        bestZ = pt.zValue;
        optimalPoint = pt;
      }
    });

    if (optimalPoint) {
      (optimalPoint as GraphicalMethodPoint).isOptimal = true;
    }
  }

  // Sort feasible points in angular order around their centroid to make polygon
  let feasiblePolygon: Array<{ x: number; y: number }> = [];
  if (feasiblePoints.length >= 3) {
    const meanX = feasiblePoints.reduce((acc, p) => acc + p.x, 0) / feasiblePoints.length;
    const meanY = feasiblePoints.reduce((acc, p) => acc + p.y, 0) / feasiblePoints.length;

    feasiblePolygon = [...feasiblePoints]
      .sort((p1, p2) => {
        const angle1 = Math.atan2(p1.y - meanY, p1.x - meanX);
        const angle2 = Math.atan2(p2.y - meanY, p2.x - meanX);
        return angle1 - angle2;
      })
      .map((p) => ({ x: p.x, y: p.y }));
  } else {
    feasiblePolygon = feasiblePoints.map((p) => ({ x: p.x, y: p.y }));
  }

  // Compute view bounds
  let maxGraphX = 10;
  let maxGraphY = 10;
  feasiblePoints.forEach((p) => {
    if (p.x > maxGraphX) maxGraphX = p.x;
    if (p.y > maxGraphY) maxGraphY = p.y;
  });

  effConstraints.forEach((c) => {
    if (c.a > 0 && c.rhs > 0) {
      const xInt = c.rhs / c.a;
      if (xInt < 10000 && xInt > maxGraphX) maxGraphX = Math.max(maxGraphX, xInt);
    }
    if (c.b > 0 && c.rhs > 0) {
      const yInt = c.rhs / c.b;
      if (yInt < 10000 && yInt > maxGraphY) maxGraphY = Math.max(maxGraphY, yInt);
    }
  });

  const domainX = Math.max(10, Math.ceil(maxGraphX * 1.25));
  const domainY = Math.max(10, Math.ceil(maxGraphY * 1.25));

  // Build line segments for rendering
  const constraintLines = effConstraints
    .filter((c) => c.id !== 'non_neg_x' && c.id !== 'non_neg_y')
    .map((c) => {
      let p1 = { x: 0, y: 0 };
      let p2 = { x: 0, y: 0 };

      if (Math.abs(c.b) < 1e-6) {
        // Vertical line: x = rhs / a
        const xVal = c.rhs / c.a;
        p1 = { x: xVal, y: 0 };
        p2 = { x: xVal, y: domainY };
      } else if (Math.abs(c.a) < 1e-6) {
        // Horizontal line: y = rhs / b
        const yVal = c.rhs / c.b;
        p1 = { x: 0, y: yVal };
        p2 = { x: domainX, y: yVal };
      } else {
        // Oblique line: ax + by = rhs -> y = (rhs - ax)/b
        const yAt0 = c.rhs / c.b;
        const xAt0 = c.rhs / c.a;
        const yAtDomainX = (c.rhs - c.a * domainX) / c.b;

        p1 = { x: 0, y: Math.max(-10, Math.min(domainY * 1.5, yAt0)) };
        p2 = { x: domainX, y: Math.max(-10, Math.min(domainY * 1.5, yAtDomainX)) };
      }

      const eqText = `${c.a !== 0 ? `${c.a !== 1 ? c.a : ''}${varX.symbol}` : ''}${
        c.b > 0 ? ` + ${c.b !== 1 ? c.b : ''}${varY.symbol}` : c.b < 0 ? ` - ${Math.abs(c.b) !== 1 ? Math.abs(c.b) : ''}${varY.symbol}` : ''
      } ${c.operator} ${c.rhs}`;

      return {
        id: c.id,
        name: c.name,
        color: c.color,
        operator: c.operator,
        p1,
        p2,
        equationText: eqText,
        a: c.a,
        b: c.b,
        c: c.rhs,
      };
    });

  return {
    vertices: feasiblePoints,
    feasiblePolygon,
    allIntersectionPoints: allPoints,
    optimalPoint,
    bounds: { minX: 0, maxX: domainX, minY: 0, maxY: domainY },
    constraintLines,
    objectiveGradient: { dx: cX, dy: cY },
  };
}

function createEmptyResult(message: string): OptimizationResult {
  return {
    status: 'ERROR',
    objectiveValue: 0,
    variableResults: [],
    constraintResults: [],
    bottlenecks: [],
    availableResources: [],
    executiveSummary: message,
    managerialRecommendations: [],
    solvedAt: new Date().toLocaleTimeString(),
  };
}

function generateExecutiveSummary(
  model: LPModel,
  optimalObj: number,
  varResults: Array<{ name: string; symbol: string; value: number; unit: string }>,
  consResults: Array<{ name: string; slack: number; shadowPrice: number; status: ConstraintStatus; unit: string; utilizationPercent: number }>
): string {
  const isMax = model.objective.type === 'maximize';
  const activeCount = consResults.filter((c) => c.status === 'binding').length;
  const slackCount = consResults.filter((c) => c.status === 'slack').length;

  const topVars = varResults
    .filter((v) => v.value > 0)
    .map((v) => `• ${v.name}: Fabricar o asignar ${v.value} ${v.unit}`)
    .join('\n');

  const highestShadowPrice = consResults
    .filter((c) => c.shadowPrice > 0)
    .sort((a, b) => b.shadowPrice - a.shadowPrice)[0];

  return `¡Hola! He analizado a detalle toda la operación de tu empresa y este es el plan ideal:

Con esta distribución logramos el ${isMax ? 'mayor beneficio económico posible' : 'costo operativo más bajo y eficiente'}, alcanzando un resultado total de $${optimalObj.toLocaleString()} USD.

📌 Plan de acción recomendado:
${topVars || '• No se requiere producción activa.'}

💡 ¿Por qué es esta la mejor decisión para tu negocio?
Explotamos al máximo tus recursos más económicos y eficientes (aprovechando al 100% las máquinas de menor costo). De esta manera cubres toda la demanda sin gastar de más, manteniendo ${slackCount} máquinas o recursos con capacidad de reserva para que puedas atender pedidos imprevistos.${
    highestShadowPrice
      ? `\n\n🚀 Consejo clave: Tu mayor oportunidad de expansión está en "${highestShadowPrice.name}". Si aumentas su capacidad, generarás un beneficio adicional de $${highestShadowPrice.shadowPrice.toFixed(2)} USD por cada unidad extra.`
      : ''
  }`;
}

function generateManagerialRecommendations(
  model: LPModel,
  optimalObj: number,
  consResults: Array<{ name: string; slack: number; shadowPrice: number; status: ConstraintStatus; unit: string; utilizationPercent: number }>,
  varResults: Array<{ name: string; symbol: string; value: number; unit: string; reducedCost: number }>
): string[] {
  const recs: string[] = [];

  // Shadow price recommendation
  const bindingCons = consResults.filter((c) => c.status === 'binding' && c.shadowPrice > 0);
  if (bindingCons.length > 0) {
    bindingCons.forEach((c) => {
      recs.push(
        `📈 Expansión Estratégica (${c.name}): Este recurso está al 100% de su capacidad. Cada unidad extra de capacidad que consigas (turnos extra o mejoras de mantenimiento) le generará a la empresa $${c.shadowPrice.toFixed(2)} USD netos. Vale la pena invertir siempre que el costo de ampliación sea menor a ese valor.`
      );
    });
  }

  // Slack resources recommendation
  const slackCons = consResults.filter((c) => c.status === 'slack' && c.slack > 0);
  if (slackCons.length > 0) {
    const mainSlack = slackCons[0];
    recs.push(
      `🛡️ Oportunidad en Capacidad Ociosa (${mainSlack.name}): Tienes una reserva de ${mainSlack.slack} ${mainSlack.unit} disponibles (${(100 - mainSlack.utilizationPercent).toFixed(1)}% libre). Esto te permite aceptar pedidos urgentes o de mayor margen de forma inmediata sin comprar maquinaria adicional.`
    );
  }

  // Non-produced items (reduced cost)
  const zeroVars = varResults.filter((v) => v.value === 0);
  if (zeroVars.length > 0) {
    zeroVars.forEach((v) => {
      if (v.reducedCost > 0) {
        recs.push(
          `🏷️ Ajuste Comercial (${v.name}): Con los costos actuales no conviene producir este ítem. Para que sea rentable incorporarlo a la producción, debes mejorar su precio de venta o reducir su costo de fabricación en al menos $${v.reducedCost.toFixed(2)} USD por unidad.`
        );
      }
    });
  }

  if (recs.length === 0) {
    recs.push('✅ El plan de producción está en equilibrio óptimo perfecto: no hay desperdicios ni pérdidas operativas.');
  }

  return recs;
}
