import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Building2, User, Award, Download, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import jsPDF from 'jspdf';

interface Donante {
  id: string;
  nombre: string;
  nit: string;
  tipo: 'empresa' | 'persona';
  donaciones: number;
  monto: number;
  ubicacion: string;
  email: string;
}

// Datos mock de donantes
const DONANTES_MOCK: Donante[] = [
  { id: 'D001', nombre: 'Constructora Andina S.A.S', nit: '900.123.456-7', tipo: 'empresa', donaciones: 8, monto: 8000000, ubicacion: 'Neiva, Huila', email: 'contacto@constructoraandina.com' },
  { id: 'D002', nombre: 'Supermercados El Huila', nit: '800.456.789-1', tipo: 'empresa', donaciones: 6, monto: 6000000, ubicacion: 'Neiva, Huila', email: 'gerencia@superhuila.com' },
  { id: 'D003', nombre: 'Carlos Méndez Ortiz', nit: '1.075.234.567', tipo: 'persona', donaciones: 5, monto: 5000000, ubicacion: 'Neiva, Huila', email: 'carlos.mendez@gmail.com' },
  { id: 'D004', nombre: 'Farmacia Central Ltda', nit: '900.789.123-4', tipo: 'empresa', donaciones: 3, monto: 3000000, ubicacion: 'Pitalito, Huila', email: 'info@farmaciacentral.com' },
  { id: 'D005', nombre: 'Laura Torres Vega', nit: '1.075.987.654', tipo: 'persona', donaciones: 2, monto: 2000000, ubicacion: 'Neiva, Huila', email: 'laura.torres@gmail.com' },
  { id: 'D006', nombre: 'Distribuidora Norte S.A', nit: '900.321.654-9', tipo: 'empresa', donaciones: 7, monto: 7000000, ubicacion: 'Neiva, Huila', email: 'ventas@distribnorte.com' },
];

