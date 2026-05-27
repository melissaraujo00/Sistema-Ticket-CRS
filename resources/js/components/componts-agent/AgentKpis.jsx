import React from 'react';
import { AlertCircle, Clock, CheckCircle2 } from 'lucide-react';

export default function AgentKpis({ stats }) {
    const defaultStats = stats || {
        total_tickets_asignados: 0,
        total_tickets_proceso: 0,
        total_tickets_resueltos: 0
    };

    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="group relative flex flex-col overflow-hidden rounded-xl border border-red-50 bg-gradient-to-br from-red-50 to-red-100 p-5 shadow-sm transition-all hover:border-red-100 hover:shadow-md">
                <div className="mb-1 text-sm font-semibold text-red-700">Tickets Asignados</div>
                <div className="text-3xl font-bold text-red-800">{defaultStats.total_tickets_asignados}</div>
                <AlertCircle
                    className="absolute top-1/2 right-5 h-8 w-8 -translate-y-1/2 text-red-300 transition-colors group-hover:text-red-400"
                    opacity={0.8}
                />
            </div>

            <div className="group relative flex flex-col overflow-hidden rounded-xl border border-orange-50 bg-gradient-to-br from-orange-50 to-orange-100 p-5 shadow-sm transition-all hover:border-orange-100 hover:shadow-md">
                <div className="mb-1 text-sm font-semibold text-orange-700">En Proceso</div>
                <div className="text-3xl font-bold text-orange-800">{defaultStats.total_tickets_proceso}</div>
                <Clock
                    className="absolute top-1/2 right-5 h-8 w-8 -translate-y-1/2 text-orange-300 transition-colors group-hover:text-orange-400"
                    opacity={0.8}
                />
            </div>

            <div className="group relative flex flex-col overflow-hidden rounded-xl border border-green-50 bg-gradient-to-br from-green-50 to-green-100 p-5 shadow-sm transition-all hover:border-green-100 hover:shadow-md">
                <div className="mb-1 text-sm font-semibold text-green-700">Total Resueltos</div>
                <div className="text-3xl font-bold text-green-800">{defaultStats.total_tickets_resueltos}</div>
                <CheckCircle2
                    className="absolute top-1/2 right-5 h-8 w-8 -translate-y-1/2 text-green-300 transition-colors group-hover:text-green-400"
                    opacity={0.8}
                />
            </div>
        </div>
    );
}
