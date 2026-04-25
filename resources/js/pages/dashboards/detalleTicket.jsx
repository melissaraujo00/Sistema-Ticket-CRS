import { Link, Head } from '@inertiajs/react';

import axios from 'axios';
import { useEffect, useState } from 'react';
import { ArrowLeft, Paperclip } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

export default function TicketDetails({ id }) {
    const [ticket, setTicket] = useState(null);

    useEffect(() => {
        const fetchTicket = async () => {
            try {
                const response = await axios.get(`/agent/ver-ticket/${id}`);
                setTicket(response.data.ticket);
            } catch (error) {
                console.error("Error al obtener detalles del ticket:", error);
            }
        };

        if (id) {
            fetchTicket();
        }
    }, [id]);

    const data = ticket

    if (!data) return <div>Cargando...</div>;

    return (
        <AppLayout>
            <Head title={`Detalle Ticket #${data.id}`} />

            <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 text-gray-800 font-sans">
                <div className="space-y-6">
                    {/* First Section */}
                    <div className="border border-gray-300 rounded-xl p-6 shadow-sm bg-white border-t-4 border-t-white">
                        <h3 className="text-xl font-bold text-red-600 mb-6">Ticket # {data.id}</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 text-sm mb-6">
                            <div className="grid grid-cols-2 gap-2 border-b border-gray-50 pb-2">
                                <span className="font-bold text-gray-900 text-xs">Estado</span>
                                <span>{data.estado_del_ticket}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 border-b border-gray-50 pb-2">
                                <span className="font-bold text-gray-900 text-xs">Nombre</span>
                                <span>{data.nombre}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 border-b border-gray-50 pb-2">
                                <span className="font-bold text-gray-900 text-xs">Prioridad: {data.prioridad}</span>
                                <span>{data.prioridad}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 border-b border-gray-50 pb-2">
                                <span className="font-bold text-gray-900 text-xs">Email</span>
                                <span>{data.email}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 border-b border-gray-50 pb-2">
                                <span className="font-bold text-gray-900 text-xs">Fecha Creacion:</span>
                                <span>{data.fecha_creacion}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 border-b border-gray-50 pb-2">
                                <span className="font-bold text-gray-900 text-xs">Telefono</span>
                                <span>{data.telefono}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 border-b border-gray-50 pb-2">
                                <span className="font-bold text-gray-900 text-xs">Asignado a:</span>
                                <span>{data.asignado}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 border-b border-gray-50 pb-2">
                                <span className="font-bold text-gray-900 text-xs">Temas de ayuda</span>
                                <span>{data.temas_de_ayuda}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 border-b border-gray-50 pb-2">
                                <span className="font-bold text-gray-900 text-xs">Plan SLA:</span>
                                <span>{data.plan_sla}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2"></div>
                            <div className="grid grid-cols-2 gap-2">
                                <span className="font-bold text-gray-900 text-xs">Fecha Limite:</span>
                                <span>{data.fecha_limite}</span>
                            </div>
                        </div>

                        <hr className="border-red-200 mb-6" />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-sm">
                            <div>
                                <h4 className="font-bold text-red-600 mb-4 text-[15px]">Departamento Solicitante</h4>
                                <div className="grid grid-cols-[100px_1fr] gap-2 mb-2">
                                    <span className="font-bold text-xs text-gray-900">Departamento</span>
                                    <span>{data.departamento_solicitante}</span>
                                </div>
                                <div className="grid grid-cols-[100px_1fr] gap-2">
                                    <span className="font-bold text-xs text-gray-900">Area</span>
                                    <span>{data.area_del_agent}</span>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-bold text-red-600 mb-4 text-[15px]">Departamento Receptor</h4>
                                <div className="grid grid-cols-[100px_1fr] gap-2 mb-2">
                                    <span className="font-bold text-xs text-gray-900">Area</span>
                                    <span>Direccion Voluntariado y Seccionales</span>
                                </div>
                                <div className="grid grid-cols-[100px_1fr] gap-2 mb-2">
                                    <span className="font-bold text-xs text-gray-900">Solicitante</span>
                                    <span>{data.solicitante}</span>
                                </div>
                                <div className="grid grid-cols-[100px_1fr] gap-2">
                                    <span className="font-bold text-xs text-gray-900">Problema</span>
                                    <span className="leading-tight text-gray-700">{data.problema}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Second Section: Detalles del problema */}
                    <div className="border border-gray-300 rounded-xl p-6 shadow-sm bg-white">
                        <h3 className="text-[17px] font-bold text-red-600 mb-4">Detalles del problema</h3>
                        <hr className="mb-4 border-gray-300" />

                        <h4 className="font-bold text-sm text-gray-900 mb-2">Computadora no enciende</h4>
                        <p className="text-xs text-gray-600 mb-6 leading-relaxed">
                            {data.detalles_del_problema}
                        </p>

                        <h4 className="font-bold text-sm text-gray-900 mb-2">Adjuntos</h4>
                        <div className="flex items-center text-xs font-bold text-gray-800">
                            <Paperclip className="w-4 h-4 mr-1" />
                            {data.adjuntos}
                        </div>
                    </div>

                    {/* Back button */}
                    <div className="pt-2">
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center gap-2 px-5 py-2 border border-gray-300 rounded-xl text-sm font-bold bg-white text-black hover:bg-gray-50 transition-colors shadow-sm"
                        >
                            <ArrowLeft className="w-4 h-4" /> Volver
                        </Link>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
