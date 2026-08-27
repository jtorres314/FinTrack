import React, { useState, useEffect } from 'react';
import { 
  Home as HomeIcon, 
  CreditCard, 
  Plus, 
  BarChart2, 
  Settings as SettingsIcon, 
  Bell, 
  X, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Send, 
  Heart, 
  Zap, 
  Gift, 
  PlusCircle, 
  Smartphone, 
  DollarSign, 
  Trash2, 
  CheckCheck,
  Utensils,
  Car,
  Tv,
  ShoppingBag,
  Award
} from 'lucide-react';

import { Category, Transaction, RecurringBill, AppNotification, TransactionType } from './types';
import { 
  INITIAL_CATEGORIES, 
  INITIAL_TRANSACTIONS, 
  INITIAL_RECURRING_BILLS 
} from './initialData';
import { 
  getTotalIncome, 
  getTotalFixedExpenses, 
  getTotalVariableExpenses, 
  checkBudgets, 
  checkUpcomingBills, 
  advanceDueDate,
  formatCurrency
} from './utils/finance';

import { MobileFrame } from './components/MobileFrame';
import { CardWidget } from './components/CardWidget';
import { NotificationBanner } from './components/NotificationBanner';
import { TransactionsTab } from './components/TransactionsTab';
import { AnalyticsTab } from './components/AnalyticsTab';
import { SettingsTab } from './components/SettingsTab';
import { SchedulePaymentsWidget } from './components/SchedulePaymentsWidget';
import { UserAvatar } from './components/UserAvatar';
import { AppIcon } from './components/AppIcon';

// Helper component to map string icon names to Lucide icon elements
export function CategoryIcon({ name, size = 16, className = '' }: { name: string; size?: number; className?: string }) {
  const iconProps = { size, className };
  switch (name) {
    case 'Home': return <HomeIcon {...iconProps} />;
    case 'Utensils': return <Utensils {...iconProps} />;
    case 'Car': return <Car {...iconProps} />;
    case 'Tv': return <Tv {...iconProps} />;
    case 'Zap': return <Zap {...iconProps} />;
    case 'ShoppingBag': return <ShoppingBag {...iconProps} />;
    case 'Heart': return <Heart {...iconProps} />;
    case 'Award': return <Award {...iconProps} />;
    default: return <PlusIcon {...iconProps} />;
  }
}

// Fallback for icons
function PlusIcon(props: any) {
  return <Plus {...props} />;
}

