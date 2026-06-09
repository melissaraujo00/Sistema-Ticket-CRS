import React, { useState, useEffect, useRef, useMemo } from "react";
import { Head, Link, usePage, router } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Toaster, toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Eye, CheckCircle, Star, X, Filter } from "lucide-react";
import { GenericTable } from "@/components/GenericTable";
import { route } from "ziggy-js";
import { History as HistoryIcon } from "lucide-react";
import TicketRatingModal from '@/components/rating/calificationModal'
import StatusFilter from "@/components/status-filter";

const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Mis Tickets", href: "/tickets" },
];
const SLA_STATUS = {
    EXPIRED: 'Expirado',
    WARNING: 'Advertencia',
    ON_TIME: 'A tiempo',
    NO_SLA: 'Sin SLA'
};

const SlaFilterDropdown = ({ selectedFilters, onChange, onClear }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const options = [
        { label: SLA_STATUS.EXPIRED, value: SLA_STATUS.EXPIRED },
        { label: SLA_STATUS.WARNING, value: SLA_STATUS.WARNING},
        { label: SLA_STATUS.ON_TIME, value: SLA_STATUS.ON_TIME},
        { label: SLA_STATUS.NO_SLA, value: SLA_STATUS.NO_SLA }
    ];

    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false);
        };

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') setIsOpen(false);
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen]);

    return (
        <div className="relative" ref={dropdownRef}>
            <Button variant="outline" onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 bg-white dark:bg-zinc-900">
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filtro SLA</span>
                {selectedFilters.length > 0 && (
                    <span className="bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-2 py-0.5 rounded-full text-xs font-bold">
                        {selectedFilters.length}
                    </span>
                )}
            </Button>

            {isOpen && (
                <div className="absolute top-full mt-2 right-0 sm:left-0 w-48 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md shadow-lg z-50 p-2">
                    <div className="space-y-1">
                        {options.map(opt => (
                            <label key={opt.value} className="flex items-center gap-2 p-2 hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded cursor-pointer transition-colors">
                                <input
                                    type="checkbox"
                                    checked={selectedFilters.includes(opt.value)}
                                    onChange={(e) => {
                                        if (e.target.checked) onChange([...selectedFilters, opt.value]);
                                        else onChange(selectedFilters.filter(f => f !== opt.value));
                                    }}
                                    className="rounded border-zinc-300 text-red-600 focus:ring-red-600"
                                />
                                <span className={`text-sm ${opt.color}`}>{opt.label}</span>
                            </label>
                        ))}
                    </div>
                    {selectedFilters.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                            <Button variant="ghost" size="sm" className="w-full text-xs h-8 text-zinc-500 hover:text-red-600" onClick={onClear}>
                                <X className="h-3 w-3 mr-1" />
                                Limpiar filtros
                            </Button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};


const getTicketSlaStatus = (ticket, current) => {
    if (!ticket.expiration_date) return SLA_STATUS.NO_SLA;

    const isResolvedOrClosed = ["Resuelto", "Cerrado"].includes(ticket.status?.name);
    if (isResolvedOrClosed) {
        const resolvedDate = new Date(ticket.resolved_at || ticket.updated_at);
        const expirationDate = new Date(ticket.expiration_date);
        return resolvedDate <= expirationDate ? SLA_STATUS.ON_TIME : SLA_STATUS.EXPIRED;
    }

    const expiration = new Date(ticket.expiration_date);
    const diffMs = expiration - current;
    const diffHrs = diffMs / (1000 * 60 * 60);

    if (diffMs <= 0) return SLA_STATUS.EXPIRED;
    if (diffHrs <= 2) return SLA_STATUS.WARNING;
    return SLA_STATUS.ON_TIME;
};


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


export default function Index() {
    const { props } = usePage();
    const tickets = props.tickets || [];
    const auth = props.auth || { user: { permissions: [] } };
    const canViewSLA = auth.user?.permissions?.includes('view_sla_expiration');

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

    const [statusFilter, setStatusFilter] = useState("Todos los estados")
    const [slaFilters, setSlaFilters] = useState([]);
    const canFilterSLA = canViewSLA;

    const statuses = props.statuses || [];
    const uniqueStatuses = statuses.map(s => s.name);


    const filteredTickets = useMemo(() => {
        return tickets.filter((ticket) => {
            const matchesSearch = `${ticket.code} ${ticket.subject}`.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === "Todos los estados" || ticket.status?.name === statusFilter;

            let matchesSla = true;
            if (slaFilters.length > 0) {
                const currentSlaStatus = getTicketSlaStatus(ticket, currentTime);
                matchesSla = slaFilters.includes(currentSlaStatus);
            }

            return matchesSearch && matchesStatus && matchesSla;
        });
    }, [tickets, searchTerm, statusFilter, slaFilters, currentTime]);

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
        ...(canViewSLA ? [{
            header: "Vencimiento SLA",
            className: "hidden md:table-cell",
            render: (ticket) => {
                if (!ticket.expiration_date) {
                    return <span className="text-sm text-zinc-500 dark:text-zinc-400">Sin SLA</span>;
                }

                const isResolvedOrClosed = ["Resuelto", "Cerrado"].includes(ticket.status?.name);

                if (isResolvedOrClosed) {
                    const resolvedDate = new Date(ticket.resolved_at || ticket.updated_at);
                    const expirationDate = new Date(ticket.expiration_date);
                    const isCompliant = resolvedDate <= expirationDate;

                    return (
                        <div
                            title={`Vencía el: ${formatExpirationDate(ticket.expiration_date)}`}
                            className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${isCompliant
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                }`}
                        >
                            {isCompliant ? 'Cumplido' : 'Incumplido'}
                        </div>
                    );
                }

                return (
                    <div title={getSlaRemainingTime(ticket.expiration_date, currentTime)} className={`inline-block cursor-pointer ${getSlaColorClass(ticket.expiration_date, currentTime)}`}>
                        <span className="text-sm font-bold border-b border-dashed border-current pb-[1px]">
                            {formatExpirationDate(ticket.expiration_date)}
                        </span>
                    </div>
                );
            },
        }] : []),
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
                        {route().current("tickets.index") && (
                            <>
                                <StatusFilter
                                    value={statusFilter}
                                    onChange={setStatusFilter}
                                    statuses={uniqueStatuses}
                                />

                                {canFilterSLA && (
                                    <SlaFilterDropdown
                                        selectedFilters={slaFilters}
                                        onChange={setSlaFilters}
                                        onClear={() => setSlaFilters([])}
                                    />
                                )}
                            </>
                        )}
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
