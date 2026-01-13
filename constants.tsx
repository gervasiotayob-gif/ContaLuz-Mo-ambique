
import React from 'react';
import { LayoutDashboard, Zap, History, Bell, Lightbulb, Settings } from 'lucide-react';

export const DEFAULT_TARIFF = 8.0; // Average MT per kWh in Mozambique
export const DEFAULT_HISTORICAL_AVG = 5.0; // kWh per day

export const CATEGORIES = [
  'Iluminação',
  'Cozinha',
  'Climatização',
  'Lavanderia',
  'Eletrônicos',
  'Outros'
];

export const PRESET_APPLIANCES = [
  { name: 'Lâmpada LED', power: 9, hours: 6, category: 'Iluminação', quantity: 1 },
  { name: 'Geladeira', power: 150, hours: 24, category: 'Cozinha', quantity: 1 },
  { name: 'Televisão', power: 100, hours: 4, category: 'Eletrônicos', quantity: 1 },
  { name: 'Ar Condicionado', power: 1500, hours: 5, category: 'Climatização', quantity: 1 },
  { name: 'Ferro de Engomar', power: 1200, hours: 0.5, category: 'Lavanderia', quantity: 1 },
  { name: 'Micro-ondas', power: 800, hours: 0.3, category: 'Cozinha', quantity: 1 },
];

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Painel', icon: <LayoutDashboard size={20} /> },
  { id: 'appliances', label: 'Aparelhos', icon: <Zap size={20} /> },
  { id: 'history', label: 'Histórico', icon: <History size={20} /> },
  { id: 'alerts', label: 'Alertas', icon: <Bell size={20} /> },
  { id: 'tips', label: 'Dicas', icon: <Lightbulb size={20} /> },
  { id: 'settings', label: 'Ajustes', icon: <Settings size={20} /> },
];
