import React, { useState, useMemo } from 'react';
import { Transaction, Category } from '../types';
import { formatCurrency } from '../utils/finance';
import { 
  BarChart2, 
  PieChart, 
  TrendingUp, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  ArrowUpRight, 
  ArrowDownLeft, 
  DollarSign, 
  CheckCircle2,
  Layers
} from 'lucide-react';

export type TimeFilterPeriod = 'all' | 'custom' | 'day' | 'week' | 'month' | 'quarter' | 'semester' | 'year';

interface AnalyticsTabProps {
  transactions: Transaction[];
  categories: Category[];
}

export function AnalyticsTab({ transactions, categories }: AnalyticsTabProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  
  // Period filter states: 'all' | 'custom' | 'day' | 'week' | 'month' | 'quarter' | 'semester' | 'year'
  const [period, setPeriod] = useState<TimeFilterPeriod>('month');
  
  // Specific reference date (Defaults to current date)
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [refDateStr, setRefDateStr] = useState<string>(todayStr);
  
  // Custom range dates (if custom is chosen)
  const [customStartDate, setCustomStartDate] = useState<string>(todayStr);
  const [customEndDate, setCustomEndDate] = useState<string>(todayStr);

  // Parse reference date
  const refDate = useMemo(() => {
    const [y, m, d] = refDateStr.split('-').map(Number);
    return new Date(y, (m || 1) - 1, d || 1);
  }, [refDateStr]);

  // Compute active date range [startDate, endDate] based on period and reference date
  const { dateRange, periodLabel } = useMemo(() => {
    const year = refDate.getFullYear();
    const month = refDate.getMonth(); // 0-11
    const day = refDate.getDate();

    if (period === 'all') {
      return {
        dateRange: { start: '1900-01-01', end: '2099-12-31' },
        periodLabel: 'Histórico Completo'
      };
    }

    if (period === 'custom') {
      return {
        dateRange: { start: customStartDate, end: customEndDate },
        periodLabel: `${customStartDate} al ${customEndDate}`
      };
    }

    if (period === 'day') {
      const pad = (n: number) => n.toString().padStart(2, '0');
      const dateKey = `${year}-${pad(month + 1)}-${pad(day)}`;
      const options: Intl.DateTimeFormatOptions = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
      return {
        dateRange: { start: dateKey, end: dateKey },
        periodLabel: refDate.toLocaleDateString('es-ES', options)
      };
    }

    if (period === 'week') {
      // Calculate Monday of current week
      const currentDayOfWeek = refDate.getDay(); // 0 is Sunday, 1 is Monday, ...
      const distanceToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;
      const monday = new Date(year, month, day + distanceToMonday);
      const sunday = new Date(year, month, day + distanceToMonday + 6);
      
      const pad = (n: number) => n.toString().padStart(2, '0');
      const startKey = `${monday.getFullYear()}-${pad(monday.getMonth() + 1)}-${pad(monday.getDate())}`;
      const endKey = `${sunday.getFullYear()}-${pad(sunday.getMonth() + 1)}-${pad(sunday.getDate())}`;
      
      const monthName = monday.toLocaleDateString('es-ES', { month: 'short' });
      return {
        dateRange: { start: startKey, end: endKey },
        periodLabel: `Semana: ${monday.getDate()} - ${sunday.getDate()} de ${monthName}, ${year}`
      };
    }

    if (period === 'month') {
      const pad = (n: number) => n.toString().padStart(2, '0');
      const lastDay = new Date(year, month + 1, 0).getDate();
      const startKey = `${year}-${pad(month + 1)}-01`;
      const endKey = `${year}-${pad(month + 1)}-${pad(lastDay)}`;
      const monthName = refDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
      return {
        dateRange: { start: startKey, end: endKey },
        periodLabel: monthName.charAt(0).toUpperCase() + monthName.slice(1)
      };
    }

    if (period === 'quarter') {
      const quarterIndex = Math.floor(month / 3); // 0 (Q1), 1 (Q2), 2 (Q3), 3 (Q4)
      const startMonth = quarterIndex * 3;
      const endMonth = startMonth + 2;
      const lastDay = new Date(year, endMonth + 1, 0).getDate();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const startKey = `${year}-${pad(startMonth + 1)}-01`;
      const endKey = `${year}-${pad(endMonth + 1)}-${pad(lastDay)}`;
      
      const qNames = ['Trimestre 1 (Ene - Mar)', 'Trimestre 2 (Abr - Jun)', 'Trimestre 3 (Jul - Sep)', 'Trimestre 4 (Oct - Dic)'];
      return {
        dateRange: { start: startKey, end: endKey },
        periodLabel: `${qNames[quarterIndex]} ${year}`
      };
    }

    if (period === 'semester') {
      const semesterIndex = Math.floor(month / 6); // 0 (S1: Ene-Jun), 1 (S2: Jul-Dic)
      const startMonth = semesterIndex * 6;
      const endMonth = startMonth + 5;
      const lastDay = new Date(year, endMonth + 1, 0).getDate();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const startKey = `${year}-${pad(startMonth + 1)}-01`;
      const endKey = `${year}-${pad(endMonth + 1)}-${pad(lastDay)}`;
      
      const sNames = ['Semestre 1 (Ene - Jun)', 'Semestre 2 (Jul - Dic)'];
      return {
        dateRange: { start: startKey, end: endKey },
        periodLabel: `${sNames[semesterIndex]} ${year}`
      };
    }

    if (period === 'year') {
      const startKey = `${year}-01-01`;
      const endKey = `${year}-12-31`;
      return {
        dateRange: { start: startKey, end: endKey },
        periodLabel: `Año ${year}`
      };
    }

    return {
      dateRange: { start: '1900-01-01', end: '2099-12-31' },
      periodLabel: 'Período'
    };
  }, [period, refDate, customStartDate, customEndDate]);

  // Navigate Period (Previous / Next)
  const handleShiftPeriod = (direction: -1 | 1) => {
    const d = new Date(refDate);
    if (period === 'day') {
      d.setDate(d.getDate() + direction);
    } else if (period === 'week') {
      d.setDate(d.getDate() + direction * 7);
    } else if (period === 'month') {
      d.setMonth(d.getMonth() + direction);
    } else if (period === 'quarter') {
      d.setMonth(d.getMonth() + direction * 3);
    } else if (period === 'semester') {
      d.setMonth(d.getMonth() + direction * 6);
    } else if (period === 'year') {
      d.setFullYear(d.getFullYear() + direction);
    }
    const pad = (n: number) => n.toString().padStart(2, '0');
    setRefDateStr(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
  };

  // Filter transactions within active range
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (!t.date) return false;
      return t.date >= dateRange.start && t.date <= dateRange.end;
    });
  }, [transactions, dateRange]);

  // Financial calculations for the selected period
  const periodTotalIncome = useMemo(() => {
    return filteredTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const periodTotalFixed = useMemo(() => {
    return filteredTransactions
      .filter(t => t.type === 'fixed_expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const periodTotalVariable = useMemo(() => {
    return filteredTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const periodTotalExpenses = periodTotalFixed + periodTotalVariable;
  const periodNetSavings = periodTotalIncome - periodTotalExpenses;

  // Scale monthly budget according to period length
  const budgetScaleFactor = useMemo(() => {
    switch (period) {
      case 'day': return 1 / 30;
      case 'week': return 7 / 30;
      case 'month': return 1;
      case 'quarter': return 3;
      case 'semester': return 6;
      case 'year': return 12;
      case 'all': return 1;
      case 'custom': {
        const d1 = new Date(customStartDate);
        const d2 = new Date(customEndDate);
        const diffDays = Math.max(1, Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 3600 * 24)) + 1);
        return diffDays / 30;
      }
      default: return 1;
    }
  }, [period, customStartDate, customEndDate]);

  // Category data computed within the filtered period
  const categoryData = useMemo(() => {
    return categories.map(cat => {
      const spent = filteredTransactions
        .filter(t => t.type === 'expense' && t.categoryId === cat.id)
        .reduce((sum, t) => sum + t.amount, 0);
      
      const scaledBudget = (cat.budget || 0) * budgetScaleFactor;
      const ratio = scaledBudget > 0 ? spent / scaledBudget : 0;
      const percentageOfTotal = periodTotalVariable > 0 ? (spent / periodTotalVariable) * 100 : 0;

      return {
        ...cat,
        spent,
        budget: scaledBudget,
        baseBudget: cat.budget || 0,
        ratio,
        percentageOfTotal,
      };
    }).filter(c => c.spent > 0 || c.baseBudget > 0);
  }, [categories, filteredTransactions, budgetScaleFactor, periodTotalVariable]);

  // Math for SVG Pie/Donut Chart
  const pieSlices = useMemo(() => {
    let accumulatedAngle = 0;
    return categoryData
      .filter(c => c.spent > 0)
      .map((c) => {
        const percentage = periodTotalVariable > 0 ? c.spent / periodTotalVariable : 0;
        const angle = percentage * 360;
        const startAngle = accumulatedAngle;
        accumulatedAngle += angle;

        return {
          ...c,
          startAngle,
          endAngle: accumulatedAngle,
          percentage,
        };
      });
  }, [categoryData, periodTotalVariable]);

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

  // Total budgeted sum vs total spent sum in this period
  const totalBudgeted = categoryData.reduce((sum, c) => sum + c.budget, 0);
  const totalSpentOnBudget = categoryData.reduce((sum, c) => sum + c.spent, 0);
  const budgetRatio = totalBudgeted > 0 ? totalSpentOnBudget / totalBudgeted : 0;

  // Selected category transactions within period
  const selectedCategoryTransactions = useMemo(() => {
    if (!selectedCategoryId) return [];
    return filteredTransactions.filter(t => t.categoryId === selectedCategoryId && t.type === 'expense');
  }, [selectedCategoryId, filteredTransactions]);

  const periodOptions: { id: TimeFilterPeriod; label: string }[] = [
    { id: 'day', label: 'Día' },
    { id: 'week', label: 'Semana' },
    { id: 'month', label: 'Mes' },
    { id: 'quarter', label: 'Trimestre' },
    { id: 'semester', label: 'Semestre' },
    { id: 'year', label: 'Año' },
    { id: 'custom', label: 'Rango' },
    { id: 'all', label: 'Todo' },
  ];

  return (
    <div className="p-4 md:p-6 space-y-5 animate-fade-in pb-12">
      {/* Tab Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Análisis y Presupuestos</h2>
          <p className="text-xs text-slate-500 font-medium">Visualiza y filtra tus finanzas por períodos clave</p>
        </div>
      </div>

      {/* FILTER CONTROLS BAR (Pill selector + Date navigator) */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-3 shadow-xs space-y-3">
        {/* Period Selector Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
          {periodOptions.map(opt => (
            <button
              key={opt.id}
              onClick={() => setPeriod(opt.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                period === opt.id
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-200 scale-100'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-800'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Date Navigator / Custom Range Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100">
          {/* Active Period Label & Shift Buttons */}
          <div className="flex items-center gap-1.5">
            {period !== 'all' && period !== 'custom' && (
              <button
                onClick={() => handleShiftPeriod(-1)}
                className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                title="Período anterior"
                aria-label="Período anterior"
              >
                <ChevronLeft size={16} />
              </button>
            )}

            <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 border border-slate-200/70 rounded-xl">
              <Calendar size={13} className="text-blue-600 shrink-0" />
              <span className="text-xs font-extrabold text-slate-800 tracking-tight">
                {periodLabel}
              </span>
            </div>

            {period !== 'all' && period !== 'custom' && (
              <button
                onClick={() => handleShiftPeriod(1)}
                className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
                title="Período siguiente"
                aria-label="Período siguiente"
              >
                <ChevronRight size={16} />
              </button>
            )}
          </div>

          {/* Quick Date Picker / Jump to Today */}
          <div className="flex items-center gap-2">
            {period === 'custom' ? (
              <div className="flex items-center gap-1.5 text-xs">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none focus:border-blue-500 cursor-pointer"
                />
                <span className="text-slate-400 font-bold text-[10px]">a</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 outline-none focus:border-blue-500 cursor-pointer"
                />
              </div>
            ) : period !== 'all' ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="date"
                  value={refDateStr}
                  onChange={(e) => setRefDateStr(e.target.value)}
                  className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:border-blue-500 cursor-pointer"
                  title="Seleccionar fecha de referencia"
                />
                <button
                  type="button"
                  onClick={() => setRefDateStr(todayStr)}
                  className="text-[10px] font-bold text-blue-600 hover:underline bg-blue-50 px-2 py-1 rounded-lg cursor-pointer"
                >
                  Hoy
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* FINANCIAL SUMMARY CARDS FOR THE PERIOD */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Total Incomes */}
        <div className="bg-white border border-slate-100 rounded-2xl p-3.5 shadow-xs">
          <div className="flex items-center gap-1.5 text-emerald-600 mb-1">
            <ArrowUpRight size={14} className="stroke-[2.5]" />
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Ingresos</span>
          </div>
          <p className="text-sm sm:text-base font-black text-emerald-600 truncate">
            {formatCurrency(periodTotalIncome)}
          </p>
        </div>

        {/* Total Expenses */}
        <div className="bg-white border border-slate-100 rounded-2xl p-3.5 shadow-xs">
          <div className="flex items-center gap-1.5 text-rose-500 mb-1">
            <ArrowDownLeft size={14} className="stroke-[2.5]" />
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Total Gastos</span>
          </div>
          <p className="text-sm sm:text-base font-black text-rose-600 truncate">
            {formatCurrency(periodTotalExpenses)}
          </p>
        </div>

        {/* Variable Expenses */}
        <div className="bg-white border border-slate-100 rounded-2xl p-3.5 shadow-xs">
          <div className="flex items-center gap-1.5 text-amber-500 mb-1">
            <PieChart size={14} className="stroke-[2.5]" />
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Gasto Variable</span>
          </div>
          <p className="text-sm sm:text-base font-black text-amber-600 truncate">
            {formatCurrency(periodTotalVariable)}
          </p>
        </div>

        {/* Net Savings */}
        <div className="bg-white border border-slate-100 rounded-2xl p-3.5 shadow-xs">
          <div className="flex items-center gap-1.5 text-blue-600 mb-1">
            <TrendingUp size={14} className="stroke-[2.5]" />
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Balance Neto</span>
          </div>
          <p className={`text-sm sm:text-base font-black truncate ${periodNetSavings >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
            {formatCurrency(periodNetSavings)}
          </p>
        </div>
      </div>

      {/* PERIOD BUDGET CONSUMPTION BAR */}
      <div className="bg-white border border-slate-100 rounded-[24px] p-5 shadow-xs">
        <div className="flex flex-wrap justify-between items-center gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
              <BarChart2 size={15} />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Presupuesto del Período ({periodLabel})
              </span>
              <p className="text-[10px] text-slate-400 font-medium">
                {period === 'month' ? 'Presupuesto mensual base' : `Ajustado proporcionalmente (${budgetScaleFactor.toFixed(2)}x)`}
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
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

        <div className="flex justify-between items-center mt-3 text-[10px] font-semibold text-slate-500">
          <span>{budgetRatio >= 1.0 ? '⚠️ Límite de presupuesto excedido' : budgetRatio >= 0.85 ? '⚠️ Presupuesto cerca del límite' : '👍 Consumo dentro de los límites'}</span>
          <span className="font-extrabold text-slate-700">{(budgetRatio * 100).toFixed(0)}%</span>
        </div>
      </div>

      {/* DONUT CHART & DISTRIBUTION OF EXPENSES */}
      <div className="bg-white border border-slate-100 rounded-[24px] p-5 shadow-xs space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <PieChart size={14} className="text-blue-500" />
            Distribución de Gastos ({periodLabel})
          </h3>
          <span className="text-[10px] font-bold text-slate-400">
            {filteredTransactions.filter(t => t.type === 'expense').length} movimientos
          </span>
        </div>

        {periodTotalVariable === 0 ? (
          <div className="text-center py-10 bg-slate-50/70 rounded-2xl border border-dashed border-slate-200">
            <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-500">No hay gastos variables en este período.</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Selecciona otro rango o registra nuevos gastos.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-6 py-2">
            {/* SVG Donut implementation */}
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg viewBox="-100 -100 200 200" className="w-full h-full transform -rotate-90 select-none">
                {pieSlices.map((slice) => (
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
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Gasto Variable</span>
                <span className="text-base font-black text-slate-800">{formatCurrency(periodTotalVariable)}</span>
              </div>
            </div>

            {/* Custom chart legend */}
            <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {categoryData.filter(c => c.spent > 0).map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(cat.id === selectedCategoryId ? null : cat.id)}
                  className={`flex items-center gap-2 p-2 rounded-xl text-left border transition-all cursor-pointer ${
                    cat.id === selectedCategoryId 
                      ? 'bg-blue-50/70 border-blue-300 font-bold scale-[1.02] shadow-xs' 
                      : 'border-slate-100 bg-slate-50/40 hover:bg-slate-100/60 text-slate-600'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: cat.color }}></span>
                  <span className="truncate flex-1 text-[11px] font-bold text-slate-700">{cat.name}</span>
                  <span className="font-black text-[10px] text-slate-500">
                    {cat.percentageOfTotal.toFixed(0)}%
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* DETAILED CATEGORY BUDGET STATUS */}
      <div className="bg-white border border-slate-100 rounded-[24px] p-5 shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <BarChart2 size={14} className="text-blue-500" />
          Desglose de Presupuestos por Categoría
        </h3>

        <div className="space-y-3">
          {categoryData.map(cat => {
            const spent = cat.spent;
            const budget = cat.budget;
            const ratio = cat.ratio;
            const isExceeded = spent > budget && budget > 0;
            const isNearing = ratio >= 0.85 && spent <= budget && budget > 0;

            return (
              <div 
                key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id === selectedCategoryId ? null : cat.id)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  cat.id === selectedCategoryId 
                    ? 'bg-blue-50/40 border-blue-300 shadow-xs' 
                    : 'border-slate-100 hover:border-slate-200 bg-white'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: cat.color }}></span>
                    <span className="text-xs font-extrabold text-slate-800">{cat.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-slate-800">
                      {formatCurrency(spent)}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">
                      {budget > 0 ? ` / ${formatCurrency(budget)}` : ' (Sin límite)'}
                    </span>
                  </div>
                </div>

                {budget > 0 && (
                  <div className="space-y-1.5">
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          isExceeded ? 'bg-rose-500' : isNearing ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, ratio * 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[9px] font-bold">
                      <span className={`${isExceeded ? 'text-rose-600' : isNearing ? 'text-amber-600' : 'text-slate-400'}`}>
                        {isExceeded ? '⚠️ Presupuesto superado' : isNearing ? '⚠️ Cerca del límite' : 'Disponible: ' + formatCurrency(Math.max(0, budget - spent))}
                      </span>
                      <span className="text-slate-600">{(ratio * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* CATEGORY TRANSACTIONS DRILLDOWN (When a category is selected) */}
      {selectedCategoryId && (
        <div className="bg-slate-900 text-white rounded-[24px] p-5 shadow-xl animate-slide-up space-y-3">
          <div className="flex justify-between items-center border-b border-white/10 pb-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-300 flex items-center gap-1.5">
              Movimientos del período: {categories.find(c => c.id === selectedCategoryId)?.name}
            </h4>
            <button 
              onClick={() => setSelectedCategoryId(null)}
              className="text-[10px] font-bold bg-white/10 hover:bg-white/20 text-white px-2.5 py-1 rounded-lg transition-all cursor-pointer"
            >
              Cerrar
            </button>
          </div>

          <div className="max-h-56 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
            {selectedCategoryTransactions.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-5">
                No hay movimientos registrados para esta categoría en el período seleccionado.
              </p>
            ) : (
              selectedCategoryTransactions.map(t => (
                <div key={t.id} className="flex justify-between items-center text-xs py-2 border-b border-white/5 last:border-0">
                  <div>
                    <p className="font-bold text-slate-100">{t.title}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{t.date}</p>
                  </div>
                  <span className="font-black text-rose-300">-{formatCurrency(t.amount)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
