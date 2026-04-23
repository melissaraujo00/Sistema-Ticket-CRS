import React, { useState } from "react";
import { Head, Link, usePage, router } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Toaster, toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Eye, CheckCircle, Star, X } from "lucide-react";
import { GenericTable } from "@/components/GenericTable";
import { route } from 'ziggy-js';
import TicketRatingModal from '@/components/raiting/calificationModal'


const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Mis Tickets", href: "/tickets" },
];

export default function Index() {
    const { props } = usePage();
    const tickets = props.tickets || [];
    const auth = props.auth || { user: { permissions: [] } };

    const [searchTerm, setSearchTerm] = useState("");
    const [ratingModalOpen, setRatingModalOpen] = useState(true);
    const [ticketToClose, setTicketToClose] = useState(null);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");

    const hasPermission = (perm) => auth.user?.permissions?.includes(perm);

    // Filtrar tickets por asunto o código
    const filteredTickets = tickets.filter((ticket) =>
        `${ticket.code} ${ticket.subject}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Función para abrir el modal de calificación
    const handleOpenRating = (ticket) => {
        setTicketToClose(ticket);
        setRating(0);
        setComment("");
        setRatingModalOpen(true);
    };

    // Enviar calificación y cerrar ticket
    const submitCloseTicket = (e) => {
        e.preventDefault();
        if (rating === 0) {
            toast.error("Debes seleccionar una calificación");
            return;
        }

        router.post(
            route("tickets.close", ticketToClose.id),
            { rating, comment },
            {
                onSuccess: () => {
                    toast.success("Ticket cerrado exitosamente");
                    setRatingModalOpen(false);
                },
                onError: (errors) => {
                    toast.error("Error al cerrar el ticket");
                },
            }
        );
    };

    // Definir columnas para la tabla genérica
    const columns = [
        {
            header: "Ticket",
            render: (ticket) => (
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500">
                        <span className="text-xs font-bold">{ticket.code?.slice(-4)}</span>
                    </div>
                    <div>
                        <span className="font-semibold block">{ticket.code}</span>
                        <span className="text-xs text-zinc-500">{ticket.subject}</span>
                    </div>
                </div>
            ),
        },
        {
            header: "Estado",
            render: (ticket) => {
                const statusStyles = {
                    open: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
                    in_progress: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                    resolved: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
                    closed: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
                };
                const statusLabels = {
                    open: "Abierto",
                    in_progress: "En Proceso",
                    resolved: "Resuelto",
                    closed: "Cerrado",
                };
                return (
                    <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[ticket.status] || statusStyles.open}`}
                    >
                        {statusLabels[ticket.status] || ticket.status}
                    </span>
                );
            },
        },
        {
            header: "Fecha de creación",
            className: "hidden md:table-cell",
            render: (ticket) => (
                <span className="text-sm text-zinc-600 dark:text-zinc-400">
                    {new Date(ticket.created_at).toLocaleDateString("es-ES")}
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

                    {ticket.status === "resolved" && (
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
                {/* Cabecera con búsqueda y botón nuevo */}
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

                {/* Tabla Genérica */}
                <GenericTable data={filteredTickets} columns={columns} />
            </div>

            

            <TicketRatingModal
                isOpen={ratingModalOpen}
                onClose={() => setRatingModalOpen(false)}
            />
        </AppLayout>

    );
}
