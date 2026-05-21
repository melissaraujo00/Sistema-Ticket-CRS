import React from 'react';
import { Search, Clock, Activity } from 'lucide-react';

export default function AgentFilters({
    searchTerm,
    setSearchTerm,
    priorityFilter,
    setPriorityFilter,
    statusFilter,
    setStatusFilter,
    availablePriorities,
    uniqueStatuses,
    activeView,
    setActiveView
}) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                    <input
                        type="text"
                        placeholder="Buscar ticket..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-lg border-none bg-gray-50 py-2 pr-4 pl-10 text-sm focus:ring-1 focus:ring-blue-100 outline-none"
                    />
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>

                <div className="flex items-center gap-3">
                    <select
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                        className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-100 cursor-pointer"
                    >
                        <option value="Todas las prioridades">Todas las prioridades</option>
                        {availablePriorities.map((priority) => (
                            <option key={priority} value={priority}>
                                {priority}
                            </option>
                        ))}
                    </select>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-red-100 cursor-pointer"
                    >
                        <option value="Todos los estados">Todos los estados</option>
                        {uniqueStatuses.map((status) => (
                            <option key={status} value={status}>
                                {status}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Quick Action Navigation Tabs */}
            <div className="mt-3 flex gap-2 border-t border-gray-100 pt-3">
                <button
                    onClick={() => setActiveView(activeView === 'historial' ? 'main' : 'historial')}
                    className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${activeView === 'historial'
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    <Clock className="h-4 w-4" /> Historial
                </button>
                <button
                    onClick={() => setActiveView(activeView === 'estadisticas' ? 'main' : 'estadisticas')}
                    className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${activeView === 'estadisticas'
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    <Activity className="h-4 w-4" /> Mis Estadísticas
                </button>
            </div>
        </div>
    );
}
