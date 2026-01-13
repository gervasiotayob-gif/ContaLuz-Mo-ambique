
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Recharge, Appliance, UserProfile } from '../types';
import { Calendar, TrendingUp, CreditCard, Loader2, Info } from 'lucide-react';
import { getMonthlyAnalysis } from '../services/geminiService';

interface HistoryProps {
  recharges: Recharge[];
  dailyKwh: number;
  historicalAvg: number;
  appliances: Appliance[];
  profile: UserProfile;
}

const HistoryScreen: React.FC<HistoryProps> = ({ recharges, dailyKwh, historicalAvg, appliances, profile }) => {
  const [insight, setInsight] = useState<string>('');
  const [loadingInsight, setLoadingInsight] = useState(true);
  
  // Simulated monthly difference for demo
  const diffPercent = 12.5; 

  useEffect(() => {
    async function fetchAnalysis() {
      setLoadingInsight(true);
      const text = await getMonthlyAnalysis(appliances, profile, diffPercent);
      setInsight(text);
      setLoadingInsight(false);
    }
    if (appliances.length > 0) {
      fetchAnalysis();
    } else {
      setInsight('Adicione aparelhos para receber uma análise detalhada do consumo.');
      setLoadingInsight(false);
    }
  }, [appliances, profile]);

  // Mock daily data for chart
  const data = [
    { day: 'Seg', consumption: historicalAvg * 0.9 },
    { day: 'Ter', consumption: historicalAvg * 1.1 },
    { day: 'Qua', consumption: historicalAvg * 0.8 },
    { day: 'Qui', consumption: historicalAvg * 1.5 },
    { day: 'Sex', consumption: historicalAvg * 1.0 },
    { day: 'Sáb', consumption: dailyKwh },
    { day: 'Hoje', consumption: dailyKwh },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Histórico & Estatística</h2>
        <p className="text-xs text-slate-500">Acompanhe sua evolução.</p>
      </div>

      {/* Chart Card */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-xs font-bold text-slate-400 uppercase mb-4 flex items-center gap-2">
          <TrendingUp size={14} className="text-emerald-500" />
          Consumo Diário (kWh)
        </h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 10 }} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#94a3b8', fontSize: 10 }} 
              />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <ReferenceLine y={historicalAvg} stroke="#10b981" strokeDasharray="5 5" label={{ position: 'top', value: 'Média', fill: '#10b981', fontSize: 10 }} />
              <Bar 
                dataKey="consumption" 
                fill="#34d399" 
                radius={[4, 4, 0, 0]} 
                barSize={30}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Analysis Card */}
      <div className="bg-slate-800 text-white p-5 rounded-2xl shadow-lg border border-slate-700">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Análise do Mês</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-lg font-bold ${diffPercent >= 0 ? 'text-orange-400' : 'text-emerald-400'}`}>
                {diffPercent >= 0 ? '+' : ''}{diffPercent}% {diffPercent >= 0 ? 'Superior' : 'Inferior'}
              </span>
              <span className="text-[10px] text-slate-400">vs mês passado</span>
            </div>
          </div>
          <div className="bg-slate-700 p-2 rounded-lg">
            <Info size={16} className="text-emerald-400" />
          </div>
        </div>

        {loadingInsight ? (
          <div className="flex items-center gap-3 py-2">
            <Loader2 className="animate-spin text-emerald-400" size={18} />
            <p className="text-xs text-slate-400 italic">Analisando seus aparelhos...</p>
          </div>
        ) : (
          <p className="text-sm leading-relaxed text-slate-200">
            {insight}
          </p>
        )}

        <div className="mt-4 pt-4 border-t border-slate-700 flex gap-4">
          <div>
            <p className="text-[10px] text-slate-400 uppercase font-bold">Total Gasto</p>
            <p className="text-lg font-bold">1.500 MT</p>
          </div>
          <div className="border-l border-slate-700 pl-4">
            <p className="text-[10px] text-slate-400 uppercase font-bold">Recargas</p>
            <p className="text-lg font-bold">{recharges.length}</p>
          </div>
        </div>
      </div>

      {/* Recharges List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
          <CreditCard size={14} className="text-emerald-500" />
          Últimas Recargas
        </h3>
        {recharges.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-dashed border-slate-200 text-center opacity-50">
            <p className="text-xs font-medium">Nenhuma recarga registada.</p>
          </div>
        ) : (
          recharges.map(rec => (
            <div key={rec.id} className="bg-white p-4 rounded-xl border border-slate-100 flex justify-between items-center hover:border-emerald-200 transition-colors">
              <div className="flex items-center gap-3">
                <div className="bg-emerald-50 p-2 rounded-lg text-emerald-600">
                  <Calendar size={18} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-700">{rec.amount} MT</p>
                  <p className="text-[10px] text-slate-400">{new Date(rec.date).toLocaleDateString('pt-MZ')}</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full uppercase">Sucesso</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HistoryScreen;
