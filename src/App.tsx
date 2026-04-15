/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, HandHelping, Search, MapPin, AlertCircle, CheckCircle2, 
  ArrowLeft, ChevronRight, Users, Clock, Utensils, Stethoscope, 
  Truck, Home, MoreHorizontal, Map as MapIcon, Shield, BarChart3,
  Phone, User as UserIcon, Camera, Filter, Navigation, Info,
  CheckCircle, XCircle, LayoutDashboard, ListFilter, Activity,
  Calendar, Package, Map as MapIcon2, ExternalLink
} from 'lucide-react';
import { 
  type View, type HelpType, type UrgencyLevel, type HelpRequest, type HelpOffer, 
  type UserRole, type RequestStatus, type User, type Availability 
} from './types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';

// --- Mock Data ---
const MOCK_REQUESTS: HelpRequest[] = [
  { id: 'REQ-001', userId: 'u1', userName: 'María García', type: 'alimentos', description: 'Necesitamos víveres para 3 familias en situación de calle.', location: 'Centro, Madrid', lat: 40.4168, lng: -3.7038, urgency: 'alta', peopleAffected: 12, status: 'pendiente', timestamp: Date.now() - 1000 * 60 * 30 },
  { id: 'REQ-002', userId: 'u2', userName: 'Juan Pérez', type: 'salud', description: 'Se requiere insulina para adulto mayor. Farmacias cerradas en la zona.', location: 'Barrio Norte', lat: 40.4233, lng: -3.6912, urgency: 'alta', peopleAffected: 1, status: 'asignada', assignedTo: 'v1', assignedName: 'Carlos Voluntario', timestamp: Date.now() - 1000 * 60 * 120 },
  { id: 'REQ-003', userId: 'u3', userName: 'Elena R.', type: 'transporte', description: 'Traslado urgente a centro médico para control prenatal.', location: 'Valencia Sur', lat: 39.4699, lng: -0.3763, urgency: 'media', peopleAffected: 2, status: 'en-camino', assignedTo: 'v2', assignedName: 'Ana Transp', timestamp: Date.now() - 1000 * 60 * 45 },
  { id: 'REQ-004', userId: 'u4', userName: 'Comedor Social', type: 'alimentos', description: 'Falta de gas para cocinar almuerzos de hoy.', location: 'Sevilla Este', lat: 37.3891, lng: -5.9845, urgency: 'alta', peopleAffected: 50, status: 'pendiente', timestamp: Date.now() - 1000 * 60 * 10 },
  { id: 'REQ-005', userId: 'u5', userName: 'Pedro S.', type: 'refugio', description: 'Familia desalojada busca refugio temporal por 2 noches.', location: 'Bilbao', lat: 43.2630, lng: -2.9350, urgency: 'media', peopleAffected: 4, status: 'en-revision', timestamp: Date.now() - 1000 * 60 * 300 },
];

const HELP_TYPE_ICONS: Record<HelpType, any> = {
  alimentos: Utensils,
  salud: Stethoscope,
  transporte: Truck,
  refugio: Home,
  otros: MoreHorizontal,
};

const URGENCY_COLORS: Record<UrgencyLevel, string> = {
  alta: 'bg-red-50 text-urgency-high border-red-100',
  media: 'bg-amber-50 text-urgency-medium border-amber-100',
  baja: 'bg-blue-50 text-urgency-low border-blue-100',
};

const STATUS_COLORS: Record<RequestStatus, string> = {
  pendiente: 'bg-slate-100 text-slate-600',
  'en-revision': 'bg-blue-100 text-blue-600',
  asignada: 'bg-purple-100 text-purple-600',
  'en-camino': 'bg-amber-100 text-amber-600',
  entregada: 'bg-emerald-100 text-emerald-600',
};

// --- Components ---

