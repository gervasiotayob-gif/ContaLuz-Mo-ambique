
import React, { useState } from 'react';
import { AlertCircle, Calendar, Zap, RefreshCw, ChevronRight, Loader2, CheckCircle2, PlusCircle, X, Wallet, Check } from 'lucide-react';
import { Alert } from '../types';

interface DashboardProps {
  balance: number;
  autonomyDays: number;
  dailyKwh: number;
  consumptionDiffPercent: number;
  alerts: Alert[];
  onUpdateData: () => void;
  onRecharge?: (amount: number) => void;
  isUpdating?: boolean;
  lastUpdate?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  balance, 
  autonomyDays, 
  dailyKwh, 
  consumptionDiffPercent, 
  alerts, 
  onUpdateData,
  onRecharge,
  isUpdating = false,
  lastUpdate
}) => {
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState<string>('');
  const [rechargeSuccess, setRechargeSuccess] = useState(false);

  const getStatusColor = () => {
    if (autonomyDays < 2 || consumptionDiffPercent > 50) return 'bg-red-500';
    if (autonomyDays < 5 || consumptionDiffPercent > 20) return 'bg-orange-500';
    return 'bg-emerald-500';
  };

  const lastUpdateDate = lastUpdate ? new Date(lastUpdate) : new Date();

  const handleRechargeConfirm = () => {
    const amount = parseFloat(rechargeAmount);
    if (!isNaN(amount) && amount > 0 && onRecharge) {
      onRecharge(amount);
      setRechargeSuccess(true);
      setTimeout(() => {
        setRechargeSuccess(false);
        setShowRechargeModal(false);
        setRechargeAmount('');
      }, 1500);
    }
  };

  const rechargeShortcuts = [100, 200, 500, 1000];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* RECHARGE MODAL */}
      {showRechargeModal && (
        <div className="fixed inset-0 z-[110] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="bg-emerald-600 p-6 text-white relative">
              <button 
                onClick={() => setShowRechargeModal(false)}
                className="absolute top-4 right-4 bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors"
              >
                <X size={20} />
              </button>
              <h3 className="text-xl font-black tracking-tight">Recarga de Energia</h3>
              <p className="text-xs font-medium opacity-90 uppercase tracking-widest mt-1">Adicionar Crédito</p>
            </div>

            <div className="p-6 space-y-6">
              {rechargeSuccess ? (
                <div className="flex flex-col items-center justify-center py-6 animate-in zoom-in">
                  <div className="bg-emerald-100 text-emerald-600 p-4 rounded-full mb-3">
                    <Check size={40} />
                  </div>
                  <p className="font-bold text-slate-800">Recarga concluída!</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                      <Wallet size={12} className="text-emerald-500" /> Valor da Recarga (MT)
                    </label>
                    <input 
                      type="number" 
                      autoFocus
                      className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 text-2xl font-black text-slate-800 focus:outline-emerald-500 focus:border-emerald-500 transition-all"
                      placeholder="0.00"
                      value={rechargeAmount}
                      onChange={e => setRechargeAmount(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    {rechargeShortcuts.map(val => (
                      <button 
                        key={val}
                        onClick={() => setRechargeAmount(val.toString())}
                        className="py-2 text-[10px] font-black bg-slate-100 text-slate-600 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 transition-all border border-transparent hover:border-emerald-200"
                      >
                        +{val}
                      </button>
                    ))}
                  </div>

                  <button 
                    onClick={handleRechargeConfirm}
                    disabled={!rechargeAmount || parseFloat(rechargeAmount) <= 0}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-100 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    Confirmar Recarga
                    <CheckCircle2 size={18} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Summary Card */}
      <div className={`${getStatusColor()} rounded-3xl p-6 text-white shadow-lg relative overflow-hidden transition-colors duration-500`}>
        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <p className="text-emerald-100 text-sm font-medium opacity-90">Saldo Atual</p>
            <div className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full text-[10px] font-bold">
              {isUpdating ? <Loader2 size={10} className="animate-spin" /> : <CheckCircle2 size={10} />}
              {isUpdating ? 'Sincronizando...' : 'Conectado'}
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-1">
            <h2 className="text-4xl font-black tracking-tight">
              {isUpdating ? '---' : balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MT
            </h2>
            <button 
              onClick={() => setShowRechargeModal(true)}
              className="bg-white/20 p-3 rounded-2xl hover:bg-white/30 transition-all active:scale-95 group"
              title="Recarregar"
            >
              <PlusCircle size={24} className="group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>
          
          <div className="mt-6 flex items-center gap-2">
            <Calendar size={18} />
            <span className="font-bold">
              Autonomia: {autonomyDays === Infinity ? 'Indefinida' : `${autonomyDays} dias`}
            </span>
          </div>
          <p className="text-[10px] text-emerald-100 mt-1 opacity-70 italic">
            Última leitura: {lastUpdateDate.toLocaleTimeString()}
          </p>
        </div>
        <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      {/* Consumption Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <Zap size={16} className="text-emerald-500" />
            <span className="text-xs font-bold uppercase tracking-tighter">Uso de Hoje</span>
          </div>
          <p className="text-xl font-black text-slate-800 tracking-tight">{dailyKwh.toFixed(2)} kWh</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 text-slate-500 mb-1">
            <AlertCircle size={16} className={consumptionDiffPercent > 0 ? 'text-orange-500' : 'text-emerald-500'} />
            <span className="text-xs font-bold uppercase tracking-tighter">Vs Média</span>
          </div>
          <p className={`text-xl font-black tracking-tight ${consumptionDiffPercent > 0 ? 'text-orange-600' : 'text-emerald-600'}`}>
            {consumptionDiffPercent > 0 ? '+' : ''}{consumptionDiffPercent.toFixed(0)}%
          </p>
        </div>
      </div>

      {/* Quick Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alertas Recentes</h3>
            <span className="bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded-full font-black">
              {alerts.length} Novo(s)
            </span>
          </div>
          <div className="space-y-2">
            {alerts.slice(0, 2).map((alert) => (
              <div 
                key={alert.id} 
                className={`p-4 rounded-2xl border flex items-start gap-3 transition-all ${
                  alert.type === 'danger' ? 'bg-red-50 border-red-100' : 'bg-orange-50 border-orange-100'
                }`}
              >
                <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                  alert.type === 'danger' ? 'bg-red-500 animate-pulse' : 'bg-orange-500'
                }`}></div>
                <div className="flex-1">
                  <h4 className={`text-xs font-bold ${alert.type === 'danger' ? 'text-red-900' : 'text-orange-900'}`}>
                    {alert.title}
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-1 leading-tight font-medium">{alert.description}</p>
                </div>
                <ChevronRight size={14} className="text-slate-400 shrink-0 self-center" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Update Button */}
      <button 
        onClick={onUpdateData}
        disabled={isUpdating}
        className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all border shadow-sm ${
          isUpdating 
            ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed' 
            : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 active:scale-95'
        }`}
      >
        {isUpdating ? (
          <Loader2 size={18} className="animate-spin text-emerald-600" />
        ) : (
          <RefreshCw size={18} className="text-emerald-600" />
        )}
        {isUpdating ? 'Sincronizando com Contador...' : 'Sincronizar Dados'}
      </button>

      {/* Educational Promo */}
      <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl flex gap-4 items-center">
        <div className="bg-indigo-100 p-3 rounded-2xl text-indigo-600">
          <Zap size={20} />
        </div>
        <div>
          <h4 className="text-[10px] font-black text-indigo-900 uppercase tracking-wider">Sabia que...?</h4>
          <p className="text-[11px] text-indigo-800 mt-1 leading-snug font-medium">O ferro de engomar gasta o equivalente a 15 lâmpadas LED ligadas. Use-o fora de horários de pico!</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
