import React, { useState } from 'react';
import { Head, Link, useForm, usePage } from "@inertiajs/react"; // ← añadir usePage
import AppLayout from '@/layouts/app-layout';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ArrowLeft, User, Briefcase, Loader2, CheckCircle, RefreshCcw, MessageSquare, StickyNote } from 'lucide-react';
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
        "Pendiente a asignación": "bg-yellow-100 text-yellow-700",
        "Asignado": "bg-blue-100 text-blue-700",
        "En Proceso": "bg-blue-100 text-blue-700",
        "Resuelto": "bg-green-100 text-green-700",
        "Cerrado": "bg-gray-100 text-gray-700",
    };
    const styleClass = statusStyles[statusName] || "bg-gray-100 text-gray-700";

    // ← NUEVO: la ruta de regreso depende del rol
    const backRoute = isSuperAdmin
        ? route('tickets.index')
        : route('tickets.unassigned');

    return (
        <AppLayout>
            <Head title={`Gestión de Ticket ${ticket.code}`} />

            <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 shadow-sm">
                    <div className="flex items-center gap-4">
                        {/* ← ÚNICO CAMBIO: href dinámico según rol */}
                        <Button variant="outline" size="icon" className="rounded-full" asChild>
                            <Link href={backRoute}>
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-black text-zinc-900">
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
                                variant="outline"
                                className="bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border-yellow-200 w-full sm:w-auto font-bold"
                                onClick={() => setOpenNota(true)}
                            >
                                <StickyNote className="w-4 h-4 mr-2" />
                                Agregar Nota
                            </Button>
                        )}

                        {statusName !== 'Resuelto' && statusName !== 'Cerrado' && (
                            <Button
                                className="bg-gray-500 hover:bg-gray-700 w-full sm:w-auto text-white font-bold"
                                onClick={() => setOpenReasignar(true)}
                            >
                                <RefreshCcw className="w-4 h-4 mr-2" />
                                Modificar / Reasignar
                            </Button>
                        )}

                        {statusName !== 'Cerrado' && (
                            <Button
                                variant="destructive"
                                className="bg-red-600 hover:bg-red-700 w-full sm:w-auto font-bold"
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
                        <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
                            <h2 className="text-lg font-semibold mb-4 text-zinc-900 border-b pb-2">
                                {ticket.subject}
                            </h2>
                            <div className="text-zinc-700 whitespace-pre-wrap bg-zinc-50 p-4 rounded-lg border border-zinc-100 text-sm leading-relaxed">
                                {ticket.message}
                            </div>
                        </div>

                        {ticket.histories && ticket.histories.filter(h => h.internal_note || h.internalNote).length > 0 && (
                            <div className="bg-yellow-50/50 border border-yellow-200 rounded-2xl p-6 shadow-sm">
                                <h3 className="text-sm font-bold text-yellow-800 uppercase mb-4 flex items-center gap-2 tracking-wider">
                                    <MessageSquare className="w-4 h-4" />
                                    Comunicación y Notas Internas
                                </h3>
                                <div className="space-y-4">
                                    {ticket.histories
                                        .filter(h => h.internal_note || h.internalNote)
                                        .map((nota, index) => {
                                            const notaTexto = nota.internal_note || nota.internalNote;
                                            return (
                                                <div key={index} className="bg-white p-4 rounded-xl border border-yellow-100 shadow-sm relative">
                                                    <div className="absolute top-4 right-4 text-[10px] font-black px-2 py-0.5 bg-zinc-100 rounded text-zinc-400 uppercase">
                                                        {nota.user?.roles?.[0]?.name || nota.user?.roles?.[0] || 'Staff'}
                                                    </div>
                                                    <p className="text-sm text-zinc-700 whitespace-pre-wrap pr-16 leading-snug">
                                                        {notaTexto}
                                                    </p>
                                                    <div className="text-[11px] text-zinc-400 mt-3 flex justify-between items-center border-t border-zinc-50 pt-2 font-medium">
                                                        <span>Autor: <strong className="text-zinc-600">{nota.user?.name || 'Sistema'}</strong></span>
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
                        <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm space-y-4">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                                <User className="w-4 h-4 text-red-600" /> Solicitante
                            </h3>
                            <div className="space-y-2 text-sm">
                                <p><span className="font-medium text-zinc-500">Nombre:</span> {ticket.requesting_user?.name || ticket.email}</p>
                                <p><span className="font-medium text-zinc-500">Email:</span> {ticket.email}</p>
                            </div>
                        </div>

                        <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm space-y-4">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                                <Briefcase className="w-4 h-4 text-red-600" /> Datos de Asignación
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div><span className="text-zinc-500 block mb-1">Departamento:</span> <span className="font-semibold text-zinc-800">{ticket.department?.name || 'N/A'}</span></div>
                                <div><span className="text-zinc-500 block mb-1">Tema de Ayuda:</span> {ticket.help_topic?.name_topic || 'N/A'}</div>
                                <div><span className="text-zinc-500 block mb-1">Prioridad:</span> {ticket.priority?.name || 'N/A'}</div>
                                <div><span className="text-zinc-500 block mb-1">Técnico:</span> <span className="font-semibold text-blue-600">{ticket.assigned_user?.name || 'Sin asignar'}</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL 1: MODIFICAR / REASIGNAR */}
            <Dialog open={openReasignar} onOpenChange={setOpenReasignar}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-blue-600">Modificar Asignación y Departamento</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                        <div className="border border-zinc-200 rounded-xl p-4 space-y-4 bg-zinc-50">
                            <h4 className="text-xs font-bold text-zinc-500 uppercase">Área de Atención</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <Label>Departamento</Label>
                                    <Select value={dept} onValueChange={(val) => { setDept(val); setDiv(""); setAssignData(prev => ({...prev, department_id: val, division_id: "", help_topic_id: ""})); }}>
                                        <SelectTrigger><SelectValue placeholder="Seleccione..." /></SelectTrigger>
                                        <SelectContent>
                                            {departments?.map(d => <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label>División</Label>
                                    <Select value={div} onValueChange={(val) => { setDiv(val); setAssignData(prev => ({...prev, division_id: val, help_topic_id: ""})); }} disabled={!dept}>
                                        <SelectTrigger><SelectValue placeholder="Seleccione..." /></SelectTrigger>
                                        <SelectContent>
                                            {filteredDivisions?.map(d => <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label>Tema de Ayuda</Label>
                                    <Select value={assignData.help_topic_id} onValueChange={val => setAssignData("help_topic_id", val)} disabled={!div}>
                                        <SelectTrigger><SelectValue placeholder="Seleccione..." /></SelectTrigger>
                                        <SelectContent>
                                            {filteredTopics?.map(t => <SelectItem key={t.id} value={t.id.toString()}>{t.name_topic}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <div className="border border-zinc-200 rounded-xl p-4 space-y-4">
                            <div className="flex justify-between items-center">
                                <h4 className="text-xs font-bold text-zinc-500 uppercase">Detalles de Servicio</h4>
                                {isDepartmentChanged && (
                                    <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-1 rounded font-bold uppercase">Solo Transferencia</span>
                                )}
                            </div>
                            {isDepartmentChanged && (
                                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs p-3 rounded-lg leading-relaxed">
                                    <strong>Nota:</strong> El ticket volverá a estado "Pendiente a asignación" en su nueva área.
                                </div>
                            )}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label>Prioridad</Label>
                                    <Select value={assignData.priority_id} onValueChange={val => setAssignData("priority_id", val)} disabled={isDepartmentChanged}>
                                        <SelectTrigger><SelectValue placeholder="Seleccione..." /></SelectTrigger>
                                        <SelectContent>
                                            {priorities?.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label>Plan SLA</Label>
                                    <Select value={assignData.sla_plan_id} onValueChange={val => setAssignData("sla_plan_id", val)} disabled={isDepartmentChanged}>
                                        <SelectTrigger><SelectValue placeholder="Seleccione..." /></SelectTrigger>
                                        <SelectContent>
                                            {slaPlans?.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-1 pt-2">
                                <Label>Técnico asignado (Opcional)</Label>
                                <Select value={assignData.assigned_user || "none"} onValueChange={val => setAssignData("assigned_user", val === "none" ? "" : val)} disabled={isDepartmentChanged}>
                                    <SelectTrigger><SelectValue placeholder="Seleccione un técnico..." /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Dejar sin asignar</SelectItem>
                                        {tecnicos?.map(t => <SelectItem key={t.id} value={t.id.toString()}>{t.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setOpenReasignar(false)}>Cancelar</Button>
                        <Button onClick={submitReasignar} disabled={processingAssign} className="bg-blue-600 hover:bg-blue-700 text-white">
                            {processingAssign ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar Cambios"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* MODAL 2: NOTA INTERNA */}
            <Dialog open={openNota} onOpenChange={setOpenNota}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-yellow-700 flex items-center gap-2">
                            <StickyNote className="w-5 h-5" /> Agregar Nota a Bitácora
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitNota} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="internal_note">Escribe tu comentario (Visible solo para staff)</Label>
                            <Textarea id="internal_note" value={noteData.internal_note} onChange={(e) => setNoteData('internal_note', e.target.value)}
                                placeholder="El cliente llamó e indicó que el equipo fue movido a otra sala..." rows={4} required />
                            {noteErrors.internal_note && <p className="text-sm text-red-500">{noteErrors.internal_note}</p>}
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => { setOpenNota(false); resetNote(); }}>Cancelar</Button>
                            <Button type="submit" disabled={processingNote} className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold">
                                {processingNote ? <Loader2 className="h-4 w-4 animate-spin" /> : "Guardar Nota"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* MODAL 3: CERRAR TICKET */}
            <Dialog open={openCerrar} onOpenChange={setOpenCerrar}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-red-600 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5" /> Cerrar Ticket Administrativamente
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={submitCerrar} className="space-y-4 py-4">
                        <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm mb-4 border border-red-100">
                            <strong>Atención:</strong> Vas a finalizar este ticket. Los detalles internos quedarán registrados en el historial para auditoría.
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="close_note">Justificación de Cierre (Nota Interna)</Label>
                            <Textarea id="close_note" value={closeData.internal_note} onChange={(e) => setCloseData('internal_note', e.target.value)}
                                placeholder="Escribe el motivo por el cual se procede al cierre administrativo..." rows={5} required />
                            {closeErrors.internal_note && <p className="text-sm text-red-500">{closeErrors.internal_note}</p>}
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="ghost" onClick={() => setOpenCerrar(false)}>Cancelar</Button>
                            <Button type="submit" disabled={processingClose} className="bg-red-600 hover:bg-red-700 text-white">
                                {processingClose ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirmar Cierre"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