export default function App() {
  // --- Persistent State (V2 to start completely empty and clean) ---
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('fin_categories_v2');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('fin_transactions_v2');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });

  const [bills, setBills] = useState<RecurringBill[]>(() => {
    const saved = localStorage.getItem('fin_bills_v2');
    return saved ? JSON.parse(saved) : INITIAL_RECURRING_BILLS;
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('fin_notifications_v2');
    return saved ? JSON.parse(saved) : [];
  });

  const [baseIncome, setBaseIncome] = useState<number>(() => {
    const saved = localStorage.getItem('fin_base_income_v2');
    return saved ? parseFloat(saved) : 0;
  });

  const [baseFixedExpenses, setBaseFixedExpenses] = useState<number>(() => {
    const saved = localStorage.getItem('fin_base_fixed_v2');
    return saved ? parseFloat(saved) : 0;
  });

  const [cardHolder, setCardHolder] = useState<string>(() => {
    const saved = localStorage.getItem('fin_card_holder_v2');
    return saved || 'Mi Tarjeta';
  });

  const [cardNumber, setCardNumber] = useState<string>(() => {
    const saved = localStorage.getItem('fin_card_number_v2');
    return saved || '4532 8765 4321 8635';
  });

  const [cardExpiry, setCardExpiry] = useState<string>(() => {
    const saved = localStorage.getItem('fin_card_expiry_v2');
    return saved || '10/30';
  });

  const [cardFrom, setCardFrom] = useState<string>(() => {
    const saved = localStorage.getItem('fin_card_from_v2');
    return saved || '10/25';
  });

  const [simulatedDate, setSimulatedDate] = useState<string>('2026-07-26');
  const [activeTab, setActiveTab] = useState<'home' | 'transactions' | 'analytics' | 'settings'>('home');

  // --- UI Interactivity ---
  const [toast, setToast] = useState<{ id: string; title: string; message: string } | null>(null);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [showTransModal, setShowTransModal] = useState(false);

  // Unified Transaction Form State
  const [transType, setTransType] = useState<TransactionType>('expense');
  const [transTitle, setTransTitle] = useState('');
  const [transAmount, setTransAmount] = useState('');
  const [transCategoryId, setTransCategoryId] = useState('');
  const [transDate, setTransDate] = useState('2026-07-26');

  // --- Synchronize to Local Storage ---
  useEffect(() => {
    localStorage.setItem('fin_categories_v2', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('fin_transactions_v2', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('fin_bills_v2', JSON.stringify(bills));
  }, [bills]);

  useEffect(() => {
    localStorage.setItem('fin_notifications_v2', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('fin_base_income_v2', baseIncome.toString());
  }, [baseIncome]);

  useEffect(() => {
    localStorage.setItem('fin_base_fixed_v2', baseFixedExpenses.toString());
  }, [baseFixedExpenses]);

  useEffect(() => {
    localStorage.setItem('fin_card_holder_v2', cardHolder);
  }, [cardHolder]);

  useEffect(() => {
    localStorage.setItem('fin_card_number_v2', cardNumber);
  }, [cardNumber]);

  useEffect(() => {
    localStorage.setItem('fin_card_expiry_v2', cardExpiry);
  }, [cardExpiry]);

  useEffect(() => {
    localStorage.setItem('fin_card_from_v2', cardFrom);
  }, [cardFrom]);

  // Request native permission for real push notifications if supported
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // --- Real-Time Notification Engine Hook ---
  // Re-run checks whenever transactions, bills, or simulated dates change
  useEffect(() => {
    const newAlerts: AppNotification[] = [];

    // 1. Check upcoming recurring bills
    const billAlerts = checkUpcomingBills(bills, simulatedDate, notifications);
    newAlerts.push(...billAlerts);

    // 2. Check category budgets
    const { warnings: budgetAlerts } = checkBudgets(transactions, categories, notifications);
    newAlerts.push(...budgetAlerts);

    if (newAlerts.length > 0) {
      // Append new notifications
      setNotifications(prev => {
        // Double check uniqueness
        const uniqueNew = newAlerts.filter(na => !prev.some(p => p.title === na.title && p.message === na.message));
        if (uniqueNew.length === 0) return prev;

        // Trigger the latest one as an in-app visual push slide-down banner!
        const latest = uniqueNew[0];
        setToast({ id: latest.id, title: latest.title, message: latest.message });

        // Trigger real native browser Notification if granted
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(latest.title, {
            body: latest.message,
            icon: '/favicon.ico'
          });
        }

        return [...uniqueNew, ...prev];
      });
    }
  }, [transactions, bills, simulatedDate, categories]);

  // --- Real-time Balance Calculations ---
  const calculatedIncome = getTotalIncome(transactions, baseIncome);
  const calculatedFixed = getTotalFixedExpenses(transactions, baseFixedExpenses);
  const calculatedVariable = getTotalVariableExpenses(transactions);
  const availableBalance = calculatedIncome - calculatedFixed - calculatedVariable;

  // Unread notification count
  const unreadCount = notifications.filter(n => !n.read).length;

  // --- Action Handlers ---
  const handleAddTransaction = (t: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...t,
      id: `t-${Date.now()}`,
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const handleAddCategory = (cat: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...cat,
      id: `cat-${Date.now()}`,
    };
    setCategories(prev => [...prev, newCat]);
  };

  const handleEditCategory = (updatedCat: Category) => {
    setCategories(prev => prev.map(c => c.id === updatedCat.id ? updatedCat : c));
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const handleAddRecurringBill = (b: Omit<RecurringBill, 'id' | 'isPaid'>) => {
    const newBill: RecurringBill = {
      ...b,
      id: `bill-${Date.now()}`,
      isPaid: false,
    };
    setBills(prev => [...prev, newBill]);
  };

  // Pay standard recurring bill (vence)
  const handlePayRecurringBill = (billId: string, isLastPayment?: boolean, paymentDate?: string) => {
    const bill = bills.find(b => b.id === billId);
    if (!bill) return;

    // 1. Log payment as a transaction
    // Assign to bill's configured category, fallback if not found
    let targetCatId = bill.categoryId;
    if (!categories.some(c => c.id === targetCatId)) {
      targetCatId = categories[0]?.id || '';
    }

    const effectiveDate = paymentDate || simulatedDate;

    handleAddTransaction({
      title: isLastPayment ? `Último Pago: ${bill.title}` : `Factura: ${bill.title}`,
      amount: bill.amount,
      date: effectiveDate,
      categoryId: targetCatId,
      type: 'expense',
    });

    if (isLastPayment) {
      // Delete the recurring bill
      setBills(prev => prev.filter(b => b.id !== billId));
      
      setToast({
        id: `pay-confirm-${Date.now()}`,
        title: '🏁 Último Pago Registrado',
        message: `Has pagado y finalizado la programación de "${bill.title}" por ${formatCurrency(bill.amount)} el día ${effectiveDate}.`,
      });
    } else {
      // 2. Advance due date of the bill
      const nextDate = advanceDueDate(bill.dueDate, bill.frequency);
      setBills(prev => prev.map(b => {
        if (b.id === billId) {
          return {
            ...b,
            dueDate: nextDate,
            isPaid: false // reset paid status for the new term
          };
        }
        return b;
      }));

      // Toast confirmation
      setToast({
        id: `pay-confirm-${Date.now()}`,
        title: '💵 Pago Registrado',
        message: `Has pagado ${bill.title} por ${formatCurrency(bill.amount)} con fecha ${effectiveDate}. Próximo vencimiento: ${nextDate}.`,
      });
    }
  };

  const handleDeleteRecurringBill = (billId: string) => {
    setBills(prev => prev.filter(b => b.id !== billId));
  };

  // Quick Action form submissions (Unified Modal Handler)
  const handleTransSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transAmount || !transTitle) return;

    const amountNum = parseFloat(transAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    const isIncome = transType === 'income';
    
    // Check if category is required and valid
    let catId = transCategoryId;
    if (!isIncome) {
      if (!catId && categories.length > 0) {
        catId = categories[0].id;
      }
      if (!catId) {
        setToast({
          id: `no-cat-${Date.now()}`,
          title: '📂 Categoría Requerida',
          message: 'Debes seleccionar o crear una categoría para este gasto.',
        });
        return;
      }
    } else {
      catId = ''; // No category for income
    }

    handleAddTransaction({
      title: transTitle.trim(),
      amount: amountNum,
      date: transDate || simulatedDate,
      categoryId: catId,
      type: transType,
    });

    // Reset fields
    setTransTitle('');
    setTransAmount('');
    setTransCategoryId(categories[0]?.id || '');
    setTransDate(simulatedDate);
    setShowTransModal(false);

    // Dynamic toast
    const typeLabel = isIncome ? 'Ingreso' : transType === 'fixed_expense' ? 'Gasto Fijo' : 'Gasto Variable';
    const typeEmoji = isIncome ? '💰' : transType === 'fixed_expense' ? '📁' : '🛍️';
    setToast({
      id: `trans-toast-${Date.now()}`,
      title: `${typeEmoji} ${typeLabel} Registrado`,
      message: `Se registró "${transTitle.trim()}" por ${formatCurrency(amountNum)}.`,
    });
  };

  // Demo Helpers inside settings
  const handleSimulateBudgetExceeded = () => {
    // Force log a massive expense in the Food category to trigger alerts
    const foodCat = categories.find(c => c.id === 'cat-food') || categories[0];
    if (!foodCat) return;

    handleAddTransaction({
      title: 'Festín Extraordinario Demo',
      amount: (foodCat.budget || 300) + 50,
      date: simulatedDate,
      categoryId: foodCat.id,
      type: 'expense',
    });
  };

  const handleResetApp = () => {
    if (confirm('¿Seguro que deseas reiniciar todos los datos y empezar desde cero?')) {
      localStorage.clear();
      setCategories([]);
      setTransactions([]);
      setBills([]);
      setNotifications([]);
      setBaseIncome(0);
      setBaseFixedExpenses(0);
      setCardHolder('Mi Tarjeta');
      setCardNumber('4532 8765 4321 8635');
      setCardExpiry('10/30');
      setCardFrom('10/25');
      setSimulatedDate('2026-07-26');
      setActiveTab('home');
      setToast({
        id: `reset-toast-${Date.now()}`,
        title: '🔄 Aplicación Reiniciada',
        message: 'Todos los datos han sido borrados. Comienza desde cero.',
      });
    }
  };

  const handleMarkNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  return (
    <MobileFrame activeTab={activeTab} simulatedTime={simulatedDate}>
      {/* 1. TOP FLOATING PUSH NOTIFICATION BANNER */}
      <NotificationBanner
        toast={toast}
        onClose={() => setToast(null)}
        onClick={() => {
          setActiveTab('settings');
          setShowNotificationCenter(true);
          setToast(null);
        }}
      />

      {/* 2. PERSISTENT HEADER (Profile pic, Bell, etc.) */}
      <div className="px-6 pt-5 pb-3 flex justify-between items-center bg-white z-20 sticky top-0 border-b border-slate-50 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div onClick={() => setActiveTab('settings')}>
              <UserAvatar className="w-10 h-10 rounded-full border-2 border-white shadow-md cursor-pointer" />
            </div>
            {/* Red active notification dot on profile */}
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 w-3 h-3 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <AppIcon className="w-8 h-8 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Hola, {cardHolder.split(' ')[0]}</span>
              <h1 className="text-base font-extrabold text-slate-950 -mt-0.5 tracking-tight">FinTrack</h1>
            </div>
          </div>
        </div>

        {/* Bell Button with Active count Badge */}
        <button 
          id="btn-notifications-bell"
          onClick={() => setShowNotificationCenter(!showNotificationCenter)}
          className="relative p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full transition-all active:scale-95 shadow-xs"
        >
          <Bell size={18} className={unreadCount > 0 ? 'animate-swing' : ''} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-rose-500 text-white font-extrabold text-[9px] w-5 h-5 rounded-full border-2 border-white flex items-center justify-center shadow-md">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* 3. SIDE SLIDING NOTIFICATION TRAY (Center of alert logs) */}
      {showNotificationCenter && (
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex justify-end">
          <div className="w-4/5 max-w-sm bg-white h-full shadow-2xl flex flex-col animate-slide-left">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm">Notificaciones</h3>
                <p className="text-[10px] text-slate-400">Alertas de presupuestos y pagos</p>
              </div>
              <button 
                onClick={() => setShowNotificationCenter(false)}
                className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-full"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-thin">
              {notifications.length === 0 ? (
                <div className="text-center py-20 text-slate-400 space-y-2">
                  <Bell size={24} className="mx-auto text-slate-300" />
                  <p className="text-xs">No tienes notificaciones pendientes.</p>
                </div>
              ) : (
                notifications.map(n => (
                  <div 
                    key={n.id} 
                    className={`p-3.5 rounded-2xl border transition-all relative ${
                      !n.read 
                        ? 'bg-blue-50/50 border-blue-100 shadow-xs' 
                        : 'bg-white border-slate-100 opacity-75'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="text-xs font-bold text-slate-900 pr-4">{n.title}</h4>
                      {!n.read && (
                        <button 
                          onClick={() => handleMarkNotificationRead(n.id)}
                          className="p-1 text-blue-500 hover:text-blue-700 bg-blue-100/30 hover:bg-blue-100/50 rounded-lg text-[9px] font-bold"
                          title="Marcar como leída"
                        >
                          <CheckCheck size={11} />
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed font-medium">
                      {n.message.split('[ref')[0]} {/* hide internal refs */}
                    </p>
                    <span className="text-[9px] text-slate-400 block mt-2">
                      {new Date(n.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} • {new Date(n.date).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                ))
              )}
            </div>

            {notifications.length > 0 && (
              <div className="p-4 border-t border-slate-100">
                <button
                  onClick={handleClearNotifications}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-xl transition-all"
                >
                  Limpiar Todo el Historial
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. MAIN VIEWS SWITCHER */}
      <div className="w-full">
        {activeTab === 'home' && (
          <div className="px-6 py-4 space-y-6 animate-fade-in">
            {/* Empty Categories Setup Card */}
            {categories.length === 0 && (
              <div className="bg-blue-50 border border-blue-100 rounded-3xl p-5 text-center space-y-3.5 shadow-sm">
                <div className="mx-auto w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-bold">
                  ⚙️
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-800">¡Configura tu App desde Cero!</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Has borrado todos los datos para empezar de cero. Define tus categorías y presupuestos en la pestaña de Ajustes para disfrutar de la experiencia de Fintech.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('settings')}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all active:scale-95 shadow-sm"
                >
                  Ir a Ajustes y Crear Categorías
                </button>
              </div>
            )}

            {/* Blue Gradient card widget displaying real-time balance */}
            <CardWidget
              balance={availableBalance}
              cardHolder={cardHolder}
              cardNumber={cardNumber}
              cardExpiry={cardExpiry}
              cardFrom={cardFrom}
              cardEnding="8635"
              totalIncome={calculatedIncome}
              totalExpenses={calculatedFixed + calculatedVariable}
            />

             {/* QUICK ACTIONS ROW */}
             <div className="space-y-3">
               <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Acciones Rápidas</h3>
               <div className="grid grid-cols-3 gap-3">
                 {/* Money Transfer (Add income) */}
                 <button 
                   onClick={() => {
                     setTransType('income');
                     setTransTitle('');
                     setTransAmount('');
                     setTransCategoryId('');
                     setTransDate(simulatedDate);
                     setShowTransModal(true);
                   }}
                   className="bg-white hover:bg-slate-50 border border-slate-100 rounded-3xl p-4 flex flex-col items-center text-center shadow-xs transition-all active:scale-95"
                 >
                   <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl mb-2.5">
                     <ArrowDownLeft size={20} />
                   </div>
                   <span className="text-xs font-extrabold text-slate-800 tracking-tight">Agregar Ingreso</span>
                 </button>
 
                 {/* Pay Bill */}
                 <button 
                   onClick={() => {
                     const firstBill = bills[0];
                     if (firstBill) {
                       handlePayRecurringBill(firstBill.id);
                     } else {
                       setActiveTab('settings');
                     }
                   }}
                   className="bg-white hover:bg-slate-50 border border-slate-100 rounded-3xl p-4 flex flex-col items-center text-center shadow-xs transition-all active:scale-95"
                 >
                   <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl mb-2.5">
                     <Send size={20} />
                   </div>
                   <span className="text-xs font-extrabold text-slate-800 tracking-tight">Pagar Factura</span>
                 </button>
 
                 {/* Bank to Bank (Quick Variable Expense form) */}
                 <button 
                   onClick={() => {
                     setTransType('expense');
                     setTransTitle('');
                     setTransAmount('');
                     setTransCategoryId(categories[0]?.id || '');
                     setTransDate(simulatedDate);
                     setShowTransModal(true);
                   }}
                   className="bg-white hover:bg-slate-50 border border-slate-100 rounded-3xl p-4 flex flex-col items-center text-center shadow-xs transition-all active:scale-95"
                 >
                   <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl mb-2.5">
                     <ArrowUpRight size={20} />
                   </div>
                   <span className="text-xs font-extrabold text-slate-800 tracking-tight">Nuevo Gasto</span>
                 </button>
               </div>
             </div>

            {/* SCHEDULED PAYMENTS / REMINDERS LIST */}
            <SchedulePaymentsWidget
              bills={bills}
              categories={categories}
              simulatedDateStr={simulatedDate}
              onAddBill={handleAddRecurringBill}
              onPayBill={handlePayRecurringBill}
              onDeleteBill={handleDeleteRecurringBill}
              onAddCategory={handleAddCategory}
            />
          </div>
        )}

        {/* Tab 2: Transactions tab */}
        {activeTab === 'transactions' && (
          <div className="animate-fade-in">
            <TransactionsTab
              transactions={transactions}
              categories={categories}
              onAddTransaction={handleAddTransaction}
              onDeleteTransaction={handleDeleteTransaction}
            />
          </div>
        )}

        {/* Tab 4: Analytics tab */}
        {activeTab === 'analytics' && (
          <div className="animate-fade-in">
            <AnalyticsTab
              transactions={transactions}
              categories={categories}
            />
          </div>
        )}
 
        {/* Tab 5: Settings / Category management */}
        {activeTab === 'settings' && (
          <div className="animate-fade-in">
            <SettingsTab
              categories={categories}
              onAddCategory={handleAddCategory}
              onEditCategory={handleEditCategory}
              onDeleteCategory={handleDeleteCategory}
              baseIncome={baseIncome}
              baseFixedExpenses={baseFixedExpenses}
              onUpdateBaseFinances={(inc, fix) => {
                setBaseIncome(inc);
                setBaseFixedExpenses(fix);
                setToast({
                  id: `fin-upd-${Date.now()}`,
                  title: '💼 Finanzas Actualizadas',
                  message: `Se fijó Ingreso Base en $${inc} y Gastos Fijos en $${fix}.`
                });
              }}
              cardHolder={cardHolder}
              cardNumber={cardNumber}
              cardExpiry={cardExpiry}
              cardFrom={cardFrom}
              onUpdateCardDetails={(holder, num, expiry, fromDate) => {
                setCardHolder(holder || 'Mi Tarjeta');
                setCardNumber(num || '4532 8765 4321 8635');
                setCardExpiry(expiry || '10/30');
                setCardFrom(fromDate || '10/25');
                setToast({
                  id: `card-upd-${Date.now()}`,
                  title: '💳 Tarjeta Actualizada',
                  message: 'Los datos de la tarjeta se han guardado con éxito.'
                });
              }}
              simulatedDate={simulatedDate}
              onSetSimulatedDate={(d) => {
                setSimulatedDate(d);
                setToast({
                  id: `date-upd-${Date.now()}`,
                  title: '📅 Fecha del Sistema Cambiada',
                  message: `La fecha de simulación ahora es ${d}.`
                });
              }}
              onResetApp={handleResetApp}
              onSimulateBudgetExceeded={handleSimulateBudgetExceeded}
            />
          </div>
        )}
      </div>
 
      {/* 5. INDIVIDUAL MODALS FOR QUICK ACTIONS */}
      {/* Unified Transaction Modal */}
      {showTransModal && (
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="w-full max-w-sm bg-white rounded-[28px] p-5 shadow-2xl animate-slide-up my-auto max-h-[92%] flex flex-col">
            <div className="flex justify-between items-center mb-3.5 shrink-0">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Nueva Transacción</h3>
              <button 
                onClick={() => setShowTransModal(false)}
                className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={16} />
              </button>
            </div>
 
            <form onSubmit={handleTransSubmit} className="space-y-3.5 overflow-y-auto pr-1 scrollbar-thin flex-1 pb-1">
              {/* Type Switcher */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">Tipo</label>
                <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-xl">
                  <button
                    type="button"
                    onClick={() => {
                      setTransType('expense');
                      if (categories.length > 0 && !transCategoryId) {
                        setTransCategoryId(categories[0].id);
                      }
                    }}
                    className={`py-1.5 rounded-lg text-[10px] font-bold transition-all ${transType === 'expense' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500'}`}
                  >
                    Variable
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTransType('fixed_expense');
                      if (categories.length > 0 && !transCategoryId) {
                        setTransCategoryId(categories[0].id);
                      }
                    }}
                    className={`py-1.5 rounded-lg text-[10px] font-bold transition-all ${transType === 'fixed_expense' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
                  >
                    Fijo
                  </button>
                  <button
                    type="button"
                    onClick={() => setTransType('income')}
                    className={`py-1.5 rounded-lg text-[10px] font-bold transition-all ${transType === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}
                  >
                    Ingreso
                  </button>
                </div>
              </div>
 
              {/* Amount */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Monto ($ USD)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500 font-extrabold text-sm">$</span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={transAmount}
                    onChange={(e) => setTransAmount(e.target.value)}
                    className="w-full pl-7 pr-4 py-2.5 bg-slate-50 focus:bg-white text-sm text-slate-800 font-extrabold rounded-xl border border-slate-100 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
 
              {/* Title / Description */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Descripción</label>
                <input
                  type="text"
                  required
                  placeholder={transType === 'income' ? 'Ej. Venta, Transferencia extra' : 'Ej. Supermercado, Alquiler, Cafetería'}
                  value={transTitle}
                  onChange={(e) => setTransTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 focus:bg-white text-xs text-slate-800 rounded-xl border border-slate-100 focus:border-blue-500 outline-none transition-all font-medium"
                />
              </div>
 
              {/* Category selector */}
              {transType !== 'income' && (
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Categoría</label>
                  {categories.length === 0 ? (
                    <div className="text-[10px] text-rose-500 font-bold bg-rose-50 px-3 py-2 rounded-xl border border-rose-100">
                      ⚠️ No tienes categorías. Créalas en Ajustes (⚙️).
                    </div>
                  ) : (
                    <select
                      value={transCategoryId}
                      onChange={(e) => setTransCategoryId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 focus:bg-white text-xs text-slate-800 rounded-xl border border-slate-100 focus:border-blue-500 outline-none transition-all cursor-pointer font-medium"
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  )}
                </div>
              )}
 
              {/* Date */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Fecha</label>
                <input
                  type="date"
                  required
                  value={transDate}
                  onChange={(e) => setTransDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 focus:bg-white text-xs text-slate-800 rounded-xl border border-slate-100 focus:border-blue-500 outline-none transition-all font-semibold"
                />
              </div>
 
              <button
                type="submit"
                disabled={transType !== 'income' && categories.length === 0}
                className={`w-full py-2.5 text-white font-bold rounded-xl text-xs shadow-md transition-all active:scale-98 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed ${
                  transType === 'income' 
                    ? 'bg-emerald-600 hover:bg-emerald-700' 
                    : transType === 'fixed_expense' 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {transType === 'income' ? 'Confirmar Ingreso' : transType === 'fixed_expense' ? 'Confirmar Gasto Fijo' : 'Confirmar Gasto'}
              </button>
            </form>
          </div>
        </div>
      )}
 
      {/* 6. BOTTOM NAVIGATION BAR (From image, highly responsive & detailed) */}
      <div className="absolute bottom-0 left-0 right-0 h-[68px] bg-white border-t border-slate-100 flex justify-around items-center z-40 select-none px-4 shadow-[0_-4px_16px_rgba(0,0,0,0.02)]">
        {/* Tab 1: Home */}
        <button 
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all active:scale-90 ${activeTab === 'home' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
          aria-label="Inicio"
        >
          <HomeIcon size={20} className={activeTab === 'home' ? 'stroke-[2.5px]' : 'stroke-[1.8px]'} />
        </button>
 
        {/* Tab 2: Transactions history */}
        <button 
          onClick={() => setActiveTab('transactions')}
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all active:scale-90 ${activeTab === 'transactions' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
          aria-label="Transacciones"
        >
          <CreditCard size={20} className={activeTab === 'transactions' ? 'stroke-[2.5px]' : 'stroke-[1.8px]'} />
        </button>
 
        {/* Tab 3: Center round blue button for quick adding */}
        <div className="relative -top-3.5">
          <button 
            onClick={() => {
              setTransType('expense');
              setTransTitle('');
              setTransAmount('');
              setTransCategoryId(categories[0]?.id || '');
              setTransDate(simulatedDate);
              setShowTransModal(true);
            }}
            className="flex items-center justify-center w-[52px] h-[52px] bg-gradient-to-tr from-blue-600 to-blue-500 text-white rounded-2xl shadow-lg shadow-blue-500/30 hover:scale-105 active:scale-95 hover:shadow-blue-500/40 transition-all border-4 border-white"
            aria-label="Agregar Gasto Rápido"
          >
            <Plus size={24} className="stroke-[3px]" />
          </button>
        </div>
 
        {/* Tab 4: Analytics */}
        <button 
          onClick={() => setActiveTab('analytics')}
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all active:scale-90 ${activeTab === 'analytics' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
          aria-label="Reportes"
        >
          <BarChart2 size={20} className={activeTab === 'analytics' ? 'stroke-[2.5px]' : 'stroke-[1.8px]'} />
        </button>
 
        {/* Tab 5: Settings / Categories */}
        <button 
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all active:scale-90 ${activeTab === 'settings' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
          aria-label="Configuración"
        >
          <SettingsIcon size={20} className={activeTab === 'settings' ? 'stroke-[2.5px]' : 'stroke-[1.8px]'} />
        </button>
      </div>
    </MobileFrame>
  );
}
