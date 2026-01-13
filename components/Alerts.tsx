
import React from 'react';
import { Bell, Trash2, Check, AlertTriangle, AlertOctagon, Info } from 'lucide-react';
import { Alert } from '../types';

interface AlertsProps {
  alerts: Alert[];
  setAlerts: React.Dispatch<React.SetStateAction<Alert[]>>;
}

const AlertsScreen: React.FC<AlertsProps> = ({ alerts, setAlerts }) => {
  const markAsRead = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, isRead: true } : a));
  };

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'danger': return <AlertOctagon size={20} className="text-red-500" />;
      case 'warning': return <AlertTriangle size={20} className="text-orange-500" />;
      default: return <Info size={20} className="text-blue-500" />;
    }
  };

  const getAlertBg = (type: string, isRead: boolean) => {
    if (isRead) return 'bg-white border-slate-100 opacity-60';
    switch (type) {
      case 'danger': return 'bg-red-50 border-red-100 shadow-sm';
      case 'warning': return 'bg-orange-50 border-orange-100 shadow-sm';
      default: return 'bg-blue-50 border-blue-100 shadow-sm';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Alertas & Notificações</h2>
          <p className="text-xs text-slate-500">Mantenha-se informado sobre o seu consumo.</p>
        </div>
        <Bell className="text-slate-300" size={24} />
      </div>

      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="text-center py-20 opacity-30">
            <Bell size={48} className="mx-auto mb-2" />
            <p className="font-medium">Nenhum alerta disponível.</p>
          </div>
        ) : (
          alerts.map(alert => (
            <div 
              key={alert.id} 
              className={`p-4 rounded-2xl border transition-all ${getAlertBg(alert.type, alert.isRead)}`}
            >
              <div className="flex gap-4">
                <div className="shrink-0 mt-1">
                  {getAlertIcon(alert.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h4 className={`text-sm font-bold truncate pr-2 ${alert.isRead ? 'text-slate-500' : 'text-slate-800'}`}>
                      {alert.title}
                    </h4>
                    <span className="text-[9px] text-slate-400 whitespace-nowrap mt-1">
                      {new Date(alert.date).toLocaleTimeString('pt-MZ', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className={`text-xs mt-1 leading-normal ${alert.isRead ? 'text-slate-400' : 'text-slate-600'}`}>
                    {alert.description}
                  </p>
                  
                  {!alert.isRead && (
                    <div className="flex gap-4 mt-3 pt-3 border-t border-black/5">
                      <button 
                        onClick={() => markAsRead(alert.id)}
                        className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 uppercase tracking-wider"
                      >
                        <Check size={14} />
                        Lido
                      </button>
                      <button 
                        onClick={() => removeAlert(alert.id)}
                        className="flex items-center gap-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider"
                      >
                        <Trash2 size={14} />
                        Excluir
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {alerts.length > 0 && (
        <button 
          onClick={() => setAlerts([])}
          className="w-full py-4 text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-red-500 transition-colors"
        >
          Limpar todos os alertas
        </button>
      )}
    </div>
  );
};

export default AlertsScreen;
