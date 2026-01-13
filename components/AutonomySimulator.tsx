
import React, { useState } from 'react';
import { Wallet, Calendar, Sparkles, Loader2, Zap, XCircle, Clock, CheckCircle, Info } from 'lucide-react';
import { Appliance, UserProfile } from '../types';
import { getAutonomyStrategy } from '../services/geminiService';

interface AutonomySimulatorProps {
  appliances: Appliance[];
  profile: UserProfile;
}

const AutonomySimulator: React.FC<AutonomySimulatorProps> = ({ appliances, profile }) => {
  const [amount, setAmount] = useState<number>(500);
  const [days, setDays] = useState<number>(10);
  const [loading, setLoading] = useState(false);
  const [strategy, setStrategy] = useState<any>(null);

  const runSimulation = async () => {
    setLoading(true);
    const result = await getAutonomyStrategy(amount, days, appliances, profile);
    setStrategy(result);
    setLoading(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 pb-10">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Estrategista de Recarga</h2>
        <p className="text-xs text-slate-500">Planeie quanto quer gastar e quanto quer durar.</p>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
              <Wallet size={12} className="text-emerald-500" /> Valor da Recarga
            </label>
            <div className="relative">
              <input 
                type="number"
                step="any"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-3 pr-8 font-bold text-slate-800 text-sm focus:outline-emerald-500"
                value={amount}
                onChange={e => setAmount(parseFloat(e.target.value) || 0)}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">MT</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
              <Calendar size={12} className="text-emerald-500" /> Meta de Dias
            </label>
            <div className="relative">
              <input 
                type="number"
                step="any"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-3 pr-8 font-bold text-slate-800 text-sm focus:outline-emerald-500"
                value={days}
                onChange={e => setDays(parseFloat(e.target.value) || 0)}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">DIAS</span>
            </div>
          </div>
        </div>

        <button 
          onClick={runSimulation}
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-100 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Calculando Estratégia...
            </>
          ) : (
            <>
              <Sparkles size={18} />
              Gerar Plano de Economia
            </>
          )}
        </button>
      </div>

      {strategy && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          
          <div className="bg-indigo-600 text-white p-5 rounded-3xl shadow-xl shadow-indigo-100 space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle size={18} className="text-indigo-200" />
              <h3 className="font-bold">Estratégia Definida</h3>
            </div>
            <p className="text-sm opacity-90 leading-relaxed">{strategy.explanation}</p>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <XCircle size={14} className="text-red-500" /> Desligar Imediatamente
            </h4>
            <div className="flex flex-wrap gap-2">
              {strategy.stopUsing.length > 0 ? strategy.stopUsing.map((name: string) => (
                <span key={name} className="bg-red-50 text-red-600 text-[11px] font-bold px-3 py-2 rounded-full border border-red-100">
                  {name}
                </span>
              )) : <span className="text-slate-400 text-xs italic">Nenhum aparelho crítico</span>}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Clock size={14} className="text-orange-500" /> Reduzir Uso (Secundários)
            </h4>
            <div className="space-y-2">
              {strategy.reduceUsage.map((item: any) => (
                <div key={item.name} className="bg-white border border-slate-100 p-4 rounded-2xl flex items-center gap-4">
                  <div className="bg-orange-50 p-2 rounded-xl text-orange-500">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{item.name}</p>
                    <p className="text-xs text-orange-600 font-bold mt-0.5">Novo tempo: {item.newTime}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{item.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-3xl space-y-3">
            <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-widest flex items-center gap-2">
              <Zap size={14} className="text-emerald-500" /> Plano Diário Sugerido
            </h4>
            <p className="text-xs text-emerald-800 leading-relaxed italic">
              "{strategy.dailyPlan}"
            </p>
          </div>
          
          <div className="p-4 bg-slate-50 rounded-2xl flex gap-3 items-start border border-slate-100">
            <Info size={16} className="text-slate-400 mt-0.5" />
            <p className="text-[10px] text-slate-400 leading-relaxed">
              *Este plano é uma simulação teórica baseada nos seus dados de aparelhos. O consumo real pode variar conforme a eficiência de cada marca/modelo.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutonomySimulator;
