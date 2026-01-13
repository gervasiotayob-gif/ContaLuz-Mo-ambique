
import React, { useState, useEffect, useMemo } from 'react';
import { AppScreen, Appliance, Recharge, Alert, UserProfile } from './types';
import { DEFAULT_TARIFF, DEFAULT_HISTORICAL_AVG, NAV_ITEMS } from './constants';
import Dashboard from './components/Dashboard';
import AppliancesScreen from './components/Appliances';
import HistoryScreen from './components/History';
import AlertsScreen from './components/Alerts';
import TipsScreen from './components/Tips';
import SettingsScreen from './components/Settings';
import Onboarding from './components/Onboarding';
import AutonomySimulator from './components/AutonomySimulator';
import { Zap, Sparkles } from 'lucide-react';

const SplashScreen: React.FC<{ onFinish: () => void }> = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 2500); 
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-[100] bg-emerald-600 flex flex-col items-center justify-center animate-in fade-in duration-500">
      <div className="flex flex-col items-center gap-4 animate-bounce duration-[2000ms]">
        <div className="bg-white p-6 rounded-3xl shadow-2xl">
          <Zap size={64} className="text-emerald-600 fill-emerald-600" />
        </div>
        <div className="text-center">
          <h1 className="text-4xl font-black text-white tracking-tighter">ContaLuz</h1>
          <p className="text-emerald-100 text-sm font-medium uppercase tracking-[0.2em] mt-1 opacity-80">Moçambique</p>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('dashboard');
  const [balance, setBalance] = useState<number>(0); 
  const [lastUpdate, setLastUpdate] = useState<string>(new Date().toISOString());
  const [isUpdating, setIsUpdating] = useState(false);
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [recharges, setRecharges] = useState<Recharge[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  
  const initialProfile: UserProfile = {
    name: '',
    address: '',
    province: 'Maputo Cidade',
    city: '',
    district: '',
    neighborhood: '',
    residenceType: 'Casa',
    residenceConfig: 'T2',
    tariffPerKWh: DEFAULT_TARIFF,
    historicalAvgKWh: DEFAULT_HISTORICAL_AVG,
    notificationsEnabled: true,
    onboardingCompleted: false,
    lowBalanceThresholdDays: 3,
    highConsumptionThresholdPercent: 30
  };

  const [profile, setProfile] = useState<UserProfile>(initialProfile);

  // Persist state to local storage
  useEffect(() => {
    const saved = localStorage.getItem('contaluz_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setBalance(parsed.balance !== undefined ? parsed.balance : 0);
        setLastUpdate(parsed.lastUpdate || new Date().toISOString());
        setRecharges(parsed.recharges || []);
        const loadedAppliances = (parsed.appliances || []).map((a: any) => ({
          ...a,
          quantity: a.quantity || 1
        }));
        setAppliances(loadedAppliances);
        if (parsed.profile) {
          setProfile(prev => ({ ...prev, ...parsed.profile }));
        }
      } catch (e) {
        console.error("Failed to parse local storage", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('contaluz_data', JSON.stringify({ balance, appliances, profile, lastUpdate, recharges }));
  }, [balance, appliances, profile, lastUpdate, recharges]);

  // Derived calculations
  const dailyKwh = useMemo(() => {
    return appliances
      .filter(a => a.isActive)
      .reduce((acc, a) => acc + (a.power * a.hoursPerDay * (a.quantity || 1) / 1000), 0);
  }, [appliances]);

  const dailyCost = dailyKwh * profile.tariffPerKWh;
  const autonomyDays = dailyCost > 0 ? Math.floor(balance / dailyCost) : (balance > 0 ? Infinity : 0);
  const consumptionDiffPercent = profile.historicalAvgKWh > 0 
    ? ((dailyKwh - profile.historicalAvgKWh) / profile.historicalAvgKWh) * 100 
    : 0;

  // New Recharge Function
  const handleRecharge = (amount: number) => {
    if (amount <= 0) return;
    
    const newRecharge: Recharge = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      amount: amount
    };
    
    setBalance(prev => prev + amount);
    setRecharges(prev => [newRecharge, ...prev]);
    
    // Alerta de confirmação
    const rechargeAlert: Alert = {
      id: `recharge-${Date.now()}`,
      title: 'Recarga Confirmada',
      description: `Foram adicionados ${amount.toFixed(2)} MT ao seu saldo com sucesso.`,
      type: 'info',
      date: new Date().toISOString(),
      isRead: false
    };
    setAlerts(prev => [rechargeAlert, ...prev]);
  };

  const handleUpdateData = async () => {
    setIsUpdating(true);
    await new Promise(resolve => setTimeout(resolve, 1800));

    const now = new Date();
    const last = new Date(lastUpdate);
    const diffMs = now.getTime() - last.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours > 0.01 && balance > 0) {
      const consumptionToDeductKwh = (dailyKwh / 24) * diffHours;
      const costToDeduct = consumptionToDeductKwh * profile.tariffPerKWh;
      setBalance(prev => Math.max(0, prev - costToDeduct));
    }

    setLastUpdate(now.toISOString());
    setIsUpdating(false);

    const syncAlert: Alert = {
      id: `sync-${now.getTime()}`,
      title: 'Sincronização Concluída',
      description: `Leitura do contador atualizada com sucesso às ${now.toLocaleTimeString()}.`,
      type: 'info',
      date: now.toISOString(),
      isRead: false
    };
    setAlerts(prev => [syncAlert, ...prev]);
  };

  useEffect(() => {
    const newAlerts: Alert[] = [];
    let shouldNotify = false;
    let notificationTitle = '';
    let notificationBody = '';

    if (autonomyDays < profile.lowBalanceThresholdDays && balance > 0) {
      notificationTitle = 'Energia Crítica!';
      notificationBody = `Sua energia dura menos de ${profile.lowBalanceThresholdDays} dias (${autonomyDays} restantes). Saldo atual: ${balance.toFixed(2)} MT.`;
      newAlerts.push({
        id: 'autonomy-low',
        title: notificationTitle,
        description: notificationBody,
        type: 'danger',
        date: new Date().toISOString(),
        isRead: false
      });
      shouldNotify = true;
    }

    if (consumptionDiffPercent > profile.highConsumptionThresholdPercent) {
      notificationTitle = 'Pico de Consumo!';
      notificationBody = `Seu uso subiu ${consumptionDiffPercent.toFixed(0)}%, excedendo seu limite de ${profile.highConsumptionThresholdPercent}%.`;
      newAlerts.push({
        id: 'high-consumption',
        title: notificationTitle,
        description: notificationBody,
        type: 'warning',
        date: new Date().toISOString(),
        isRead: false
      });
      shouldNotify = true;
    }

    setAlerts(prev => {
        const ids = new Set(prev.map(a => a.id));
        const toAdd = newAlerts.filter(na => !ids.has(na.id));
        if (shouldNotify && toAdd.length > 0 && profile.notificationsEnabled) {
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification(notificationTitle, { body: notificationBody });
          }
        }
        return [...toAdd, ...prev];
    });
  }, [autonomyDays, consumptionDiffPercent, profile.notificationsEnabled, profile.lowBalanceThresholdDays, profile.highConsumptionThresholdPercent, balance]);

  const handleLogout = () => {
    if (confirm("Tem certeza que deseja sair? Todos os seus dados locais serão apagados.")) {
      localStorage.removeItem('contaluz_data');
      setBalance(0);
      setAppliances([]);
      setRecharges([]);
      setProfile(initialProfile);
      setCurrentScreen('dashboard');
      setShowSplash(true);
    }
  };

  const completeOnboarding = (newProfile: UserProfile) => {
    setProfile(newProfile);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return (
          <>
            <Dashboard 
              balance={balance} 
              autonomyDays={autonomyDays} 
              dailyKwh={dailyKwh} 
              consumptionDiffPercent={consumptionDiffPercent}
              alerts={alerts.filter(a => !a.isRead)}
              onUpdateData={handleUpdateData}
              onRecharge={handleRecharge}
              isUpdating={isUpdating}
              lastUpdate={lastUpdate}
            />
            <button 
              onClick={() => setCurrentScreen('simulator')}
              className="mt-4 w-full bg-indigo-600 text-white p-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"
            >
              <Sparkles size={20} />
              Simulador de Autonomia
            </button>
          </>
        );
      case 'simulator':
        return <AutonomySimulator appliances={appliances} profile={profile} />;
      case 'appliances':
        return <AppliancesScreen appliances={appliances} setAppliances={setAppliances} dailyKwh={dailyKwh} tariffPerKWh={profile.tariffPerKWh} />;
      case 'history':
        return <HistoryScreen recharges={recharges} dailyKwh={dailyKwh} historicalAvg={profile.historicalAvgKWh} appliances={appliances} profile={profile} />;
      case 'alerts':
        return <AlertsScreen alerts={alerts} setAlerts={setAlerts} />;
      case 'tips':
        return <TipsScreen appliances={appliances} profile={profile} />;
      case 'settings':
        return <SettingsScreen profile={profile} setProfile={setProfile} balance={balance} setBalance={setBalance} onLogout={handleLogout} />;
      default:
        return <Dashboard balance={balance} autonomyDays={autonomyDays} dailyKwh={dailyKwh} consumptionDiffPercent={consumptionDiffPercent} alerts={alerts} onUpdateData={handleUpdateData} isUpdating={isUpdating} lastUpdate={lastUpdate} onRecharge={handleRecharge} />;
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-white shadow-xl relative overflow-hidden">
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      {!profile.onboardingCompleted && !showSplash && <Onboarding onComplete={completeOnboarding} />}
      
      <header className="bg-emerald-600 text-white p-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-2">
           {currentScreen !== 'dashboard' && (
             <button onClick={() => setCurrentScreen('dashboard')} className="p-1 hover:bg-emerald-700 rounded-lg">
               <Zap size={18} />
             </button>
           )}
           <h1 className="text-xl font-bold tracking-tight">ContaLuz</h1>
        </div>
        <div className="text-xs bg-emerald-500/50 px-2 py-1 rounded-full border border-white/20">
          Moçambique
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-24 p-4">
        {renderScreen()}
      </main>

      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white border-t border-slate-200 py-3 px-2 flex justify-around items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-50">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentScreen(item.id as AppScreen)}
            className={`flex flex-col items-center gap-1 transition-colors ${
              currentScreen === item.id ? 'text-emerald-600' : 'text-slate-400'
            }`}
          >
            {item.icon}
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default App;
