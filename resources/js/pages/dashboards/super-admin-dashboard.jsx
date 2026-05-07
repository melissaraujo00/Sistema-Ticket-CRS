import { router, usePage } from '@inertiajs/react';
import { useCallback, useState } from 'react';
import { AlertTriangle, CalendarRange, CheckCircle2, Clock, FileText } from 'lucide-react';
import {
    Area, AreaChart, Bar, BarChart, Cell,
    Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';

import { DashCard, KpiCard } from '@/components/componts-dashadmin/dash-components';
import ExportModal            from '@/components/componts-dashadmin/Exportmodal';
import TicketPreview          from '@/components/componts-dashadmin/Ticketpreview';
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