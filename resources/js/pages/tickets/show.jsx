import React from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import {
    ArrowLeft,
    User,
    Clock,
    Tag,
    AlertTriangle,
    Briefcase,
    FileText,
    Ban,
    MessageSquare,
    Calendar,
    Activity,
    Wrench,
    CheckCircle,
    Paperclip,
    Info
} from 'lucide-react';
import { toast, Toaster } from 'sonner';

export default function Show({ ticket }) {
    // ==========================================
    // 1. VALIDACIÓN DE ROLES
    // ==========================================
    const { auth } = usePage().props;
    const userRoles = auth?.user?.roles || [];

    // Solo permitimos ver la nota interna a superadmin, admin o agente
    const canViewInternalNote = userRoles.some(role => ['superadmin', 'admin', 'agent'].includes(role));

    const statusName = ticket.status?.name || "Sin estado";

    const statusStyles = {
        "Pendiente a asignación": "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800/50",
        "Asignado": "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50",
        "En Proceso": "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800/50",
        "Resuelto": "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50",
        "Cerrado": "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
        "Cancelado": "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50",
    };

    const styleClass = statusStyles[statusName] || "bg-gray-100 text-gray-700 border-gray-200";

    const handleCancelTicket = () => {
        if (confirm("¿Estás seguro de que deseas cancelar este ticket? Esta acción no se puede deshacer.")) {
            router.put(route('tickets.cancel', ticket.id), {}, {
                onSuccess: () => toast.success("Ticket cancelado correctamente"),
                onError: () => toast.error("Hubo un error al cancelar el ticket")
            });
        }
    };

    // Tomamos la primera solución (el diagnóstico) del array que devuelve Laravel
    const diagnostico = ticket.ticketSolutions && ticket.ticketSolutions.length > 0
                        ? ticket.ticketSolutions[0]
                        : (ticket.ticket_solutions && ticket.ticket_solutions.length > 0 ? ticket.ticket_solutions[0] : null);

    // Buscamos la nota administrativa de cierre en el historial
    const notaCierre = ticket.histories && ticket.histories.length > 0
        ? [...ticket.histories].reverse().find(h => h.internal_note)
        : null;

    return (
        <AppLayout>
            <Head title={`Ticket ${ticket.code}`} />
            <Toaster position="top-right" richColors />

            <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">

                {/* ENCABEZADO */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" className="rounded-full" asChild>
                            <Link href={route('tickets.my')}>
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                                    {ticket.code}
                                </h1>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${styleClass}`}>
                                    {statusName}
                                </span>
                            </div>
                            <p className="text-zinc-500 text-sm mt-1 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Creado el {new Date(ticket.creation_date || ticket.created_at).toLocaleString('es-ES')}
                            </p>
                        </div>
                    </div>

                    {statusName === "Pendiente a asignación" && (
                        <Button
                            variant="destructive"
                            className="bg-red-600 hover:bg-red-700 text-white font-bold w-full sm:w-auto shadow-md"
                            onClick={handleCancelTicket}
                        >
                            <Ban className="w-4 h-4 mr-2" />
                            Cancelar Solicitud
                        </Button>
                    )}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                    {/* COLUMNA IZQUIERDA: Mensaje y Diagnóstico */}
                    <div className="xl:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 md:p-8 shadow-sm">
                            <h2 className="text-xl md:text-2xl font-bold mb-6 text-zinc-900 dark:text-white border-b border-zinc-100 dark:border-zinc-800 pb-4">
                                {ticket.subject}
                            </h2>

                            <div className="relative">
                                <MessageSquare className="absolute -left-2 -top-2 w-8 h-8 text-zinc-100 dark:text-zinc-800 -z-10" />
                                <div className="text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed text-base">
                                    {ticket.message}
                                </div>
                            </div>
                        </div>

                        {/* ========================================== */}
                        {/* BLOQUE: NOTA ADMINISTRATIVA                */}
                        {/* ========================================== */}
                        {statusName === "Cerrado" && notaCierre && (
                            <div className="bg-red-50/80 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 rounded-2xl p-6 md:p-8 shadow-sm relative overflow-hidden mt-6">
                                <Ban className="absolute -right-4 -bottom-4 w-32 h-32 text-red-100 dark:text-red-900/20 z-0" />

                                <div className="relative z-10">
                                    <h2 className="text-lg md:text-xl font-bold mb-6 text-red-800 dark:text-red-400 border-b border-red-200 dark:border-red-800/50 pb-4 flex items-center gap-2">
                                        <Info className="w-5 h-5" />
                                        Resolución Administrativa
                                    </h2>

                                    <div className="space-y-4">
                                        <div>
                                            <span className="text-xs font-bold uppercase tracking-wider text-red-600/70 dark:text-red-400/70 block mb-2">
                                                {/* Cambiamos el título según el rol */}
                                                {canViewInternalNote ? "Motivo del Cierre (Nota Interna)" : "Estado del Ticket"}
                                            </span>
                                            <div className="bg-white dark:bg-zinc-900 border border-red-100 dark:border-red-800/30 rounded-xl p-4 text-zinc-700 dark:text-zinc-300 text-sm whitespace-pre-wrap shadow-sm">
                                                {/* Mostramos la nota real solo a los autorizados, al usuario un mensaje genérico */}
                                                {canViewInternalNote
                                                    ? notaCierre.internal_note
                                                    : "Este ticket ha sido cerrado por el equipo de administración de soporte."
                                                }
                                            </div>
                                        </div>
                                        <div className="text-xs text-red-600/80 font-medium">
                                            Ticket cerrado por: {notaCierre.user?.name || 'Administración'} el {new Date(notaCierre.created_at).toLocaleString('es-ES')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* BLOQUE: DIAGNÓSTICO DEL TÉCNICO */}
                        {diagnostico && (
                            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/50 rounded-2xl p-6 md:p-8 shadow-sm relative overflow-hidden mt-6">
                                <Activity className="absolute -right-4 -bottom-4 w-32 h-32 text-blue-100 dark:text-blue-900/20 z-0" />

                                <div className="relative z-10">
                                    <h2 className="text-lg md:text-xl font-bold mb-6 text-blue-800 dark:text-blue-400 border-b border-blue-200 dark:border-blue-800/50 pb-4 flex items-center gap-2">
                                        <Wrench className="w-5 h-5" />
                                        Diagnóstico del Técnico
                                    </h2>

                                    <div className="space-y-6">
                                        {diagnostico.solution_type && (
                                            <div>
                                                <span className="text-xs font-bold uppercase tracking-wider text-blue-600/70 dark:text-blue-400/70 block mb-2">
                                                    Clasificación del Problema
                                                </span>
                                                <span className="inline-flex items-center px-4 py-2 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 rounded-xl text-sm font-bold border border-blue-100 dark:border-blue-800/30 shadow-sm gap-2">
                                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                                    {diagnostico.solution_type.name}
                                                </span>
                                            </div>
                                        )}

                                        {diagnostico.message && (
                                            <div>
                                                <span className="text-xs font-bold uppercase tracking-wider text-blue-600/70 dark:text-blue-400/70 block mb-2">
                                                    Observaciones y Detalles
                                                </span>
                                                <div className="bg-white dark:bg-zinc-900 border border-blue-100 dark:border-blue-800/30 rounded-xl p-4 text-zinc-700 dark:text-zinc-300 text-sm whitespace-pre-wrap shadow-sm">
                                                    {diagnostico.message}
                                                </div>
                                            </div>
                                        )}

                                        {diagnostico.attachments && diagnostico.attachments.length > 0 && (
                                            <div>
                                                <span className="text-xs font-bold uppercase tracking-wider text-blue-600/70 dark:text-blue-400/70 block mb-2">
                                                    Evidencia Adjunta
                                                </span>
                                                <div className="flex flex-col gap-2">
                                                    {diagnostico.attachments.map((file, index) => (
                                                        <a
                                                            key={index}
                                                            href={`/storage/${file.file_path}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="inline-flex items-center w-fit gap-2 px-4 py-2 bg-white dark:bg-zinc-900 hover:bg-blue-50 dark:hover:bg-zinc-800 text-blue-700 dark:text-blue-400 rounded-xl text-sm font-medium border border-blue-200 dark:border-blue-800/50 shadow-sm transition-colors"
                                                        >
                                                            <Paperclip className="w-4 h-4" />
                                                            {file.file_name}
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* COLUMNA DERECHA: Metadatos */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                            <h3 className="text-xs font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-blue-500" />
                                Detalles de Asignación
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs text-zinc-500 mb-1">Departamento</p>
                                    <p className="font-medium text-sm text-zinc-900 dark:text-zinc-200">
                                        {ticket.department?.name || 'No asignado'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-zinc-500 mb-1">División</p>
                                    <p className="font-medium text-sm text-zinc-900 dark:text-zinc-200">
                                        {ticket.help_topic?.division?.name || 'No asignada'}
                                    </p>
                                </div>

                                <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                    <p className="text-xs text-zinc-500 mb-2">Técnico a cargo</p>
                                    {ticket.assigned_user ? (
                                        <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-800/50 p-2 rounded-lg border border-zinc-100 dark:border-zinc-700/50">
                                            <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                                                {ticket.assigned_user.name.charAt(0)}
                                            </div>
                                            <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-200">
                                                {ticket.assigned_user.name}
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-500 rounded-lg text-sm font-medium border border-yellow-100 dark:border-yellow-900/30">
                                            <Clock className="w-4 h-4 animate-pulse" />
                                            En espera de técnico
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                            <h3 className="text-xs font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Tag className="w-4 h-4 text-red-500" />
                                Clasificación
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs text-zinc-500 mb-1 flex items-center gap-1">
                                        <FileText className="w-3 h-3" /> Tema de ayuda
                                    </p>
                                    <p className="font-medium text-sm text-zinc-900 dark:text-zinc-200 bg-zinc-50 dark:bg-zinc-800/50 p-2 rounded-md border border-zinc-100 dark:border-zinc-800">
                                        {ticket.help_topic?.name_topic || 'N/A'}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-zinc-500 mb-1 flex items-center gap-1">
                                            <AlertTriangle className="w-3 h-3" /> Prioridad
                                        </p>
                                        <p className="font-semibold text-sm text-zinc-900 dark:text-zinc-200">
                                            {ticket.priority?.name || '--'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-zinc-500 mb-1 flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> Vencimiento
                                        </p>
                                        <p className={`font-semibold text-sm ${ticket.expiration_date ? 'text-red-600 dark:text-red-400' : 'text-zinc-500'}`}>
                                            {ticket.expiration_date ? new Date(ticket.expiration_date).toLocaleDateString('es-ES') : '--'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