const Badge = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${className}`}>
    {children}
  </span>
);

const Card = ({ children, className, onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) => (
  <div 
    onClick={onClick}
    className={`bg-card-bg rounded-xl border border-border shadow-sm overflow-hidden ${onClick ? 'cursor-pointer hover:border-primary/30 transition-all' : ''} ${className || ''}`}
  >
    {children}
  </div>
);

export default function App() {
  const [view, setView] = useState<View>('splash');
  const [user, setUser] = useState<User | null>(null);
  const [requests, setRequests] = useState<HelpRequest[]>(MOCK_REQUESTS);
  const [selectedRequest, setSelectedRequest] = useState<HelpRequest | null>(null);
  const [filter, setFilter] = useState<HelpType | 'todos'>('todos');
  const [mapMode, setMapMode] = useState<'requests' | 'offers'>('requests');
  const [isSimulating, setIsSimulating] = useState(false);
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  // Splash timeout
  useEffect(() => {
    if (view === 'splash') {
      const timer = setTimeout(() => setView('landing'), 2500);
      return () => clearTimeout(timer);
    }
  }, [view]);

  // Notification timeout
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const handleNavigate = (newView: View) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setView(newView);
  };

  const simulateHelp = (requestId: string) => {
    setIsSimulating(true);
    // Simulate API delay
    setTimeout(() => {
      setRequests(prev => prev.map(req => 
        req.id === requestId 
          ? { ...req, status: 'asignada', assignedTo: 'me', assignedName: 'Tú (Voluntario)' } 
          : req
      ));
      setIsSimulating(false);
      setNotification({ message: '¡Misión asignada con éxito! Revisa los detalles de contacto.', type: 'success' });
      
      // Update selected request if it's the one we just helped
      if (selectedRequest?.id === requestId) {
        setSelectedRequest(prev => prev ? { ...prev, status: 'asignada', assignedTo: 'me', assignedName: 'Tú (Voluntario)' } : null);
      }
    }, 1500);
  };

  const filteredRequests = useMemo(() => {
    if (filter === 'todos') return requests;
    return requests.filter(r => r.type === filter);
  }, [filter, requests]);

  // --- Views ---

  const SplashView = () => (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-primary flex flex-col items-center justify-center z-[100]"
    >
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 12 }}
        className="text-center space-y-6"
      >
        <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
          <Heart className="w-12 h-12 text-primary fill-primary" />
        </div>
        <h1 className="text-4xl font-black text-white tracking-tighter">Ayuda<span className="text-secondary">YA</span></h1>
        <div className="flex gap-1 justify-center">
          {[0, 1, 2].map(i => (
            <motion.div 
              key={i}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              className="w-2 h-2 bg-white rounded-full"
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );

  const LandingView = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10 py-10">
      <div className="text-center space-y-6 max-w-2xl mx-auto">
        <h1 className="text-5xl font-extrabold text-text-main tracking-tight leading-tight">
          Conectamos ayuda con quien <span className="text-primary">más lo necesita</span>
        </h1>
        <p className="text-lg text-text-muted">
          La red solidaria en tiempo real que transforma la intención en acción directa.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
          <button onClick={() => handleNavigate('register')} className="px-8 py-4 bg-primary text-white rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all">
            Empezar ahora
          </button>
          <button onClick={() => handleNavigate('live-map')} className="px-8 py-4 bg-white text-primary border-2 border-primary/10 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
            <MapIcon className="w-5 h-5" />
            Ver mapa en vivo
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card onClick={() => handleNavigate('need-help-form')} className="p-8 bg-gradient-to-br from-white to-red-50/30 group">
          <AlertCircle className="w-12 h-12 text-urgency-high mb-6 group-hover:scale-110 transition-transform" />
          <h3 className="text-2xl font-bold mb-2">Necesito ayuda</h3>
          <p className="text-text-muted mb-6">Solicita alimentos, medicinas o servicios de emergencia para ti o tu comunidad.</p>
          <div className="flex items-center text-primary font-bold">Solicitar <ChevronRight className="w-4 h-4 ml-1" /></div>
        </Card>
        <Card onClick={() => handleNavigate('want-help-form')} className="p-8 bg-gradient-to-br from-white to-emerald-50/30 group">
          <HandHelping className="w-12 h-12 text-secondary mb-6 group-hover:scale-110 transition-transform" />
          <h3 className="text-2xl font-bold mb-2">Quiero ayudar</h3>
          <p className="text-text-muted mb-6">Ofrece recursos, tiempo o transporte para apoyar a quienes están cerca de ti.</p>
          <div className="flex items-center text-secondary font-bold">Ofrecer <ChevronRight className="w-4 h-4 ml-1" /></div>
        </Card>
      </div>
    </motion.div>
  );

  const RegisterView = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-md mx-auto py-12">
      <Card className="p-8">
        <h2 className="text-3xl font-bold mb-2">Registro rápido</h2>
        <p className="text-text-muted mb-8 text-sm font-medium">Únete a la red para empezar a conectar.</p>
        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleNavigate('landing'); }}>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Nombre completo</label>
            <input required type="text" className="w-full px-4 py-3 rounded-xl border border-border bg-slate-50 outline-none focus:border-primary transition-all" placeholder="Ej. Ana García" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Número de contacto</label>
            <input required type="tel" className="w-full px-4 py-3 rounded-xl border border-border bg-slate-50 outline-none focus:border-primary transition-all" placeholder="+34 600 000 000" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Tu rol principal</label>
            <div className="grid grid-cols-1 gap-2">
              {(['solicitante', 'donante', 'voluntario'] as UserRole[]).map(role => (
                <label key={role} className="flex items-center gap-3 p-4 rounded-xl border border-border hover:bg-slate-50 cursor-pointer transition-all has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                  <input type="radio" name="role" value={role} className="w-4 h-4 accent-primary" defaultChecked={role === 'solicitante'} />
                  <span className="text-sm font-bold capitalize">{role}</span>
                </label>
              ))}
            </div>
          </div>
          <button type="submit" className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg shadow-lg shadow-primary/10">
            Continuar
          </button>
        </form>
      </Card>
    </motion.div>
  );

  const NeedHelpFormView = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-2xl mx-auto py-8">
      <Card className="p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-red-50 rounded-2xl"><AlertCircle className="w-6 h-6 text-urgency-high" /></div>
          <div>
            <h2 className="text-2xl font-bold">Solicitar ayuda</h2>
            <p className="text-sm text-text-muted">Completa los detalles para recibir apoyo.</p>
          </div>
        </div>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={(e) => { e.preventDefault(); handleNavigate('request-confirmation'); }}>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Tipo de ayuda</label>
            <select className="w-full px-4 py-3 rounded-xl border border-border bg-slate-50 outline-none appearance-none">
              <option value="alimentos">Alimentos y Suministros</option>
              <option value="salud">Salud / Medicinas</option>
              <option value="transporte">Transporte / Logística</option>
              <option value="refugio">Refugio / Vivienda</option>
              <option value="otros">Otros</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Urgencia</label>
            <div className="flex gap-2">
              {(['baja', 'media', 'alta'] as UrgencyLevel[]).map(lvl => (
                <label key={lvl} className="flex-1">
                  <input type="radio" name="urgency" value={lvl} className="peer sr-only" defaultChecked={lvl === 'media'} />
                  <div className="py-3 text-center rounded-xl border border-border text-[10px] font-bold uppercase tracking-widest cursor-pointer peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:text-primary transition-all">
                    {lvl}
                  </div>
                </label>
              ))}
            </div>
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Descripción breve</label>
            <textarea className="w-full px-4 py-3 rounded-xl border border-border bg-slate-50 outline-none h-24 resize-none" placeholder="Describe qué necesitas y por qué es urgente..."></textarea>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Ubicación / Barrio</label>
            <div className="relative">
              <input type="text" className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-slate-50 outline-none" placeholder="Ej. Barrio Norte, Calle Luna" />
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Personas afectadas</label>
            <input type="number" className="w-full px-4 py-3 rounded-xl border border-border bg-slate-50 outline-none" placeholder="Ej. 4" />
          </div>
          <div className="md:col-span-2 flex flex-col sm:flex-row gap-4 pt-4">
            <button type="button" className="flex-1 py-3 border border-border rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-all">
              <Camera className="w-4 h-4" /> Subir evidencia
            </button>
            <button type="submit" className="flex-[2] py-4 bg-primary text-white rounded-xl font-bold text-lg shadow-lg shadow-primary/10">
              Enviar solicitud
            </button>
          </div>
        </form>
      </Card>
    </motion.div>
  );

  const ConfirmationView = () => (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md mx-auto py-16 text-center space-y-8">
      <div className="w-24 h-24 bg-emerald-100 text-secondary rounded-full flex items-center justify-center mx-auto shadow-xl shadow-emerald-100">
        <CheckCircle2 className="w-12 h-12" />
      </div>
      <div className="space-y-2">
        <h2 className="text-3xl font-black tracking-tight">¡Solicitud enviada!</h2>
        <p className="text-text-muted">Tu solicitud ha sido registrada con éxito y ya es visible para los voluntarios.</p>
      </div>
      <div className="p-4 bg-slate-50 rounded-2xl border border-border inline-block">
        <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest block mb-1">ID de solicitud</span>
        <span className="text-lg font-mono font-bold text-text-main">REQ-992-X</span>
      </div>
      <div className="flex flex-col gap-3">
        <button onClick={() => handleNavigate('request-status')} className="w-full py-4 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/10">
          Ver estado de mi solicitud
        </button>
        <button onClick={() => handleNavigate('live-map')} className="w-full py-4 border border-border text-text-main rounded-xl font-bold hover:bg-slate-50">
          Ver en el mapa
        </button>
      </div>
    </motion.div>
  );

  const RequestStatusView = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto py-8 space-y-6">
      <h2 className="text-2xl font-bold">Estado de mi solicitud</h2>
      <Card className="p-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-50 rounded-xl"><Utensils className="w-6 h-6 text-urgency-high" /></div>
            <div>
              <h4 className="font-bold">Canasta de Alimentos</h4>
              <p className="text-xs text-text-muted">Registrada el 14 Abr, 2026</p>
            </div>
          </div>
          <Badge className={STATUS_COLORS['en-camino']}>En camino</Badge>
        </div>
        
        <div className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
          {[
            { status: 'Pendiente', time: '10:30 AM', done: true },
            { status: 'En revisión', time: '10:45 AM', done: true },
            { status: 'Asignada', time: '11:15 AM', done: true, sub: 'Voluntario: Carlos V.' },
            { status: 'En camino', time: '11:30 AM', current: true },
            { status: 'Entregada', time: '--:--' },
          ].map((step, i) => (
            <div key={i} className="flex gap-6 relative z-10">
              <div className={`w-6 h-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center ${step.done ? 'bg-emerald-500' : step.current ? 'bg-amber-500 animate-pulse' : 'bg-slate-200'}`}>
                {step.done && <CheckCircle2 className="w-3 h-3 text-white" />}
              </div>
              <div>
                <p className={`text-sm font-bold ${step.current ? 'text-text-main' : 'text-text-muted'}`}>{step.status}</p>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">{step.time}</p>
                {step.sub && <p className="text-xs text-primary font-bold mt-1">{step.sub}</p>}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-10">
          <button className="flex-1 py-3 border border-border rounded-xl font-bold text-sm hover:bg-slate-50">Actualizar info</button>
          <button className="flex-1 py-3 border border-red-100 text-urgency-high rounded-xl font-bold text-sm hover:bg-red-50">Cancelar</button>
        </div>
      </Card>
    </motion.div>
  );

  const WantHelpFormView = () => (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="max-w-2xl mx-auto py-8">
      <Card className="p-8">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-emerald-50 rounded-2xl"><HandHelping className="w-6 h-6 text-secondary" /></div>
          <div>
            <h2 className="text-2xl font-bold">Ofrecer ayuda</h2>
            <p className="text-sm text-text-muted">Publica recursos o tiempo disponible.</p>
          </div>
        </div>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={(e) => { e.preventDefault(); handleNavigate('nearby-requests'); }}>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-text-muted">¿Qué puedes ofrecer?</label>
            <select className="w-full px-4 py-3 rounded-xl border border-border bg-slate-50 outline-none appearance-none">
              <option value="alimentos">Alimentos / Donaciones</option>
              <option value="salud">Atención Médica / Medicinas</option>
              <option value="transporte">Transporte / Logística</option>
              <option value="voluntariado">Tiempo / Voluntariado</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Disponibilidad</label>
            <select className="w-full px-4 py-3 rounded-xl border border-border bg-slate-50 outline-none appearance-none">
              <option value="inmediata">Inmediata</option>
              <option value="hoy">Hoy mismo</option>
              <option value="esta-semana">Esta semana</option>
            </select>
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Zona de cobertura / Ubicación</label>
            <div className="relative">
              <input type="text" className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-slate-50 outline-none" placeholder="Ej. Madrid Centro, Retiro" />
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            </div>
          </div>
          <div className="md:col-span-2 space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-text-muted">Detalles adicionales</label>
            <textarea className="w-full px-4 py-3 rounded-xl border border-border bg-slate-50 outline-none h-24 resize-none" placeholder="Ej. Tengo vehículo propio y puedo cargar hasta 200kg..."></textarea>
          </div>
          <button type="submit" className="md:col-span-2 py-4 bg-secondary text-white rounded-xl font-bold text-lg shadow-lg shadow-secondary/10">
            Publicar ayuda
          </button>
        </form>
      </Card>
    </motion.div>
  );

  const NearbyRequestsView = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Solicitudes cercanas</h2>
          <p className="text-sm text-text-muted font-medium">Hay 5 solicitudes urgentes en tu zona.</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-border shadow-sm overflow-x-auto scrollbar-hide">
          {['todos', 'alimentos', 'salud', 'transporte'].map(t => (
            <button key={t} onClick={() => setFilter(t as any)} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all capitalize ${filter === t ? 'bg-primary text-white shadow-md' : 'text-text-muted hover:bg-slate-50'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRequests.map((req, i) => {
          const Icon = HELP_TYPE_ICONS[req.type];
          return (
            <div key={req.id}>
              <Card onClick={() => { setSelectedRequest(req); handleNavigate('request-detail'); }} className="p-5 group">
                <div className="flex justify-between items-start mb-4">
                  <Badge className={URGENCY_COLORS[req.urgency]}>Urgencia {req.urgency}</Badge>
                  <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">hace 30 min</span>
                </div>
                <div className="flex gap-4 mb-6">
                  <div className="p-3 bg-slate-50 rounded-xl group-hover:bg-primary/5 transition-colors"><Icon className="w-6 h-6 text-text-muted group-hover:text-primary transition-colors" /></div>
                  <div>
                    <h4 className="font-bold text-lg leading-tight">{req.userName}</h4>
                    <p className="text-xs text-text-muted flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" /> {req.location} • 1.2 km</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 py-2.5 bg-primary text-white rounded-lg font-bold text-xs">Ayudar ahora</button>
                  <button className="px-4 py-2.5 border border-border rounded-lg font-bold text-xs hover:bg-slate-50">Detalle</button>
                </div>
              </Card>
            </div>
          );
        })}
      </div>
    </motion.div>
  );

  const RequestDetailView = () => {
    if (!selectedRequest) return <div className="py-20 text-center">No se ha seleccionado ninguna solicitud.</div>;
    return (
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="max-w-4xl mx-auto py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-8">
            <div className="flex justify-between items-start mb-6">
              <Badge className={URGENCY_COLORS[selectedRequest.urgency]}>Urgencia {selectedRequest.urgency}</Badge>
              <div className="flex items-center gap-2 text-text-muted text-xs font-bold uppercase tracking-widest"><Clock className="w-3 h-3" /> Publicado hace 1 hora</div>
            </div>
            <h2 className="text-3xl font-black mb-4">{selectedRequest.userName} necesita {selectedRequest.type}</h2>
            <p className="text-text-main leading-relaxed text-lg mb-8">{selectedRequest.description}</p>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-4 bg-slate-50 rounded-2xl border border-border">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest block mb-1">Impacto</span>
                <span className="text-lg font-bold">{selectedRequest.peopleAffected} personas afectadas</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-border">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest block mb-1">Ubicación</span>
                <span className="text-lg font-bold">{selectedRequest.location}</span>
              </div>
            </div>

            <div className="h-48 bg-slate-100 rounded-2xl border border-border mb-8 flex items-center justify-center overflow-hidden relative">
              <MapIcon2 className="w-12 h-12 text-slate-300" />
              <div className="absolute inset-0 bg-primary/5"></div>
              <div className="absolute bottom-4 right-4 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-border text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                <ExternalLink className="w-3 h-3" /> Ver en Google Maps
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={() => handleNavigate('assignment-confirmation')} className="flex-1 py-4 bg-primary text-white rounded-xl font-bold text-lg shadow-lg shadow-primary/10">Aceptar solicitud</button>
              <button onClick={() => handleNavigate('nearby-requests')} className="px-8 py-4 border border-border rounded-xl font-bold text-lg hover:bg-slate-50">Volver</button>
            </div>
          </Card>
        </div>
        <div className="space-y-6">
          <Card className="p-6">
            <h4 className="font-bold mb-4">Información del Solicitante</h4>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center border border-border"><UserIcon className="w-6 h-6 text-text-muted" /></div>
              <div>
                <p className="font-bold">{selectedRequest.userName}</p>
                <p className="text-xs text-emerald-600 font-bold">Perfil Verificado</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm"><span className="text-text-muted">Solicitudes previas</span> <span className="font-bold">2</span></div>
              <div className="flex justify-between text-sm"><span className="text-text-muted">Reputación</span> <span className="font-bold text-secondary">4.9/5</span></div>
            </div>
          </Card>
          <Card className="p-6 bg-primary/5 border-primary/10">
            <h4 className="font-bold mb-2 flex items-center gap-2 text-primary"><Info className="w-4 h-4" /> Consejos de seguridad</h4>
            <p className="text-xs text-primary/80 leading-relaxed">Siempre coordina la entrega en lugares públicos o con acompañamiento si es posible. Valida la identidad antes de proceder.</p>
          </Card>
        </div>
      </motion.div>
    );
  };

  const AssignmentConfirmationView = () => (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md mx-auto py-16 text-center space-y-8">
      <div className="w-24 h-24 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto shadow-xl shadow-primary/5">
        <Package className="w-12 h-12" />
      </div>
      <div className="space-y-2">
        <h2 className="text-3xl font-black tracking-tight">¡Misión Aceptada!</h2>
        <p className="text-text-muted">Has aceptado ayudar a María García. Los datos de contacto ya están disponibles.</p>
      </div>
      <Card className="p-6 text-left space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-text-muted uppercase tracking-widest">Contacto Directo</span>
          <button className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Phone className="w-4 h-4" /></button>
        </div>
        <p className="text-xl font-bold">+34 612 345 678</p>
        <div className="pt-4 border-t border-border">
          <span className="text-xs font-bold text-text-muted uppercase tracking-widest block mb-2">Ruta de entrega</span>
          <div className="flex items-center gap-3 text-sm font-bold"><MapPin className="w-4 h-4 text-primary" /> 1.2 km • Aprox. 15 min</div>
        </div>
      </Card>
      <div className="flex flex-col gap-3">
        <button className="w-full py-4 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/10">Iniciar entrega</button>
        <button className="w-full py-4 bg-secondary text-white rounded-xl font-bold shadow-lg shadow-secondary/10">Marcar como completada</button>
        <button onClick={() => handleNavigate('live-map')} className="w-full py-4 border border-border text-text-main rounded-xl font-bold hover:bg-slate-50">Volver al mapa</button>
      </div>
    </motion.div>
  );

  const LiveMapView = ({ requests, onHelp }: { requests: HelpRequest[], onHelp: (id: string) => void }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showLegend, setShowLegend] = useState(false);
    
    // Simulated User Location
    const userLoc = { lat: 40.4168, lng: -3.7038 };

    const filteredBySearch = useMemo(() => {
      return requests.filter(req => 
        (filter === 'todos' || req.type === filter) &&
        (req.userName.toLowerCase().includes(searchQuery.toLowerCase()) || 
         req.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
         req.location.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }, [searchQuery, filter, requests]);

    const stats = useMemo(() => {
      return {
        total: filteredBySearch.length,
        high: filteredBySearch.filter(r => r.urgency === 'alta').length,
        medium: filteredBySearch.filter(r => r.urgency === 'media').length,
      };
    }, [filteredBySearch]);

    return (
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
        className="fixed inset-0 top-[73px] z-0 flex flex-col md:flex-row bg-bg"
      >
        {/* Sidebar - Dashboard Style */}
        <aside className="hidden md:flex flex-col w-80 lg:w-96 border-r border-border bg-white z-10 shadow-xl">
          <div className="p-6 border-b border-border space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Dashboard
              </h3>
              <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100">En Vivo</Badge>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2 bg-slate-50 rounded-xl border border-border text-center">
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-tighter">Total</p>
                <p className="text-lg font-black text-text-main">{stats.total}</p>
              </div>
              <div className="p-2 bg-red-50 rounded-xl border border-red-100 text-center">
                <p className="text-[10px] font-bold text-urgency-high uppercase tracking-tighter">Alta</p>
                <p className="text-lg font-black text-urgency-high">{stats.high}</p>
              </div>
              <div className="p-2 bg-amber-50 rounded-xl border border-amber-100 text-center">
                <p className="text-[10px] font-bold text-urgency-medium uppercase tracking-tighter">Media</p>
                <p className="text-lg font-black text-urgency-medium">{stats.medium}</p>
              </div>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide bg-slate-50/30">
            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest px-2 mb-2">Solicitudes en tu zona</p>
            {filteredBySearch.map((req) => (
              <div key={req.id}>
                <Card 
                  onClick={() => setSelectedRequest(req)}
                  className={`p-4 transition-all border-l-4 group ${
                    selectedRequest?.id === req.id ? 'border-l-primary bg-primary/5 ring-1 ring-primary/10' : 'border-l-transparent hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <Badge className={URGENCY_COLORS[req.urgency]}>{req.urgency}</Badge>
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest flex items-center gap-1">
                      <Clock className="w-3 h-3" /> 30m
                    </span>
                  </div>
                  <h4 className="font-bold text-sm leading-tight mb-1 group-hover:text-primary transition-colors">{req.userName}</h4>
                  <p className="text-xs text-text-muted line-clamp-2 mb-3">{req.description}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-text-muted flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-primary" /> {req.location}
                    </span>
                    <span className="text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-full">
                      1.2 km
                    </span>
                  </div>
                </Card>
              </div>
            ))}
          </div>
          
          <div className="p-4 bg-white border-t border-border">
            <button 
              onClick={() => handleNavigate('need-help-form')}
              className="w-full py-4 bg-primary text-white rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:scale-[1.02] transition-all"
            >
              <AlertCircle className="w-5 h-5" />
              Publicar Emergencia
            </button>
          </div>
        </aside>

        {/* Main Map Area */}
        <div className="flex-1 relative bg-slate-100 overflow-hidden">
          {/* Map Simulation Background */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute inset-0 opacity-30" 
              style={{ 
                backgroundImage: `radial-gradient(#94a3b8 1px, transparent 1px)`,
                backgroundSize: '32px 32px'
              }} 
            />
            {/* Simulated Streets/Blocks */}
            <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 100 L1000 100 M0 300 L1000 300 M0 500 L1000 500 M0 700 L1000 700" stroke="#64748b" strokeWidth="20" fill="none" />
              <path d="M200 0 L200 1000 M400 0 L400 1000 M600 0 L600 1000 M800 0 L800 1000" stroke="#64748b" strokeWidth="20" fill="none" />
              <circle cx="400" cy="300" r="150" stroke="#64748b" strokeWidth="20" fill="none" />
            </svg>
          </div>

          {/* Route Simulation */}
          <AnimatePresence>
            {selectedRequest && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
                <motion.path
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  d={`M ${(userLoc.lng + 6) * 10}% ${(44 - userLoc.lat) * 10}% L ${(selectedRequest.lng + 6) * 10}% ${(44 - selectedRequest.lat) * 10}%`}
                  stroke="#2563eb"
                  strokeWidth="3"
                  strokeDasharray="8 8"
                  fill="none"
                />
              </svg>
            )}
          </AnimatePresence>
          
          {/* User Location Marker */}
          <div 
            className="absolute z-30 pointer-events-none"
            style={{ 
              left: `${(userLoc.lng + 6) * 10}%`, 
              top: `${(44 - userLoc.lat) * 10}%` 
            }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-primary/40 rounded-full animate-ping scale-[3]" />
              <div className="w-6 h-6 bg-primary rounded-full border-4 border-white shadow-xl relative z-10" />
            </div>
          </div>

          {/* Map Markers */}
          {filteredBySearch.map((req, i) => (
            <motion.div 
              key={req.id}
              initial={{ scale: 0, y: 20 }} 
              animate={{ scale: 1, y: 0 }} 
              transition={{ type: 'spring', damping: 12, delay: i * 0.05 }}
              className="absolute cursor-pointer z-20"
              style={{ 
                left: `${(req.lng + 6) * 10}%`, 
                top: `${(44 - req.lat) * 10}%` 
              }}
              onClick={() => setSelectedRequest(req)}
            >
              <div className="relative group">
                {/* Pulse effect for high urgency */}
                {req.urgency === 'alta' && (
                  <div className="absolute inset-0 bg-urgency-high/30 rounded-full animate-ping scale-150" />
                )}
                
                <div className={`w-10 h-10 rounded-2xl border-4 border-white shadow-2xl flex items-center justify-center transition-all group-hover:scale-110 group-hover:-translate-y-1 ${
                  selectedRequest?.id === req.id ? 'ring-4 ring-primary/30 scale-110 -translate-y-1' : ''
                } ${
                  req.urgency === 'alta' ? 'bg-urgency-high' : 
                  req.urgency === 'media' ? 'bg-urgency-medium' : 'bg-urgency-low'
                }`}>
                  {React.createElement(HELP_TYPE_ICONS[req.type], { className: "w-5 h-5 text-white" })}
                </div>
                
                {/* Tooltip on hover or selection */}
                <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-3 transition-all ${
                  selectedRequest?.id === req.id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'
                }`}>
                  <div className="bg-white px-3 py-2 rounded-xl shadow-2xl border border-border whitespace-nowrap">
                    <p className="text-[10px] font-black uppercase tracking-tighter text-text-muted mb-0.5">{req.type}</p>
                    <p className="text-xs font-bold text-text-main">{req.userName}</p>
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-white border-r border-b border-border rotate-45 -mt-1" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Top Controls Overlay */}
          <div className="absolute top-6 left-6 right-6 flex flex-col sm:flex-row gap-4 z-30">
            <div className="flex-1 max-w-md relative group">
              <div className="absolute inset-0 bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/40 -z-10" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-transparent rounded-2xl outline-none font-bold text-text-main placeholder:text-text-muted/60" 
                placeholder="Buscar por nombre, zona o necesidad..." 
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-primary transition-colors" />
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <div className="flex bg-white/80 backdrop-blur-xl p-1.5 rounded-2xl shadow-2xl border border-white/40">
                {['todos', 'alimentos', 'salud', 'transporte', 'refugio'].map(t => (
                  <button 
                    key={t}
                    onClick={() => setFilter(t as any)}
                    className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all capitalize whitespace-nowrap ${
                      filter === t ? 'bg-primary text-white shadow-lg' : 'text-text-muted hover:bg-white/40'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Map Legend */}
          <div className="absolute top-24 right-6 z-30 hidden lg:block">
            <button 
              onClick={() => setShowLegend(!showLegend)}
              className="bg-white/80 backdrop-blur-md p-3 rounded-xl shadow-xl border border-white/40 flex items-center gap-2 text-xs font-bold text-text-main"
            >
              <Info className="w-4 h-4 text-primary" />
              Leyenda
            </button>
            <AnimatePresence>
              {showLegend && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, x: 20 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9, x: 20 }}
                  className="mt-2 bg-white/90 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-white/40 space-y-3 w-48"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-urgency-high shadow-sm shadow-urgency-high/40" />
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Urgencia Alta</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-urgency-medium shadow-sm shadow-urgency-medium/40" />
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Urgencia Media</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-urgency-low shadow-sm shadow-urgency-low/40" />
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Urgencia Baja</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-primary shadow-sm shadow-primary/40" />
                    <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">Tu Ubicación</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Floating Action Buttons */}
          <div className="absolute bottom-8 right-8 flex flex-col gap-4 z-30">
            <button className="p-4 bg-white rounded-2xl shadow-2xl border border-border text-text-main hover:scale-110 transition-all group relative">
              <Navigation className="w-6 h-6 group-hover:text-primary transition-colors" />
              <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-text-main text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Mi Ubicación
              </span>
            </button>
            <button 
              onClick={() => handleNavigate('need-help-form')}
              className="p-4 bg-primary text-white rounded-2xl shadow-2xl shadow-primary/40 hover:scale-110 transition-all group relative"
            >
              <AlertCircle className="w-6 h-6" />
              <span className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-primary text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                Pedir Ayuda
              </span>
            </button>
          </div>

          {/* Selected Request Bottom Sheet (Mobile) / Detail Card (Desktop) */}
          <AnimatePresence>
            {selectedRequest && (
              <motion.div 
                initial={{ y: 100, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }} 
                exit={{ y: 100, opacity: 0 }}
                className="absolute bottom-8 left-8 right-8 md:left-auto md:w-[400px] z-40"
              >
                <Card className="p-6 relative shadow-2xl border-2 border-primary/10 bg-white/95 backdrop-blur-md">
                  <button 
                    onClick={() => setSelectedRequest(null)} 
                    className="absolute top-4 right-4 p-2 text-text-muted hover:text-text-main hover:bg-slate-100 rounded-full transition-all"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                  
                  <div className="flex items-start gap-4 mb-6">
                    <div className={`p-4 rounded-2xl shadow-inner ${URGENCY_COLORS[selectedRequest.urgency]}`}>
                      {React.createElement(HELP_TYPE_ICONS[selectedRequest.type], { className: "w-8 h-8" })}
                    </div>
                    <div className="pt-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-black text-xl tracking-tight">{selectedRequest.userName}</h4>
                        <Badge className={URGENCY_COLORS[selectedRequest.urgency]}>{selectedRequest.urgency}</Badge>
                      </div>
                      <p className="text-xs text-text-muted font-bold flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-primary" /> {selectedRequest.location} • 1.2 km de ti
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50/80 rounded-2xl p-4 mb-6 border border-border/50">
                    <p className="text-sm text-text-main leading-relaxed font-medium">
                      "{selectedRequest.description}"
                    </p>
                  </div>
                  
                  <div className="flex gap-3">
                    {selectedRequest.status === 'pendiente' ? (
                      <button 
                        onClick={() => onHelp(selectedRequest.id)} 
                        disabled={isSimulating}
                        className="flex-1 py-4 bg-primary text-white rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                      >
                        {isSimulating ? (
                          <>
                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                              <Activity className="w-4 h-4" />
                            </motion.div>
                            Procesando...
                          </>
                        ) : (
                          <>Aceptar y ayudar</>
                        )}
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleNavigate('request-detail')} 
                        className="flex-1 py-4 bg-secondary text-white rounded-2xl font-bold text-sm shadow-lg shadow-secondary/20 hover:opacity-90 transition-all"
                      >
                        Ver detalles de entrega
                      </button>
                    )}
                    <button className="p-4 border border-border rounded-2xl text-text-muted hover:bg-slate-50 transition-all">
                      <Phone className="w-5 h-5" />
                    </button>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    );
  };

  const AdminPanelView = () => {
    const data = [
      { name: 'Lun', solicitudes: 40, completadas: 24 },
      { name: 'Mar', solicitudes: 30, completadas: 13 },
      { name: 'Mie', solicitudes: 20, completadas: 98 },
      { name: 'Jue', solicitudes: 27, completadas: 39 },
      { name: 'Vie', solicitudes: 18, completadas: 48 },
      { name: 'Sab', solicitudes: 23, completadas: 38 },
      { name: 'Dom', solicitudes: 34, completadas: 43 },
    ];

    const pieData = [
      { name: 'Alimentos', value: 400 },
      { name: 'Salud', value: 300 },
      { name: 'Transporte', value: 300 },
      { name: 'Refugio', value: 200 },
    ];

    const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444'];

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 py-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-black tracking-tight">Panel Administrativo</h2>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white border border-border rounded-xl text-sm font-bold flex items-center gap-2"><ListFilter className="w-4 h-4" /> Exportar</button>
            <button className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold">Nuevo Reporte</button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Solicitudes Totales', value: '1,284', change: '+12%', icon: Activity, color: 'text-blue-600' },
            { label: 'Pendientes', value: '432', change: '-5%', icon: Clock, color: 'text-amber-600' },
            { label: 'Asignadas', value: '612', change: '+18%', icon: UserIcon, color: 'text-purple-600' },
            { label: 'Completadas', value: '240', change: '+24%', icon: CheckCircle, color: 'text-emerald-600' },
          ].map((m, i) => (
            <div key={i}>
              <Card className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-2 rounded-lg bg-slate-50 ${m.color}`}><m.icon className="w-5 h-5" /></div>
                  <span className={`text-xs font-bold ${m.change.startsWith('+') ? 'text-emerald-600' : 'text-red-600'}`}>{m.change}</span>
                </div>
                <h4 className="text-2xl font-black">{m.value}</h4>
                <p className="text-xs font-bold text-text-muted uppercase tracking-widest mt-1">{m.label}</p>
              </Card>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h4 className="font-bold mb-6 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-primary" /> Actividad Semanal</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fontWeight: 600, fill: '#64748b' }} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="solicitudes" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="completadas" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
          <Card className="p-6">
            <h4 className="font-bold mb-6 flex items-center gap-2"><LayoutDashboard className="w-5 h-5 text-secondary" /> Distribución por Tipo</h4>
            <div className="h-64 flex items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {pieData.map((d, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                    <span className="text-xs font-bold text-text-muted">{d.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </motion.div>
    );
  };

  // --- Main Render ---

  return (
    <div className="min-h-screen bg-bg text-text-main font-sans selection:bg-primary/10 selection:text-primary">
      <AnimatePresence>
        {view === 'splash' && <SplashView />}
      </AnimatePresence>

      {/* Navigation Header */}
      {view !== 'splash' && (
        <header className="sticky top-0 z-50 bg-card-bg border-b border-border px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <button 
              onClick={() => handleNavigate('landing')}
              className="flex items-center gap-2 group transition-all"
            >
              <span className="text-2xl font-extrabold tracking-tight text-primary">Ayuda<span className="text-secondary">YA</span></span>
            </button>
            
            <div className="flex items-center gap-4">
              <button onClick={() => handleNavigate('admin-panel')} className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-text-muted border border-border rounded-lg hover:bg-slate-50 transition-colors">
                <Shield className="w-3 h-3" /> Admin
              </button>
              {view !== 'landing' ? (
                <button 
                  onClick={() => handleNavigate('landing')}
                  className="text-sm font-semibold text-text-muted hover:text-text-main flex items-center gap-1 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Volver</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center border border-border">
                    <UserIcon className="w-4 h-4 text-text-muted" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
      )}

      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-6"
          >
            <div className={`p-4 rounded-2xl shadow-2xl border flex items-center gap-3 ${
              notification.type === 'success' ? 'bg-emerald-500 text-white border-emerald-400' : 'bg-red-500 text-white border-red-400'
            }`}>
              <CheckCircle2 className="w-6 h-6" />
              <p className="text-sm font-bold">{notification.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-6xl mx-auto px-6 pb-24 sm:pb-10">
        <AnimatePresence mode="wait">
          {view === 'landing' && <LandingView />}
          {view === 'register' && <RegisterView />}
          {view === 'need-help-form' && <NeedHelpFormView />}
          {view === 'request-confirmation' && <ConfirmationView />}
          {view === 'request-status' && <RequestStatusView />}
          {view === 'want-help-form' && <WantHelpFormView />}
          {view === 'nearby-requests' && <NearbyRequestsView />}
          {view === 'request-detail' && <RequestDetailView />}
          {view === 'assignment-confirmation' && <AssignmentConfirmationView />}
          {view === 'live-map' && <LiveMapView requests={requests} onHelp={simulateHelp} />}
          {view === 'admin-panel' && <AdminPanelView />}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation for Mobile */}
      {view !== 'splash' && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border px-6 py-3 flex justify-around items-center sm:hidden z-50">
          <button onClick={() => handleNavigate('landing')} className={`p-2 rounded-xl transition-all ${view === 'landing' ? 'text-primary bg-primary/5' : 'text-text-muted'}`}><Home className="w-6 h-6" /></button>
          <button onClick={() => handleNavigate('live-map')} className={`p-2 rounded-xl transition-all ${view === 'live-map' ? 'text-primary bg-primary/5' : 'text-text-muted'}`}><MapIcon className="w-6 h-6" /></button>
          <button onClick={() => handleNavigate('need-help-form')} className="p-3 bg-primary text-white rounded-2xl shadow-lg -mt-8 border-4 border-white"><AlertCircle className="w-6 h-6" /></button>
          <button onClick={() => handleNavigate('nearby-requests')} className={`p-2 rounded-xl transition-all ${view === 'nearby-requests' ? 'text-primary bg-primary/5' : 'text-text-muted'}`}><Users className="w-6 h-6" /></button>
          <button onClick={() => handleNavigate('admin-panel')} className={`p-2 rounded-xl transition-all ${view === 'admin-panel' ? 'text-primary bg-primary/5' : 'text-text-muted'}`}><BarChart3 className="w-6 h-6" /></button>
        </nav>
      )}
    </div>
  );
}
