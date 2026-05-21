import React from 'react';
import { toast } from 'sonner';

export default function DiagnosisPanel({
    selectedTicketId,
    setShowDiagnosticPanel,
    ticketsAsignados,
    solutionTypes,
    submitDiagnostic,
    isSubmitting,
    setShowUnresolvedModal,
    tipoDiagnostico,
    setTipoDiagnostico,
    customDiagnosticType,
    setCustomDiagnosticType,
    showCustomDiagnostic,
    setShowCustomDiagnostic,
    observacionDiagnostico,
    setObservacionDiagnostico,
    adjuntosDiagnostico,
    setAdjuntosDiagnostico
}) {
    const selectedTicket = ticketsAsignados.find((t) => t.id === selectedTicketId);

    return (
        <div id="diagnostico-section" className="scroll-mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md animate-in fade-in duration-300">
            <div className="flex items-center justify-between bg-gradient-to-r from-red-600 to-red-700 p-4 text-white">
                <h3 className="font-bold">
                    Formulario de Diagnóstico - Ticket #{selectedTicket?.id} ({selectedTicket?.asunto})
                </h3>
                <button
                    onClick={() => {
                        setShowDiagnosticPanel(false);
                        setTipoDiagnostico('');
                        setCustomDiagnosticType('');
                        setShowCustomDiagnostic(false);
                        setObservacionDiagnostico('');
                        setAdjuntosDiagnostico([]);
                    }}
                    className="text-white transition-colors hover:text-red-200"
                >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <div className="p-6">
                <p className="mb-4 text-[13px] font-medium text-gray-700">Seleccione el tipo de diagnóstico realizado (Opcional):</p>
                <div className="mb-6 flex flex-wrap gap-2">
                    {solutionTypes.map((type, idx) => {
                        const name = typeof type === 'object' && type !== null ? type.name : type;
                        const key = typeof type === 'object' && type !== null ? (type.id || idx) : type;
                        return (
                            <button
                                key={key}
                                onClick={() => {
                                    setTipoDiagnostico(name);
                                    setShowCustomDiagnostic(false);
                                    setCustomDiagnosticType('');
                                }}
                                className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                                    tipoDiagnostico === name && !showCustomDiagnostic
                                        ? 'bg-red-600 text-white shadow-sm'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {name}
                            </button>
                        );
                    })}
                    <button
                        onClick={() => {
                            setShowCustomDiagnostic(true);
                            setTipoDiagnostico('');
                        }}
                        className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                            showCustomDiagnostic
                                ? 'bg-red-600 text-white shadow-sm'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        Otro tipo
                    </button>
                </div>

                {showCustomDiagnostic && (
                    <div className="mb-6 animate-in slide-in-from-top-2 duration-200">
                        <label className="mb-2 block text-xs font-bold text-gray-700 uppercase">Escriba el tipo de diagnóstico:</label>
                        <input
                            type="text"
                            className="w-full rounded-lg border border-gray-200 p-2.5 text-xs text-gray-700 focus:border-red-300 focus:ring focus:ring-red-200/50"
                            placeholder="Ej. Cambio de Fuente de Poder, Reparación de Enlace..."
                            value={customDiagnosticType}
                            onChange={(e) => setCustomDiagnosticType(e.target.value)}
                        />
                    </div>
                )}

                <label className="mb-2 block text-xs font-bold text-gray-700 uppercase">Observación y Reporte Técnico:</label>
                <textarea
                    className="mb-4 h-24 w-full resize-none rounded-lg border border-gray-200 p-3 text-[13px] text-gray-700 focus:border-red-300 focus:ring focus:ring-red-200/50"
                    placeholder="Escriba aquí la observación y detalles del diagnóstico..."
                    value={observacionDiagnostico}
                    onChange={(e) => setObservacionDiagnostico(e.target.value)}
                ></textarea>

                <div className="mb-4">
                    <label className="mb-2 block text-sm font-bold text-gray-700">
                        Archivo Adjunto / Evidencias <span className="text-red-500">* (Obligatorio)</span>:
                    </label>
                    <input
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.mp4,.mov,.avi,.wmv"
                        className="block w-full cursor-pointer text-sm text-gray-500 transition-colors file:mr-4 file:rounded file:border-0 file:bg-red-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-red-700 hover:file:bg-red-100"
                        onChange={(e) => {
                            if (e.target.files) {
                                const filesArray = Array.from(e.target.files);
                                const allowedTypes = [
                                    'application/pdf', 'application/msword',
                                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                                    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                                    'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
                                    'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
                                    'video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-ms-wmv'
                                ];

                                const maxSize = 10 * 1024 * 1024; // 10MB
                                const validFiles = [];

                                for (const file of filesArray) {
                                    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|jpg|jpeg|png|gif|mp4|mov|avi|wmv)$/i)) {
                                        toast.error(`El archivo "${file.name}" no es un tipo permitido.`);
                                        continue;
                                    }

                                    if (file.size > maxSize) {
                                        toast.error(`El archivo "${file.name}" excede el tamaño máximo de 10MB.`);
                                        continue;
                                    }

                                    validFiles.push(file);
                                }

                                if (validFiles.length > 4) {
                                    toast.warning('Se permite un máximo de 4 archivos. Solo se guardaron los primeros 4.');
                                    setAdjuntosDiagnostico(validFiles.slice(0, 4));
                                } else {
                                    setAdjuntosDiagnostico(validFiles);
                                }
                            }
                        }}
                    />
                    {adjuntosDiagnostico.length > 0 && (
                        <p className="mt-2 text-xs text-gray-500">
                            Archivos seleccionados: {adjuntosDiagnostico.map((f) => f.name).join(', ')}
                        </p>
                    )}
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        className="rounded-lg bg-slate-100 px-6 py-2.5 text-xs font-bold text-slate-600 transition-all hover:bg-slate-200"
                        onClick={() => setShowUnresolvedModal(true)}
                        disabled={isSubmitting}
                    >
                        NO PUEDO RESOLVER
                    </button>
                    <button
                        className={`flex items-center gap-2 rounded-lg bg-red-600 px-6 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-red-700 hover:shadow-md ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                        onClick={submitDiagnostic}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        ) : null}
                        COMPLETAR DIAGNÓSTICO
                    </button>
                </div>
            </div>
        </div>
    );
}
