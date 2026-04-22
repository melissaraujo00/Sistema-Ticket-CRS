import AppLayout from '@/layouts/app-layout';
import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Unassigned({ tickets = [], tecnicos = [] }) {
    // Usamos useForm de Inertia para manejar la asignación
    const { data, setData, post, processing } = useForm({
        tecnico_id: '',
    });

    // Estado local para saber a qué ticket le dimos clic en "Asignar"
    const [activeTicketId, setActiveTicketId] = useState(null);

    const handleAssign = (e, ticketId) => {
        e.preventDefault();
        // Enviamos la petición POST a la ruta segura
        post(route('tickets.assign', ticketId), {
            preserveScroll: true,
            onSuccess: () => {
                setActiveTicketId(null); // Cerramos el menú
                setData('tecnico_id', ''); // Limpiamos el select
            },
        });
    };

    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Tickets Pendientes', href: '/tickets/pendientes' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tickets Pendientes" />

            <div className="flex h-full w-full flex-col p-4 md:p-6 lg:p-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tickets Pendientes de Asignación</h1>
                    <p className="mt-1 text-sm text-gray-500">Selecciona un técnico (Agente) para que se haga cargo de estas solicitudes.</p>
                </div>

                <div className="dark:bg-sidebar border-sidebar-border overflow-hidden rounded-xl border bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="border-b border-gray-200 bg-gray-50 text-gray-700 dark:border-neutral-700 dark:bg-neutral-800/50 dark:text-gray-300">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Código</th>
                                    <th className="px-6 py-4 font-semibold">Solicitante</th>
                                    <th className="px-6 py-4 font-semibold">Asunto</th>
                                    <th className="px-6 py-4 font-semibold">Departamento</th>
                                    <th className="px-6 py-4 text-right font-semibold">Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tickets.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                            ¡Excelente! No hay tickets pendientes de asignar en este momento.
                                        </td>
                                    </tr>
                                ) : (
                                    tickets.map((ticket) => (
                                        <tr
                                            key={ticket.id}
                                            className="border-b transition-colors hover:bg-gray-50 dark:border-neutral-700 dark:hover:bg-neutral-800/50"
                                        >
                                            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{ticket.code}</td>
                                            <td className="px-6 py-4">{ticket.requesting_user?.name || 'Desconocido'}</td>
                                            <td className="px-6 py-4">{ticket.subject}</td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                                    {ticket.department?.name || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {activeTicketId === ticket.id ? (
                                                    <form
                                                        onSubmit={(e) => handleAssign(e, ticket.id)}
                                                        className="flex items-center justify-end gap-2"
                                                    >
                                                        <select
                                                            className="rounded-md border-gray-300 text-sm focus:border-red-500 focus:ring-red-500 dark:border-neutral-600 dark:bg-neutral-800"
                                                            value={data.tecnico_id}
                                                            onChange={(e) => setData('tecnico_id', e.target.value)}
                                                            required
                                                        >
                                                            <option value="" disabled>
                                                                Seleccione un técnico...
                                                            </option>
                                                            {tecnicos.map((tec) => (
                                                                <option key={tec.id} value={tec.id}>
                                                                    {tec.name}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        <button
                                                            type="submit"
                                                            disabled={processing}
                                                            className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
                                                        >
                                                            Guardar
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => setActiveTicketId(null)}
                                                            className="text-xs text-gray-500 underline hover:text-gray-700 dark:hover:text-gray-300"
                                                        >
                                                            Cancelar
                                                        </button>
                                                    </form>
                                                ) : (
                                                    <button
                                                        onClick={() => {
                                                            setActiveTicketId(ticket.id);
                                                            setData('tecnico_id', '');
                                                        }}
                                                        className="text-sm font-medium text-red-600 transition-colors hover:text-red-800 dark:text-red-500 dark:hover:text-red-400"
                                                    >
                                                        Asignar Técnico
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
