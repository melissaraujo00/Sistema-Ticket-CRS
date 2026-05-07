import React from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import {
    ArrowLeft,
    ArrowRightLeft,
    Clock,
    CircleDot,
    StickyNote,
    UserPlus,
    History as HistoryIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const actionMeta = {
    created: { label: "Creación", icon: CircleDot, tone: "bg-blue-500/10 text-blue-600" },
    department_transferred: { label: "Departamento", icon: ArrowRightLeft, tone: "bg-amber-500/10 text-amber-600" },
    assigned: { label: "Asignación", icon: UserPlus, tone: "bg-emerald-500/10 text-emerald-600" },
    internal_note: { label: "Nota interna", icon: StickyNote, tone: "bg-zinc-500/10 text-zinc-600" },
    status_changed: { label: "Estado", icon: CircleDot, tone: "bg-violet-500/10 text-violet-600" },
};

export default function index() {
    const { props } = usePage();
    const { ticket, histories = [] } = props;

    if (!ticket) return <div className="p-10 text-center">Cargando datos del ticket...</div>;

    const formatDate = (iso) =>
        new Date(iso).toLocaleString("es-ES", {
            day: "2-digit", month: "2-digit", year: "numeric",
            hour: "2-digit", minute: "2-digit",
        });

    const displayCode = ticket.code ? ticket.code : `ID-${ticket.id}`;

    const breadcrumbs = [
        { title: "Tickets", href: "/tickets" },
        { title: `Historial #${displayCode}`, href: "#" },
    ];

    const getActionText = (entry) => {
        switch (entry.action_type) {
            case 'created':
                return "creó el ticket";
            case 'assigned':
                return "asignó este ticket a";
            case 'department_transferred':
                return "transfirió el ticket de departamento";
            case 'status_changed':
                return "cambió el estado del ticket";
            case 'internal_note':
                return "agregó una nota interna";
            default:
                return "realizó una actualización";
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Historial - ${displayCode}`} />

            <div className="max-w-7xl mx-auto p-4 md:p-6">
                {/* Cabecera */}
                <div className="mb-8">
                    <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
                        <Link href={route('tickets.index')}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Volver
                        </Link>
                    </Button>

                    <div className="flex flex-col gap-1">
                        <span className="text-xs tracking-widest text-gray-500">
                            Historial del ticket
                        </span>
                        <h1 className="text-4xl font-black font-mono tracking-tighter text-red-500">
                            {displayCode}
                        </h1>
                        <p className="text-muted-foreground text-lg">{ticket.subject}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8">
                    {/* Panel Lateral: Info del Ticket */}
                    <aside className="space-y-4 ">
                        <div className="bg-card border rounded-xl p-5 shadow-sm">
                            <h3 className="text-xs font-bold uppercase text-muted-foreground mb-6">Detalles</h3>
                            <div className="space-y-5">
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Estado</p>
                                    <Badge className="mt-1 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                        {ticket.status?.name || 'S/D'}
                                    </Badge>
                                </div>
                                <Separator />
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Departamento</p>
                                    <p className="font-medium text-sm">{ticket.department?.name || 'S/D'}</p>
                                </div>
                                <Separator />
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Asignado a</p>

                                    <p className="font-medium text-sm">{ticket.assigned_user?.name || 'Sin asignar'}</p>
                                </div>
                                <Separator />
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground">Fecha de creacion</p>

                                    <p className="font-medium text-sm">{ticket.creation_date || 'Sin asignar'}</p>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Línea de Tiempo Principal */}
                    <main className="bg-card border rounded-xl p-6 md:p-8 shadow-sm">
                        <div className="flex items-center gap-2 mb-10">
                            <HistoryIcon className="h-5 w-5" />
                            <h2 className="text-xl font-bold">Línea de tiempo</h2>
                        </div>

                        {histories.length === 0 ? (
                            <div className="py-20 text-center border-2 border-dashed rounded-xl">
                                <Clock className="h-10 w-10 mx-auto text-muted-foreground/20 mb-2" />
                                <p className="text-muted-foreground">No hay historial para este ticket.</p>
                            </div>
                        ) : (
                            <div className="relative border-l-2 border-muted ml-3 space-y-10">
                                {histories.map((entry) => {
                                    const meta = actionMeta[entry.action_type] || actionMeta.internal_note;
                                    const Icon = meta.icon;
                                    console.log(entry)

                                    return (
                                        <div key={entry.id} className="relative pl-8">
                                            <span className={`absolute -left-[13px] top-0 flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-background ${meta.tone}`}>
                                                <Icon className="h-3 w-3" />
                                            </span>

                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center justify-between">
                                                    <Badge variant="outline" className="text-[10px] font-bold uppercase">
                                                        {meta.label}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground font-medium">
                                                        {formatDate(entry.created_at)}
                                                    </span>
                                                </div>

                                                <div className="bg-muted/30 border rounded-lg p-4">
                                                    <p className="text-sm font-medium mb-2">
                                                        {entry.user?.name || 'Sistema'} <span className="text-muted-foreground font-normal">{getActionText(entry)}</span>
                                                    </p>
                                                    {entry.action_type === 'assigned' && (
                                                        <div className="flex items-center gap-2 text-xs font-mono bg-background/50 p-2 rounded border">
                                                            <span className="text-emerald-500 font-bold">{entry.assigned_to?.name}</span>
                                                        </div>
                                                    )}

                                                    {entry.action_type === 'department_transferred' && (
                                                        <div className="flex items-center gap-2 text-xs font-mono bg-background/50 p-2 rounded border">
                                                            <span className="text-red-400">{entry.previous_department?.name}</span>
                                                            <ArrowRightLeft className="h-3 w-3" />
                                                            <span className="text-amber-500 font-bold">{entry.new_department?.name}</span>
                                                        </div>
                                                    )}

                                                    {entry.internal_note && (
                                                        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2 border-l-2 border-primary/20 pl-3 italic">
                                                            "{entry.internal_note}"
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </AppLayout>
    );
}