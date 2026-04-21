import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { AlertTriangle, CheckCircle2, Clock, FileText } from 'lucide-react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

import { DashCard, KpiCard } from '@/components/componts-dashadmin/dash-components';
import TicketsTable           from '@/components/componts-dashadmin/TicketsTable';

// // ─── breadcrumbs ──────────────────────────────────────────────────────────────

// const breadcrumbs = [{ title: 'Dashboard', href: '/dashboard' }];

// ─── datos estáticos ──────────────────────────────────────────────────────────
// TODO: reemplazar con props de Inertia:
// export default function SuperAdminDashboard({ kpis, ticketsByMonth, ... }) {

const ticketsByMonth = [
    { mes: 'Ene', abiertos: 28, resueltos: 20 },
    { mes: 'Feb', abiertos: 35, resueltos: 30 },
    { mes: 'Mar', abiertos: 22, resueltos: 18 },
    { mes: 'Abr', abiertos: 40, resueltos: 35 },
    { mes: 'May', abiertos: 30, resueltos: 28 },
    { mes: 'Jun', abiertos: 45, resueltos: 40 },
    { mes: 'Jul', abiertos: 38, resueltos: 34 },
    { mes: 'Ago', abiertos: 52, resueltos: 48 },
    { mes: 'Sep', abiertos: 41, resueltos: 38 },
    { mes: 'Oct', abiertos: 36, resueltos: 30 },
    { mes: 'Nov', abiertos: 27, resueltos: 22 },
    { mes: 'Dic', abiertos: 32, resueltos: 28 },
];

const byCategory = [
    { name: 'IT',        value: 38, color: '#3b82f6' },
    { name: 'RRHH',      value: 24, color: '#10b981' },
    { name: 'Logística', value: 20, color: '#f59e0b' },
    { name: 'Transporte',     value: 18, color: '#8666d0' },
    { name: 'Servicios generales',     value: 18, color: '#f65c5c' },
    { name: 'Contabilidad',     value: 18, color: '#5cd5f6' },
    { name: 'Bodega',     value: 18, color: '#ff0000' },


];

const byPriority = [
    { name: 'Baja',    total: 15, color: '#10b981' },
    { name: 'Media',   total: 42, color: '#3b82f6' },
    { name: 'Alta',    total: 27, color: '#f59e0b' },
    { name: 'Critica', total: 13, color: '#ef4444' },
];

// ─── página ───────────────────────────────────────────────────────────────────

export default function SuperAdminDashboard() {
    return (
        // <AppLayout breadcrumbs={breadcrumbs}>
            // <Head title="Dashboard" />

            <div className="flex flex-col gap-5 p-5">

                {/* ── 1. KPI cards ──────────────────────────────────────── */}
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    <KpiCard
                        icon={FileText}
                        iconBg="bg-blue-50 dark:bg-blue-900/20"
                        iconColor="text-blue-500"
                        value="142"
                        label="Tickets totales"
                        delta="+18.2%"
                        positive
                    />
                    <KpiCard
                        icon={AlertTriangle}
                        iconBg="bg-yellow-50 dark:bg-yellow-900/20"
                        iconColor="text-yellow-500"
                        value="27"
                        label="Tickets abiertos"
                        delta="-8.7%"
                        positive={false}
                    />
                    <KpiCard
                        icon={CheckCircle2}
                        iconBg="bg-green-50 dark:bg-green-900/20"
                        iconColor="text-green-500"
                        value="98"
                        label="Tickets resueltos"
                        delta="+4.3%"
                        positive
                    />
                    <KpiCard
                        icon={Clock}
                        iconBg="bg-red-50 dark:bg-red-900/20"
                        iconColor="text-red-500"
                        value="13"
                        label="Vencidos / SLA"
                        delta="-2.5%"
                        positive={false}
                    />
                </div>

                {/* ── 2. Gráficas ───────────────────────────────────────── */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

                    {/* Área — tickets por mes (2 columnas) */}
                    <div className="lg:col-span-2">
                        <DashCard
                            title="Tickets por mes"
                            subtitle="Resumen del año actual"
                            action={
                                <div className="flex gap-3 text-[11px] text-gray-500">
                                    <span className="flex items-center gap-1.5">
                                        <span className="h-2 w-2 rounded-full bg-blue-500" />
                                        Abiertos
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                        Resueltos
                                    </span>
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
                                        <Tooltip
                                            contentStyle={{ fontSize: 12, borderRadius: 8, border: '0.5px solid #e5e7eb' }}
                                            labelStyle={{ fontWeight: 500 }}
                                        />
                                        <Area type="monotone" dataKey="abiertos"  stroke="#3b82f6" strokeWidth={2} fill="url(#gradOpen)"     dot={false} name="Abiertos" />
                                        <Area type="monotone" dataKey="resueltos" stroke="#10b981" strokeWidth={2} fill="url(#gradResolved)" dot={false} name="Resueltos" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </DashCard>
                    </div>

                    {/* Donut — por categoría */}
                    <DashCard title="Por categoría">
                        <div style={{ height: 160 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={byCategory}
                                        cx="50%" cy="50%"
                                        innerRadius={45} outerRadius={70}
                                        dataKey="value"
                                        paddingAngle={2}
                                    >
                                        {byCategory.map((c) => <Cell key={c.name} fill={c.color} />)}
                                    </Pie>
                                    <Tooltip
                                        formatter={(v, n) => [`${v}%`, n]}
                                        contentStyle={{ fontSize: 12, borderRadius: 8, border: '0.5px solid #e5e7eb' }}
                                    />
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
                    </DashCard>

                    {/* Barras — por prioridad */}
                    <DashCard title="Por prioridad">
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
                    </DashCard>

                    {/* Métricas rápidas + agentes destacados */}
                    <div className="flex flex-col gap-4">
                        <DashCard title="Resumen rápido">
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    { n: '3.2h', l: 'Tiempo prom. respuesta' },
                                    { n: '87%',  l: 'Satisfacción usuarios'  },
                                    { n: '12',   l: 'Agentes activos'        },
                                    { n: '94%',  l: 'Cumplimiento SLA'       },
                                ].map((m) => (
                                    <div key={m.l} className="rounded-lg bg-gray-50 p-3 text-center dark:bg-sidebar-accent">
                                        <p className="text-xl font-medium text-gray-900 dark:text-white">{m.n}</p>
                                        <p className="mt-0.5 text-[10px] leading-tight text-gray-500">{m.l}</p>
                                    </div>
                                ))}
                            </div>
                        </DashCard>

                        <DashCard title="Agentes destacados">
                            <div className="flex flex-col gap-2.5">
                                {[
                                    { name: 'Carlos Mendoza', tickets: 18, pct: 90 },
                                    { name: 'Ana Villanueva', tickets: 14, pct: 70 },
                                    { name: 'Luis Herrera',   tickets: 11, pct: 55 },
                                    { name: 'María González', tickets:  9, pct: 45 },
                                ].map((a) => (
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
                        </DashCard>
                    </div>
                </div>

                {/* ── 3. Tabla tickets activos ──────────────────────────── */}
                <TicketsTable />

            </div>
        // </AppLayout>
    );
}