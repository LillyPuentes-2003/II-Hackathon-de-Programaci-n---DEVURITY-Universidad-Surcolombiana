import React, { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, XCircle, Brain, User } from 'lucide-react';

interface ValidationResult {
  score: number;
  status: 'verificado' | 'sospechoso' | 'rechazado';
  reasons: string[];
  recommendation: string;
}

function analyzeRequest(request: any): ValidationResult {
  let score = 100;
  const reasons: string[] = [];

  // Regla 1: Solicitudes duplicadas recientes
  if (request.duplicateCount > 2) {
    score -= 40;
    reasons.push('Múltiples solicitudes en poco tiempo');
  }

  // Regla 2: Personas afectadas inusualmente altas
  if (request.peopleAffected > 100) {
    score -= 20;
    reasons.push('Número de personas afectadas inusualmente alto');
  }

  // Regla 3: Descripción muy corta
  if (request.description?.length < 20) {
    score -= 15;
    reasons.push('Descripción demasiado corta o vaga');
  }

  // Regla 4: Sin ubicación específica
  if (!request.location || request.location.length < 5) {
    score -= 25;
    reasons.push('Ubicación no especificada');
  }

  // Regla 5: Historial limpio
  if (request.previousRequests === 0) {
    reasons.push('Primera solicitud - sin historial previo');
  }

  // Regla 6: Teléfono verificado
  if (!request.phoneVerified) {
    score -= 10;
    reasons.push('Teléfono no verificado');
  }

  let status: 'verificado' | 'sospechoso' | 'rechazado';
  let recommendation: string;

  if (score >= 75) {
    status = 'verificado';
    recommendation = 'Solicitud confiable. Proceder con la ayuda.';
  } else if (score >= 50) {
    status = 'sospechoso';
    recommendation = 'Requiere verificación adicional antes de proceder.';
  } else {
    status = 'rechazado';
    recommendation = 'Solicitud con múltiples indicadores de riesgo. Revisar manualmente.';
  }

  return { score, status, reasons, recommendation };
}

const mockRequests = [
  { id: 'REQ-001', userName: 'María García', type: 'alimentos', description: 'Necesitamos víveres para 3 familias en situación de calle.', location: 'Centro, Neiva', peopleAffected: 12, duplicateCount: 0, previousRequests: 2, phoneVerified: true },
  { id: 'REQ-002', userName: 'Juan Pérez', type: 'salud', description: 'Insulina', location: 'Neiva', peopleAffected: 1, duplicateCount: 1, previousRequests: 0, phoneVerified: false },
  { id: 'REQ-003', userName: 'Cuenta Sospechosa', type: 'alimentos', description: 'Ayuda', location: '', peopleAffected: 200, duplicateCount: 5, previousRequests: 8, phoneVerified: false },
];

export default function AIValidator() {
  const [selected, setSelected] = useState<any>(null);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const validate = (request: any) => {
    setLoading(true);
    setSelected(request);
    setTimeout(() => {
      const res = analyzeRequest(request);
      setResult(res);
      setLoading(false);
    }, 1500);
  };

  const statusConfig = {
    verificado: { color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: CheckCircle },
    sospechoso: { color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', icon: AlertTriangle },
    rechazado: { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', icon: XCircle },
  };

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-black tracking-tight flex items-center gap-2">
        <Brain className="w-6 h-6 text-primary" />
        Validación IA de Beneficiarios
      </h3>

      <p className="text-sm text-slate-500">
        El sistema analiza cada solicitud usando reglas de inteligencia artificial para detectar 
        posibles fraudes y garantizar que la ayuda llegue a quienes realmente la necesitan.
      </p>

      {/* Lista de solicitudes */}
      <div className="space-y-3">
        <p className="text-xs font-black text-slate-500 uppercase tracking-widest">
          Solicitudes pendientes de validación
        </p>
        {mockRequests.map((req) => (
          <div key={req.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-slate-500" />
              </div>
              <div>
                <p className="font-bold text-sm">{req.userName}</p>
                <p className="text-xs text-slate-500 capitalize">{req.type} • {req.peopleAffected} personas</p>
              </div>
            </div>
            <button
              onClick={() => validate(req)}
              className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold shadow-sm hover:opacity-90 transition-all"
            >
              Analizar
            </button>
          </div>
        ))}
      </div>

      {/* Resultado del análisis */}
      {loading && (
        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-bold text-slate-600">Analizando solicitud con IA...</p>
        </div>
      )}

      {result && !loading && selected && (
        <div className={`rounded-xl border p-6 space-y-4 ${statusConfig[result.status].bg} ${statusConfig[result.status].border}`}>
          <div className="flex items-center justify-between">
            <h4 className="font-black text-lg flex items-center gap-2">
              {React.createElement(statusConfig[result.status].icon, { className: `w-5 h-5 ${statusConfig[result.status].color}` })}
              <span className={statusConfig[result.status].color}>
                {result.status.toUpperCase()}
              </span>
            </h4>
            <div className="text-right">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Score de Confianza</p>
              <p className={`text-3xl font-black ${statusConfig[result.status].color}`}>{result.score}/100</p>
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="w-full bg-white/60 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-1000 ${
                result.score >= 75 ? 'bg-emerald-500' : result.score >= 50 ? 'bg-amber-500' : 'bg-red-500'
              }`}
              style={{ width: `${result.score}%` }}
            />
          </div>

          {/* Factores detectados */}
          <div>
            <p className="text-xs font-black text-slate-600 uppercase tracking-widest mb-2">Factores detectados</p>
            <div className="space-y-2">
              {result.reasons.map((reason, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <AlertTriangle className="w-3 h-3 text-amber-500 flex-shrink-0" />
                  <span className="text-slate-700">{reason}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recomendación */}
          <div className="bg-white/60 rounded-xl p-4">
            <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Recomendación</p>
            <p className="text-sm font-bold text-slate-700">{result.recommendation}</p>
          </div>

          {/* Acciones */}
          <div className="flex gap-3 pt-2">
            <button className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-bold text-sm">
              ✓ Aprobar
            </button>
            <button className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold text-sm">
              ✗ Rechazar
            </button>
            <button className="flex-1 py-3 border border-slate-200 bg-white text-slate-700 rounded-xl font-bold text-sm">
              Revisar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}