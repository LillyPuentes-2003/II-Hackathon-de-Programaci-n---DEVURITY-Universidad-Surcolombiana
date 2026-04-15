import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Trophy, MapPin, Heart, TrendingUp, Users, Package, Download } from 'lucide-react';
import { api } from '../services/api';
import * as XLSX from 'xlsx';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function Analytics() {
  const [requests, setRequests] = useState<any[]>([]);
  const [donations, setDonations] = useState<any[]>([]);

  useEffect(() => {
    api.getRequests().then(setRequests).catch(() => setRequests([]));
    api.getDonations().then(setDonations).catch(() => setDonations([]));
  }, []);

  // Top zonas con más solicitudes
  const topZones = requests.reduce((acc: any, req) => {
    acc[req.location] = (acc[req.location] || 0) + 1;
    return acc;
  }, {});

  const topZonesData = Object.entries(topZones)
    .map(([zone, count]) => ({ name: zone, solicitudes: count }))
    .sort((a: any, b: any) => b.solicitudes - a.solicitudes)
    .slice(0, 5);

  // Top donantes
  const topDonors = donations.reduce((acc: any, don) => {
    acc[don.userName] = (acc[don.userName] || 0) + 1;
    return acc;
  }, {});

  const topDonorsData = Object.entries(topDonors)
    .map(([name, count]) => ({ name, donaciones: count }))
    .sort((a: any, b: any) => (b.donaciones as number) - (a.donaciones as number))
    .slice(0, 10);

  // Distribución por tipo
  const typeDistribution = requests.reduce((acc: any, req) => {
    acc[req.type] = (acc[req.type] || 0) + 1;
    return acc;
  }, {});

  const typeData = Object.entries(typeDistribution)
    .map(([name, value]) => ({ name, value }));

  // Últimas donaciones
  const lastDonations = [...donations]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 5);

  // Filtrar donaciones del mes actual
  const now = new Date();
  const donacionesMes = donations.filter(don => {
    const fecha = new Date(don.timestamp);
    return fecha.getMonth() === now.getMonth() && fecha.getFullYear() === now.getFullYear();
  });

  // Exportar a Excel
  const exportarExcel = () => {
    const wb = XLSX.utils.book_new();

    // Hoja 1: Reporte de donantes del mes
    const donantesMesData = donacionesMes.map((don, i) => ({
      '#': i + 1,
      'Nombre Donante': don.userName,
      'Tipo de Donación': don.type,
      'Ubicación': don.location,
      'Fecha': new Date(don.timestamp).toLocaleDateString('es-CO'),
    }));

    const ws1 = XLSX.utils.json_to_sheet(
      donantesMesData.length > 0 ? donantesMesData : [{ 'Info': 'No hay donaciones este mes' }]
    );
    ws1['!cols'] = [{ wch: 5 }, { wch: 25 }, { wch: 20 }, { wch: 30 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, ws1, 'Donantes del Mes');

    // Hoja 2: Top 10 donantes
    const top10Data = topDonorsData.map((d: any, i) => ({
      'Posición': i + 1,
      'Nombre': d.name,
      'Total Donaciones': d.donaciones,
    }));
    const ws2 = XLSX.utils.json_to_sheet(
      top10Data.length > 0 ? top10Data : [{ 'Info': 'No hay donantes aún' }]
    );
    ws2['!cols'] = [{ wch: 10 }, { wch: 25 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, ws2, 'Top 10 Donantes');

    // Hoja 3: Zonas con mayor necesidad
    const zonasData = topZonesData.map((z: any, i) => ({
      'Posición': i + 1,
      'Zona': z.name,
      'Solicitudes': z.solicitudes,
    }));
    const ws3 = XLSX.utils.json_to_sheet(
      zonasData.length > 0 ? zonasData : [{ 'Info': 'No hay datos de zonas' }]
    );
    ws3['!cols'] = [{ wch: 10 }, { wch: 30 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, ws3, 'Zonas con Mayor Necesidad');

    // Hoja 4: Todas las solicitudes
    const solicitudesData = requests.map((req, i) => ({
      '#': i + 1,
      'ID': req.id,
      'Solicitante': req.userName,
      'Tipo': req.type,
      'Descripción': req.description,
      'Ubicación': req.location,
      'Urgencia': req.urgency,
      'Personas Afectadas': req.peopleAffected,
      'Estado': req.status,
      'Fecha': new Date(req.timestamp).toLocaleDateString('es-CO'),
    }));
    const ws4 = XLSX.utils.json_to_sheet(
      solicitudesData.length > 0 ? solicitudesData : [{ 'Info': 'No hay solicitudes' }]
    );
    ws4['!cols'] = [{ wch: 5 }, { wch: 10 }, { wch: 20 }, { wch: 15 }, { wch: 40 }, { wch: 25 }, { wch: 10 }, { wch: 20 }, { wch: 15 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, ws4, 'Todas las Solicitudes');

    // Descargar
    const mes = now.toLocaleString('es-CO', { month: 'long', year: 'numeric' });
    XLSX.writeFile(wb, `AyudaYA_Reporte_${mes}.xlsx`);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-black tracking-tight flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-primary" />
          Analytics & Estadísticas
        </h3>
        <button
          onClick={exportarExcel}
          className="flex items-center gap-2 px-5 py-3 bg-emerald-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-200 hover:bg-emerald-600 transition-all hover:scale-[1.02]"
        >
          <Download className="w-4 h-4" />
          Exportar Reporte Excel
        </button>
      </div>

      {/* Métricas rápidas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Solicitudes', value: requests.length, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Total Donaciones', value: donations.length, icon: Heart, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Zonas Activas', value: Object.keys(topZones).length, icon: MapPin, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Donantes Únicos', value: Object.keys(topDonors).length, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((m, i) => (
          <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className={`p-2 rounded-lg ${m.bg} ${m.color} w-fit mb-3`}>
              <m.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-black">{m.value}</p>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">{m.label}</p>
          </div>
        ))}
      </div>

      {/* Donaciones del mes */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            Donaciones del Mes — {now.toLocaleString('es-CO', { month: 'long', year: 'numeric' })}
          </h4>
          <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
            {donacionesMes.length} donaciones
          </span>
        </div>
        {donacionesMes.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-8">No hay donaciones este mes</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-2 px-3 text-xs font-black text-slate-500 uppercase tracking-widest">#</th>
                  <th className="text-left py-2 px-3 text-xs font-black text-slate-500 uppercase tracking-widest">Donante</th>
                  <th className="text-left py-2 px-3 text-xs font-black text-slate-500 uppercase tracking-widest">Tipo</th>
                  <th className="text-left py-2 px-3 text-xs font-black text-slate-500 uppercase tracking-widest">Zona</th>
                  <th className="text-left py-2 px-3 text-xs font-black text-slate-500 uppercase tracking-widest">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {donacionesMes.map((don, i) => (
                  <tr key={don.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="py-2 px-3 font-bold text-slate-400">{i + 1}</td>
                    <td className="py-2 px-3 font-bold">{don.userName}</td>
                    <td className="py-2 px-3 capitalize text-slate-600">{don.type}</td>
                    <td className="py-2 px-3 text-slate-600">{don.location}</td>
                    <td className="py-2 px-3 text-slate-500">{new Date(don.timestamp).toLocaleDateString('es-CO')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Top 10 Donantes */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h4 className="font-bold mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" /> Top 10 Donantes
        </h4>
        {topDonorsData.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-8">Aún no hay donaciones registradas</p>
        ) : (
          <div className="space-y-3">
            {topDonorsData.map((donor: any, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white ${i === 0 ? 'bg-amber-400' : i === 1 ? 'bg-slate-400' : i === 2 ? 'bg-amber-700' : 'bg-slate-200 text-slate-600'}`}>
                  {i + 1}
                </span>
                <span className="flex-1 text-sm font-bold">{donor.name}</span>
                <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-full">
                  {donor.donaciones as number} donaciones
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Zonas con más necesidad */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h4 className="font-bold mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" /> Zonas con Mayor Necesidad
        </h4>
        {topZonesData.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-8">Aún no hay solicitudes registradas</p>
        ) : (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topZonesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600 }} />
                <Tooltip />
                <Bar dataKey="solicitudes" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Distribución por tipo */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h4 className="font-bold mb-4">Distribución por Tipo de Ayuda</h4>
        {typeData.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-8">Aún no hay datos</p>
        ) : (
          <div className="h-48 flex items-center">
            <ResponsiveContainer width="60%" height="100%">
              <PieChart>
                <Pie data={typeData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                  {typeData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2">
              {typeData.map((d: any, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                  <span className="text-xs font-bold text-slate-500 capitalize">{d.name}</span>
                  <span className="text-xs font-bold text-slate-800">{d.value as number}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Últimas donaciones */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h4 className="font-bold mb-4 flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500" /> Últimas Donaciones
        </h4>
        {lastDonations.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-8">Aún no hay donaciones registradas</p>
        ) : (
          <div className="space-y-3">
            {lastDonations.map((don: any, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div>
                  <p className="text-sm font-bold">{don.userName}</p>
                  <p className="text-xs text-slate-500">{don.type} • {don.location}</p>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                  {new Date(don.timestamp).toLocaleDateString('es-CO')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
