import React from "react";
import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Button } from "@/components/ui/button";
import { Loader2, Image as ImageIcon, Pencil, Check } from "lucide-react";

export default function Preview({
    data,
    auth,
    departments,
    divisions,
    helpTopics,
    breadcrumbs,
    onEdit,
    onSubmit,
    processing
}) {
    const deptName = departments.find(d => d.id.toString() === data.department_id)?.name || "No especificado";
    const divName = divisions.find(d => d.id.toString() === data.division_id)?.name || "No especificado";
    const topicName = helpTopics.find(t => t.id.toString() === data.help_topic_id)?.name_topic || "No especificado";

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Vista Previa del Ticket" />
            <div className="p-4 md:p-8 max-w-8xl mx-auto space-y-6">
                <div className="w-full bg-white dark:bg-zinc-900 border border-[#706F6F] dark:border-zinc-800 rounded-xl p-6 shadow-sm">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex flex-col gap-1">
                            <h1 className="text-3xl font-bold text-red-600 dark:text-red-400 break-words">
                                {data.subject || "Sin asunto"}
                            </h1>
                            <p className="text-xs text-zinc-500 dark:text-zinc-500 flex items-center gap-1">
                                <i className="fas fa-info-circle"></i> Revisión de borrador antes de envío
                            </p>
                        </div>

                        <div className="flex flex-col items-start md:items-end gap-2">
                            <span className="text-xs font-bold uppercase tracking-widest bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 px-3 py-1.5 rounded-lg border border-red-200 dark:border-red-900/50 flex items-center gap-2">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
                                </span>
                                Pendiente
                            </span>

                            <div className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono flex flex-col items-end leading-tight">
                                <span>{new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                    <div className="lg:col-span-1">
                        <div className="h-100 bg-white dark:bg-zinc-900 border border-[#706F6F] dark:border-zinc-700 rounded-xl p-7 py-7 shadow-sm">
                            <h2 className="text-lg font-bold text-red-600 dark:text-red-400 mb-5">Información General</h2>
                            <div className="space-y-7 text-sm">
                                <div className="flex justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                                    <span className="font-semibold text-zinc-900 dark:text-zinc-300">Solicitante</span>
                                    <span className="text-zinc-600 dark:text-zinc-400 text-right">{auth.user.name}</span>
                                </div>
                                <div className="flex justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                                    <span className="font-semibold text-zinc-900 dark:text-zinc-300">Email</span>
                                    <span className="text-blue-600 dark:text-blue-400 text-right break-all">{auth.user.email}</span>
                                </div>
                                <div className="flex justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                                    <span className="font-semibold text-zinc-900 dark:text-zinc-300">Departamento</span>
                                    <span className="text-zinc-600 dark:text-zinc-400 text-right">{deptName}</span>
                                </div>
                                <div className="flex justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-2">
                                    <span className="font-semibold text-zinc-900 dark:text-zinc-300">División</span>
                                    <span className="text-zinc-600 dark:text-zinc-400 text-right">{divName}</span>
                                </div>
                                <div className="flex justify-between gap-4">
                                    <span className="font-semibold text-zinc-900 dark:text-zinc-300">Problema</span>
                                    <span className="text-zinc-600 dark:text-zinc-400 text-right font-medium">{topicName}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2 flex flex-col gap-6">
                        <div className="bg-white dark:bg-zinc-900 border border-[#706F6F] dark:border-zinc-700 rounded-xl p-6 shadow-sm flex-1">
                            <h2 className="text-lg font-bold text-red-600 dark:text-red-400 mb-4">Descripción del Problema</h2>
                            <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-5 border border-zinc-100 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap max-h-30 overflow-y-auto">
                                {data.message || "Sin descripción proporcionada."}
                            </div>
                        </div>

                        {data.attachments && data.attachments.length > 0 && (
                            <div className="bg-white dark:bg-zinc-900 border border-[#706F6F] dark:border-zinc-700 rounded-xl p-6 shadow-sm">
                                <h2 className="text-lg font-bold text-red-600 dark:text-red-400 mb-4">Archivos Adjuntos Preparados</h2>
                                <div className="space-y-3">
                                    {data.attachments.map((file, index) => (
                                        <div key={index} className="flex items-center p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-100 dark:border-zinc-800 gap-4">
                                            <div className="p-2.5 bg-blue-100 dark:bg-blue-900/40 rounded-md text-blue-600 dark:text-blue-400">
                                                <ImageIcon className="w-6 h-6" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{file.name}</p>
                                                <p className="text-xs text-zinc-500">{(file.size / 1024).toFixed(0)} KB</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-2">
                            <Button variant="outline" onClick={onEdit} disabled={processing}>
                                <Pencil className="w-4 h-4 mr-2" /> Editar Datos
                            </Button>

                            <Button className="bg-red-600 hover:bg-red-700 text-white shadow-md" onClick={onSubmit} disabled={processing}>
                                {processing ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                                Confirmar y Enviar Ticket
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}