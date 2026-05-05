import React from 'react';
import { Head, Link } from "@inertiajs/react";
import AppLayout from '@/layouts/app-layout';
import { Button } from "@/components/ui/button";
import { route } from 'ziggy-js';

// Ya no necesitamos recibir todos los catálogos aquí, solo los tickets
export default function Unassigned({ tickets }) {

    if (!tickets || tickets.length === 0) {
        return (
            <AppLayout>
                <Head title="Tickets pendientes" />
                <div className="text-center py-12">
                    <p className="text-gray-500">No hay tickets pendientes de asignación en tu departamento.</p>
                </div>
            </AppLayout>
        );
    }

    return (
        <AppLayout>
            <Head title="Tickets pendientes" />
            <div className="space-y-6 p-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Tickets pendientes de asignación</h1>
                </div>

                <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asunto</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Técnico</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Solicitante</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {tickets
                                .filter(t => t.status?.name !== 'Cerrado')
                                .map((ticket) => {
                                    const statusName = ticket.status?.name || "Sin estado";
                                    const statusStyles = {
                                        "Pendiente a asignación": "bg-yellow-100 text-yellow-700",
                                        "Asignado": "bg-blue-100 text-blue-700",
                                        "En Proceso": "bg-blue-100 text-blue-700",
                                        "Resuelto": "bg-green-100 text-green-700",
                                    };
                                    const styleClass = statusStyles[statusName] || "bg-gray-100 text-gray-700";

                                    return (
                                        <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{ticket.code}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">{ticket.subject}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${styleClass}`}>
                                                    {statusName}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {ticket.assigned_user?.name || (
                                                    <span className="text-yellow-600 font-medium">Sin asignar</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {ticket.requesting_user?.name || ticket.email}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                {/* ÚNICO BOTÓN: Nos lleva directamente al ShowAsignador */}
                                                <Button
                                                    size="sm"
                                                    className="bg-red-600 hover:bg-red-700 font-bold"
                                                    asChild
                                                >
                                                    <Link href={route('tickets.showAsignador', ticket.id)}>
                                                        Gestionar Ticket
                                                    </Link>
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
