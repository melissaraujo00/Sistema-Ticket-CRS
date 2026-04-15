import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import {
    AlertTriangle,
    CheckCircle2,
    Clock,
    FileText,
    TrendingDown,
    TrendingUp,
} from 'lucide-react';
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

// ─── breadcrumbs ──────────────────────────────────────────────────────────────

const breadcrumbs = [
    { title: 'Dashboard', href: '/dashboard' },
];

// ─── datos estáticos ──────────────────────────────────────────────────────────
// TODO: conectar con props de Inertia cuando esté listo el backend
// export default function Dashboard({ kpis, ticketsByMonth, byCategory, byPriority, activeTickets }) {

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
    { name: 'Otros',     value: 18, color: '#8b5cf6' },
];

const byPriority = [
    { name: 'Baja',    total: 15, color: '#10b981' },
    { name: 'Media',   total: 42, color: '#3b82f6' },
    { name: 'Alta',    total: 27, color: '#f59e0b' },
    { name: 'Urgente', total: 13, color: '#ef4444' },
];

const activeTickets = [
    {
        id: '#TKT-0041',
        subject: 'Error crítico en módulo de RRHH',
        categoryInitial: 'IT',
        categoryColor: '#3b82f6',
        agents: [
            { name: 'Carlos M.',  color: '#3b82f6' },
            { name: 'Ana V.',     color: '#10b981' },
            { name: 'Luis H.',    color: '#f59e0b' },
        ],
        priority: 'Urgente',
        progress: 60,
    },
    {
        id: '#TKT-0040',
        subject: 'Solicitud de equipo logístico',
        categoryInitial: 'LG',
        categoryColor: '#f59e0b',
        agents: [{ name: 'María G.', color: '#8b5cf6' }],
        priority: null,
        progress: 10,
    },
    {
        id: '#TKT-0039',
        subject: 'Falla en plataforma de capacitación',
        categoryInitial: 'CP',
        categoryColor: '#10b981',
        agents: [
            { name: 'Pedro S.',  color: '#ef4444' },
            { name: 'Sandra L.', color: '#06b6d4' },
        ],
        priority: 'Media',
        progress: 100,
    },
    {
        id: '#TKT-0038',
        subject: 'Implementar app móvil de donaciones',
        categoryInitial: 'DV',
        categoryColor: '#10b981',
        agents: [
            { name: 'Carlos M.', color: '#3b82f6' },
            { name: 'Ana V.',    color: '#10b981' },
            { name: 'Luis H.',   color: '#f59e0b' },
            { name: 'Pedro S.',  color: '#ef4444' },
        ],
        priority: 'Alta',
        progress: 100,
    },
    {
        id: '#TKT-0037',
        subject: 'Actualizar portal de voluntarios',
        categoryInitial: 'WB',
        categoryColor: '#06b6d4',
        agents: [{ name: 'Sandra L.', color: '#06b6d4' }],
        priority: 'Baja',
        progress: 25,
    },
    {
        id: '#TKT-0036',
        subject: 'Rediseño del portal administrativo',
        categoryInitial: 'UX',
        categoryColor: '#f43f5e',
        agents: [
            { name: 'María G.', color: '#8b5cf6' },
            { name: 'Ana V.',   color: '#10b981' },
        ],
        priority: 'Media',
        progress: 40,
    },
];

// ─── helpers ──────────────────────────────────────────────────────────────────

