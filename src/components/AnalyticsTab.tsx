import React from 'react';
import { Transaction, Category } from '../types';
import { getCategorySpending, getTotalVariableExpenses, formatCurrency } from '../utils/finance';
import { BarChart2, PieChart, TrendingUp, AlertTriangle } from 'lucide-react';

interface AnalyticsTabProps {
  transactions: Transaction[];
  categories: Category[];
}

export function AnalyticsTab({ transactions, categories }: AnalyticsTabProps) {
  const [selectedCategoryId, setSelectedCategoryId] = React.useState<string | null>(null);

  const totalVariable = getTotalVariableExpenses(transactions);

  // Group transactions by category to find percentages
  const categoryData = categories.map(cat => {
    const spent = getCategorySpending(transactions, cat.id);
    const budget = cat.budget || 0;
    const ratio = budget > 0 ? spent / budget : 0;
    const percentageOfTotal = totalVariable > 0 ? (spent / totalVariable) * 100 : 0;

    return {
      ...cat,
      spent,
      budget,
      ratio,
      percentageOfTotal,
    };
  }).filter(c => c.spent > 0 || c.budget > 0);

  // Math for SVG Pie Chart
  let accumulatedAngle = 0;
  const pieSlices = categoryData
    .filter(c => c.spent > 0)
    .map((c, idx) => {
      const percentage = totalVariable > 0 ? c.spent / totalVariable : 0;
      const angle = percentage * 360;
      const startAngle = accumulatedAngle;
      accumulatedAngle += angle;

      // Coordinate helper
      const getCoordinatesForPercent = (percent: number) => {
        const x = Math.cos(2 * Math.PI * percent);
        const y = Math.sin(2 * Math.PI * percent);
        return [x, y];
      };

      return {
        ...c,
        startAngle,
        endAngle: accumulatedAngle,
        percentage,
      };
    });

  // Calculate coordinates for donut slices
  const makeDonutPath = (startAngle: number, endAngle: number, radius: number, innerRadius: number) => {
    const toRadians = (angle: number) => (angle - 90) * Math.PI / 180;
    
    const x1 = radius * Math.cos(toRadians(startAngle));
    const y1 = radius * Math.sin(toRadians(startAngle));
    const x2 = radius * Math.cos(toRadians(endAngle));
    const y2 = radius * Math.sin(toRadians(endAngle));
    
    const ix1 = innerRadius * Math.cos(toRadians(startAngle));
    const iy1 = innerRadius * Math.sin(toRadians(startAngle));
    const ix2 = innerRadius * Math.cos(toRadians(endAngle));
    const iy2 = innerRadius * Math.sin(toRadians(endAngle));
    
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
    
    return `
      M ${x1} ${y1}
      A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
      L ${ix2} ${iy2}
      A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${ix1} ${iy1}
      Z
    `;
  };

  // Find most expensive category
  const maxExpenseCategory = [...categoryData].sort((a, b) => b.spent - a.spent)[0];

  // Total budgeted sum vs total spent sum (excluding income)
  const totalBudgeted = categories.reduce((sum, c) => sum + (c.budget || 0), 0);
  const totalSpentOnBudget = categories.reduce((sum, c) => sum + getCategorySpending(transactions, c.id), 0);
  const budgetRatio = totalBudgeted > 0 ? totalSpentOnBudget / totalBudgeted : 0;

  // Selected category transactions
  const selectedCategoryTransactions = selectedCategoryId 
    ? transactions.filter(t => t.categoryId === selectedCategoryId && t.type === 'expense')
    : [];

  return (
    <div className="p-6 space-y-6">
      {/* Tab Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Análisis y Presupuestos</h2>
        <p className="text-xs text-slate-500">Gráficos de distribución de gastos</p>
      </div>

      {/* Global budget performance block */}
      <div className="bg-white border border-slate-100 rounded-[24px] p-5 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Presupuesto Mensual Integrado</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
            {formatCurrency(totalSpentOnBudget)} / {formatCurrency(totalBudgeted)}
          </span>
        </div>
        
        {/* Unified progress bar */}
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${
              budgetRatio >= 1.0 
                ? 'bg-rose-500' 
                : budgetRatio >= 0.85 
                  ? 'bg-amber-500' 
                  : 'bg-blue-600'
            }`}
            style={{ width: `${Math.min(100, budgetRatio * 100)}%` }}
          ></div>
        </div>

        <div className="flex justify-between items-center mt-3 text-[10px] text-slate-500">
          <span>{budgetRatio >= 1.0 ? '⚠️ Límite de presupuesto excedido' : budgetRatio >= 0.85 ? '⚠️ Presupuesto casi lleno' : '👍 Consumo dentro del límite'}</span>
          <span className="font-bold text-slate-700">{(budgetRatio * 100).toFixed(0)}%</span>
        </div>
      </div>

      {/* Interactive Pie/Donut Chart & Distribution */}
      <div className="bg-white border border-slate-100 rounded-[24px] p-5 shadow-sm space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <PieChart size={14} className="text-blue-500" />
          Distribución de Gasto Variable
        </h3>

        {totalVariable === 0 ? (
          <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <p className="text-xs text-slate-400">Registra gastos para generar el gráfico circular.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-6 py-2">
            {/* SVG Donut implementation */}
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg viewBox="-100 -100 200 200" className="w-full h-full transform -rotate-90 select-none">
                {pieSlices.map((slice, i) => (
                  <path
                    key={slice.id}
                    d={makeDonutPath(slice.startAngle, slice.endAngle, 85, 55)}
                    fill={slice.color}
                    className="cursor-pointer transition-all duration-300 hover:scale-[1.05] hover:opacity-90 stroke-white stroke-[2px]"
                    onClick={() => setSelectedCategoryId(slice.id === selectedCategoryId ? null : slice.id)}
                    style={{
                      transformOrigin: '0px 0px',
                    }}
                  />
                ))}
              </svg>
              {/* Inner Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Total Gastado</span>
                <span className="text-lg font-bold text-slate-800">{formatCurrency(totalVariable)}</span>
              </div>
            </div>

            {/* Custom chart legend */}
            <div className="w-full grid grid-cols-2 gap-2 text-xs">
              {categoryData.filter(c => c.spent > 0).map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(cat.id === selectedCategoryId ? null : cat.id)}
                  className={`flex items-center gap-2 p-1.5 rounded-xl text-left border transition-all ${cat.id === selectedCategoryId ? 'bg-slate-50 border-slate-200 font-bold scale-[1.02]' : 'border-transparent text-slate-600'}`}
                >
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }}></span>
                  <span className="truncate flex-1 text-[11px] font-medium text-slate-700">{cat.name}</span>
                  <span className="font-bold text-[10px] text-slate-500">
                    {cat.percentageOfTotal.toFixed(0)}%
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Detailed Reports by Category list */}
      <div className="bg-white border border-slate-100 rounded-[24px] p-5 shadow-sm space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <BarChart2 size={14} className="text-blue-500" />
          Estado de Presupuestos por Categoría
        </h3>

        <div className="space-y-4">
          {categories.map(cat => {
            const spent = getCategorySpending(transactions, cat.id);
            const budget = cat.budget || 0;
            const ratio = budget > 0 ? spent / budget : 0;
            const isExceeded = spent > budget && budget > 0;
            const isNearing = ratio >= 0.85 && spent <= budget && budget > 0;

            return (
              <div 
                key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id === selectedCategoryId ? null : cat.id)}
                className={`p-3 rounded-2xl border cursor-pointer transition-all ${cat.id === selectedCategoryId ? 'bg-blue-50/40 border-blue-200 shadow-xs' : 'border-slate-50 hover:border-slate-100 bg-white'}`}
              >
                <div className="flex justify-between items-start mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }}></span>
                    <span className="text-xs font-bold text-slate-800">{cat.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-bold text-slate-700">
                      {formatCurrency(spent)}
                    </span>
                    <span className="text-[9px] text-slate-400">
                      {budget > 0 ? ` / ${formatCurrency(budget)}` : ' (Sin límite)'}
                    </span>
                  </div>
                </div>

                {budget > 0 && (
                  <div className="space-y-1">
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${isExceeded ? 'bg-rose-500' : isNearing ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.min(100, ratio * 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[8px] font-semibold">
                      <span className={`${isExceeded ? 'text-rose-500' : isNearing ? 'text-amber-500' : 'text-slate-400'}`}>
                        {isExceeded ? 'Presupuesto superado' : isNearing ? 'Cerca del límite' : 'Disponible: ' + formatCurrency(budget - spent)}
                      </span>
                      <span className="text-slate-500">{(ratio * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Category breakdown (if active or selected) */}
      {selectedCategoryId && (
        <div className="bg-slate-900 text-white rounded-[24px] p-5 shadow-lg animate-slide-up space-y-3">
          <div className="flex justify-between items-center border-b border-white/10 pb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
              Desglose de Gasto: {categories.find(c => c.id === selectedCategoryId)?.name}
            </h4>
            <button 
              onClick={() => setSelectedCategoryId(null)}
              className="text-[10px] bg-white/10 hover:bg-white/20 text-white px-2 py-0.5 rounded-md"
            >
              Cerrar
            </button>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
            {selectedCategoryTransactions.length === 0 ? (
              <p className="text-[10px] text-slate-400 text-center py-4">No hay gastos variables en esta categoría este mes.</p>
            ) : (
              selectedCategoryTransactions.map(t => (
                <div key={t.id} className="flex justify-between items-center text-xs py-1.5 border-b border-white/5">
                  <div>
                    <p className="font-bold text-slate-100">{t.title}</p>
                    <p className="text-[9px] text-slate-400">{t.date}</p>
                  </div>
                  <span className="font-bold text-rose-300">-{formatCurrency(t.amount)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
