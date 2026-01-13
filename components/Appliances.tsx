
import React, { useState, useRef } from 'react';
// Fixed: Added Sparkles to the lucide-react imports
import { Plus, Trash2, CheckCircle, Circle, Save, Zap, Camera, Loader2, X, Check, Pencil, Layers, Info, HelpCircle, Search, Sparkles } from 'lucide-react';
import { Appliance } from '../types';
import { CATEGORIES, PRESET_APPLIANCES } from '../constants';
import { analyzeAppliancePlate } from '../services/geminiService';

interface AppliancesProps {
  appliances: Appliance[];
  setAppliances: React.Dispatch<React.SetStateAction<Appliance[]>>;
  dailyKwh: number;
  tariffPerKWh: number;
}

const AppliancesScreen: React.FC<AppliancesProps> = ({ appliances, setAppliances, dailyKwh, tariffPerKWh }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [showScanGuide, setShowScanGuide] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [newAppliance, setNewAppliance] = useState<Partial<Appliance>>({
    name: '',
    power: 0,
    hoursPerDay: 0,
    quantity: 1,
    category: 'Outros',
    isActive: true,
    model: '',
    voltage: ''
  });

  const dailyCost = dailyKwh * tariffPerKWh;

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const result = await analyzeAppliancePlate(base64);
        setScanResult(result);
        setIsScanning(false);
      };
    } catch (error) {
      alert("Erro ao processar imagem. Tente novamente.");
      setIsScanning(false);
    }
  };

  const confirmScan = () => {
    if (scanResult) {
      setNewAppliance({
        name: scanResult.suggestedName || '',
        power: scanResult.power || 0,
        hoursPerDay: 0,
        quantity: 1,
        category: 'Outros',
        isActive: true,
        model: scanResult.model || '',
        voltage: scanResult.voltage || ''
      });
      setScanResult(null);
      setIsAdding(true);
      setEditingId(null);
    }
  };

  const handleAddPreset = (preset: typeof PRESET_APPLIANCES[0]) => {
    const appliance: Appliance = {
      id: Math.random().toString(36).substr(2, 9),
      name: preset.name,
      power: preset.power,
      hoursPerDay: preset.hours,
      quantity: 1,
      category: preset.category,
      isActive: true
    };
    setAppliances(prev => [...prev, appliance]);
  };

  const startEditing = (appliance: Appliance) => {
    setNewAppliance({ ...appliance });
    setEditingId(appliance.id);
    setIsAdding(true);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setNewAppliance({ name: '', power: 0, hoursPerDay: 0, quantity: 1, category: 'Outros', isActive: true, model: '', voltage: '' });
  };

  const handleSave = () => {
    if (!newAppliance.name || !newAppliance.power) return;

    if (editingId) {
      setAppliances(prev => prev.map(a => a.id === editingId ? {
        ...a,
        name: newAppliance.name || '',
        power: Number(newAppliance.power) || 0,
        hoursPerDay: Number(newAppliance.hoursPerDay) || 0,
        quantity: Number(newAppliance.quantity) || 1,
        category: newAppliance.category || 'Outros',
        model: newAppliance.model,
        voltage: newAppliance.voltage
      } : a));
    } else {
      const appliance: Appliance = {
        id: Math.random().toString(36).substr(2, 9),
        name: newAppliance.name || 'Novo Aparelho',
        power: Number(newAppliance.power) || 0,
        hoursPerDay: Number(newAppliance.hoursPerDay) || 0,
        quantity: Number(newAppliance.quantity) || 1,
        category: newAppliance.category || 'Outros',
        isActive: true,
        model: newAppliance.model,
        voltage: newAppliance.voltage
      };
      setAppliances(prev => [...prev, appliance]);
    }

    handleCancel();
  };

  const toggleAppliance = (id: string) => {
    setAppliances(prev => prev.map(a => a.id === id ? { ...a, isActive: !a.isActive } : a));
  };

  const removeAppliance = (id: string) => {
    setAppliances(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Seus Aparelhos</h2>
          <p className="text-xs text-slate-500">Adicione o que você usa em casa.</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase font-bold text-slate-400">Total Diário</p>
          <div className="flex flex-col items-end">
            <p className="text-lg font-bold text-emerald-600 leading-none">{dailyKwh.toFixed(2)} kWh</p>
            <p className="text-sm font-medium text-slate-500">{dailyCost.toFixed(2)} MT</p>
          </div>
        </div>
      </div>

      {/* MODAL: GUIA DE ESCANEAMENTO */}
      {showScanGuide && (
        <div className="fixed inset-0 bg-slate-900/90 z-[70] backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="bg-emerald-600 p-6 text-white text-center relative">
              <button onClick={() => setShowScanGuide(false)} className="absolute top-4 right-4 bg-white/20 p-2 rounded-full"><X size={18}/></button>
              <div className="bg-white/20 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Search size={24} />
              </div>
              <h3 className="font-black text-lg">Guia de Escaneamento</h3>
              <p className="text-[10px] uppercase tracking-widest font-bold opacity-80 mt-1">Dica de Especialista</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Exemplo de Etiqueta Visual */}
              <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-4 relative">
                <div className="text-[8px] font-bold text-slate-400 mb-2 flex justify-between">
                   <span>ETIQUETA TÉCNICA (EXEMPLO)</span>
                   <Sparkles size={10} className="text-amber-500" />
                </div>
                <div className="space-y-1">
                  <div className="h-2 w-2/3 bg-slate-200 rounded"></div>
                  <div className="h-2 w-1/2 bg-slate-200 rounded"></div>
                  <div className="flex items-center gap-2 pt-2">
                    <div className="bg-emerald-100 px-2 py-1 rounded border border-emerald-200 animate-pulse">
                      <span className="text-[10px] font-black text-emerald-700">POWER: 1200W</span>
                    </div>
                    <div className="bg-blue-50 px-2 py-1 rounded border border-blue-200">
                      <span className="text-[10px] font-black text-blue-700">VOLTAGE: 220V</span>
                    </div>
                  </div>
                  <div className="h-2 w-3/4 bg-slate-200 rounded pt-4"></div>
                </div>
                {/* Pointer */}
                <div className="absolute -right-2 top-1/2 -translate-y-1/2 bg-white shadow-lg border border-slate-100 p-2 rounded-xl flex items-center gap-2 animate-bounce">
                  <div className="bg-amber-100 p-1 rounded-lg"><Zap size={12} className="text-amber-600"/></div>
                  <span className="text-[9px] font-bold text-slate-700">Foque nos Watts!</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center font-bold text-slate-500 text-xs shrink-0">1</div>
                  <p className="text-xs text-slate-600 leading-snug">Procure por um autocolante ou placa metálica no seu aparelho (geralmente <b>atrás</b> ou <b>por baixo</b>).</p>
                </div>
                <div className="flex gap-3">
                  <div className="bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center font-bold text-slate-500 text-xs shrink-0">2</div>
                  <p className="text-xs text-slate-600 leading-snug">Certifique-se de que a foto está bem iluminada e o texto da <b>Potência (W)</b> está legível.</p>
                </div>
              </div>

              <button 
                onClick={() => {
                  setShowScanGuide(false);
                  fileInputRef.current?.click();
                }}
                className="w-full bg-emerald-600 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-emerald-100"
              >
                <Camera size={18} />
                Entendi, Abrir Câmera
              </button>
            </div>
          </div>
        </div>
      )}

      {isScanning && (
        <div className="fixed inset-0 bg-white/90 z-[60] flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
          <div className="bg-emerald-100 p-4 rounded-full mb-4">
            <Loader2 className="animate-spin text-emerald-600" size={40} />
          </div>
          <h3 className="font-bold text-slate-800 text-lg">Analisando Placa...</h3>
          <p className="text-sm text-slate-500 mt-2">Nossa IA está extraindo os dados técnicos para você.</p>
        </div>
      )}

      {scanResult && (
        <div className="fixed inset-0 bg-slate-900/60 z-[60] flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl w-full max-w-xs p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-800">Detectado pela IA</h3>
              <button onClick={() => setScanResult(null)} className="text-slate-400"><X size={20}/></button>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 uppercase font-bold">Aparelho</span>
                <span className="text-slate-800 font-bold">{scanResult.suggestedName || 'Desconhecido'}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 uppercase font-bold">Potência</span>
                <span className="text-emerald-600 font-bold text-lg">{scanResult.power} W</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 uppercase font-bold">Tensão</span>
                <span className="text-slate-800 font-bold">{scanResult.voltage || '---'}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => setScanResult(null)}
                className="flex-1 py-3 text-sm font-bold text-slate-500 bg-slate-100 rounded-xl"
              >
                Tentar denovo
              </button>
              <button 
                onClick={confirmScan}
                className="flex-1 py-3 text-sm font-bold text-white bg-emerald-600 rounded-xl flex items-center justify-center gap-2"
              >
                <Check size={18} />
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {appliances.length === 0 ? (
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center">
            <Zap className="mx-auto text-slate-300 mb-2" size={32} />
            <p className="text-sm text-slate-400 font-medium">Nenhum aparelho cadastrado ainda.</p>
          </div>
        ) : (
          appliances.map(appliance => (
            <div 
              key={appliance.id} 
              className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
                appliance.isActive ? 'bg-white border-slate-200 shadow-sm' : 'bg-slate-50 border-slate-100 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <button onClick={() => toggleAppliance(appliance.id)}>
                  {appliance.isActive ? (
                    <CheckCircle className="text-emerald-500" size={24} />
                  ) : (
                    <Circle className="text-slate-300" size={24} />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {appliance.quantity > 1 && (
                      <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black px-1.5 py-0.5 rounded border border-emerald-200">
                        {appliance.quantity}x
                      </span>
                    )}
                    <h4 className="text-sm font-bold text-slate-700 truncate">{appliance.name}</h4>
                  </div>
                  <p className="text-[10px] text-slate-400 uppercase font-medium">
                    {appliance.power}W • {appliance.hoursPerDay}h/dia {appliance.voltage ? `• ${appliance.voltage}` : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => startEditing(appliance)}
                  className="text-slate-400 hover:text-emerald-600 p-2 transition-colors"
                >
                  <Pencil size={18} />
                </button>
                <button 
                  onClick={() => removeAppliance(appliance.id)}
                  className="text-red-400 hover:text-red-600 p-2 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {!isAdding ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => { setIsAdding(true); setEditingId(null); }}
              className="bg-emerald-600 text-white py-4 rounded-2xl font-bold flex flex-col items-center justify-center gap-2 shadow-lg shadow-emerald-100"
            >
              <Plus size={20} />
              <span className="text-xs uppercase">Manual</span>
            </button>
            
            <button 
              onClick={() => setShowScanGuide(true)}
              className="bg-slate-800 text-white py-4 rounded-2xl font-bold flex flex-col items-center justify-center gap-2 shadow-lg shadow-slate-200"
            >
              <Camera size={20} />
              <span className="text-xs uppercase">Escanear IA</span>
            </button>
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Sugestões Rápidas</h3>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_APPLIANCES.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAddPreset(preset)}
                  className="bg-white border border-slate-200 p-2 rounded-lg text-left hover:border-emerald-300 transition-colors"
                >
                  <p className="text-xs font-bold text-slate-700">{preset.name}</p>
                  <p className="text-[10px] text-slate-400">{preset.power}W</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xl animate-in zoom-in-95">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-800">{editingId ? 'Editar Aparelho' : 'Novo Aparelho'}</h3>
            <button onClick={handleCancel} className="text-slate-400"><X size={20}/></button>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase">Nome / Descrição</label>
              <input 
                type="text" 
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm focus:outline-emerald-500 text-slate-900"
                placeholder="Ex: Lâmpada LED"
                value={newAppliance.name}
                onChange={e => setNewAppliance(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                   <Layers size={10} /> Quant.
                </label>
                <input 
                  type="number" 
                  min="1"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm focus:outline-emerald-500 text-slate-900 font-black"
                  value={newAppliance.quantity || 1}
                  onChange={e => setNewAppliance(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                />
              </div>
              <div className="col-span-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Potência (W)</label>
                <input 
                  type="number" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm focus:outline-emerald-500 text-slate-900"
                  placeholder="Watts"
                  value={newAppliance.power || ''}
                  onChange={e => setNewAppliance(prev => ({ ...prev, power: Number(e.target.value) }))}
                />
              </div>
              <div className="col-span-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Horas/Dia</label>
                <input 
                  type="number" 
                  step="any"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm focus:outline-emerald-500 text-slate-900"
                  placeholder="Ex: 0.5"
                  value={newAppliance.hoursPerDay || ''}
                  onChange={e => setNewAppliance(prev => ({ ...prev, hoursPerDay: parseFloat(e.target.value) || 0 }))}
                />
                <p className="text-[8px] font-bold text-slate-400 mt-0.5 italic">Dica: 0.5 = 30 min</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Tensão (V)</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm focus:outline-emerald-500 text-slate-900"
                  placeholder="Ex: 220V"
                  value={newAppliance.voltage}
                  onChange={e => setNewAppliance(prev => ({ ...prev, voltage: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase">Categoria</label>
                <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm focus:outline-emerald-500 text-slate-900"
                  value={newAppliance.category}
                  onChange={e => setNewAppliance(prev => ({ ...prev, category: e.target.value }))}
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button 
              onClick={handleCancel}
              className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold"
            >
              Cancelar
            </button>
            <button 
              onClick={handleSave}
              className="flex-2 bg-emerald-600 text-white py-3 px-6 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-50"
            >
              {editingId ? <Check size={18} /> : <Save size={18} />}
              {editingId ? 'Atualizar' : 'Salvar'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppliancesScreen;
