import { Link } from '@inertiajs/react';
import { CheckCircle2, PlusCircle, Star, X } from 'lucide-react';
import { useState } from 'react';
import { route } from 'ziggy-js';

export default function UserDashboard({ tickets }) {
    // Estado para controlar el modal de calificación
    const [ratingModalOpen, setRatingModalOpen] = useState(false);
    const [ticketToClose, setTicketToClose] = useState(null);
    const [rating, setRating] = useState(0);

    // Función para abrir el modal
    const handleOpenRating = (ticket) => {
        setTicketToClose(ticket);
        setRatingModalOpen(true);
    };

    // Función para enviar la calificación y cerrar el ticket
    const submitCloseTicket = (e) => {
        e.preventDefault();
        // Aquí iría tu llamada axios/Inertia para enviar la calificación al backend
        // router.post(`/tickets/${ticketToClose.id}/close`, { rating: rating, ... })
        console.log('Cerrando ticket con calificación de:', rating);
        setRatingModalOpen(false);
    };

    return (
        <div className="p-4 font-sans md:p-8">
            <div className="mx-auto max-w-5xl">
                {/* --- HEADER Y BOTÓN DE CREAR --- */}
                <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-gray-900">Mis Solicitudes</h1>
                        <p className="text-sm font-medium text-gray-500">Gestiona tus tickets de soporte y sigue su estado.</p>
                    </div>

                    {/* Botón principal para crear ticket */}
                    <Link
                        href={route('tickets.create')}
                        className="flex items-center gap-2 rounded-lg bg-[#DA291C] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-red-200 transition-all hover:-translate-y-0.5 hover:bg-[#b82218]"
                    >
                        <PlusCircle className="h-5 w-5" />
                        CREAR NUEVO TICKET
                    </Link>
                </div>

                {/* --- LISTA DE TICKETS DEL USUARIO --- */}
                <div className="flex flex-col gap-4">
                    {/* Ejemplo de un ticket "En Proceso" */}
                    <div className="flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md md:flex-row md:items-center">
                        <div className="mb-4 md:mb-0">
                            <div className="mb-2 flex items-center gap-3">
                                <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold tracking-widest text-[#002F6C] uppercase">
                                    En Proceso
                                </span>
                                <span className="text-xs font-bold text-gray-400">TKT-2026-001</span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Problema con acceso al sistema contable</h3>
                            <p className="mt-1 text-sm text-gray-500">Creado el: 14 Abr 2026</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link href="#" className="text-sm font-bold text-[#002F6C] hover:underline">
                                Ver Detalles
                            </Link>
                        </div>
                    </div>

                    {/* Ejemplo de un ticket "Resuelto" (Requiere acción del usuario) */}
                    <div className="relative flex flex-col justify-between overflow-hidden rounded-xl border-2 border-[#DA291C]/20 bg-red-50/30 p-6 shadow-sm md:flex-row md:items-center">
                        {/* Indicador visual de acción requerida */}
                        <div className="absolute top-0 left-0 h-full w-1 bg-[#DA291C]"></div>

                        <div className="mb-4 pl-2 md:mb-0">
                            <div className="mb-2 flex items-center gap-3">
                                <span className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-[11px] font-bold tracking-widest text-green-700 uppercase">
                                    <CheckCircle2 className="h-3 w-3" /> Resuelto por Técnico
                                </span>
                                <span className="text-xs font-bold text-gray-400">TKT-2026-002</span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Actualización de software de escáner</h3>
                            <p className="mt-1 text-sm text-gray-600">El técnico ha enviado una solución. Por favor, confirma si funciona.</p>
                        </div>
                        <div className="flex items-center gap-4 pl-2">
                            <button
                                onClick={() => handleOpenRating({ id: 2, code: 'TKT-2026-002', subject: 'Actualización de software de escáner' })}
                                className="animate-pulse rounded-lg bg-[#002F6C] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-blue-900"
                            >
                                CONFIRMAR Y CERRAR
                            </button>
                        </div>
                    </div>
                </div>

                {/* --- MODAL DE CALIFICACIÓN --- */}
                {ratingModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 p-4 backdrop-blur-sm">
                        <div className="animate-in zoom-in-95 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl duration-200">
                            <div className="mb-4 flex items-start justify-between">
                                <div>
                                    <h3 className="text-xl font-black text-gray-900">Cerrar Ticket</h3>
                                    <p className="mt-1 text-xs font-bold text-gray-400">
                                        {ticketToClose?.code} - {ticketToClose?.subject}
                                    </p>
                                </div>
                                <button onClick={() => setRatingModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="mb-6 rounded-lg border border-gray-100 bg-gray-50 p-4">
                                <p className="text-center text-sm font-medium text-gray-700">
                                    ¿Se resolvió tu problema de forma satisfactoria? <br /> Califica el servicio para cerrar la solicitud.
                                </p>
                            </div>

                            <form onSubmit={submitCloseTicket} className="flex flex-col items-center">
                                {/* Estrellas interactivas */}
                                <div className="mb-6 flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            className={`transition-all hover:scale-110 ${rating >= star ? 'text-yellow-400' : 'text-gray-200'}`}
                                        >
                                            <Star className="h-10 w-10 fill-current" />
                                        </button>
                                    ))}
                                </div>

                                <textarea
                                    className="mb-6 w-full resize-none rounded-lg border-gray-300 text-sm shadow-sm focus:border-[#DA291C] focus:ring-[#DA291C]"
                                    rows="3"
                                    placeholder="Agrega un comentario opcional sobre la atención recibida..."
                                ></textarea>

                                <button
                                    type="submit"
                                    disabled={rating === 0}
                                    className="w-full rounded-lg bg-[#DA291C] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[#b82218] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    ENVIAR CALIFICACIÓN Y CERRAR
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
