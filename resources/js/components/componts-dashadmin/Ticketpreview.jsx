import { X, User, Tag, Clock, Calendar, Building2, Paperclip, MessageSquare, AlertTriangle, CheckCircle2, CircleDot } from 'lucide-react';

// ─── helpers ──────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
    'Abierto':    { color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',   icon: CircleDot   },
    'En proceso': { color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Clock },
    'Resuelto':   { color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',  icon: CheckCircle2 },
    'Cerrado':    { color: 'bg-gray-100 text-gray-600 dark:bg-gray-700/40 dark:text-gray-400',    icon: CheckCircle2 },
    'Urgente':    { color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',       icon: AlertTriangle },
};

const PRIORITY_CONFIG = {
    'Urgente': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    'Alta':    'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    'Media':   'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    'Baja':    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

function InfoRow({ icon: Icon, label, value }) {
    if (!value) return null;
    return (
        <div className="flex items-start gap-3 py-2.5 border-b border-sidebar-border last:border-none">
            <Icon size={14} className="mt-0.5 shrink-0 text-gray-400" />
            <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">{label}</p>
                <p className="mt-0.5 text-sm text-gray-700 dark:text-gray-300 break-words">{value}</p>
            </div>
        </div>
    );
}

function initials(name = '') {
    return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();
}

// ─── componente principal ─────────────────────────────────────────────────────

/**
 * Drawer lateral de preview del ticket.
 *
 * Props:
 *  - ticket  : object | null  — ticket seleccionado (null = cerrado)
 *  - onClose : fn()           — cierra el drawer
 *
 * Campos del ticket que se muestran (mapeados a la BD):
 *  id, code, subject, message, status, priority, email,
 *  creation_date, expiration_date, closing_date,
 *  requesting_user { name }, assigned_user { name },
 *  department { name }, help_topic { name_topic },
 *  sla_plan { name, grace_time_hours },
 *  solutions [ { user { name }, message, date, type } ],
 *  histories [ { user { name }, action_type, internal_note, created_at } ]
 */
export default function TicketPreview({ ticket, onClose }) {
    const open = Boolean(ticket);

    return (
        <>
            {/* overlay */}
            <div
                className={`fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] transition-opacity duration-300 ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
                onClick={onClose}
            />

            {/* panel */}
            <div
                className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-lg flex-col border-l border-sidebar-border bg-white shadow-2xl transition-transform duration-300 dark:bg-sidebar ${open ? 'translate-x-0' : 'translate-x-full'}`}
            >
                {!ticket ? null : (
                    <>
                        {/* ── header ── */}
                        <div className="flex items-start justify-between border-b border-sidebar-border px-5 py-4">
                            <div className="min-w-0 flex-1 pr-3">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-mono text-[11px] text-gray-400">{ticket.code}</span>
                                    {ticket.status && (() => {
                                        const cfg = STATUS_CONFIG[ticket.status] ?? STATUS_CONFIG['Abierto'];
                                        const Icon = cfg.icon;
                                        return (
                                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${cfg.color}`}>
                                                <Icon size={11} />
                                                {ticket.status}
                                            </span>
                                        );
                                    })()}
                                    {ticket.priority && (
                                        <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${PRIORITY_CONFIG[ticket.priority] ?? ''}`}>
                                            {ticket.priority}
                                        </span>
                                    )}
                                </div>
                                <h2 className="mt-1.5 text-base font-medium text-gray-900 dark:text-white leading-snug">
                                    {ticket.subject}
                                </h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="shrink-0 rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-sidebar-accent"
                            >
                                <X size={17} className="text-gray-500" />
                            </button>
                        </div>

                        {/* ── cuerpo scrollable ── */}
                        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

                            {/* descripción del problema */}
                            {ticket.message && (
                                <div>
                                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                                        Descripción
                                    </p>
                                    <p className="rounded-lg bg-gray-50 p-3 text-sm leading-relaxed text-gray-700 dark:bg-sidebar-accent dark:text-gray-300">
                                        {ticket.message}
                                    </p>
                                </div>
                            )}

                            {/* datos principales */}
                            <div>
                                <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                                    Información general
                                </p>
                                <div className="rounded-xl border border-sidebar-border px-3">
                                    <InfoRow icon={User}      label="Solicitante"   value={ticket.requesting_user?.name} />
                                    <InfoRow icon={User}      label="Asignado a"    value={ticket.assigned_user?.name ?? 'Sin asignar'} />
                                    <InfoRow icon={Building2} label="Departamento"  value={ticket.department?.name} />
                                    <InfoRow icon={Tag}       label="Tema de ayuda" value={ticket.help_topic?.name_topic} />
                                    <InfoRow icon={Tag}       label="Plan SLA"      value={ticket.sla_plan ? `${ticket.sla_plan.name} (${ticket.sla_plan.grace_time_hours}h)` : null} />
                                    <InfoRow icon={MessageSquare} label="Email contacto" value={ticket.email} />
                                </div>
                            </div>

                            {/* fechas */}
                            <div>
                                <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                                    Fechas
                                </p>
                                <div className="rounded-xl border border-sidebar-border px-3">
                                    <InfoRow icon={Calendar} label="Fecha creación"    value={ticket.creation_date} />
                                    <InfoRow icon={Clock}    label="Fecha vencimiento" value={ticket.expiration_date} />
                                    <InfoRow icon={Calendar} label="Fecha cierre"      value={ticket.closing_date ?? '—'} />
                                </div>
                            </div>

                            {/* adjunto */}
                            {ticket.attach && (
                                <div>
                                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                                        Adjunto
                                    </p>
                                    <a
                                        href={ticket.attach}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-2 rounded-lg border border-sidebar-border px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/10"
                                    >
                                        <Paperclip size={13} />
                                        Ver adjunto
                                    </a>
                                </div>
                            )}

                            {/* soluciones / respuestas */}
                            {ticket.solutions?.length > 0 && (
                                <div>
                                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                                        Respuestas ({ticket.solutions.length})
                                    </p>
                                    <div className="space-y-2">
                                        {ticket.solutions.map((s, i) => (
                                            <div key={i} className="rounded-lg border border-sidebar-border p-3">
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-[9px] font-bold text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                                                            {initials(s.user?.name ?? '?')}
                                                        </div>
                                                        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                                            {s.user?.name ?? 'Sistema'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${s.type === 'internal_note' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-50 text-blue-600'}`}>
                                                            {s.type === 'internal_note' ? 'Nota interna' : 'Respuesta pública'}
                                                        </span>
                                                        <span className="text-[10px] text-gray-400">{s.date}</span>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{s.message}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* historial de acciones */}
                            {ticket.histories?.length > 0 && (
                                <div>
                                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                                        Historial de cambios
                                    </p>
                                    <div className="space-y-1">
                                        {ticket.histories.map((h, i) => (
                                            <div key={i} className="flex gap-3 py-2 border-b border-sidebar-border last:border-none">
                                                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-sidebar-accent">
                                                    <span className="text-[8px] font-bold text-gray-500">{initials(h.user?.name ?? '?')}</span>
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs text-gray-700 dark:text-gray-300">
                                                        <span className="font-medium">{h.user?.name ?? 'Sistema'}</span>
                                                        {' — '}
                                                        <span className="text-gray-500">{h.action_type}</span>
                                                    </p>
                                                    {h.internal_note && (
                                                        <p className="mt-0.5 text-[11px] text-gray-400 italic">{h.internal_note}</p>
                                                    )}
                                                    <p className="mt-0.5 text-[10px] text-gray-400">{h.created_at}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ── footer ── */}
                        <div className="border-t border-sidebar-border px-5 py-3">
                            <button
                                onClick={onClose}
                                className="w-full rounded-lg border border-sidebar-border py-2 text-sm text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-sidebar-accent"
                            >
                                Cerrar
                            </button>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}