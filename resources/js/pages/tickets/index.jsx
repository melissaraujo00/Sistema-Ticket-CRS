import React, { useState } from "react";
import { Head, Link, usePage, router } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Toaster, toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Eye, CheckCircle, Star, X } from "lucide-react";
import { GenericTable } from "@/components/GenericTable";
import { route } from "ziggy-js";

const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Mis Tickets", href: "/tickets" },
];

export default function Index() {
    const { props } = usePage();
    const tickets = props.tickets || [];
    const auth = props.auth || { user: { permissions: [] } };

    const [searchTerm, setSearchTerm] = useState("");
    const [ratingModalOpen, setRatingModalOpen] = useState(false);
    const [ticketToClose, setTicketToClose] = useState(null);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Filtrar tickets por código o asunto
    const filteredTickets = tickets.filter((ticket) =>
        `${ticket.code} ${ticket.subject}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenRating = (ticket) => {
        if (ticket.status?.name !== "Resuelto") {
            toast.warning("Este ticket no está en estado Resuelto");
            return;
        }
        setTicketToClose(ticket);
        setRating(0);
        setComment("");
        setRatingModalOpen(true);
    };

    const submitCloseTicket = (e) => {
        e.preventDefault();
        if (rating === 0) {
            toast.error("Debes seleccionar una calificación");
            return;
        }
        setIsSubmitting(true);

        router.post(
            route("tickets.close", ticketToClose.id),
            { rating, comment },
            {
                onSuccess: () => {
                    toast.success("Ticket cerrado exitosamente");
                    setRatingModalOpen(false);
                    router.reload({ only: ["tickets"] });
                },
                onError: (errors) => {
                    console.error(errors);
                    toast.error("Error al cerrar el ticket");
                },
                onFinish: () => setIsSubmitting(false),
            }
        );
    };

    // Definición de columnas mejorada
    const columns = [
        {
            header: "Ticket",
            render: (ticket) => (
                <div className="flex flex-col">
                    <span className="font-mono text-sm font-bold text-red-600 dark:text-red-400">
                        {ticket.code}
                    </span>
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">
                        {ticket.subject}
                    </span>
                </div>
            ),
        },
        {
            header: "Estado",
            render: (ticket) => {
                const statusName = ticket.status?.name || "Sin estado";
                const statusStyles = {
                    Abierto: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
                    "En Proceso": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                    Resuelto: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                    Cerrado: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
                };
                const styleClass = statusStyles[statusName] || "bg-gray-100 text-gray-700";
                return (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styleClass}`}>
                        {statusName}
                    </span>
                );
            },
        },
        {
            header: "Departamento",
            render: (ticket) => (
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    {ticket.department?.name || "N/A"}
                </span>
            ),
        },
        {
            header: "Asignado a",
            render: (ticket) => (
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    {ticket.assigned_user?.name || ticket.assignedUser?.name || "Sin asignar"}
                </span>
            ),
        },
        {
            header: "Fecha de creación",
            className: "hidden md:table-cell",
            render: (ticket) => (
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    {new Date(ticket.creation_date || ticket.created_at).toLocaleDateString("es-ES")}
                </span>
            ),
        },
        {
            header: "Acciones",
            className: "text-right",
            render: (ticket) => (
                <div className="flex justify-end gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        className="h-8 w-8 hover:text-blue-600"
                        title="Ver detalles"
                    >
                        <Link href={route("tickets.show", ticket.id)}>
                            <Eye className="h-4 w-4" />
                        </Link>
                    </Button>

                    {ticket.status?.name === "Resuelto" && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:text-green-600 animate-pulse"
                            onClick={() => handleOpenRating(ticket)}
                            title="Confirmar y cerrar"
                        >
                            <CheckCircle className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mis Tickets" />
            <Toaster position="top-right" richColors />

            <div className="p-4 md:p-8 space-y-6">
                {/* Cabecera */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                            Mis Tickets
                        </h1>
                        <p className="text-zinc-500 text-sm">
                            Solicitudes de soporte realizadas por ti.
                        </p>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:flex-initial">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
                            <Input
                                type="text"
                                placeholder="Buscar por código o asunto..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-8 w-full sm:w-[250px]"
                            />
                        </div>
                        <Button asChild className="bg-red-600 hover:bg-red-700">
                            <Link href={route("tickets.create")}>
                                <Plus className="mr-2 h-4 w-4" /> Nuevo Ticket
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Tabla */}
                <GenericTable data={filteredTickets} columns={columns} />
            </div>

            {/* Modal de calificación */}
            {ratingModalOpen && ticketToClose && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-md animate-in zoom-in-95 duration-200 rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-black text-gray-900 dark:text-white">
                                    Cerrar Ticket
                                </h3>
                                <p className="text-xs font-bold text-gray-400 mt-1">
                                    {ticketToClose.code} - {ticketToClose.subject}
                                </p>
                            </div>
                            <button
                                onClick={() => setRatingModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                disabled={isSubmitting}
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="mb-6 rounded-lg bg-gray-50 p-4 border border-gray-100 dark:bg-zinc-800 dark:border-zinc-700">
                            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium text-center">
                                ¿Se resolvió tu problema de forma satisfactoria? <br />
                                Califica el servicio para cerrar la solicitud.
                            </p>
                        </div>

                        <form onSubmit={submitCloseTicket} className="flex flex-col items-center">
                            <div className="flex gap-2 mb-6">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        className={`transition-all hover:scale-110 ${
                                            rating >= star
                                                ? "text-yellow-400"
                                                : "text-gray-200 dark:text-gray-600"
                                        }`}
                                        disabled={isSubmitting}
                                    >
                                        <Star className="w-10 h-10 fill-current" />
                                    </button>
                                ))}
                            </div>

                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 text-sm mb-6 resize-none dark:bg-zinc-800 dark:border-zinc-700"
                                rows="3"
                                placeholder="Agrega un comentario opcional sobre la atención recibida..."
                                disabled={isSubmitting}
                            ></textarea>

                            <button
                                type="submit"
                                disabled={rating === 0 || isSubmitting}
                                className="w-full rounded-lg bg-red-600 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? "Cerrando..." : "ENVIAR CALIFICACIÓN Y CERRAR"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
