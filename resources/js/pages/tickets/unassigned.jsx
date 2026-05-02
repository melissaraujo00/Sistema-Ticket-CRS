import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Loader2 } from 'lucide-react';
import { route } from 'ziggy-js';

export default function Unassigned({ tickets, tecnicos }) {
    const [assigningId, setAssigningId] = useState(null);
    const [selectedTecnico, setSelectedTecnico] = useState({});

    const handleAssign = (ticketId) => {
        const tecnicoId = selectedTecnico[ticketId];
        if (!tecnicoId) return;

        setAssigningId(ticketId);
        router.post(route('tickets.assign', ticketId), { tecnico_id: tecnicoId }, {
            preserveScroll: true,
            onFinish: () => setAssigningId(null),
            onSuccess: () => {
                // Opcional: recargar la página o eliminar el ticket de la lista
                // router.reload();
            },
        });
    };

    if (tickets.length === 0) {
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Solicitante</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Departamento</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asignar técnico</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {tickets.map((ticket) => (
                                <tr key={ticket.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ticket.code}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{ticket.subject}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ticket.requesting_user?.name || ticket.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ticket.department?.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Select
                                            value={selectedTecnico[ticket.id] || ''}
                                            onValueChange={(val) => setSelectedTecnico({ ...selectedTecnico, [ticket.id]: val })}
                                        >
                                            <SelectTrigger className="w-48">
                                                <SelectValue placeholder="Seleccione técnico" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {tecnicos.map((tec) => (
                                                    <SelectItem key={tec.id} value={tec.id.toString()}>
                                                        {tec.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                asChild
                                            >
                                                <Link href={route('tickets.show', ticket.id)}>
                                                    <Eye className="w-4 h-4" />
                                                </Link>
                                            </Button>
                                            <Button
                                                size="sm"
                                                className="bg-red-600 hover:bg-red-700"
                                                onClick={() => handleAssign(ticket.id)}
                                                disabled={!selectedTecnico[ticket.id] || assigningId === ticket.id}
                                            >
                                                {assigningId === ticket.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    'Asignar'
                                                )}
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
