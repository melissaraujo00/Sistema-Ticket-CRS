import React, { useState } from "react";
import { Head, Link, usePage } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Pencil, Trash2, Clock } from "lucide-react";
import DeleteEntityModal from "@/components/DeleteEntityModal";
import { GenericTable } from "@/components/GenericTable";


const breadcrumbs = [
    { title: "Dashboard", href: "/dashboard" },
    { title: "Planes SLA", href: "/sla-plans" },
];

export default function Index() {
    const { props } = usePage();
    const planes = props.planes || [];
    const auth = props.auth || { user: { permissions: [] } };

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const hasPermission = (perm) => auth.user?.permissions?.includes(perm);

    // Filtrar por nombre
    const filteredPlanes = planes.filter((plan) =>
        plan.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Definir columnas para la tabla genérica
    const columns = [
        {
            header: "Nombre",
            render: (plan) => (
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500">
                        <Clock className="h-4 w-4" />
                    </div>
                    <div>
                        <span className="font-semibold block">{plan.name}</span>
                    </div>
                </div>
            ),
        },
        {
            header: "Tiempo de gracia (horas)",
            className: "hidden md:table-cell",
            render: (plan) => <span>{plan.grace_time_hours}</span>,
        },
        {
            header: "Horario laboral",
            className: "hidden md:table-cell",
            render: (plan) => (
                <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                        plan.working_hours
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400"
                    }`}
                >
                    {plan.working_hours ? "Sí" : "No"}
                </span>
            ),
        },
        {
            header: "Acciones",
            className: "text-right",
            render: (plan) => (
                <div className="flex justify-end gap-2">
                    {hasPermission("editar plan_sla") && (
                        <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            className="h-8 w-8 hover:text-blue-600"
                        >
                            <Link href={`/sla-plans/${plan.id}/edit`}>
                                <Pencil className="h-4 w-4" />
                            </Link>
                        </Button>
                    )}
                    {hasPermission("eliminar plan_sla") && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:text-red-600"
                            onClick={() => {
                                setSelectedPlan(plan);
                                setIsDeleteModalOpen(true);
                            }}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Planes SLA" />
            <Toaster position="top-right" richColors />

            <div className="p-4 md:p-8 space-y-6">
                {/* Cabecera con búsqueda y botón nuevo */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                            Planes SLA
                        </h1>
                        <p className="text-zinc-500 text-sm">
                            Definición de acuerdos de nivel de servicio para tickets.
                        </p>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:flex-initial">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
                            <Input
                                type="text"
                                placeholder="Buscar plan..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-8 w-full sm:w-[250px]"
                            />
                        </div>
                        {hasPermission("crear plan_sla") && (
                            <Button asChild className="bg-zinc-900 dark:bg-zinc-50 dark:text-zinc-900">
                                <Link href="/sla-plans/create">
                                    <Plus className="mr-2 h-4 w-4" /> Nuevo
                                </Link>
                            </Button>
                        )}

                        {hasPermission("eliminar plan_sla") && (
                            <Button asChild variant="outline">
                                <Link href="/sla-plans/trashed">
                                    <Trash2 className="mr-2 h-4 w-4" /> Ver Borrados
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Tabla Genérica */}
                <GenericTable data={filteredPlanes} columns={columns} />
            </div>

            {/* Modal de Eliminación */}
            <DeleteEntityModal
                isOpen={isDeleteModalOpen}
                closeModal={() => setIsDeleteModalOpen(false)}
                entity={selectedPlan}
                entityType="Plan SLA"
                deleteEndpoint="/sla-plans"
            />
        </AppLayout>
    );
}
