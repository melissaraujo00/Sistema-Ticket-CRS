import { TrendingDown, TrendingUp } from 'lucide-react';

// ─── KpiCard ──────────────────────────────────────────────────────────────────
export function KpiCard({ icon: Icon, iconBg, iconColor, value, label, delta, positive }) {
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

// ─── DashCard ─────────────────────────────────────────────────────────────────
export function DashCard({ title, subtitle, action, children, className = '' }) {
    return (
        <div className={`rounded-xl border border-sidebar-border bg-white dark:bg-sidebar ${className}`}>
            {(title || action) && (
                <div className="flex items-start justify-between border-b border-sidebar-border px-4 py-3">
                    <div>
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">{title}</h3>
                        {subtitle && <p className="mt-0.5 text-[11px] text-gray-500">{subtitle}</p>}
                    </div>
                    {action && <div>{action}</div>}
                </div>
            )}
            <div className="p-4">{children}</div>
        </div>
    );
}

// ─── ProgressBar ──────────────────────────────────────────────────────────────
function getProgressColor(pct) {
    if (pct === 100) return '#10b981';
    if (pct >= 50)   return '#3b82f6';
    if (pct >= 25)   return '#f59e0b';
    return '#ef4444';
}

export function ProgressBar({ pct }) {
    const color = getProgressColor(pct);
    return (
        <div className="flex items-center justify-end gap-2">
            <span className="w-8 text-right text-[11px] font-medium" style={{ color }}>
                {pct}%
            </span>
            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, background: color }}
                />
            </div>
        </div>
    );
}