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
    X,
    CheckCircle,
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
    sla_paused: { label: "SLA Pausado", icon: Clock, tone: "bg-zinc-500/10 text-zinc-600" },
    sla_resumed: { label: "SLA Reanudado", icon: Clock, tone: "bg-blue-500/10 text-blue-600" },
    sla_expired: { label: "SLA Incumplido", icon: X, tone: "bg-red-500 text-white font-bold animate-pulse" },
    sla_met: { label: "SLA Cumplido", icon: CheckCircle, tone: "bg-emerald-500/10 text-emerald-600" },
    sla_plan_changed: { label: "Plan SLA", icon: HistoryIcon, tone: "bg-indigo-500/10 text-indigo-600" },
};

export default function index() {
    const { props } = usePage();
    const { ticket, histories = [], auth } = props;


    if (!ticket) return <div className="p-10 text-center">Cargando datos del ticket...</div>;

    const isSuperAdmin = auth?.user?.roles?.includes('superadmin');
    const canViewAll = auth?.user?.permissions?.includes('view_all_tickets');
    const backRoute = isSuperAdmin || canViewAll ? route('tickets.index') : route('tickets.my');

    const formatDate = (iso) =>
        new Date(iso).toLocaleString("es-ES", {
            day: "2-digit", month: "2-digit", year: "numeric",
            hour: "2-digit", minute: "2-digit",
        });

    const displayCode = ticket.code ? ticket.code : `ID-${ticket.id}`;

    const breadcrumbs = [
        { title: "Tickets", href: backRoute },
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
            case 'sla_paused':
                return "pausó el conteo del SLA";
            case 'sla_resumed':
                return "reanudó el conteo del SLA";
            case 'sla_expired':
                return "registró un incumplimiento de SLA";
            case 'sla_met':
                return "registró el cumplimiento de SLA";
            case 'sla_plan_changed':
                return "cambió el plan SLA del ticket";
            default:
                return "realizó una actualización";
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Historial - ${displayCode}`} />

            <div className="mx-auto max-w-7xl p-4 md:p-6">
                {/* Cabecera */}
                <div className="mb-8">
                    <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2">
                        <Link href={backRoute}>
                            <ArrowLeft className="mr-2 h-4 w-4" /> Volver
                        </Link>
                    </Button>

                    <div className="flex flex-col gap-1">
                        <span className="text-xs tracking-widest text-gray-500">Historial del ticket</span>
                        <h1 className="font-mono text-4xl font-black tracking-tighter text-red-500">{displayCode}</h1>
                        <p className="text-muted-foreground text-lg">{ticket.subject}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-[300px_1fr]">
                    {/* Panel Lateral: Info del Ticket */}
                    <aside className="space-y-4">
                        <div className="bg-card rounded-xl border p-5 shadow-sm">
                            <h3 className="text-muted-foreground mb-6 text-xs font-bold uppercase">Detalles</h3>
                            <div className="space-y-5">
                                <div>
                                    <p className="text-muted-foreground text-[10px] font-bold uppercase">Estado</p>
                                    <Badge className="mt-1 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                        {ticket.status?.name || 'S/D'}
                                    </Badge>
                                </div>
                                <Separator />
                                <div>
                                    <p className="text-muted-foreground text-[10px] font-bold uppercase">Departamento</p>
                                    <p className="text-sm font-medium">{ticket.department?.name || 'S/D'}</p>
                                </div>
                                <Separator />
                                <div>
                                    <p className="text-muted-foreground text-[10px] font-bold uppercase">Asignado a</p>

                                    <p className="text-sm font-medium">{ticket.assigned_user?.name || 'Sin asignar'}</p>
                                </div>
                                <Separator />
                                <div>
                                    <p className="text-muted-foreground text-[10px] font-bold uppercase">Fecha de creacion</p>

                                    <p className="text-sm font-medium">{ticket.creation_date || 'Sin asignar'}</p>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Línea de Tiempo Principal */}
                    <main className="bg-card rounded-xl border p-6 shadow-sm md:p-8">
                        <div className="mb-10 flex items-center gap-2">
                            <HistoryIcon className="h-5 w-5" />
                            <h2 className="text-xl font-bold">Línea de tiempo</h2>
                        </div>

                        {histories.length === 0 ? (
                            <div className="rounded-xl border-2 border-dashed py-20 text-center">
                                <Clock className="text-muted-foreground/20 mx-auto mb-2 h-10 w-10" />
                                <p className="text-muted-foreground">No hay historial para este ticket.</p>
                            </div>
                        ) : (
                            <div className="border-muted relative ml-3 space-y-10 border-l-2">
                                {histories.map((entry) => {
                                    const meta = actionMeta[entry.action_type] || actionMeta.internal_note;
                                    const Icon = meta.icon;
                                    console.log(entry);

                                    return (
                                        <div key={entry.id} className="relative pl-8">
                                            <span
                                                className={`ring-background absolute top-0 -left-[13px] flex h-6 w-6 items-center justify-center rounded-full ring-4 ${meta.tone}`}
                                            >
                                                <Icon className="h-3 w-3" />
                                            </span>

                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center justify-between">
                                                    <Badge variant="outline" className="text-[10px] font-bold uppercase">
                                                        {meta.label}
                                                    </Badge>
                                                    <span className="text-muted-foreground text-xs font-medium">{formatDate(entry.created_at)}</span>
                                                </div>

                                                <div className="bg-muted/30 rounded-lg border p-4">
                                                    <p className="mb-2 text-sm font-medium">
                                                        {entry.user?.name || 'Sistema'}{' '}
                                                        <span className="text-muted-foreground font-normal">{getActionText(entry)}</span>
                                                    </p>
                                                    {entry.action_type === 'assigned' && (
                                                        <div className="bg-background/50 flex items-center gap-2 rounded border p-2 font-mono text-xs">
                                                            <span className="font-bold text-emerald-500">{entry.assigned_to?.name}</span>
                                                        </div>
                                                    )}

                                                    {entry.action_type === 'department_transferred' && (
                                                        <div className="bg-background/50 flex items-center gap-2 rounded border p-2 font-mono text-xs">
                                                            <span className="text-red-400">{entry.previous_department?.name}</span>
                                                            <ArrowRightLeft className="h-3 w-3" />
                                                            <span className="font-bold text-amber-500">{entry.new_department?.name}</span>
                                                        </div>
                                                    )}

                                                    {entry.internal_note && (
                                                        <p className="border-primary/20 mt-2 border-l-2 pl-3 text-sm text-zinc-600 italic dark:text-zinc-400">
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
