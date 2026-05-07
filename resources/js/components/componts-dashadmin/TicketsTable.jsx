import { useState } from 'react';
import { Download } from 'lucide-react';
// import { ProgressBar } from '@/components/componts-dashadmin/dash-components';

const PAGE_SIZE = 6;

const PRIORITY_STYLES = {
    Critico: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    Alta:    'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    Media:   'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    Baja:    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

function initials(name) {
    return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

// Un solo agente asignado
function AgentBadge({ agent }) {
    if (!agent) return <span className="text-xs text-gray-400">Sin asignar</span>;
    return (
        <div className="flex items-center gap-2">
            <div
                title={agent.name}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-white text-[9px] font-bold text-white dark:border-gray-800"
                style={{ background: agent.color }}
            >
                {initials(agent.name)}
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400">{agent.name}</span>
        </div>
    );
}

export default function TicketsTable({ tickets = [], total = 0, onExport, onVerTodos, onSelectTicket }) {
    const [page, setPage] = useState(1);

    const totalPages  = Math.max(1, Math.ceil(tickets.length / PAGE_SIZE));
    const start       = (page - 1) * PAGE_SIZE;
    const pageTickets = tickets.slice(start, start + PAGE_SIZE);

    // Reinicia a página 1 si los tickets cambian (ej. filtro de fecha)
    const safePage = page > totalPages ? 1 : page;
    if (safePage !== page) setPage(safePage);

    // Páginas a mostrar (máx 3 botones numéricos)
    const pageNumbers = [];
    const rangeStart = Math.max(1, safePage - 1);
    const rangeEnd   = Math.min(totalPages, rangeStart + 2);
    for (let i = rangeStart; i <= rangeEnd; i++) pageNumbers.push(i);

    return (
        <div className="rounded-xl border border-sidebar-border bg-white dark:bg-sidebar">

            {/* encabezado */}
            <div className="flex items-center justify-between border-b border-sidebar-border px-5 py-4">
                <div>
                    <h3 className="text-base font-medium text-gray-900 dark:text-white">Tickets activos</h3>
                    <p className="mt-0.5 text-xs text-gray-400">
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                            {tickets.filter(t => t.status === 'Resuelto' || t.status === 'Cerrado').length} resueltos
                        </span>{' '}
                        en el período
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onExport}
                        className="flex items-center gap-1.5 rounded-lg border border-sidebar-border px-3 py-1.5 text-[11px] font-medium text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-sidebar-accent"
                    >
                        <Download size={13} />
                        Exportar
                    </button>
                    <button
                        onClick={onVerTodos}
                        className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-medium text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400"
                    >
                        Ver todos
                    </button>
                </div>
            </div>

            {/* tabla */}
            <div className="overflow-x-auto">
                <table className="w-full min-w-[640px]">
                    <thead>
                        <tr className="border-b border-sidebar-border">
                            <th className="py-2.5 pl-5 pr-3 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400">Ticket</th>
                            <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400">Agente asignado</th>
                            <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400">Prioridad</th>
                            <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-widest text-gray-400">Departamento</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-sidebar-border">
                        {pageTickets.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="py-10 text-center text-sm text-gray-400">
                                    No hay tickets en este período
                                </td>
                            </tr>
                        ) : (
                            pageTickets.map((t) => (
                                <tr
                                    key={t.id}
                                    onClick={() => onSelectTicket?.(t)}
                                    className="group cursor-pointer transition-colors hover:bg-blue-50/50 dark:hover:bg-sidebar-accent"
                                    title="Click para ver detalle"
                                >
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
                                        {/* Solo el primer agente = el asignado */}
                                        <AgentBadge agent={t.agents?.[0] ?? null} />
                                    </td>
                                    <td className="px-3 py-3">
                                        {t.priority ? (
                                            <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-medium ${PRIORITY_STYLES[t.priority] ?? 'bg-gray-100 text-gray-600'}`}>
                                                {t.priority}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-gray-400">No asignado</span>
                                        )}
                                    </td>
                                   <td className="px-3 py-3">
                                        <span className="text-xs text-gray-600 dark:text-gray-400">
                                        {t.department_name ?? '—'}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* footer con paginación funcional */}
            <div className="flex items-center justify-between border-t border-sidebar-border px-5 py-3">
                <p className="text-[11px] text-gray-400">
                    Mostrando{' '}
                    <span className="font-medium text-gray-600 dark:text-gray-300">
                        {tickets.length === 0 ? 0 : start + 1}–{Math.min(start + PAGE_SIZE, tickets.length)}
                    </span>{' '}
                    de{' '}
                    <span className="font-medium text-gray-600 dark:text-gray-300">{tickets.length}</span>{' '}
                    tickets
                </p>
                <div className="flex gap-1">
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={safePage === 1}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-xs text-gray-500 hover:bg-gray-100 disabled:opacity-30 dark:hover:bg-gray-700"
                    >
                        ←
                    </button>
                    {pageNumbers.map((n) => (
                        <button
                            key={n}
                            onClick={() => setPage(n)}
                            className={`flex h-7 w-7 items-center justify-center rounded-md text-xs transition-colors ${
                                n === safePage
                                    ? 'bg-blue-500 font-semibold text-white'
                                    : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                        >
                            {n}
                        </button>
                    ))}
                    <button
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={safePage === totalPages}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-xs text-gray-500 hover:bg-gray-100 disabled:opacity-30 dark:hover:bg-gray-700"
                    >
                        →
                    </button>
                </div>
            </div>
        </div>
    );
}