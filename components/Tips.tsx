
import React, { useState, useEffect } from 'react';
import { Lightbulb, Sparkles, ChevronRight, Loader2, DollarSign } from 'lucide-react';
import { Appliance, UserProfile } from '../types';
import { getAIEnergyTips } from '../services/geminiService';

interface TipsProps {
  appliances: Appliance[];
  profile: UserProfile;
}

const TipsScreen: React.FC<TipsProps> = ({ appliances, profile }) => {
  const [aiTips, setAiTips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTips() {
      setLoading(true);
      const tips = await getAIEnergyTips(appliances, profile);
      setAiTips(tips);
      setLoading(false);
    }
    loadTips();
  }, [appliances, profile]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Dicas ContaLuz</h2>
        <p className="text-xs text-slate-500">Educação e economia para sua casa.</p>
      </div>

      {/* AI Recommendation Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-emerald-600 p-5 rounded-2xl text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="font-bold text-sm">Análise da nossa IA</h3>
            <p className="text-[11px] text-emerald-100">Baseado no seu perfil de uso atual.</p>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
      </div>

      {/* AI Tips Content */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="animate-spin text-emerald-500" size={32} />
            <p className="text-sm text-slate-400 font-medium italic">Consultando nossa inteligência...</p>
          </div>
        ) : (
          aiTips.map((tip, idx) => (
            <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <div className="bg-yellow-100 text-yellow-600 p-2 rounded-xl">
                  <Lightbulb size={20} />
                </div>
                <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full flex items-center gap-1">
                  <DollarSign size={12} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{tip.estimatedSaving}</span>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-slate-800">{tip.title}</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{tip.description}</p>
              </div>
              <button className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 uppercase pt-2">
                Ver mais detalhes
                <ChevronRight size={14} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Common Knowledge Section */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Fundamentos Energéticos</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <p className="text-xs font-bold text-slate-700">O que é Watt?</p>
            <p className="text-[10px] text-slate-500 mt-1">Potência: o quanto o aparelho "puxa" de energia.</p>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <p className="text-xs font-bold text-slate-700">O que é kWh?</p>
            <p className="text-[10px] text-slate-500 mt-1">Consumo: Potência x Tempo de uso.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TipsScreen;
