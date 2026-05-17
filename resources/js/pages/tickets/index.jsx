import React, { useState, useEffect } from "react";
import { Head, Link, usePage, router } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Toaster, toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Eye, CheckCircle, Star, X } from "lucide-react";
import { GenericTable } from "@/components/GenericTable";
import { route } from "ziggy-js";
import { History as HistoryIcon } from "lucide-react";
import TicketRatingModal from '@/components/rating/calificationModal'

const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Mis Tickets", href: "/tickets" },
];

export default function Index() {
    const { props } = usePage();
    const tickets = props.tickets || [];
    const auth = props.auth || { user: { permissions: [] } };

    const resolvedTickets = props.resolvedTickets || [];

    const [searchTerm, setSearchTerm] = useState("");
    const [ratingModalOpen, setRatingModalOpen] = useState(false);
    const [ticketToClose, setTicketToClose] = useState(null);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);


    // Filtrar tickets por código o asunto
    const filteredTickets = tickets.filter((ticket) =>
        `${ticket.code} ${ticket.subject}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    //conteo de sla 

    const getSlaRemainingTime = (expirationDate, current) => {
        if (!expirationDate) return 'Sin SLA asignado';

        const expiration = new Date(expirationDate);
        const diffMs = expiration - current;

        if (diffMs <= 0) return 'Expirado';

        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        if (diffHrs > 0) return `${diffHrs}h ${diffMins}m restantes`;
        return `${diffMins}m restantes`;
    };

    const getSlaColorClass = (expirationDate, current) => {
        if (!expirationDate) return 'text-zinc-500 dark:text-zinc-400';

        const expiration = new Date(expirationDate);
        const diffMs = expiration - current;
        const diffHrs = diffMs / (1000 * 60 * 60);

        if (diffMs <= 0) return 'text-red-600 font-bold dark:text-red-500';
        if (diffHrs <= 2) return 'text-yellow-600 font-bold dark:text-yellow-500';
        return 'text-green-600 dark:text-green-500';
    };

    const formatExpirationDate = (expirationDate) => {
        if (!expirationDate) return 'Sin SLA';
        const date = new Date(expirationDate);

        return new Intl.DateTimeFormat('es-ES', {
            weekday: 'short',
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    useEffect(() => {
        if (resolvedTickets.length > 0) {
            setCurrentIndex(0);
            setRatingModalOpen(true);
        }
    }, [resolvedTickets]);

    const currentTicket = resolvedTickets[currentIndex];

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
            render: (ticket) => {
                const dateString = ticket.creation_date || ticket.created_at;

                const formattedDate = dateString
                    ? new Date(dateString.substring(0, 10) + 'T12:00:00').toLocaleDateString("es-ES")
                    : "Sin fecha";

                return (
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">
                        {formattedDate}
                    </span>
                );
            },
        },
        {
            header: "Vencimiento SLA",
            className: "hidden md:table-cell",
            render: (ticket) => (
                <div title={getSlaRemainingTime(ticket.expiration_date, currentTime)} className={`inline-block cursor-pointer ${getSlaColorClass(ticket.expiration_date, currentTime)}`}>
                    <span className="text-sm font-bold border-b border-dashed border-current pb-[1px]">
                        {formatExpirationDate(ticket.expiration_date)}
                    </span>
                </div>
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
                    <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        className="h-8 w-8 hover:text-indigo-600"
                        title="Ver historial de actividad"
                    >
                        <Link href={route("tickets.history.index", ticket.id)}>
                            <HistoryIcon className="h-4 w-4" />
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

            <TicketRatingModal
                isOpen={ratingModalOpen}
                onClose={() => setRatingModalOpen(false)}
                ticket={currentTicket}
                onNext={() => {
                    if (currentIndex + 1 < resolvedTickets.length) {
                        setCurrentIndex(currentIndex + 1);
                    } else {
                        setRatingModalOpen(false);
                    }
                }}
            />
        </AppLayout>
    );
}
