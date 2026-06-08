import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function UnresolvedModal({
    showUnresolvedModal,
    setShowUnresolvedModal,
    unresolvedData,
    setUnresolvedData,
    validationErrors,
    isSubmitting,
    submitUnresolved
}) {
    if (!showUnresolvedModal) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="bg-slate-50 px-6 py-4 border-b border-slate-100">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-600" /> Reporte de Incidencia Técnica
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Documente el proceso y la justificación de la no resolución.</p>
                </div>

                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Nota Interna (Justificación / Avances)</label>
                        <textarea
                            className={`w-full h-32 rounded-xl border text-sm p-4 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all ${validationErrors.internal_note ? 'border-red-500 bg-red-50' : 'border-slate-200'}`}
                            placeholder="Describa los avances realizados y la justificación de por qué no se pudo resolver el ticket..."
                            value={unresolvedData.internal_note}
                            onChange={(e) => setUnresolvedData({ ...unresolvedData, internal_note: e.target.value })}
                        ></textarea>
                        {validationErrors.internal_note && (
                            <p className="mt-1 text-[10px] font-bold text-red-600">{validationErrors.internal_note[0]}</p>
                        )}
                    </div>
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
                    <button
                        className="flex-1 rounded-xl bg-white border border-slate-200 py-3 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50"
                        onClick={() => {
                            setShowUnresolvedModal(false);
                            setUnresolvedData({ internal_note: '' });
                        }}
                        disabled={isSubmitting}
                    >
                        Cancelar
                    </button>
                    <button
                        className={`flex-1 flex items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-sm font-bold text-white shadow-lg shadow-red-600/20 transition-all hover:bg-red-700 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                        onClick={submitUnresolved}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        ) : null}
                        Enviar Reporte Detallado
                    </button>
                </div>
            </div>
        </div>
    );
}