const PRIORITY_STYLES = {
    Urgente: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    Alta:    'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    Media:   'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    Baja:    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

function progressColor(pct) {
    if (pct === 100) return '#10b981';
    if (pct >= 50)   return '#3b82f6';
    if (pct >= 25)   return '#f59e0b';
    return '#ef4444';
}

function initials(name) {
    return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

// ─── sub-componentes ──────────────────────────────────────────────────────────

function KpiCard({ icon: Icon, iconBg, iconColor, value, label, delta, positive }) {
    return (
        <div className="flex items-start gap-3 rounded-xl border border-sidebar-border bg-white p-4 dark:bg-sidebar">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
                <Icon size={20} className={iconColor} />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-2xl font-medium leading-none text-gray-900 dark:text-white">{value}</p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{label}</p>
                <p className={`mt-1.5 flex items-center gap-1 text-[11px] font-medium ${positive ? 'text-green-600' : 'text-red-500'}`}>
                    {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {delta} vs semana pasada
                </p>
            </div>
        </div>
    );
}

function Card({ title, subtitle, action, children }) {
    return (
        <div className="rounded-xl border border-sidebar-border bg-white dark:bg-sidebar">
            {(title || action) && (
                <div className="flex items-start justify-between border-b border-sidebar-border px-4 py-3">
                    <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">{title}</h3>
                        {subtitle && <p className="mt-0.5 text-[11px] text-gray-500">{subtitle}</p>}
                    </div>
                    {action}
                </div>
            )}
            <div className="p-4">{children}</div>
        </div>
    );
}

function AgentAvatars({ agents }) {
    return (
        <div className="flex -space-x-2">
            {agents.slice(0, 4).map((a, i) => (
                <div
                    key={i}
                    title={a.name}
                    className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-[9px] font-bold text-white dark:border-gray-800"
                    style={{ background: a.color, zIndex: agents.length - i }}
                >
                    {initials(a.name)}
                </div>
            ))}
            {agents.length > 4 && (
                <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-gray-200 text-[9px] font-semibold text-gray-600 dark:border-gray-800 dark:bg-gray-700">
                    +{agents.length - 4}
                </div>
            )}
        </div>
    );
}

function ProgressBar({ pct }) {
    const color = progressColor(pct);
    return (
        <div className="flex items-center justify-end gap-2">
            <span className="w-8 text-right text-[11px] font-medium" style={{ color }}>
                {pct}%
            </span>
            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
            </div>
        </div>
    );
}

// ─── página principal ─────────────────────────────────────────────────────────

export default function Dashboard() {
    return (
        <div>

            <div className="flex flex-col gap-5 p-5">

                {/* ── KPI cards ─────────────────────────────────────────── */}
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

                {/* ── Gráficas ──────────────────────────────────────────── */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

                    {/* Área — tickets por mes (2 columnas) */}
                    <div className="lg:col-span-2">
                        <Card
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
                                        <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                                        <Tooltip
                                            contentStyle={{ fontSize: 12, borderRadius: 8, border: '0.5px solid #e5e7eb' }}
                                            labelStyle={{ fontWeight: 500 }}
                                        />
                                        <Area type="monotone" dataKey="abiertos"  stroke="#3b82f6" strokeWidth={2} fill="url(#gradOpen)"     dot={false} name="Abiertos" />
                                        <Area type="monotone" dataKey="resueltos" stroke="#10b981" strokeWidth={2} fill="url(#gradResolved)" dot={false} name="Resueltos" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </div>

                    {/* Donut — por categoría */}
                    <Card title="Por categoría">
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
                    </Card>

                    {/* Barras — por prioridad */}
                    <Card title="Por prioridad">
                        <div style={{ height: 180 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={byPriority} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                                    <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                                    <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '0.5px solid #e5e7eb' }} />
                                    <Bar dataKey="total" radius={[4, 4, 0, 0]} name="Tickets">
                                        {byPriority.map((e) => <Cell key={e.name} fill={e.color} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Métricas rápidas + agentes destacados */}
                    <div className="flex flex-col gap-4">
                        <Card title="Resumen rápido">
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
                        </Card>

                        <Card title="Agentes destacados">
                            <div className="flex flex-col gap-2.5">
                                {[
                                    { name: 'Carlos Mendoza', tickets: 18, pct: 90 },
                                    { name: 'Ana Villanueva', tickets: 14, pct: 70 },
                                    { name: 'Luis Herrera',   tickets: 11, pct: 55 },
                                    { name: 'María González', tickets: 9,  pct: 45 },
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
                        </Card>
                    </div>
                </div>

                {/* ── Tabla tickets activos ─────────────────────────────── */}
                <div className="rounded-xl border border-sidebar-border bg-white dark:bg-sidebar">

                    <div className="flex items-start justify-between border-b border-sidebar-border px-5 py-4">
                        <div>
                            <h3 className="text-base font-medium text-gray-900 dark:text-white">Tickets activos</h3>
                            <p className="mt-0.5 text-xs text-gray-400">
                                <span className="font-medium text-gray-700 dark:text-gray-300">30 resueltos</span>{' '}
                                este mes
                            </p>
                        </div>
                        <a
                            //href={route('tickets.index')}
                            className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-medium text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400"
                        >
                            Ver todos
                        </a>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[640px]">
                            <thead>
                                <tr className="border-b border-sidebar-border">
                                    <th className="py-2.5 pl-5 pr-3 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400">Ticket</th>
                                    <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400">Agentes</th>
                                    <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400">Prioridad</th>
                                    <th className="py-2.5 pl-3 pr-5 text-right text-[10px] font-semibold uppercase tracking-widest text-gray-400">Progreso</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-sidebar-border">
                                {activeTickets.map((t) => (
                                    <tr key={t.id} className="group transition-colors hover:bg-gray-50 dark:hover:bg-sidebar-accent">

                                        <td className="py-3 pl-5 pr-3">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold text-white"
                                                    style={{ background: t.categoryColor }}
                                                >
                                                    {t.categoryInitial}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-800 group-hover:text-blue-600 dark:text-gray-200">
                                                        {t.subject}
                                                    </p>
                                                    <p className="font-mono text-[10px] text-gray-400">{t.id}</p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-3 py-3">
                                            <AgentAvatars agents={t.agents} />
                                        </td>

                                        <td className="px-3 py-3">
                                            {t.priority ? (
                                                <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-medium ${PRIORITY_STYLES[t.priority]}`}>
                                                    {t.priority}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-gray-400">No asignado</span>
                                            )}
                                        </td>

                                        <td className="py-3 pl-3 pr-5">
                                            <ProgressBar pct={t.progress} />
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex items-center justify-between border-t border-sidebar-border px-5 py-3">
                        <p className="text-[11px] text-gray-400">
                            Mostrando{' '}
                            <span className="font-medium text-gray-600 dark:text-gray-300">1–6</span>{' '}
                            de{' '}
                            <span className="font-medium text-gray-600 dark:text-gray-300">27</span>{' '}
                            tickets
                        </p>
                        <div className="flex gap-1">
                            {['←', '1', '2', '3', '→'].map((p) => (
                                <button
                                    key={p}
                                    className={`flex h-7 w-7 items-center justify-center rounded-md text-xs transition-colors ${
                                        p === '1'
                                            ? 'bg-blue-500 font-semibold text-white'
                                            : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
