import { router, usePage } from '@inertiajs/react';
import { useCallback, useState } from 'react';
import { AlertTriangle, CalendarRange, CheckCircle2, Clock, FileText } from 'lucide-react';
import {
    Area, AreaChart, Bar, BarChart, Cell,
    Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';

import { DashCard, KpiCard } from '@/components/componts-dashadmin/dash-components';
import ExportModal            from '@/components/componts-dashadmin/ExportModal';
import TicketPreview          from '@/components/componts-dashadmin/TicketPreview';
import TicketsTable           from '@/components/componts-dashadmin/TicketsTable';

export default function SuperAdminDashboard() {
    // ── datos desde Inertia ───────────────────────────────────────────────────
    const { dashboardData, filters } = usePage().props;

    const {
        kpis           = {},
        ticketsByMonth = [],
        byCategory     = [],
        byPriority     = [],
        resumen        = [],
        agentes        = [],
        tickets        = [],
    } = dashboardData ?? {};

    // ── estado local UI ───────────────────────────────────────────────────────
    const [dateRange,      setDateRange]      = useState({ from: filters?.from ?? '', to: filters?.to ?? '' });
    const [exportOpen,     setExportOpen]     = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);

    const hasFilter = dateRange.from || dateRange.to;

    // ── filtro: recarga el dashboard con parámetros GET ───────────────────────
    const applyFilter = useCallback((range) => {
        router.get(
            route('dashboard'),
            { from: range.from || undefined, to: range.to || undefined },
            { preserveState: true, preserveScroll: true }
        );
    }, []);

    const handleFromChange = (e) => {
        const next = { ...dateRange, from: e.target.value };
        setDateRange(next);
        if (next.from && next.to) applyFilter(next);
        else if (!next.from)      applyFilter(next);
    };

    const handleToChange = (e) => {
        const next = { ...dateRange, to: e.target.value };
        setDateRange(next);
        if (next.from && next.to) applyFilter(next);
        else if (!next.to)        applyFilter(next);
    };

    const clearFilter = () => {
        const next = { from: '', to: '' };
        setDateRange(next);
        applyFilter(next);
    };

    // ── datos para exportar ───────────────────────────────────────────────────
    const exportData = {
        kpis: [
            { label: 'Tickets totales',   value: String(kpis.total    ?? 0), delta: '' },
            { label: 'Tickets abiertos',  value: String(kpis.abiertos ?? 0), delta: '' },
            { label: 'Tickets resueltos', value: String(kpis.resueltos ?? 0), delta: '' },
            { label: 'Vencidos / SLA',    value: String(kpis.vencidos ?? 0), delta: '' },
        ],
        ticketsByMonth,
        byCategory,
        byPriority,
        resumen,
        agentes,
        tickets,
    };

    return (
        <div className="flex flex-col gap-5">

            {/* ── Barra superior ─────────────────────────────────────────── */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">Panel de control</h2>
                    <p className="text-xs text-gray-500">
                        {hasFilter
                            ? `Datos filtrados · ${tickets.length} tickets encontrados`
                            : 'Resumen general del sistema de tickets'}
                    </p>
                </div>

                <div className="flex items-center gap-2 rounded-xl border border-sidebar-border bg-white px-3 py-2 dark:bg-sidebar">
                    <CalendarRange size={15} className="shrink-0 text-gray-400" />
                    <div className="flex items-center gap-2">
                        <div className="flex flex-col">
                            <label className="text-[9px] font-semibold uppercase tracking-widest text-gray-400">Desde</label>
                            <input
                                type="date"
                                value={dateRange.from}
                                onChange={handleFromChange}
                                className="border-none bg-transparent text-xs text-gray-700 outline-none dark:text-gray-300"
                            />
                        </div>
                        <span className="text-gray-300">→</span>
                        <div className="flex flex-col">
                            <label className="text-[9px] font-semibold uppercase tracking-widest text-gray-400">Hasta</label>
                            <input
                                type="date"
                                value={dateRange.to}
                                onChange={handleToChange}
                                className="border-none bg-transparent text-xs text-gray-700 outline-none dark:text-gray-300"
                            />
                        </div>
                    </div>
                    {hasFilter && (
                        <button
                            onClick={clearFilter}
                            className="ml-1 rounded-md px-1.5 py-0.5 text-[10px] text-gray-400 hover:bg-red-50 hover:text-red-500"
                        >
                            Limpiar
                        </button>
                    )}
                </div>
            </div>

            {/* ── 1. KPI cards ───────────────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <KpiCard
                    icon={FileText}
                    iconBg="bg-blue-50 dark:bg-blue-900/20"
                    iconColor="text-blue-500"
                    value={kpis.total ?? 0}
                    label="Tickets totales"
                    delta={`${kpis.abiertos ?? 0} abiertos`}
                    positive
                />
                <KpiCard
                    icon={AlertTriangle}
                    iconBg="bg-yellow-50 dark:bg-yellow-900/20"
                    iconColor="text-yellow-500"
                    value={kpis.abiertos ?? 0}
                    label="Tickets abiertos"
                    delta={`${kpis.proceso ?? 0} en proceso`}
                    positive={false}
                />
                <KpiCard
                    icon={CheckCircle2}
                    iconBg="bg-green-50 dark:bg-green-900/20"
                    iconColor="text-green-500"
                    value={kpis.resueltos ?? 0}
                    label="Tickets resueltos"
                    delta="cerrados + resueltos"
                    positive
                />
                <KpiCard
                    icon={Clock}
                    iconBg="bg-red-50 dark:bg-red-900/20"
                    iconColor="text-red-500"
                    value={kpis.vencidos ?? 0}
                    label="Vencidos / SLA"
                    delta="fuera de plazo"
                    positive={false}
                />
            </div>

            {/* ── 2a. Fila 1: área + donut ────────────────────────────────── */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <DashCard
                        title="Tickets por mes"
                        subtitle={hasFilter
                            ? `Filtrado: ${dateRange.from || '…'} → ${dateRange.to || '…'}`
                            : `Año ${new Date().getFullYear()}`}
                        action={
                            <div className="flex gap-3 text-[11px] text-gray-500">
                                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-500" />Abiertos</span>
                                <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" />Resueltos</span>
                            </div>
                        }
                    >
                        <div style={{ height: 200 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={ticketsByMonth} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="gradOpen" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="gradResolved" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%"  stopColor="#10b981" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="mes" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                                    <YAxis                tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '0.5px solid #e5e7eb' }} labelStyle={{ fontWeight: 500 }} />
                                    <Area type="monotone" dataKey="abiertos"  stroke="#3b82f6" strokeWidth={2} fill="url(#gradOpen)"     dot={false} name="Abiertos" />
                                    <Area type="monotone" dataKey="resueltos" stroke="#10b981" strokeWidth={2} fill="url(#gradResolved)" dot={false} name="Resueltos" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </DashCard>
                </div>

                <DashCard title="Por categoría">
                    {byCategory.length === 0 ? (
                        <p className="py-8 text-center text-xs text-gray-400">Sin datos</p>
                    ) : (
                        <>
                            <div style={{ height: 160 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={byCategory} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={2}>
                                            {byCategory.map((c) => <Cell key={c.name} fill={c.color} />)}
                                        </Pie>
                                        <Tooltip formatter={(v, n) => [`${v}%`, n]} contentStyle={{ fontSize: 12, borderRadius: 8, border: '0.5px solid #e5e7eb' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                                {byCategory.map((c) => (
                                    <span key={c.name} className="flex items-center gap-1 text-[11px] text-gray-500">
                                        <span className="h-2 w-2 rounded-full" style={{ background: c.color }} />
                                        {c.name} {c.value}%
                                    </span>
                                ))}
                            </div>
                        </>
                    )}
                </DashCard>
            </div>

            {/* ── 2b. Fila 2: barras + resumen + agentes ─────────────────── */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <DashCard title="Por prioridad">
                    {byPriority.length === 0 ? (
                        <p className="py-8 text-center text-xs text-gray-400">Sin datos</p>
                    ) : (
                        <div style={{ height: 180 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={byPriority} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                                    <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                                    <YAxis                tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '0.5px solid #e5e7eb' }} />
                                    <Bar dataKey="total" radius={[4, 4, 0, 0]} name="Tickets">
                                        {byPriority.map((e) => <Cell key={e.name} fill={e.color} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </DashCard>

                <DashCard title="Resumen rápido">
                    <div className="grid grid-cols-2 gap-2">
                        {resumen.map((m) => (
                            <div key={m.l} className="rounded-lg bg-gray-50 p-3 text-center dark:bg-sidebar-accent">
                                <p className="text-xl font-medium text-gray-900 dark:text-white">{m.n}</p>
                                <p className="mt-0.5 text-[10px] leading-tight text-gray-500">{m.l}</p>
                            </div>
                        ))}
                    </div>
                </DashCard>

                <DashCard title="Agentes destacados">
                    {agentes.length === 0 ? (
                        <p className="py-4 text-center text-xs text-gray-400">Sin datos</p>
                    ) : (
                        <div className="flex flex-col gap-2.5">
                            {agentes.map((a) => (
                                <div key={a.name}>
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="font-medium text-gray-700 dark:text-gray-300">{a.name}</span>
                                        <span className="text-gray-400">{a.tickets} tickets</span>
                                    </div>
                                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                                        <div className="h-full rounded-full bg-blue-500" style={{ width: `${a.pct}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </DashCard>
            </div>

            {/* ── 3. Tabla ────────────────────────────────────────────────── */}
            <TicketsTable
                tickets={tickets}
                total={tickets.length}
                onExport={() => setExportOpen(true)}
                onVerTodos={() => router.visit(route('tickets.index'))}
                onSelectTicket={(t) => setSelectedTicket(t)}
            />

            {/* ── Modal exportación ───────────────────────────────────────── */}
            <ExportModal
                open={exportOpen}
                onClose={() => setExportOpen(false)}
                staticData={exportData}
                dateRange={dateRange}
            />

            {/* ── Preview lateral ─────────────────────────────────────────── */}
            <TicketPreview
                ticket={selectedTicket}
                onClose={() => setSelectedTicket(null)}
            />
        </div>
    );
}

// import { useMemo, useState } from 'react';
// import { AlertTriangle, CalendarRange, CheckCircle2, Clock, FileText } from 'lucide-react';
// import {
//     Area, AreaChart, Bar, BarChart, Cell,
//     Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
// } from 'recharts';

// import { DashCard, KpiCard } from '@/components/componts-dashadmin/dash-components';
// import ExportModal            from '@/components/componts-dashadmin/ExportModal';
// import TicketPreview          from '@/components/componts-dashadmin/TicketPreview';
// import TicketsTable           from '@/components/componts-dashadmin/TicketsTable';

// // ─── datos estáticos ──────────────────────────────────────────────────────────
// // TODO: reemplazar con props de Inertia cuando esté listo el backend
// // Nota: agents[0] = agente principal asignado (el que se muestra en la tabla)

// const ALL_TICKETS = [
//     {
//         id: '#TKT-0041', subject: 'Error crítico en módulo de RRHH',
//         categoryInitial: 'IT', categoryColor: '#3b82f6',
//         agents: [{ name: 'Carlos M.', color: '#3b82f6' }],
//         priority: 'Critico', progress: 60,
//         code: 'TKT-2026-0041', status: 'En proceso',
//         email: 'solicitante@crs.org.sv',
//         message: 'El módulo de gestión de RRHH presenta un error 500 al intentar guardar cambios en el perfil de empleados.',
//         creation_date: '2026-04-10', expiration_date: '2026-04-12', closing_date: null,
//         requesting_user: { name: 'Roberto Flores' },
//         assigned_user:   { name: 'Carlos Mendoza' },
//         department:      { name: 'Tecnología Informática' },
//         help_topic:      { name_topic: 'Errores de sistema' },
//         sla_plan:        { name: 'Crítico', grace_time_hours: 4 },
//         attach: null,
//         solutions: [
//             { user: { name: 'Carlos Mendoza' }, message: 'Se identificó conflicto en la migración de BD. Trabajando en rollback.', date: '2026-04-10', type: 'internal_note' },
//             { user: { name: 'Carlos Mendoza' }, message: 'Rollback aplicado. Sistema operativo, monitoreando estabilidad.', date: '2026-04-11', type: 'public_reply' },
//         ],
//         histories: [
//             { user: { name: 'Sistema' },        action_type: 'Ticket creado',    internal_note: '',                          created_at: '2026-04-10 08:15' },
//             { user: { name: 'Ana Villanueva' },  action_type: 'Asignado a técnico', internal_note: 'Asignado por prioridad crítica', created_at: '2026-04-10 08:30' },
//         ],
//     },
//     {
//         id: '#TKT-0040', subject: 'Solicitud de equipo logístico',
//         categoryInitial: 'LG', categoryColor: '#f59e0b',
//         agents: [{ name: 'María G.', color: '#8b5cf6' }],
//         priority: null, progress: 10,
//         code: 'TKT-2026-0040', status: 'Abierto',
//         email: 'logistica@crs.org.sv',
//         message: 'Se requiere la adquisición de 3 tablets para el equipo de logística de campo.',
//         creation_date: '2026-04-08', expiration_date: '2026-04-22', closing_date: null,
//         requesting_user: { name: 'Laura Martínez' },
//         assigned_user:   { name: 'María González' },
//         department:      { name: 'Logística' },
//         help_topic:      { name_topic: 'Solicitud de equipo' },
//         sla_plan:        { name: 'Estándar', grace_time_hours: 72 },
//         attach: null, solutions: [],
//         histories: [{ user: { name: 'Sistema' }, action_type: 'Ticket creado', internal_note: '', created_at: '2026-04-08 09:00' }],
//     },
//     {
//         id: '#TKT-0039', subject: 'Falla en plataforma de capacitación',
//         categoryInitial: 'CP', categoryColor: '#10b981',
//         agents: [{ name: 'Pedro S.', color: '#ef4444' }],
//         priority: 'Media', progress: 100,
//         code: 'TKT-2026-0039', status: 'Resuelto',
//         email: 'capacitacion@crs.org.sv',
//         message: 'La plataforma e-learning no permite cargar videos. Error 413 al subir archivos mayores a 10MB.',
//         creation_date: '2026-04-05', expiration_date: '2026-04-09', closing_date: '2026-04-08',
//         requesting_user: { name: 'Carmen López' },
//         assigned_user:   { name: 'Pedro Sánchez' },
//         department:      { name: 'Capacitación' },
//         help_topic:      { name_topic: 'Plataformas educativas' },
//         sla_plan:        { name: 'Normal', grace_time_hours: 24 },
//         attach: null,
//         solutions: [{ user: { name: 'Pedro Sánchez' }, message: 'Se aumentó límite a 50MB en nginx. Resuelto.', date: '2026-04-08', type: 'public_reply' }],
//         histories: [
//             { user: { name: 'Sistema' },        action_type: 'Ticket creado', internal_note: '',                       created_at: '2026-04-05 14:00' },
//             { user: { name: 'Pedro Sánchez' },  action_type: 'Resuelto',      internal_note: 'Configuración nginx OK', created_at: '2026-04-08 11:00' },
//         ],
//     },
//     {
//         id: '#TKT-0038', subject: 'Implementar app móvil de donaciones',
//         categoryInitial: 'DV', categoryColor: '#10b981',
//         agents: [{ name: 'Carlos M.', color: '#3b82f6' }],
//         priority: 'Alta', progress: 100,
//         code: 'TKT-2026-0038', status: 'Cerrado',
//         email: 'desarrollo@crs.org.sv',
//         message: 'Desarrollo e implementación de app móvil para recepción de donaciones en línea.',
//         creation_date: '2026-03-01', expiration_date: '2026-04-01', closing_date: '2026-03-30',
//         requesting_user: { name: 'Dirección General' },
//         assigned_user:   { name: 'Carlos Mendoza' },
//         department:      { name: 'Tecnología Informática' },
//         help_topic:      { name_topic: 'Desarrollo de software' },
//         sla_plan:        { name: 'Proyecto', grace_time_hours: 720 },
//         attach: null, solutions: [], histories: [],
//     },
//     {
//         id: '#TKT-0037', subject: 'Actualizar portal de voluntarios',
//         categoryInitial: 'WB', categoryColor: '#06b6d4',
//         agents: [{ name: 'Sandra L.', color: '#06b6d4' }],
//         priority: 'Baja', progress: 25,
//         code: 'TKT-2026-0037', status: 'En proceso',
//         email: 'voluntarios@crs.org.sv',
//         message: 'El portal de voluntarios necesita actualización de diseño y corrección de formularios.',
//         creation_date: '2026-04-12', expiration_date: '2026-04-26', closing_date: null,
//         requesting_user: { name: 'Coordinación Voluntarios' },
//         assigned_user:   { name: 'Sandra Luna' },
//         department:      { name: 'Comunicaciones' },
//         help_topic:      { name_topic: 'Portales web' },
//         sla_plan:        { name: 'Normal', grace_time_hours: 72 },
//         attach: null, solutions: [],
//         histories: [{ user: { name: 'Sistema' }, action_type: 'Ticket creado', internal_note: '', created_at: '2026-04-12 10:00' }],
//     },
//     {
//         id: '#TKT-0036', subject: 'Rediseño del portal administrativo',
//         categoryInitial: 'UX', categoryColor: '#f43f5e',
//         agents: [{ name: 'María G.', color: '#8b5cf6' }],
//         priority: 'Media', progress: 40,
//         code: 'TKT-2026-0036', status: 'En proceso',
//         email: 'admin@crs.org.sv',
//         message: 'Rediseño completo del portal administrativo para mejorar UX y optimizar flujos de trabajo.',
//         creation_date: '2026-04-01', expiration_date: '2026-04-30', closing_date: null,
//         requesting_user: { name: 'Gerencia Administrativa' },
//         assigned_user:   { name: 'María González' },
//         department:      { name: 'Administración' },
//         help_topic:      { name_topic: 'UX / Diseño' },
//         sla_plan:        { name: 'Proyecto', grace_time_hours: 240 },
//         attach: null, solutions: [], histories: [],
//     },
//     // ── 4 tickets extra para probar la paginación ──
//     {
//         id: '#TKT-0035', subject: 'Configurar servidor de correo institucional',
//         categoryInitial: 'IT', categoryColor: '#3b82f6',
//         agents: [{ name: 'Luis H.', color: '#f59e0b' }],
//         priority: 'Alta', progress: 80,
//         code: 'TKT-2026-0035', status: 'En proceso',
//         email: 'sistemas@crs.org.sv',
//         message: 'El servidor de correo presenta intermitencias en el envío de notificaciones automáticas del sistema.',
//         creation_date: '2026-04-14', expiration_date: '2026-04-18', closing_date: null,
//         requesting_user: { name: 'Jefatura IT' },
//         assigned_user:   { name: 'Luis Herrera' },
//         department:      { name: 'Tecnología Informática' },
//         help_topic:      { name_topic: 'Servidores' },
//         sla_plan:        { name: 'Urgente', grace_time_hours: 8 },
//         attach: null, solutions: [],
//         histories: [{ user: { name: 'Sistema' }, action_type: 'Ticket creado', internal_note: '', created_at: '2026-04-14 07:00' }],
//     },
//     {
//         id: '#TKT-0034', subject: 'Reportes de bodega no generan PDF',
//         categoryInitial: 'BD', categoryColor: '#8b5cf6',
//         agents: [{ name: 'Ana V.', color: '#10b981' }],
//         priority: 'Media', progress: 50,
//         code: 'TKT-2026-0034', status: 'En proceso',
//         email: 'bodega@crs.org.sv',
//         message: 'El módulo de bodega falla al intentar generar reportes en formato PDF. El proceso queda colgado.',
//         creation_date: '2026-04-13', expiration_date: '2026-04-20', closing_date: null,
//         requesting_user: { name: 'Encargado de Bodega' },
//         assigned_user:   { name: 'Ana Villanueva' },
//         department:      { name: 'Bodega' },
//         help_topic:      { name_topic: 'Reportes' },
//         sla_plan:        { name: 'Normal', grace_time_hours: 48 },
//         attach: null, solutions: [],
//         histories: [{ user: { name: 'Sistema' }, action_type: 'Ticket creado', internal_note: '', created_at: '2026-04-13 11:30' }],
//     },
//     {
//         id: '#TKT-0033', subject: 'Acceso denegado al módulo de RRHH',
//         categoryInitial: 'RH', categoryColor: '#10b981',
//         agents: [{ name: 'Carlos M.', color: '#3b82f6' }],
//         priority: 'Baja', progress: 15,
//         code: 'TKT-2026-0033', status: 'Abierto',
//         email: 'rrhh@crs.org.sv',
//         message: 'Dos usuarios del departamento de RRHH no pueden acceder al módulo de nómina. Error de permisos.',
//         creation_date: '2026-04-15', expiration_date: '2026-04-22', closing_date: null,
//         requesting_user: { name: 'RRHH - Coordinación' },
//         assigned_user:   { name: 'Carlos Mendoza' },
//         department:      { name: 'RRHH' },
//         help_topic:      { name_topic: 'Permisos y accesos' },
//         sla_plan:        { name: 'Estándar', grace_time_hours: 72 },
//         attach: null, solutions: [],
//         histories: [{ user: { name: 'Sistema' }, action_type: 'Ticket creado', internal_note: '', created_at: '2026-04-15 08:45' }],
//     },
//     {
//         id: '#TKT-0032', subject: 'Actualización de inventario no sincroniza',
//         categoryInitial: 'BD', categoryColor: '#8b5cf6',
//         agents: [{ name: 'Pedro S.', color: '#ef4444' }],
//         priority: 'Alta', progress: 35,
//         code: 'TKT-2026-0032', status: 'En proceso',
//         email: 'inventario@crs.org.sv',
//         message: 'Los cambios realizados en inventario no se sincronizan correctamente con el sistema central.',
//         creation_date: '2026-04-11', expiration_date: '2026-04-17', closing_date: null,
//         requesting_user: { name: 'Jefe de Inventario' },
//         assigned_user:   { name: 'Pedro Sánchez' },
//         department:      { name: 'Bodega' },
//         help_topic:      { name_topic: 'Sincronización de datos' },
//         sla_plan:        { name: 'Urgente', grace_time_hours: 12 },
//         attach: null, solutions: [],
//         histories: [{ user: { name: 'Sistema' }, action_type: 'Ticket creado', internal_note: '', created_at: '2026-04-11 15:00' }],
//     },
// ];

// const TICKETS_BY_MONTH_ALL = [
//     { mes: 'Ene', abiertos: 28, resueltos: 20, date: '2026-01' },
//     { mes: 'Feb', abiertos: 35, resueltos: 30, date: '2026-02' },
//     { mes: 'Mar', abiertos: 22, resueltos: 18, date: '2026-03' },
//     { mes: 'Abr', abiertos: 40, resueltos: 35, date: '2026-04' },
//     { mes: 'May', abiertos: 30, resueltos: 28, date: '2026-05' },
//     { mes: 'Jun', abiertos: 45, resueltos: 40, date: '2026-06' },
//     { mes: 'Jul', abiertos: 38, resueltos: 34, date: '2026-07' },
//     { mes: 'Ago', abiertos: 52, resueltos: 48, date: '2026-08' },
//     { mes: 'Sep', abiertos: 41, resueltos: 38, date: '2026-09' },
//     { mes: 'Oct', abiertos: 36, resueltos: 30, date: '2026-10' },
//     { mes: 'Nov', abiertos: 27, resueltos: 22, date: '2026-11' },
//     { mes: 'Dic', abiertos: 32, resueltos: 28, date: '2026-12' },
// ];

// const BY_CATEGORY = [
//     { name: 'IT',        value: 38, color: '#3b82f6' },
//     { name: 'RRHH',      value: 24, color: '#10b981' },
//     { name: 'Logística', value: 20, color: '#f59e0b' },
//     { name: 'Bodega',    value: 18, color: '#8b5cf6' },
// ];

// const BY_PRIORITY = [
//     { name: 'Baja',    total: 15, color: '#10b981' },
//     { name: 'Media',   total: 42, color: '#3b82f6' },
//     { name: 'Alta',    total: 27, color: '#f59e0b' },
//     { name: 'Critico', total: 13, color: '#ef4444' },
// ];

// const RESUMEN = [
//     { n: '3.2h', l: 'Tiempo prom. respuesta' },
//     { n: '87%',  l: 'Satisfacción usuarios'  },
//     { n: '12',   l: 'Agentes activos'        },
//     { n: '94%',  l: 'Cumplimiento SLA'       },
// ];

// const AGENTES = [
//     { name: 'Carlos Mendoza', tickets: 18, pct: 90 },
//     { name: 'Ana Villanueva', tickets: 14, pct: 70 },
//     { name: 'Luis Herrera',   tickets: 11, pct: 55 },
//     { name: 'María González', tickets:  9, pct: 45 },
// ];

// const KPIS_DATA = [
//     { label: 'Tickets totales',   value: '142', delta: '+18.2%' },
//     { label: 'Tickets abiertos',  value: '27',  delta: '-8.7%'  },
//     { label: 'Tickets resueltos', value: '98',  delta: '+4.3%'  },
//     { label: 'Vencidos / SLA',    value: '13',  delta: '-2.5%'  },
// ];

// // ─── componente ───────────────────────────────────────────────────────────────

// export default function SuperAdminDashboard() {
//     const [dateRange,      setDateRange]      = useState({ from: '', to: '' });
//     const [exportOpen,     setExportOpen]     = useState(false);
//     const [selectedTicket, setSelectedTicket] = useState(null);

//     const filteredTickets = useMemo(() => {
//         if (!dateRange.from && !dateRange.to) return ALL_TICKETS;
//         return ALL_TICKETS.filter((t) => {
//             const d = new Date(t.creation_date);
//             if (dateRange.from && d < new Date(dateRange.from)) return false;
//             if (dateRange.to   && d > new Date(dateRange.to))   return false;
//             return true;
//         });
//     }, [dateRange]);

//     const filteredByMonth = useMemo(() => {
//         if (!dateRange.from && !dateRange.to) return TICKETS_BY_MONTH_ALL;
//         return TICKETS_BY_MONTH_ALL.filter((r) => {
//             if (dateRange.from && r.date < dateRange.from.slice(0, 7)) return false;
//             if (dateRange.to   && r.date > dateRange.to.slice(0, 7))   return false;
//             return true;
//         });
//     }, [dateRange]);

//     const hasFilter = dateRange.from || dateRange.to;

//     const exportData = {
//         kpis:           KPIS_DATA,
//         ticketsByMonth: filteredByMonth,
//         byCategory:     BY_CATEGORY,
//         byPriority:     BY_PRIORITY,
//         resumen:        RESUMEN,
//         agentes:        AGENTES,
//         tickets:        filteredTickets,
//     };

//     return (
//         <div className="flex flex-col gap-5">

//             {/* ── Barra superior ────────────────────────────────────────── */}
//             <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
//                 <div>
//                     <h2 className="text-lg font-medium text-gray-900 dark:text-white">Panel de control</h2>
//                     <p className="text-xs text-gray-500">
//                         {hasFilter
//                             ? `Mostrando datos filtrados · ${filteredTickets.length} tickets encontrados`
//                             : 'Resumen general del sistema de tickets'}
//                     </p>
//                 </div>

//                 <div className="flex items-center gap-2 rounded-xl border border-sidebar-border bg-white px-3 py-2 dark:bg-sidebar">
//                     <CalendarRange size={15} className="shrink-0 text-gray-400" />
//                     <div className="flex items-center gap-2">
//                         <div className="flex flex-col">
//                             <label className="text-[9px] font-semibold uppercase tracking-widest text-gray-400">Desde</label>
//                             <input
//                                 type="date"
//                                 value={dateRange.from}
//                                 onChange={(e) => setDateRange((p) => ({ ...p, from: e.target.value }))}
//                                 className="border-none bg-transparent text-xs text-gray-700 outline-none dark:text-gray-300"
//                             />
//                         </div>
//                         <span className="text-gray-300">→</span>
//                         <div className="flex flex-col">
//                             <label className="text-[9px] font-semibold uppercase tracking-widest text-gray-400">Hasta</label>
//                             <input
//                                 type="date"
//                                 value={dateRange.to}
//                                 onChange={(e) => setDateRange((p) => ({ ...p, to: e.target.value }))}
//                                 className="border-none bg-transparent text-xs text-gray-700 outline-none dark:text-gray-300"
//                             />
//                         </div>
//                     </div>
//                     {hasFilter && (
//                         <button
//                             onClick={() => setDateRange({ from: '', to: '' })}
//                             className="ml-1 rounded-md px-1.5 py-0.5 text-[10px] text-gray-400 hover:bg-red-50 hover:text-red-500"
//                         >
//                             Limpiar
//                         </button>
//                     )}
//                 </div>
//             </div>

//             {/* ── 1. KPI cards ──────────────────────────────────────────── */}
//             <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
//                 <KpiCard icon={FileText}      iconBg="bg-blue-50 dark:bg-blue-900/20"      iconColor="text-blue-500"   value="142" label="Tickets totales"   delta="+18.2%" positive />
//                 <KpiCard icon={AlertTriangle} iconBg="bg-yellow-50 dark:bg-yellow-900/20" iconColor="text-yellow-500" value="27"  label="Tickets abiertos"  delta="-8.7%"  positive={false} />
//                 <KpiCard icon={CheckCircle2}  iconBg="bg-green-50 dark:bg-green-900/20"   iconColor="text-green-500"  value="98"  label="Tickets resueltos" delta="+4.3%"  positive />
//                 <KpiCard icon={Clock}         iconBg="bg-red-50 dark:bg-red-900/20"       iconColor="text-red-500"    value="13"  label="Vencidos / SLA"    delta="-2.5%"  positive={false} />
//             </div>

//             {/* ── 2a. Gráficas fila 1: área + donut ─────────────────────── */}
//             <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
//                 <div className="lg:col-span-2">
//                     <DashCard
//                         title="Tickets por mes"
//                         subtitle={hasFilter ? `Filtrado: ${dateRange.from || '…'} → ${dateRange.to || '…'}` : 'Resumen del año actual'}
//                         action={
//                             <div className="flex gap-3 text-[11px] text-gray-500">
//                                 <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-blue-500" />Abiertos</span>
//                                 <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-500" />Resueltos</span>
//                             </div>
//                         }
//                     >
//                         <div style={{ height: 200 }}>
//                             <ResponsiveContainer width="100%" height="100%">
//                                 <AreaChart data={filteredByMonth} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
//                                     <defs>
//                                         <linearGradient id="gradOpen" x1="0" y1="0" x2="0" y2="1">
//                                             <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.15} />
//                                             <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
//                                         </linearGradient>
//                                         <linearGradient id="gradResolved" x1="0" y1="0" x2="0" y2="1">
//                                             <stop offset="5%"  stopColor="#10b981" stopOpacity={0.15} />
//                                             <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
//                                         </linearGradient>
//                                     </defs>
//                                     <XAxis dataKey="mes" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
//                                     <YAxis                tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
//                                     <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '0.5px solid #e5e7eb' }} labelStyle={{ fontWeight: 500 }} />
//                                     <Area type="monotone" dataKey="abiertos"  stroke="#3b82f6" strokeWidth={2} fill="url(#gradOpen)"     dot={false} name="Abiertos" />
//                                     <Area type="monotone" dataKey="resueltos" stroke="#10b981" strokeWidth={2} fill="url(#gradResolved)" dot={false} name="Resueltos" />
//                                 </AreaChart>
//                             </ResponsiveContainer>
//                         </div>
//                     </DashCard>
//                 </div>

//                 <DashCard title="Por categoría">
//                     <div style={{ height: 160 }}>
//                         <ResponsiveContainer width="100%" height="100%">
//                             <PieChart>
//                                 <Pie data={BY_CATEGORY} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={2}>
//                                     {BY_CATEGORY.map((c) => <Cell key={c.name} fill={c.color} />)}
//                                 </Pie>
//                                 <Tooltip formatter={(v, n) => [`${v}%`, n]} contentStyle={{ fontSize: 12, borderRadius: 8, border: '0.5px solid #e5e7eb' }} />
//                             </PieChart>
//                         </ResponsiveContainer>
//                     </div>
//                     <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
//                         {BY_CATEGORY.map((c) => (
//                             <span key={c.name} className="flex items-center gap-1 text-[11px] text-gray-500">
//                                 <span className="h-2 w-2 rounded-full" style={{ background: c.color }} />
//                                 {c.name} {c.value}%
//                             </span>
//                         ))}
//                     </div>
//                 </DashCard>
//             </div>

//             {/* ── 2b. Gráficas fila 2: barras + resumen + agentes ───────── */}
//             <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
//                 <DashCard title="Por prioridad">
//                     <div style={{ height: 180 }}>
//                         <ResponsiveContainer width="100%" height="100%">
//                             <BarChart data={BY_PRIORITY} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
//                                 <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
//                                 <YAxis                tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
//                                 <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '0.5px solid #e5e7eb' }} />
//                                 <Bar dataKey="total" radius={[4, 4, 0, 0]} name="Tickets">
//                                     {BY_PRIORITY.map((e) => <Cell key={e.name} fill={e.color} />)}
//                                 </Bar>
//                             </BarChart>
//                         </ResponsiveContainer>
//                     </div>
//                 </DashCard>

//                 <DashCard title="Resumen rápido">
//                     <div className="grid grid-cols-2 gap-2">
//                         {RESUMEN.map((m) => (
//                             <div key={m.l} className="rounded-lg bg-gray-50 p-3 text-center dark:bg-sidebar-accent">
//                                 <p className="text-xl font-medium text-gray-900 dark:text-white">{m.n}</p>
//                                 <p className="mt-0.5 text-[10px] leading-tight text-gray-500">{m.l}</p>
//                             </div>
//                         ))}
//                     </div>
//                 </DashCard>

//                 <DashCard title="Agentes destacados">
//                     <div className="flex flex-col gap-2.5">
//                         {AGENTES.map((a) => (
//                             <div key={a.name}>
//                                 <div className="flex items-center justify-between text-xs">
//                                     <span className="font-medium text-gray-700 dark:text-gray-300">{a.name}</span>
//                                     <span className="text-gray-400">{a.tickets} tickets</span>
//                                 </div>
//                                 <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
//                                     <div className="h-full rounded-full bg-blue-500" style={{ width: `${a.pct}%` }} />
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 </DashCard>
//             </div>

//             {/* ── 3. Tabla tickets activos ───────────────────────────────── */}
//             <TicketsTable
//                 tickets={filteredTickets}
//                 total={filteredTickets.length}
//                 onExport={() => setExportOpen(true)}
//                 onVerTodos={() => window.location.href = '/tickets'}
//                 onSelectTicket={(t) => setSelectedTicket(t)}
//             />

//             {/* ── Modal exportación ──────────────────────────────────────── */}
//             <ExportModal
//                 open={exportOpen}
//                 onClose={() => setExportOpen(false)}
//                 staticData={exportData}
//                 dateRange={dateRange}
//             />

//             {/* ── Preview lateral del ticket ─────────────────────────────── */}
//             <TicketPreview
//                 ticket={selectedTicket}
//                 onClose={() => setSelectedTicket(null)}
//             />

//         </div>
//     );
// }