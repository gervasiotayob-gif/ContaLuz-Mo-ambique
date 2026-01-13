
import React, { useRef, useState } from 'react';
import { User, MapPin, Home, CreditCard, Bell, LogOut, ChevronRight, Zap, Camera, Check, Navigation, Layout, Sparkles, Info, HelpCircle, Phone, Globe, MessageSquare, X, ExternalLink, Headphones, AlertCircle, TrendingUp } from 'lucide-react';
import { UserProfile } from '../types';

interface SettingsProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  balance: number;
  setBalance: (v: number) => void;
  onLogout: () => void;
}

const RESIDENCE_TYPES = [
  'Casa',
  'Apartamento',
  'Vivenda',
  'Dependência',
  'Flat',
  'Outro'
];

const RESIDENCE_CONFIGS: Record<string, string[]> = {
  'Casa': ['T1', 'T2', 'T3', 'T4', 'Tipo 1', 'Tipo 2', 'Tipo 3', 'Outro'],
  'Apartamento': ['Studio', 'T1', 'T2', 'T3', 'Cobertura'],
  'Vivenda': ['T3', 'T4', 'T5', 'T6', 'Tipo 3', 'Tipo 4', 'Tipo 5+'],
  'Dependência': ['T0', 'T1', 'Suíte', 'Tipo 1'],
  'Flat': ['T1', 'T2', 'T3', 'Duplex'],
  'Outro': ['Padrão', 'Comercial', 'Misto']
};

const PROVINCES = [
  'Maputo Cidade',
  'Maputo Província',
  'Gaza',
  'Inhambane',
  'Sofala',
  'Manica',
  'Tete',
  'Zambézia',
  'Nampula',
  'Niassa',
  'Cabo Delgado'
];

