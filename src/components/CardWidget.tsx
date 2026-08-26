import React from 'react';
import { CreditCard, Eye, EyeOff } from 'lucide-react';
import { formatCurrency } from '../utils/finance';

interface CardWidgetProps {
  balance: number;
  cardHolder: string;
  cardEnding: string;
  cardNumber?: string;
  cardExpiry?: string;
  cardFrom?: string;
  totalIncome: number;
  totalExpenses: number;
}

export function CardWidget({ balance, cardHolder, cardEnding, cardNumber, cardExpiry, cardFrom, totalIncome, totalExpenses }: CardWidgetProps) {
  const [showNumbers, setShowNumbers] = React.useState(true);
  const [activeCard, setActiveCard] = React.useState<0 | 1>(0); // 0: Balance, 1: Income/Expense details

  const digitsOnly = (cardNumber || '').replace(/\D/g, '');
  const ending = digitsOnly.length >= 4 ? digitsOnly.slice(-4) : cardEnding;
  const expiry = cardExpiry || '10/30';
  const fromDate = cardFrom || '10/25';

  // Format the full card number with groups of 4 digits
  const formattedCardNumber = React.useMemo(() => {
    if (!cardNumber) return `••••  ••••  ••••  ${ending}`;
    const clean = cardNumber.replace(/\D/g, '');
    const chunks = clean.match(/.{1,4}/g) || [];
    return chunks.join('  ');
  }, [cardNumber, ending]);

  return (
    <div className="relative w-full select-none">
      {/* Slider dots indicator */}
      <div className="flex justify-center gap-1.5 mb-2.5">
        <button 
          onClick={() => setActiveCard(0)} 
          className={`h-1.5 rounded-full transition-all duration-300 ${activeCard === 0 ? 'w-5 bg-blue-600' : 'w-1.5 bg-gray-300'}`}
          aria-label="Ver saldo disponible"
        />
        <button 
          onClick={() => setActiveCard(1)} 
          className={`h-1.5 rounded-full transition-all duration-300 ${activeCard === 1 ? 'w-5 bg-blue-600' : 'w-1.5 bg-gray-300'}`}
          aria-label="Ver desglose mensual"
        />
      </div>

      {activeCard === 0 ? (
        /* Card 1: Available Balance (Mastercard mockup style from image) */
        <div id="main-credit-card" className="relative w-full h-52 bg-gradient-to-tr from-blue-600 via-blue-500 to-cyan-400 rounded-[28px] p-6 text-white shadow-xl overflow-hidden transition-transform duration-300 hover:scale-[1.02]">
          {/* Wave designs behind */}
          <div className="absolute inset-0 opacity-15">
            <svg viewBox="0 0 400 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full scale-110">
              <path d="M-10 120 C 100 80, 150 160, 300 110 C 380 85, 410 130, 450 100 L450 210 L-10 210 Z" fill="white" />
              <path d="M-20 60 C 80 40, 200 120, 310 70 C 370 45, 400 90, 460 70 L460 210 L-20 210 Z" fill="white" opacity="0.5" />
            </svg>
          </div>

          <div className="relative h-full flex flex-col justify-between">
            {/* Header info */}
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-blue-100 uppercase tracking-wider font-medium opacity-90">Saldo Disponible</p>
                <div className="flex items-center gap-2 mt-1">
                  <h3 className="text-3xl font-bold tracking-tight">
                    {formatCurrency(balance)}
                  </h3>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setShowNumbers(!showNumbers); }} 
                    className="p-1 hover:bg-white/10 rounded-full transition-colors"
                  >
                    {showNumbers ? <EyeOff size={14} className="opacity-85" /> : <Eye size={14} className="opacity-85" />}
                  </button>
                </div>
              </div>

              {/* SIM Chip */}
              <div className="w-11 h-8 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-md border border-yellow-200/50 shadow-sm flex flex-col justify-between p-1.5">
                <div className="w-full h-[1px] bg-yellow-600/30"></div>
                <div className="flex gap-1">
                  <div className="w-2 h-3 border-r border-yellow-600/30"></div>
                  <div className="w-2 h-3 border-r border-yellow-600/30"></div>
                </div>
                <div className="w-full h-[1px] bg-yellow-600/30"></div>
              </div>
            </div>

            {/* Card digits */}
            <div className="my-1">
              <p className="font-mono text-base sm:text-lg tracking-[0.15em] sm:tracking-[0.25em] text-blue-50">
                {showNumbers ? formattedCardNumber : `••••  ••••  ••••  ${ending}`}
              </p>
            </div>

            {/* Footer with dates and cardholder */}
            <div className="flex justify-between items-end">
              <div className="text-[10px]">
                <p className="text-blue-200/80 font-medium">Vence</p>
                <p className="font-semibold text-blue-50 text-xs mt-0.5">{expiry}</p>
              </div>

              <div className="text-right">
                <p className="text-[9px] text-blue-200/80 uppercase tracking-wider">Titular</p>
                <p className="font-medium text-sm text-blue-50 tracking-wide truncate max-w-[150px]">
                  {cardHolder}
                </p>
              </div>

              {/* Mastercard circles */}
              <div className="flex -space-x-2.5 items-center justify-end w-10">
                <div className="w-6 h-6 rounded-full bg-[#EB001B] opacity-90"></div>
                <div className="w-6 h-6 rounded-full bg-[#F79E1B] opacity-90 mix-blend-screen"></div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Card 2: Income / Expenses visual distribution card */
        <div id="stats-credit-card" className="relative w-full h-52 bg-slate-900 rounded-[28px] p-6 text-white shadow-xl overflow-hidden transition-transform duration-300 hover:scale-[1.02]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900 via-slate-950 to-slate-950"></div>
          
          <div className="relative h-full flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <CreditCard size={16} className="text-indigo-400" />
                <span className="text-xs uppercase font-medium tracking-widest text-slate-400">Resumen Mensual</span>
              </div>
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full font-medium border border-indigo-500/30">
                {new Date().toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-2">
              <div className="bg-white/5 border border-white/5 rounded-2xl p-3">
                <p className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
                  Ingresos
                </p>
                <p className="text-lg font-bold text-emerald-50 mt-1">
                  +{formatCurrency(totalIncome)}
                </p>
              </div>

              <div className="bg-white/5 border border-white/5 rounded-2xl p-3">
                <p className="text-[10px] text-rose-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block"></span>
                  Gastos
                </p>
                <p className="text-lg font-bold text-rose-50 mt-1">
                  -{formatCurrency(totalExpenses)}
                </p>
              </div>
            </div>

            {/* Quick mini-progress line */}
            <div className="w-full mt-2">
              <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                <span>Porcentaje de Gasto</span>
                <span className="font-medium text-slate-300">
                  {totalIncome > 0 ? ((totalExpenses / totalIncome) * 100).toFixed(0) : '0'}%
                </span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
