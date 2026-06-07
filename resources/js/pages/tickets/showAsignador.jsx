import React, { useState } from 'react';
import { Head, Link, useForm, usePage } from "@inertiajs/react"; // ← añadir usePage
import AppLayout from '@/layouts/app-layout';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ArrowLeft, User, Briefcase, Loader2, CheckCircle, RefreshCcw, MessageSquare, StickyNote, Paperclip, Download, Eye, X, FileIcon} from 'lucide-react';
import { route } from 'ziggy-js';

export default function ShowAsignador({ ticket, departments, divisions, helpTopics, slaPlans, priorities, tecnicos }) {
    // ← NUEVO: leer el usuario autenticado
    const { auth } = usePage().props;
    const isSuperAdmin = auth?.user?.roles?.includes('superadmin');

    if (!ticket) {
        return (
            <AppLayout>
                <div className="p-8 text-center text-zinc-500 font-bold mt-10">
                    Cargando información del ticket...
                </div>
            </AppLayout>
        );
    }

    const [openReasignar, setOpenReasignar] = useState(false);
    const [openCerrar, setOpenCerrar] = useState(false);
    const [openNota, setOpenNota] = useState(false);

    const [previewFile, setPreviewFile] = useState(null);

    const isImage = (fileType) => {
        return fileType && fileType.startsWith('image/');
    };

    const [dept, setDept] = useState(ticket?.department_id?.toString() ?? "");
    const [div, setDiv] = useState(ticket?.help_topic?.division_id?.toString() ?? "");

    const isDepartmentChanged = ticket ? parseInt(dept) !== parseInt(ticket.department_id) : false;

    const { data: assignData, setData: setAssignData, put: putAssign, processing: processingAssign, errors: assignErrors } = useForm({
        id: ticket?.id ?? "",
        department_id: ticket?.department_id?.toString() ?? "",
        division_id: ticket?.help_topic?.division_id?.toString() ?? "",
        help_topic_id: ticket?.help_topic_id?.toString() ?? "",
        sla_plan_id: ticket?.sla_plan_id?.toString() ?? "",
        priority_id: ticket?.priority_id?.toString() ?? "",
        assigned_user: ticket?.assigned_user?.toString() ?? "",
    });

    const filteredDivisions = dept ? divisions?.filter((d) => parseInt(d.department_id) === parseInt(dept)) : divisions;
    const filteredTopics = div ? helpTopics?.filter((t) => parseInt(t.division_id) === parseInt(div)) : helpTopics;

    const submitReasignar = () => {
        putAssign(route("tickets.update", { ticket: ticket.id }), {
            onSuccess: () => setOpenReasignar(false),
        });
    };

    const { data: noteData, setData: setNoteData, post: postNote, processing: processingNote, errors: noteErrors, reset: resetNote } = useForm({
        internal_note: '',
    });

    const submitNota = (e) => {
        e.preventDefault();
        postNote(route('tickets.notaInterna', ticket.id), {
            onSuccess: () => {
                setOpenNota(false);
                resetNote();
            },
        });
    };

    const { data: closeData, setData: setCloseData, post: postClose, processing: processingClose, errors: closeErrors } = useForm({
        internal_note: '',
    });

    const submitCerrar = (e) => {
        e.preventDefault();
        postClose(route('tickets.adminClose', ticket.id), {
            onSuccess: () => setOpenCerrar(false),
        });
    };

    const statusName = ticket.status?.name || "Sin estado";
    const statusStyles = {
        "Pendiente a asignación": "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300",
        "Asignado": "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300",
        "En Proceso": "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300",
        "Resuelto": "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300",
        "Cerrado": "bg-slate-100 dark:bg-slate-900/30 text-slate-800 dark:text-slate-300",
    };
    const styleClass = statusStyles[statusName] || "bg-slate-100 dark:bg-slate-900/30 text-slate-800 dark:text-slate-300";

    // ← NUEVO: la ruta de regreso depende del rol
    const backRoute = isSuperAdmin
        ? route('tickets.index')
        : route('tickets.unassigned');
    return (
        <AppLayout>
            <Head title={`Gestión de Ticket ${ticket.code}`} />

            <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-zinc-950 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <div className="flex items-center gap-4">
                        {/* ← ÚNICO CAMBIO: href dinámico según rol */}
                        <Button variant="outline" size="icon" className="rounded-full" asChild>
                            <Link href={backRoute}>
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-black text-zinc-900 dark:text-white">
                                    {ticket.code}
                                </h1>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${styleClass}`}>
                                    {statusName}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                        {statusName !== 'Cerrado' && (
                            <Button
                                className="bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 text-white w-full sm:w-auto font-bold shadow-md"
                                onClick={() => setOpenNota(true)}
                            >
                                <StickyNote className="w-4 h-4 mr-2" />
                                Agregar Nota
                            </Button>
                        )}

                        {statusName !== 'Resuelto' && statusName !== 'Cerrado' && (
                            <Button
                                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 w-full sm:w-auto text-white font-bold shadow-md"
                                onClick={() => setOpenReasignar(true)}
                            >
                                <RefreshCcw className="w-4 h-4 mr-2" />
                                Modificar / Reasignar
                            </Button>
                        )}

                        {statusName !== 'Cerrado' && (
                            <Button
                                className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 w-full sm:w-auto text-white font-bold shadow-md"
                                onClick={() => setOpenCerrar(true)}
                            >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Cerrar Ticket
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
                            <h2 className="text-lg font-semibold mb-4 text-zinc-900 dark:text-white border-b pb-2">
                                {ticket.subject}
                            </h2>
                            <div className="text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap bg-zinc-50 dark:bg-zinc-900 p-4 rounded-lg border border-zinc-100 dark:border-zinc-800 text-sm leading-relaxed">
                                {ticket.message}
                            </div>
                        </div>

                        {/* ARCHIVOS ADJUNTOS DEL SOLICITANTE */}
                        {ticket.attachments && ticket.attachments.length > 0 ? (
                            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-sm">
                                <h2 className="text-lg font-bold mb-4 text-zinc-900 dark:text-white border-b pb-3 flex items-center gap-2">
                                    <Paperclip className="w-5 h-5 text-zinc-500 dark:text-zinc-400" />
                                    Evidencia Adjunta
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {ticket.attachments.map((file, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between gap-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-3"
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                {isImage(file.file_type) ? (
                                                    <img
                                                        src={`/storage/${file.file_path}`}
                                                        alt={file.file_name}
                                                        className="w-10 h-10 rounded object-cover border border-zinc-200 dark:border-slate-700"
                                                    />
                                                ) : (
                                                    <FileIcon className="w-8 h-8 text-zinc-400 dark:text-slate-500 flex-shrink-0" />
                                                )}
                                                <span className="text-sm text-zinc-700 dark:text-zinc-300 truncate">
                                                    {file.file_name}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1 flex-shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={() => setPreviewFile(file)}
                                                    className="p-2 rounded-md hover:bg-zinc-200 dark:hover:bg-slate-800 text-zinc-500 dark:text-slate-400 hover:text-zinc-800 dark:hover:text-slate-200 transition"
                                                    title="Ver archivo"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <a
                                                    href={`/storage/${file.file_path}`}
                                                    download={file.file_name}
                                                    className="p-2 rounded-md hover:bg-zinc-200 dark:hover:bg-slate-800 text-zinc-500 dark:text-slate-400 hover:text-zinc-800 dark:hover:text-slate-200 transition"
                                                    title="Descargar archivo"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-zinc-50 dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-6 text-center">
                                <Paperclip className="w-8 h-8 text-zinc-300 dark:text-slate-600 mx-auto mb-2" />
                                <p className="text-sm text-zinc-400 dark:text-slate-500">
                                    Este ticket no contiene archivos adjuntos
                                </p>
                            </div>
                        )}

                        {ticket.histories && ticket.histories.filter(h => h.internal_note || h.internalNote).length > 0 && (
                            <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-6 shadow-sm">
                                <h3 className="text-sm font-bold text-amber-800 dark:text-amber-300 uppercase mb-4 flex items-center gap-2 tracking-wider">
                                    <MessageSquare className="w-4 h-4" />
                                    Comunicación y Notas Internas
                                </h3>
                                <div className="space-y-4">
                                    {ticket.histories
                                        .filter(h => h.internal_note || h.internalNote)
                                        .map((nota, index) => {
                                            const notaTexto = nota.internal_note || nota.internalNote;
                                            return (
                                                <div key={index} className="bg-white dark:bg-zinc-950 p-4 rounded-xl border border-amber-100 dark:border-zinc-800 shadow-sm relative">
                                                    <div className="absolute top-4 right-4 text-[10px] font-black px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-zinc-400 dark:text-zinc-400 uppercase">
                                                        {nota.user?.roles?.[0]?.name || nota.user?.roles?.[0] || 'Staff'}
                                                    </div>
                                                    <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap pr-16 leading-snug">
                                                        {notaTexto}
                                                    </p>
                                                    <div className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-3 flex justify-between items-center border-t border-zinc-50 dark:border-zinc-800 pt-2 font-medium">
                                                        <span>Autor: <strong className="text-zinc-600 dark:text-slate-400">{nota.user?.name || 'Sistema'}</strong></span>
                                                        <span>{new Date(nota.created_at).toLocaleString('es-ES')}</span>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    }
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 flex items-center gap-2">
                                <User className="w-4 h-4 text-red-600" /> Solicitante
                            </h3>
                            <div className="space-y-2 text-sm">
                                <p><span className="font-medium text-zinc-500 dark:text-slate-400">Nombre:</span> <span className="text-zinc-700 dark:text-slate-300">{ticket.requesting_user?.name || ticket.email}</span></p>
                                <p><span className="font-medium text-zinc-500 dark:text-slate-400">Email:</span> <span className="text-zinc-700 dark:text-slate-300">{ticket.email}</span></p>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm space-y-4">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-red-600" /> Datos de Asignación
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div><span className="text-zinc-500 dark:text-zinc-400 block mb-1">Departamento:</span> <span className="font-semibold text-zinc-800 dark:text-zinc-300">{ticket.department?.name || 'N/A'}</span></div>
                                <div><span className="text-zinc-500 dark:text-zinc-400 block mb-1">Tema de Ayuda:</span> <span className="dark:text-zinc-300">{ticket.help_topic?.name_topic || 'N/A'}</span></div>
                                <div><span className="text-zinc-500 dark:text-zinc-400 block mb-1">Prioridad:</span> <span className="dark:text-zinc-300">{ticket.priority?.name || 'N/A'}</span></div>
                                <div><span className="text-zinc-500 dark:text-zinc-400 block mb-1">Técnico:</span> <span className="font-semibold text-blue-600 dark:text-blue-400">{ticket.assigned_user?.name || 'Sin asignar'}</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL 1: MODIFICAR / REASIGNAR */}
            <Dialog open={openReasignar} onOpenChange={setOpenReasignar}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto dark:bg-zinc-950 dark:border-zinc-800">
                    <DialogHeader>
                        <DialogTitle className="text-red-600 dark:text-red-500">Modificar Asignación y Departamento</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                        <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 space-y-4 bg-zinc-50 dark:bg-zinc-900/30">
                            <h4 className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase">Área de Atención</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <Label className="dark:text-zinc-300">Departamento</Label>
                                    <Select value={dept} onValueChange={(val) => { setDept(val); setDiv(""); setAssignData(prev => ({...prev, department_id: val, division_id: "", help_topic_id: ""})); }}>
                                        <SelectTrigger className="dark:bg-zinc-900 dark:border-zinc-800 dark:text-white"><SelectValue placeholder="Seleccione..." /></SelectTrigger>
                                        <SelectContent>
                                            {departments?.map(d => <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    {assignErrors.department_id && <p className="text-xs text-red-500">{assignErrors.department_id}</p>}
                                </div>
                                <div className="space-y-1">
                                    <Label className="dark:text-zinc-300">División</Label>
                                    <Select value={div} onValueChange={(val) => { setDiv(val); setAssignData(prev => ({...prev, division_id: val, help_topic_id: ""})); }} disabled={!dept}>
                                        <SelectTrigger className="dark:bg-zinc-900 dark:border-zinc-800 dark:text-white"><SelectValue placeholder="Seleccione..." /></SelectTrigger>
                                        <SelectContent>
                                            {filteredDivisions?.map(d => <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    {assignErrors.division_id && <p className="text-xs text-red-500">{assignErrors.division_id}</p>}
                                </div>
                                <div className="space-y-1">
                                    <Label className="dark:text-zinc-300">Tema de Ayuda</Label>
                                    <Select value={assignData.help_topic_id} onValueChange={val => setAssignData("help_topic_id", val)} disabled={!div}>
                                        <SelectTrigger className="dark:bg-zinc-900 dark:border-zinc-800 dark:text-white"><SelectValue placeholder="Seleccione..." /></SelectTrigger>
                                        <SelectContent>
                                            {filteredTopics?.map(t => <SelectItem key={t.id} value={t.id.toString()}>{t.name_topic}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    {assignErrors.help_topic_id && <p className="text-xs text-red-500">{assignErrors.help_topic_id}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="border border-zinc-200 dark:border-slate-800 rounded-xl p-4 space-y-4 dark:bg-slate-900/30">
                            <div className="flex justify-between items-center">
                                <h4 className="text-xs font-bold text-zinc-500 dark:text-slate-400 uppercase">Detalles de Servicio</h4>
                                {isDepartmentChanged && (
                                    <span className="text-[10px] bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded font-bold uppercase">Solo Transferencia</span>
                                )}
                            </div>
                            {isDepartmentChanged && (
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50 text-yellow-800 dark:text-yellow-200 text-xs p-3 rounded-lg leading-relaxed">
                                    <strong>Nota:</strong> El ticket volverá a estado "Pendiente a asignación" en su nueva área.
                                </div>
                            )}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label className="dark:text-slate-300">Prioridad</Label>
                                    <Select value={assignData.priority_id} onValueChange={val => setAssignData("priority_id", val)} disabled={isDepartmentChanged}>
                                        <SelectTrigger className="dark:bg-slate-900 dark:border-slate-800 dark:text-white"><SelectValue placeholder="Seleccione..." /></SelectTrigger>
                                        <SelectContent>
                                            {priorities?.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    {assignErrors.priority_id && <p className="text-xs text-red-500">{assignErrors.priority_id}</p>}
                                </div>
                                <div className="space-y-1">
                                    <Label className="dark:text-slate-300">Plan SLA</Label>
                                    <Select value={assignData.sla_plan_id} onValueChange={val => setAssignData("sla_plan_id", val)} disabled={isDepartmentChanged}>
                                        <SelectTrigger className="dark:bg-slate-900 dark:border-slate-800 dark:text-white"><SelectValue placeholder="Seleccione..." /></SelectTrigger>
                                        <SelectContent>
                                            {slaPlans?.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    {assignErrors.sla_plan_id && <p className="text-xs text-red-500">{assignErrors.sla_plan_id}</p>}
                                </div>
                            </div>
                            <div className="space-y-1 pt-2">
                                <Label className="dark:text-slate-300">Técnico asignado (Opcional)</Label>
                                <Select value={assignData.assigned_user || "none"} onValueChange={val => setAssignData("assigned_user", val === "none" ? "" : val)} disabled={isDepartmentChanged}>
                                    <SelectTrigger className="dark:bg-slate-900 dark:border-slate-800 dark:text-white"><SelectValue placeholder="Seleccione un técnico..." /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Dejar sin asignar</SelectItem>
                                        {tecnicos?.map(t => <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                {assignErrors.assigned_user && <p className="text-xs text-red-500">{assignErrors.assigned_user}</p>}
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setOpenReasignar(false)} className="dark:text-zinc-400">Cancelar</Button>
                        <Button onClick={submitReasignar} disabled={processingAssign} className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white">
                            {processingAssign ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar Cambios"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* MODAL 2: NOTA INTERNA */}
            <Dialog open={openNota} onOpenChange={setOpenNota}>
                <DialogContent className="dark:bg-slate-950 dark:border-slate-800">
                    <DialogHeader>
                        <DialogTitle className="text-amber-600 dark:text-amber-500 flex items-center gap-2">
                            <StickyNote className="w-5 h-5" /> Agregar Nota a Bitácora
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitNota} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="internal_note" className="dark:text-slate-300">Escribe tu comentario (Visible solo para staff)</Label>
                            <Textarea id="internal_note" value={noteData.internal_note} onChange={(e) => setNoteData('internal_note', e.target.value)}
                                placeholder="El cliente llamó e indicó que el equipo fue movido a otra sala..." rows={4} required className="dark:bg-slate-900 dark:border-slate-800 dark:text-white" />
                            {noteErrors.internal_note && <p className="text-xs text-red-500">{noteErrors.internal_note}</p>}
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => { setOpenNota(false); resetNote(); }} className="dark:text-zinc-400">Cancelar</Button>
                            <Button type="submit" disabled={processingNote} className="bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 text-white font-bold">
                                {processingNote ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar Nota"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* MODAL 3: CERRAR TICKET */}
            <Dialog open={openCerrar} onOpenChange={setOpenCerrar}>
                <DialogContent className="dark:bg-slate-950 dark:border-slate-800">
                    <DialogHeader>
                        <DialogTitle className="text-red-600 dark:text-red-500 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5" /> Cerrar Ticket Administrativamente
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitCerrar} className="space-y-4 py-4">
                        <div className="bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 p-3 rounded-lg text-sm mb-4 border border-red-100 dark:border-red-800/50">
                            <strong>Atención:</strong> Vas a finalizar este ticket. Los detalles internos quedarán registrados en el historial para auditoría.
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="close_note" className="dark:text-slate-300">Justificación de Cierre (Nota Interna)</Label>
                            <Textarea id="close_note" value={closeData.internal_note} onChange={(e) => setCloseData('internal_note', e.target.value)}
                                placeholder="Escribe el motivo por el cual se procede al cierre administrativo..." rows={5} required className="dark:bg-slate-900 dark:border-slate-800 dark:text-white" />
                            {closeErrors.internal_note && <p className="text-xs text-red-500">{closeErrors.internal_note}</p>}
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setOpenCerrar(false)} className="dark:text-zinc-400">Cancelar</Button>
                            <Button type="submit" disabled={processingClose} className="bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white">
                                {processingClose ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmar Cierre"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
            {previewFile && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
                    onClick={() => setPreviewFile(null)}
                >
                    <div
                        className="relative max-w-[90vw] max-h-[90vh] flex flex-col items-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setPreviewFile(null)}
                            className="absolute -top-3 -right-3 z-10 bg-white dark:bg-slate-900 rounded-full p-1.5 shadow-lg hover:bg-zinc-100 dark:hover:bg-slate-800 transition"
                        >
                            <X className="w-5 h-5 text-zinc-700 dark:text-slate-300" />
                        </button>
                        {isImage(previewFile.file_type) ? (
                            <img
                                src={`/storage/${previewFile.file_path}`}
                                alt={previewFile.file_name}
                                className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl"
                            />
                        ) : previewFile.file_type === 'application/pdf' ? (
                            <iframe
                                src={`/storage/${previewFile.file_path}`}
                                className="w-[80vw] h-[80vh] rounded-lg shadow-2xl bg-white dark:bg-slate-900"
                                title={previewFile.file_name}
                            />
                        ) : (
                            <div className="bg-white dark:bg-slate-900 rounded-lg p-8 text-center shadow-2xl">
                                <FileIcon className="w-16 h-16 text-zinc-400 dark:text-slate-500 mx-auto mb-4" />
                                <p className="text-zinc-700 dark:text-zinc-300 font-medium mb-2">{previewFile.file_name}</p>
                                <p className="text-sm text-zinc-500 dark:text-slate-400 mb-4">No se puede previsualizar este tipo de archivo</p>
                                <a
                                    href={`/storage/${previewFile.file_path}`}
                                    download={previewFile.file_name}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-slate-800 text-white rounded-md hover:bg-zinc-800 dark:hover:bg-slate-700 transition text-sm"
                                >
                                    <Download className="w-4 h-4" />
                                    Descargar
                                </a>
                            </div>
                        )}
                        <p className="mt-3 text-sm text-white/80 text-center truncate max-w-full">
                            {previewFile.file_name}
                        </p>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