const SettingsScreen: React.FC<SettingsProps> = ({ profile, setProfile, balance, setBalance, onLogout }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEDMModalOpen, setIsEDMModalOpen] = useState(false);

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfile(prev => ({
          ...prev,
          photoUrl: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const updateProfile = (field: keyof UserProfile, value: string | number | boolean) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTypeChange = (newType: string) => {
    const configs = RESIDENCE_CONFIGS[newType] || ['Padrão'];
    setProfile(prev => ({
      ...prev,
      residenceType: newType,
      residenceConfig: configs[0]
    }));
  };

  const toggleNotifications = async () => {
    const newState = !profile.notificationsEnabled;
    
    if (newState) {
      if (!("Notification" in window)) {
        alert("Este navegador não suporta notificações de sistema.");
        updateProfile('notificationsEnabled', true);
        return;
      }

      if (Notification.permission === "granted") {
        updateProfile('notificationsEnabled', true);
      } else if (Notification.permission !== "denied") {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          updateProfile('notificationsEnabled', true);
          new Notification("ContaLuz Ativado", { body: "Você agora receberá alertas de energia." });
        } else {
          alert("Acesso negado. Por favor, habilite as notificações manualmente nas configurações do navegador.");
        }
      } else {
        alert("Notificações estão bloqueadas no seu navegador. Desbloqueie-as para usar esta função.");
      }
    } else {
      updateProfile('notificationsEnabled', false);
    }
  };

  const currentConfigs = RESIDENCE_CONFIGS[profile.residenceType] || ['Padrão'];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 pb-10">
      <div>
        <h2 className="text-xl font-bold text-slate-800">Ajustes</h2>
        <p className="text-xs text-slate-500">Personalize seu perfil e residência.</p>
      </div>

      {/* EDM INTERACTION MODAL */}
      {isEDMModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            {/* Header EDM */}
            <div className="bg-orange-500 p-6 text-white relative">
              <button 
                onClick={() => setIsEDMModalOpen(false)}
                className="absolute top-4 right-4 bg-white/20 p-2 rounded-full hover:bg-white/30 transition-colors"
              >
                <X size={20} />
              </button>
              <h3 className="text-xl font-black italic tracking-tighter">EDM</h3>
              <p className="text-xs font-medium opacity-90 uppercase tracking-widest mt-1">Canais de Atendimento</p>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Entre em contacto com a Electricidade de Moçambique para reclamações, avarias ou informações oficiais.
              </p>

              <div className="space-y-2">
                {/* Linha do Cliente */}
                <a href="tel:800145145" className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-emerald-50 transition-colors group">
                  <div className="bg-emerald-100 p-2.5 rounded-xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Headphones size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Linha Grátis</p>
                    <p className="text-sm font-bold text-slate-800">800 145 145</p>
                  </div>
                  <ChevronRight size={16} className="ml-auto text-slate-300" />
                </a>

                {/* WhatsApp */}
                <a href="https://wa.me/25884145" target="_blank" className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-emerald-50 transition-colors group">
                  <div className="bg-emerald-100 p-2.5 rounded-xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">WhatsApp</p>
                    <p className="text-sm font-bold text-slate-800">+258 84 145</p>
                  </div>
                  <ChevronRight size={16} className="ml-auto text-slate-300" />
                </a>

                {/* Website */}
                <a href="https://www.edm.co.mz" target="_blank" className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-emerald-50 transition-colors group">
                  <div className="bg-emerald-100 p-2.5 rounded-xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Globe size={20} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Site Oficial</p>
                    <p className="text-sm font-bold text-slate-800">www.edm.co.mz</p>
                  </div>
                  <ChevronRight size={16} className="ml-auto text-slate-300" />
                </a>
              </div>

              <button 
                onClick={() => window.open('https://www.edm.co.mz', '_blank')}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-orange-100 transition-all flex items-center justify-center gap-2 mt-4"
              >
                Visitar Portal EDM
                <ExternalLink size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
        <div 
          onClick={handlePhotoClick}
          className="relative w-16 h-16 shrink-0 cursor-pointer group"
        >
          <div className="w-full h-full bg-slate-100 rounded-full flex items-center justify-center text-slate-400 border border-slate-200 overflow-hidden">
            {profile.photoUrl ? (
              <img src={profile.photoUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User size={32} />
            )}
          </div>
          <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <Camera size={18} className="text-white" />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-1 rounded-full border-2 border-white shadow-sm">
            <Camera size={10} />
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <input 
            type="text"
            className="w-full bg-transparent font-bold text-slate-800 text-lg focus:outline-none focus:border-b border-emerald-500/30"
            value={profile.name}
            placeholder="Seu nome"
            onChange={e => updateProfile('name', e.target.value)}
          />
          <p className="text-xs text-slate-500 truncate">
            {profile.residenceType} {profile.residenceConfig} • {profile.city}
          </p>
        </div>
      </div>

      {/* Localização Detalhada */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Navigation size={14} className="text-emerald-500" />
          Localização
        </h3>
        
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Província</label>
            <select 
              className="w-full text-xs text-slate-900 font-bold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-emerald-500 cursor-pointer"
              value={profile.province}
              onChange={e => updateProfile('province', e.target.value)}
            >
              {PROVINCES.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Cidade</label>
              <input 
                type="text"
                className="w-full text-xs text-slate-900 font-bold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-emerald-500"
                value={profile.city}
                onChange={e => updateProfile('city', e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase">Distrito</label>
              <input 
                type="text"
                className="w-full text-xs text-slate-900 font-bold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-emerald-500"
                value={profile.district}
                onChange={e => updateProfile('district', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase">Bairro</label>
            <input 
              type="text" 
              className="w-full text-xs text-slate-900 font-bold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-emerald-500"
              value={profile.neighborhood}
              onChange={e => updateProfile('neighborhood', e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* ALERT PREFERENCES (NEW) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Bell size={14} className="text-emerald-500" />
          Configuração de Alertas
        </h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                <AlertCircle size={12} className="text-red-500" />
                Aviso de Autonomia Crítica
              </label>
              <span className="text-xs font-black text-emerald-600">{profile.lowBalanceThresholdDays} dias</span>
            </div>
            <input 
              type="range"
              min="1"
              max="7"
              step="1"
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              value={profile.lowBalanceThresholdDays}
              onChange={e => updateProfile('lowBalanceThresholdDays', Number(e.target.value))}
            />
            <p className="text-[9px] text-slate-400 italic">Avisar quando restar menos de {profile.lowBalanceThresholdDays} dias de energia.</p>
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                <TrendingUp size={12} className="text-orange-500" />
                Alerta de Pico de Consumo
              </label>
              <span className="text-xs font-black text-emerald-600">{profile.highConsumptionThresholdPercent}%</span>
            </div>
            <input 
              type="range"
              min="10"
              max="100"
              step="5"
              className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              value={profile.highConsumptionThresholdPercent}
              onChange={e => updateProfile('highConsumptionThresholdPercent', Number(e.target.value))}
            />
            <p className="text-[9px] text-slate-400 italic">Avisar se o consumo diário subir mais de {profile.highConsumptionThresholdPercent}% vs sua média.</p>
          </div>
        </div>
      </div>

      {/* EDM SUPPORT BUTTON */}
      <div className="bg-orange-50 border border-orange-100 p-5 rounded-2xl space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold text-orange-900 uppercase tracking-widest flex items-center gap-2">
            <Headphones size={14} className="text-orange-500" />
            Suporte EDM
          </h3>
          <span className="text-[10px] bg-orange-200 text-orange-800 px-2 py-0.5 rounded-full font-bold">Oficial</span>
        </div>
        <p className="text-[11px] text-orange-800 leading-normal">
          Precisa comunicar uma avaria ou consultar o seu saldo oficial na rede? Use os canais directos da EDM.
        </p>
        <button 
          onClick={() => setIsEDMModalOpen(true)}
          className="w-full bg-white border border-orange-200 py-3 rounded-xl font-bold text-sm text-orange-600 flex items-center justify-center gap-2 hover:bg-orange-100 transition-colors"
        >
          <MessageSquare size={16} />
          Interagir com a EDM
        </button>
      </div>

      {/* Residence Config */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-5">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <Home size={14} className="text-emerald-500" />
            Configuração do Imóvel
          </h3>
          <Sparkles size={14} className="text-amber-400" />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase">Categoria</label>
          <div className="grid grid-cols-3 gap-2">
            {RESIDENCE_TYPES.map(type => (
              <button
                key={type}
                onClick={() => handleTypeChange(type)}
                className={`py-2 px-1 text-[11px] font-bold rounded-lg border transition-all ${
                  profile.residenceType === type 
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-100' 
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
            Sugestões para {profile.residenceType}
          </label>
          <div className="flex flex-wrap gap-2">
            {currentConfigs.map(config => (
              <button
                key={config}
                onClick={() => updateProfile('residenceConfig', config)}
                className={`flex items-center gap-1.5 py-2 px-3 rounded-full text-xs font-medium border transition-all ${
                  profile.residenceConfig === config
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                    : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                {profile.residenceConfig === config && <Check size={12} />}
                {config}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Finances & Notifications */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Finanças & Notificações</h3>
        
        <div className="bg-white border border-slate-100 rounded-xl px-4 py-3 flex justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="text-emerald-500"><CreditCard size={20} /></div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-slate-700">Tarifa EDM</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="number"
              step="0.1"
              className="w-20 text-right text-xs text-slate-900 font-bold bg-slate-50 border border-slate-200 rounded px-2 py-1.5 focus:outline-emerald-500"
              value={profile.tariffPerKWh}
              onChange={e => updateProfile('tariffPerKWh', Number(e.target.value))}
            />
            <span className="text-[10px] font-bold text-slate-400">MT</span>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-xl px-4 py-3 flex justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="text-emerald-500"><Zap size={20} /></div>
            <span className="text-sm font-medium text-slate-700">Saldo Atual (MT)</span>
          </div>
          <input 
            type="number"
            className="w-24 text-right text-xs text-slate-900 font-bold bg-slate-50 border border-slate-200 rounded px-2 py-1.5 focus:outline-emerald-500"
            value={balance}
            onChange={e => setBalance(Number(e.target.value))}
          />
        </div>

        <div className="bg-white border border-slate-100 rounded-xl px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="text-emerald-500"><Bell size={20} /></div>
            <span className="text-sm font-medium text-slate-700">Notificações Push</span>
          </div>
          <button 
            onClick={toggleNotifications}
            className={`w-12 h-6 rounded-full relative transition-all duration-300 outline-none ${profile.notificationsEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300 ${profile.notificationsEnabled ? 'translate-x-7' : 'translate-x-1'}`}></div>
          </button>
        </div>
      </div>

      <button 
        onClick={onLogout}
        className="w-full mt-6 py-4 flex items-center justify-center gap-2 text-red-500 font-bold text-sm bg-red-50 rounded-2xl hover:bg-red-100 transition-colors"
      >
        <LogOut size={18} />
        Sair da Conta
      </button>

      <p className="text-[10px] text-center text-slate-400 uppercase tracking-widest pt-4">Versão MVP 1.3.1 • ContaLuz • Mozambique</p>
    </div>
  );
};

export default SettingsScreen;
