import { Link } from '@inertiajs/react';
import axios from 'axios';
import { Activity, AlertCircle, CheckCircle2, Clock, Computer, Globe, Monitor, Search } from 'lucide-react';
import { useEffect, useState } from 'react';


export default function AgentDashboard() {
    const [ticketsAsignados, setTicketsAsignados] = useState([]);
    const [historialFinalizados, setHistorialFinalizados] = useState([]);
    const [estadisticas, setEstadisticas] = useState(null);

    const [activeView, setActiveView] = useState('main');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('Todos los estados');

    const [selectedTicketId, setSelectedTicketId] = useState(null);
    const [showDiagnosticPanel, setShowDiagnosticPanel] = useState(false);
    const [tipoDiagnostico, setTipoDiagnostico] = useState('');
    const [customDiagnosticType, setCustomDiagnosticType] = useState('');
    const [showCustomDiagnostic, setShowCustomDiagnostic] = useState(false);
    const [observacionDiagnostico, setObservacionDiagnostico] = useState('');
    const [adjuntosDiagnostico, setAdjuntosDiagnostico] = useState([]);
    const [diagnosticStatus, setDiagnosticStatus] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('/agent/dashboard-data');

                setTicketsAsignados(response.data.tickets_asignados || []);
                setHistorialFinalizados(response.data.historial_finalizados || []);
                setEstadisticas(response.data.estadisticas || null);
            } catch (error) {
                console.error('Error al obtener datos del dashboard:', error);
            }
        };

        fetchData();
    }, []);

    const historialData = historialFinalizados.map(ticket => ({
        id: ticket.id,
        asunto: ticket.subject || ticket.asunto,
        departamento: ticket.department?.name || 'N/A',
        fecha_asignacion: ticket.creation_date ? new Date(ticket.creation_date).toLocaleDateString('es-ES') : 'N/A',
        fecha_finalizacion: ticket.closing_date ? new Date(ticket.closing_date).toLocaleDateString('es-ES') : 'N/A',
    }));

    const stats = estadisticas || {
        tasa_resolucion_porcentaje: 0,
        total_tickets_cola: 0,
        total_tickets_asignados: 0,
        total_tickets_proceso: 0,
        total_tickets_resueltos: 0,
    };

    const finalTickets = ticketsAsignados;

    const uniqueStatuses = Array.from(new Set(finalTickets.map(t => t.estado || t.status?.name || 'N/A')));

    const displayedTickets = finalTickets.filter(ticket => {
        const matchesSearch = (ticket.asunto || ticket.subject || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                              String(ticket.id).toLowerCase().includes(searchTerm.toLowerCase());
        const ticketStatus = ticket.estado || ticket.status?.name || 'N/A';
        const matchesStatus = statusFilter === 'Todos los estados' || ticketStatus === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const submitDiagnostic = async () => {
        try {
            if (!selectedTicketId) {
                setDiagnosticStatus({ type: 'error', msg: 'Debe seleccionar un ticket.' });
                return;
            }

            if (!observacionDiagnostico.trim()) {
                setDiagnosticStatus({ type: 'error', msg: 'La observación es obligatoria.' });
                return;
            }

            if (adjuntosDiagnostico.length === 0) {
                setDiagnosticStatus({ type: 'error', msg: 'Debe adjuntar al menos un archivo.' });
                return;
            }

            const diagnosticType = showCustomDiagnostic && customDiagnosticType.trim()
                ? customDiagnosticType.trim()
                : (tipoDiagnostico || 'General');

            const formData = new FormData();
            formData.append('tipo_diagnostico', diagnosticType);
            formData.append('observacion', observacionDiagnostico);

            // Adjuntar múltiples archivos
            adjuntosDiagnostico.forEach(file => {
                formData.append('adjuntos[]', file);
            });

            await axios.post(`/agent/ticket/${selectedTicketId}/diagnostico`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setDiagnosticStatus({ type: 'success', msg: 'Diagnóstico guardado exitosamente.' });
            setTipoDiagnostico('');
            setCustomDiagnosticType('');
            setShowCustomDiagnostic(false);
            setObservacionDiagnostico('');
            setAdjuntosDiagnostico([]);
            setSelectedTicketId(null);
            setShowDiagnosticPanel(false);

            const response = await axios.get('/agent/dashboard-data');
            setTicketsAsignados(response.data.tickets_asignados || []);
            setHistorialFinalizados(response.data.historial_finalizados || []);
            setEstadisticas(response.data.estadisticas || null);

            setTimeout(() => setDiagnosticStatus(null), 3000);
        } catch (error) {
            console.error('Error al guardar diagnóstico:', error);
            setDiagnosticStatus({ type: 'error', msg: 'Ocurrió un error al guardar el diagnóstico.' });
        }
    };

    return (
        <div className="mx-auto flex h-full w-full flex-col space-y-6 p-4 font-sans text-gray-800 sm:p-6 md:p-6 lg:p-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-colors hover:border-red-200">
                    <div className="mb-1 text-sm font-semibold text-gray-600">Tickets Asignados</div>
                    <div className="text-3xl font-bold">{stats.total_tickets_asignados}</div>
                    <AlertCircle
                        className="absolute top-1/2 right-5 h-8 w-8 -translate-y-1/2 text-red-100 transition-colors group-hover:text-red-400"
                        opacity={0.6}
                    />
                </div>
                <div className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-colors hover:border-orange-200">
                    <div className="mb-1 text-sm font-semibold text-gray-600">En Proceso</div>
                    <div className="text-3xl font-bold">{stats.total_tickets_proceso}</div>
                    <Clock
                        className="absolute top-1/2 right-5 h-8 w-8 -translate-y-1/2 text-orange-100 transition-colors group-hover:text-orange-400"
                        opacity={0.6}
                    />
                </div>
                <div className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-colors hover:border-green-200">
                    <div className="mb-1 text-sm font-semibold text-gray-600">Total Resueltos</div>
                    <div className="text-3xl font-bold">{stats.total_tickets_resueltos}</div>
                    <CheckCircle2
                        className="absolute top-1/2 right-5 h-8 w-8 -translate-y-1/2 text-green-100 transition-colors group-hover:text-green-400"
                        opacity={0.6}
                    />
                </div>
            </div>

            {/* Search Bar & Filters */}
            <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder="Buscar ticket"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full rounded-lg border-none bg-gray-50 py-2 pr-4 pl-10 text-sm focus:ring-1 focus:ring-blue-100"
                        />
                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm focus:outline-none"
                    >
                        <option value="Todos los estados">Todos los estados</option>
                        {uniqueStatuses.map((status) => (
                            <option key={status} value={status}>
                                {status}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="mt-3 flex gap-2 border-t border-gray-100 pt-3">
                    <button
                        onClick={() => setActiveView(activeView === 'historial' ? 'main' : 'historial')}
                        className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                            activeView === 'historial' ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        <Clock className="h-4 w-4" /> Historial
                    </button>
                    <button
                        onClick={() => setActiveView(activeView === 'estadisticas' ? 'main' : 'estadisticas')}
                        className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                            activeView === 'estadisticas' ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        <Activity className="h-4 w-4" /> Mis Estadisticas
                    </button>
                </div>
            </div>

            {/* Historial de Tickets */}
            {activeView === 'historial' && (
                <div className="animate-in fade-in slide-in-from-top-4 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm duration-300">
                    <div className="flex items-center gap-2 border-b border-gray-100 p-4">
                        <Clock className="h-5 w-5 text-red-500" />
                        <h3 className="font-bold text-gray-800">Historial de Tickets</h3>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {historialData.map((ticket, idx) => (
                            <div key={idx} className="flex items-start justify-between p-4 transition-colors hover:bg-gray-50">
                                <div>
                                    <h4 className="text-sm font-bold text-gray-900">{ticket.asunto}</h4>
                                    <div className="mt-1 text-xs text-gray-500 uppercase">
                                        {ticket.id} | {ticket.departamento}
                                    </div>
                                    <div className="mt-1 text-xs text-gray-400">
                                        <span className="block">Asignado: {ticket.fecha_asignacion}</span>
                                        <span className="block">Finalizado: {ticket.fecha_finalizacion}</span>
                                    </div>
                                </div>
                                <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold whitespace-nowrap text-green-700">
                                    Resuelto
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Mis Estadísticas */}
            {activeView === 'estadisticas' && (
                <div className="animate-in fade-in slide-in-from-top-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm duration-300">
                    <div className="mb-4 flex items-center gap-2">
                        <Activity className="h-5 w-5 text-red-500" />
                        <h3 className="font-bold text-gray-800">Mis Estadisticas</h3>
                    </div>

                    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="flex flex-col justify-center rounded-lg border border-gray-100 bg-gray-50 p-4">
                            <div className="mb-1 text-xs font-semibold text-gray-500">Tasa de Resolucion</div>
                            <div className="text-xl font-bold">{stats.tasa_resolucion_porcentaje}%</div>
                        </div>
                        <div className="flex flex-col justify-center rounded-lg border border-gray-100 bg-gray-50 p-4">
                            <div className="mb-1 text-xs font-semibold text-gray-500">Tickets en Cola</div>
                            <div className="text-xl font-bold">{stats.total_tickets_cola}</div>
                        </div>
                        <div className="flex flex-col justify-center rounded-lg border border-gray-100 bg-gray-50 p-4">
                            <div className="mb-1 text-xs font-semibold text-gray-500">Total Procesados</div>
                            <div className="text-xl font-bold">{stats.total_tickets_resueltos}</div>
                        </div>
                    </div>

                    <div className="mt-2 mb-3 text-sm font-semibold text-gray-700">Distribucion por Prioridad</div>
                    <div className="space-y-3 px-2">
                        {(() => {
                            const priorityData = ticketsAsignados.reduce((acc, ticket) => {
                                const priority = ticket.prioridad || 'N/A';
                                acc[priority] = (acc[priority] || 0) + 1;
                                return acc;
                            }, {});

                            const totalTickets = ticketsAsignados.length;
                            const priorities = [
                                { name: 'Alta', color: 'bg-red-500', count: priorityData['Alta'] || 0 },
                                { name: 'Media', color: 'bg-yellow-400', count: priorityData['Media'] || 0 },
                                { name: 'Baja', color: 'bg-blue-500', count: priorityData['Baja'] || 0 },
                            ];

                            return priorities.map((priority) => {
                                const percentage = totalTickets > 0 ? (priority.count / totalTickets) * 100 : 0;
                                return (
                                    <div key={priority.name} className="flex items-center text-sm">
                                        <div className="w-16 text-xs text-gray-500">{priority.name}</div>
                                        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                                            <div className={`${priority.color} h-full rounded-full`} style={{ width: `${percentage}%` }}></div>
                                        </div>
                                        <div className="ml-2 w-4 text-right text-xs text-gray-500">{priority.count}</div>
                                    </div>
                                );
                            });
                        })()}
                    </div>
                </div>
            )}

            {/* Tickets Asignados (Tabla Principal) */}
            {(activeView === 'main' || activeView === 'historial' || activeView === 'estadisticas') && (
                <>
                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                        <div className="flex items-center gap-2 border-b border-gray-100 p-4">
                            <AlertCircle className="h-5 w-5 text-red-500" />
                            <h3 className="font-bold text-gray-800">Tickets Asignados</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm whitespace-nowrap md:whitespace-normal">
                                <thead className="bg-gray-50/50 text-xs font-bold tracking-wider text-red-600 uppercase">
                                    <tr>
                                        <th className="px-4 py-4">ID</th>
                                        <th className="px-4 py-4">Asunto</th>
                                        <th className="px-4 py-4">Departamento</th>
                                        <th className="px-4 py-4">Estado</th>
                                        <th className="px-4 py-4">Prioridad</th>
                                        <th className="px-4 py-4">Creado Por</th>
                                        <th className="px-4 py-4 text-center">Accion</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-gray-700">
                                    {displayedTickets.map((row, i) => (
                                        <tr key={i} className="transition-colors hover:bg-blue-50/30">
                                            <td className="px-4 py-4 text-xs font-semibold">{row.id}</td>
                                            <td className="min-w-[200px] px-4 py-4 text-xs leading-tight font-medium">{row.asunto || row.subject}</td>
                                            <td className="px-4 py-4 text-xs font-bold uppercase">{row.departamento || row.department?.name}</td>
                                            <td className="px-4 py-4 text-xs">
                                                {(() => {
                                                    const status = row.estado || row.status?.name || 'N/A';
                                                    const statusLower = status.toLowerCase();

                                                    if (statusLower === 'abierto' || statusLower === 'nuevo') {
                                                        return (
                                                            <span className="inline-flex items-center rounded-full border border-green-200 bg-green-100 px-2.5 py-1 text-xs font-bold text-green-800">
                                                                <span className="mr-1.5 h-2 w-2 animate-pulse rounded-full bg-green-500"></span>
                                                                {status}
                                                            </span>
                                                        );
                                                    } else if (
                                                        statusLower === 'en proceso' ||
                                                        statusLower === 'proceso' ||
                                                        statusLower === 'progreso' ||
                                                        statusLower === 'en progreso'
                                                    ) {
                                                        return (
                                                            <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-800">
                                                                <span className="mr-1.5 h-2 w-2 rounded-full bg-blue-500"></span>
                                                                {status}
                                                            </span>
                                                        );
                                                    } else if (
                                                        statusLower === 'cerrado' ||
                                                        statusLower === 'resuelto' ||
                                                        statusLower === 'finalizado'
                                                    ) {
                                                        return (
                                                            <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-800">
                                                                <span className="mr-1.5 h-2 w-2 rounded-full bg-gray-500"></span>
                                                                {status}
                                                            </span>
                                                        );
                                                    } else if (statusLower === 'pendiente' || statusLower === 'esperando') {
                                                        return (
                                                            <span className="inline-flex items-center rounded-full border border-orange-200 bg-orange-100 px-2.5 py-1 text-xs font-bold text-orange-800">
                                                                <span className="mr-1.5 h-2 w-2 animate-pulse rounded-full bg-orange-500"></span>
                                                                {status}
                                                            </span>
                                                        );
                                                    } else if (statusLower === 'cancelado') {
                                                        return (
                                                            <span className="inline-flex items-center rounded-full border border-red-200 bg-red-100 px-2.5 py-1 text-xs font-bold text-red-800">
                                                                <span className="mr-1.5 h-2 w-2 rounded-full bg-red-500"></span>
                                                                {status}
                                                            </span>
                                                        );
                                                    } else {
                                                        return (
                                                            <span className="inline-flex items-center rounded-full border border-purple-200 bg-purple-100 px-2.5 py-1 text-xs font-bold text-purple-800">
                                                                <span className="mr-1.5 h-2 w-2 rounded-full bg-purple-500"></span>
                                                                {status}
                                                            </span>
                                                        );
                                                    }
                                                })()}
                                            </td>
                                            <td className="px-4 py-4 text-xs">
                                                {(() => {
                                                    const priority = row.prioridad || row.priority?.name || 'N/A';
                                                    const priorityLower = priority.toLowerCase();

                                                    if (priorityLower === 'alta') {
                                                        return (
                                                            <span className="inline-flex items-center rounded-full border border-red-200 bg-red-100 px-2.5 py-1 text-xs font-bold text-red-800">
                                                                <span className="mr-1.5 h-2 w-2 animate-pulse rounded-full bg-red-500"></span>
                                                                {priority}
                                                            </span>
                                                        );
                                                    } else if (priorityLower === 'media' || priorityLower === 'normal') {
                                                        return (
                                                            <span className="inline-flex items-center rounded-full border border-yellow-200 bg-yellow-100 px-2.5 py-1 text-xs font-bold text-yellow-800">
                                                                <span className="mr-1.5 h-2 w-2 rounded-full bg-yellow-500"></span>
                                                                {priority}
                                                            </span>
                                                        );
                                                    } else if (priorityLower === 'baja') {
                                                        return (
                                                            <span className="inline-flex items-center rounded-full border border-blue-200 bg-blue-100 px-2.5 py-1 text-xs font-bold text-blue-800">
                                                                <span className="mr-1.5 h-2 w-2 rounded-full bg-blue-500"></span>
                                                                {priority}
                                                            </span>
                                                        );
                                                    } else {
                                                        return (
                                                            <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-800">
                                                                <span className="mr-1.5 h-2 w-2 rounded-full bg-gray-500"></span>
                                                                {priority}
                                                            </span>
                                                        );
                                                    }
                                                })()}
                                            </td>
                                            <td className="px-4 py-4 text-xs leading-tight text-gray-500">
                                                <div dangerouslySetInnerHTML={{ __html: (row.creado_por || '').replace('\n', '<br/>') }} />
                                            </td>
                                            <td className="flex min-w-[140px] flex-col items-center gap-1.5 px-4 py-4">
                                                <Link
                                                    href={`/agent/ticket/${row.id}`}
                                                    className="w-full max-w-[120px] rounded bg-blue-500 px-3 py-1.5 text-center text-[10px] font-bold text-white shadow-sm transition-colors hover:bg-blue-600"
                                                >
                                                    Ver Detalles
                                                </Link>
                                                {(() => {
                                                    const status = row.estado || row.status?.name || '';
                                                    const statusLower = status.toLowerCase();
                                                    const isClosedOrResolved =
                                                        statusLower === 'cerrado' || statusLower === 'resuelto' || statusLower === 'finalizado';

                                                    if (!isClosedOrResolved) {
                                                        return (
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedTicketId(row.id);
                                                                    setShowDiagnosticPanel(true);
                                                                    setTimeout(() => {
                                                                        document
                                                                            .getElementById('diagnostico-section')
                                                                            ?.scrollIntoView({ behavior: 'smooth' });
                                                                    }, 100);
                                                                }}
                                                                className="w-full max-w-[120px] rounded bg-red-500 px-3 py-1.5 text-[10px] font-bold text-white shadow-sm transition-colors hover:bg-red-600"
                                                            >
                                                                Realizar Diagnostico
                                                            </button>
                                                        );
                                                    } else {
                                                        return (
                                                            <div className="w-full max-w-[120px] px-3 py-1.5 text-center text-[10px] font-medium text-gray-400">
                                                                Ticket Cerrado
                                                            </div>
                                                        );
                                                    }
                                                })()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* Panel de Diagnóstico */}
            {showDiagnosticPanel && (
                <div
                    id="diagnostico-section"
                    className="animate-in fade-in slide-in-from-top-4 mt-8 mb-8 rounded-xl border border-gray-200 bg-white shadow-sm duration-300"
                >
                    <div className="flex items-center justify-between rounded-t-xl bg-red-600 p-4 text-white">
                        <h3 className="flex items-center gap-2 text-sm font-bold">
                            <Activity className="h-4 w-4" /> Plan de Diagnostico {selectedTicketId ? `- Ticket #${selectedTicketId}` : ''}
                        </h3>
                        <button
                            onClick={() => {
                                setShowDiagnosticPanel(false);
                                setSelectedTicketId(null);
                                setTipoDiagnostico('');
                                setCustomDiagnosticType('');
                                setShowCustomDiagnostic(false);
                                setObservacionDiagnostico('');
                                setAdjuntosDiagnostico([]);
                                setDiagnosticStatus(null);
                            }}
                            className="text-white transition-colors hover:text-red-200"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="p-6">
                        <p className="mb-4 text-[13px] font-medium text-gray-700">Seleccione el tipo de diagnóstico realizado (Opcional):</p>
                        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                            <button
                                onClick={() => setTipoDiagnostico('Problema de Hardware')}
                                className={`group flex flex-col items-center justify-center rounded-xl border-2 p-4 transition-all ${
                                    tipoDiagnostico === 'Problema de Hardware'
                                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                                        : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                                }`}
                            >
                                <span className="mb-1 text-sm font-bold text-gray-800">Problema de Hardware</span>
                                <span className="mb-3 text-center text-[10px] leading-tight text-gray-500">Falla en componentes físicos</span>
                                <Monitor
                                    className={`h-8 w-8 transition-colors ${tipoDiagnostico === 'Problema de Hardware' ? 'text-blue-600' : 'text-black group-hover:text-blue-600'}`}
                                />
                            </button>

                            <button
                                onClick={() => setTipoDiagnostico('Problema de Software')}
                                className={`group flex flex-col items-center justify-center rounded-xl border-2 p-4 transition-all ${
                                    tipoDiagnostico === 'Problema de Software'
                                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                                        : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                                }`}
                            >
                                <span className="mb-1 text-sm font-bold text-gray-800">Problema de Software</span>
                                <span className="mb-3 text-center text-[10px] leading-tight text-gray-500">Falla en sistema o aplicaciones</span>
                                <div
                                    className={`rounded p-1 text-xs font-bold transition-colors ${tipoDiagnostico === 'Problema de Software' ? 'bg-blue-600 text-white' : 'bg-black text-white group-hover:bg-blue-600'}`}
                                >
                                    SW
                                </div>
                            </button>

                            <button
                                onClick={() => setTipoDiagnostico('Problema de Red')}
                                className={`group flex flex-col items-center justify-center rounded-xl border-2 p-4 transition-all ${
                                    tipoDiagnostico === 'Problema de Red'
                                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                                        : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                                }`}
                            >
                                <span className="mb-1 text-sm font-bold text-gray-800">Problema de Red</span>
                                <span className="mb-3 text-center text-[10px] leading-tight text-gray-500">Conexión e internet</span>
                                <Globe
                                    className={`h-8 w-8 transition-colors ${tipoDiagnostico === 'Problema de Red' ? 'text-blue-600' : 'text-black group-hover:text-blue-600'}`}
                                />
                            </button>

                            <button
                                onClick={() => setTipoDiagnostico('Equipo Médico')}
                                className={`group flex flex-col items-center justify-center rounded-xl border-2 p-4 transition-all ${
                                    tipoDiagnostico === 'Equipo Médico'
                                        ? 'border-red-500 bg-red-50 ring-2 ring-red-200'
                                        : 'border-gray-300 hover:border-red-400 hover:bg-red-50'
                                }`}
                            >
                                <span className="mb-1 text-sm font-bold text-gray-800">Equipo Médico</span>
                                <span className="mb-3 text-center text-[10px] leading-tight text-gray-500">Equipos de salud y diagnóstico</span>
                                <Activity
                                    className={`h-8 w-8 transition-colors ${tipoDiagnostico === 'Equipo Médico' ? 'text-red-600' : 'text-black group-hover:text-red-600'}`}
                                />
                            </button>

                            <button
                                onClick={() => setTipoDiagnostico('Sistema de Emergencias')}
                                className={`group flex flex-col items-center justify-center rounded-xl border-2 p-4 transition-all ${
                                    tipoDiagnostico === 'Sistema de Emergencias'
                                        ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-200'
                                        : 'border-gray-300 hover:border-orange-400 hover:bg-orange-50'
                                }`}
                            >
                                <span className="mb-1 text-sm font-bold text-gray-800">Sistema de Emergencias</span>
                                <span className="mb-3 text-center text-[10px] leading-tight text-gray-500">Comunicaciones y alertas</span>
                                <AlertCircle
                                    className={`h-8 w-8 transition-colors ${tipoDiagnostico === 'Sistema de Emergencias' ? 'text-orange-600' : 'text-black group-hover:text-orange-600'}`}
                                />
                            </button>

                            <button
                                onClick={() => setTipoDiagnostico('Infraestructura')}
                                className={`group flex flex-col items-center justify-center rounded-xl border-2 p-4 transition-all ${
                                    tipoDiagnostico === 'Infraestructura'
                                        ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                                        : 'border-gray-300 hover:border-green-400 hover:bg-green-50'
                                }`}
                            >
                                <span className="mb-1 text-sm font-bold text-gray-800">Infraestructura</span>
                                <span className="mb-3 text-center text-[10px] leading-tight text-gray-500">Instalaciones y servicios</span>
                                <CheckCircle2
                                    className={`h-8 w-8 transition-colors ${tipoDiagnostico === 'Infraestructura' ? 'text-green-600' : 'text-black group-hover:text-green-600'}`}
                                />
                            </button>

                            <button
                                onClick={() => setTipoDiagnostico('Sistema de Comunicación')}
                                className={`group flex flex-col items-center justify-center rounded-xl border-2 p-4 transition-all ${
                                    tipoDiagnostico === 'Sistema de Comunicación'
                                        ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200'
                                        : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                                }`}
                            >
                                <span className="mb-1 text-sm font-bold text-gray-800">Sistema de Comunicación</span>
                                <span className="mb-3 text-center text-[10px] leading-tight text-gray-500">Radios y teléfonos</span>
                                <Computer
                                    className={`h-8 w-8 transition-colors ${tipoDiagnostico === 'Sistema de Comunicación' ? 'text-purple-600' : 'text-black group-hover:text-purple-600'}`}
                                />
                            </button>

                            <button
                                onClick={() => setShowCustomDiagnostic(true)}
                                className={`group flex flex-col items-center justify-center rounded-xl border-2 p-4 transition-all ${
                                    showCustomDiagnostic
                                        ? 'border-gray-600 bg-gray-50 ring-2 ring-gray-200'
                                        : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                                }`}
                            >
                                <span className="mb-1 text-sm font-bold text-gray-800">Otro Tipo</span>
                                <span className="mb-3 text-center text-[10px] leading-tight text-gray-500">Especificar diagnóstico</span>
                                <div
                                    className={`rounded p-2 transition-colors ${showCustomDiagnostic ? 'bg-gray-600 text-white' : 'bg-gray-600 text-white'}`}
                                >
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                </div>
                            </button>
                        </div>

                        {showCustomDiagnostic && (
                            <div className="animate-in fade-in slide-in-from-top-2 mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4 duration-200">
                                <label className="mb-2 block text-sm font-bold text-gray-700">Especifique el tipo de diagnóstico:</label>
                                <input
                                    type="text"
                                    value={customDiagnosticType}
                                    onChange={(e) => setCustomDiagnosticType(e.target.value)}
                                    placeholder="Ej: Problema de aire acondicionado, Sistema de RCP, etc."
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                                {customDiagnosticType && (
                                    <div className="mt-2 text-xs text-gray-600">
                                        Tipo seleccionado: <span className="font-bold text-blue-600">{customDiagnosticType}</span>
                                    </div>
                                )}
                            </div>
                        )}
                        <textarea
                            className="mb-4 h-24 w-full resize-none rounded-lg border border-gray-200 p-3 text-[13px] text-gray-700 focus:border-red-300 focus:ring focus:ring-red-200/50"
                            placeholder="Escriba aquí la observación y detalles del diagnóstico..."
                            value={observacionDiagnostico}
                            onChange={(e) => setObservacionDiagnostico(e.target.value)}
                        ></textarea>

                        <div className="mb-4">
                            <label className="mb-2 block text-sm font-bold text-gray-700">
                                Archivo Adjunto / Evidencias <span className="text-red-500">* (Obligatorio)</span>:
                            </label>
                            <input
                                type="file"
                                multiple
                                className="block w-full cursor-pointer text-sm text-gray-500 transition-colors file:mr-4 file:rounded file:border-0 file:bg-red-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-red-700 hover:file:bg-red-100"
                                onChange={(e) => {
                                    if (e.target.files) {
                                        const filesArray = Array.from(e.target.files);
                                        // Maximo 4 archivos para no romper limite de DB
                                        if (filesArray.length > 4) {
                                            alert('Se permite un máximo de 4 archivos.');
                                            setAdjuntosDiagnostico(filesArray.slice(0, 4));
                                        } else {
                                            setAdjuntosDiagnostico(filesArray);
                                        }
                                    }
                                }}
                            />
                            {adjuntosDiagnostico.length > 0 && (
                                <p className="mt-2 text-xs text-gray-500">
                                    Archivos seleccionados: {adjuntosDiagnostico.map((f) => f.name).join(', ')}
                                </p>
                            )}
                        </div>

                        {diagnosticStatus && (
                            <div
                                className={`mb-3 rounded px-3 py-2 text-sm font-medium ${diagnosticStatus.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}
                            >
                                {diagnosticStatus.msg}
                            </div>
                        )}

                        <div className="flex justify-end gap-3">
                            <button
                                className="rounded bg-red-600 px-6 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-red-700"
                                onClick={submitDiagnostic}
                            >
                                COMPLETAR DIAGNOSTICO
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
