import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import {
    Activity,
    AlertCircle,
    CheckCircle2,
    Clock,
    Code,
    Computer,
    Globe,
    Keyboard,
    Monitor,
    Search,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

export default function Dashboard() {
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
                const response = await axios.get('/tecnico/dashboard-data');

                setTicketsAsignados(response.data.tickets_asignados || []);
                setHistorialFinalizados(response.data.historial_finalizados || []);
                setEstadisticas(response.data.estadisticas || null);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
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

            await axios.post(`/tecnico/ticket/${selectedTicketId}/diagnostico`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setDiagnosticStatus({ type: 'success', msg: 'Diagnóstico guardado exitosamente.' });
            setTipoDiagnostico('');
            setCustomDiagnosticType('');
            setShowCustomDiagnostic(false);
            setObservacionDiagnostico('');
            setAdjuntosDiagnostico([]);
            setSelectedTicketId(null);
            setShowDiagnosticPanel(false);

            const response = await axios.get('/tecnico/dashboard-data');
            setTicketsAsignados(response.data.tickets_asignados || []);
            setHistorialFinalizados(response.data.historial_finalizados || []);
            setEstadisticas(response.data.estadisticas || null);

            setTimeout(() => setDiagnosticStatus(null), 3000);
        } catch (error) {
            console.error('Error saving diagnostic:', error);
            setDiagnosticStatus({ type: 'error', msg: 'Ocurrió un error al guardar el diagnóstico.' });
        }
    };

    return (
        <div>
            <Head title="Dashboard Técnico" />


            <div className="p-4 md:p-6 lg:p-8 w-full flex flex-col h-full  mx-auto  sm:p-6 space-y-6 text-gray-800 font-sans">

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col relative overflow-hidden group hover:border-red-200 transition-colors">
                        <div className="text-sm font-semibold text-gray-600 mb-1">Tickets Asignados</div>
                        <div className="text-3xl font-bold">{stats.total_tickets_asignados}</div>
                        <AlertCircle className="absolute right-5 top-1/2 -translate-y-1/2 w-8 h-8 text-red-100 group-hover:text-red-400 transition-colors" opacity={0.6} />
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col relative overflow-hidden group hover:border-orange-200 transition-colors">
                        <div className="text-sm font-semibold text-gray-600 mb-1">En Proceso</div>
                        <div className="text-3xl font-bold">{stats.total_tickets_proceso}</div>
                        <Clock className="absolute right-5 top-1/2 -translate-y-1/2 w-8 h-8 text-orange-100 group-hover:text-orange-400 transition-colors" opacity={0.6} />
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col relative overflow-hidden group hover:border-green-200 transition-colors">
                        <div className="text-sm font-semibold text-gray-600 mb-1">Total Resueltos</div>
                        <div className="text-3xl font-bold">{stats.total_tickets_resueltos}</div>
                        <CheckCircle2 className="absolute right-5 top-1/2 -translate-y-1/2 w-8 h-8 text-green-100 group-hover:text-green-400 transition-colors" opacity={0.6} />
                    </div>
                </div>

                {/* Search Bar & Filters */}
                <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex gap-4 items-center">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="Buscar ticket"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border-none bg-gray-50 rounded-lg focus:ring-1 focus:ring-blue-100 text-sm"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="border border-gray-200 rounded-lg px-4 py-2 text-sm bg-white focus:outline-none"
                        >
                            <option value="Todos los estados">Todos los estados</option>
                            {uniqueStatuses.map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
                        <button
                            onClick={() => setActiveView(activeView === 'historial' ? 'main' : 'historial')}
                            className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-md font-medium transition-colors ${
                                activeView === 'historial'
                                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            <Clock className="w-4 h-4" /> Historial
                        </button>
                        <button
                            onClick={() => setActiveView(activeView === 'estadisticas' ? 'main' : 'estadisticas')}
                            className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-md font-medium transition-colors ${
                                activeView === 'estadisticas'
                                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            <Activity className="w-4 h-4" /> Mis Estadisticas
                        </button>
                    </div>
                </div>

                {/* Historial de Tickets */}
                {activeView === 'historial' && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-red-500" />
                        <h3 className="font-bold text-gray-800">Historial de Tickets</h3>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {historialData.map((ticket, idx) => (
                            <div key={idx} className="p-4 flex justify-between items-start hover:bg-gray-50 transition-colors">
                                <div>
                                    <h4 className="font-bold text-sm text-gray-900">{ticket.asunto}</h4>
                                    <div className="text-xs text-gray-500 mt-1 uppercase">
                                        {ticket.id} | {ticket.departamento}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">
                                        <span className="block">Asignado: {ticket.fecha_asignacion}</span>
                                        <span className="block">Finalizado: {ticket.fecha_finalizacion}</span>
                                    </div>
                                </div>
                                <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap">Resuelto</span>
                            </div>
                        ))}
                    </div>
                </div>
                )}

                {/* Mis Estadísticas */}
                {activeView === 'estadisticas' && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center gap-2 mb-4">
                        <Activity className="w-5 h-5 text-red-500" />
                        <h3 className="font-bold text-gray-800">Mis Estadisticas</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        <div className="bg-gray-50 border border-gray-100 p-4 rounded-lg flex flex-col justify-center">
                            <div className="text-xs text-gray-500 font-semibold mb-1">Tasa de Resolucion</div>
                            <div className="text-xl font-bold">{stats.tasa_resolucion_porcentaje}%</div>
                        </div>
                        <div className="bg-gray-50 border border-gray-100 p-4 rounded-lg flex flex-col justify-center">
                            <div className="text-xs text-gray-500 font-semibold mb-1">Tickets en Cola</div>
                            <div className="text-xl font-bold">{stats.total_tickets_cola}</div>
                        </div>
                        <div className="bg-gray-50 border border-gray-100 p-4 rounded-lg flex flex-col justify-center">
                            <div className="text-xs text-gray-500 font-semibold mb-1">Total Procesados</div>
                            <div className="text-xl font-bold">{stats.total_tickets_resueltos}</div>
                        </div>
                    </div>

                    <div className="mt-2 text-sm font-semibold text-gray-700 mb-3">Distribucion por Prioridad</div>
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
                                { name: 'Baja', color: 'bg-blue-500', count: priorityData['Baja'] || 0 }
                            ];

                            return priorities.map((priority) => {
                                const percentage = totalTickets > 0 ? (priority.count / totalTickets) * 100 : 0;
                                return (
                                    <div key={priority.name} className="flex items-center text-sm">
                                        <div className="w-16 text-gray-500 text-xs">{priority.name}</div>
                                        <div className="flex-1 bg-gray-100 h-2.5 rounded-full overflow-hidden">
                                            <div className={`${priority.color} h-full rounded-full`} style={{ width: `${percentage}%` }}></div>
                                        </div>
                                        <div className="w-4 text-right text-xs text-gray-500 ml-2">{priority.count}</div>
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
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                        <h3 className="font-bold text-gray-800">Tickets Asignados</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left whitespace-nowrap md:whitespace-normal">
                            <thead className="text-xs text-red-600 bg-gray-50/50 uppercase font-bold tracking-wider">
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
                                    <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                                        <td className="px-4 py-4 font-semibold text-xs">{row.id}</td>
                                        <td className="px-4 py-4 min-w-[200px] text-xs font-medium leading-tight">
                                            {row.asunto || row.subject}
                                        </td>
                                        <td className="px-4 py-4 text-xs font-bold uppercase">{row.departamento || row.department?.name}</td>
                                        <td className="px-4 py-4 text-xs">
                                            {(() => {
                                                const status = row.estado || row.status?.name || 'N/A';
                                                const statusLower = status.toLowerCase();

                                                if (statusLower === 'abierto' || statusLower === 'open' || statusLower === 'nuevo') {
                                                    return (
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200">
                                                            <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
                                                            {status}
                                                        </span>
                                                    );
                                                } else if (statusLower === 'en proceso' || statusLower === 'proceso' || statusLower === 'progreso' || statusLower === 'in progress') {
                                                    return (
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                                                            <span className="w-2 h-2 bg-blue-500 rounded-full mr-1.5"></span>
                                                            {status}
                                                        </span>
                                                    );
                                                } else if (statusLower === 'cerrado' || statusLower === 'resuelto' || statusLower === 'finalizado' || statusLower === 'closed' || statusLower === 'resolved') {
                                                    return (
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800 border border-gray-200">
                                                            <span className="w-2 h-2 bg-gray-500 rounded-full mr-1.5"></span>
                                                            {status}
                                                        </span>
                                                    );
                                                } else if (statusLower === 'pendiente' || statusLower === 'esperando' || statusLower === 'pending') {
                                                    return (
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border border-orange-200">
                                                            <span className="w-2 h-2 bg-orange-500 rounded-full mr-1.5 animate-pulse"></span>
                                                            {status}
                                                        </span>
                                                    );
                                                } else if (statusLower === 'cancelado' || statusLower === 'cancelled') {
                                                    return (
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
                                                            <span className="w-2 h-2 bg-red-500 rounded-full mr-1.5"></span>
                                                            {status}
                                                        </span>
                                                    );
                                                } else {
                                                    return (
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
                                                            <span className="w-2 h-2 bg-purple-500 rounded-full mr-1.5"></span>
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

                                                if (priorityLower === 'alta' || priorityLower === 'high') {
                                                    return (
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
                                                            <span className="w-2 h-2 bg-red-500 rounded-full mr-1.5 animate-pulse"></span>
                                                            {priority}
                                                        </span>
                                                    );
                                                } else if (priorityLower === 'media' || priorityLower === 'medium' || priorityLower === 'normal') {
                                                    return (
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-200">
                                                            <span className="w-2 h-2 bg-yellow-500 rounded-full mr-1.5"></span>
                                                            {priority}
                                                        </span>
                                                    );
                                                } else if (priorityLower === 'baja' || priorityLower === 'low') {
                                                    return (
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
                                                            <span className="w-2 h-2 bg-blue-500 rounded-full mr-1.5"></span>
                                                            {priority}
                                                        </span>
                                                    );
                                                } else {
                                                    return (
                                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800 border border-gray-200">
                                                            <span className="w-2 h-2 bg-gray-500 rounded-full mr-1.5"></span>
                                                            {priority}
                                                        </span>
                                                    );
                                                }
                                            })()}
                                        </td>
                                        <td className="px-4 py-4 text-xs text-gray-500 leading-tight">
                                            <div dangerouslySetInnerHTML={{ __html: (row.creado_por || '').replace('\n', '<br/>') }} />
                                        </td>
                                        <td className="px-4 py-4 flex flex-col gap-1.5 min-w-[140px] items-center">
                                            <Link
                                                href={`/tecnico/ticket/${row.id}`}
                                                className="bg-blue-500 hover:bg-blue-600 text-white text-[10px] w-full max-w-[120px] font-bold py-1.5 px-3 rounded shadow-sm transition-colors text-center"
                                            >
                                                Ver Detalles
                                            </Link>
                                            {(() => {
                                                const status = row.estado || row.status?.name || '';
                                                const statusLower = status.toLowerCase();
                                                const isClosedOrResolved = statusLower === 'cerrado' || statusLower === 'resuelto' || statusLower === 'finalizado' ||
                                                                         statusLower === 'closed' || statusLower === 'resolved' || statusLower === 'completed';

                                                if (!isClosedOrResolved) {
                                                    return (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedTicketId(row.id);
                                                                setShowDiagnosticPanel(true);
                                                                setTimeout(() => {
                                                                    document.getElementById('diagnostico-section')?.scrollIntoView({ behavior: 'smooth' });
                                                                }, 100);
                                                            }}
                                                            className="bg-red-500 hover:bg-red-600 text-white text-[10px] w-full max-w-[120px] font-bold py-1.5 px-3 rounded shadow-sm transition-colors"
                                                        >
                                                            Realizar Diagnostico
                                                        </button>
                                                    );
                                                } else {
                                                    return (
                                                        <div className="w-full max-w-[120px] text-center text-[10px] text-gray-400 font-medium py-1.5 px-3">
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
                    <div id="diagnostico-section" className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8 mt-8 animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="bg-red-600 text-white p-4 rounded-t-xl flex justify-between items-center">
                        <h3 className="text-sm font-bold flex items-center gap-2">
                            <Activity className="w-4 h-4" /> Plan de Diagnostico {selectedTicketId ? `- Ticket #${selectedTicketId}` : ''}
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
                            className="text-white hover:text-red-200 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                        <div className="p-6">
                        <p className="text-[13px] font-medium text-gray-700 mb-4">
                            Seleccione el tipo de diagnóstico realizado (Opcional):
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                            <button
                                onClick={() => setTipoDiagnostico('Problema de Hardware')}
                                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all group ${
                                    tipoDiagnostico === 'Problema de Hardware'
                                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                                        : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                                }`}
                            >
                                <span className="font-bold text-sm text-gray-800 mb-1">Problema de Hardware</span>
                                <span className="text-[10px] text-gray-500 text-center leading-tight mb-3">
                                    Falla en componentes físicos
                                </span>
                                <Monitor className={`w-8 h-8 transition-colors ${tipoDiagnostico === 'Problema de Hardware' ? 'text-blue-600' : 'text-black group-hover:text-blue-600'}`} />
                            </button>

                            <button
                                onClick={() => setTipoDiagnostico('Problema de Software')}
                                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all group ${
                                    tipoDiagnostico === 'Problema de Software'
                                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                                        : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                                }`}
                            >
                                <span className="font-bold text-sm text-gray-800 mb-1">Problema de Software</span>
                                <span className="text-[10px] text-gray-500 text-center leading-tight mb-3">
                                    Falla en sistema o aplicaciones
                                </span>
                                <div className={`p-1 rounded font-bold text-xs transition-colors ${tipoDiagnostico === 'Problema de Software' ? 'bg-blue-600 text-white' : 'bg-black text-white group-hover:bg-blue-600'}`}>SW</div>
                            </button>

                            <button
                                onClick={() => setTipoDiagnostico('Problema de Red')}
                                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all group ${
                                    tipoDiagnostico === 'Problema de Red'
                                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                                        : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                                }`}
                            >
                                <span className="font-bold text-sm text-gray-800 mb-1">Problema de Red</span>
                                <span className="text-[10px] text-gray-500 text-center leading-tight mb-3">
                                    Conexión e internet
                                </span>
                                <Globe className={`w-8 h-8 transition-colors ${tipoDiagnostico === 'Problema de Red' ? 'text-blue-600' : 'text-black group-hover:text-blue-600'}`} />
                            </button>

                            <button
                                onClick={() => setTipoDiagnostico('Equipo Médico')}
                                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all group ${
                                    tipoDiagnostico === 'Equipo Médico'
                                        ? 'border-red-500 bg-red-50 ring-2 ring-red-200'
                                        : 'border-gray-300 hover:border-red-400 hover:bg-red-50'
                                }`}
                            >
                                <span className="font-bold text-sm text-gray-800 mb-1">Equipo Médico</span>
                                <span className="text-[10px] text-gray-500 text-center leading-tight mb-3">
                                    Equipos de salud y diagnóstico
                                </span>
                                <Activity className={`w-8 h-8 transition-colors ${tipoDiagnostico === 'Equipo Médico' ? 'text-red-600' : 'text-black group-hover:text-red-600'}`} />
                            </button>

                            <button
                                onClick={() => setTipoDiagnostico('Sistema de Emergencias')}
                                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all group ${
                                    tipoDiagnostico === 'Sistema de Emergencias'
                                        ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-200'
                                        : 'border-gray-300 hover:border-orange-400 hover:bg-orange-50'
                                }`}
                            >
                                <span className="font-bold text-sm text-gray-800 mb-1">Sistema de Emergencias</span>
                                <span className="text-[10px] text-gray-500 text-center leading-tight mb-3">
                                    Comunicaciones y alertas
                                </span>
                                <AlertCircle className={`w-8 h-8 transition-colors ${tipoDiagnostico === 'Sistema de Emergencias' ? 'text-orange-600' : 'text-black group-hover:text-orange-600'}`} />
                            </button>

                            <button
                                onClick={() => setTipoDiagnostico('Infraestructura')}
                                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all group ${
                                    tipoDiagnostico === 'Infraestructura'
                                        ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                                        : 'border-gray-300 hover:border-green-400 hover:bg-green-50'
                                }`}
                            >
                                <span className="font-bold text-sm text-gray-800 mb-1">Infraestructura</span>
                                <span className="text-[10px] text-gray-500 text-center leading-tight mb-3">
                                    Instalaciones y servicios
                                </span>
                                <CheckCircle2 className={`w-8 h-8 transition-colors ${tipoDiagnostico === 'Infraestructura' ? 'text-green-600' : 'text-black group-hover:text-green-600'}`} />
                            </button>

                            <button
                                onClick={() => setTipoDiagnostico('Sistema de Comunicación')}
                                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all group ${
                                    tipoDiagnostico === 'Sistema de Comunicación'
                                        ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200'
                                        : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50'
                                }`}
                            >
                                <span className="font-bold text-sm text-gray-800 mb-1">Sistema de Comunicación</span>
                                <span className="text-[10px] text-gray-500 text-center leading-tight mb-3">
                                    Radios y teléfonos
                                </span>
                                <Computer className={`w-8 h-8 transition-colors ${tipoDiagnostico === 'Sistema de Comunicación' ? 'text-purple-600' : 'text-black group-hover:text-purple-600'}`} />
                            </button>

                            <button
                                onClick={() => setShowCustomDiagnostic(true)}
                                className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all group ${
                                    showCustomDiagnostic
                                        ? 'border-gray-600 bg-gray-50 ring-2 ring-gray-200'
                                        : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                                }`}
                            >
                                <span className="font-bold text-sm text-gray-800 mb-1">Otro Tipo</span>
                                <span className="text-[10px] text-gray-500 text-center leading-tight mb-3">
                                    Especificar diagnóstico
                                </span>
                                <div className={`p-2 rounded transition-colors ${showCustomDiagnostic ? 'bg-gray-600 text-white' : 'bg-gray-600 text-white'}`}>
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                </div>
                            </button>
                        </div>

                        {showCustomDiagnostic && (
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 animate-in fade-in slide-in-from-top-2 duration-200">
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Especifique el tipo de diagnóstico:
                                </label>
                                <input
                                    type="text"
                                    value={customDiagnosticType}
                                    onChange={(e) => setCustomDiagnosticType(e.target.value)}
                                    placeholder="Ej: Problema de aire acondicionado, Sistema de RCP, etc."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                />
                                {customDiagnosticType && (
                                    <div className="mt-2 text-xs text-gray-600">
                                        Tipo seleccionado: <span className="font-bold text-blue-600">{customDiagnosticType}</span>
                                    </div>
                                )}
                            </div>
                        )}
                        <textarea
                            className="w-full h-24 border border-gray-200 focus:border-red-300 focus:ring focus:ring-red-200/50 rounded-lg p-3 text-[13px] text-gray-700 mb-4 resize-none"
                            placeholder="Escriba aquí la observación y detalles del diagnóstico..."
                            value={observacionDiagnostico}
                            onChange={(e) => setObservacionDiagnostico(e.target.value)}
                        ></textarea>

                        <div className="mb-4">
                            <label className="block text-sm font-bold text-gray-700 mb-2">
                                Archivo Adjunto / Evidencias <span className="text-red-500">* (Obligatorio)</span>:
                            </label>
                            <input
                                type="file"
                                multiple
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 transition-colors cursor-pointer"
                                onChange={(e) => {
                                    if (e.target.files) {
                                        const filesArray = Array.from(e.target.files);
                                        // Maximo 4 archivos para no romper limite de DB
                                        if (filesArray.length > 4) {
                                            alert("Se permite un máximo de 4 archivos.");
                                            setAdjuntosDiagnostico(filesArray.slice(0, 4));
                                        } else {
                                            setAdjuntosDiagnostico(filesArray);
                                        }
                                    }
                                }}
                            />
                            {adjuntosDiagnostico.length > 0 && (
                                <p className="text-xs text-gray-500 mt-2">
                                    Archivos seleccionados: {adjuntosDiagnostico.map(f => f.name).join(', ')}
                                </p>
                            )}
                        </div>

                        {diagnosticStatus && (
                            <div className={`text-sm mb-3 px-3 py-2 rounded font-medium ${diagnosticStatus.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                {diagnosticStatus.msg}
                            </div>
                        )}

                        <div className="flex justify-end gap-3">
                            <button
                                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded shadow-sm transition-colors"
                                onClick={submitDiagnostic}
                            >
                                COMPLETAR DIAGNOSTICO
                            </button>
                        </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
