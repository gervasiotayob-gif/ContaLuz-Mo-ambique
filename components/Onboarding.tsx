
import React, { useState, useEffect } from 'react';
import { User, MapPin, Home, Navigation, ChevronRight, Zap, Loader2, Sparkles } from 'lucide-react';
import { UserProfile } from '../types';
import { DEFAULT_TARIFF, DEFAULT_HISTORICAL_AVG } from '../constants';
import { getLocationSuggestions } from '../services/geminiService';

interface OnboardingProps {
  onComplete: (profile: UserProfile) => void;
}

const PROVINCES = [
  'Maputo Cidade', 'Maputo Província', 'Gaza', 'Inhambane', 'Sofala', 
  'Manica', 'Tete', 'Zambézia', 'Nampula', 'Niassa', 'Cabo Delgado'
];

const RESIDENCE_TYPES = ['Casa', 'Apartamento', 'Vivenda', 'Dependência', 'Flat', 'Outro'];

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<Partial<UserProfile>>({
    name: '',
    province: 'Maputo Cidade',
    city: '',
    district: '',
    neighborhood: '',
    residenceType: 'Casa',
    residenceConfig: 'T2',
    tariffPerKWh: DEFAULT_TARIFF,
    historicalAvgKWh: DEFAULT_HISTORICAL_AVG,
    notificationsEnabled: true,
    onboardingCompleted: true,
    lowBalanceThresholdDays: 3,
    highConsumptionThresholdPercent: 30
  });

  const [suggestions, setSuggestions] = useState<{ city: string[], district: string[], neighborhood: string[] }>({
    city: [],
    district: [],
    neighborhood: []
  });

  const [loadingSuggestions, setLoadingSuggestions] = useState<{ city: boolean, district: boolean, neighborhood: boolean }>({
    city: false,
    district: false,
    neighborhood: false
  });

  // Effect to load city suggestions when province changes
  useEffect(() => {
    const fetchCities = async () => {
      if (!data.province) return;
      setLoadingSuggestions(prev => ({ ...prev, city: true }));
      const cities = await getLocationSuggestions('city', data.province);
      setSuggestions(prev => ({ ...prev, city: cities }));
      setLoadingSuggestions(prev => ({ ...prev, city: false }));
    };
    fetchCities();
  }, [data.province]);

  // Effect to load district suggestions when city changes
  useEffect(() => {
    const fetchDistricts = async () => {
      if (!data.city) return;
      setLoadingSuggestions(prev => ({ ...prev, district: true }));
      const districts = await getLocationSuggestions('district', data.city, { province: data.province });
      setSuggestions(prev => ({ ...prev, district: districts }));
      setLoadingSuggestions(prev => ({ ...prev, district: false }));
    };
    fetchDistricts();
  }, [data.city, data.province]);

  // Effect to load neighborhood suggestions when district changes
  useEffect(() => {
    const fetchNeighborhoods = async () => {
      if (!data.district) return;
      setLoadingSuggestions(prev => ({ ...prev, neighborhood: true }));
      const neighborhoods = await getLocationSuggestions('neighborhood', data.district, { province: data.province, city: data.city });
      setSuggestions(prev => ({ ...prev, neighborhood: neighborhoods }));
      setLoadingSuggestions(prev => ({ ...prev, neighborhood: false }));
    };
    fetchNeighborhoods();
  }, [data.district, data.city, data.province]);

  const handleNext = () => setStep(prev => prev + 1);

  const handleSubmit = () => {
    onComplete({
      ...data,
      address: `${data.neighborhood}, ${data.city}`,
    } as UserProfile);
  };

  const SuggestionChips = ({ items, onSelect, loading }: { items: string[], onSelect: (val: string) => void, loading: boolean }) => {
    if (loading) return (
      <div className="flex gap-2 overflow-x-auto py-1 animate-pulse">
        {[1, 2, 3].map(i => <div key={i} className="h-6 w-16 bg-slate-100 rounded-full shrink-0"></div>)}
      </div>
    );
    if (!items.length) return null;
    return (
      <div className="flex gap-2 overflow-x-auto py-1 scrollbar-hide">
        {items.map(item => (
          <button
            key={item}
            onClick={() => onSelect(item)}
            className="whitespace-nowrap bg-emerald-50 text-emerald-700 text-[10px] font-bold px-3 py-1.5 rounded-full border border-emerald-100 hover:bg-emerald-100 transition-colors flex items-center gap-1"
          >
            <Sparkles size={8} />
            {item}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[110] bg-white flex flex-col p-6 animate-in fade-in duration-500 overflow-y-auto">
      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full gap-8 py-8">
        
        <div className="text-center">
          <div className="bg-emerald-100 w-16 h-16 rounded-2xl flex items-center justify-center text-emerald-600 mx-auto mb-4">
            <Zap size={32} />
          </div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Bem-vindo ao ContaLuz</h1>
          <p className="text-slate-500 text-sm mt-2">Vamos configurar seu perfil para previsões precisas.</p>
        </div>

        {step === 1 && (
          <div className="space-y-4 animate-in slide-in-from-right-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <User size={14} /> Nome Completo
              </label>
              <input 
                type="text"
                className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-4 text-slate-950 focus:outline-emerald-500 font-bold placeholder-slate-400"
                placeholder="Como deseja ser chamado?"
                value={data.name}
                onChange={e => setData({...data, name: e.target.value})}
              />
            </div>
            <button 
              disabled={!data.name}
              onClick={handleNext}
              className="w-full bg-emerald-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50"
            >
              Próximo <ChevronRight size={18} />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-in slide-in-from-right-4">
            <div className="grid grid-cols-1 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Navigation size={14} /> Província
                </label>
                <select 
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-4 text-slate-950 focus:outline-emerald-500 font-bold"
                  value={data.province}
                  onChange={e => setData({...data, province: e.target.value, city: '', district: '', neighborhood: ''})}
                >
                  {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">Cidade / Município</label>
                <input 
                  type="text"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-950 font-bold placeholder-slate-400"
                  placeholder="Ex: Maputo"
                  value={data.city}
                  onChange={e => setData({...data, city: e.target.value})}
                />
                <SuggestionChips 
                  items={suggestions.city} 
                  loading={loadingSuggestions.city} 
                  onSelect={(val) => setData({...data, city: val, district: '', neighborhood: ''})} 
                />
              </div>

              <div className="grid grid-cols-1 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">Distrito</label>
                  <input 
                    type="text"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-950 font-bold placeholder-slate-400"
                    placeholder="Ex: Urbano 1"
                    value={data.district}
                    onChange={e => setData({...data, district: e.target.value})}
                  />
                  <SuggestionChips 
                    items={suggestions.district} 
                    loading={loadingSuggestions.district} 
                    onSelect={(val) => setData({...data, district: val, neighborhood: ''})} 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">Bairro</label>
                  <input 
                    type="text"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm text-slate-950 font-bold placeholder-slate-400"
                    placeholder="Ex: Polana"
                    value={data.neighborhood}
                    onChange={e => setData({...data, neighborhood: e.target.value})}
                  />
                  <SuggestionChips 
                    items={suggestions.neighborhood} 
                    loading={loadingSuggestions.neighborhood} 
                    onSelect={(val) => setData({...data, neighborhood: val})} 
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <button onClick={() => setStep(1)} className="flex-1 bg-slate-100 font-bold py-4 rounded-2xl text-slate-600">Voltar</button>
              <button 
                disabled={!data.city || !data.neighborhood}
                onClick={handleNext}
                className="flex-2 bg-emerald-600 text-white font-bold py-4 px-8 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
              >
                Próximo <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-in slide-in-from-right-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Home size={14} /> Tipo de Residência
              </label>
              <div className="grid grid-cols-3 gap-2">
                {RESIDENCE_TYPES.map(type => (
                  <button
                    key={type}
                    onClick={() => setData({...data, residenceType: type})}
                    className={`py-3 text-[11px] font-bold rounded-xl border transition-all ${
                      data.residenceType === type ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-100' : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
            <button 
              onClick={handleSubmit}
              className="w-full bg-emerald-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 mt-4 shadow-xl shadow-emerald-200"
            >
              Começar a Poupar! <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
      
      <div className="mt-auto flex justify-center gap-2 pb-6">
        {[1,2,3].map(s => (
          <div key={s} className={`h-1.5 rounded-full transition-all ${step === s ? 'w-8 bg-emerald-500' : 'w-2 bg-slate-200'}`}></div>
        ))}
      </div>
    </div>
  );
};

export default Onboarding;