export default function CertificacionIA() {
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState<Donante[]>([]);
  const [donanteSeleccionado, setDonanteSeleccionado] = useState<Donante | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [generando, setGenerando] = useState(false);

  useEffect(() => {
    if (busqueda.trim().length < 2) {
      setResultados([]);
      return;
    }
    const filtrados = DONANTES_MOCK.filter(d =>
      d.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      d.nit.includes(busqueda)
    );
    setResultados(filtrados);
  }, [busqueda]);

  const abrirModal = (donante: Donante) => {
    setDonanteSeleccionado(donante);
    setMostrarModal(true);
    setBusqueda('');
    setResultados([]);
  };

  const cerrarModal = () => {
    setMostrarModal(false);
    setDonanteSeleccionado(null);
  };

  const generarPDF = async () => {
    if (!donanteSeleccionado) return;
    setGenerando(true);

    await new Promise(r => setTimeout(r, 1500));

    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const fecha = new Date().toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
    const montoEquivalente = donanteSeleccionado.donaciones * 1000000;

    // Fondo header
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, pageW, 45, 'F');

    // Título header
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('AyudaYA', pageW / 2, 18, { align: 'center' });

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Plataforma Solidaria — Universidad Surcolombiana', pageW / 2, 26, { align: 'center' });

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.text('CERTIFICADO DE DONACIÓN TRIBUTARIA', pageW / 2, 36, { align: 'center' });

    // Línea decorativa verde
    doc.setFillColor(16, 185, 129);
    doc.rect(0, 45, pageW, 3, 'F');

    // Número de certificado
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const numeroCert = `CERT-${Date.now().toString().slice(-8)}`;
    doc.text(`No. Certificado: ${numeroCert}`, 20, 56);
    doc.text(`Fecha de emisión: ${fecha}`, pageW - 20, 56, { align: 'right' });

    // Texto principal
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');

    const texto1 = `La plataforma AyudaYA, desarrollada en el marco del II Hackathon de`;
    const texto2 = `Programación de la Universidad Surcolombiana — DEVURITY, certifica que:`;
    doc.text(texto1, pageW / 2, 70, { align: 'center' });
    doc.text(texto2, pageW / 2, 77, { align: 'center' });

    // Nombre del donante destacado
    doc.setFillColor(239, 246, 255);
    doc.roundedRect(20, 84, pageW - 40, 28, 4, 4, 'F');
    doc.setDrawColor(37, 99, 235);
    doc.setLineWidth(0.5);
    doc.roundedRect(20, 84, pageW - 40, 28, 4, 4, 'S');

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235);
    doc.text(donanteSeleccionado.nombre, pageW / 2, 96, { align: 'center' });

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`NIT / Cédula: ${donanteSeleccionado.nit}`, pageW / 2, 104, { align: 'center' });

    // Texto de certificación
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');

    const parrafo = `ha realizado ${donanteSeleccionado.donaciones} donaciones verificadas a través de la plataforma AyudaYA, contribuyendo activamente al bienestar de la comunidad urbana vulnerable de Neiva, Huila. En cumplimiento de los parámetros establecidos por la plataforma, donde cada donación equivale a $1.000.000 COP, se certifica que el aporte total acumulado es de:`;

    const lines = doc.splitTextToSize(parrafo, pageW - 40);
    doc.text(lines, 20, 122);

    // Monto destacado
    doc.setFillColor(16, 185, 129);
    doc.roundedRect(20, 148, pageW - 40, 22, 4, 4, 'F');

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(`$ ${montoEquivalente.toLocaleString('es-CO')} COP`, pageW / 2, 162, { align: 'center' });

    // Texto tributario
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const parrafo2 = `Este certificado podrá ser utilizado como soporte de deducción tributaria ante la DIAN, en cumplimiento del Artículo 125 del Estatuto Tributario de Colombia, que permite a personas naturales y jurídicas deducir de su renta las donaciones efectuadas a entidades sin ánimo de lucro y programas de beneficio social debidamente certificados.`;
    const lines2 = doc.splitTextToSize(parrafo2, pageW - 40);
    doc.text(lines2, 20, 182);

    // Tabla de detalle
    doc.setFillColor(248, 250, 252);
    doc.rect(20, 210, pageW - 40, 40, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(20, 210, pageW - 40, 40, 'S');

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('DETALLE DEL DONANTE', 25, 218);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text(`Nombre / Razón Social:`, 25, 226);
    doc.setFont('helvetica', 'bold');
    doc.text(donanteSeleccionado.nombre, 80, 226);

    doc.setFont('helvetica', 'normal');
    doc.text(`NIT / Cédula:`, 25, 233);
    doc.setFont('helvetica', 'bold');
    doc.text(donanteSeleccionado.nit, 80, 233);

    doc.setFont('helvetica', 'normal');
    doc.text(`Total donaciones:`, 25, 240);
    doc.setFont('helvetica', 'bold');
    doc.text(`${donanteSeleccionado.donaciones} donaciones`, 80, 240);

    doc.setFont('helvetica', 'normal');
    doc.text(`Monto certificado:`, 25, 247);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(16, 185, 129);
    doc.text(`$ ${montoEquivalente.toLocaleString('es-CO')} COP`, 80, 247);

    // Firmas
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.5);
    doc.line(30, 272, 90, 272);
    doc.line(pageW - 90, 272, pageW - 30, 272);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Representante Legal AyudaYA', 60, 277, { align: 'center' });
    doc.text('Director Plataforma Solidaria', pageW - 60, 277, { align: 'center' });

    // Footer
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 283, pageW, 14, 'F');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text('AyudaYA © 2026 — II Hackathon de Programación DEVURITY — Universidad Surcolombiana', pageW / 2, 291, { align: 'center' });

    // Descargar
    doc.save(`Certificado_Tributario_${donanteSeleccionado.nombre.replace(/\s/g, '_')}_AyudaYA.pdf`);
    setGenerando(false);
  };

  const puedeDescargar = donanteSeleccionado ? donanteSeleccionado.donaciones >= 5 : false;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-black tracking-tight flex items-center gap-2">
          <FileText className="w-6 h-6 text-primary" />
          Certificados Tributarios
        </h3>
        <p className="text-sm text-slate-500 mt-1">
          Busca por NIT o nombre de empresa/persona para generar el certificado de donación tributaria.
        </p>
      </div>

      {/* Buscador */}
      <div className="relative">
        <div className="flex items-center gap-3 bg-white border-2 border-slate-200 rounded-2xl px-4 py-3 focus-within:border-primary transition-all shadow-sm">
          <Search className="w-5 h-5 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="flex-1 outline-none text-sm font-medium text-slate-800 placeholder:text-slate-400 bg-transparent"
            placeholder="Buscar por nombre o NIT (ej: Constructora, 900.123...)"
          />
          {busqueda && (
            <button onClick={() => { setBusqueda(''); setResultados([]); }} className="p-1 hover:bg-slate-100 rounded-full transition-all">
              <X className="w-4 h-4 text-slate-400" />
            </button>
          )}
        </div>

        {/* Resultados */}
        <AnimatePresence>
          {resultados.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 overflow-hidden"
            >
              {resultados.map((donante) => (
                <button
                  key={donante.id}
                  onClick={() => abrirModal(donante)}
                  className="w-full flex items-center gap-4 p-4 hover:bg-slate-50 transition-all border-b border-slate-100 last:border-0"
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${donante.tipo === 'empresa' ? 'bg-blue-50' : 'bg-emerald-50'}`}>
                    {donante.tipo === 'empresa'
                      ? <Building2 className="w-5 h-5 text-blue-600" />
                      : <User className="w-5 h-5 text-emerald-600" />
                    }
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-bold text-sm text-slate-800">{donante.nombre}</p>
                    <p className="text-xs text-slate-500">NIT: {donante.nit} • {donante.donaciones} donaciones</p>
                  </div>
                  {donante.donaciones >= 5
                    ? <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Apto</span>
                    : <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-full">No apto</span>
                  }
                </button>
              ))}
            </motion.div>
          )}
          {busqueda.length >= 2 && resultados.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl z-50 p-6 text-center">
              <p className="text-sm text-slate-500">No se encontraron resultados para "<strong>{busqueda}</strong>"</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Lista de todos los donantes */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Todos los donantes registrados</p>
        </div>
        <div className="divide-y divide-slate-100">
          {DONANTES_MOCK.map((donante) => (
            <div key={donante.id} className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-all">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${donante.tipo === 'empresa' ? 'bg-blue-50' : 'bg-emerald-50'}`}>
                {donante.tipo === 'empresa'
                  ? <Building2 className="w-5 h-5 text-blue-600" />
                  : <User className="w-5 h-5 text-emerald-600" />
                }
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-slate-800 truncate">{donante.nombre}</p>
                <p className="text-xs text-slate-500">NIT: {donante.nit} • {donante.ubicacion}</p>
              </div>
              <div className="text-center flex-shrink-0">
                <p className="text-lg font-black text-slate-800">{donante.donaciones}</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest">donaciones</p>
              </div>
              {donante.donaciones >= 5
                ? <button onClick={() => abrirModal(donante)} className="px-3 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all flex items-center gap-1.5">
                    <Award className="w-3 h-3" /> Ver detalle
                  </button>
                : <span className="px-3 py-2 bg-slate-100 text-slate-400 rounded-xl text-xs font-bold">
                    {5 - donante.donaciones} faltan
                  </span>
              }
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {mostrarModal && donanteSeleccionado && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-6"
            onClick={(e) => { if (e.target === e.currentTarget) cerrarModal(); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              {/* Header modal */}
              <div className="bg-gradient-to-r from-primary to-blue-700 p-6 text-white relative">
                <button onClick={cerrarModal} className="absolute top-4 right-4 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-all">
                  <X className="w-4 h-4" />
                </button>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 ${donanteSeleccionado.tipo === 'empresa' ? 'bg-white/20' : 'bg-white/20'}`}>
                  {donanteSeleccionado.tipo === 'empresa'
                    ? <Building2 className="w-6 h-6 text-white" />
                    : <User className="w-6 h-6 text-white" />
                  }
                </div>
                <h3 className="text-xl font-black">{donanteSeleccionado.nombre}</h3>
                <p className="text-blue-200 text-sm">NIT / Cédula: {donanteSeleccionado.nit}</p>
              </div>

              {/* Cuerpo modal */}
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 rounded-2xl p-4 text-center">
                    <p className="text-3xl font-black text-primary">{donanteSeleccionado.donaciones}</p>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Donaciones</p>
                  </div>
                  <div className="bg-emerald-50 rounded-2xl p-4 text-center">
                    <p className="text-xl font-black text-emerald-600">${(donanteSeleccionado.donaciones * 1000000).toLocaleString('es-CO')}</p>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Monto equivalente</p>
                  </div>
                </div>

                <div className="space-y-2">
                  {[
                    { label: 'Tipo', value: donanteSeleccionado.tipo === 'empresa' ? 'Empresa / Organización' : 'Persona Natural' },
                    { label: 'Ubicación', value: donanteSeleccionado.ubicacion },
                    { label: 'Correo', value: donanteSeleccionado.email },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{item.label}</span>
                      <span className="text-sm font-bold text-slate-800">{item.value}</span>
                    </div>
                  ))}
                </div>

                {/* Estado del certificado */}
                {puedeDescargar ? (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-emerald-700">Apto para certificado tributario</p>
                      <p className="text-xs text-emerald-600 mt-0.5">Con {donanteSeleccionado.donaciones} donaciones, equivale a ${(donanteSeleccionado.donaciones * 1000000).toLocaleString('es-CO')} COP deducibles.</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-amber-700">No cumple el mínimo requerido</p>
                      <p className="text-xs text-amber-600 mt-0.5">Necesita {5 - donanteSeleccionado.donaciones} donación(es) más para habilitar el certificado tributario.</p>
                    </div>
                  </div>
                )}

                {/* Botón descarga */}
                <button
                  onClick={generarPDF}
                  disabled={!puedeDescargar || generando}
                  className={`w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                    puedeDescargar
                      ? 'bg-primary text-white shadow-lg shadow-primary/20 hover:bg-blue-700'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {generando ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Generando certificado...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      {puedeDescargar ? 'Descargar Certificado Tributario (PDF)' : 'Certificado no disponible'}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

