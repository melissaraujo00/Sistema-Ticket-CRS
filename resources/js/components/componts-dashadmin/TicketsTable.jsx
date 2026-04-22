import { Download } from 'lucide-react';
import { ProgressBar } from '@/components/componts-dashadmin/dash-components';

const PRIORITY_STYLES = {
    Urgente: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    Alta:    'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    Media:   'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    Baja:    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

function initials(name) {
    return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
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

/**
 * Props:
 *  - tickets      : array
 *  - total        : number
 *  - onExport     : fn()          — abre el modal de exportación
 *  - onVerTodos   : fn()
 *  - onSelectTicket : fn(ticket)  — abre el preview lateral
 */
export default function TicketsTable({ tickets = [], total = 0, onExport, onVerTodos, onSelectTicket }) {
    return (
        <div className="rounded-xl border border-sidebar-border bg-white dark:bg-sidebar">

            {/* encabezado */}
            <div className="flex items-center justify-between border-b border-sidebar-border px-5 py-4">
                <div>
                    <h3 className="text-base font-medium text-gray-900 dark:text-white">Tickets activos</h3>
                    <p className="mt-0.5 text-xs text-gray-400">
                        <span className="font-medium text-gray-700 dark:text-gray-300">30 resueltos</span>{' '}
                        este mes — <span className="text-blue-500 cursor-pointer hover:underline" onClick={onVerTodos}>ver todos</span>
                    </p>
                </div>
                <button
                    onClick={onExport}
                    className="flex items-center gap-1.5 rounded-lg border border-sidebar-border px-3 py-1.5 text-[11px] font-medium text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-sidebar-accent"
                >
                    <Download size={13} />
                    Exportar
                </button>
            </div>

            {/* tabla */}
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
                        {tickets.map((t) => (
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

            {/* footer */}
            <div className="flex items-center justify-between border-t border-sidebar-border px-5 py-3">
                <p className="text-[11px] text-gray-400">
                    Mostrando{' '}
                    <span className="font-medium text-gray-600 dark:text-gray-300">1–{tickets.length}</span>{' '}
                    de{' '}
                    <span className="font-medium text-gray-600 dark:text-gray-300">{total}</span>{' '}
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
    );
}